"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/onboarding`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 leading-7 my-4">
                Pathfinder
              </h1>
            </Link>
            <div className="text-center">
              <p className="text-base sm:text-lg text-muted-foreground">Learn your rights, find your voice</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Create an account</CardTitle>
                <CardDescription>Start your learning journey today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="Your name"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        aria-describedby="display-name-description"
                      />
                      <span id="display-name-description" className="sr-only">
                        Enter the name you want to be displayed on your profile
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-describedby="email-description"
                      />
                      <span id="email-description" className="sr-only">
                        Enter your email address to create your account
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="password-requirements"
                      />
                      <span id="password-requirements" className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="repeat-password">Confirm Password</Label>
                      <Input
                        id="repeat-password"
                        type="password"
                        required
                        minLength={6}
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        aria-describedby="repeat-password-description"
                      />
                      <span id="repeat-password-description" className="sr-only">
                        Re-enter your password to confirm
                      </span>
                    </div>
                    {error && (
                      <div
                        className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                        role="alert"
                        aria-live="polite"
                      >
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="underline underline-offset-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AccessibilityToolbar />
    </>
  )
}
