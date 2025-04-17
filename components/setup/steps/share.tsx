"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, Copy, ExternalLink, MapPinCheckInside, MessagesSquare, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IChatbotContext } from "@/types/data.types"
import { useRouter } from "next/navigation"

interface ShareStepProps {
  context: IChatbotContext
}

export function ShareStep({ context }: ShareStepProps) {
  const [copied, setCopied] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(context.website.url as string)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const openChatbot = () => {
    router.push("/")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Success Animation */}
      <div className="relative h-24 mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute inset-0 rounded-full border-2 border-foreground/10"
            />

            {/* Middle ring with gradient */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute inset-0 rounded-full border border-foreground/20"
              style={{ padding: 3 }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-background to-muted" />
            </motion.div>

            {/* Inner circle with check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-foreground/90 to-foreground flex items-center justify-center shadow-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Check className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground/40"
        />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground/40"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-6"
        >
          <h3 className="text-lg font-medium mb-1">Chatbot Ready</h3>
          <p className="text-xs text-muted-foreground">Your chatbot is now ready to use</p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 gap-3"
      >
        <Button
          onClick={openChatbot}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-5"
        >
          <span>Open Chatbot</span>
          <MessagesSquare />
        </Button>
      </motion.div>
    </motion.div>
  )
}


// {/* URL Card */}
// <motion.div
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ delay: 0.6 }}
//   className="mb-6"
// >
//   <div className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-b from-muted/30 to-background shadow-sm">
//     <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
//       <div className="text-xs font-medium">Chatbot URL</div>
//       <Share2 size={14} className="text-muted-foreground" />
//     </div>

//     <div className="p-4">
//       <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs break-all relative">

//         <button
//           onClick={copyToClipboard}
//           className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
//           aria-label="Copy to clipboard"
//         >
//           {copied ? (
//             <motion.div
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ type: "spring", stiffness: 200 }}
//             >
//               <Check size={14} className="text-foreground" />
//             </motion.div>
//           ) : (
//             <Copy size={14} />
//           )}
//         </button>
//       </div>
//     </div>
//   </div>
// </motion.div>

// {/* QR Code Placeholder */}
// {animationComplete && (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.9 }}
//     animate={{ opacity: 1, scale: 1 }}
//     transition={{ duration: 0.3 }}
//     className="flex items-center justify-center mb-6"
//   >
//     <div className="w-24 h-24 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
//       <div className="text-xs text-muted-foreground">QR Code</div>
//     </div>
//   </motion.div>
// )}