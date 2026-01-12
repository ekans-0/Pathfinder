import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Clock, Target, Zap } from "lucide-react"

export default async function FlashcardSettingsPage() {
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
      .single();
    
    if (createError || !newProfile) {
      console.error("Error creating profile:", createError);
      redirect("/auth/login");
      return null;
    }
    
    redirect("/onboarding");
    return null;
  }

  // Get detailed statistics
  const { data: stats } = await supabase
    .from("user_flashcard_progress")
    .select("confidence_level, times_reviewed, interval_days, ease_factor")
    .eq("user_id", user.id)

  const totalCards = stats?.length || 0
  const masteredCards = stats?.filter((s) => s.confidence_level >= 4).length || 0
  const learningCards = stats?.filter((s) => s.confidence_level >= 2 && s.confidence_level < 4).length || 0
  const newCards = stats?.filter((s) => s.confidence_level < 2).length || 0
  const totalReviews = stats?.reduce((sum, s) => sum + s.times_reviewed, 0) || 0
  const avgEaseFactor =
    stats && stats.length > 0
      ? (stats.reduce((sum, s) => sum + (s.ease_factor || 2.5), 0) / stats.length).toFixed(2)
      : "2.50"

  // Calculate cards due today
  const { data: dueCards } = await supabase
    .from("user_flashcard_progress")
    .select("id")
    .eq("user_id", user.id)
    .lte("next_review_at", new Date().toISOString())

  const dueTodayCount = dueCards?.length || 0

  // Get longest streak
  const { data: reviewHistory } = await supabase
    .from("user_flashcard_progress")
    .select("last_reviewed_at")
    .eq("user_id", user.id)
    .not("last_reviewed_at", "is", null)
    .order("last_reviewed_at", { ascending: false })

  let currentStreak = 0
  let longestStreak = 0
  let streakCount = 0
  let lastDate: Date | null = null

  reviewHistory?.forEach((review) => {
    const reviewDate = new Date(review.last_reviewed_at)
    if (!lastDate) {
      streakCount = 1
      lastDate = reviewDate
    } else {
      const daysDiff = Math.floor((lastDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff <= 1) {
        streakCount++
      } else {
        longestStreak = Math.max(longestStreak, streakCount)
        streakCount = 1
      }
      lastDate = reviewDate
    }
  })

  if (lastDate) {
    const today = new Date()
    const daysSinceLastReview = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceLastReview <= 1) {
      currentStreak = streakCount
    }
  }
  longestStreak = Math.max(longestStreak, streakCount)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Flashcard Statistics</h1>
          <p className="text-muted-foreground">Track your learning progress and retention</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground mt-1">Cards in your study queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dueTodayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Cards ready for review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Times you've practiced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{longestStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Best performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Ease Factor</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgEaseFactor}</div>
              <p className="text-xs text-muted-foreground mt-1">Learning efficiency</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Your flashcard mastery breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Mastered</Badge>
                  <span className="text-sm font-medium">{masteredCards} cards</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%
                </span>
              </div>
              <Progress value={totalCards > 0 ? (masteredCards / totalCards) * 100 : 0} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Learning</Badge>
                  <span className="text-sm font-medium">{learningCards} cards</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalCards > 0 ? Math.round((learningCards / totalCards) * 100) : 0}%
                </span>
              </div>
              <Progress value={totalCards > 0 ? (learningCards / totalCards) * 100 : 0} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">New</Badge>
                  <span className="text-sm font-medium">{newCards} cards</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalCards > 0 ? Math.round((newCards / totalCards) * 100) : 0}%
                </span>
              </div>
              <Progress value={totalCards > 0 ? (newCards / totalCards) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About the Learning System</CardTitle>
            <CardDescription>How adaptive flashcards work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Spaced Repetition</h4>
              <p className="text-muted-foreground">
                Our system uses spaced repetition to help you remember information longer. Cards you know well are shown
                less frequently, while challenging cards appear more often.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Confidence Levels</h4>
              <p className="text-muted-foreground">
                Each card has a confidence level from 0-5. Mark cards as "Got It!" to increase confidence, or "Need
                Practice" to review them sooner.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ease Factor</h4>
              <p className="text-muted-foreground">
                The ease factor determines how quickly intervals between reviews increase. A higher ease factor means
                you're retaining information well.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Daily Practice</h4>
              <p className="text-muted-foreground">
                Review your due cards daily to build streaks and improve retention. Consistency is key to mastering the
                material!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <AccessibilityToolbar />
    </div>
  )
}
