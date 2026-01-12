import { createClient } from "@/lib/supabase/server"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, useEasyRead } = await request.json()

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    const { data: recentMessages } = await supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const chatHistory = recentMessages?.reverse() || []

    const systemPrompt = useEasyRead
      ? `You are a helpful AI assistant for Pathfinder, a disability rights education platform. You help people with disabilities learn about their rights.

IMPORTANT: Use SIMPLE, EASY-TO-READ language. Follow these rules:
- Use SHORT sentences (10 words or less when possible)
- Use SIMPLE words (avoid complex vocabulary)
- Break complex ideas into small, numbered steps
- Use examples from everyday life
- Be encouraging and supportive
- Avoid legal jargon - use plain language
- Use bullet points and lists
- Repeat key ideas if needed

Your job is to:
1. Answer questions about disability rights in simple terms
2. Explain the ADA and other disability laws clearly
3. Help users understand their rights at work, school, and home
4. Teach self-advocacy skills
5. Provide encouragement and empowerment
6. Give practical examples

Always be patient, kind, and respectful. Celebrate their questions!`
      : `You are an expert AI assistant for Pathfinder, a disability rights education platform. You help people with disabilities learn about their rights, understand laws, and develop self-advocacy skills.

Your expertise includes:
- The Americans with Disabilities Act (ADA) and all five titles
- Section 504 of the Rehabilitation Act
- Fair Housing Act (FHA)
- Individuals with Disabilities Education Act (IDEA)
- Employment rights and reasonable accommodations
- Education rights (IEPs, 504 plans, FAPE)
- Housing rights and accessibility requirements
- Healthcare rights and informed consent
- Self-advocacy and communication strategies
- Accessibility standards and universal design
- Legal rights and complaint procedures
- Community integration and independent living

Your role is to:
1. Provide accurate, detailed information about disability rights
2. Explain legal concepts in accessible language
3. Give practical examples and real-world scenarios
4. Suggest concrete action steps users can take
5. Empower users to advocate for themselves
6. Be supportive, respectful, and encouraging
7. Answer follow-up questions with patience

Keep responses informative but concise (under 500 words when possible). Use bullet points, examples, and clear structure. Always end with encouragement or a helpful next step.`

    await supabase.from("ai_chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: message,
    })

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: [
        ...chatHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      maxTokens: 800,
    })

    result.then(async (stream) => {
      const fullText = await stream.text
      await supabase.from("ai_chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: fullText,
      })
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Error in AI assistant:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
