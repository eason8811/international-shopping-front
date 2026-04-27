import type { Variants } from "motion/react"

const authStaggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0,
            staggerChildren: 0.12,
        },
    },
    exit: {},
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
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
    exit: {},
}

const authReducedFadeItemVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.16,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.12,
            ease: "easeOut",
        },
    },
}

const authCollapsePanelVariants: Variants = {
    hidden: {
        height: 0,
        opacity: 0,
    },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
            when: "beforeChildren",
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
}

const authReducedCollapsePanelVariants: Variants = {
    hidden: {
        height: 0,
        opacity: 0,
    },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            duration: 0.12,
            ease: "easeOut",
            when: "beforeChildren",
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.08,
            ease: "easeOut",
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

function getAuthCollapsePanelVariants(reducedMotion: boolean) {
    return reducedMotion
        ? authReducedCollapsePanelVariants
        : authCollapsePanelVariants
}

export {
    getAuthCollapsePanelVariants,
    getAuthFadeItemVariants,
    getAuthStaggerContainerVariants,
}
