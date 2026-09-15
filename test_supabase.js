const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  console.log("Creating user...")
  const { data, error } = await supabase.auth.signUp({
    email: 'admin_test_123@vamo.com',
    password: 'VamoGrowth@2024!'
  })
  if (error) {
    console.error("ERROR:", error)
  } else {
    console.log("SUCCESS:", data)
  }
}

test()
