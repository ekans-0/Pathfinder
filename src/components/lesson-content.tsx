"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import { LessonContentRenderer } from "./lesson-content-renderer"

interface LessonContentProps {
  lesson: any
  progress: any
  profile: any
  nextLesson?: any
  prevLesson?: any
  dictionaryTerms: any[]
}

export function LessonContent({
  lesson,
  progress,
  profile,
  nextLesson,
  prevLesson,
  dictionaryTerms,
}: LessonContentProps) {
  const [completed, setCompleted] = useState(progress?.status === "completed")
  const [isLoading, setIsLoading] = useState(false)
  const [startTime] = useState(Date.now())
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useAccessibility()

  const content = theme === "easy-read" && lesson.easy_read_content ? lesson.easy_read_content : lesson.content

  useEffect(() => {
    const updateAccessTime = async () => {
      await supabase
        .from("user_lesson_progress")
        .update({
          last_accessed_at: new Date().toISOString(),
          session_start: new Date().toISOString(),
        })
        .eq("id", progress.id)
    }
    updateAccessTime()
  }, [])

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)
      const totalTimeSpent = (progress.time_spent || 0) + timeSpentSeconds

      // Mark lesson as completed
      await supabase
        .from("user_lesson_progress")
        .update({
          status: "completed",
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
          time_spent: totalTimeSpent,
        })
        .eq("id", progress.id)

      // Award XP
      const xpEarned = 20
      const newXP = profile.experience_points + xpEarned
      const newLevel = Math.floor(newXP / 100) + 1

      await supabase
        .from("profiles")
        .update({
          experience_points: newXP,
          level: newLevel,
        })
        .eq("id", profile.id)

      await generateFlashcardsForLesson(lesson.id, profile.id)

      setCompleted(true)

      // Check for badge achievements
      await checkBadgeAchievements()

      router.refresh()
    } catch (error) {
      console.error("Error completing lesson:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFlashcardsForLesson = async (lessonId: string, userId: string) => {
    try {
      // Get flashcards for this lesson
      const { data: flashcards } = await supabase.from("flashcards").select("*").eq("lesson_id", lessonId).limit(3)

      if (!flashcards || flashcards.length === 0) return

      // Create user flashcards with initial spaced repetition values
      const userFlashcards = flashcards.map((card) => ({
        user_id: userId,
        flashcard_id: card.id,
        easiness_factor: 2.5,
        interval_days: 1,
        review_count: 0,
        next_review_date: new Date().toISOString(),
      }))

      await supabase.from("user_flashcard_progress").upsert(userFlashcards, { onConflict: "user_id,flashcard_id" })
    } catch (error) {
      console.error("Error generating flashcards:", error)
    }
  }

  const checkBadgeAchievements = async () => {
    // Get completed lessons count
    const { count } = await supabase
      .from("user_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("status", "completed")

    // Get badges user might have earned
    const { data: badges } = await supabase
      .from("badges")
      .select("*")
      .eq("requirement_type", "lessons_completed")
      .lte("requirement_value", count || 0)

    // Award badges if not already earned
    if (badges) {
      for (const badge of badges) {
        const { data: existingBadge } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", profile.id)
          .eq("badge_id", badge.id)
          .maybeSingle()

        if (!existingBadge) {
          await supabase.from("user_badges").insert({
            user_id: profile.id,
            badge_id: badge.id,
          })
        }
      }
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/courses/${lesson.course_id}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to {lesson.courses?.title}
          </Link>
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          {progress && (
            <div className="flex items-center gap-3 mb-4">
              <Progress value={completed ? 100 : 50} className="flex-1" />
              <span className="text-sm text-muted-foreground">{completed ? "Completed" : "In Progress"}</span>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <LessonContentRenderer content={content} dictionaryTerms={dictionaryTerms} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 mb-6">
          {prevLesson ? (
            <Button asChild variant="outline">
              <Link href={`/lessons/${prevLesson.id}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Lesson
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {!completed && (
            <Button onClick={handleComplete} disabled={isLoading} size="lg">
              <CheckCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Completing..." : "Mark as Complete"}
            </Button>
          )}

          {nextLesson ? (
            <Button asChild>
              <Link href={`/lessons/${nextLesson.id}`}>
                Next Lesson
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : completed ? (
            <Button asChild>
              <Link href={`/courses/${lesson.course_id}`}>Back to Course</Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  )
}
