import { UnderstandingOutput, RetrievalOutput, GenerationOutput } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"

interface Props{
    loading: boolean
    error: string | null
    data: {
        query: UnderstandingOutput  
        searchResults: RetrievalOutput
        generation: GenerationOutput
    } | null
}

export function AssistantBlockContext(props: Props) {
    return (
        <div>
            {props.loading && <Skeleton />}
            {props.error && <Error />}
        </div>
    )
}


const Skeleton = () => {
    return (
        <div>
        </div>
    )
}

const Error = () => {
    return (
        <div>
        </div>
    )
}