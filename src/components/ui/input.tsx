import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
    "w-full min-w-0 border-0 border-b bg-transparent px-0 pt-3.25 pb-3.5 text-base leading-6 font-normal text-auth-ink transition-[color,border-color,box-shadow,opacity,filter] duration-[var(--motion-duration-medium)] ease-[var(--motion-ease-standard)] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-auth-ink placeholder:text-auth-placeholder placeholder:transition-colors placeholder:duration-[var(--motion-duration-medium)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-auth-input-border focus-visible:border-auth-ink",
                destructive: "border-status-danger/30 focus-visible:border-status-danger",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

type InputProps = React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants>

function Input({ className, type, variant, ...props }: InputProps) {
    const ariaInvalid = props["aria-invalid"]
    const isInvalid =
        ariaInvalid !== undefined &&
        ariaInvalid !== false &&
        ariaInvalid !== "false"
    const resolvedVariant = variant ?? (isInvalid ? "destructive" : "default")

    return (
        <input
            type={type}
            data-slot="input"
            data-variant={resolvedVariant}
            className={cn(inputVariants({ variant: resolvedVariant, className }))}
            {...props}
        />
    )
}

export { Input, inputVariants }
