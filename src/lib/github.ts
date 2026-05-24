import { Project } from "@/data/projects";
import { getProjectMetas } from "./projectMetaStore";

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

export interface ProfileData {
  headline: string;
  bio: string;
  avatarUrl?: string;
  socials?: {
    twitter?: string | null;
    website?: string | null;
    github?: string;
  };
  totalContributions?: number;
  contributionWeeks?: {
    contributionDays: ContributionDay[];
  }[];
}

const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_ORGS = process.env.GITHUB_ORGS; // Contoh: "nama-org-1,nama-org-2"

export async function fetchGithubProjects(): Promise<Project[]> {
  if (!GITHUB_PAT) {
    console.warn("GITHUB_PAT is not defined in .env. Using fallback dummy data.");
    return (await import("@/data/projects")).projectsData;
  }

  try {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 },
    };

    // 1. Ambil repo personal yang murni dimiliki oleh user (type=owner), bukan dari semua org yang diikutinya
    const userReposPromise = fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=pushed", fetchOptions);

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

    // Filter duplikat (kalau repo org ternyata sudah ditarik oleh userReposPromise)
    const uniqueReposMap = new Map();
    for (const repo of allRepos) {
      uniqueReposMap.set(repo.id, repo);
    }
    const uniqueRepos = Array.from(uniqueReposMap.values());

    // 3. Ambil daftar repo yang di-pin via GraphQL
    let pinnedRepoNames = new Set<string>();
    try {
      const graphqlQuery = `
        query {
          viewer {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                }
              }
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
      const pinnedNodes = graphqlData?.data?.viewer?.pinnedItems?.nodes || [];
      pinnedNodes.forEach((node: any) => pinnedRepoNames.add(node.name));

      // Jika ada orgs, ambil juga pinned repos dari tiap org
      if (orgs.length > 0) {
        for (const org of orgs) {
          const orgQuery = `
            query {
              organization(login: "${org}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                  nodes {
                    ... on Repository {
                      name
                    }
                  }
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

    // Filter out forks to only show original work, BUT keep them if they are pinned!
    const originalRepos = uniqueRepos.filter((repo: any) => !repo.fork || pinnedRepoNames.has(repo.name));



    // Urutkan originalRepos agar yang di-pin (featured) muncul lebih dulu
    originalRepos.sort((a: any, b: any) => {
      const aPinned = pinnedRepoNames.has(a.name) ? 1 : 0;
      const bPinned = pinnedRepoNames.has(b.name) ? 1 : 0;
      return bPinned - aPinned;
    });

    const metas = await getProjectMetas();

    const nameCounts = new Map<string, number>();
    for (const repo of originalRepos) {
      const name = repo.name.toLowerCase();
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }

    return originalRepos.map((repo: any, index: number) => {
      const name = repo.name.toLowerCase();
      const slug = nameCounts.get(name)! > 1 ? `${repo.owner.login.toLowerCase()}-${name}` : name;
      const meta = metas.find((m: any) => m.slug === slug);

      const liveUrl = repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;
      
      let defaultImage = `https://picsum.photos/seed/${repo.id}/800/450`;
      if (liveUrl) {
        defaultImage = `/api/screenshot?repo=${slug}&url=${encodeURIComponent(liveUrl)}`;
      }

      const images = meta?.images && meta.images.length > 0 ? meta.images : [defaultImage];

      return {
        id: repo.id.toString(),
        slug,
        title: meta?.customTitle || repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        images,
        description: meta?.customDescription || repo.description || "No description provided.",
        challengeDescription: null,
        features: null,
        techStack: repo.topics && repo.topics.length > 0 ? repo.topics : [repo.language].filter(Boolean),
        githubUrl: repo.private ? null : repo.html_url,
        githubFullName: repo.full_name,
        isPrivateRepo: repo.private,
        isHidden: meta?.isHidden || false,
        customTitle: meta?.customTitle || null,
        customDescription: meta?.customDescription || null,
        liveUrl,
        featured: pinnedRepoNames.size > 0 ? pinnedRepoNames.has(repo.name) : index < 6,
      };
    });
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    return (await import("@/data/projects")).projectsData;
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
          if (!enrichedProject.techStack.some(t => t.toLowerCase() === dep.toLowerCase())) {
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

export async function fetchProfileData(): Promise<ProfileData | null> {
  try {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
      },
      next: { revalidate: 3600 }
    };

    // 1. Fetch README
    const readmeRes = await fetch("https://raw.githubusercontent.com/khalifaalhasan/khalifaalhasan/main/README.md", fetchOptions);
    let headline = "Product Engineer";
    let bio = "I don't just build features \u2014 I own outcomes.";
    
    if (readmeRes.ok) {
      const text = await readmeRes.text();
      const headlineMatch = text.match(/##\s+(.+)/);
      if (headlineMatch) headline = headlineMatch[1].trim();

      const bioMatch = text.match(/##\s+.*?\n([\s\S]*?)---/);
      if (bioMatch) {
        bio = bioMatch[1]
          .replace(/<br>/gi, " ")
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim();
      }
    }

    // 2. Fetch User Meta
    const userRes = await fetch("https://api.github.com/users/khalifaalhasan", fetchOptions);
    const userData = userRes.ok ? await userRes.json() : {};

    // 3. Fetch Contributions via GraphQL
    let totalContributions = 0;
    let contributionWeeks = [];
    if (GITHUB_PAT) {
      const graphqlQuery = `
        query {
          user(login: "khalifaalhasan") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
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
      if (graphqlRes.ok) {
        const graphqlData = await graphqlRes.json();
        const calendar = graphqlData?.data?.user?.contributionsCollection?.contributionCalendar;
        totalContributions = calendar?.totalContributions || 0;
        contributionWeeks = calendar?.weeks || [];
      }
    }

    return { 
      headline, 
      bio,
      avatarUrl: userData.avatar_url,
      socials: {
        twitter: userData.twitter_username ? `https://twitter.com/${userData.twitter_username}` : null,
        website: userData.blog && userData.blog.trim() !== "" ? (userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`) : null,
        github: userData.html_url || "https://github.com/khalifaalhasan"
      },
      totalContributions,
      contributionWeeks
    };
  } catch (e) {
    console.error("Failed to fetch profile data:", e);
    return null;
  }
}
