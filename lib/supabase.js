import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zhbvpzpiptqmsbwmvmee.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYnZwenBpcHRxbXNid212bWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTI2ODIsImV4cCI6MjA5MTE4ODY4Mn0.nzJJp2YkLuhFRVql5jfMpurxsh0qFXl0vOIf4shWmZU"

export const supabase = createClient(supabaseUrl, supabaseKey)