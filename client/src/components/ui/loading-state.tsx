import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  /**
   * The height of the loading container
   * @default "400px"
   */
  height?: string
  /**
   * Loading text to display
   * @default "Loading..."
   */
  text?: string
  /**
   * Additional className for the container
   */
  className?: string
}

export function LoadingState({
  height = "400px",
  text = "Loading...",
  className
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center w-full",
        "bg-muted/5 rounded-lg",
        className
      )}
      style={{ height }}
    >
      <LoadingSpinner 
        size="lg"
        text={text}
      />
    </div>
  )
} 