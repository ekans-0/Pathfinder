import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { PageWithTTS } from "@/components/page-with-tts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default async function CoursesPage() {
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

  const { data: courses } = await supabase.from("courses").select("*").eq("is_published", true).order("order_index")

  const coursesWithCounts = await Promise.all(
    (courses || []).map(async (course) => {
      // Get modules for this course
      const { data: modules } = await supabase.from("modules").select("id").eq("course_id", course.id)

      const moduleIds = modules?.map((m) => m.id) || []

      // Get lessons count from these modules
      let lessonCount = 0
      if (moduleIds.length > 0) {
        const { count } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .in("module_id", moduleIds)
          .eq("is_published", true)
        lessonCount = count || 0
      }

      return { ...course, lessonCount }
    }),
  )

  const { data: userProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, status, lessons!inner(module_id, modules!inner(course_id))")
    .eq("user_id", user.id)

  const progressByCourse = userProgress?.reduce((acc: any, progress: any) => {
    const courseId = progress.lessons?.modules?.course_id
    if (!courseId) return acc
    if (!acc[courseId]) {
      acc[courseId] = { completed: 0, inProgress: 0 }
    }
    if (progress.status === "completed") {
      acc[courseId].completed++
    } else if (progress.status === "in_progress") {
      acc[courseId].inProgress++
    }
    return acc
  }, {})

  return (
    <PageWithTTS>
      <div className="min-h-screen bg-background">
        <AppHeader profile={profile} />
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Courses</h1>
            <p className="text-lg text-muted-foreground">Explore our comprehensive curriculum on disability rights</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coursesWithCounts?.map((course: any) => {
              const lessonCount = course.lessonCount
              const courseProgress = progressByCourse?.[course.id]
              const completedLessons = courseProgress?.completed || 0
              const progressPercentage = lessonCount > 0 ? (completedLessons / lessonCount) * 100 : 0

              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl" aria-hidden="true">
                          {course.icon || "📚"}
                        </div>
                        <Badge variant={course.difficulty === "beginner" ? "default" : "secondary"}>
                          {course.difficulty || "beginner"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl break-words">{course.title}</CardTitle>
                      <CardDescription className="break-words">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                          <span>
                            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                      </div>
                      {progressPercentage > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            aria-label={`${Math.round(progressPercentage)}% complete`}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {(!coursesWithCounts || coursesWithCounts.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </main>
        <AccessibilityToolbar />
      </div>
    </PageWithTTS>
  )
}
