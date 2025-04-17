"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { UrlPanel } from "./steps/url-panel"
import { SetupHeader } from "./header"
import { OnboardingStep } from "./setup.type"
import { ConfigureStep } from "./steps/configure"
import { IChatbotContext, IChatbotConfigs } from "@/types/data.types"
import { ShareStep } from "./steps/share"
export function SetupPanel() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("url");
  const [error, setError] = useState<string | null>(null)
  const [context, setContext] = useState<IChatbotContext | null>(null)

  const handleUrlComplete = () => {
    setCurrentStep('configure')
  }

  const handleConfigureSubmit = (context: IChatbotContext) => {
    setContext(context)
    setCurrentStep('share')
  }


  return (
    <div className="w-full max-w-md">
      <div className="px-6 mb-2">
        <SetupHeader currentStep={currentStep} onStepClick={setCurrentStep} />
      </div>

      <div className="h-[500px] flex flex-col glass-panel subtle-shadow rounded-2xl p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === "url" && (
            <UrlPanel onComplete={handleUrlComplete}/>
          )}
          {currentStep === "configure" && (
            <ConfigureStep onSubmit={handleConfigureSubmit}/>
          )}
          {currentStep === "share" && context && (
            <ShareStep key="share" context={context} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
