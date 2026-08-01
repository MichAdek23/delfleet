import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgnhrvwhwpeemyrnsenz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbmhydndod3BlZW15cm5zZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMjI1NjQsImV4cCI6MjA4NDY5ODU2NH0._KyAOO4SBJy0rQxP-ECoMfZsqGhK4Wna9ZXnPRT-4bA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
