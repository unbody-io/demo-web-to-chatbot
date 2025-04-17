"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, FileText, Database, Sparkles } from "lucide-react"
import { useEventStream } from "@/hooks/use-event-stream"
import { StreamEventMessageType, StreamEventTypes_Setup_Create } from "@/types/api.types"

interface EnterUrlStepProps {
  onSubmit?: (url: string) => void
  onComplete?: () => void
}

type Step = {
  label: string
  icon: React.ElementType
  status: StreamEventTypes_Setup_Create
}

const steps: Step[] = [
  { label: "Warming up...", icon: Globe, status: StreamEventTypes_Setup_Create.Init },
  { label: "Reading pages...", icon: Globe, status: StreamEventTypes_Setup_Create.Crawling },
  { label: "Building knowledge base...", icon: FileText, status: StreamEventTypes_Setup_Create.Indexing },
  { label: "Creating persona...", icon: Sparkles, status: StreamEventTypes_Setup_Create.Context },
]

interface SubmitFormProps {
  onSubmit: (url: string) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const SubmitForm = ({ onSubmit, onChange }: SubmitFormProps) => {
  const [url, setUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  return (
    <motion.form
      key="url-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="space-y-2 text-left">
        <label htmlFor="website-url" className="text-xs block text-muted-foreground">
          Website URL
        </label>
        <Input
          id="website-url"
          type="text"
          value={url || ""}
          onChange={handleUrlChange}
          placeholder="https://example.com"
          className="w-full text-xs h-8 px-2 py-1"
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="mt-4">
        <Button
          type="submit"
          size="sm"
          disabled={!url || !!error}
          className="h-7 text-xs px-3"
        >
          Start
        </Button>
      </div>
    </motion.form>
  )
}

export function UrlPanel({ onSubmit, onComplete }: EnterUrlStepProps) {
  const [url, setUrl] = useState<string>("")
  
  const [error, setError] = useState<string>("")
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [submitted, setSubmitted] = useState<boolean>(false)
  
  const { data: setupData, error: setupError } = useEventStream<StreamEventTypes_Setup_Create, any>(
    url ? `/api/setup/create?url=${encodeURIComponent(url)}` : null
  );

  useEffect(() => {
    if (setupData) {
      const { status, message, payload } = setupData;
      const currentStep = steps[currentStepIndex];

      if(status === StreamEventTypes_Setup_Create.Finished){
        onComplete?.()
      }else if(status === StreamEventTypes_Setup_Create.Error){
        setError(message)
      }else if(currentStep.status === status && message === StreamEventMessageType.Done){
        setCurrentStepIndex(Math.min(currentStepIndex + 1, steps.length - 1))
      }
    }
  }, [setupData]);

  const handleSubmit = (url: string) => {
    setUrl(url)
    setSubmitted(true)
    onSubmit?.(url)
  }

  // Choose the icon corresponding to the current step.
  const CurrentIcon = steps[currentStepIndex].icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-[240px]">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="text-xs mb-3 text-left text-muted-foreground">
                <p>
                  Processing <span className="font-medium text-foreground">{url}</span>
                </p>
              </div>
              <div className="flex items-center py-1.5 w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`icon-${currentStepIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="mr-2 flex-shrink-0"
                  >
                    <CurrentIcon className="w-3.5 h-3.5" />
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`label-${currentStepIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shimmer-text shimmer-text-active text-xs font-medium truncate"
                  >
                    {steps[currentStepIndex].label}
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* {showDelayMessage && (
                <div className="mt-2 text-xs text-red-500 text-center">
                  This is taking longer than expected...
                </div>
              )} */}
            </motion.div>
          ) : (
            <SubmitForm onSubmit={handleSubmit}/>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
