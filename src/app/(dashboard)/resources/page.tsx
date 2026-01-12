import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Phone, FileText, Video, Building2, Globe } from "lucide-react"
import Link from "next/link"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { AppHeader } from "@/components/app-header"
import { redirect } from "next/navigation"

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
  
  if (!profile) {
    redirect("/onboarding")
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("title")

  const categories = [
    { value: "all", label: "All Resources" },
    { value: "legal", label: "Legal" },
    { value: "advocacy", label: "Advocacy" },
    { value: "support", label: "Support" },
    { value: "employment", label: "Employment" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "housing", label: "Housing" },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "website":
        return Globe
      case "document":
        return FileText
      case "video":
        return Video
      case "organization":
        return Building2
      case "hotline":
        return Phone
      default:
        return ExternalLink
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <AppHeader profile={profile} />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Resources</h1>

            <p className="text-lg text-muted-foreground max-w-3xl">
              Find helpful organizations, websites, hotlines, and materials to support your disability rights journey.
            </p>
          </div>

          <div className="grid gap-6">
            {resources?.map((resource) => {
              const Icon = getIcon(resource.resource_type)
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mt-1">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-2 break-words">{resource.title}</CardTitle>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {resource.is_featured && <Badge variant="default">Featured</Badge>}
                            <Badge variant="secondary">{resource.category}</Badge>
                            <Badge variant="outline">{resource.resource_type}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">{resource.description}</CardDescription>
                    {resource.easy_read_description && (
                      <div className="mb-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-2">Easy Read:</p>
                        <p className="text-sm">{resource.easy_read_description}</p>
                      </div>
                    )}
                    <Button asChild>
                      <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                        Visit Resource
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {(!resources || resources.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No resources found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AccessibilityToolbar />
    </>
  )
}
