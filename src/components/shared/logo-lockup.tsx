import { cn } from "@/lib/utils"

interface LogoLockupProps {
  brandLabel: string
  className?: string
}

export function LogoLockup({ brandLabel, className }: LogoLockupProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 overflow-visible whitespace-nowrap",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="shrink-0 font-serif text-2xl leading-none font-semibold italic text-(--color-text-primary)"
      >
        &
      </span>
      <span
        className={[
          "shrink-0 whitespace-nowrap font-serif text-(length:--type-brand-large-font-size) leading-(--type-brand-large-line-height)",
          "font-semibold italic tracking-(--type-brand-large-letter-spacing) text-(--color-text-primary)",
        ].join(" ")}
      >
        {brandLabel}
      </span>
    </div>
  )
}
