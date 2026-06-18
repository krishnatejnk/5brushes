import { supabase } from './supabaseClient';

export async function uploadImage(file, onProgress) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  // Supabase JS client doesn't support upload progress — fake it at 50% while uploading
  onProgress?.(50);

  const { error } = await supabase.storage.from('artworks').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  onProgress?.(100);

  const { data } = supabase.storage.from('artworks').getPublicUrl(path);
  return { url: data.publicUrl, publicId: path };
}
