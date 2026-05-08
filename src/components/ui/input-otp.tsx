"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

type InvalidStateProps = {
  invalid?: boolean
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "data-invalid"?: boolean | "true" | "false"
}

const otpSlotTypographyClassName = [
  "text-(length:--type-paragraph-regular-font-size) font-normal",
  "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing)",
].join(" ")

const InputOTPInvalidContext = React.createContext(false)

function resolveInvalidState({
  invalid = false,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
}: InvalidStateProps) {
  return (
    invalid ||
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    dataInvalid === true ||
    dataInvalid === "true"
  )
}

function InputOTP({
  className,
  containerClassName,
  invalid = false,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: React.ComponentProps<typeof OTPInput> &
  InvalidStateProps & {
  containerClassName?: string
}) {
  const resolvedInvalid = resolveInvalidState({
    invalid,
    "aria-invalid": ariaInvalid,
    "data-invalid": dataInvalid,
  })

  return (
    <InputOTPInvalidContext.Provider value={resolvedInvalid}>
      <OTPInput
        aria-invalid={resolvedInvalid ? true : ariaInvalid}
        data-slot="input-otp"
        data-invalid={resolvedInvalid ? "true" : "false"}
        containerClassName={cn(
          "flex items-center has-disabled:opacity-(--state-opacity-disabled)",
          containerClassName
        )}
        spellCheck={false}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </InputOTPInvalidContext.Provider>
  )
}

function InputOTPGroup({
  className,
  invalid = false,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: React.ComponentProps<"div"> & InvalidStateProps) {
  const inheritedInvalid = React.useContext(InputOTPInvalidContext)
  const resolvedInvalid =
    resolveInvalidState({
      invalid,
      "aria-invalid": ariaInvalid,
      "data-invalid": dataInvalid,
    }) || inheritedInvalid

  return (
    <div
      aria-invalid={resolvedInvalid ? true : ariaInvalid}
      data-slot="input-otp-group"
      data-invalid={resolvedInvalid ? "true" : "false"}
      className={cn("group/input-otp-group flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  invalid = false,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: React.ComponentProps<"div"> &
  InvalidStateProps & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const inheritedInvalid = React.useContext(InputOTPInvalidContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}
  const resolvedInvalid =
    resolveInvalidState({
      invalid,
      "aria-invalid": ariaInvalid,
      "data-invalid": dataInvalid,
    }) || inheritedInvalid

  const stateClassName = isActive
    ? resolvedInvalid
      ? [
          "border-(--input-otp-border-invalid-focus)",
          "shadow-[0_0_0_2px_var(--input-otp-border-invalid-focus-ring-layer-upper),0_0_0_2px_var(--input-otp-border-invalid-focus-ring-layer-lower)]",
        ].join(" ")
      : [
          "border-(--input-otp-border-focus)",
          "shadow-[0_0_0_2px_var(--input-otp-border-focus-ring)]",
        ].join(" ")
    : resolvedInvalid
      ? "border-[#eccdd0]"
      : "border-(--input-otp-border-default)"

  return (
    <div
      aria-invalid={resolvedInvalid ? true : ariaInvalid}
      data-slot="input-otp-slot"
      data-active={isActive ? "true" : "false"}
      data-invalid={resolvedInvalid ? "true" : "false"}
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
