import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { AlignLeft, FileText, ImageIcon, LinkIcon, LucideIcon } from "lucide-react"
import { useMemo } from "react"
import ContentLoader from "react-content-loader"

interface Props {
    loading: boolean
    __type: string
    title: string
    link?: string
}


const containerClassName = cn(
    "bg-muted/30 border border-border/30 rounded-xl overflow-hidden flex-shrink-0 px-2 py-1",
    // "bg-red-500",
    "flex gap-2 items-center"
)

const iconSize = 12
const containerWidth = 140
const containerHeight = 20

export function SearchResultsItem({ loading, __type, title, link }: Props) {
    const getIcon = (): LucideIcon => {
        switch (__type) {
          case "webPage":
            return FileText
          case "textBlock":
            return AlignLeft
          case "image":
            return ImageIcon
          default:
            return FileText
        }
    }

    const Icon = getIcon()

    return (
        <motion.div
            initial={false}
            className={containerClassName}
            style={{
                width: `${containerWidth+17}px`,
                height: `${containerHeight+10}px`,
                marginRight: `1px`,
            }}
        >
                <div className="flex items-center justify-center bg-muted p-1"
                style={{
                    borderRadius: `2px`,
                }}
                >
                  <Icon size={iconSize-2} className="flex-shrink-0 text-muted-foreground" />
                </div>
                <div className="flex-1 truncate">
                    {
                        link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                                {title}
                            </a>
                        ) : (
                            <p className="text-sm font-medium">{title}</p>
                        )
                    }
                </div>
        </motion.div>
    )
}

export const SearchResultsItemSkeleton = () => (
    <div className={containerClassName}>
      <ContentLoader
        speed={2}
        width={containerWidth}
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        backgroundColor="lightgray"
      >
        {/* Icon placeholder */}
        <rect x="0" y="4" rx="2" ry="2" width="12" height="12" />
  
        {/* Text placeholder */}
        <rect x="20" y="6" rx="2" ry="2" width="110" height="8" />
      </ContentLoader>
    </div>
  )
  
