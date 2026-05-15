"use client"

import * as React from "react"
import { stagger, useAnimate, useReducedMotion } from "motion/react"

import { motionTokens } from "@/lib/motion/tokens"

export type AuthStaggerState = "idle" | "pending" | "ready"

export const AUTH_PAGE_ENTER_ITEM_ATTR = "data-auth-page-enter-item"
export const AUTH_PAGE_STAGGER_STATE_ATTR = "data-auth-page-stagger-state"
export const AUTH_FORM_ENTER_ITEM_ATTR = "data-auth-form-enter-item"
export const AUTH_FORM_STAGGER_STATE_ATTR = "data-auth-form-stagger-state"

export const authPageEnterItemSelector = `[${AUTH_PAGE_ENTER_ITEM_ATTR}]`
export const authFormEnterItemSelector = `[${AUTH_FORM_ENTER_ITEM_ATTR}]`

const authPageEnterItemProps = {
  [AUTH_PAGE_ENTER_ITEM_ATTR]: "true",
} as const

const authFormEnterItemProps = {
  [AUTH_FORM_ENTER_ITEM_ATTR]: "true",
} as const

const authSharedEnterItemProps = {
  ...authPageEnterItemProps,
  ...authFormEnterItemProps,
} as const

interface StaggerSnapshot {
  opacity: string
  transform: string
  willChange: string
}

interface ScopedStaggerOptions {
  distance: number
  duration: number
  staggerStep: number
}

function captureSnapshot(element: HTMLElement): StaggerSnapshot {
  return {
    opacity: element.style.opacity,
    transform: element.style.transform,
    willChange: element.style.willChange,
  }
}

function restoreSnapshot(
  element: HTMLElement,
  snapshot: StaggerSnapshot | undefined
) {
  if (!snapshot) {
    element.style.removeProperty("opacity")
    element.style.removeProperty("transform")
    element.style.removeProperty("will-change")
    return
  }

  if (snapshot.opacity) {
    element.style.opacity = snapshot.opacity
  } else {
    element.style.removeProperty("opacity")
  }

  if (snapshot.transform) {
    element.style.transform = snapshot.transform
  } else {
    element.style.removeProperty("transform")
  }

  if (snapshot.willChange) {
    element.style.willChange = snapshot.willChange
  } else {
    element.style.removeProperty("will-change")
  }
}

function collectTargets(root: HTMLElement | null, selector: string) {
  if (!root) {
    return []
  }

  return Array.from(root.querySelectorAll<HTMLElement>(selector))
}

function runScopedStagger(
  animate: ReturnType<typeof useAnimate<HTMLDivElement>>[1],
  targets: HTMLElement[],
  { distance, duration, staggerStep }: ScopedStaggerOptions
) {
  const snapshots = new Map<HTMLElement, StaggerSnapshot>()

  for (const target of targets) {
    snapshots.set(target, captureSnapshot(target))
    target.style.opacity = "0"
    target.style.transform = `translateY(${distance}px)`
    target.style.willChange = "transform, opacity"
  }

  const controls = animate(
    targets,
    {
      opacity: 1,
      transform: "translateY(0px)",
    },
    {
      delay: stagger(staggerStep),
      duration,
      ease: motionTokens.easing.enter,
    }
  )

  function restore() {
    for (const target of targets) {
      restoreSnapshot(target, snapshots.get(target))
    }
  }

  return {
    controls,
    restore,
  }
}

export function getAuthPageEnterItemProps() {
  return authPageEnterItemProps
}

export function getAuthFormEnterItemProps() {
  return authFormEnterItemProps
}

export function getAuthSharedEnterItemProps() {
  return authSharedEnterItemProps
}

export function useAuthPageEnterStagger(replayKey = 0) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reducedMotion = useReducedMotion() ?? false
  const [pageReady, setPageReady] = React.useState(reducedMotion)
  const [stage, setStage] = React.useState<AuthStaggerState>(reducedMotion ? "ready" : "pending")
  const hasCompletedInitialRun = React.useRef(reducedMotion)
  const lastReplayKey = React.useRef(replayKey)

  React.useLayoutEffect(() => {
    const isInitialRun = !hasCompletedInitialRun.current
    const shouldReplay = !isInitialRun && replayKey !== lastReplayKey.current

    if (!isInitialRun && !shouldReplay) {
      return
    }

    lastReplayKey.current = replayKey

    const targets = collectTargets(scope.current, authPageEnterItemSelector)

    if (reducedMotion || targets.length === 0) {
      hasCompletedInitialRun.current = true
      setPageReady(true)
      setStage("ready")
      return
    }

    setStage("pending")

    let cancelled = false
    const { controls, restore } = runScopedStagger(animate, targets, {
      distance: motionTokens.distance.md,
      duration: motionTokens.duration.medium,
      staggerStep: motionTokens.stagger.regular,
    })

    controls.then(() => {
      if (cancelled) {
        return
      }

      restore()
      hasCompletedInitialRun.current = true
      setPageReady(true)
      setStage("ready")
    })

    return () => {
      cancelled = true
      controls.stop()
      restore()
    }
  }, [animate, reducedMotion, replayKey, scope])

  return {
    pageReady,
    scope,
    stage,
  }
}

export function useAuthFormEnterStagger(
  pageReady: boolean,
  suppressOnMount = false
) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reducedMotion = useReducedMotion() ?? false
  const shouldAnimateOnMount = React.useRef(pageReady && !suppressOnMount)
  const [stage, setStage] = React.useState<AuthStaggerState>(() => {
    if (!pageReady) {
      return "idle"
    }

    return reducedMotion ? "ready" : "pending"
  })

  React.useLayoutEffect(() => {
    const targets = collectTargets(scope.current, authFormEnterItemSelector)

    if (!pageReady) {
      setStage("idle")
      return
    }

    if (!shouldAnimateOnMount.current || reducedMotion || targets.length === 0) {
      setStage("ready")
      return
    }

    setStage("pending")

    let cancelled = false
    const { controls, restore } = runScopedStagger(animate, targets, {
      distance: motionTokens.distance.sm,
      duration: motionTokens.duration.medium,
      staggerStep: motionTokens.stagger.regular,
    })

    controls.then(() => {
      if (cancelled) {
        return
      }

      restore()
      setStage("ready")
    })

    return () => {
      cancelled = true
      controls.stop()
      restore()
    }
  }, [animate, pageReady, reducedMotion, scope])

  return {
    scope,
    stage,
  }
}
