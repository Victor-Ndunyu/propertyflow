/**
 * lib/supabase.js
 *
 * NODE.JS ONLY - NOT FOR BROWSER USE
 *
 * This module is used exclusively by Node.js scripts.
 * It intentionally reads credentials from environment variables so secrets
 * never have to live in committed source files.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) for Node scripts.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
