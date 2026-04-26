import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-transparent bg-clip-padding text-center text-sm leading-5 font-medium tracking-[0.7px] whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-2 aria-invalid:ring-status-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    "border-auth-control-border bg-auth-ink text-white hover:bg-auth-ink/90 active:bg-auth-ink/85 dark:text-auth-background",
                outline:
                    "border-auth-control-border bg-white text-auth-ink hover:bg-auth-ink/5 active:bg-auth-ink/10 aria-expanded:bg-auth-ink/5 dark:bg-white dark:text-[#1c1917]",
                secondary:
                    "border-auth-control-border bg-white text-auth-ink hover:bg-auth-ink/5 active:bg-auth-ink/10 aria-expanded:bg-auth-ink/5 dark:bg-white dark:text-[#1c1917]",
                ghost:
                    "text-auth-ink hover:bg-auth-ink/5 active:bg-auth-ink/10 aria-expanded:bg-auth-ink/5",
                "ghost-bare":
                    "border-0 bg-transparent text-auth-muted shadow-none hover:cursor-pointer hover:bg-transparent hover:text-auth-ink active:bg-transparent active:text-auth-ink aria-expanded:text-auth-ink",
                destructive:
                    "border-status-danger/20 bg-status-danger/10 text-status-danger hover:bg-status-danger/15 focus-visible:border-status-danger/40 focus-visible:ring-status-danger/20",
                link: "h-auto rounded-none border-0 px-0 py-0 text-auth-ink underline-offset-4 hover:underline",
            },
            size: {
                default:
                    "h-[52px] gap-2 px-6 py-4 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
                social:
                    "h-[52px] gap-2.5 px-6 py-4 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
                email:
                    "h-[52px] gap-2.5 px-6 py-4 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
                xs: "h-8 gap-1 rounded-[10px] px-2.5 text-xs tracking-[0.3px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-10 gap-1.5 rounded-[10px] px-3 text-[0.8rem] tracking-[0.4px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: "h-[52px] gap-2 px-6 py-4 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
                link: "h-auto gap-1 rounded-none px-0 py-0",
                icon: "size-11 rounded-[12px]",
                "icon-xs":
                    "size-8 rounded-[10px] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                "icon-sm":
                    "size-10 rounded-[10px] in-data-[slot=button-group]:rounded-lg",
                "icon-lg": "size-[52px] rounded-[12px]",
                bare: "h-auto gap-1 rounded-none px-0 py-0",
                "icon-bare":
                    "size-10 rounded-none p-0 [&_svg:not([class*='size-'])]:size-6",
                "icon-bare-sm":
                    "size-6 rounded-none p-0 [&_svg:not([class*='size-'])]:size-4",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
                    className,
                    variant = "default",
                    size = "default",
                    asChild = false,
                    ...props
                }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}) {
    const Comp = asChild ? Slot.Root : "button"

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
