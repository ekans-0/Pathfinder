"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Book, BookOpen, MessageSquare, Settings, Award, Brain, Library, BarChart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="flex flex-col gap-2 py-4" aria-label="Mobile navigation">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Book className="h-5 w-5" aria-hidden="true" />
            <span>Courses</span>
          </Link>
          <Link
            href="/analytics"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <BarChart className="h-5 w-5" aria-hidden="true" />
            <span>Analytics</span>
          </Link>
          <Link
            href="/resources"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Library className="h-5 w-5" aria-hidden="true" />
            <span>Resources</span>
          </Link>
          <Link
            href="/dictionary"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span>Dictionary</span>
          </Link>
          <Link
            href="/flashcards"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Brain className="h-5 w-5" aria-hidden="true" />
            <span>Flashcards</span>
          </Link>
          <Link
            href="/ai-assistant"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            <span>AI Assistant</span>
          </Link>
          <Link
            href="/achievements"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Award className="h-5 w-5" aria-hidden="true" />
            <span>Achievements</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
