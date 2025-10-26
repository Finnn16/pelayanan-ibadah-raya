import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://camflsaeanixrinlyrpf.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbWZsc2FlYW5peHJpbmx5cnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTcwMjMsImV4cCI6MjA3NjkzMzAyM30.AOqmi_7cC7pnn_aZAwYxIWAAFl1qRk54fFIpAp4xfUQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);