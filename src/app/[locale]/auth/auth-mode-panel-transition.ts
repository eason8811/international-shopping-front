export type AuthMode =
    | "login"
    | "login-email"
    | "register"
    | "register-email"
    | "verify"
    | "forgot"
    | "reset"
    | "success"

export type AuthFlowMotionGroup = "login" | "register" | "oauth"
export type AuthFlowForMotionKey = "login" | "register" | "forgot" | "oauth"

export type AuthModePanelTransition = "expand" | "morph"
export type AuthModePanelExpandBehavior = "collapse" | "resize"

export interface AuthModePanelAnimationConfig {
    transition: AuthModePanelTransition
    expandBehavior: AuthModePanelExpandBehavior
}

export function resolveAuthModePanelTransition(
    currentMode: AuthMode,
    nextMode: AuthMode,
): AuthModePanelTransition {
    return isLoginRegisterSwap(currentMode, nextMode) ? "morph" : "expand"
}

export function resolveAuthModePanelExpandBehavior(
    currentMode: AuthMode,
    nextMode: AuthMode,
): AuthModePanelExpandBehavior {
    return isCollapsedExpandSwap(currentMode, nextMode) ? "collapse" : "resize"
}

export function resolveAuthModePanelAnimation(
    currentMode: AuthMode,
    nextMode: AuthMode,
): AuthModePanelAnimationConfig {
    return {
        transition: resolveAuthModePanelTransition(currentMode, nextMode),
        expandBehavior: resolveAuthModePanelExpandBehavior(currentMode, nextMode),
    }
}

export function shouldAnimateAuthModePanelViewportHeight(
    animation: AuthModePanelAnimationConfig,
): boolean {
    return animation.transition === "morph" || animation.expandBehavior === "resize"
}

export function resolveAuthFlowMotionKey(flow: AuthFlowForMotionKey): AuthFlowMotionGroup {
    if (flow === "register") {
        return "register"
    }

    if (flow === "oauth") {
        return "oauth"
    }

    return "login"
}

function isLoginRegisterSwap(currentMode: AuthMode, nextMode: AuthMode) {
    return (
        (currentMode === "login" && nextMode === "register") ||
        (currentMode === "register" && nextMode === "login")
    )
}

function isCollapsedExpandSwap(currentMode: AuthMode, nextMode: AuthMode) {
    return (
        (currentMode === "login" && nextMode === "login-email") ||
        (currentMode === "register" && nextMode === "register-email")
    )
}
