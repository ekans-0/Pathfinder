import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { PageWithTTS } from "@/components/page-with-tts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    // If profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
        experience_points: 0,
        xp: 0,
        level: 1,
      })
      .select()
      .single()
    
    if (createError || !newProfile) {
      console.error("Error creating profile:", createError)
      redirect("/auth/login")
      return null
    }
    
    // Redirect to onboarding if profile was just created
    redirect("/onboarding")
    return null
  }

  // Get user's progress
  const { data: progressData } = await supabase
    .from("user_lesson_progress")
    .select("*, lessons(title, course_id, courses(title))")
    .eq("user_id", user.id)
    .order("last_accessed_at", { ascending: false })
    .limit(3)

  // Get total lessons completed
  const { count: completedCount } = await supabase
    .from("user_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")

  // Get user's badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(3)

  const nextLevelXP = profile.level * 100
  const progressToNextLevel = profile.experience_points % 100

  return (
    <PageWithTTS>
      <div className="min-h-screen bg-background">
        <AppHeader profile={profile} />
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome back, {profile.display_name}!</h1>
            <p className="text-base sm:text-lg text-muted-foreground">Continue your learning journey</p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.level}</div>
                <Progress
                  value={progressToNextLevel}
                  className="mt-2"
                  aria-label={`${progressToNextLevel} out of ${nextLevelXP} XP to next level`}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {progressToNextLevel} / {nextLevelXP} XP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">XP</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.experience_points}</div>
                <p className="text-xs text-muted-foreground mt-4">Total experience</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-4">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userBadges?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-4">Earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                {progressData && progressData.length > 0 ? (
                  <div className="space-y-4">
                    {progressData.map((progress: any) => (
                      <div
                        key={progress.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium break-words">{progress.lessons?.title}</p>
                          <p className="text-sm text-muted-foreground break-words">
                            {progress.lessons?.courses?.title}
                          </p>
                          <Progress
                            value={progress.completion_percentage}
                            className="mt-2 w-full"
                            aria-label={`${progress.completion_percentage}% complete`}
                          />
                        </div>
                        <Button asChild size="sm" className="w-full sm:w-auto shrink-0">
                          <Link href={`/lessons/${progress.lesson_id}`}>Continue</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
                    <p className="text-muted-foreground mb-4">No lessons started yet</p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest badges</CardDescription>
              </CardHeader>
              <CardContent>
                {userBadges && userBadges.length > 0 ? (
                  <div className="space-y-4">
                    {userBadges.map((userBadge: any) => (
                      <div key={userBadge.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                        <div className="text-3xl shrink-0" aria-hidden="true">
                          {userBadge.badges?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium break-words">{userBadge.badges?.name}</p>
                          <p className="text-sm text-muted-foreground break-words">{userBadge.badges?.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
                    <p className="text-muted-foreground">No badges earned yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Complete lessons to earn your first badge!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Explore Pathfinder</CardTitle>
              <CardDescription>Discover all the tools available to help you learn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild className="w-full">
                  <Link href="/courses">All Courses</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/resources">Resources</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dictionary">Dictionary</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/ai-assistant">AI Assistant</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <AccessibilityToolbar />
      </div>
    </PageWithTTS>
  )
}
