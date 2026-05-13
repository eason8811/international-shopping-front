import { cn } from "@/lib/utils"

export type ButtonMotionFamily =
  | "button-action"
  | "icon-action"
  | "none"
  | "text-action"

const sharedInteractionTransitionTimingClassName = [
  "[transition-duration:var(--motion-duration-fast)]",
  "[transition-timing-function:var(--motion-easing-standard)]",
  "motion-reduce:[transition-duration:0ms]",
].join(" ")

export const toneTransitionClassName = [
  "transition-[color,background-color,border-color,box-shadow,opacity]",
  sharedInteractionTransitionTimingClassName,
].join(" ")

export const toneAndTransformTransitionClassName = [
  "transition-[color,background-color,border-color,box-shadow,opacity,transform,scale]",
  sharedInteractionTransitionTimingClassName,
].join(" ")

export const surfaceTransitionClassName = [
  "origin-center",
  "transform-gpu",
  "motion-reduce:transition-none",
].join(" ")

const buttonInteractionClassNames: Record<
  Exclude<ButtonMotionFamily, "none">,
  string
> = {
  "button-action": [
    "hover:scale-[var(--motion-scale-action-hover)]",
    "active:scale-[var(--motion-scale-action-press)]",
  ].join(" "),
  "icon-action": [
    "hover:scale-[var(--motion-scale-icon-hover)]",
    "active:scale-[var(--motion-scale-action-press)]",
  ].join(" "),
  "text-action": [
    "hover:scale-[var(--motion-scale-text-hover)]",
    "active:scale-[var(--motion-scale-text-press)]",
  ].join(" "),
}

const reducedMotionInteractionResetClassName = [
  "motion-reduce:hover:scale-100",
  "motion-reduce:active:scale-100",
].join(" ")

export function resolveButtonMotionFamily(
  variant: string | null | undefined,
  size: string | null | undefined
): ButtonMotionFamily {
  if ((variant === "primary" || variant === "secondary") && size === "large")
    return "button-action"

  if (variant === "link" || variant === "naked")
    return "text-action"

  if (variant === "naked-icon" || variant === "naked-icon-inline")
    return "icon-action"

  return "none"
}

export function resolveButtonInteractionClassName(
  family: ButtonMotionFamily,
  motionDisabled = false
) {
  if (family === "none" || motionDisabled)
    return ""

  return cn(
    toneAndTransformTransitionClassName,
    surfaceTransitionClassName,
    buttonInteractionClassNames[family],
    reducedMotionInteractionResetClassName
  )
}
