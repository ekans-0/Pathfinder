"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BookOpen, ChevronRight, ChevronLeft } from "lucide-react"

const DISABILITY_OPTIONS = [
  {
    value: "cognitive",
    label: "Cognitive/Intellectual Disability",
    description: "Affects thinking, learning, and problem-solving",
  },
  { value: "learning", label: "Learning Disability", description: "Affects reading, writing, or math skills" },
  { value: "adhd", label: "ADHD", description: "Affects attention and focus" },
  { value: "autism", label: "Autism Spectrum", description: "Affects communication and social interaction" },
  { value: "mental_health", label: "Mental Health Condition", description: "Affects mood, thinking, or behavior" },
  { value: "physical", label: "Physical Disability", description: "Affects mobility or physical function" },
  { value: "sensory_visual", label: "Visual Impairment", description: "Affects vision" },
  { value: "sensory_hearing", label: "Hearing Impairment", description: "Affects hearing" },
  { value: "speech", label: "Speech/Communication Disability", description: "Affects speech or communication" },
  {
    value: "chronic_health",
    label: "Chronic Health Condition",
    description: "Ongoing health condition that affects daily life",
  },
  { value: "other", label: "Other", description: "Another type of disability" },
  { value: "prefer_not_say", label: "Prefer not to say", description: "" },
]

const AVATAR_OPTIONS = [
  { id: "avatar1", name: "Alex", emoji: "🧑", description: "Friendly and helpful" },
  { id: "avatar2", name: "Sam", emoji: "👤", description: "Curious and thoughtful" },
  { id: "avatar3", name: "Jordan", emoji: "😊", description: "Energetic and positive" },
  { id: "avatar4", name: "Taylor", emoji: "🙂", description: "Calm and focused" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    ageGroup: "",
    disabilityTypes: [] as string[],
    avatar: "",
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleDisability = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      disabilityTypes: prev.disabilityTypes.includes(value)
        ? prev.disabilityTypes.filter((d) => d !== value)
        : [...prev.disabilityTypes, value],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if profile exists, if not create it, otherwise update
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

        const disabilityTypes = formData.disabilityTypes
        const autoDisplayMode = (disabilityTypes.includes('cognitive') || disabilityTypes.includes('learning') || disabilityTypes.includes('adhd')) ? 'easy_read' : 'standard'
        const autoTextSize = disabilityTypes.includes('sensory_visual') ? 'large' : 'medium'

        let error
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              display_name: formData.displayName,
              age_group: formData.ageGroup,
              disability_types: formData.disabilityTypes,
              preferred_avatar: { id: formData.avatar },
              display_mode: autoDisplayMode,
              text_size: autoTextSize,
              onboarding_completed: true,
              experience_points: 0,
              xp: 0,
              level: 1,
            })
          error = insertError
        } else {
          // Update existing profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              display_name: formData.displayName,
              age_group: formData.ageGroup,
              disability_types: formData.disabilityTypes,
              preferred_avatar: { id: formData.avatar },
              display_mode: autoDisplayMode,
              text_size: autoTextSize,
              onboarding_completed: true,
            })
            .eq("id", user.id)
          error = updateError
        }


      if (error) throw error

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving onboarding:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-sm border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-400" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-white">Welcome to Pathfinder</CardTitle>
          <CardDescription className="text-slate-300">Let's personalize your learning experience</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${
                  i === step ? "bg-blue-400" : i < step ? "bg-blue-600" : "bg-slate-600"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What should we call you?</h3>
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">How old are you?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, ageGroup: "teen" }))}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      formData.ageGroup === "teen"
                        ? "border-blue-400 bg-blue-400/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-3xl mb-2">🎓</div>
                    <div className="font-semibold text-white">Teen</div>
                    <div className="text-sm text-slate-300">13-19 years old</div>
                  </button>
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, ageGroup: "adult" }))}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      formData.ageGroup === "adult"
                        ? "border-blue-400 bg-blue-400/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-3xl mb-2">👤</div>
                    <div className="font-semibold text-white">Adult</div>
                    <div className="text-sm text-slate-300">20+ years old</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Do you have any disabilities or conditions?</h3>
                <p className="text-sm text-slate-300 mb-4">
                  This helps us provide better accommodations and content. Select all that apply.
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                  {DISABILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleDisability(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.disabilityTypes.includes(option.value)
                          ? "border-blue-400 bg-blue-400/10"
                          : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center ${
                            formData.disabilityTypes.includes(option.value)
                              ? "border-blue-400 bg-blue-400"
                              : "border-slate-500"
                          }`}
                        >
                          {formData.disabilityTypes.includes(option.value) && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-slate-400 mt-1">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Choose your avatar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: avatar.id }))}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.avatar === avatar.id
                          ? "border-blue-400 bg-blue-400/10"
                          : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                      }`}
                    >
                      <div className="text-4xl mb-2">{avatar.emoji}</div>
                      <div className="font-semibold text-white text-sm">{avatar.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{avatar.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={(step === 1 && !formData.displayName) || (step === 2 && !formData.ageGroup)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.avatar}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? "Saving..." : "Get Started"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
