import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Local fallback JSON for when PostgreSQL is not connected yet
const fallbackFilePath = path.join(process.cwd(), 'src', 'data', 'project-meta.json');

function readFallback() {
  if (!fs.existsSync(fallbackFilePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(fallbackFilePath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeFallback(data: any[]) {
  // Ensure directory exists
  const dir = path.dirname(fallbackFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2));
}

export async function getProjectMetas() {
  try {
    const metas = await prisma.projectMeta.findMany();
    return metas;
  } catch (e) {
    console.warn("Database not connected, using local JSON fallback for ProjectMeta.");
    return readFallback();
  }
}

export async function upsertProjectMeta(slug: string, data: any) {
  try {
    const existing = await prisma.projectMeta.findUnique({ where: { slug } });
    if (existing) {
      await prisma.projectMeta.update({ where: { slug }, data });
    } else {
      await prisma.projectMeta.create({ data: { slug, ...data } });
    }
  } catch (e) {
    console.warn("Database not connected, saving to local JSON fallback.");
    const metas = readFallback();
    const index = metas.findIndex((m: any) => m.slug === slug);
    if (index >= 0) {
      metas[index] = { ...metas[index], ...data, updatedAt: new Date().toISOString() };
    } else {
      metas.push({ 
        slug, 
        isHidden: false, 
        images: [], 
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    writeFallback(metas);
  }
}
