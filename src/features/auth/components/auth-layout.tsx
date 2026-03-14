"use client";

import type {ReactNode} from "react";
import Image from "next/image";
import {useTranslations} from "next-intl";
import {motion} from "motion/react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({children, title, subtitle}: AuthLayoutProps) {
    const t = useTranslations("AuthUi.layout");

    return (
        <div className="flex min-h-screen w-full bg-background">
            <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10 lg:p-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {opacity: 0},
                        visible: {
                            opacity: 1,
                            transition: {staggerChildren: 0.15},
                        },
                    }}
                    className="mx-auto flex w-full max-w-md flex-col gap-6 lg:gap-8"
                >
                    <motion.div
                        variants={authItemVariants}
                        className="flex flex-col gap-2 text-center lg:text-left"
                    >
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </motion.div>

                    <div className="flex flex-col gap-6 lg:gap-8 ">{children}</div>
                </motion.div>
            </div>

            <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-muted lg:flex">
                <motion.div
                    initial={{scale: 1.05}}
                    animate={{scale: 1}}
                    transition={{duration: 10, ease: "easeOut"}}
                    className="absolute inset-0 h-full w-full"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1612565894226-2515de67df0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1pbmltYWwlMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzczMTQ5NDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt={t("imageAlt")}
                        fill
                        sizes="50vw"
                        className="h-full w-full object-cover opacity-90"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"/>

                <div className="absolute right-12 bottom-12 left-12 text-white/90">
                    <motion.blockquote
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, delay: 0.3, ease: "easeOut"}}
                        className="space-y-4 rounded-[var(--radius)] border border-white/10 bg-black/20 p-8 backdrop-blur-md"
                    >
                        <p className="text-xl font-medium leading-relaxed">{t("quote")}</p>
                        <footer className="text-sm text-white/70">{t("quoteAuthor")}</footer>
                    </motion.blockquote>
                </div>
            </div>
        </div>
    );
}

export const authItemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.5, ease: "easeOut"},
    },
} as const;
