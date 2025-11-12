// src/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// *** ¡DEBES REEMPLAZAR ESTAS CLAVES! ***
const supabaseUrl = 'https://jjmaaywokflcnkqehaoq.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbWFheXdva2ZsY25rcWVoYW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA1NjksImV4cCI6MjA3ODUzNjU2OX0.Y5b2B8YT4rroNydB6cLx5Oa4B2E8Ypw0ykTdRFdUKe0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);