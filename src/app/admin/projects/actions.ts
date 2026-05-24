"use server";
import { revalidatePath } from "next/cache";
import { upsertProjectMeta } from "@/lib/projectMetaStore";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function uploadImageAction(base64Image: string, fileName: string) {
  try {
    const matches = base64Image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid input string');
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    await supabaseAdmin.storage.createBucket('portfolio', { public: true }).catch(() => {});

    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error } = await supabaseAdmin.storage
      .from('portfolio')
      .upload(`projects/${uniqueFileName}`, buffer, {
        contentType: `image/${type}`,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('portfolio').getPublicUrl(`projects/${uniqueFileName}`);
    return { url: publicUrl };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function toggleProjectVisibility(slug: string, isHidden: boolean) {
  await upsertProjectMeta(slug, { isHidden });
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function updateProjectImages(slug: string, images: string[]) {
  await upsertProjectMeta(slug, { images });
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  revalidatePath('/admin/projects');
}

export async function updateProjectText(slug: string, customTitle: string | null, customDescription: string | null) {
  await upsertProjectMeta(slug, { customTitle, customDescription });
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  revalidatePath('/admin/projects');
  revalidatePath('/');
}
