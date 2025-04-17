import { IImageBlock } from "unbody"
import { ExtendedWebPage } from "./data.types"

export type MessageRole = "user" | "assistant"

export interface Message {
  id: string
  role: MessageRole
  content: string
  results?: {
    webResults: ExtendedWebPage[]
    imageResults: IImageBlock[]
  }
}

export interface GeneratedResponse {
  answer: string
  followups: string[]
}

export interface AssistantResponse {
  generativeResponse: {
    answer: string
    followups: string[]
  }
  webResults: ExtendedWebPage[]
  imageResults: IImageBlock[]
}

export type ProcessingStatus = "understanding" | "searching" | "thinking" | "followups" | "complete" | "idle"

