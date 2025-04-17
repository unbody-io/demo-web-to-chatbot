"use client"

import { motion } from "framer-motion"
import { MessageSquare, Sparkles } from "lucide-react"

type TabType = "persona" | "questions"

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex mb-4 border-b border-border/30"
    >
      <button
        onClick={() => onTabChange("persona")}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs relative ${
          activeTab === "persona" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <MessageSquare size={14} />
        <span>Persona</span>
        {activeTab === "persona" && (
          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
        )}
      </button>
      <button
        onClick={() => onTabChange("questions")}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs relative ${
          activeTab === "questions" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <Sparkles size={14} />
        <span>Starter Questions</span>
        {activeTab === "questions" && (
          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
        )}
      </button>
    </motion.div>
  )
}
