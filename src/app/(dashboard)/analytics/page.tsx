import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { PageWithTTS } from "@/components/page-with-tts"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default async function AnalyticsPage() {
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

  // Get total lessons
  const { count: totalLessons } = await supabase.from("lessons").select("*", { count: "exact", head: true })

  // Get completed lessons with details
  const { data: completedLessons, count: totalLessonsCompleted } = await supabase
    .from("user_lesson_progress")
    .select("*, lessons(title)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })

  // Calculate total time spent
  const { data: allProgress } = await supabase.from("user_lesson_progress").select("time_spent").eq("user_id", user.id)

  const totalTimeSpent = allProgress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0

  // Get current and longest streak
  const { data: streakData } = await supabase
    .from("user_learning_streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  // Get quiz statistics
  const { data: quizAttempts } = await supabase.from("user_quiz_attempts").select("score").eq("user_id", user.id)

  const averageQuizScore =
    quizAttempts && quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : 0

  // Get badges
  const { count: badgesEarned } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: totalBadges } = await supabase.from("badges").select("*", { count: "exact", head: true })

  // Format recent activity
  const recentActivity = completedLessons?.map((lesson: any) => ({
    title: lesson.lessons?.title || "Lesson",
    completed_at: lesson.completed_at,
    time_spent: lesson.time_spent,
  }))

  const stats = {
    totalLessonsCompleted: totalLessonsCompleted || 0,
    totalLessons: totalLessons || 0,
    totalTimeSpent,
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    averageQuizScore,
    badgesEarned: badgesEarned || 0,
    totalBadges: totalBadges || 0,
    recentActivity: recentActivity || [],
  }

  return (
    <PageWithTTS>
      <div className="min-h-screen bg-background">
        <AppHeader profile={profile} />
        <main className="container mx-auto px-4 py-8">
          <AnalyticsDashboard profile={profile} stats={stats} />
        </main>
        <AccessibilityToolbar />
      </div>
    </PageWithTTS>
  )
}
