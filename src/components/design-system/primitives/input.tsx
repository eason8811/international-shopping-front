import * as React from "react";

import type { DsInputDensity, DsInputVariant } from "@/lib/design-system/component-rules";
import { inputRules } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

export const inputVariantClassMap = {
  default: "bg-[var(--ds-surface-container-low)]",
  quiet: "bg-[var(--ds-surface-container)]",
  search: "bg-[var(--ds-surface-container-low)] rounded-full",
} as const satisfies Record<DsInputVariant, string>;

export const inputDensityClassMap = {
  balanced: "min-h-11 px-3.5 py-2.5 ds-type-body-md",
  compact: "min-h-10 px-3 py-2 ds-type-body-md",
} as const satisfies Record<DsInputDensity, string>;

export function getInputControlClassName({
  variant = inputRules.defaults.variant,
  density = inputRules.defaults.density,
  className,
}: {
  variant?: DsInputVariant;
  density?: DsInputDensity;
  className?: string;
}) {
  return cn(
    "w-full min-w-0 border border-transparent text-[var(--ds-on-surface)] outline-none transition-[background-color,border-color,box-shadow,color] duration-[var(--duration-base)] ease-[var(--ease-standard)] placeholder:text-[var(--ds-on-surface-subtle)] focus-visible:bg-[var(--ds-surface-container-high)] focus-visible:border-[color:var(--ds-ghost-border-strong)] focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:pointer-events-none disabled:bg-[var(--ds-surface-container)] disabled:text-[var(--ds-on-surface-subtle)] aria-invalid:border-[color:var(--ds-destructive-soft)] aria-invalid:ring-[3px] aria-invalid:ring-[color:var(--ds-destructive)]/15",
    inputVariantClassMap[variant],
    inputDensityClassMap[density],
    className,
  );
}

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: DsInputVariant;
  density?: DsInputDensity;
}

export function Input({
  className,
  variant = inputRules.defaults.variant,
  density = inputRules.defaults.density,
  type,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-density={density}
      className={getInputControlClassName({ variant, density, className })}
      {...props}
    />
  );
}

export function SelectControl({
  className,
  variant = inputRules.defaults.variant,
  density = inputRules.defaults.density,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  variant?: DsInputVariant;
  density?: DsInputDensity;
}) {
  return (
    <select
      data-slot="select-control"
      data-variant={variant}
      data-density={density}
      className={getInputControlClassName({
        variant,
        density,
        className: cn("appearance-none pr-9", className),
      })}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextareaControl({
  className,
  variant = inputRules.defaults.variant,
  density = inputRules.defaults.density,
  ...props
}: React.ComponentProps<"textarea"> & {
  variant?: DsInputVariant;
  density?: DsInputDensity;
}) {
  return (
    <textarea
      data-slot="textarea-control"
      data-variant={variant}
      data-density={density}
      className={getInputControlClassName({
        variant,
        density,
        className: cn("min-h-28 resize-y", className),
      })}
      {...props}
    />
  );
}

export function Field({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="field" className={cn("flex flex-col gap-2", className)}>
      {children}
    </div>
  );
}

export function FieldLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("ds-type-label-md text-[var(--ds-on-surface-strong)]", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("ds-type-body-md text-[var(--ds-on-surface-muted)]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("ds-type-body-md text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}
