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

/**
 * locale 布局组件参数
 */
interface LocaleLayoutProps {
    /** 当前路由段渲染的页面内容 */
    children: ReactNode;
    /** Next.js 动态路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 为每个 locale 生成元信息
 *
 * @param props 布局参数（不含 children）
 * @returns 本地化后的 title/description
 */
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

/**
 * 生成可静态预渲染的 locale 参数
 *
 * @returns 受支持 locale 列表
 */
export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

/**
 * locale 根布局
 *
 * @param props 布局参数
 * @returns 带 {@linkcode NextIntlClientProvider} 的页面壳
 */
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
