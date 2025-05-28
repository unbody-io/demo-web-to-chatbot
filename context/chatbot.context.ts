"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { IChatbotContext } from '@/types/data.types';

// Interface for the chatbot context
interface IState {
    data: IChatbotContext
    loading: boolean
    error: string | null
}

const defaultState: IState = {
    data: {} as IChatbotContext,
    loading: false,
    error: null
}

const ChatbotContext = createContext<IState>(defaultState);

// Props for the ChatbotProvider component
interface ChatbotProviderProps {
  children: ReactNode;
}

// ChatbotProvider component
export function ChatbotProvider({ 
  children, 
}: ChatbotProviderProps) {
  const [data, setData] = useState<IChatbotContext>(defaultState.data);
  const [loading, setLoading] = useState<boolean>(defaultState.loading);
  const [error, setError] = useState<string | null>(defaultState.error);

  const value: IState = {
    data,
    loading,
    error
  };

  return (
    React.createElement(ChatbotContext.Provider, { value }, children)
  );
}

// Custom hook to use the chatbot context
export function useChatbotContext() {
  const context = useContext(ChatbotContext);
  
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  
  return context;
}

// Example usage:
// In your app entry point (e.g., app.tsx or layout.tsx):
// <ChatbotProvider>
//   <YourApp />
// </ChatbotProvider>
//
// Then in any component:
// const { configs, botIdentity, updateConfigs } = useChatbot();
