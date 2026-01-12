import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SkipLink } from "@/components/skip-link"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { BookOpen, MessageSquare, Award, Accessibility, Brain, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="w-full border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-4" role="navigation" aria-label="Main navigation">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-500" aria-hidden="true" />
                <span className="text-xl font-bold text-white">Pathfinder</span>
              </Link>
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-slate-800">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        </header>

        <main id="main-content">
          <section className="text-center py-20 sm:py-28 lg:py-32 px-4">
            <div className="container mx-auto max-w-5xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6 leading-tight">
                <span className="text-white">Learn Your Rights,</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Find Your Voice
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 text-balance max-w-3xl mx-auto mb-10">
                Pathfinder is an accessible learning platform that empowers individuals with disabilities to understand
                and advocate for their rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 bg-white text-slate-900 hover:bg-slate-100 w-full sm:w-auto"
                >
                  <Link href="/auth/sign-up">Start Learning Free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-slate-600 text-white hover:bg-slate-800 w-full sm:w-auto bg-transparent"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </section>

          <section id="features" className="pb-20 px-4" aria-label="Features">
            <div className="container mx-auto max-w-7xl">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Interactive Lessons */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10"
                    aria-hidden="true"
                  >
                    <BookOpen className="h-7 w-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Interactive Lessons</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Engaging courses designed to teach disability rights in an accessible, easy-to-understand format.
                  </p>
                </Card>

                {/* AI Assistant */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10"
                    aria-hidden="true"
                  >
                    <MessageSquare className="h-7 w-7 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">AI Assistant</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Get instant answers and guidance from our AI-powered assistant available 24/7.
                  </p>
                </Card>

                {/* Earn Rewards */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10"
                    aria-hidden="true"
                  >
                    <Award className="h-7 w-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Earn Rewards</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Track your progress, earn badges, and unlock achievements as you learn.
                  </p>
                </Card>

                {/* Fully Accessible */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10"
                    aria-hidden="true"
                  >
                    <Accessibility className="h-7 w-7 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Fully Accessible</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Easy Read mode, high contrast themes, text-to-speech, and more accessibility features.
                  </p>
                </Card>

                {/* Flashcard Practice */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/10"
                    aria-hidden="true"
                  >
                    <Brain className="h-7 w-7 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Flashcard Practice</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Reinforce your learning with interactive flashcards and spaced repetition.
                  </p>
                </Card>

                {/* Track Progress */}
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 p-6 backdrop-blur-sm">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10"
                    aria-hidden="true"
                  >
                    <TrendingUp className="h-7 w-7 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Track Progress</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Monitor your learning journey with detailed analytics and progress tracking.
                  </p>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <footer
          className="w-full border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-12"
          role="contentinfo"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-slate-400">
              <p>© 2025 Pathfinder | Made by PHS and Pathfinder</p>
            </div>
          </div>
        </footer>
      </div>
      <AccessibilityToolbar />
    </>
  )
}
