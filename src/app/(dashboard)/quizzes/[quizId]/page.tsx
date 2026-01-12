import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { PageWithTTS } from "@/components/page-with-tts"
import { QuizContent } from "@/components/quiz-content"

interface QuizPageProps {
  params: {
    quizId: string
  }
}

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

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

  // Get quiz with questions
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      quiz_questions (
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        explanation,
        order_index,
        points
      ),
      modules (
        id,
        title,
        course_id
      ),
      courses (
        id,
        title
      )
    `,
    )
    .eq("id", quizId)
    .maybeSingle()

  if (!quiz) {
    redirect("/dashboard")
  }

  // Get previous attempts
  const { data: attempts } = await supabase
    .from("user_quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: false })

  // Sort questions by order_index
  if (quiz.quiz_questions) {
    quiz.quiz_questions.sort((a: any, b: any) => a.order_index - b.order_index)
  }

  return (
    <PageWithTTS>
      <div className="min-h-screen bg-background">
        <AppHeader profile={profile} />
        <QuizContent quiz={quiz} profile={profile} attempts={attempts || []} />
        <AccessibilityToolbar />
      </div>
    </PageWithTTS>
  )
}
