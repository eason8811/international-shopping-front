"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

function InputOTP({
                      className,
                      containerClassName,
                      ...props
                  }: React.ComponentProps<typeof OTPInput> & {
    containerClassName?: string
}) {
    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn(
                "cn-input-otp flex items-center justify-center transition-opacity duration-[var(--motion-duration-medium)] ease-[var(--motion-ease-standard)] has-disabled:opacity-50",
                containerClassName
            )}
            spellCheck={false}
            className={cn("disabled:cursor-not-allowed", className)}
            {...props}
        />
    )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
    const ariaInvalid = props["aria-invalid"]
    const isInvalid =
        ariaInvalid !== undefined &&
        ariaInvalid !== false &&
        ariaInvalid !== "false"

    return (
        <div
            data-slot="input-otp-group"
            data-invalid={isInvalid || undefined}
            className={cn(
                "group/input-otp-group flex items-center rounded-lg transition-[border-color,box-shadow,opacity] duration-(--motion-duration-medium) ease-(--motion-ease-standard) data-[invalid=true]:ring-2 data-[invalid=true]:ring-status-danger/20",
                className
            )}
            {...props}
        />
    )
}

function InputOTPSlot({
                          index,
                          className,
                          ...props
                      }: React.ComponentProps<"div"> & {
    index: number
}) {
    const inputOTPContext = React.useContext(OTPInputContext)
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                "relative flex size-10.5 items-center justify-center border-y border-r border-auth-otp-border bg-white text-base leading-6 font-medium text-auth-ink transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-(--motion-duration-medium) ease-(--motion-ease-standard) outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-status-danger/30 data-[active=true]:z-10 data-[active=true]:border-auth-ink data-[active=true]:ring-2 data-[active=true]:ring-auth-ink/10 data-[active=true]:aria-invalid:border-status-danger data-[active=true]:aria-invalid:ring-status-danger/20 group-data-[invalid=true]/input-otp-group:border-status-danger/30 group-data-[invalid=true]/input-otp-group:data-[active=true]:border-status-danger group-data-[invalid=true]/input-otp-group:data-[active=true]:ring-status-danger/20 md:size-12 dark:bg-white dark:text-[#1c1917]",
                className
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-px animate-caret-blink bg-auth-ink duration-1000 dark:bg-[#1c1917]" />
                </div>
            )}
        </div>
    )
}

function InputOTPSeparator({
                               className,
                               ...props
                           }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-otp-separator"
            className={cn("flex h-12 w-4 items-center justify-center", className)}
            role="separator"
            {...props}
        >
            <span className="h-0.5 w-4 rounded-full bg-auth-muted" />
        </div>
    )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
