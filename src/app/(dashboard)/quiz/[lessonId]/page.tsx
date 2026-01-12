import { createClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizComponent } from "@/components/quiz-component"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function QuizPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await createClient()

  // Get lesson
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*, course:courses(*)")
    .eq("id", lessonId)
    .maybeSingle()

  if (!lesson) {
    notFound()
  }

  // Get quiz for this lesson
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questions(
        *,
        quiz_answers(*)
      )
    `)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  if (!quiz) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <Button asChild variant="ghost" className="mb-6">
              <Link href={`/lessons/${lessonId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lesson
              </Link>
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Not Available</CardTitle>
                <CardDescription>There is no quiz available for this lesson yet. Check back later!</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <AccessibilityToolbar />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link href={`/lessons/${params.lessonId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lesson
            </Link>
          </Button>

          <QuizComponent quiz={quiz} lessonId={params.lessonId} />
        </div>
      </div>
      <AccessibilityToolbar />
    </>
  )
}
