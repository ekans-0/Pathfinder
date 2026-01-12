import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { AIChat } from "@/components/ai-chat";

export default async function AIAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // If profile doesn't exist, create it
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
      .single();
    
    if (createError || !newProfile) {
      console.error("Error creating profile:", createError);
      redirect("/auth/login");
      return null;
    }
    
    redirect("/onboarding");
    return null;
  }

  // Get recent chat messages
  const { data: recentMessages } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask me anything about disability rights and I'll help you understand
          </p>
        </div>
        <AIChat initialMessages={recentMessages || []} userId={user.id} />
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
