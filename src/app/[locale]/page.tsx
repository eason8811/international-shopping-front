import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {SessionProbeCard} from "@/components/system/session-probe-card";

/**
 * 首页组件入参, 仅包含 locale 动态参数
 */
interface HomePageProps {
    /** 当前 locale 路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 多语言首页, 展示 Phase 0 引导信息, 语言切换入口, 会话探针卡片
 *
 * @param props 页面入参
 * @returns 首页 RSC 视图
 */
export default async function HomePage({params}: HomePageProps) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "HomePage"});

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
            <main className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {t("eyebrow")}
                </p>
                <h1 className="mb-4 text-3xl font-semibold leading-tight text-zinc-950">
                    {t("title")}
                </h1>
                <p className="mb-8 text-base leading-7 text-zinc-600">
                    {t("description")}
                </p>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/products"
                        className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                        {t("actions.browseProducts")}
                    </Link>
                    <Link
                        href="/admin"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                    >
                        {t("actions.goAdmin")}
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
                <div className="mt-10">
                    <SessionProbeCard/>
                </div>
            </main>
        </div>
    );
}
