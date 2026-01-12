import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, TrendingUp, Calendar, Clock } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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

  // Get all progress data
  const { data: allProgress } = await supabase
    .from("user_lesson_progress")
    .select("*, lessons(title, courses(title, icon))")
    .eq("user_id", user.id)
    .order("last_accessed_at", { ascending: false });

  const { count: completedCount } = await supabase
    .from("user_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const { count: inProgressCount } = await supabase
    .from("user_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "in_progress");

  // Get user's badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  // Calculate total time spent
  const totalTimeSpent = allProgress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;
  const totalHours = Math.floor(totalTimeSpent / 3600);
  const totalMinutes = Math.floor((totalTimeSpent % 3600) / 60);

  // Get courses progress
  const courseProgress: { [key: string]: { completed: number; total: number; title: string; icon: string } } = {};
  
  allProgress?.forEach((progress: any) => {
    const courseId = progress.lessons?.courses?.id;
    if (!courseId) return;

    if (!courseProgress[courseId]) {
      courseProgress[courseId] = {
        completed: 0,
        total: 0,
        title: progress.lessons?.courses?.title || "",
        icon: progress.lessons?.courses?.icon || "📚",
      };
    }
    courseProgress[courseId].total++;
    if (progress.status === "completed") {
      courseProgress[courseId].completed++;
    }
  });

  const nextLevelXP = profile.level * 100;
  const progressToNextLevel = (profile.experience_points % 100);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{profile.display_name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-1">Level {profile.level}</div>
                  <Badge variant="secondary">{profile.experience_points} XP</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to Level {profile.level + 1}</span>
                  <span className="font-medium">{progressToNextLevel} / {nextLevelXP} XP</span>
                </div>
                <Progress value={(progressToNextLevel / nextLevelXP) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount || 0}</div>
                <p className="text-xs text-muted-foreground">Lessons finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressCount || 0}</div>
                <p className="text-xs text-muted-foreground">Currently learning</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`}
                </div>
                <p className="text-xs text-muted-foreground">Learning time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userBadges?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Badges earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Your progress in each course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(courseProgress).map((course: any) => {
                    const percentage = (course.completed / course.total) * 100;
                    return (
                      <div key={course.title}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{course.icon}</span>
                            <span className="font-medium">{course.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.completed}/{course.total}
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                  {Object.keys(courseProgress).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No courses started yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Badges you've earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBadges && userBadges.length > 0 ? (
                    userBadges.map((userBadge: any) => (
                      <div key={userBadge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-3xl">{userBadge.badges?.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium">{userBadge.badges?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {userBadge.badges?.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No badges earned yet. Keep learning!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allProgress && allProgress.length > 0 ? (
                  allProgress.slice(0, 10).map((progress: any) => (
                    <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{progress.lessons?.courses?.icon || "📚"}</div>
                        <div>
                          <p className="font-medium">{progress.lessons?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {progress.lessons?.courses?.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                          {progress.status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(progress.last_accessed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No activity yet. Start your first lesson!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
