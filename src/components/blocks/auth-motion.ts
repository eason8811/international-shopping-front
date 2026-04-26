import type { Variants } from "motion/react"

const authEaseEmphasized = [0.16, 1, 0.3, 1] as const
const authEaseStandard = [0.2, 0.8, 0.2, 1] as const

const authStaggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.06,
            staggerChildren: 0.065,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.035,
            staggerDirection: -1,
        },
    },
}

const authReducedStaggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0,
            staggerChildren: 0,
        },
    },
    exit: {},
}

const authFadeUpItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: authEaseEmphasized,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.24,
            ease: authEaseStandard,
        },
    },
}

const authReducedFadeItemVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.16,
            ease: authEaseStandard,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.12,
            ease: authEaseStandard,
        },
    },
}

function getAuthStaggerContainerVariants(reducedMotion: boolean) {
    return reducedMotion
        ? authReducedStaggerContainerVariants
        : authStaggerContainerVariants
}

function getAuthFadeItemVariants(reducedMotion: boolean) {
    return reducedMotion ? authReducedFadeItemVariants : authFadeUpItemVariants
}

export {
    authEaseEmphasized,
    authEaseStandard,
    getAuthFadeItemVariants,
    getAuthStaggerContainerVariants,
}
