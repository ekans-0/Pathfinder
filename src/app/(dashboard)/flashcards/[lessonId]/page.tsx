import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { FlashcardStudy } from "@/components/flashcard-study";

export default async function FlashcardStudyPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
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

  // Get lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*, courses(*)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) {
    redirect("/flashcards");
  }

  // Get flashcards for this lesson
  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");

  if (!flashcards || flashcards.length === 0) {
    redirect("/flashcards");
  }

  // Get user's progress for these flashcards
  const { data: userProgress } = await supabase
    .from("user_flashcard_progress")
    .select("*")
    .eq("user_id", user.id)
    .in("flashcard_id", flashcards.map((f: any) => f.id));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <FlashcardStudy
        lesson={lesson}
        flashcards={flashcards}
        userProgress={userProgress || []}
        userId={user.id}
      />
      <AccessibilityToolbar />
    </div>
  );
}
