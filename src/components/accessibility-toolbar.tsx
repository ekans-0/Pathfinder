"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accessibility, Volume2, VolumeX, Type, Contrast, Moon, Sun, AlignLeft, Scaling as Spacing, Settings } from 'lucide-react';
import { useAccessibility } from "@/lib/hooks/use-accessibility";

export function AccessibilityToolbar() {
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
    reduceMotion,
    toggleReduceMotion,
  } = useAccessibility();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Accessibility options"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 max-h-[80vh] overflow-y-auto">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Accessibility Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Appearance
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={toggleDarkMode}>
            {darkMode ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Display Mode
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("standard")}>
            <Contrast className="mr-2 h-4 w-4" />
            Standard
            {theme === "standard" && " ✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("easy-read")}>
            <Type className="mr-2 h-4 w-4" />
            Easy Read
            {theme === "easy-read" && " ✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("high-contrast")}>
            <Contrast className="mr-2 h-4 w-4" />
            High Contrast
            {theme === "high-contrast" && " ✓"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Text Size
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTextSize("small")}>
            <Type className="mr-2 h-3 w-3" />
            Small {textSize === "small" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTextSize("medium")}>
            <Type className="mr-2 h-4 w-4" />
            Medium {textSize === "medium" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTextSize("large")}>
            <Type className="mr-2 h-5 w-5" />
            Large {textSize === "large" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTextSize("extra-large")}>
            <Type className="mr-2 h-6 w-6" />
            Extra Large {textSize === "extra-large" && "✓"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Font Options
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={toggleDyslexicFont}>
            <Type className="mr-2 h-4 w-4" />
            Dyslexic Font
            {dyslexicFont && " ✓"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Line Spacing
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setLineSpacing("normal")}>
            <AlignLeft className="mr-2 h-4 w-4" />
            Normal {lineSpacing === "normal" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLineSpacing("relaxed")}>
            <AlignLeft className="mr-2 h-4 w-4" />
            Relaxed {lineSpacing === "relaxed" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLineSpacing("loose")}>
            <AlignLeft className="mr-2 h-4 w-4" />
            Loose {lineSpacing === "loose" && "✓"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Letter Spacing
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setLetterSpacing("normal")}>
            <Spacing className="mr-2 h-4 w-4" />
            Normal {letterSpacing === "normal" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLetterSpacing("wide")}>
            <Spacing className="mr-2 h-4 w-4" />
            Wide {letterSpacing === "wide" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLetterSpacing("wider")}>
            <Spacing className="mr-2 h-4 w-4" />
            Wider {letterSpacing === "wider" && "✓"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Media Controls
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={toggleAudio}>
            {audioEnabled ? (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Audio On
              </>
            ) : (
              <>
                <VolumeX className="mr-2 h-4 w-4" />
                Audio Off
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleReduceMotion}>
            <Settings className="mr-2 h-4 w-4" />
            Reduce Motion
            {reduceMotion && " ✓"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
