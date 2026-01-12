import { SupabaseClient } from "@supabase/supabase-js"
import { User } from "@supabase/supabase-js"

export async function getOrCreateProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ data: any; error: any }> {
  // Try to get existing profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profile) {
    return { data: profile, error: null }
  }

  // Profile doesn't exist, create it
  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "User"

  const { data: newProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: displayName,
      experience_points: 0,
      xp: 0,
      level: 1,
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating profile:", createError)
    return { data: null, error: createError }
  }

  return { data: newProfile, error: null }
}
