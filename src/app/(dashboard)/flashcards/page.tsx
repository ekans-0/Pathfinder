import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain } from 'lucide-react';
import Link from "next/link";

export default async function FlashcardsPage() {
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

  // Get all lessons with flashcards
  const { data: lessons } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      courses(title, icon),
      flashcards(count)
    `)
    .gt("flashcards.count", 0)
    .eq("is_published", true);

  // Get user's flashcard progress
  const { data: userProgress } = await supabase
    .from("user_flashcard_progress")
    .select("flashcard_id, confidence_level")
    .eq("user_id", user.id);

  const progressMap = userProgress?.reduce((acc: any, p: any) => {
    acc[p.flashcard_id] = p.confidence_level;
    return acc;
  }, {});

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
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">
            Practice and reinforce what you've learned
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson: any) => {
              const flashcardCount = lesson.flashcards?.[0]?.count || 0;
              
              return (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-3xl">{lesson.courses?.icon || "📚"}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription>{lesson.courses?.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Brain className="h-4 w-4" />
                        <span>{flashcardCount} cards</span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/flashcards/${lesson.id}`}>
                        Study Cards
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No flashcard sets available yet. Complete lessons to unlock flashcards.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
