import { createProperty } from './lib/properties.js'
import { signIn } from './lib/auth.js'

async function run() {

  const email = process.env.SUPABASE_TEST_EMAIL
  const password = process.env.SUPABASE_TEST_PASSWORD

  if (!email || !password) {
    console.log("Set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD before running this script.")
    return
  }

  const { data: authData, error: authError } =
    await signIn(email, password)

  if (authError) {
    console.log("LOGIN ERROR:", authError)
    return
  }

  const user = authData.user

  const property = {
    agent_id: user.id,
    title: "3 Bedroom Apartment",
    description: "Modern apartment in city center",
    price: 120000,
    deal_type: "sale",
    property_type: "apartment",
    location: "Nairobi",
    bedrooms: 3,
    bathrooms: 2,
    image_url: "https://example.com/image.jpg"
  }

  const { data, error } = await createProperty(property)

  console.log("DATA:", data)
  console.log("ERROR:", error)

}

run()
