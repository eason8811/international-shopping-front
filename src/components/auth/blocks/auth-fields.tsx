import { EyeIcon, EyeOffIcon } from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  "font-sans text-(length:--type-paragraph-small-font-size)",
  "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
].join(" ")

const errorClassName = [
  "font-sans text-(length:--type-paragraph-mini-font-size)",
  "leading-(--type-paragraph-mini-line-height) tracking-(--type-paragraph-mini-letter-spacing) text-(--color-text-danger)",
].join(" ")

function UnderlineFieldFrame({
  children,
  invalid = false,
}: {
  children: React.ReactNode
  invalid?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 border-b border-(--input-underline-border-default) py-3",
        invalid && "border-(--color-border-invalid-focus)"
      )}
    >
      {children}
    </div>
  )
}

interface AuthAccountFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  error?: string | null
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  name?: string
}

export function AuthAccountField({
  label,
  value,
  onValueChange,
  placeholder,
  error,
  autoComplete,
  inputMode,
  name,
}: AuthAccountFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <UnderlineFieldFrame invalid={Boolean(error)}>
        <Input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="flex-1 text-(--color-text-primary)"
          id={name}
          inputMode={inputMode}
          name={name}
          placeholder={placeholder}
          type="text"
          value={value}
          variant="underline"
          onChange={(event) => onValueChange(event.target.value)}
        />
      </UnderlineFieldFrame>
      {error ? <p className={errorClassName}>{error}</p> : null}
    </div>
  )
}

type AuthEmailFieldProps =
  | {
      mode?: "editable"
      label: string
      value: string
      onValueChange: (value: string) => void
      placeholder: string
      error?: string | null
      autoComplete?: string
      name?: string
    }
  | {
      mode: "readonly"
      helperLabel: string
      value: string
      className?: string
    }

export function AuthEmailField(props: AuthEmailFieldProps) {
  if (props.mode === "readonly") {
    return (
      <div className={cn("flex w-full flex-col items-center gap-2", props.className)}>
        <p className={cn(helperClassName, "font-semibold")}>{props.helperLabel}</p>
        <p
          className={[
            "font-sans text-(length:--type-paragraph-regular-font-size)",
            "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-primary)",
          ].join(" ")}
        >
          {props.value}
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label className={labelClassName} htmlFor={props.name}>
        {props.label}
      </label>
      <UnderlineFieldFrame invalid={Boolean(props.error)}>
        <Input
          aria-invalid={Boolean(props.error)}
          autoComplete={props.autoComplete}
          className="flex-1 text-(--color-text-primary)"
          id={props.name}
          name={props.name}
          placeholder={props.placeholder}
          type="email"
          value={props.value}
          variant="underline"
          onChange={(event) => props.onValueChange(event.target.value)}
        />
      </UnderlineFieldFrame>
      {props.error ? <p className={errorClassName}>{props.error}</p> : null}
    </div>
  )
}

interface AuthPasswordFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  error?: string | null
  visible: boolean
  onToggleVisibility: () => void
  revealLabel: string
  concealLabel: string
  name?: string
  autoComplete?: string
  supportActionLabel?: string
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
  return (
    <div className="flex w-full flex-col gap-2">
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
      <UnderlineFieldFrame invalid={Boolean(error)}>
        <Input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="flex-1 text-(--color-text-primary)"
          id={name}
          name={name}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          value={value}
          variant="underline"
          onChange={(event) => onValueChange(event.target.value)}
        />
        <Button
          aria-label={visible ? concealLabel : revealLabel}
          size="small"
          type="button"
          variant="naked-icon-inline"
          onClick={onToggleVisibility}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
      </UnderlineFieldFrame>
      {error ? <p className={errorClassName}>{error}</p> : null}
    </div>
  )
}

interface AuthOtpFieldProps {
  value: string
  onValueChange: (value: string) => void
  error?: string | null
  ariaLabel: string
}

export function AuthOtpField({
  value,
  onValueChange,
  error,
  ariaLabel,
}: AuthOtpFieldProps) {
  const invalidClassName = error
    ? "border-(--color-border-invalid-focus)"
    : "border-(--color-border-default)"

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <InputOTP
        aria-label={ariaLabel}
        className="w-full"
        containerClassName="w-full justify-center gap-3"
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onValueChange}
      >
        <InputOTPGroup className="rounded-none border-0 bg-transparent">
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={0}
          />
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={1}
          />
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={2}
          />
        </InputOTPGroup>
        <InputOTPSeparator className="text-(--color-border-default)" />
        <InputOTPGroup className="rounded-none border-0 bg-transparent">
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={3}
          />
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={4}
          />
          <InputOTPSlot
            aria-invalid={Boolean(error)}
            className={cn(
              "size-10 bg-(--color-surface-default) text-(--color-text-primary) xl:size-12",
              invalidClassName
            )}
            index={5}
          />
        </InputOTPGroup>
      </InputOTP>
      {error ? <p className={cn(errorClassName, "text-center")}>{error}</p> : null}
    </div>
  )
}
