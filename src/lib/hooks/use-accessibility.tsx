"use client"

import { createClient } from "@/lib/supabase/client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

interface AccessibilityState {
  darkMode: boolean
  theme: "standard" | "easy-read" | "high-contrast"
  textSize: "small" | "medium" | "large" | "extra-large"
  dyslexicFont: boolean
  lineSpacing: "normal" | "relaxed" | "loose"
  letterSpacing: "normal" | "wide" | "wider"
  audioEnabled: boolean
  captionsEnabled: boolean
  reduceMotion: boolean

  toggleDarkMode: () => void
  setTheme: (theme: AccessibilityState["theme"]) => void
  setTextSize: (size: AccessibilityState["textSize"]) => void
  toggleDyslexicFont: () => void
  setLineSpacing: (spacing: AccessibilityState["lineSpacing"]) => void
  setLetterSpacing: (spacing: AccessibilityState["letterSpacing"]) => void
  toggleAudio: () => void
  toggleCaptions: () => void
  toggleReduceMotion: () => void
  syncWithProfile: (profile: any) => void
  saveToProfile: () => void
  applySettings: () => void
}

export const useAccessibility = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      theme: "standard",
      textSize: "medium",
      dyslexicFont: false,
      lineSpacing: "normal",
      letterSpacing: "normal",
      audioEnabled: true,
      captionsEnabled: true,
      reduceMotion: false,

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode
          if (typeof window !== "undefined") {
            if (newDarkMode) {
              document.documentElement.classList.add("dark")
            } else {
              document.documentElement.classList.remove("dark")
            }
          }
          return { darkMode: newDarkMode }
        })
        get().saveToProfile()
      },

      setTheme: (theme) => {
        set({ theme })
        get().applySettings()
        get().saveToProfile()
      },

      setTextSize: (textSize) => {
        set({ textSize })
        get().applySettings()
        get().saveToProfile()
      },

      toggleDyslexicFont: () => {
        set((state) => ({ dyslexicFont: !state.dyslexicFont }))
        get().applySettings()
        get().saveToProfile()
      },

      setLineSpacing: (lineSpacing) => {
        set({ lineSpacing })
        get().applySettings()
        get().saveToProfile()
      },

      setLetterSpacing: (letterSpacing) => {
        set({ letterSpacing })
        get().applySettings()
        get().saveToProfile()
      },

      toggleAudio: () => {
        set((state) => ({ audioEnabled: !state.audioEnabled }))
        get().saveToProfile()
      },

      toggleCaptions: () => {
        set((state) => ({ captionsEnabled: !state.captionsEnabled }))
        get().saveToProfile()
      },

      toggleReduceMotion: () => {
        set((state) => ({ reduceMotion: !state.reduceMotion }))
        get().applySettings()
        get().saveToProfile()
      },

      syncWithProfile: (profile) => {
        if (profile) {
          set({
            darkMode: profile.dark_mode ?? false,
            theme: profile.theme_preference,
            textSize: profile.text_size_preference,
            dyslexicFont: profile.dyslexic_font ?? false,
            lineSpacing: profile.line_spacing ?? "normal",
            letterSpacing: profile.letter_spacing ?? "normal",
            audioEnabled: profile.audio_enabled,
            captionsEnabled: profile.captions_enabled,
            reduceMotion: profile.reduce_motion ?? false,
          })
          get().applySettings()
        }
      },

      saveToProfile: async () => {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const state = get()
          await supabase
            .from("profiles")
            .update({
              dark_mode: state.darkMode,
              theme_preference: state.theme,
              text_size_preference: state.textSize,
              dyslexic_font: state.dyslexicFont,
              line_spacing: state.lineSpacing,
              letter_spacing: state.letterSpacing,
              audio_enabled: state.audioEnabled,
              captions_enabled: state.captionsEnabled,
              reduce_motion: state.reduceMotion,
            })
            .eq("id", user.id)
        }
      },

      applySettings: () => {
        if (typeof window === "undefined") return

        const state = get()
        const html = document.documentElement
        const body = document.body

        if (state.darkMode) {
          html.classList.add("dark")
        } else {
          html.classList.remove("dark")
        }

        // Theme mode
        body.classList.remove("easy-read-mode", "high-contrast-mode")
        if (state.theme === "easy-read") {
          body.classList.add("easy-read-mode")
        } else if (state.theme === "high-contrast") {
          body.classList.add("high-contrast-mode")
        }

        // Text size
        body.classList.remove("text-size-small", "text-size-medium", "text-size-large", "text-size-extra-large")
        body.classList.add(`text-size-${state.textSize}`)

        // Dyslexic font
        if (state.dyslexicFont) {
          body.classList.add("dyslexic-font")
        } else {
          body.classList.remove("dyslexic-font")
        }

        // Line spacing
        body.classList.remove("line-spacing-normal", "line-spacing-relaxed", "line-spacing-loose")
        body.classList.add(`line-spacing-${state.lineSpacing}`)

        // Letter spacing
        body.classList.remove("letter-spacing-normal", "letter-spacing-wide", "letter-spacing-wider")
        body.classList.add(`letter-spacing-${state.letterSpacing}`)
      },
    }),
    {
      name: "accessibility-storage",
    },
  ),
)

export function useAccessibilityInit() {
  const applySettings = useAccessibility((state) => state.applySettings)

  useEffect(() => {
    applySettings()
  }, [applySettings])
}
