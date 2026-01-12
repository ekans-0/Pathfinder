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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
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
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 my-4">Pathfinder</h1>
            </Link>
            <div className="text-center">
              <p className="text-base sm:text-lg text-muted-foreground">Learn your rights, find your voice</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
                <CardDescription>Enter your email to sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-4 sm:gap-6">
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
                        Enter your email address to sign in
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="password-description"
                      />
                      <span id="password-description" className="sr-only">
                        Enter your password to sign in
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
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="underline underline-offset-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Sign up
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
