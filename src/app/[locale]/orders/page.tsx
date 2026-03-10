import {ArrowRight} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {requireAuthRoute} from "@/lib/auth/route-guard";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

const ORDER_STATUS_ITEMS = [
    {key: "pendingPayment", query: "PENDING_PAYMENT"},
    {key: "readyToShip", query: "READY_TO_SHIP"},
    {key: "inTransit", query: "IN_TRANSIT"},
    {key: "delivered", query: "DELIVERED"},
    {key: "afterSales", query: "AFTER_SALES"},
] as const;

/**
 * 订单页查询参数
 */
interface OrdersPageSearchParams {
    [key: string]: string | string[] | undefined;
    status?: string;
}

/**
 * 订单壳页入参
 */
interface OrdersPageProps {
    /** locale 路由参数 */
    params: Promise<{ locale: string }>;
    /** 查询参数 */
    searchParams: Promise<OrdersPageSearchParams>;
}

/**
 * 订单壳页，先稳定 `/account -> /orders` 的 IA
 *
 * @param props 页面入参
 * @returns 订单壳页
 */
export default async function OrdersPage({params, searchParams}: OrdersPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    await requireAuthRoute({locale, pathname: "/orders", searchParams: search});

    const t = await getTranslations({locale, namespace: "OrdersPage"});
    const activeStatus = ORDER_STATUS_ITEMS.find((item) => item.query === search.status) ?? ORDER_STATUS_ITEMS[0];

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
                        <CardTitle>{t("filters.title")}</CardTitle>
                        <CardDescription>{t("filters.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {ORDER_STATUS_ITEMS.map((item) => {
                                const active = item.query === activeStatus.query;

                                return (
                                    <Link
                                        key={item.key}
                                        href={`/orders?status=${item.query}`}
                                        className={`rounded-xl border p-4 transition ${active
                                            ? "border-zinc-900 bg-zinc-900 text-white"
                                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium">
                                                {t(`filters.items.${item.key}`)}
                                            </span>
                                            <ArrowRight className="size-4"/>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("active.title")}</CardTitle>
                        <CardDescription>{t("active.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Badge variant="secondary">{t(`filters.items.${activeStatus.key}`)}</Badge>
                        <p className="text-sm leading-6 text-zinc-700">{t("active.placeholder")}</p>
                    </CardContent>
                    <CardFooter className="justify-between gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/account">{t("actions.backAccount")}</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/addresses?mode=onboarding">{t("actions.goAddresses")}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
