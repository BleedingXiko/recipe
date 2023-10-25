import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gubrpmjsiquxnkbopbvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YnJwbWpzaXF1eG5rYm9wYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNjQ2OTYsImV4cCI6MjAxMzg0MDY5Nn0.NeAbGjsOk2Z0qQH6MtE4RXT8nFd03BdaI0BqWav-5Ug';
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };