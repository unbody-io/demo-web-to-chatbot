import { cn } from "@/lib/utils"
import { Arrow } from "@radix-ui/react-context-menu"
import { motion } from "framer-motion"

import { AnimatePresence } from "framer-motion"
import { ArrowRightCircle, MessageCircleQuestion } from "lucide-react"

interface Props {
  questions: string[]
  onClick: (question: string) => void
}

export function QuestionList({ questions, onClick }: Props) {
  return (
    <div className="space-y-2 py-2">
      <AnimatePresence>
        {questions.map((question, index) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // "bg-muted/100 border border-border/30 rounded-sm p-2 hover:border-border/50 transition-colors",
              "flex items-center gap-2",
              "break-words whitespace-pre-wrap text-sm font-normal max-w-[80%]",
              "cursor-pointer",
            )}
            onClick={() => onClick(question)}
          >
            <MessageCircleQuestion size={14} className="text-muted-foreground" />
            <span className="text-xs">{question}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}