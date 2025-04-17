import { IWebPage } from "unbody"

interface Props {
    data: Partial<IWebPage>
}

export function WebpageCard({data}: Props) {
    return (
        <div>
            <div>{data.title as string}</div>
            <div>{data.url as string}</div>
        </div>
    )
}