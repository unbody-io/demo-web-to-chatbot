"use client"

import { OnboardingStep } from "./setup.type"

interface WebsiteChatbotOnboardingHeaderProps {
  currentStep: OnboardingStep
  onStepClick?: (step: OnboardingStep) => void
}

export function SetupHeader({ currentStep, onStepClick }: WebsiteChatbotOnboardingHeaderProps) {
  const steps: OnboardingStep[] = ["url", "configure", "share"]
  const currentIndex = steps.indexOf(currentStep)

  const stepTitles: Record<OnboardingStep, string> = {
    url: "Enter Website URL",
    configure: "Configure Chatbot",
    share: "Share Your Chatbot",
  }

  const handleStepClick = (step: OnboardingStep, index: number) => {
    if (onStepClick) {
      onStepClick(step)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xs text-muted-foreground">{stepTitles[currentStep]}</h3>
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`w-5 h-0.5 rounded-full cursor-pointer ${
              index === currentIndex
                ? "bg-foreground"
                : index < currentIndex
                  ? "bg-foreground/50"
                  : "bg-muted-foreground/30"
            }`}
            onClick={() => handleStepClick(step, index)}
          />
        ))}
      </div>
    </div>
  )
}
