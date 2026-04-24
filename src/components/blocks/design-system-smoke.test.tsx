import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";

import {AuthBlock} from "./auth-block";
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
            <AuthBlock title="Sign in" description="Access your account">
                <label htmlFor="email">Email</label>
                <input id="email" />
            </AuthBlock>
        );

        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });
});
