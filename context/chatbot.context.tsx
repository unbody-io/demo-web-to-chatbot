"use client";

import { createContext, ReactNode, useContext } from "react";
import { useFetchGET } from "../hooks/useFetch";
import { IChatbotContext } from "../types/data.types";

interface IContextState {
  data: IChatbotContext | null;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const ChatbotContext = createContext<IContextState | null>(null);

// Props for the ChatbotProvider component
interface ChatbotProviderProps {
  children: ReactNode;
}

// ChatbotProvider component
export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const { data, loading, error } = useFetchGET<{ context: IChatbotContext }>(
    "/api/setup/config/context"
  );

  return (
    <ChatbotContext.Provider
      value={{
        data: data ? data!.context : null,
        loading,
        error,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

// Custom hook to use the chatbot context
export function useChatbotContext() {
  const context = useContext(ChatbotContext);

  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }

  return context;
}
