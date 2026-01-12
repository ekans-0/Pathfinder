import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { LessonContent } from "@/components/lesson-content"
import { LessonTimeTracker } from "@/components/lesson-time-tracker"

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
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

  // Get lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*, courses(*)")
    .eq("id", lessonId)
    .maybeSingle()

  if (!lesson) {
    redirect("/courses")
  }

  // Get or create user progress
  const { data: existingProgress } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  let progress = existingProgress

  if (!existingProgress) {
    const { data: newProgress } = await supabase
      .from("user_lesson_progress")
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: lesson.course_id,
        status: "in_progress",
        completion_percentage: 0,
      })
      .select()
      .single()
    progress = newProgress
  }

  // Get all lessons in this course for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .order("order_index")

  const currentIndex = allLessons?.findIndex((l: any) => l.id === lessonId) || 0
  const nextLesson = allLessons?.[currentIndex + 1]
  const prevLesson = allLessons?.[currentIndex - 1]

  const { data: lessonTerms } = await supabase
    .from("lesson_dictionary_terms")
    .select("dictionary_terms(*)")
    .eq("lesson_id", lessonId)

  // Extract the dictionary terms from the nested structure
  const dictionaryTerms = lessonTerms?.map((lt: any) => lt.dictionary_terms) || []

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <LessonTimeTracker userId={user.id} lessonId={lessonId} courseId={lesson.course_id} moduleId={lesson.module_id} />
      <LessonContent
        lesson={lesson}
        progress={progress}
        profile={profile}
        nextLesson={nextLesson}
        prevLesson={prevLesson}
        dictionaryTerms={dictionaryTerms}
      />
      <AccessibilityToolbar />
    </div>
  )
}
