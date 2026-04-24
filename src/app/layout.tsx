import type {Metadata} from "next";
import type {ReactNode} from "react";

import "./globals.css";

export const metadata: Metadata = {
    title: "International Shopping Front",
    description: "Frontend application shell",
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
