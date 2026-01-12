"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, ChevronRight, Award } from "lucide-react"
import Link from "next/link"

interface QuizContentProps {
  quiz: any
  profile: any
  attempts: any[]
}

export function QuizContent({ quiz, profile, attempts }: QuizContentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const router = useRouter()
  const supabase = createClient()

  const questions = quiz.quiz_questions || []
  const totalQuestions = questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const bestAttempt = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Calculate score
    let correctCount = 0
    const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0)
    let earnedPoints = 0

    questions.forEach((question: any) => {
      const userAnswer = answers[question.id]
      const correctAnswer = JSON.parse(question.correct_answer)

      if (userAnswer === correctAnswer) {
        correctCount++
        earnedPoints += question.points
      }
    })

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100)
    const passed = scorePercentage >= quiz.passing_score

    setScore(scorePercentage)
    setShowResults(true)

    // Save attempt
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)
    const attemptNumber = attempts.length + 1

    try {
      await supabase.from("user_quiz_attempts").insert({
        user_id: profile.id,
        quiz_id: quiz.id,
        score: scorePercentage,
        time_taken: timeSpentSeconds,
        answers: answers,
        passed: passed,
        attempt_number: attemptNumber,
      })

      // Award XP if passed
      if (passed) {
        const xpEarned = quiz.quiz_type === "course" ? 100 : 50
        const newXP = profile.experience_points + xpEarned
        const newLevel = Math.floor(newXP / 100) + 1

        await supabase
          .from("profiles")
          .update({
            experience_points: newXP,
            level: newLevel,
          })
          .eq("id", profile.id)

        // Update module or course progress
        if (quiz.quiz_type === "module" && quiz.module_id) {
          await supabase
            .from("user_module_progress")
            .update({
              quiz_passed: true,
            })
            .eq("user_id", profile.id)
            .eq("module_id", quiz.module_id)
        }
      }

      router.refresh()
    } catch (error) {
      console.error("Error saving quiz attempt:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResults) {
    const passed = score >= quiz.passing_score
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60)

    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className={`border-2 ${passed ? "border-green-500" : "border-orange-500"}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Award className="h-16 w-16 text-orange-500" />
              )}
            </div>
            <CardTitle className="text-2xl">{passed ? "Congratulations! You Passed!" : "Keep Learning!"}</CardTitle>
            <CardDescription>
              {passed
                ? `You scored ${score}% (passing score: ${quiz.passing_score}%)`
                : `You scored ${score}%. You need ${quiz.passing_score}% to pass.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Your Score</div>
                  <div className="text-2xl font-bold">{score}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time Taken</div>
                  <div className="text-2xl font-bold">{timeSpent} min</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="text-2xl font-bold">{totalQuestions}</div>
                </div>
              </div>

              {bestAttempt && score > bestAttempt && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 font-semibold">New Personal Best!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Previous best: {bestAttempt}%</p>
                </div>
              )}

              <div className="space-y-3">
                {!passed && (
                  <Button
                    onClick={() => {
                      setShowResults(false)
                      setCurrentQuestion(0)
                      setAnswers({})
                    }}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                )}

                {quiz.module_id && quiz.modules && (
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/courses/${quiz.modules.course_id}`}>Back to Course</Link>
                  </Button>
                )}

                {quiz.quiz_type === "course" && quiz.courses && (
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show correct answers */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Review Answers</CardTitle>
            <CardDescription>See which questions you got right and wrong</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question: any, index: number) => {
                const userAnswer = answers[question.id]
                const correctAnswer = JSON.parse(question.correct_answer)
                const isCorrect = userAnswer === correctAnswer

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          Question {index + 1}: {question.question_text}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Your answer:{" "}
                          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {userAnswer || "No answer"}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-muted-foreground">
                            Correct answer: <span className="text-green-600">{correctAnswer}</span>
                          </div>
                        )}
                        {question.explanation && (
                          <div className="text-sm mt-2 p-3 bg-muted rounded-lg">
                            <span className="font-semibold">Explanation:</span> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  const currentQ = questions[currentQuestion]
  const options = currentQ ? JSON.parse(currentQ.options) : []
  const answeredAll = Object.keys(answers).length === totalQuestions

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={quiz.module_id ? `/courses/${quiz.modules?.course_id}` : "/dashboard"}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-muted-foreground">{quiz.description}</p>

        {bestAttempt !== null && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Your best score: {bestAttempt}% (Passing: {quiz.passing_score}%)
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <Progress value={progress} className="flex-1" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQ?.question_text}</CardTitle>
          <CardDescription>
            {currentQ?.question_type === "true_false" ? "Select True or False" : "Select the best answer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[currentQ?.id] || ""} onValueChange={(value) => handleAnswer(currentQ?.id, value)}>
            <div className="space-y-3">
              {options.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer py-3">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 mt-6">
        <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentQuestion ? "bg-primary" : answers[questions[index].id] ? "bg-green-500" : "bg-muted"
              }`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={!answeredAll || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  )
}
