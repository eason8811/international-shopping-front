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
type ActivationStep = "none" | "verify" | "success";
type SubmissionStatus = "idle" | "loading" | "success";
type FieldName = "account" | "password" | "confirmPassword";

interface EmailAuthFormProps {
    mode: "login" | "register";
    initialForgotStep?: ForgotStep;
    onSuccess?: () => void;
}

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];
type Translate = (key: string, values?: Record<string, string | number>) => string;

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
    const [activationStep, setActivationStep] = useState<ActivationStep>("none");
    const [countdown, setCountdown] = useState(0);
    const [countryCode, setCountryCode] = useState("+86");
    const [touchedFields, setTouchedFields] = useState<Record<FieldName, boolean>>({
        account: false,
        password: false,
        confirmPassword: false,
    });

    useEffect(() => {
        if (countdown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [countdown]);

    const isActivationVerify = activationStep === "verify";
    const isEmailVerificationFlow = registerStep === "verify" || isActivationVerify;
    const isVerifyOtp = isEmailVerificationFlow || forgotStep === "verify";
    const isStaticAccount = isEmailVerificationFlow || forgotStep === "verify" || forgotStep === "reset";
    const isSuccess = registerStep === "success" || forgotStep === "success" || activationStep === "success";
    const normalizedAccount = account.trim();
    const isNumericAccount =
        mode === "login" &&
        forgotStep === "none" &&
        activationStep === "none" &&
        PHONE_INPUT_REGEX.test(normalizedAccount);
    const showPasswords =
        (mode === "login" && forgotStep === "none" && activationStep === "none") ||
        (mode === "register" && registerStep === "credentials") ||
        forgotStep === "reset";
    const showConfirmPassword =
        (mode === "register" && registerStep === "credentials") || forgotStep === "reset";
    const animatedAccountFieldClassName =
        "relative flex w-full overflow-hidden rounded-[var(--radius)] transition-all duration-500 ease-in-out";
    const interactiveAccountFieldClassName =
        "h-12 items-center bg-muted/40 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:border-destructive/50 dark:data-[invalid=true]:ring-destructive/40";
    const animatedAccountInputClassName =
        "h-full w-full border-none bg-transparent shadow-none transition-all duration-500 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:ring-0 data-[invalid=true]:ring-0";
    const animatedPasswordInputClassName =
        "h-12 rounded-[var(--radius)] border-none bg-muted/40 px-4 shadow-none transition-all duration-500 ease-in-out";
    const accountError = isStaticAccount
        ? null
        : resolveAccountError({
            account: normalizedAccount,
            allowPhone: mode === "login" && forgotStep === "none" && activationStep === "none",
            translate: t,
        });
    const passwordError = showPasswords ? resolvePasswordError(password, t) : null;
    const confirmPasswordError = showConfirmPassword
        ? resolveConfirmPasswordError(password, confirmPassword, t)
        : null;
    const shouldShowAccountError = Boolean(accountError) && touchedFields.account;
    const shouldShowPasswordError = Boolean(passwordError) && touchedFields.password;
    const shouldShowConfirmPasswordError = Boolean(confirmPasswordError) && touchedFields.confirmPassword;
    const activeValidationFields = resolveActiveValidationFields({
        isStaticAccount,
        showPasswords,
        showConfirmPassword,
    });
    const validationErrors: Record<FieldName, string | null> = {
        account: accountError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
    };

    function touchField(field: FieldName) {
        setTouchedFields((current) => (current[field] ? current : {...current, [field]: true}));
    }

    function touchFields(fields: FieldName[]) {
        setTouchedFields((current) => {
            const next = {...current};

            for (const field of fields) {
                next[field] = true;
            }

            return next;
        });
    }

    async function handleResend() {
        if (countdown > 0 || status !== "idle") {
            return;
        }

        setStatus("loading");

        try {
            if (registerStep === "verify" || activationStep === "verify") {
                await resendActivationEmail({email: normalizedAccount});
            } else {
                await requestPasswordReset({
                    account: normalizedAccount,
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

        const hasValidationErrors = activeValidationFields.some((field) => Boolean(validationErrors[field]));
        if (hasValidationErrors) {
            touchFields(activeValidationFields);
            return;
        }

        if (mode === "login") {
            await handleLoginSubmit();
            return;
        }

        await handleRegisterSubmit();
    }

    async function handleLoginSubmit() {
        if (activationStep === "verify") {
            setStatus("loading");

            try {
                await verifyRegistrationEmail({
                    email: normalizedAccount,
                    code: otp,
                });

                setActivationStep("success");
                setStatus("idle");
                window.setTimeout(() => onSuccess?.(), 2200);
            } catch (error) {
                setStatus("idle");
                const normalized = normalizeClientError(error, t("form.errors.verifyFailed"));
                toast.error(normalized.message);
            }

            return;
        }

        if (forgotStep === "none") {
            setStatus("loading");

            try {
                await loginUser({
                    account: normalizedAccount,
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
                const normalized = normalizeClientError(error, t("form.errors.loginFailed"));
                if (normalized.status === 401 && normalized.message === "账户未激活") {
                    try {
                        await resendActivationEmail({email: normalizedAccount});
                        setOtp("");
                        setCountdown(60);
                        setActivationStep("verify");
                    } catch (resendError) {
                        const resendNormalized = normalizeClientError(resendError, t("form.errors.resendFailed"));
                        toast.error(resendNormalized.message);
                    } finally {
                        setStatus("idle");
                    }

                    return;
                }

                setStatus("idle");
                toast.error(normalized.message);
            }

            return;
        }

        if (forgotStep === "email") {
            setStatus("loading");

            try {
                await requestPasswordReset({
                    account: normalizedAccount,
                    countryCode: PHONE_INPUT_REGEX.test(normalizedAccount)
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

        setStatus("loading");

        try {
            await resetPassword({
                account: normalizedAccount,
                countryCode: PHONE_INPUT_REGEX.test(normalizedAccount)
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
            const {username, nickname} = deriveIdentityFromEmail(normalizedAccount);
            setStatus("loading");

            try {
                await registerUser({
                    username,
                    nickname,
                    email: normalizedAccount,
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
                email: normalizedAccount,
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
        activationStep,
        translate: t,
    });

    let isButtonDisabled = status !== "idle";
    if (mode === "login") {
        if (activationStep === "verify") {
            isButtonDisabled = isButtonDisabled || otp.length < 6;
        } else if (forgotStep === "none") {
            isButtonDisabled = isButtonDisabled || !normalizedAccount || !password;
        } else if (forgotStep === "email") {
            isButtonDisabled = isButtonDisabled || !normalizedAccount;
        } else if (forgotStep === "verify") {
            isButtonDisabled = isButtonDisabled || otp.length < 6;
        } else if (forgotStep === "reset") {
            isButtonDisabled = isButtonDisabled || !password || !confirmPassword;
        }
    } else if (registerStep === "credentials") {
        isButtonDisabled = isButtonDisabled || !normalizedAccount || !password || !confirmPassword;
    } else {
        isButtonDisabled = isButtonDisabled || otp.length < 6;
    }
    isButtonDisabled =
        isButtonDisabled || activeValidationFields.some((field) => Boolean(validationErrors[field]));

    return (
        <motion.form
            layout
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 10}}
            transition={{duration: 0.3, ease: "easeInOut"}}
            onSubmit={handleSubmit}
            noValidate
            className="relative flex w-full flex-col gap-4 overflow-hidden p-2"
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
                                "flex flex-col transition-all duration-500 px-2",
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
                                /*animate={{
                                    height: isStaticAccount ? 32 : 48,
                                    backgroundColor: isStaticAccount ? "transparent" : "var(--muted-40)",
                                    justifyContent: isStaticAccount ? "center" : "normal"
                                }}
                                transition={{
                                    layout: { duration: 0.35, ease: "easeInOut" },
                                    height: { duration: 0.35, ease: "easeInOut" },
                                }}*/
                                data-invalid={shouldShowAccountError ? "true" : undefined}
                                className={cn(
                                    animatedAccountFieldClassName,
                                    isStaticAccount
                                        ? "h-8 items-center justify-center bg-transparent"
                                        : interactiveAccountFieldClassName,
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
                                    type="text"
                                    inputMode={
                                        mode === "login" && forgotStep === "none" && activationStep === "none"
                                            ? isNumericAccount
                                                ? "numeric"
                                                : "email"
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
                                    onBlur={() => touchField("account")}
                                    disabled={status !== "idle"}
                                    aria-invalid={shouldShowAccountError || undefined}
                                    data-invalid={shouldShowAccountError ? "true" : undefined}
                                    className={cn(
                                        animatedAccountInputClassName,
                                        isStaticAccount
                                            ? "pointer-events-none px-0 text-center text-lg font-medium text-foreground disabled:opacity-100"
                                            : isNumericAccount
                                                ? "pl-2 pr-4 text-left"
                                                : "px-4 text-left",
                                    )}
                                />
                            </motion.div>

                            <AnimatedFieldError message={shouldShowAccountError ? accountError : null}/>
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
                                            <div className="flex flex-col gap-2 px-2">
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
                                                    onBlur={() => touchField("password")}
                                                    disabled={status !== "idle"}
                                                    aria-invalid={shouldShowPasswordError || undefined}
                                                    data-invalid={shouldShowPasswordError ? "true" : undefined}
                                                    className={animatedPasswordInputClassName}
                                                />

                                                <AnimatedFieldError message={shouldShowPasswordError ? passwordError : null}/>
                                            </div>

                                            {showConfirmPassword ? (
                                                <div className="flex flex-col gap-2 px-2">
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
                                                        onBlur={() => touchField("confirmPassword")}
                                                        disabled={status !== "idle"}
                                                        aria-invalid={shouldShowConfirmPasswordError || undefined}
                                                        data-invalid={shouldShowConfirmPasswordError ? "true" : undefined}
                                                        className={animatedPasswordInputClassName}
                                                    />

                                                    <AnimatedFieldError
                                                        message={shouldShowConfirmPasswordError ? confirmPasswordError : null}
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
                               activationStep,
                               translate,
                           }: {
    mode: "login" | "register";
    registerStep: RegisterStep;
    forgotStep: ForgotStep;
    activationStep: ActivationStep;
    translate: (key: string, values?: Record<string, string | number>) => string;
}) {
    if (mode === "login") {
        if (activationStep === "verify") {
            return translate("form.buttons.verify");
        }

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

function AnimatedFieldError({message}: { message: string | null }) {
    return (
        <AnimatePresence initial={false}>
            {message ? (
                <motion.div
                    key={message}
                    initial={{opacity: 0, height: 0, y: -6}}
                    animate={{opacity: 1, height: "auto", y: 0}}
                    exit={{opacity: 0, height: 0, y: -6}}
                    transition={{duration: 0.2, ease: "easeOut"}}
                    className="overflow-hidden"
                >
                    <p className="pt-0.5 text-xs text-destructive" aria-live="polite">
                        {message}
                    </p>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

function resolveActiveValidationFields({
                                           isStaticAccount,
                                           showPasswords,
                                           showConfirmPassword,
                                       }: {
    isStaticAccount: boolean;
    showPasswords: boolean;
    showConfirmPassword: boolean;
}): FieldName[] {
    const fields: FieldName[] = [];

    if (!isStaticAccount) {
        fields.push("account");
    }

    if (showPasswords) {
        fields.push("password");
    }

    if (showConfirmPassword) {
        fields.push("confirmPassword");
    }

    return fields;
}

function resolveAccountError({
                                 account,
                                 allowPhone,
                                 translate,
                             }: {
    account: string;
    allowPhone: boolean;
    translate: Translate;
}): string | null {
    if (!account) {
        return allowPhone
            ? translate("form.validation.accountRequired")
            : translate("form.validation.emailRequired");
    }

    if (allowPhone && PHONE_INPUT_REGEX.test(account)) {
        return PHONE_REGEX.test(account) ? null : translate("form.validation.phoneInvalid");
    }

    if (EMAIL_REGEX.test(account)) {
        return null;
    }

    if (allowPhone && account.includes("@")) {
        return translate("form.validation.emailInvalid");
    }

    return allowPhone
        ? translate("form.validation.accountInvalid")
        : translate("form.validation.emailInvalid");
}

function resolvePasswordError(password: string, translate: Translate): string | null {
    if (!password) {
        return translate("form.validation.passwordRequired");
    }

    return PASSWORD_REGEX.test(password) ? null : translate("form.validation.passwordInvalid");
}

function resolveConfirmPasswordError(
    password: string,
    confirmPassword: string,
    translate: Translate,
): string | null {
    if (!confirmPassword) {
        return translate("form.validation.confirmPasswordRequired");
    }

    return password === confirmPassword
        ? null
        : translate("form.validation.confirmPasswordMismatch");
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_INPUT_REGEX = /^\d+$/;
const PHONE_REGEX = /^\d{6,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
