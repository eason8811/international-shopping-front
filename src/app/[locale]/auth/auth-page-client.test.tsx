import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthPageClient, type AuthPageCopy } from "./auth-page-client"

const loginUserMock = vi.hoisted(() => vi.fn())
const registerUserMock = vi.hoisted(() => vi.fn())
const verifyRegistrationEmailMock = vi.hoisted(() => vi.fn())
const resendActivationEmailMock = vi.hoisted(() => vi.fn())
const requestPasswordResetMock = vi.hoisted(() => vi.fn())
const resetPasswordMock = vi.hoisted(() => vi.fn())
const toastErrorMock = vi.hoisted(() => vi.fn())
const toastDismissMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/auth", () => ({
    loginUser: loginUserMock,
    registerUser: registerUserMock,
    verifyRegistrationEmail: verifyRegistrationEmailMock,
    resendActivationEmail: resendActivationEmailMock,
    requestPasswordReset: requestPasswordResetMock,
    resetPassword: resetPasswordMock,
}))

vi.mock("sonner", () => ({
    toast: {
        dismiss: toastDismissMock,
        error: toastErrorMock,
    },
}))

const copy: AuthPageCopy = {
    shell: {
        brand: "Curator Profile",
        nav: {
            collections: "Collections",
            newArrivals: "New Arrivals",
            support: "Support",
        },
        searchPlaceholder: "Search the Collection",
        menuLabel: "Open navigation",
        searchLabel: "Search",
        cartLabel: "Shopping bag",
        quote: "Quote",
        quoteAuthor: "Author",
    },
    login: {
        title: "Welcome back",
        subtitle: "Access your boutique journey",
        divider: "or",
        continueWithEmail: "Continue with Email",
        footerPrompt: "New here?",
        footerAction: "Request Access",
    },
    register: {
        title: "Join as a Member",
        subtitle: "Access your boutique journey",
        divider: "or",
        continueWithEmail: "Continue with Email",
        footerPrompt: "Already have an account?",
        footerAction: "Sign In",
    },
    forgot: {
        title: "Reset access",
        subtitle: "Start with email verification, then set a new password.",
        footerPrompt: "Remembered it?",
        footerAction: "Back to login",
    },
    social: {
        google: "Continue with Google",
        tiktok: "Continue with TikTok",
        x: "Continue with X",
    },
    form: {
        labels: {
            account: "Account",
            email: "Email address",
            password: "Secret Key",
            newPassword: "New Password",
            confirmPassword: "Confirm Secret Key",
            verificationSentTo: "Verification code sent to",
        },
        placeholders: {
            account: "Email address or phone number",
            email: "name@example.com",
            password: "password",
        },
        actions: {
            forgotPassword: "Forgot Password",
            showPassword: "Show password",
            hidePassword: "Hide password",
        },
        buttons: {
            signIn: "Sign In",
            signUp: "Sign Up",
            sendCode: "Send email verification code",
            verify: "Verify",
            resetPassword: "Reset Password",
        },
        resendPrompt: "Didn't receive the code?",
        resendAction: "Resend",
        sentCountdown: "Sent. Resend in {seconds}s",
        resendSuccess: "A new verification code has been sent.",
        errors: {
            loginFailed: "The login request failed. Please try again.",
            registerFailed: "The registration request failed. Please try again.",
            verifyFailed: "Verification failed. Please check the code and retry.",
            resetRequestFailed: "The password reset request failed. Please try again.",
            resetFailed: "The password reset request failed. Please check the code and retry.",
            resendFailed: "Resending the verification code failed. Please try again.",
        },
        validation: {
            accountRequired: "Enter an email address or phone number.",
            accountInvalid: "Enter a valid email address or phone number.",
            codeRequired: "Enter the verification code.",
            emailRequired: "Enter an email address.",
            emailInvalid: "Enter a valid email address.",
            phoneInvalid: "Enter a phone number with 6 to 20 digits.",
            passwordRequired: "Enter a password.",
            passwordInvalid:
                "Your password must be at least 8 characters and include one number, one lowercase letter, and one uppercase letter.",
            confirmPasswordRequired: "Confirm your password.",
            confirmPasswordMismatch: "The passwords do not match.",
        },
    },
    reset: {
        accountLabel: "Account in recovery",
        codeLabel: "Verification code",
    },
    success: {
        loginTitle: "Signed In",
        loginDescription: "Your session is active. Redirecting you back...",
        verifyTitle: "Verification Successful",
        verifyDescription: "Your account is verified and ready to use. Redirecting you...",
        resetTitle: "Password Reset Successful",
        resetDescription: "Your password has been updated and the account is ready to continue. Redirecting you...",
        oauthTitle: "Social Sign-In Complete",
        oauthDescription: "Your provider session is connected. Redirecting you back...",
    },
}

describe("AuthPageClient", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("validates login account only after the field changed and blurred", () => {
        render(<AuthPageClient copy={copy} locale="en-US" />)

        fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }))

        const accountInput = screen.getByLabelText("Account")
        fireEvent.focus(accountInput)
        fireEvent.blur(accountInput)

        expect(accountInput).toHaveAttribute("data-variant", "default")
        expect(screen.queryByText("Enter a valid email address or phone number.")).not.toBeInTheDocument()

        fireEvent.change(accountInput, { target: { value: "not-an-email" } })
        fireEvent.blur(accountInput)

        expect(accountInput).toHaveAttribute("data-variant", "destructive")
        expect(screen.getByText("Enter a valid email address or phone number.")).toBeInTheDocument()

        fireEvent.change(accountInput, { target: { value: "member@example.com" } })

        expect(accountInput).toHaveAttribute("data-variant", "default")
        expect(screen.queryByText("Enter a valid email address or phone number.")).not.toBeInTheDocument()
    })

    it("switches AuthEmailForm account field between email and phone variants", () => {
        render(<AuthPageClient copy={copy} locale="en-US" />)

        fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }))

        const accountInput = screen.getByLabelText("Account")

        expect(screen.queryByText("+86 (CN)")).not.toBeInTheDocument()

        fireEvent.change(accountInput, { target: { value: "13800138000" } })

        expect(screen.getByRole("combobox", { name: "Phone country code" })).toHaveTextContent("+86 (CN)")
        expect(accountInput.closest("[data-account-variant]")).toHaveAttribute(
            "data-account-variant",
            "phone",
        )

        fireEvent.change(accountInput, { target: { value: "member@example.com" } })

        expect(screen.queryByText("+86 (CN)")).not.toBeInTheDocument()
        expect(accountInput.closest("[data-account-variant]")).toHaveAttribute(
            "data-account-variant",
            "email",
        )
    })

    it("sends the selected country code when logging in with a phone account", async () => {
        loginUserMock.mockResolvedValueOnce({})

        render(<AuthPageClient copy={copy} locale="en-US" />)

        fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }))
        fireEvent.change(screen.getByLabelText("Account"), {
            target: { value: "13800138000" },
        })
        fireEvent.change(screen.getByLabelText("Secret Key"), {
            target: { value: "Password1" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

        await waitFor(() => {
            expect(loginUserMock).toHaveBeenCalledWith({
                account: "13800138000",
                password: "Password1",
                countryCode: "86",
            })
        })
    })

    it("validates registration password and confirmation after blur", () => {
        render(<AuthPageClient copy={copy} locale="en-US" />)

        fireEvent.click(screen.getByRole("button", { name: "Request Access" }))
        fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }))

        const passwordInput = screen.getByLabelText("Secret Key")
        const confirmInput = screen.getByLabelText("Confirm Secret Key")

        fireEvent.change(passwordInput, { target: { value: "Password" } })
        fireEvent.blur(passwordInput)

        expect(passwordInput).toHaveAttribute("data-variant", "destructive")
        expect(screen.getByText(copy.form.validation.passwordInvalid)).toBeInTheDocument()

        fireEvent.change(passwordInput, { target: { value: "Password1" } })

        expect(passwordInput).toHaveAttribute("data-variant", "default")

        fireEvent.change(confirmInput, { target: { value: "Password2" } })
        fireEvent.blur(confirmInput)

        expect(confirmInput).toHaveAttribute("data-variant", "destructive")
        expect(screen.getByText("The passwords do not match.")).toBeInTheDocument()

        fireEvent.change(confirmInput, { target: { value: "Password1" } })

        expect(confirmInput).toHaveAttribute("data-variant", "default")
        expect(screen.queryByText("The passwords do not match.")).not.toBeInTheDocument()
    })

    it("shows request errors with sonner instead of inline content", async () => {
        loginUserMock.mockRejectedValueOnce(new Error("Backend unavailable"))

        render(<AuthPageClient copy={copy} locale="en-US" />)

        fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }))
        fireEvent.change(screen.getByLabelText("Account"), {
            target: { value: "member@example.com" },
        })
        fireEvent.change(screen.getByLabelText("Secret Key"), {
            target: { value: "Password1" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith(
                "Backend unavailable",
                expect.objectContaining({ description: undefined }),
            )
        })
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
})
