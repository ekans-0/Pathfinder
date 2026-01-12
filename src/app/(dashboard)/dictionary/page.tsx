import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { DictionarySearch } from "@/components/dictionary-search";

export default async function DictionaryPage() {
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

  // Get all dictionary terms
  const { data: terms } = await supabase
    .from("dictionary_terms")
    .select("*")
    .order("term");

  // Get user's saved terms
  const { data: savedTerms } = await supabase
    .from("user_saved_terms")
    .select("term_id")
    .eq("user_id", user.id);

  const savedTermIds = new Set(savedTerms?.map((st: any) => st.term_id) || []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Dictionary</h1>
          <p className="text-muted-foreground">
            Learn important terms about disability rights
          </p>
        </div>
        <DictionarySearch 
          terms={terms || []} 
          savedTermIds={savedTermIds}
          userId={user.id}
        />
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
