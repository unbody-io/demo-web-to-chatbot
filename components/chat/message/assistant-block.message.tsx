import { GenerationOutput, IRagMessage } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"
import ContentLoader from "react-content-loader"
import ReactMarkdown from "react-markdown"
interface Props {
    loading: boolean
    data: {
        message: IRagMessage
    } | null
}

export function AssistantBlockMessage(props: Props) {
    return (
        <div className="py-2">
            {props.loading && <Skeleton />}
            {props.data && (
                <div className="prose prose-sm">
                    <ReactMarkdown>
                        {props.data.message.content}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}

const Skeleton = () => {
    return (
        <div className="min-h-[3rem]">
            <ContentLoader
                  speed={2}
                  width={400}
                  height={48}
                  viewBox="0 0 400 48"
                  backgroundColor="lightgray"
                //   foregroundColor="#ecebeb"
                >
                  <rect x="0" y="0" rx="3" ry="3" width="380" height="10" />
                  <rect x="0" y="18" rx="3" ry="3" width="340" height="10" />
                  <rect x="0" y="36" rx="3" ry="3" width="280" height="10" />
            </ContentLoader>
        </div>
    )
}

const Error = () => {
    return (
        <div>
        </div>
    )
}