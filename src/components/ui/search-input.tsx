import * as React from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "aria-label" | "type"
> & {
  label: string
  className?: string
}

function SearchInput({
  label,
  className,
  inputMode = "search",
  ...props
}: SearchInputProps) {
  return (
    <label
      className={cn(
        [
          "flex h-11 max-w-full items-center gap-2 rounded-full",
          "border-(length:--input-search-border-width) border-solid border-(--input-search-border-default)",
          "bg-(--input-search-bg-default) px-4 py-1 transition-colors",
          "focus-within:border-(--input-search-border-focus)",
          "has-disabled:border-(--input-search-border-disabled) has-disabled:opacity-(--state-opacity-disabled)",
        ].join(" "),
        className
      )}
    >
      <SearchIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-(--color-icon-placeholder)"
      />
      <span className="flex min-w-0 flex-1 items-center overflow-hidden px-3 py-2">
        <input
          aria-label={label}
          className={[
            "h-5 min-w-0 flex-1 bg-transparent pr-6 outline-none",
            "text-(length:--type-paragraph-small-font-size) font-normal leading-(--type-paragraph-small-line-height)",
            "tracking-(--type-paragraph-small-letter-spacing) text-(--input-search-text-default)",
            "placeholder:text-(--input-search-placeholder-default)",
          ].join(" ")}
          inputMode={inputMode}
          type="search"
          {...props}
        />
      </span>
    </label>
  )
}

export { SearchInput }
