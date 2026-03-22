import localFont from "next/font/local";
import type {Metadata} from "next";
import type {ReactNode} from "react";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import "../globals.css";

const manrope = localFont({
    src: [
        {
            path: "../../../public/fonts/manrope/Manrope-VariableFont_wght.ttf",
            weight: "100 900",
            style: "normal",
        },
    ],
    variable: "--font-sans",
    display: "swap",
});

const newsreader = localFont({
    src: [
        {
            path: "../../../public/fonts/newsreader/Newsreader-Variable.ttf",
            weight: "200 800",
            style: "normal",
        },
    ],
    variable: "--font-serif",
    display: "swap",
});

const jetBrainsMono = localFont({
    src: [
        {
            path: "../../../public/fonts/jetbrains-mono/JetBrainsMono-Variable.ttf",
            weight: "100 800",
            style: "normal",
        },
    ],
    variable: "--font-mono",
    display: "swap",
});

/**
 * locale 布局组件入参, 统一描述路由段 children 与动态 locale 参数
 */
interface LocaleLayoutProps {
    /** 当前路由段渲染内容 */
    children: ReactNode;
    /** Next.js 动态路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 为每个 locale 生成元信息, 页面 title 与 description 都由消息文件提供
 *
 * @param props 布局入参, 不含 children 字段
 * @returns 当前 locale 对应的元信息对象
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
 * 生成静态预渲染参数, 让每个受支持 locale 都参与构建
 *
 * @returns locale 参数数组
 */
export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

/**
 * locale 根布局, 负责校验 locale, 注入国际化上下文, 输出页面壳
 *
 * @param props 布局入参
 * @returns 带 NextIntlClientProvider 的 html 结构
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
        <body
            className={`${manrope.variable} ${newsreader.variable} ${jetBrainsMono.variable} font-sans antialiased`}
        >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </body>
        </html>
    );
}
