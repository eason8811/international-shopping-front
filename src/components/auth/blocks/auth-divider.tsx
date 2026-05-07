import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AuthDividerProps {
  label: string
  className?: string
}

export function AuthDivider({ label, className }: AuthDividerProps) {
  return (
    <div className={cn("flex w-full items-center py-8", className)}>
      <Separator className="flex-1 bg-(--separator-default)" />
      <span
        className={[
          "px-4 font-sans text-(length:--type-paragraph-mini-font-size)",
          "leading-(--type-paragraph-mini-line-height) tracking-(--type-paragraph-mini-letter-spacing) text-(--color-text-secondary)",
        ].join(" ")}
      >
        {label}
      </span>
      <Separator className="flex-1 bg-(--separator-default)" />
    </div>
  )
}
