import Anthropic from '@anthropic-ai/sdk'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export type Message = {
  role: 'user' | 'assistant'
  content: string | Anthropic.ContentBlock[]
}

export async function callClaude(
  messages: Message[],
  tools: Tool[],
  systemPrompt: string,
  signal?: AbortSignal
): Promise<Anthropic.Message> {
  return client.messages.create(
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      tools,
    },
    { signal }
  )
}
