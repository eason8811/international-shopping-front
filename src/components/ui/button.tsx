import * as React from "react"
import {cva, type VariantProps} from "class-variance-authority"
import {Slot} from "radix-ui"
import {AnimatePresence, motion} from "motion/react"
import {Check, Loader2} from "lucide-react"

import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
                outline:
                    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
                ghost:
                    "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
                destructive:
                    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default:
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
                icon: "size-8",
                "icon-xs":
                    "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                "icon-sm":
                    "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
                "icon-lg": "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button(buttonProps: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
    isSuccess?: boolean
    contentKey?: string | number
}) {
    const {
        className,
        variant = "default",
        size = "default",
        asChild = false,
        isLoading = false,
        isSuccess = false,
        contentKey,
        children,
        disabled,
        ...props
    } = buttonProps
    const Comp = asChild ? Slot.Root : "button"
    const hasAnimatedStateProp = "isLoading" in buttonProps || "isSuccess" in buttonProps
    const showAnimatedState = !asChild && (hasAnimatedStateProp || contentKey !== undefined)
    const isDisabled = disabled || isLoading || isSuccess

    if (showAnimatedState) {
        return (
            <button
                data-slot="button"
                data-variant={variant}
                data-size={size}
                className={cn(
                    buttonVariants({variant, size, className}),
                    "relative overflow-hidden"
                )}
                disabled={isDisabled}
                {...props}
            >
                <span
                    className="invisible flex h-full items-center justify-center gap-2 px-1"
                    aria-hidden="true"
                >
                    {children}
                </span>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        {isSuccess ? (
                            <motion.span
                                key="success"
                                initial={{opacity: 0, scale: 0.82}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.82}}
                                transition={{duration: 0.18, ease: "easeOut"}}
                                className="flex items-center justify-center"
                            >
                                <Check className="size-5"/>
                            </motion.span>
                        ) : isLoading ? (
                            <motion.span
                                key="loading"
                                initial={{opacity: 0, y: 8, scale: 0.92}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: -8, scale: 0.92}}
                                transition={{duration: 0.22, ease: "easeOut"}}
                                className="flex items-center justify-center"
                            >
                                <Loader2 className="size-5 animate-spin"/>
                            </motion.span>
                        ) : (
                            <motion.span
                                key={`content-${contentKey ?? "default"}`}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
                                className="flex h-full w-full items-center justify-center gap-2"
                            >
                                {children}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </span>
            </button>
        )
    }

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({variant, size, className}))}
            disabled={disabled}
            {...props}
        >
            {children}
        </Comp>
    )
}

export {Button, buttonVariants}
