"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Sparkles } from "lucide-react"

interface QuestionsSectionProps {
  starterQuestions: string[] | null
  setStarterQuestions: (questions: string[]) => void
}

export function QuestionsSection({ starterQuestions, setStarterQuestions }: QuestionsSectionProps) {
  const [newQuestion, setNewQuestion] = useState("")

  if (!starterQuestions) {
    return null
  }

  const addQuestion = () => {
    if (newQuestion.trim() && starterQuestions.length < 5) {
      setStarterQuestions([...starterQuestions, newQuestion.trim()])
      setNewQuestion("")
    }
  }

  const removeQuestion = (index: number) => {
    setStarterQuestions(starterQuestions.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addQuestion()
    }
  }

  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm flex items-center gap-1.5">
          <Sparkles size={14} className="text-muted-foreground" />
          <span>Starter Questions</span>
        </label>
        <div className="text-xs text-muted-foreground">{starterQuestions.length}/5</div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {starterQuestions.map((question, index) => (
            <motion.div
              key={question}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group relative bg-muted/100 border border-border/30 rounded-sm p-2 pr-10 hover:border-border/50 transition-colors"
            >
              <p className="text-xs">{question}</p>
              <button
                onClick={() => removeQuestion(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {starterQuestions.length < 5 && (
        <div className="relative mt-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a starter question..."
            className="w-full bg-muted/30 border border-border/30 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all outline-none pr-10"
          />
          <button
            onClick={addQuestion}
            disabled={!newQuestion.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors disabled:opacity-30 disabled:hover:bg-muted"
          >
            <Plus size={14} className="text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-1 pl-1">
        These questions will be suggested to users when they first interact with your chatbot
      </div>
    </motion.div>
  )
}
