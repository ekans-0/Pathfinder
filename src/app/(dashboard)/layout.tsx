import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  let profile = null
  if (user) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    
    // If profile doesn't exist, create it
    if (!data && !error) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
          experience_points: 0,
          xp: 0,
          level: 1,
        })
        .select()
        .single()
      
      if (createError) {
        console.error("Error creating profile:", createError)
        redirect("/auth/login")
        return null
      }
      profile = newProfile
    } else {
      profile = data
    }

    if (profile && !profile.onboarding_completed && !pathname.includes("/onboarding")) {
      redirect("/onboarding")
    }
  }

  return <AccessibilityProvider profile={profile}>{children}</AccessibilityProvider>
}
