import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, PlayCircle } from 'lucide-react';
import Link from "next/link";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
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

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    redirect("/courses");
  }

  // Get lessons for this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index");

  // Get user's progress for these lessons
  const { data: userProgress } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  const progressMap = userProgress?.reduce((acc: any, progress: any) => {
    acc[progress.lesson_id] = progress;
    return acc;
  }, {});

  const completedCount = userProgress?.filter((p: any) => p.status === "completed").length || 0;
  const totalLessons = lessons?.length || 0;
  const courseProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{course.icon || '📚'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 'secondary'}>
                  {course.difficulty_level}
                </Badge>
              </div>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
          </div>

          {courseProgress > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm font-medium">{completedCount} / {totalLessons} lessons</span>
                </div>
                <Progress value={courseProgress} className="h-2" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Lessons</h2>
          {lessons?.map((lesson: any, index: number) => {
            const progress = progressMap?.[lesson.id];
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";

            return (
              <Card key={lesson.id} className={isCompleted ? "bg-muted/30" : ""}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : isInProgress ? (
                        <PlayCircle className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Lesson {index + 1}</span>
                        {lesson.duration && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration} min</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                      {progress && (
                        <Progress value={progress.completion_percentage} className="mb-3" />
                      )}
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href={`/lessons/${lesson.id}`}>
                            {isCompleted ? "Review" : isInProgress ? "Continue" : "Start Lesson"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
