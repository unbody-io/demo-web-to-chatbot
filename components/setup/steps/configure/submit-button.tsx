"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SetupConfigs } from "../../setup.type"

interface SubmitButtonProps {
  onSubmit: () => void
}

export function SubmitButton({ onSubmit }: SubmitButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-6"
    >
      <Button
        onClick={() => onSubmit()}
        className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-5"
      >
        <span>Launch Chatbot</span>
        <ChevronRight size={16} />
      </Button>
    </motion.div>
  )
}
