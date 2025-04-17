"use client"

import { useAgenticRag } from "@/hooks/use-agentic-rag"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { ChatbotProvider } from "@/context/chatbot.context"
import { ChatUI } from "@/components/chat/chat"
export default function ChatPage() {
  return (
    <ChatbotProvider>
      <div className="flex flex-col w-full items-center justify-center">
        <div className="flex-1 p-4 w-full max-w-2xl overflow-x-hidden">
          <ChatUI />
        </div>
      </div>
    </ChatbotProvider>
  )
}

