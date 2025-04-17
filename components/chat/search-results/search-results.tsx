import { RetrievalOutput } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"
import { SearchResultsItem, SearchResultsItemSkeleton } from "./search-results.item"
import { cn, displayUrl } from "@/lib/utils"

interface Props {
    loading: boolean
    error: string | null
    data: {
        results: RetrievalOutput["results"]
    } | null
}

const containerClassName = cn(
    "flex gap-2 w-full flex-wrap drop-shadow-sm",
    "rounded-xl overflow-hidden flex-shrink-0 py-1 mt-2 pb-6",
)   

export function SearchResults({loading, error, data}: Props) {
    return (
        <div>
            {loading && <Skeleton />}
            {error && <Error />}
            {
            data && 
            <div className={containerClassName}>
                {data.results.map((result, index) => {
                    switch (result.__typename) {
                        case "WebPage":
                        return <SearchResultsItem key={index} 
                                                    loading={loading}
                                                    __type={result.__typename}
                                                    title={displayUrl(result.url as string)}
                                                    link={result.url as string}
                                                    />
                    default:
                        return null
                }
            })}
            </div>}
        </div>
    )
}


const Skeleton = () => {
    return (
        <div className={containerClassName}>
            <SearchResultsItemSkeleton />
            <SearchResultsItemSkeleton />
            <SearchResultsItemSkeleton />
        </div>
    )
}


const Error = () => {
    return (
        <div>
        </div>
    )
}