import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Sparkles, RefreshCw } from "lucide-react"
import { useChatbotContext } from "@/context/chatbot.context"
import { ERagStage, useAgenticRag } from "@/hooks/use-agentic-rag"
import { AssistantBlock, AssistantBlockProps } from "./message/assistant-block"
import { UserBlockMessage } from "./message/user-block.message"
import { cn, displayUrl } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { QuestionList } from "./questions"


export function ChatTextUI() {
  const [input, setInput] = useState("")
  const { data } = useChatbotContext()

  if (!data) {
    return null;
  }

  const { state, query, isProcessing, isIdle, progress, history } = useAgenticRag({
    onComplete: (output: any) => {
      console.log("Pipeline completed:", output)
    },
    onError: (error: any) => {
      console.error("Pipeline error:", error)
    },
    onStageChange: (stage: any) => {
      console.log("Stage changed to:", stage)
    }
  }, { configs: data.configs })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && isIdle) {
      query(input)
      setInput("")
    }
  }

  const handleQuestionClick = (question: string) => {
    query(question)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "w-full h-full flex flex-col",
        "relative",
        "pb-60"
      )}
    >
      <div>
        {
          history.length === 0 && (
            <div className={cn(
              "flex flex-col gap-2 bg-muted/90 rounded-xl p-4",
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-full max-w-2xl",
              "mx-auto",
              "rounded-xl backdrop-blur-sm",
              "z-10",
            )}>
              <p className="text-sm text-muted-foreground text-center">
                Ask me anything about {displayUrl(data.website?.url as string)}
              </p>
              <QuestionList questions={data.configs.initialQuestions} onClick={handleQuestionClick} />
            </div>
          )
        }
        {
          history.slice(0, -1).map((message, index) => {
            switch (message.role) {
              case "user":
                return <UserBlockMessage key={index} message={message} />
              case "assistant":
                return (
                  <AssistantBlock key={index}
                  isHistory={true}
                  loading={false}
                  error={null}
                  data={{
                    message: message,
                    state: state.stage,
                    searchResults: message.payload || []
                  }}
                />
                )
            }
          })
        }
      </div>
      {
        history.length > 1 && (
          <>
          <AssistantBlock
            isHistory={false}
            loading={isProcessing}
            error={null}
            data={{
              message: state.output.generation? {
                ...history[history.length - 1],
                content: state.output.generation.answer,
              } : null,
              state: state.stage,
              searchResults: state.output.retrieval?.results || []
            }}
          />
          {
            state.output.generation && (
              <div className="py-2">
                <div className="text-xs text-muted-foreground">
                  Follow up questions
                </div>
                <QuestionList questions={state.output.generation.followUps} onClick={handleQuestionClick} />
              </div>
            )
          }
          </>
        )
      }
      {/* Input area */}
      <div className={cn(
        "fixed bottom-10 left-0 right-0 p-4",
        "w-full max-w-2xl",
        "mx-auto",
        "rounded-xl shadow-lg backdrop-blur-sm",
        "z-10",
      )}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={!isIdle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isIdle}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  )
}