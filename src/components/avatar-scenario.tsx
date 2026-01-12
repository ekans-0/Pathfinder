"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, User } from "lucide-react"

interface Avatar {
  name: string
  role?: string
  description: string
  dialogue: string
  disability_type?: string
  barrier?: string
  rights_used?: string[]
  law_level?: string
}

interface AvatarScenarioProps {
  title: string
  description: string
  avatars: Avatar[]
  questions?: Array<{ question: string; answer: string }>
  task?: string
}

export function AvatarScenario({ title, description, avatars, questions, task }: AvatarScenarioProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  return (
    <Card className="my-6 border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-primary" aria-hidden="true" />
          <Badge variant="secondary">Interactive Scenario</Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {avatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(index)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                selectedAvatar === index
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
              aria-pressed={selectedAvatar === index}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {avatar.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base break-words">{avatar.name}</h4>
                  <p className="text-sm text-muted-foreground break-words">{avatar.role || avatar.description}</p>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${selectedAvatar === index ? "rotate-90" : ""}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {selectedAvatar !== null && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                  {avatars[selectedAvatar].name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{avatars[selectedAvatar].name} says:</h4>
                  <p className="text-sm sm:text-base leading-relaxed italic">"{avatars[selectedAvatar].dialogue}"</p>
                </div>
              </div>
              {avatars[selectedAvatar].barrier && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Barrier faced:</span> {avatars[selectedAvatar].barrier}
                  </p>
                </div>
              )}
              {avatars[selectedAvatar].rights_used && avatars[selectedAvatar].rights_used!.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Rights being used:</p>
                  <div className="flex flex-wrap gap-2">
                    {avatars[selectedAvatar].rights_used!.map((right, i) => (
                      <Badge key={i} variant="outline">
                        {right}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {avatars[selectedAvatar].law_level && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Law level:</span> {avatars[selectedAvatar].law_level}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {task && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Your task:</span> {task}
              </p>
            </CardContent>
          </Card>
        )}

        {questions && questions.length > 0 && (
          <div>
            <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="mb-4">
              {showAnswers ? "Hide" : "Show"} Discussion Questions
            </Button>
            {showAnswers && (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <p className="font-medium mb-2">{q.question}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
