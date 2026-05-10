export const motionTokens = {
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  duration: {
    fast: 0.28,
    medium: 0.5,
    slow: 0.72,
  },
  easing: {
    enter: [0.25, 0.46, 0.45, 0.94],
    exit: [0.55, 0.06, 0.68, 0.19],
    standard: [0.65, 0.05, 0.36, 1],
  },
  scale: {
    actionHover: 1,
    actionPress: 0.9,
    iconHover: 1,
    textHover: 1,
  },
  spring: {
    damping: 24,
    mass: 0.9,
    stiffness: 340,
    type: "spring" as const,
  },
  stagger: {
    tight: 0.04,
    regular: 0.08,
  },
} as const

export interface MotionRecipeOptions {
  reducedMotion?: boolean
}

export function resolveMotionDistance(
  value: number,
  reducedMotion = false
) {
  return reducedMotion ? 0 : value
}

export function resolveMotionScale(
  value: number,
  reducedMotion = false
) {
  return reducedMotion ? 1 : value
}

export function resolveMotionDuration(
  value: number,
  reducedMotion = false
) {
  return reducedMotion ? Math.min(value, 0.18) : value
}

export function resolveMotionStagger(
  value: number,
  reducedMotion = false
) {
  return reducedMotion ? 0 : value
}
