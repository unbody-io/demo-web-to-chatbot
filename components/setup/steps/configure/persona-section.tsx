"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PersonaSectionProps {
  persona: string | null
  onPersonaAdjusted: (value: string) => void
  onNewPersonaAsked: () => void
  loading: boolean
}

export function PersonaSection({ persona, onPersonaAdjusted, onNewPersonaAsked, loading }: PersonaSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [persona])

  return (
    <motion.div
      key="persona"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <label htmlFor="persona" className="text-sm flex items-center gap-1.5">
          <MessageSquare size={14} className="text-muted-foreground" />
          <span>Persona Prompt</span>
        </label>
        <Button variant="ghost" size="icon" onClick={() => onNewPersonaAsked()}
          className="hover:bg-foreground/10 transition-all"
          disabled={loading}
          >
          <RefreshCw size={8} />
        </Button>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id="persona"
          value={loading ? "generating..." : persona || ""}
          onChange={(e) => onPersonaAdjusted(e.target.value)}
          className="w-full bg-muted/30 border border-border/30 rounded-lg px-4 py-3 text-sm resize-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all outline-none min-h-[120px] max-h-[200px]"
          placeholder="Enter a persona for your chatbot..."
          disabled={loading}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">{persona?.length || 0} chars</div>
      </div>

      <div className="text-xs text-muted-foreground mt-1 pl-1">Define how your chatbot should respond to users</div>
    </motion.div>
  )
}
