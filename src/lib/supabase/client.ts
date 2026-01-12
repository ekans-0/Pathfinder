import { createBrowserClient } from "@supabase/ssr"

// Use a global variable to ensure singleton across module reloads
// This prevents multiple GoTrueClient instances
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if already created
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables. Please check the Vars section in the sidebar.",
    )
  }

    // Create and store the client instance
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'pathfinder-auth-token',
      },
    })
    
    return clientInstance
  }
