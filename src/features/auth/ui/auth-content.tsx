import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AuthContentProps {
  hero: ReactNode
  section: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthContent({
  hero,
  section,
  footer,
  className,
}: AuthContentProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-12", className)}>
      {hero}
      {section}
      {footer}
    </div>
  )
}
