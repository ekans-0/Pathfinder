"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, RotateCw, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAccessibility } from "@/lib/hooks/use-accessibility"

interface FlashcardStudyProps {
  lesson: any
  flashcards: any[]
  userProgress: any[]
  userId: string
}

export function FlashcardStudy({ lesson, flashcards, userProgress, userId }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [studied, setStudied] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const { theme } = useAccessibility()

  const currentCard = flashcards[currentIndex]
  const progress = (studied.size / flashcards.length) * 100

  const question =
    theme === "easy-read" && currentCard.easy_read_question ? currentCard.easy_read_question : currentCard.question

  const answer =
    theme === "easy-read" && currentCard.easy_read_answer ? currentCard.easy_read_answer : currentCard.answer

  const handleFlip = () => {
    setFlipped(!flipped)
    if (!flipped) {
      setStudied((prev) => new Set(prev).add(currentCard.id))
    }
  }

  const handleConfidence = async (confident: boolean) => {
    const quality = confident ? 5 : 2 // 5 = perfect, 2 = need practice

    const existingProgress = userProgress.find((p) => p.flashcard_id === currentCard.id)

    if (existingProgress) {
      // Calculate next review using SM-2 algorithm (simplified)
      const easeFactor = existingProgress.easiness_factor || 2.5
      const interval = existingProgress.interval_days || 1
      const reviewCount = existingProgress.review_count || 0
      
      let newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      newEase = Math.max(1.3, newEase)
      
      let newInterval = interval
      if (quality >= 3) {
        if (reviewCount === 0) {
          newInterval = 1
        } else if (reviewCount === 1) {
          newInterval = 6
        } else {
          newInterval = Math.round(interval * newEase)
        }
      } else {
        newInterval = 1
      }
      
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

      await supabase
        .from("user_flashcard_progress")
        .update({
          confidence_level: quality,
          review_count: reviewCount + 1,
          last_reviewed_at: new Date().toISOString(),
          next_review_date: nextReviewDate.toISOString(),
          easiness_factor: newEase,
          interval_days: newInterval,
        })
        .eq("id", existingProgress.id)
    } else {
      // First review - use default values
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + 1)

      await supabase.from("user_flashcard_progress").insert({
        user_id: userId,
        flashcard_id: currentCard.id,
        confidence_level: quality,
        review_count: 1,
        last_reviewed_at: new Date().toISOString(),
        next_review_date: nextReviewDate.toISOString(),
        easiness_factor: 2.5,
        interval_days: 1,
      })
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/flashcards" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Back to Flashcards
          </Link>
          <h1 className="text-2xl font-bold mb-1">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{lesson.courses?.title}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="text-sm font-medium">{studied.size} reviewed</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="mb-6 perspective-1000">
          <Card
            className="cursor-pointer transition-all duration-500 min-h-[300px] flex items-center justify-center"
            style={{
              transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
              transformStyle: "preserve-3d",
            }}
            onClick={handleFlip}
          >
            <CardContent className="pt-6 text-center" style={{ backfaceVisibility: "hidden" }}>
              {!flipped ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Question</p>
                  <p className="text-xl leading-relaxed">{question}</p>
                  <p className="text-sm text-muted-foreground mt-8">Click to reveal answer</p>
                </div>
              ) : (
                <div style={{ transform: "rotateY(180deg)" }}>
                  <p className="text-sm text-muted-foreground mb-4">Answer</p>
                  <p className="text-xl leading-relaxed">{answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {flipped && (
          <div className="mb-6">
            <p className="text-center text-sm text-muted-foreground mb-3">How confident are you with this card?</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConfidence(false)}
                className="flex-1 max-w-[200px]"
              >
                <ThumbsDown className="mr-2 h-5 w-5" />
                Need Practice
              </Button>
              <Button size="lg" onClick={() => handleConfidence(true)} className="flex-1 max-w-[200px]">
                <ThumbsUp className="mr-2 h-5 w-5" />
                Got It!
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button variant="ghost" onClick={() => setFlipped(false)}>
            <RotateCw className="mr-2 h-4 w-4" />
            Reset
          </Button>

          <Button variant="outline" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
            Next
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>

        {currentIndex === flashcards.length - 1 && studied.size === flashcards.length && (
          <Card className="mt-6 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Great job!</h3>
              <p className="text-sm text-muted-foreground mb-4">You've reviewed all the flashcards in this set.</p>
              <Button asChild>
                <Link href="/flashcards">Back to All Sets</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
