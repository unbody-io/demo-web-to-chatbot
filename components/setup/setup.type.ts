export type OnboardingStep = "url" | "configure" | "share"

export interface KnowledgeBase {
    summary: string | null
    numPages: number
}

export interface ProgressItem {
  id: string
  label: string
  status: "pending" | "active" | "completed"
}