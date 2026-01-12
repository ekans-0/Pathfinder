"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface LessonTimeTrackerProps {
  userId: string
  lessonId: string
  courseId: string
  moduleId?: string
}

export function LessonTimeTracker({ userId, lessonId, courseId, moduleId }: LessonTimeTrackerProps) {
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const supabase = createClient()

  useEffect(() => {
    // Create a new time tracking session
    const initSession = async () => {
      const { data, error } = await supabase
        .from("time_sessions")
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          module_id: moduleId,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle()

      if (error) {
        console.error("Error creating time session:", error)
      } else if (data) {
        sessionIdRef.current = data.id
      }
    }

    initSession()

    // Update time spent every 30 seconds
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
      if (sessionIdRef.current) {
        supabase
          .from("time_sessions")
          .update({ duration_seconds: timeSpent })
          .eq("id", sessionIdRef.current)
          .then(() => {
            // Also update the lesson progress time
            // Get current time_spent and increment
            supabase
              .from("user_lesson_progress")
              .select("time_spent")
              .eq("user_id", userId)
              .eq("lesson_id", lessonId)
              .maybeSingle()
              .then(({ data }) => {
                const currentTime = data?.time_spent || 0
                supabase
                  .from("user_lesson_progress")
                  .update({
                    time_spent: currentTime + 30,
                  })
                  .eq("user_id", userId)
                  .eq("lesson_id", lessonId)
              })
          })
      }
    }, 30000) // Every 30 seconds

    // End session on unmount
    return () => {
      clearInterval(interval)
      if (sessionIdRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
        supabase
          .from("time_sessions")
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: timeSpent,
          })
          .eq("id", sessionIdRef.current)
          .then(() => {})
      }
    }
  }, [userId, lessonId, courseId, moduleId, supabase])

  return null // This component doesn't render anything
}
