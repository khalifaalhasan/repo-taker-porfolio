import { getOptimizedScreenshotUrl } from "../microlink";
import { Project } from "./types";
import { GITHUB_PAT, GITHUB_ORGS, getFetchOptions } from "./config";

export async function fetchGithubProjects(username?: string): Promise<Project[]> {
  if (!GITHUB_PAT) {
    console.warn("GITHUB_PAT is not defined in .env. Returning empty array.");
    return [];
  }

  try {
    const fetchOptions = getFetchOptions();

    // 1. Ambil repo personal yang murni dimiliki oleh user (type=owner)
    const userReposUrl = username 
      ? `https://api.github.com/users/${username}/repos?type=owner&per_page=100&sort=pushed`
      : `https://api.github.com/user/repos?type=owner&per_page=100&sort=pushed`;
    
    const userReposPromise = fetch(userReposUrl, fetchOptions);

    // 2. Jika ada variabel GITHUB_ORGS, ambil repo spesifik dari organisasi tersebut
    const orgs = GITHUB_ORGS ? GITHUB_ORGS.split(',').map(o => o.trim()).filter(Boolean) : [];
    const orgPromises = orgs.map(org => 
      fetch(`https://api.github.com/orgs/${org}/repos?type=all&per_page=100&sort=pushed`, fetchOptions)
    );

    // Jalankan semua request secara paralel (bersamaan)
    const responses = await Promise.all([userReposPromise, ...orgPromises]);

    let allRepos: any[] = [];
    for (const res of responses) {
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          allRepos = [...allRepos, ...data];
        }
      } else {
        console.warn(`GitHub API partial error: ${res.status} ${res.statusText}`);
      }
    }

    // Filter duplikat
    const uniqueReposMap = new Map();
    for (const repo of allRepos) {
      uniqueReposMap.set(repo.id, repo);
    }
    const uniqueRepos = Array.from(uniqueReposMap.values());

    // 3. Ambil daftar repo yang di-pin via GraphQL
    let pinnedRepoNames = new Set<string>();
    try {
      const graphqlQuery = username ? `
        query {
          user(login: "${username}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes { ... on Repository { name } }
            }
          }
        }
      ` : `
        query {
          viewer {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes { ... on Repository { name } }
            }
          }
        }
      `;
      const graphqlRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: fetchOptions.headers,
        body: JSON.stringify({ query: graphqlQuery }),
        next: { revalidate: 3600 },
      });
      const graphqlData = await graphqlRes.json();
      const pinnedNodes = username 
        ? graphqlData?.data?.user?.pinnedItems?.nodes || []
        : graphqlData?.data?.viewer?.pinnedItems?.nodes || [];
      pinnedNodes.forEach((node: any) => pinnedRepoNames.add(node.name));

      if (orgs.length > 0) {
        for (const org of orgs) {
          const orgQuery = `
            query {
              organization(login: "${org}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                  nodes { ... on Repository { name } }
                }
              }
            }
          `;
          const orgRes = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: fetchOptions.headers,
            body: JSON.stringify({ query: orgQuery }),
            next: { revalidate: 3600 },
          });
          const orgData = await orgRes.json();
          const orgPinned = orgData?.data?.organization?.pinnedItems?.nodes || [];
          orgPinned.forEach((node: any) => pinnedRepoNames.add(node.name));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch pinned repos via GraphQL", e);
    }

    const originalRepos = uniqueRepos.filter((repo: any) => 
      pinnedRepoNames.has(repo.name) || 
      (repo.topics && (repo.topics.includes("portfolio") || repo.topics.includes("portofolio") || repo.topics.includes("featured")))
    );

    originalRepos.sort((a: any, b: any) => {
      const aFeatured = a.topics?.includes("featured") ? 1 : 0;
      const bFeatured = b.topics?.includes("featured") ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;

      const aPinned = pinnedRepoNames.has(a.name) ? 1 : 0;
      const bPinned = pinnedRepoNames.has(b.name) ? 1 : 0;
      return bPinned - aPinned;
    });

    const enrichedRepos = await Promise.all(originalRepos.map(async (repo: any, index: number) => {
      const slug = repo.name.toLowerCase();
      const liveUrl = repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;
      
      let customThumbnail = null;
      try {
        const rootContents = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`, fetchOptions);
        if (rootContents.ok) {
          const files = await rootContents.json();
          if (Array.isArray(files)) {
            const thumbnailFile = files.find((f: any) => 
              f.type === 'file' && 
              f.name.toLowerCase().startsWith('thumbnail.')
            );
            if (thumbnailFile) {
              customThumbnail = `/api/github-image?repo=${repo.name}&file=${thumbnailFile.name}`;
            }
          }
        }
      } catch (e) {}
      
      const cacheBuster = repo.updated_at ? new Date(repo.updated_at).getTime() : Math.random().toString(36).substring(7);
      const ogImage = `https://opengraph.githubassets.com/${cacheBuster}/${repo.owner.login}/${repo.name}`;
      let primaryImage = ogImage;
      
      if (customThumbnail) {
        primaryImage = customThumbnail;
      } else if (liveUrl) {
        primaryImage = getOptimizedScreenshotUrl(liveUrl);
      }

      const images = primaryImage !== ogImage ? [primaryImage, ogImage] : [primaryImage];

      return {
        id: repo.id.toString(),
        slug,
        title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        images,
        description: repo.description || "No description provided.",
        challengeDescription: null,
        features: null,
        techStack: repo.topics && repo.topics.length > 0 ? repo.topics.filter((t: string) => t !== 'portfolio' && t !== 'portofolio' && t !== 'featured') : [repo.language].filter(Boolean),
        githubUrl: repo.private ? null : repo.html_url,
        githubFullName: repo.full_name,
        isPrivateRepo: repo.private,
        isHidden: false,
        customTitle: null,
        customDescription: null,
        liveUrl,
        featured: repo.topics?.includes("featured") || (pinnedRepoNames.size > 0 ? pinnedRepoNames.has(repo.name) : index < 6),
      };
    }));

    return enrichedRepos;
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    return [];
  }
}

export async function fetchGithubProject(slug: string): Promise<Project | undefined> {
  const allProjects = await fetchGithubProjects();
  const project = allProjects.find(p => p.slug === slug);
  if (!project) return undefined;

  const enrichedProject = { ...project, techStack: [...project.techStack] };

  if (enrichedProject.githubFullName && GITHUB_PAT) {
    try {
      const pkgRes = await fetch(`https://api.github.com/repos/${enrichedProject.githubFullName}/contents/package.json`, {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3.raw"
        },
        next: { revalidate: 3600 }
      });
      
      if (pkgRes.ok) {
        const pkgText = await pkgRes.text();
        const pkg = JSON.parse(pkgText);
        
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        const depKeys = Object.keys(allDeps);
        
        const coreDeps = depKeys.filter(d => 
          !d.startsWith('@types/') && 
          !d.startsWith('eslint') && 
          !d.includes('prettier') &&
          !d.includes('postcss') &&
          !d.startsWith('typescript')
        ).map(d => {
          if (d.startsWith('@')) {
            const parts = d.split('/');
            return parts.length > 1 ? parts[1] : d;
          }
          return d;
        });

        for (const dep of coreDeps) {
          if (!enrichedProject.techStack.some((t: string) => t.toLowerCase() === dep.toLowerCase())) {
            enrichedProject.techStack.push(dep);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch package.json for", enrichedProject.githubFullName);
    }
  }

  return enrichedProject;
}
