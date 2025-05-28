"use client";

import { ChatUI } from "@/components/chat/chat";
import { ChatbotProvider } from "@/context/chatbot.context";

export default function ChatPage() {
  return (
    <ChatbotProvider>
      <div className="flex flex-col w-full items-center justify-center">
        <div className="flex-1 p-4 w-full max-w-2xl overflow-x-hidden">
          <ChatUI />
        </div>
      </div>
    </ChatbotProvider>
  );
}
