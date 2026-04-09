import { supabase } from './lib/supabase.js'

async function testConnection() {

  const { data, error } = await supabase
    .from('properties')
    .select('*')

  console.log("DATA:", data)
  console.log("ERROR:", error)

}

testConnection()