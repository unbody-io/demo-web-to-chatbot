import { ERagStage, IRagState } from "@/hooks/use-agentic-rag"
import { IRagMessage, RetrievalOutput } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"
import { AssistantBlockStatus } from "./assistant-block.status"
import { AssistantBlockMessage } from "./assistant-block.message"
import { SearchResults } from "../search-results/search-results"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AssistantBlockProps {
    loading: boolean
    error: string | null
    isHistory: boolean
    data: {
        message: IRagMessage | null
        state: IRagState
        searchResults: RetrievalOutput["results"]
    }
}

export function AssistantBlock({ loading, error, isHistory, data: { message, state, searchResults } }: AssistantBlockProps) {

    const payload = message?.payload
    const hasPayload = payload && payload.length > 0
    const summary = hasPayload ? `Based on ${payload.length} results` : `Not based on knowledge base`;

    const [showSearchResults, setShowSearchResults] = useState(false)

    return (
        <div className={cn(
            "flex flex-col gap-2",
            "w-full py-2",
        )}>
            {(error) && <Error />}
            <div>
                <AssistantBlockStatus
                    isHistory={isHistory}
                    state={state}
                    loading={!isHistory && state[ERagStage.Status].status !== 'done'}
                    data={{
                        summary: summary,
                        payloadSize: hasPayload ? searchResults.length : undefined,
                    }}
                    onClick={() => setShowSearchResults(!showSearchResults)}
                />
                {
                    showSearchResults && (
                        <SearchResults
                        loading={!isHistory && state[ERagStage.Retrieval].status !== 'done'}
                        error={null}
                        data={{ results: searchResults }}
                    />
                )
                }
                <AssistantBlockMessage
                    loading={!isHistory && state[ERagStage.Generation].status !== 'done'}
                    data={message ? { message: message } : null}
                />
            </div>
        </div>
    )
}

const Error = () => {
    return (
        <div>
        </div>
    )
}
