import { useChatbotContext } from "@/context/chatbot.context"
import { ChatTextUI } from "./chat.text.ui"

export function ChatUI() {
    const { data, loading, error } = useChatbotContext()


    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!data) {
        return <div>No data</div>
    }

    return (
        <div className="w-full h-full">
            <ChatTextUI />
        </div>
    )
}