"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { IChatbotContext } from '../types/data.types';
import { useFetchGET } from '../hooks/useFetch';

interface IContextState {
    data: IChatbotContext | null
    loading: boolean
    error: string | null
}

// Create the context with default values
const ChatbotContext = createContext<IContextState | null>(null);

// Props for the ChatbotProvider component
interface ChatbotProviderProps {
    children: ReactNode;
}

// ChatbotProvider component
export function ChatbotProvider({
    children
}: ChatbotProviderProps) {
    const { data, loading, error } = useFetchGET<{context: IChatbotContext}>('/api/setup/config/context')

    return (
        <ChatbotContext.Provider value={{ 
            data: data ? data!.context : null, 
            loading, 
            error 
            }}>
            {children}
        </ChatbotContext.Provider>
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
