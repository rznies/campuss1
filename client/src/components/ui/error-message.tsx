import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

export type ErrorSeverity = "error" | "warning" | "info"

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the error message
   * @default "Error"
   */
  title?: string
  /**
   * The main error message
   */
  message: string
  /**
   * The severity level of the error
   * @default "error"
   */
  severity?: ErrorSeverity
  /**
   * Whether to show the icon
   * @default true
   */
  showIcon?: boolean
  /**
   * Optional action button or element
   */
  action?: React.ReactNode
}

const severityConfig = {
  error: {
    icon: XCircle,
    variant: "destructive" as const,
    defaultTitle: "Error"
  },
  warning: {
    icon: AlertTriangle,
    variant: "warning" as const,
    defaultTitle: "Warning"
  },
  info: {
    icon: Info,
    variant: "info" as const,
    defaultTitle: "Info"
  }
}

export function ErrorMessage({ 
  title,
  message,
  severity = "error",
  showIcon = true,
  action,
  className,
  ...props
}: ErrorMessageProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <Alert 
      variant={config.variant}
      className={cn("flex items-start gap-4", className)}
      role={severity === "error" ? "alert" : "status"}
      {...props}
    >
      {showIcon && (
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <AlertTitle>
          {title || config.defaultTitle}
        </AlertTitle>
        <AlertDescription className="mt-1">
          {message}
        </AlertDescription>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </Alert>
  )
} 