import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

/**
 * 首页组件入参, 仅包含 locale 动态参数
 */
interface HomePageProps {
    /** 当前 locale 路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 多语言首页, 展示账号体系入口与语言切换入口
 *
 * @param props 页面入参
 * @returns 首页 RSC 视图
 */
export default async function HomePage({params}: HomePageProps) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "HomePage"});

    return (
        <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.97_0_0),transparent_62%)]"
            />
            <main
                className="relative mx-auto w-full max-w-3xl animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border bg-card p-10 text-card-foreground shadow-sm duration-500">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {t("eyebrow")}
                </p>
                <h1 className="mb-4 text-3xl font-semibold leading-tight text-zinc-950">
                    {t("title")}
                </h1>
                <p className="mb-8 text-base leading-7 text-zinc-600">
                    {t("description")}
                </p>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                        href="/login"
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                        {t("actions.login")}
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                    >
                        {t("actions.register")}
                    </Link>
                    <Link
                        href="/me/account"
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                    >
                        {t("actions.account")}
                    </Link>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span>{t("language")}:</span>
                    <Link href="/" locale="en-US"
                          className={locale === "en-US" ? "font-semibold text-zinc-900" : "hover:text-zinc-700"}>
                        {t("languageOptions.en-US")}
                    </Link>
                    <span>/</span>
                    <Link href="/" locale="zh-CN"
                          className={locale === "zh-CN" ? "font-semibold text-zinc-900" : "hover:text-zinc-700"}>
                        {t("languageOptions.zh-CN")}
                    </Link>
                </div>
            </main>
        </div>
    );
}
