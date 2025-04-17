import { ERagStage, IRagStageStatus, IRagState } from "@/hooks/use-agentic-rag"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface Props{
    state: IRagState    
    loading: boolean
    isHistory: boolean
    onClick?: () => void
    data: {
        summary?: string
        subStatus?: string
        payloadSize?: number
    }
}

const ragStatusMap: Record<ERagStage, string|null> = {
    [ERagStage.Status]: "Getting ready...",
    [ERagStage.Understanding]: "Understanding...",
    [ERagStage.Retrieval]: "Searching knowledge base...",
    [ERagStage.Generation]: "Thinking...",
    [ERagStage.Valuation]: "Evaluating...",
    [ERagStage.Final]: null,
    [ERagStage.Error]: "Error occurred"
}

export function AssistantBlockStatus({state, loading, data, isHistory, onClick}: Props) {

    const activeKey = useMemo(() => {
        if (isHistory) {
            return null
        }
        const activeKeys = Object.keys(ragStatusMap).filter(key => state[key as ERagStage].status === 'loading')
        return activeKeys[0]? state[activeKeys[0] as ERagStage] : null
    }, [state])

    const label = activeKey ? ragStatusMap[activeKey.key as ERagStage] : null
    const error = activeKey ? state[activeKey.key as ERagStage].status === 'error' : false


    const status = isHistory||!label?
    data.summary
    : label? label
    : error? "Error"
    : null;

    const handleClick = () => {
        console.log("handleClick", onClick)
        if (onClick) {
            onClick()
        }
    }

    
    return (
        <div className="flex items-center gap-2">
            {loading && <Skeleton />}
            <div className="text-sm text-muted-foreground">
                {status}
            </div>
            {
                data.payloadSize &&
                <div className={cn(
                    "text-xs text-muted-foreground w-4 h-4 bg-muted rounded-full flex items-center justify-center",
                    "cursor-pointer",
                    "hover:bg-muted-foreground/10",
                )}
                     onClick={handleClick}
                >
                    {data.payloadSize}
                </div>
            }
        </div>
    )
}

const Skeleton = () => {
    return (
        <div>
        </div>
    )
}