import { createClient } from '@supabase/supabase-js'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export async function createServerClient() {
  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies().set(name, value, options)
          })
        },
      },
    }
  )
}

export default supabase