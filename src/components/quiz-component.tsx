"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface QuizComponentProps {
  quiz: any
  lessonId: string
}

export function QuizComponent({ quiz, lessonId }: QuizComponentProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const questions = quiz.quiz_questions.sort((a: any, b: any) => a.order_index - b.order_index)
  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answerId,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    // Calculate score
    let correctCount = 0
    questions.forEach((question: any) => {
      const selectedAnswerId = selectedAnswers[question.id]
      const correctAnswer = question.quiz_answers.find((a: any) => a.is_correct)
      if (selectedAnswerId === correctAnswer?.id) {
        correctCount++
      }
    })

    setScore(correctCount)
    setShowResults(true)

    // Save quiz attempt
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quiz.id,
        score: correctCount,
        total_questions: questions.length,
      })
    }

    setSubmitting(false)
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100
    const passed = percentage >= 70

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length} ({percentage.toFixed(0)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passed ? (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Great job! You passed the quiz. You can review your answers below.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Keep learning! Review the lesson and try again to improve your score.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-6">
            <h3 className="font-semibold text-lg">Review Your Answers:</h3>
            {questions.map((question: any, index: number) => {
              const selectedAnswerId = selectedAnswers[question.id]
              const selectedAnswer = question.quiz_answers.find((a: any) => a.id === selectedAnswerId)
              const correctAnswer = question.quiz_answers.find((a: any) => a.is_correct)
              const isCorrect = selectedAnswerId === correctAnswer?.id

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-sm text-muted-foreground break-words">{question.question}</p>
                    </div>
                  </div>

                  <div className="ml-7 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Your answer:</span>{" "}
                      <span
                        className={isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                      >
                        {selectedAnswer?.answer_text || "Not answered"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        <span className="font-medium">Correct answer:</span>{" "}
                        <span className="text-green-600 dark:text-green-400">{correctAnswer?.answer_text}</span>
                      </p>
                    )}
                    {correctAnswer?.explanation && (
                      <p className="text-sm text-muted-foreground mt-2">{correctAnswer.explanation}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => router.push(`/lessons/${lessonId}`)} className="w-full sm:w-auto">
            Back to Lesson
          </Button>
          <Button
            onClick={() => {
              setShowResults(false)
              setCurrentQuestionIndex(0)
              setSelectedAnswers({})
              setScore(0)
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} / {questions.length} answered
          </span>
        </div>
        <CardTitle className="text-xl break-words">{currentQuestion.question}</CardTitle>
        {currentQuestion.easy_read_question && (
          <CardDescription className="text-base break-words">{currentQuestion.easy_read_question}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAnswers[currentQuestion.id] || ""} onValueChange={handleAnswerSelect}>
          <div className="space-y-3">
            {currentQuestion.quiz_answers.map((answer: any) => (
              <div
                key={answer.id}
                className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer"
              >
                <RadioGroupItem value={answer.id} id={answer.id} />
                <Label htmlFor={answer.id} className="flex-1 cursor-pointer break-words">
                  {answer.answer_text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="w-full sm:w-auto bg-transparent"
        >
          Previous
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.id]} className="w-full sm:w-auto">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
