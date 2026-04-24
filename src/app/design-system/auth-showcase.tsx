"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, Check, Mail, Search, ShoppingBag, UserRound } from "lucide-react"

import {
    AuthBlock,
    AuthEmailButton,
    AuthEmailForm,
    AuthFooterLink,
    AuthSuccess,
    AuthVerifyForm,
} from "@/components/blocks"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthMode = "oauth" | "email" | "invalid" | "verify" | "success"

const modes: Array<{ value: AuthMode; label: string }> = [
    { value: "oauth", label: "OAuth" },
    { value: "email", label: "Email" },
    { value: "invalid", label: "Invalid" },
    { value: "verify", label: "OTP" },
    { value: "success", label: "Success" },
]

const modeCopy: Record<AuthMode, { title: string; description: string; footer?: React.ReactNode }> = {
    oauth: {
        title: "Welcome Back",
        description: "Sign in with your preferred channel or continue with email.",
        footer: <AuthFooterLink label="Don't have an account?" action="Request Access" />,
    },
    email: {
        title: "Welcome Back",
        description: "Use your registered email and secret key to continue.",
        footer: <AuthFooterLink label="Don't have an account?" action="Request Access" />,
    },
    invalid: {
        title: "Welcome Back",
        description: "Invalid input state uses data-invalid on Field and aria-invalid on the control.",
        footer: <AuthFooterLink label="Don't have an account?" action="Request Access" />,
    },
    verify: {
        title: "Verify Your Email",
        description: "Enter the one-time verification code to complete authentication.",
    },
    success: {
        title: "You're All Set",
        description: "The success state keeps the same Auth layout while removing OAuth choices.",
    },
}

export function AuthDesignSystemShowcase() {
    const [mode, setMode] = React.useState<AuthMode>("oauth")

    return (
        <main className="min-h-dvh bg-auth-background text-auth-ink">
            <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-4 py-6 md:px-6">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <p className="text-xs leading-4 font-bold tracking-[2.4px] text-auth-divider-label uppercase">
                            Auth validation
                        </p>
                        <h1 className="font-serif text-4xl leading-none font-normal tracking-[-1px] text-auth-ink italic md:text-5xl">
                            Figma-aligned Auth components
                        </h1>
                        <p className="text-[15px] leading-6 font-normal tracking-[0.4px] text-auth-muted">
                            Buttons, email fields, OTP slots, footer links, icons, and success motion are rendered from
                            the reusable design-system layer.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {modes.map((item) => (
                            <Button
                                key={item.value}
                                type="button"
                                size="sm"
                                variant={mode === item.value ? "default" : "secondary"}
                                aria-pressed={mode === item.value}
                                onClick={() => setMode(item.value)}
                            >
                                {mode === item.value ? <Check data-icon="inline-start" /> : null}
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </header>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                    <AuthDesktopFrame mode={mode} setMode={setMode} />
                    <AuthMobileFrame mode={mode} setMode={setMode} />
                </section>
            </div>
        </main>
    )
}

function AuthDesktopFrame({
                              mode,
                              setMode,
                          }: {
    mode: AuthMode
    setMode: React.Dispatch<React.SetStateAction<AuthMode>>
}) {
    return (
        <div className="overflow-hidden rounded-[18px] border border-auth-control-border bg-auth-background">
            <div className="relative grid min-h-180 grid-cols-1 bg-auth-background lg:grid-cols-[minmax(0,616px)_minmax(0,1fr)]">
                <AuthNav className="h-19 px-6 py-4" />

                <section className="flex min-h-180 items-center px-6 pt-19 pb-10 md:px-16">
                    <div className="mx-auto flex w-full max-w-105 flex-col gap-8">
                        <AuthIntro mode={mode} />
                        <AuthPanel mode={mode} setMode={setMode} />
                    </div>
                </section>

                <AuthPicturePanel className="hidden lg:flex" />
            </div>
        </div>
    )
}

function AuthMobileFrame({
                             mode,
                             setMode,
                         }: {
    mode: AuthMode
    setMode: React.Dispatch<React.SetStateAction<AuthMode>>
}) {
    return (
        <div className="mx-auto w-full max-w-97.5 overflow-hidden rounded-[28px] border border-auth-control-border bg-auth-background shadow-dialog xl:mx-0">
            <div className="relative min-h-195">
                <AuthNav className="h-15 px-4 py-3" isMobile />
                <section className="flex min-h-195 items-start px-8 pt-55 pb-10">
                    <div className="flex w-full flex-col gap-8">
                        <AuthIntro mode={mode} />
                        <AuthPanel mode={mode} setMode={setMode} />
                    </div>
                </section>
            </div>
        </div>
    )
}

function AuthNav({
                     className,
                     isMobile = false,
                 }: {
    className?: string
    isMobile?: boolean
}) {
    return (
        <nav
            className={cn(
                "absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-white/20 backdrop-blur-xl",
                className
            )}
        >
            <div className="flex items-center gap-2 text-auth-ink">
        <span className="flex size-8 items-center justify-center rounded-full bg-auth-ink text-auth-background">
          <ShoppingBag className="size-4" />
        </span>
                {!isMobile ? <span className="text-sm leading-5 font-semibold">ShopHub</span> : null}
            </div>

            <div className="flex items-center gap-2">
                {!isMobile ? (
                    <>
                        <Button variant="ghost" size="sm">Women</Button>
                        <Button variant="ghost" size="sm">Men</Button>
                    </>
                ) : null}
                <Button variant="ghost" size="icon-sm" aria-label="Search">
                    <Search />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Account">
                    <UserRound />
                </Button>
            </div>
        </nav>
    )
}

function AuthIntro({ mode }: { mode: AuthMode }) {
    const copy = modeCopy[mode]

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-serif text-5xl leading-12 font-normal tracking-[-1.2px] text-auth-ink italic">
                {copy.title}
            </h2>
            <p className="max-w-97.5 text-[15px] leading-6 font-normal tracking-[0.4px] text-auth-muted">
                {copy.description}
            </p>
        </div>
    )
}

function AuthPanel({
                       mode,
                       setMode,
                   }: {
    mode: AuthMode
    setMode: React.Dispatch<React.SetStateAction<AuthMode>>
}) {
    const copy = modeCopy[mode]

    if (mode === "success") {
        return (
            <AuthBlock providers={[]} footer={copy.footer}>
                <AuthSuccess
                    title="Successful"
                    description="Your account has been verified and is ready to use."
                />
            </AuthBlock>
        )
    }

    return (
        <AuthBlock footer={copy.footer}>
            {mode === "oauth" ? (
                <AuthEmailButton onClick={() => setMode("email")} />
            ) : null}

            {mode === "email" ? (
                <AuthEmailForm
                    onSubmit={(event) => {
                        event.preventDefault()
                        setMode("verify")
                    }}
                />
            ) : null}

            {mode === "invalid" ? (
                <AuthEmailForm
                    emailInvalid
                    emailError="Enter a valid email address."
                    passwordInvalid
                    passwordError="Secret key must contain at least 8 characters."
                    onSubmit={(event) => {
                        event.preventDefault()
                    }}
                />
            ) : null}

            {mode === "verify" ? (
                <AuthVerifyForm
                    email="customer@example.com"
                    onSubmit={(event) => {
                        event.preventDefault()
                        setMode("success")
                    }}
                />
            ) : null}
        </AuthBlock>
    )
}

function AuthPicturePanel({ className }: { className?: string }) {
    return (
        <aside className={cn("relative min-h-180 items-center justify-center overflow-hidden bg-white", className)}>
            <div className="absolute inset-4 overflow-hidden rounded-3xl bg-auth-blur-warm">
                <Image
                    src="/assets/figma/showcase/product-card.svg"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 0px"
                    className="object-cover"
                    unoptimized
                />
            </div>

            <div className="absolute right-10 bottom-10 flex w-70 flex-col gap-3 rounded-[20px] bg-white/80 p-5 text-auth-ink shadow-dialog backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs leading-4 font-bold tracking-[1.4px] text-auth-muted uppercase">Member access</span>
                    <Mail className="size-4 text-auth-muted" />
                </div>
                <p className="text-2xl leading-8 font-semibold tracking-[-0.6px]">Private shopping, verified checkout.</p>
                <Button type="button" size="sm" className="w-fit">
                    <ArrowLeft data-icon="inline-start" />
                    Back
                </Button>
            </div>
        </aside>
    )
}
