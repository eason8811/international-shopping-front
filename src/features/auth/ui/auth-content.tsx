import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AuthContentProps {
  children: ReactNode
  className?: string
}

interface AuthContentSlotProps {
  children: ReactNode
  className?: string
}

function AuthContentSlot({ children, className }: AuthContentSlotProps) {
  return className ? <div className={className}>{children}</div> : <>{children}</>
}

function AuthContentRoot({
  children,
  className,
}: AuthContentProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-12", className)}>
      {children}
    </div>
  )
}

function AuthContentHero(props: AuthContentSlotProps) {
  return <AuthContentSlot {...props} />
}

function AuthContentSection(props: AuthContentSlotProps) {
  return <AuthContentSlot {...props} />
}

function AuthContentFooter(props: AuthContentSlotProps) {
  return <AuthContentSlot {...props} />
}

export const AuthContent = Object.assign(AuthContentRoot, {
  Hero: AuthContentHero,
  Section: AuthContentSection,
  Footer: AuthContentFooter,
})
