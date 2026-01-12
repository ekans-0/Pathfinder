"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccessibility } from "@/lib/hooks/use-accessibility"

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const {
    darkMode,
    toggleDarkMode,
    theme,
    setTheme,
    textSize,
    setTextSize,
    dyslexicFont,
    toggleDyslexicFont,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    audioEnabled,
    toggleAudio,
    captionsEnabled,
    toggleCaptions,
    reduceMotion,
    toggleReduceMotion,
  } = useAccessibility()

  const handleSave = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          dark_mode: darkMode,
          display_mode: theme,
          text_size: textSize,
          dyslexic_font: dyslexicFont,
          line_spacing: lineSpacing,
          letter_spacing: letterSpacing,
          tts_enabled: audioEnabled,
          reduce_motion: reduceMotion,
        })
        .eq("id", profile.id)

      if (error) throw error

      setMessage("Settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Failed to save settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name and email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Preferences</CardTitle>
          <CardDescription>Customize how content is displayed and experienced</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark color scheme</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {/* Display Mode */}
          <div className="space-y-2">
            <Label htmlFor="theme">Display Mode</Label>
            <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="easy-read">Easy Read</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Easy Read uses simpler language. High Contrast improves visibility.
            </p>
          </div>

          {/* Text Size */}
          <div className="space-y-2">
            <Label htmlFor="text-size">Text Size</Label>
            <Select value={textSize} onValueChange={(value: any) => setTextSize(value)}>
              <SelectTrigger id="text-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dyslexic Font */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dyslexic-font">Dyslexic-Friendly Font</Label>
              <p className="text-sm text-muted-foreground">Use OpenDyslexic font for better readability</p>
            </div>
            <Switch id="dyslexic-font" checked={dyslexicFont} onCheckedChange={toggleDyslexicFont} />
          </div>

          {/* Line Spacing */}
          <div className="space-y-2">
            <Label htmlFor="line-spacing">Line Spacing</Label>
            <Select value={lineSpacing} onValueChange={(value: any) => setLineSpacing(value)}>
              <SelectTrigger id="line-spacing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Increased spacing can improve readability</p>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label htmlFor="letter-spacing">Letter Spacing</Label>
            <Select value={letterSpacing} onValueChange={(value: any) => setLetterSpacing(value)}>
              <SelectTrigger id="letter-spacing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="wider">Wider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text-to-Speech */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audio">Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">Enable audio narration for lessons</p>
            </div>
            <Switch id="audio" checked={audioEnabled} onCheckedChange={toggleAudio} />
          </div>

          {/* Captions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="captions">Captions</Label>
              <p className="text-sm text-muted-foreground">Show captions for video content</p>
            </div>
            <Switch id="captions" checked={captionsEnabled} onCheckedChange={toggleCaptions} />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={toggleReduceMotion} />
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes("success")
              ? "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800"
              : "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={isLoading} size="lg" className="w-full">
        {isLoading ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  )
}
