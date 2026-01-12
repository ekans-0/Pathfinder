import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock } from 'lucide-react';

export default async function AchievementsPage() {
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

  // Get all badges
  const { data: allBadges } = await supabase
    .from("badges")
    .select("*")
    .order("requirement_value");

  // Get user's earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

  const earnedBadgeIds = new Set(earnedBadges?.map((b: any) => b.badge_id) || []);
  const earnedBadgeMap = earnedBadges?.reduce((acc: any, b: any) => {
    acc[b.badge_id] = b.earned_at;
    return acc;
  }, {});

  // Get user's current stats
  const { count: completedLessons } = await supabase
    .from("user_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const userStats = {
    lessons_completed: completedLessons || 0,
    xp_earned: profile.experience_points,
    streak_days: 0, // Would need to implement streak tracking
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Achievements</h1>
          <p className="text-muted-foreground">
            Unlock badges by completing lessons and earning XP
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              {earnedBadges?.length || 0} of {allBadges?.length || 0} badges earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={allBadges?.length ? ((earnedBadges?.length || 0) / allBadges.length) * 100 : 0} 
              className="h-3"
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allBadges?.map((badge: any) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedDate = earnedBadgeMap?.[badge.id];
            const currentValue = userStats[badge.requirement_type as keyof typeof userStats] || 0;
            const progressPercent = Math.min((currentValue / badge.requirement_value) * 100, 100);

            return (
              <Card key={badge.id} className={isEarned ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-4xl ${!isEarned && "grayscale"}`}>
                      {badge.icon}
                    </div>
                    {isEarned ? (
                      <Badge className="bg-green-600">Earned</Badge>
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEarned ? (
                    <p className="text-sm text-muted-foreground">
                      Earned on {new Date(earnedDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {currentValue} / {badge.requirement_value}
                        </span>
                      </div>
                      <Progress value={progressPercent} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
