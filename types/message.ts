import type { RagState } from "@/hooks/use-rag"

// Messages just wrap the RAG state with metadata
export interface BaseMessage {
  id: string
  timestamp: number
  role: "user" | "assistant"
}

export interface UserMessage extends BaseMessage {
  role: "user"
  content: string
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant"
  content: RagState  // Directly use the RAG state!
}

export type Message = UserMessage | AssistantMessage

// Type guards
export function isAssistantMessage(message: Message): message is AssistantMessage {
  return message.role === "assistant"
}

export function isUserMessage(message: Message): message is UserMessage {
  return message.role === "user"
} 