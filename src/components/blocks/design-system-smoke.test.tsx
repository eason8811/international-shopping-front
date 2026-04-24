import {render, screen, within} from "@testing-library/react";
import {describe, expect, it} from "vitest";

import {AuthBlock, AuthEmailButton, AuthEmailForm, AuthFooterLink, AuthVerifyForm} from "./auth-block";
import {FinancialSummary} from "./financial-summary";
import {StatusBadge} from "./status-badge";

describe("design system blocks", () => {
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
});
