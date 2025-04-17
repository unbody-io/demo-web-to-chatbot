import { IRagMessage } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"


interface Props {
    message: IRagMessage
}

export function UserBlockMessage({ message }: Props) {
    return (
        <div className="w-full flex justify-end py-2">
            <div className="inline-block max-w-[60%] bg-black rounded-lg px-2 py-1 text-white">
                <p className="break-words whitespace-pre-wrap text-sm font-normal">
                    {message.content}
                </p>
            </div>
        </div>
    )
}