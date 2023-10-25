import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gubrpmjsiquxnkbopbvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YnJwbWpzaXF1eG5rYm9wYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNjQ2OTYsImV4cCI6MjAxMzg0MDY5Nn0.NeAbGjsOk2Z0qQH6MtE4RXT8nFd03BdaI0BqWav-5Ug';
const supabase = createClient(supabaseUrl, supabaseKey);


// Register a new user
async function signUp(email, password) {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Error signing up:', error);
    }
  }
  
  // Sign in an existing user
  async function signIn(email, password) {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) {
      console.error('Error signing in:', error);
    }
  }

export { supabase };

