import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {AuthBlock, AuthEmailButton, AuthEmailForm, AuthFooterLink, AuthResetPasswordForm, AuthVerifyForm} from "./auth-block";
import {FinancialSummary} from "./financial-summary";
import {StatusBadge} from "./status-badge";
import {Button} from "@/components/ui/button";

describe("design system blocks", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders a status badge from the shared status map", () => {
        render(<StatusBadge domain="order" status="PAID" />);

        expect(screen.getByText("Paid")).toBeInTheDocument();
    });

    it("renders a financial summary with line items and total", () => {
        render(
            <FinancialSummary
                lines={[
                    {id: "subtotal", label: "Subtotal", value: "$120.00"},
                    {id: "shipping", label: "Shipping", value: "$8.00"},
                ]}
                total="$128.00"
            />
        );

        expect(screen.getByText("Summary")).toBeInTheDocument();
        expect(screen.getByText("Subtotal")).toBeInTheDocument();
        expect(screen.getByText("$128.00")).toBeInTheDocument();
    });

    it("renders an auth block with accessible form content", () => {
        render(
            <AuthBlock>
                <AuthEmailForm submitLabel="Sign In" />
            </AuthBlock>
        );

        expect(screen.getByText("Continue with Google")).toBeInTheDocument();
        expect(screen.getByLabelText("Account")).toBeInTheDocument();
        expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("renders auth email and verification flows", () => {
        render(
            <>
                <AuthEmailButton />
                <AuthFooterLink label="New here?" action="Request Access" />
                <AuthVerifyForm email="member@example.com" />
            </>
        );

        expect(screen.getByText("Continue with Email")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Request Access"})).toBeInTheDocument();
        expect(screen.getByText("member@example.com")).toBeInTheDocument();
        expect(screen.getByText("Verify")).toBeInTheDocument();
    });

    it("renders button loading and success states", () => {
        const {container, rerender} = render(
            <Button status="loading">Submit</Button>
        );

        expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
        expect(screen.getByRole("status", {name: "Loading"})).toBeInTheDocument();
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();

        rerender(<Button status="success">Submit</Button>);

        expect(screen.getByRole("button")).toHaveAttribute("data-status", "success");
        expect(screen.getByRole("status", {name: "Done"})).toBeInTheDocument();
        expect(screen.queryByText("Done")).not.toBeInTheDocument();
        expect(container.querySelector(".lucide-check")).toBeInTheDocument();
    });

    it("renders auth input invalid states", () => {
        const {container} = render(
            <AuthEmailForm
                emailInvalid
                emailError="Enter a valid email address."
                passwordInvalid
                passwordError="Secret key must contain at least 8 characters."
            />
        );
        const form = within(container);

        expect(form.getByLabelText("Account")).toHaveAttribute("aria-invalid", "true");
        expect(form.getByLabelText("Secret Key")).toHaveAttribute("aria-invalid", "true");
        expect(form.getByText("Enter a valid email address.")).toBeInTheDocument();
    });

    it("supports controlled auth inputs and password visibility", () => {
        const onEmailValueChange = vi.fn();
        const onPasswordValueChange = vi.fn();

        const {container} = render(
            <AuthEmailForm
                emailValue="member@example.com"
                onEmailValueChange={onEmailValueChange}
                passwordValue="Passw0rd!"
                onPasswordValueChange={onPasswordValueChange}
                showPasswordLabel="Show password"
                hidePasswordLabel="Hide password"
            />
        );
        const form = within(container);

        fireEvent.change(form.getByLabelText("Account"), {
            target: {value: "next@example.com"},
        });
        fireEvent.change(form.getByLabelText("Secret Key"), {
            target: {value: "NextPassw0rd!"},
        });
        fireEvent.click(form.getByRole("button", {name: "Show password"}));

        expect(onEmailValueChange).toHaveBeenCalledWith("next@example.com");
        expect(onPasswordValueChange).toHaveBeenCalledWith("NextPassw0rd!");
        expect(form.getByRole("button", {name: "Hide password"})).toBeInTheDocument();
    });

    it("renders reset password fields with errors", () => {
        const {container} = render(
            <AuthResetPasswordForm
                account="member@example.com"
                codeValue="123"
                codeInvalid
                codeError="Enter the verification code."
                newPasswordInvalid
                newPasswordError="Enter a new password."
                confirmPasswordInvalid
                confirmPasswordError="Passwords do not match."
            />
        );
        const form = within(container);

        expect(form.getByText("member@example.com")).toBeInTheDocument();
        expect(form.getByText("Enter the verification code.")).toBeInTheDocument();
        expect(form.getByText("Enter a new password.")).toBeInTheDocument();
        expect(form.getByText("Passwords do not match.")).toBeInTheDocument();
    });
});
