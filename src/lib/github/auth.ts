import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const APP_ID = process.env.GITHUB_APP_ID!;
const PRIVATE_KEY_PATH = process.env.GITHUB_PRIVATE_KEY_PATH!;

function getPrivateKey(): string {
  const fullPath = path.resolve(process.cwd(), PRIVATE_KEY_PATH);
  return fs.readFileSync(fullPath, 'utf8');
}

function generateAppJwt(): string {
  const privateKey = getPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  
  // GitHub App JWT payload
  const payload = {
    iat: now - 60, // 1 minute in the past to allow for clock drift
    exp: now + (10 * 60), // max 10 minutes
    iss: APP_ID
  };
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

export async function getGitHubInstallationToken(installationId: string): Promise<string> {
  const appJwt = generateAppJwt();
  
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${appJwt}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-CV-Generator'
    },
    cache: 'no-store' // Fetch fresh token each time (can be optimized later)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get installation token: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.token; // Expires in 1 hour by default
}

export async function getPortfolioMarkdown(username: string, repo: string, installationId: string): Promise<string | null> {
  try {
    const token = await getGitHubInstallationToken(installationId);
    
    // Attempt to fetch overview.md, fallback to README.md
    const fetchFile = async (filename: string) => {
      const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'Portfolio-CV-Generator'
        },
        next: { revalidate: 3600 } // Cache the markdown content for 1 hour via Next.js ISR
      });
      
      if (res.ok) {
        return res.text();
      }
      return null;
    };

    let content = await fetchFile('overview.md');
    if (!content) {
      content = await fetchFile('README.md');
    }
    
    return content;
  } catch (error) {
    console.error(`Failed to fetch markdown for ${username}/${repo}:`, error);
    return null;
  }
}
