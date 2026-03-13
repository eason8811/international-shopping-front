"use client";

import {type ComponentProps, useEffect, useRef, useState} from "react";
import {Check} from "lucide-react";
import {useTranslations} from "next-intl";
import {AnimatePresence, motion} from "motion/react";
import {toast} from "sonner";

import {
    loginUser,
    registerUser,
    requestPasswordReset,
    resendActivationEmail,
    resetPassword,
    verifyRegistrationEmail,
} from "@/features/auth";
import {normalizeClientError} from "@/lib/api/normalize-client-error";
import {normalizeOptionalPhoneCountryCodeInput} from "@/lib/format/phone";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type RegisterStep = "credentials" | "verify" | "success";
type ForgotStep = "none" | "email" | "verify" | "reset" | "success";
type SubmissionStatus = "idle" | "loading" | "success";

interface EmailAuthFormProps {
    mode: "login" | "register";
    initialForgotStep?: ForgotStep;
    onSuccess?: () => void;
}

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

export function EmailAuthForm({
                                  mode,
                                  initialForgotStep = "none",
                                  onSuccess,
                              }: EmailAuthFormProps) {
    const t = useTranslations("AuthUi");
    const inputRef = useRef<HTMLInputElement>(null);
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [status, setStatus] = useState<SubmissionStatus>("idle");
    const [registerStep, setRegisterStep] = useState<RegisterStep>("credentials");
    const [forgotStep, setForgotStep] = useState<ForgotStep>(initialForgotStep);
    const [countdown, setCountdown] = useState(0);
    const [countryCode, setCountryCode] = useState("+86");

    useEffect(() => {
        if (countdown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [countdown]);

    const isVerifyOtp = registerStep === "verify" || forgotStep === "verify";
    const isStaticAccount = registerStep === "verify" || forgotStep === "verify" || forgotStep === "reset";
    const isSuccess = registerStep === "success" || forgotStep === "success";
    const isNumericAccount = mode === "login" && forgotStep === "none" && /^\d+$/.test(account);
    const showPasswords =
        (mode === "login" && forgotStep === "none") ||
        (mode === "register" && registerStep === "credentials") ||
        forgotStep === "reset";
    const showConfirmPassword =
        (mode === "register" && registerStep === "credentials") || forgotStep === "reset";

    async function handleResend() {
        if (countdown > 0 || status !== "idle") {
            return;
        }

        setStatus("loading");

        try {
            if (mode === "register") {
                await resendActivationEmail({email: account.trim()});
            } else {
                await requestPasswordReset({
                    account: account.trim(),
                    countryCode: isNumericAccount
                        ? normalizeOptionalPhoneCountryCodeInput(countryCode)
                        : null,
                });
            }

            setCountdown(60);
            setStatus("idle");
            toast.success(t("form.resendSuccess"));
        } catch (error) {
            setStatus("idle");
            const normalized = normalizeClientError(error, t("form.errors.resendFailed"));
            toast.error(normalized.message);
        }
    }

    async function handleSubmit(event: FormSubmitEvent) {
        event.preventDefault();

        if (status === "loading") {
            return;
        }

        if (mode === "login") {
            await handleLoginSubmit();
            return;
        }

        await handleRegisterSubmit();
    }

    async function handleLoginSubmit() {
        if (forgotStep === "none") {
            setStatus("loading");

            try {
                await loginUser({
                    account: account.trim(),
                    password,
                    countryCode: isNumericAccount
                        ? normalizeOptionalPhoneCountryCodeInput(countryCode)
                        : null,
                });

                setStatus("success");
                window.setTimeout(() => {
                    setStatus("idle");
                    onSuccess?.();
                }, 1200);
            } catch (error) {
                setStatus("idle");
                const normalized = normalizeClientError(error, t("form.errors.loginFailed"));
                toast.error(normalized.message);
            }

            return;
        }

        if (forgotStep === "email") {
            setStatus("loading");

            try {
                await requestPasswordReset({
                    account: account.trim(),
                    countryCode: /^\d+$/.test(account.trim())
                        ? normalizeOptionalPhoneCountryCodeInput(countryCode)
                        : null,
                });

                setCountdown(60);
                setForgotStep("verify");
                setStatus("idle");
            } catch (error) {
                setStatus("idle");
                const normalized = normalizeClientError(error, t("form.errors.resetRequestFailed"));
                toast.error(normalized.message);
            }

            return;
        }

        if (forgotStep === "verify") {
            setStatus("loading");

            window.setTimeout(() => {
                setForgotStep("reset");
                setStatus("idle");
            }, 600);

            return;
        }

        if (password !== confirmPassword) {
            toast.error(t("form.errors.passwordMismatch"));
            return;
        }

        setStatus("loading");

        try {
            await resetPassword({
                account: account.trim(),
                countryCode: /^\d+$/.test(account.trim())
                    ? normalizeOptionalPhoneCountryCodeInput(countryCode)
                    : null,
                code: otp,
                newPassword: password,
            });

            setForgotStep("success");
            setStatus("idle");
            window.setTimeout(() => onSuccess?.(), 2200);
        } catch (error) {
            setStatus("idle");
            const normalized = normalizeClientError(error, t("form.errors.resetFailed"));
            toast.error(normalized.message);
        }
    }

    async function handleRegisterSubmit() {
        if (registerStep === "credentials") {
            if (password !== confirmPassword) {
                toast.error(t("form.errors.passwordMismatch"));
                return;
            }

            const {username, nickname} = deriveIdentityFromEmail(account);
            setStatus("loading");

            try {
                await registerUser({
                    username,
                    nickname,
                    email: account.trim(),
                    password,
                    phoneCountryCode: null,
                    phoneNationalNumber: null,
                });

                setCountdown(60);
                setRegisterStep("verify");
                setStatus("idle");
            } catch (error) {
                setStatus("idle");
                const normalized = normalizeClientError(error, t("form.errors.registerFailed"));
                toast.error(normalized.message);
            }

            return;
        }

        setStatus("loading");

        try {
            await verifyRegistrationEmail({
                email: account.trim(),
                code: otp,
            });

            setRegisterStep("success");
            setStatus("idle");
            window.setTimeout(() => onSuccess?.(), 2200);
        } catch (error) {
            setStatus("idle");
            const normalized = normalizeClientError(error, t("form.errors.verifyFailed"));
            toast.error(normalized.message);
        }
    }

    const buttonText = resolveButtonText({
        mode,
        registerStep,
        forgotStep,
        translate: t,
    });

    let isButtonDisabled = status !== "idle";
    if (mode === "login") {
        if (forgotStep === "none") {
            isButtonDisabled = isButtonDisabled || !account.trim() || !password;
        } else if (forgotStep === "email") {
            isButtonDisabled = isButtonDisabled || !account.trim();
        } else if (forgotStep === "verify") {
            isButtonDisabled = isButtonDisabled || otp.length < 6;
        } else if (forgotStep === "reset") {
            isButtonDisabled = isButtonDisabled || !password || !confirmPassword;
        }
    } else if (registerStep === "credentials") {
        isButtonDisabled = isButtonDisabled || !account.trim() || !password || !confirmPassword;
    } else {
        isButtonDisabled = isButtonDisabled || otp.length < 6;
    }

    return (
        <motion.form
            layout
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 10}}
            transition={{duration: 0.3, ease: "easeInOut"}}
            onSubmit={handleSubmit}
            className="relative flex w-full flex-col gap-4 overflow-hidden"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {isSuccess ? (
                    <motion.div
                        layout
                        key="success-card"
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{duration: 0.3, ease: "easeOut"}}
                        className="flex min-h-75 w-full flex-col items-center justify-center gap-5 py-10 text-center"
                    >
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            transition={{type: "spring", stiffness: 200, damping: 15, delay: 0.1}}
                            className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                        >
                            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500">
                                <Check className="size-6 text-background"/>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-2">
                            <motion.h3
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.2}}
                                className="text-2xl font-semibold tracking-tight text-foreground"
                            >
                                {forgotStep === "success"
                                    ? t("success.resetTitle")
                                    : t("success.verifyTitle")}
                            </motion.h3>

                            <motion.div
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.3}}
                                className={cn(
                                    "mx-auto text-sm leading-relaxed text-muted-foreground",
                                    forgotStep === "success" ? "max-w-75" : "max-w-62.5",
                                )}
                            >
                                <p>
                                    {forgotStep === "success"
                                        ? t("success.resetDescription")
                                        : t("success.verifyDescription")}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        key="form-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                        className="flex w-full flex-col gap-4"
                    >
                        <motion.div
                            layout
                            className={cn(
                                "flex flex-col transition-all duration-500",
                                isStaticAccount ? "mt-2 items-center gap-1 text-center" : "gap-2",
                            )}
                        >
                            <motion.div layout="position">
                                <Label
                                    htmlFor="auth-account"
                                    className={cn(
                                        "transition-colors duration-500",
                                        isStaticAccount ? "font-normal text-muted-foreground" : "font-medium",
                                    )}
                                >
                                    {isStaticAccount
                                        ? t("form.labels.verificationSentTo")
                                        : mode === "login" && forgotStep === "none"
                                            ? t("form.labels.account")
                                            : t("form.labels.email")}
                                </Label>
                            </motion.div>

                            <motion.div
                                layout
                                className={cn(
                                    "relative flex w-full overflow-hidden rounded-[var(--radius)] transition-all duration-500",
                                    isStaticAccount
                                        ? "h-8 items-center justify-center bg-transparent"
                                        : "h-12 items-center bg-muted/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                )}
                            >
                                <AnimatePresence initial={false}>
                                    {!isStaticAccount && isNumericAccount ? (
                                        <motion.div
                                            key="phone-prefix"
                                            initial={{width: 0, opacity: 0, paddingLeft: 0}}
                                            animate={{width: "auto", opacity: 1, paddingLeft: 8}}
                                            exit={{width: 0, opacity: 0, paddingLeft: 0}}
                                            transition={{duration: 0.3, ease: "easeInOut"}}
                                            className="flex shrink-0 items-center overflow-hidden whitespace-nowrap"
                                        >
                                            <Select value={countryCode} onValueChange={setCountryCode} disabled={status !== "idle"}>
                                                <SelectTrigger className="h-auto w-auto gap-1 rounded-none border-none bg-transparent px-1 py-0 text-sm text-muted-foreground shadow-none hover:text-foreground focus:ring-0 focus:ring-offset-0">
                                                    <SelectValue placeholder="Code"/>
                                                </SelectTrigger>
                                                <SelectContent
                                                    className="min-w-30"
                                                    onCloseAutoFocus={(event) => {
                                                        event.preventDefault();
                                                        inputRef.current?.focus();
                                                    }}
                                                >
                                                    <SelectItem value="+1">+1 (US)</SelectItem>
                                                    <SelectItem value="+44">+44 (UK)</SelectItem>
                                                    <SelectItem value="+81">+81 (JP)</SelectItem>
                                                    <SelectItem value="+86">+86 (CN)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="mx-1 h-4 w-px shrink-0 bg-border"/>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>

                                <Input
                                    ref={inputRef}
                                    id="auth-account"
                                    type={
                                        mode === "login" && forgotStep === "none"
                                            ? isNumericAccount
                                                ? "tel"
                                                : "text"
                                            : "email"
                                    }
                                    placeholder={
                                        mode === "login" && forgotStep === "none"
                                            ? isNumericAccount
                                                ? t("form.placeholders.phone")
                                                : t("form.placeholders.account")
                                            : t("form.placeholders.email")
                                    }
                                    required
                                    readOnly={isStaticAccount}
                                    tabIndex={isStaticAccount ? -1 : 0}
                                    value={isStaticAccount && isNumericAccount ? `${countryCode} ${account}` : account}
                                    onChange={(event) => setAccount(event.target.value)}
                                    disabled={status !== "idle"}
                                    className={cn(
                                        "h-full w-full border-none bg-transparent shadow-none transition-all duration-500 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0",
                                        isStaticAccount
                                            ? "pointer-events-none px-0 text-center text-lg font-medium text-foreground disabled:opacity-100"
                                            : isNumericAccount
                                                ? "pl-2 pr-4 text-left"
                                                : "px-4 text-left",
                                    )}
                                />
                            </motion.div>
                        </motion.div>

                        <div className="relative flex w-full flex-col">
                            <AnimatePresence initial={false}>
                                {showPasswords ? (
                                    <motion.div
                                        key="credentials-form"
                                        initial={{opacity: 0, height: 0}}
                                        animate={{opacity: 1, height: "auto"}}
                                        exit={{opacity: 0, height: 0}}
                                        transition={{duration: 0.3, ease: "easeInOut"}}
                                        className="w-full overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-4 pb-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="auth-password">
                                                        {forgotStep === "reset"
                                                            ? t("form.labels.newPassword")
                                                            : t("form.labels.password")}
                                                    </Label>
                                                    {mode === "login" && forgotStep === "none" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setForgotStep("email")}
                                                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                                                        >
                                                            {t("form.actions.forgotPassword")}
                                                        </button>
                                                    ) : null}
                                                </div>
                                                <Input
                                                    id="auth-password"
                                                    type="password"
                                                    placeholder={t("form.placeholders.password")}
                                                    required
                                                    value={password}
                                                    onChange={(event) => setPassword(event.target.value)}
                                                    disabled={status !== "idle"}
                                                    className="h-12 rounded-[var(--radius)] border-none bg-muted/40 px-4"
                                                />
                                            </div>

                                            {showConfirmPassword ? (
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="auth-confirm-password">
                                                        {t("form.labels.confirmPassword")}
                                                    </Label>
                                                    <Input
                                                        id="auth-confirm-password"
                                                        type="password"
                                                        placeholder={t("form.placeholders.password")}
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                                        disabled={status !== "idle"}
                                                        className="h-12 rounded-[var(--radius)] border-none bg-muted/40 px-4"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                                {isVerifyOtp ? (
                                    <motion.div
                                        key="verify-form"
                                        initial={{opacity: 0, height: 0}}
                                        animate={{opacity: 1, height: "auto"}}
                                        exit={{opacity: 0, height: 0}}
                                        transition={{duration: 0.3, ease: "easeInOut"}}
                                        className="w-full overflow-hidden"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-6 pt-2 pb-2">
                                            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={status !== "idle"}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                    <InputOTPSlot index={1} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                    <InputOTPSlot index={2} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                    <InputOTPSlot index={3} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                    <InputOTPSlot index={4} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                    <InputOTPSlot index={5} className="h-12 w-10 text-base sm:h-14 sm:w-12 sm:text-lg"/>
                                                </InputOTPGroup>
                                            </InputOTP>

                                            <div className="relative mt-2 flex h-6 w-full items-center justify-center overflow-hidden text-sm text-muted-foreground">
                                                <AnimatePresence mode="wait" initial={false}>
                                                    {countdown === 0 ? (
                                                        <motion.div
                                                            key="resend-prompt"
                                                            initial={{opacity: 0, y: 15}}
                                                            animate={{opacity: 1, y: 0}}
                                                            exit={{opacity: 0, y: -15}}
                                                            transition={{duration: 0.3, ease: "easeInOut"}}
                                                            className="absolute flex items-center justify-center whitespace-nowrap"
                                                        >
                                                            {t("form.resendPrompt")}{" "}
                                                            <button
                                                                type="button"
                                                                onClick={handleResend}
                                                                className="ml-1 rounded px-1 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            >
                                                                {t("form.resendAction")}
                                                            </button>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="countdown-prompt"
                                                            initial={{opacity: 0, y: 15}}
                                                            animate={{opacity: 1, y: 0}}
                                                            exit={{opacity: 0, y: -15}}
                                                            transition={{duration: 0.3, ease: "easeInOut"}}
                                                            className="absolute flex max-w-70 items-center justify-center text-center leading-tight"
                                                        >
                                                            <span className="mr-1 flex h-full shrink-0 items-center text-emerald-500">
                                                                <Check className="size-4"/>
                                                            </span>
                                                            <span>{t("form.sentCountdown", {seconds: countdown})}</span>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>

                        <motion.div layout className="w-full">
                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full"
                                size="lg"
                                isLoading={status === "loading"}
                                isSuccess={status === "success"}
                                disabled={isButtonDisabled}
                            >
                                {buttonText}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
}

function resolveButtonText({
                               mode,
                               registerStep,
                               forgotStep,
                               translate,
                           }: {
    mode: "login" | "register";
    registerStep: RegisterStep;
    forgotStep: ForgotStep;
    translate: (key: string, values?: Record<string, string | number>) => string;
}) {
    if (mode === "login") {
        if (forgotStep === "none") {
            return translate("form.buttons.signIn");
        }

        if (forgotStep === "email") {
            return translate("form.buttons.sendCode");
        }

        if (forgotStep === "verify") {
            return translate("form.buttons.verify");
        }

        return translate("form.buttons.resetPassword");
    }

    if (registerStep === "credentials") {
        return translate("form.buttons.sendCode");
    }

    return translate("form.buttons.verify");
}

function deriveIdentityFromEmail(email: string) {
    const localPart = email.trim().split("@")[0] ?? "";
    const username =
        localPart
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 64) || `shopper-${Date.now().toString().slice(-6)}`;
    const nickname =
        localPart
            .replace(/[._-]+/g, " ")
            .trim()
            .slice(0, 64) || username;

    return {username, nickname};
}
