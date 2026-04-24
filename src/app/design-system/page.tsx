import type { Metadata } from "next"

import { AuthDesignSystemShowcase } from "./auth-showcase"

export const metadata: Metadata = {
    title: "Auth Design System Validation",
}

export default function DesignSystemValidationPage() {
    return <AuthDesignSystemShowcase />
}
