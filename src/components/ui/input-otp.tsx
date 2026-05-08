"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

const otpSlotTypographyClassName = [
  "text-(length:--type-paragraph-regular-font-size) font-normal",
  "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing)",
].join(" ")

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
        "flex items-center has-disabled:opacity-(--state-opacity-disabled)",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
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
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true"

  const stateClassName = isActive
    ? invalid
      ? [
          "border-(--input-otp-border-invalid-focus)",
          "shadow-[0_0_0_2px_var(--input-otp-border-invalid-focus-ring-layer-upper),0_0_0_2px_var(--input-otp-border-invalid-focus-ring-layer-lower)]",
        ].join(" ")
      : [
          "border-(--input-otp-border-focus)",
          "shadow-[0_0_0_2px_var(--input-otp-border-focus-ring)]",
        ].join(" ")
    : invalid
      ? "border-[#eccdd0]"
      : "border-(--input-otp-border-default)"

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive ? "true" : "false"}
      className={cn(
        [
          "relative z-0 flex size-12 items-center justify-center border-y border-r border-solid bg-(--input-otp-bg-default)",
          "text-(--input-otp-text-default) outline-none first:rounded-l-(--input-otp-radius) first:border-l last:rounded-r-(--input-otp-radius)",
          "transition-[border-color,box-shadow] data-[active=true]:z-10",
          otpSlotTypographyClassName,
        ].join(" "),
        stateClassName,
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-caret-blink bg-(--input-otp-text-default) duration-1000" />
        </div>
      ) : null}
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
      className={cn("h-0.5 w-4 rounded-full bg-(--separator-default)", className)}
      role="separator"
      {...props}
    />
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
