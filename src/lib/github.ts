import { getOptimizedScreenshotUrl } from "./microlink";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  challengeDescription?: string | null;
  features?: string[] | null;
  images: string[];
  techStack: string[];
  githubUrl: string | null;
  githubFullName?: string;
  isPrivateRepo?: boolean;
  isHidden?: boolean;
  liveUrl: string | null;
  featured: boolean;
  customTitle?: string | null;
  customDescription?: string | null;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

export interface ProfileData {
  name: string;
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

export async function fetchGithubProjects(username?: string): Promise<Project[]> {
  if (!GITHUB_PAT) {
    console.warn("GITHUB_PAT is not defined in .env. Returning empty array.");
    return [];
  }

  try {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 },
    };

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

    // Filter duplikat (kalau repo org ternyata sudah ditarik oleh userReposPromise)
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
              nodes {
                ... on Repository {
                  name
                }
              }
            }
          }
        }
      ` : `
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
      const pinnedNodes = username 
        ? graphqlData?.data?.user?.pinnedItems?.nodes || []
        : graphqlData?.data?.viewer?.pinnedItems?.nodes || [];
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

    // Filter out forks, unless pinned. MUST have 'portfolio'/'portofolio' topic OR be pinned.
    const originalRepos = uniqueRepos.filter((repo: any) => 
      pinnedRepoNames.has(repo.name) || 
      (!repo.fork && repo.topics && (repo.topics.includes("portfolio") || repo.topics.includes("portofolio")))
    );



    // Urutkan originalRepos agar yang di-pin (featured) muncul lebih dulu
    originalRepos.sort((a: any, b: any) => {
      const aPinned = pinnedRepoNames.has(a.name) ? 1 : 0;
      const bPinned = pinnedRepoNames.has(b.name) ? 1 : 0;
      return bPinned - aPinned;
    });

    const enrichedRepos = await Promise.all(originalRepos.map(async (repo: any, index: number) => {
      const slug = repo.name.toLowerCase();
      const liveUrl = repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;
      
      // Cek apakah ada file thumbnail.png atau thumbnail.jpg di repo (termasuk private repo)
      let customThumbnail = null;
      try {
        const checkPng = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/thumbnail.png`, fetchOptions);
        if (checkPng.ok) {
          customThumbnail = `/api/github-image?repo=${repo.name}&file=thumbnail.png`;
        } else {
          const checkJpg = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/thumbnail.jpg`, fetchOptions);
          if (checkJpg.ok) {
            customThumbnail = `/api/github-image?repo=${repo.name}&file=thumbnail.jpg`;
          }
        }
      } catch (e) {
        // Abaikan jika error / tidak ada
      }
      
      let defaultImage = `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`;
      if (liveUrl) {
        defaultImage = getOptimizedScreenshotUrl(liveUrl);
      }
      if (customThumbnail) {
        defaultImage = customThumbnail;
      }

      const images = [defaultImage];

      return {
        id: repo.id.toString(),
        slug,
        title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        images,
        description: repo.description || "No description provided.",
        challengeDescription: null,
        features: null,
        techStack: repo.topics && repo.topics.length > 0 ? repo.topics.filter((t: string) => t !== 'portfolio' && t !== 'portofolio') : [repo.language].filter(Boolean),
        githubUrl: repo.private ? null : repo.html_url,
        githubFullName: repo.full_name,
        isPrivateRepo: repo.private,
        isHidden: false,
        customTitle: null,
        customDescription: null,
        liveUrl,
        featured: pinnedRepoNames.size > 0 ? pinnedRepoNames.has(repo.name) : index < 6,
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

export async function fetchProfileData(username: string = "khalifaalhasan"): Promise<ProfileData | null> {
  try {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
      },
      next: { revalidate: 3600 }
    };

    // 2. Fetch User Meta (do this first for fallbacks)
    const userRes = await fetch(`https://api.github.com/users/${username}`, fetchOptions);
    const userData = userRes.ok ? await userRes.json() : {};

    let headline = userData.company || "Software Engineer";
    let bio = userData.bio || "Building the future of the web.";
    
    // 1. Fetch README
    const readmeRes = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
      ...fetchOptions,
      headers: { ...fetchOptions.headers, Accept: "application/vnd.github.v3.raw" }
    });
    
    if (readmeRes.ok) {
      const text = await readmeRes.text();
      // Cari headline pertama (H1, H2, atau H3)
      const headlineMatch = text.match(/#+\s+(.+)/);
      if (headlineMatch) headline = headlineMatch[1].trim();

      // Ekstrak isi bio: dari setelah headline sampai batas horizontal rule (---) atau akhir file
      const bioMatch = text.match(/#+\s+.*?\n([\s\S]*?)(?:---|###)/);
      if (bioMatch && bioMatch[1].trim() !== "") {
        bio = bioMatch[1]
          .replace(/<br>/gi, " ")
          .replace(/<\/?[^>]+(>|$)/g, "") // Hilangkan tag HTML
          .trim();
      }
    }

    // 3. Fetch Contributions via GraphQL
    let totalContributions = 0;
    let contributionWeeks = [];
    if (GITHUB_PAT) {
      const graphqlQuery = `
        query {
          user(login: "${username}") {
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
      name: userData.name || username,
      headline, 
      bio,
      avatarUrl: userData.avatar_url,
      socials: {
        twitter: userData.twitter_username ? `https://twitter.com/${userData.twitter_username}` : null,
        website: userData.blog && userData.blog.trim() !== "" ? (userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`) : null,
        github: userData.html_url || `https://github.com/${username}`
      },
      totalContributions,
      contributionWeeks
    };
  } catch (e) {
    console.error("Failed to fetch profile data:", e);
    return null;
  }
}
