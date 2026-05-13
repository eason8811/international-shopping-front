import type { Transition, Variants } from "motion/react"

import {
  motionTokens,
  resolveMotionDistance,
  resolveMotionDuration,
  resolveMotionScale,
  resolveMotionStagger,
  type MotionRecipeOptions,
} from "./tokens"

interface StaggerUpOptions extends MotionRecipeOptions {
  distance?: number
  duration?: number
  stagger?: number
}

function createEnterTransition(
  duration: number,
  reducedMotion = false
): Transition {
  return {
    duration: resolveMotionDuration(duration, reducedMotion),
    ease: motionTokens.easing.enter,
  }
}

export function staggerUp({
  reducedMotion = false,
  distance = motionTokens.distance.md,
  duration = motionTokens.duration.medium,
  stagger = motionTokens.stagger.regular,
}: StaggerUpOptions = {}) {
  return {
    container: {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: 0,
          staggerChildren: resolveMotionStagger(stagger, reducedMotion),
        },
      },
    } satisfies Variants,
    item: {
      hidden: {
        opacity: 0,
        y: resolveMotionDistance(distance, reducedMotion),
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: createEnterTransition(duration, reducedMotion),
      },
    } satisfies Variants,
  }
}

export function fadeSwap({
  reducedMotion = false,
  distance = motionTokens.distance.sm,
  duration = motionTokens.duration.medium,
}: StaggerUpOptions = {}) {
  return {
    hidden: {
      opacity: 0,
      y: resolveMotionDistance(distance, reducedMotion),
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: createEnterTransition(duration, reducedMotion),
    },
    exit: {
      opacity: 0,
      y: resolveMotionDistance(-distance, reducedMotion),
      transition: {
        duration: resolveMotionDuration(duration, reducedMotion),
        ease: motionTokens.easing.exit,
      },
    },
  } satisfies Variants
}

export function copySlideSwap({
  reducedMotion = false,
  distance = motionTokens.distance.xs,
  duration = motionTokens.duration.fast,
}: StaggerUpOptions = {}) {
  return {
    hidden: {
      opacity: 0,
      y: resolveMotionDistance(distance, reducedMotion),
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: createEnterTransition(duration, reducedMotion),
    },
    exit: {
      opacity: 0,
      y: resolveMotionDistance(-distance, reducedMotion),
      transition: {
        duration: resolveMotionDuration(duration, reducedMotion),
        ease: motionTokens.easing.exit,
      },
    },
  } satisfies Variants
}

export function successSpring({
  reducedMotion = false,
}: MotionRecipeOptions = {}) {
  return {
    hidden: {
      opacity: 0,
      scale: resolveMotionScale(0.82, reducedMotion),
      y: resolveMotionDistance(motionTokens.distance.xs, reducedMotion),
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: reducedMotion
        ? createEnterTransition(motionTokens.duration.fast, true)
        : motionTokens.spring,
    },
    exit: {
      opacity: 0,
      scale: resolveMotionScale(0.96, reducedMotion),
      transition: {
        duration: resolveMotionDuration(motionTokens.duration.fast, reducedMotion),
        ease: motionTokens.easing.exit,
      },
    },
  } satisfies Variants
}
