import Anthropic from '@anthropic-ai/sdk'
import type { LLMMessage, LLMCompletionOptions } from './types.js'

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'
const DEFAULT_MAX_TOKENS = 1024

let anthropicClient: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropicClient
}

export interface CompletionResult {
  content: string
  model: string
  tokenUsage: {
    input: number
    output: number
  }
}

export async function complete(
  messages: LLMMessage[],
  options: LLMCompletionOptions = {},
): Promise<CompletionResult> {
  const client = getAnthropicClient()

  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = DEFAULT_MAX_TOKENS, systemPrompt } = options

  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  const systemMessage = systemPrompt || messages.find((m) => m.role === 'system')?.content

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemMessage,
    messages: anthropicMessages,
  })

  const textContent = response.content.find((block) => block.type === 'text')
  const content = textContent?.type === 'text' ? textContent.text : ''

  return {
    content,
    model: response.model,
    tokenUsage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  }
}

export async function completeWithJson<T>(
  messages: LLMMessage[],
  options: LLMCompletionOptions = {},
): Promise<{ parsed: T; raw: CompletionResult }> {
  const enhancedSystemPrompt = `${options.systemPrompt || ''}

IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, just raw JSON.`

  const result = await complete(messages, {
    ...options,
    systemPrompt: enhancedSystemPrompt,
  })

  const parsed = JSON.parse(result.content) as T

  return { parsed, raw: result }
}
