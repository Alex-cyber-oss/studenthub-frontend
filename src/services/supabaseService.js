import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and publishable key must be set in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFileToBucket(bucket, filePath, file) {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) {
    throw error;
  }
  return data;
}

export async function getPublicUrl(bucket, filePath) {
  const { data, error } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (error) {
    throw error;
  }
  return data.publicUrl;
}
