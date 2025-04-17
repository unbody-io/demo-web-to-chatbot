"use client"

import { useState, useEffect } from "react"
import { motion as Motion } from "framer-motion"
import { Database } from "lucide-react"
import ContentLoader from "react-content-loader"

interface KnowledgeBaseCardProps {
  summary: string | null
  numPages: number | null
}

export function KnowledgeBaseCard({ summary, numPages }: KnowledgeBaseCardProps) {
  const [isLoading, setIsLoading] = useState(summary === null)
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!summary) return

    if (currentIndex >= summary.length) {
      setIsTypingComplete(true)
      return
    }

    const timer = setTimeout(() => {
      setDisplayText(summary.substring(0, currentIndex + 1))
      setCurrentIndex(currentIndex + 1)
    }, 30)

    return () => clearTimeout(timer)
  }, [isLoading, currentIndex, summary])

  useEffect(() => {
    if (summary) {
      setIsLoading(false)
    }
  }, [summary])


  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-[#f0f0f0] via-[#f5f5f5] to-[#fafafa] shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/10 via-foreground/20 to-foreground/10"></div>

        <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center">
              <Database size={12} className="text-foreground/70" />
            </div>
            <div className="text-xs font-medium">Knowledge Base</div>
          </div>
          <div className="text-xs bg-foreground/10 text-foreground/80 px-2 py-0.5 rounded-full">{numPages} pages</div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-h-[3rem]">
              {isLoading ? (
                <ContentLoader
                  speed={2}
                  width={280}
                  height={48}
                  viewBox="0 0 280 48"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                >
                  <rect x="0" y="0" rx="3" ry="3" width="270" height="10" />
                  <rect x="0" y="18" rx="3" ry="3" width="240" height="10" />
                  <rect x="0" y="36" rx="3" ry="3" width="180" height="10" />
                </ContentLoader>
              ) : (
                <div className="text-sm leading-relaxed font-light">
                  <span className={isTypingComplete ? "text-shimmer" : ""}>{displayText}</span>
                  {!isTypingComplete && <span className="animate-pulse">|</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  )
}
