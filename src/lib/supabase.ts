import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type StudyItemType = 'riassunto' | 'schema' | 'spiegazione' | 'quiz';

export type StudyItem = {
  id: string;
  type: StudyItemType;
  title: string;
  source_text: string;
  content: string;
  language: string;
  age: number;
  created_at: string;
};
