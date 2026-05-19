import type { Transition, Variants } from "motion/react"

import {
  motionTokens,
  resolveMotionDistance,
  resolveMotionDuration,
  resolveMotionScale,
  resolveMotionStagger,
  resolveMotionDelay,
  type MotionRecipeOptions,
} from "./tokens"

interface StaggerUpOptions extends MotionRecipeOptions {
  distance?: number
  duration?: number
  stagger?: number
}

interface DelayStaggerUpOptions extends StaggerUpOptions {
  delay?: number
}

interface InlineMessagePresenceOptions extends MotionRecipeOptions {
  distance?: number
  duration?: number
}

interface AutoHeightTransitionOptions extends MotionRecipeOptions {
  duration?: number
}

interface SuccessSpringOptions extends MotionRecipeOptions {
  delay?: number
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

function createExitTransition(
  duration: number,
  reducedMotion = false
): Transition {
  return {
    duration: resolveMotionDuration(duration, reducedMotion),
    ease: motionTokens.easing.exit,
  }
}

export function autoHeightTransition({
  reducedMotion = false,
  duration = motionTokens.duration.fast,
}: AutoHeightTransitionOptions = {}) {
  return createEnterTransition(duration, reducedMotion)
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

export function delayStaggerUp({
  reducedMotion = false,
  distance = motionTokens.distance.md,
  duration = motionTokens.duration.medium,
  stagger = motionTokens.stagger.regular,
  delay = motionTokens.delay.medium,
}: DelayStaggerUpOptions = {}) {
  const recipe = staggerUp({
    reducedMotion,
    distance,
    duration,
    stagger,
  })

  return {
    container: {
      ...recipe.container,
      visible: {
        ...recipe.container.visible,
        transition: {
          ...recipe.container.visible.transition,
          delayChildren: resolveMotionDelay(delay, reducedMotion),
        },
      },
    } satisfies Variants,

    item: recipe.item,
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
      transition: createExitTransition(duration, reducedMotion),
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
      transition: createExitTransition(duration, reducedMotion),
    },
  } satisfies Variants
}

export function inlineMessagePresence({
  reducedMotion = false,
  distance = motionTokens.distance.xs,
  duration = motionTokens.duration.fast,
}: InlineMessagePresenceOptions = {}) {
  return {
    layout: autoHeightTransition({ duration, reducedMotion }),
    wrapper: {
      hidden: {
        height: 0,
      },
      visible: {
        height: "auto",
        transition: createEnterTransition(duration, reducedMotion),
      },
    } satisfies Variants,
    content: {
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
        transition: createExitTransition(duration, reducedMotion),
      },
    } satisfies Variants,
  }
}

export function successSpring({
  reducedMotion = false,
  delay = motionTokens.delay.medium,
}: SuccessSpringOptions = {}) {
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
      transition: {
        ...(reducedMotion
          ? createEnterTransition(motionTokens.duration.fast, true)
          : motionTokens.spring),
        delay: resolveMotionDelay(delay, reducedMotion),
      },
    },
    exit: {
      opacity: 0,
      scale: resolveMotionScale(0.96, reducedMotion),
      transition: createExitTransition(motionTokens.duration.fast, reducedMotion),
    },
  } satisfies Variants
}
