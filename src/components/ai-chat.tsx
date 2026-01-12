"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { Bot, Send, User, Loader2, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAccessibility } from "@/lib/hooks/use-accessibility"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface AIChatProps {
  initialMessages: Message[]
  userId: string
}

export function AIChat({ initialMessages, userId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { theme } = useAccessibility()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          useEasyRead: theme === "easy-read",
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          fullResponse += chunk

          // Update the assistant message in real-time
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: fullResponse } : msg)),
          )
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: "I'm sorry, I'm having trouble responding right now. Please try again.",
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (confirm("Are you sure you want to clear all messages?")) {
      await supabase.from("ai_chat_messages").delete().eq("user_id", userId)
      setMessages([])
    }
  }

  return (
    <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto">
      <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <Card className="p-8 text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Hi! I'm your AI Assistant</h3>
              <p className="text-muted-foreground mb-4">
                I can help you learn about disability rights, answer questions, and explain concepts in simple terms.
              </p>
              <div className="text-sm text-muted-foreground text-left max-w-md mx-auto">
                <p className="font-medium mb-2">Try asking me:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>What is the ADA?</li>
                  <li>What are my rights at work?</li>
                  <li>How can I request accommodations?</li>
                  <li>What is self-advocacy?</li>
                  <li>What are reasonable accommodations?</li>
                  <li>How do I file a discrimination complaint?</li>
                </ul>
              </div>
            </Card>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  )}
                  <Card className={`max-w-[80%] ${message.role === "user" ? "bg-blue-600 text-white" : "bg-card"}`}>
                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content || (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking...
                          </span>
                        )}
                      </p>
                    </div>
                  </Card>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t pt-4">
        {messages.length > 0 && (
          <div className="mb-2 text-right">
            <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-muted-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about disability rights..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="lg" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </div>
  )
}
