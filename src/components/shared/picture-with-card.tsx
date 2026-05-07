import { cn } from "@/lib/utils"

const pictureCheckerDark = "#efebe8"
const pictureCheckerLight = "#f7f4f2"

interface PictureWithCardProps {
  quote: string
  author: string
  className?: string
}

export function PictureWithCard({
  quote,
  author,
  className,
}: PictureWithCardProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-end overflow-hidden px-16 py-12",
        className
      )}
      style={{
        background:
          `repeating-conic-gradient(from 45deg, ${pictureCheckerDark} 0% 25%, ${pictureCheckerLight} 0% 50%) 50% / 6rem 6rem`,
      }}
    >
      <div
        className={[
          "flex w-full flex-col items-end rounded-2xl border border-white/30 px-9 py-6 backdrop-blur-md",
          "bg-(--color-surface-glass) shadow-(--shadow-weak)",
        ].join(" ")}
      >
        <p
          className={[
            "font-serif text-(length:--type-heading-3-font-size) leading-(--type-heading-3-line-height)",
            "font-medium italic tracking-(--type-heading-3-letter-spacing) text-white",
          ].join(" ")}
        >
          {quote}
        </p>
        <p
          className={[
            "mt-3 text-right font-sans text-(length:--type-paragraph-regular-font-size)",
            "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-white/60",
          ].join(" ")}
        >
          {author}
        </p>
      </div>
    </div>
  )
}
