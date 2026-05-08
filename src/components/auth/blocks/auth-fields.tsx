"use client"

import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { EyeClosedIcon, EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Input,
  InputCountryCodeSelect,
  InputUnderlineDivider,
  InputUnderlineFrame,
  type InputCountryCodeOption,
} from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

const labelClassName = [
  "font-sans text-(length:--type-caption-tiny-font-size) font-bold uppercase",
  "leading-(--type-caption-tiny-line-height) tracking-(--type-caption-tiny-letter-spacing) text-(--color-text-secondary)",
].join(" ")

const helperClassName = [
  "font-sans text-(length:--type-paragraph-small-font-size) font-semibold",
  "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
].join(" ")

const regularTextClassName = [
  "font-sans text-(length:--type-paragraph-regular-font-size) font-normal",
  "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-primary)",
].join(" ")

const errorClassName = [
  "font-sans text-(length:--type-paragraph-mini-font-size) font-normal",
  "leading-(--type-paragraph-mini-line-height) tracking-(--type-paragraph-mini-letter-spacing) text-(--color-text-danger)",
].join(" ")

function isPureDigitAccountValue(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue.length > 0 && /^\d+$/.test(trimmedValue)
}

function useFieldFocusState() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [focused, setFocused] = React.useState(false)

  function handleFocus() {
    setFocused(true)
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget

    if (nextTarget instanceof Node && containerRef.current?.contains(nextTarget)) {
      return
    }

    setFocused(false)
  }

  return {
    containerRef,
    focused,
    handleBlur,
    handleFocus,
  }
}

export interface AuthAccountFieldCopy {
  label: string
  placeholder: string
  countryCodeLabel?: string
}

interface AuthAccountFieldProps extends AuthAccountFieldCopy {
  value: string
  onValueChange: (value: string) => void
  error?: string | null
  allowPhoneMode?: boolean
  autoComplete?: string
  countryCode?: string
  countryCodeOptions?: ReadonlyArray<InputCountryCodeOption>
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  name?: string
  onCountryCodeChange?: (value: string) => void
}

export function AuthAccountField({
  label,
  value,
  onValueChange,
  placeholder,
  error,
  allowPhoneMode = true,
  autoComplete,
  countryCode,
  countryCodeLabel,
  countryCodeOptions,
  inputMode,
  name,
  onCountryCodeChange,
}: AuthAccountFieldProps) {
  const { containerRef, focused, handleBlur, handleFocus } = useFieldFocusState()
  const phoneMode = allowPhoneMode && isPureDigitAccountValue(value)

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-2">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <InputUnderlineFrame focused={focused} invalid={Boolean(error)}>
        {phoneMode ? (
          <>
            <InputCountryCodeSelect
              ariaLabel={countryCodeLabel ?? label}
              options={countryCodeOptions}
              value={countryCode}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onValueChange={onCountryCodeChange}
            />
            <InputUnderlineDivider />
          </>
        ) : null}
        <Input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="flex-1"
          id={name}
          inputMode={phoneMode ? "numeric" : inputMode}
          name={name}
          placeholder={placeholder}
          type="text"
          value={value}
          variant="underline"
          onBlur={handleBlur}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={handleFocus}
        />
      </InputUnderlineFrame>
      {error ? <p className={errorClassName}>{error}</p> : null}
    </div>
  )
}

export interface AuthEmailFieldEditableCopy {
  label: string
  placeholder: string
}

export interface AuthEmailFieldReadonlyCopy {
  helperLabel: string
}

type AuthEmailFieldProps =
  | ({
      mode?: "editable"
      name?: string
      autoComplete?: string
      value: string
      onValueChange: (value: string) => void
      error?: string | null
    } & AuthEmailFieldEditableCopy)
  | ({
      mode: "readonly"
      value: string
      className?: string
    } & AuthEmailFieldReadonlyCopy)

export function AuthEmailField(props: AuthEmailFieldProps) {
  const { containerRef, focused, handleBlur, handleFocus } = useFieldFocusState()

  if (props.mode === "readonly") {
    return (
      <div className={cn("flex w-full flex-col items-center gap-2", props.className)}>
        <p className={helperClassName}>{props.helperLabel}</p>
        <p className={regularTextClassName}>{props.value}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-2">
      <label className={labelClassName} htmlFor={props.name}>
        {props.label}
      </label>
      <InputUnderlineFrame focused={focused} invalid={Boolean(props.error)}>
        <Input
          aria-invalid={Boolean(props.error)}
          autoComplete={props.autoComplete}
          className="flex-1"
          id={props.name}
          name={props.name}
          placeholder={props.placeholder}
          type="email"
          value={props.value}
          variant="underline"
          onBlur={handleBlur}
          onChange={(event) => props.onValueChange(event.target.value)}
          onFocus={handleFocus}
        />
      </InputUnderlineFrame>
      {props.error ? <p className={errorClassName}>{props.error}</p> : null}
    </div>
  )
}

export interface AuthPasswordFieldCopy {
  label: string
  placeholder: string
  revealLabel: string
  concealLabel: string
  supportActionLabel?: string
}

interface AuthPasswordFieldProps extends AuthPasswordFieldCopy {
  value: string
  onValueChange: (value: string) => void
  error?: string | null
  visible: boolean
  onToggleVisibility: () => void
  name?: string
  autoComplete?: string
  onSupportAction?: () => void
}

export function AuthPasswordField({
  label,
  value,
  onValueChange,
  placeholder,
  error,
  visible,
  onToggleVisibility,
  revealLabel,
  concealLabel,
  name,
  autoComplete,
  supportActionLabel,
  onSupportAction,
}: AuthPasswordFieldProps) {
  const { containerRef, focused, handleBlur, handleFocus } = useFieldFocusState()

  return (
    <div ref={containerRef} className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className={labelClassName} htmlFor={name}>
          {label}
        </label>
        {supportActionLabel && onSupportAction ? (
          <Button size="small" type="button" variant="naked" onClick={onSupportAction}>
            {supportActionLabel}
          </Button>
        ) : null}
      </div>
      <InputUnderlineFrame focused={focused} invalid={Boolean(error)}>
        <Input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="flex-1"
          id={name}
          name={name}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          value={value}
          variant="underline"
          onBlur={handleBlur}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={handleFocus}
        />
        <Button
          aria-label={visible ? concealLabel : revealLabel}
          size="small"
          type="button"
          variant="naked-icon-inline"
          onClick={onToggleVisibility}
          onMouseDown={(event) => event.preventDefault()}
        >
          {visible ? <EyeIcon /> : <EyeClosedIcon />}
        </Button>
      </InputUnderlineFrame>
      {error ? <p className={errorClassName}>{error}</p> : null}
    </div>
  )
}

export interface AuthOtpFieldCopy {
  ariaLabel: string
}

interface AuthOtpFieldProps extends AuthOtpFieldCopy {
  value: string
  onValueChange: (value: string) => void
  error?: string | null
}

export function AuthOtpField({
  value,
  onValueChange,
  error,
  ariaLabel,
}: AuthOtpFieldProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <InputOTP
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        className="w-full"
        containerClassName="w-full justify-center gap-3"
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onValueChange}
      >
        <InputOTPGroup>
          <InputOTPSlot className="size-10 xl:size-12" index={0} />
          <InputOTPSlot className="size-10 xl:size-12" index={1} />
          <InputOTPSlot className="size-10 xl:size-12" index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot className="size-10 xl:size-12" index={3} />
          <InputOTPSlot className="size-10 xl:size-12" index={4} />
          <InputOTPSlot className="size-10 xl:size-12" index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error ? <p className={cn(errorClassName, "text-center")}>{error}</p> : null}
    </div>
  )
}
