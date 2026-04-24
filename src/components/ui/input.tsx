import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "w-full min-w-0 border-0 border-b border-auth-input-border bg-transparent px-0 pt-3.25 pb-3.5 text-base leading-6 font-normal text-auth-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-auth-ink placeholder:text-auth-placeholder focus-visible:border-auth-ink focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-0",
                className
            )}
            {...props}
        />
    )
}

export { Input }
