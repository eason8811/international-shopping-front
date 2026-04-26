import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

import {
    createOAuthLandingUrl,
    readLocaleParam,
    readSafeReturnTo,
    resolveOAuthProvider,
    toFrontendRedirectUrl,
} from "./oauth"

describe("oauth BFF helpers", () => {
    it("maps public provider slugs to backend provider codes", () => {
        expect(resolveOAuthProvider("google")).toBe("GOOGLE")
        expect(resolveOAuthProvider("TikTok")).toBe("TIKTOK")
        expect(resolveOAuthProvider("x")).toBe("X")
        expect(resolveOAuthProvider("github")).toBeNull()
    })

    it("builds a localized success landing URL with a safe return target", () => {
        const request = new NextRequest(
            "https://front.example/api/bff/oauth2/google/authorize?locale=es-ES&returnTo=%2Fes-ES%2Fproducts%3Fpage%3D2",
        )

        expect(readLocaleParam(request)).toBe("es-ES")
        expect(readSafeReturnTo(request)).toBe("/es-ES/products?page=2")
        expect(createOAuthLandingUrl(request, readLocaleParam(request), readSafeReturnTo(request)).toString())
            .toBe("https://front.example/es-ES/auth?oauth=success&returnTo=%2Fes-ES%2Fproducts%3Fpage%3D2")
    })

    it("rejects external return targets and callback redirects", () => {
        const request = new NextRequest(
            "https://front.example/api/bff/oauth2/google/authorize?returnTo=https%3A%2F%2Fevil.example%2Fsteal",
        )
        const fallback = createOAuthLandingUrl(request, "en-US")

        expect(readSafeReturnTo(request)).toBeNull()
        expect(toFrontendRedirectUrl(request, "https://evil.example/steal", fallback).toString())
            .toBe(fallback.toString())
        expect(toFrontendRedirectUrl(request, "/en-US/orders", fallback).toString())
            .toBe("https://front.example/en-US/orders")
    })
})
