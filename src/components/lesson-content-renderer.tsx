"use client"

import { DictionaryTermTooltip } from "./dictionary-term-tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { useAccessibility } from "@/lib/hooks/use-accessibility"

interface LessonContentRendererProps {
  content: any
  dictionaryTerms: any[]
}

export function LessonContentRenderer({ content, dictionaryTerms }: LessonContentRendererProps) {
  const { theme } = useAccessibility()

  // Helper function to wrap dictionary terms with tooltips
  const wrapDictionaryTerms = (text: string) => {
    if (!dictionaryTerms || dictionaryTerms.length === 0) return text

    let wrappedText = text
    const termMap = new Map<string, any>()

    // Create a map of terms for quick lookup
    dictionaryTerms.forEach((dt) => {
      termMap.set(dt.dictionary_terms.term.toLowerCase(), dt.dictionary_terms)
    })

    // Sort terms by length (longest first) to handle overlapping terms
    const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length)

    // Replace each term with a placeholder
    const placeholders: { placeholder: string; term: any; matchedText: string }[] = []
    sortedTerms.forEach((termKey, index) => {
      const term = termMap.get(termKey)
      const regex = new RegExp(`\\b(${termKey})\\b`, "gi")
      const matches = wrappedText.match(regex)

      if (matches) {
        matches.forEach((match, matchIndex) => {
          const placeholder = `__TERM_${index}_${matchIndex}__`
          placeholders.push({ placeholder, term, matchedText: match })
          wrappedText = wrappedText.replace(match, placeholder)
        })
      }
    })

    // Split text by placeholders
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    placeholders.forEach(({ placeholder, term, matchedText }, index) => {
      const placeholderIndex = wrappedText.indexOf(placeholder, lastIndex)
      if (placeholderIndex > lastIndex) {
        parts.push(wrappedText.substring(lastIndex, placeholderIndex))
      }

      parts.push(
        <DictionaryTermTooltip
          key={`term-${index}`}
          term={term.term}
          definition={term.definition}
          easyReadDefinition={term.easy_read_definition}
          example={term.example}
        >
          {matchedText}
        </DictionaryTermTooltip>,
      )

      lastIndex = placeholderIndex + placeholder.length
    })

    if (lastIndex < wrappedText.length) {
      parts.push(wrappedText.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case "text":
        return (
          <div key={index} className="mb-6">
            {section.heading && <h2 className="text-2xl font-bold mb-3">{section.heading}</h2>}
            <div className="text-base leading-relaxed whitespace-pre-wrap">{wrapDictionaryTerms(section.content)}</div>
          </div>
        )

      case "scenario":
        return (
          <Card key={index} className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.avatars?.map((avatar: any, avatarIndex: number) => (
                  <div key={avatarIndex} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <div className="text-4xl shrink-0" aria-hidden="true">
                      {avatar.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {avatar.name}
                        {avatar.description && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">({avatar.description})</span>
                        )}
                      </div>
                      <div className="text-base italic">&ldquo;{avatar.dialogue}&rdquo;</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "list":
        return (
          <div key={index} className="mb-6">
            {section.heading && <h3 className="text-xl font-semibold mb-3">{section.heading}</h3>}
            <ul className="list-disc list-inside space-y-2 ml-4">
              {section.items?.map((item: string, itemIndex: number) => (
                <li key={itemIndex} className="text-base leading-relaxed">
                  {wrapDictionaryTerms(item)}
                </li>
              ))}
            </ul>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      {content?.sections?.map((section: any, index: number) => renderSection(section, index))}
    </div>
  )
}
