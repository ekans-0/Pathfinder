import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { LessonContent } from "@/components/lesson-content"
import { LessonTimeTracker } from "@/components/lesson-time-tracker"

interface LessonPageProps {
  params: {
    lessonId: string
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = params

  if (!lessonId) {
    notFound()
  }

  const supabase = await createClient()

  /* ---------------- AUTH ---------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  /* ---------------- PROFILE ---------------- */
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    const { error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name:
          user.user_metadata?.display_name ??
          user.email?.split("@")[0] ??
          "User",
        experience_points: 0,
        xp: 0,
        level: 1,
      })

    if (createError) {
      console.error("Profile creation failed:", createError)
      redirect("/auth/login")
    }

    redirect("/onboarding")
  }

  /* ---------------- LESSON ---------------- */
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*, courses(*)")
    .eq("id", lessonId) // change to Number(lessonId) if ID is integer
    .maybeSingle()

  if (lessonError) {
    console.error("Lesson query error:", lessonError)
  }

  if (!lesson) {
    notFound()
  }

  /* ---------------- PROGRESS ---------------- */
  const { data: existingProgress } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  let progress = existingProgress

  if (!existingProgress) {
    const { data: newProgress, error } = await supabase
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

    if (error) {
      console.error("Progress creation error:", error)
    }

    progress = newProgress
  }

  /* ---------------- NAVIGATION ---------------- */
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .order("order_index")

  const currentIndex =
    allLessons?.findIndex((l) => l.id === lessonId) ?? 0

  const nextLesson = allLessons?.[currentIndex + 1] ?? null
  const prevLesson = allLessons?.[currentIndex - 1] ?? null

  /* ---------------- DICTIONARY TERMS ---------------- */
  const { data: lessonTerms } = await supabase
    .from("lesson_dictionary_terms")
    .select("dictionary_terms(*)")
    .eq("lesson_id", lessonId)

  const dictionaryTerms =
    lessonTerms?.map((lt: any) => lt.dictionary_terms) ?? []

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />

      <LessonTimeTracker
        userId={user.id}
        lessonId={lessonId}
        courseId={lesson.course_id}
        moduleId={lesson.module_id}
      />

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
