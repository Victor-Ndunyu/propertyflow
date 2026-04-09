import { signUp } from './lib/auth.js'

async function run() {

  const email = process.env.SUPABASE_TEST_EMAIL
  const password = process.env.SUPABASE_TEST_PASSWORD

  if (!email || !password) {
    console.log("Set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD before running this script.")
    return
  }

  const { data, error } = await signUp(email, password)

  console.log("DATA:", data)
  console.log("ERROR:", error)

}

run()
