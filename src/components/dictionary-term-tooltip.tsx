"use client"

import type React from "react"

import { useState } from "react"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

interface DictionaryTermTooltipProps {
  term: string
  definition: string
  easyReadDefinition?: string
  example?: string
  children: React.ReactNode
}

export function DictionaryTermTooltip({
  term,
  definition,
  easyReadDefinition,
  example,
  children,
}: DictionaryTermTooltipProps) {
  const [open, setOpen] = useState(false)
  const { theme } = useAccessibility()

  const displayDefinition = theme === "easy-read" && easyReadDefinition ? easyReadDefinition : definition

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <span
            className="font-semibold underline decoration-dotted decoration-2 underline-offset-2 cursor-help text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            role="button"
            tabIndex={0}
            aria-label={`Definition of ${term}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setOpen(!open)
              }
            }}
          >
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="z-50 max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-slate-700 dark:bg-slate-800"
            sideOffset={5}
            side="top"
          >
            <div className="space-y-2">
              <div className="font-bold text-blue-600 dark:text-blue-400">{term}</div>
              <div className="text-slate-700 dark:text-slate-300">{displayDefinition}</div>
              {example && theme !== "easy-read" && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  Example: {example}
                </div>
              )}
            </div>
            <TooltipPrimitive.Arrow className="fill-white dark:fill-slate-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
