import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {requireAuthRoute} from "@/lib/auth/route-guard";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

const SUPPORT_TOPIC_ITEMS = [
    {key: "refundReturn", query: "REFUND_RETURN"},
    {key: "shippingException", query: "SHIPPING_EXCEPTION"},
    {key: "contactSupport", query: "CONTACT_SUPPORT"},
] as const;

/**
 * 客服壳页查询参数
 */
interface SupportPageSearchParams {
    [key: string]: string | string[] | undefined;
    topic?: string;
}

/**
 * 客服壳页入参
 */
interface SupportPageProps {
    /** locale 路由参数 */
    params: Promise<{ locale: string }>;
    /** 查询参数 */
    searchParams: Promise<SupportPageSearchParams>;
}

/**
 * 客服与售后壳页，先占稳定入口位
 *
 * @param props 页面入参
 * @returns 客服壳页
 */
export default async function SupportPage({params, searchParams}: SupportPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    await requireAuthRoute({locale, pathname: "/support", searchParams: search});

    const t = await getTranslations({locale, namespace: "SupportPage"});
    const activeTopic = SUPPORT_TOPIC_ITEMS.find((item) => item.query === search.topic) ?? SUPPORT_TOPIC_ITEMS[0];

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {t("shell.eyebrow")}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                        {t("shell.title")}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                        {t("shell.description")}
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("topics.title")}</CardTitle>
                        <CardDescription>{t("topics.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {SUPPORT_TOPIC_ITEMS.map((item) => (
                                <Button key={item.key} asChild variant={item.query === activeTopic.query ? "default" : "outline"}>
                                    <Link href={`/support?topic=${item.query}`}>{t(`topics.items.${item.key}`)}</Link>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("active.title")}</CardTitle>
                        <CardDescription>{t("active.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-zinc-700">
                        <Badge variant="secondary">{t(`topics.items.${activeTopic.key}`)}</Badge>
                        <p>{t("active.placeholder")}</p>
                    </CardContent>
                    <CardFooter className="justify-between gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/account">{t("actions.backAccount")}</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/orders?status=AFTER_SALES">{t("actions.goOrders")}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
