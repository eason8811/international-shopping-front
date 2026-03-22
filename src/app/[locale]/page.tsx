import { getTranslations } from "next-intl/server";

import { Button, DesignSystemPageShell, EditorialMasthead, PreferenceCard } from "@/components/design-system";
import { Link } from "@/i18n/navigation";

/**
 * 首页组件入参, 仅包含 locale 动态参数
 */
interface HomePageProps {
    /** 当前 locale 路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 多语言首页, 使用新的设计系统展示验证入口
 *
 * @param props 页面入参
 * @returns 首页 RSC 视图
 */
export default async function HomePage({params}: HomePageProps) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "HomePage"});

    return (
        <DesignSystemPageShell patternName="editorialMasthead">
            <EditorialMasthead
                eyebrow={t("eyebrow")}
                metadata={locale}
                title={t("title")}
                description={t("description")}
                primaryAction={
                    <Button asChild>
                        <Link href="/me/account">{t("actions.openAccount")}</Link>
                    </Button>
                }
                secondaryAction={
                    <Button asChild variant="secondary">
                        <Link href="/login">{t("actions.openLogin")}</Link>
                    </Button>
                }
            />

            <PreferenceCard title={t("language")} description={t("description")}>
                <div className="flex flex-wrap gap-3">
                    <Button asChild variant={locale === "en-US" ? "primary" : "secondary"}>
                        <Link href="/" locale="en-US">
                            {t("languageOptions.en-US")}
                        </Link>
                    </Button>
                    <Button asChild variant={locale === "zh-CN" ? "primary" : "secondary"}>
                        <Link href="/" locale="zh-CN">
                            {t("languageOptions.zh-CN")}
                        </Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/register">{t("actions.openRegister")}</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/me/addresses">{t("actions.openAddresses")}</Link>
                    </Button>
                </div>
            </PreferenceCard>
        </DesignSystemPageShell>
    );
}
