import { cn } from "@/lib/utils"

interface AuthHeroHeaderProps {
  title: string
  description: string
  className?: string
}

export function AuthHeroHeader({
  title,
  description,
  className,
}: AuthHeroHeaderProps) {
  return (
    <header className={cn("flex w-full flex-col items-center gap-3 text-center", className)}>
      <h1
        className={[
          "font-serif text-(length:--type-heading-1-font-size) leading-(--type-heading-1-line-height)",
          "font-normal italic tracking-(--type-heading-1-letter-spacing) text-(--color-text-primary)",
        ].join(" ")}
      >
        {title}
      </h1>
      <p
        className={[
          "max-w-104 font-sans text-(length:--type-paragraph-regular-font-size)",
          "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-secondary)",
        ].join(" ")}
      >
        {description}
      </p>
    </header>
  )
}
