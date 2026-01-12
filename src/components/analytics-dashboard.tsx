"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, Award, TrendingUp, CheckCircle, Target } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalyticsDashboardProps {
  profile: any
  stats: {
    totalLessonsCompleted: number
    totalLessons: number
    totalTimeSpent: number
    currentStreak: number
    longestStreak: number
    averageQuizScore: number
    badgesEarned: number
    totalBadges: number
    recentActivity: any[]
  }
}

export function AnalyticsDashboard({ profile, stats }: AnalyticsDashboardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const completionPercentage = Math.round((stats.totalLessonsCompleted / stats.totalLessons) * 100) || 0
  const hoursSpent = Math.floor(stats.totalTimeSpent / 3600)
  const minutesSpent = Math.floor((stats.totalTimeSpent % 3600) / 60)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Learning Analytics</h2>
        <p className="text-muted-foreground">Track your progress and achievements</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLessonsCompleted} / {stats.totalLessons}
            </div>
            <Progress value={completionPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{completionPercentage}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Time Spent Learning</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hoursSpent}h {minutesSpent}m
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total study time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-2">Longest: {stats.longestStreak} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.badgesEarned} / {stats.totalBadges}
            </div>
            <Progress value={(stats.badgesEarned / stats.totalBadges) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Level and XP Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>Keep learning to level up and unlock achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">Level {profile.level}</div>
                <div className="text-sm text-muted-foreground">{profile.experience_points} XP</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Next Level</div>
                <div className="text-lg font-semibold">{profile.level * 100} XP</div>
              </div>
            </div>
            <Progress value={profile.experience_points % 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {100 - (profile.experience_points % 100)} XP until Level {profile.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      {stats.averageQuizScore > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quiz Performance
            </CardTitle>
            <CardDescription>Your average quiz scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Score</span>
                <span className="text-2xl font-bold">{Math.round(stats.averageQuizScore)}%</span>
              </div>
              <Progress value={stats.averageQuizScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.completed_at).toLocaleDateString()} •{" "}
                      {Math.floor((activity.time_spent || 0) / 60)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
