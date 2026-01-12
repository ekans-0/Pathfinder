"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from "@/components/mobile-nav"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Settings, User, LogOut, BookOpen, Award, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AppHeaderProps {
  profile: Profile
}

export function AppHeader({ profile }: AppHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <BookOpen
                className="h-6 w-6 text-primary transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="text-xl font-bold text-primary">Pathfinder</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>
            <Link href="/courses" className="text-sm font-medium transition-colors hover:text-primary">
              Courses
            </Link>
            <Link href="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
              Analytics
            </Link>
            <Link href="/resources" className="text-sm font-medium transition-colors hover:text-primary">
              Resources
            </Link>
            <Link href="/dictionary" className="text-sm font-medium transition-colors hover:text-primary">
              Dictionary
            </Link>
            <Link href="/flashcards" className="text-sm font-medium transition-colors hover:text-primary">
              Flashcards
            </Link>
            <Link href="/ai-assistant" className="text-sm font-medium transition-colors hover:text-primary">
              AI Assistant
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground" aria-label={`Level ${profile.level}`}>
                  Lvl {profile.level}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium" aria-label={`${profile.experience_points} experience points`}>
                  {profile.experience_points} XP
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <User className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.display_name}</p>
                    <p className="text-xs text-muted-foreground break-all">{profile.email}</p>
                    <p className="text-xs text-muted-foreground sm:hidden mt-2">
                      Level {profile.level} • {profile.experience_points} XP
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/achievements" className="cursor-pointer">
                    <Award className="mr-2 h-4 w-4" aria-hidden="true" />
                    Achievements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
