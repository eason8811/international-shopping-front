import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AuthFormFrameProps {
  children: ReactNode
  className?: string
}

export function AuthFormFrame({ children, className }: AuthFormFrameProps) {
  return <div className={cn("w-full", className)}>{children}</div>
}
