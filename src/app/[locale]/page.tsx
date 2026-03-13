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
 * 多语言首页, 保留最小应用壳与语言切换入口
 *
 * @param props 页面入参
 * @returns 首页 RSC 视图
 */
export default async function HomePage({params}: HomePageProps) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "HomePage"});

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <main className="w-full max-w-3xl rounded-4xl border border-border bg-card p-10 shadow-sm">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("eyebrow")}
                </p>
                <h1 className="mb-4 font-serif text-4xl leading-tight text-foreground">
                    {t("title")}
                </h1>
                <p className="mb-8 max-w-2xl text-base leading-7 text-muted-foreground">
                    {t("description")}
                </p>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/login"
                        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        {t("actions.openLogin")}
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        {t("actions.openRegister")}
                    </Link>
                    <Link
                        href="/me/account"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        {t("actions.openAccount")}
                    </Link>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{t("language")}:</span>
                    <Link
                        href="/"
                        locale="en-US"
                        className={locale === "en-US" ? "font-semibold text-foreground" : "hover:text-foreground"}
                    >
                        {t("languageOptions.en-US")}
                    </Link>
                    <span>/</span>
                    <Link
                        href="/"
                        locale="zh-CN"
                        className={locale === "zh-CN" ? "font-semibold text-foreground" : "hover:text-foreground"}
                    >
                        {t("languageOptions.zh-CN")}
                    </Link>
                </div>
            </main>
        </div>
    );
}
