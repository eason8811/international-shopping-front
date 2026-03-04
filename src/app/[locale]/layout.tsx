import type {Metadata} from "next";
import type {ReactNode} from "react";
import {Geist, Geist_Mono} from "next/font/google";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({
                                           params,
                                       }: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
    const {locale} = await params;
    const safeLocale = hasLocale(routing.locales, locale)
        ? locale
        : routing.defaultLocale;
    const t = await getTranslations({locale: safeLocale, namespace: "Metadata"});

    return {
        title: t("title"),
        description: t("description"),
    };
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: Readonly<LocaleLayoutProps>) {
    const {locale} = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </body>
        </html>
    );
}
