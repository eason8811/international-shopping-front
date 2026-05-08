import type {Metadata} from "next";
import localFont from "next/font/local";
import type {ReactNode} from "react";

import {Toaster} from "@/components/ui/sonner";

import "./globals.css";

const manrope = localFont({
    src: "../../public/fonts/manrope/Manrope-VariableFont_wght.ttf",
    variable: "--font-family-sans",
    weight: "200 800",
    display: "swap",
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    preload: true,
});

const newsreader = localFont({
    src: [
        {
            path: "../../public/fonts/newsreader/Newsreader[opsz,wght].ttf",
            weight: "300 800",
            style: "normal",
        },
        {
            path: "../../public/fonts/newsreader/Newsreader-Italic[opsz,wght].ttf",
            weight: "300 800",
            style: "italic",
        },
    ],
    variable: "--font-family-serif",
    display: "swap",
    fallback: ["ui-serif", "Georgia", "serif"],
    preload: true,
});

const jetbrainsMono = localFont({
    src: "../../public/fonts/jetbrains-mono/JetBrainsMono-Variable.ttf",
    variable: "--font-family-mono",
    weight: "100 800",
    display: "swap",
    fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
    preload: false,
});

const fontVariables = [
    manrope.variable,
    newsreader.variable,
    jetbrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
    title: "International Shopping Front",
    description: "Frontend application shell",
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
    return (
        <html lang="en" className={fontVariables} suppressHydrationWarning>
            <body suppressHydrationWarning>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
