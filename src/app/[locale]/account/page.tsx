import {AlertTriangle, ArrowRight, LogOut} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {
    getAccountOverviewView,
    getAddressRegionText,
    getAddressStreetText,
    type AccountOverviewView,
} from "@/features/account/server";
import {Link} from "@/i18n/navigation";
import {ServerBffError} from "@/lib/api/server-bff";
import {requireAuthRoute} from "@/lib/auth/route-guard";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

import {logoutAccountAction} from "./actions";

/**
 * 订单状态快捷入口定义
 */
const ORDER_STATUS_ITEMS = [
    {key: "pendingPayment", query: "PENDING_PAYMENT"},
    {key: "readyToShip", query: "READY_TO_SHIP"},
    {key: "inTransit", query: "IN_TRANSIT"},
    {key: "delivered", query: "DELIVERED"},
    {key: "afterSales", query: "AFTER_SALES"},
] as const;

/**
 * 售后主题入口定义
 */
const SUPPORT_TOPIC_ITEMS = [
    {key: "refundReturn", query: "REFUND_RETURN"},
    {key: "shippingException", query: "SHIPPING_EXCEPTION"},
    {key: "contactSupport", query: "CONTACT_SUPPORT"},
] as const;

/**
 * 账户页入参
 */
interface AccountPageProps {
    /** locale 路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * Phase 1 账户服务中枢路由
 *
 * 说明：
 * - 本阶段只补路由与数据骨架，不拆额外 UI 组件
 * - 首屏围绕任务入口组织：订单、地址、安全、售后
 *
 * @param props 页面入参
 * @returns 账户中心页面
 */
export default async function AccountPage({params}: AccountPageProps) {
    const {locale} = await params;
    await requireAuthRoute({locale, pathname: "/account"});

    const t = await getTranslations({locale, namespace: "AccountPage"});
    const logoutAction = logoutAccountAction.bind(null, locale);

    let overview: AccountOverviewView | null = null;
    let loadError: ServerBffError | null = null;

    try {
        overview = await getAccountOverviewView();
    } catch (error) {
        loadError = toServerBffError(error, t("errors.loadFailed"));
    }

    const bindings = overview?.bindings ?? [];
    const defaultAddress = overview?.defaultAddress ?? null;
    const addressCount = overview?.addressCount ?? 0;

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {t("shell.eyebrow")}
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                            {t("shell.title")}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                            {t("shell.description")}
                        </p>
                    </div>
                </header>

                {loadError ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="size-4"/>
                        <AlertTitle>{t("errors.loadFailed")}</AlertTitle>
                        <AlertDescription>
                            {t("errors.loadFailedDescription", {
                                code: loadError.code,
                                traceId: loadError.traceId ?? t("errors.traceUnknown"),
                            })}
                        </AlertDescription>
                    </Alert>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>{t("orders.title")}</CardTitle>
                        <CardDescription>{t("orders.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {ORDER_STATUS_ITEMS.map((item) => (
                                <Link
                                    key={item.key}
                                    href={`/orders?status=${item.query}`}
                                    className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-zinc-900">
                                            {t(`orders.statuses.${item.key}`)}
                                        </span>
                                        <ArrowRight className="size-4 text-zinc-400 transition group-hover:translate-x-0.5"/>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                                        {t("orders.statusHint")}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("addresses.title")}</CardTitle>
                            <CardDescription>{t("addresses.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {t("addresses.count")}: {addressCount}
                                </Badge>
                                {defaultAddress ? (
                                    <Badge variant="secondary">{t("addresses.defaultReady")}</Badge>
                                ) : (
                                    <Badge variant="destructive">{t("addresses.defaultMissing")}</Badge>
                                )}
                            </div>

                            {defaultAddress ? (
                                <div className="space-y-2 text-sm leading-6 text-zinc-700">
                                    <p className="font-medium text-zinc-950">{defaultAddress.receiverName ?? t("common.missing")}</p>
                                    <p>{defaultAddress.phone ?? t("common.missing")}</p>
                                    <p>{getAddressRegionText(defaultAddress) || t("common.missing")}</p>
                                    <p>{getAddressStreetText(defaultAddress) || t("common.missing")}</p>
                                </div>
                            ) : (
                                <p className="text-sm leading-6 text-zinc-600">{t("addresses.empty")}</p>
                            )}
                        </CardContent>
                        <CardFooter className="justify-between gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/addresses">{t("addresses.manage")}</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/addresses?intent=create">{t("addresses.add")}</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("security.title")}</CardTitle>
                            <CardDescription>{t("security.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-zinc-950">{t("security.bindingsTitle")}</p>
                                <div className="flex flex-wrap gap-2">
                                    {bindings.length > 0 ? (
                                        bindings.map((binding) => (
                                            <Badge key={binding.id} variant="outline">
                                                {binding.provider}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm leading-6 text-zinc-600">{t("security.noBindings")}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm leading-6 text-zinc-600">
                                {t("security.passwordHint")}
                            </p>
                        </CardContent>
                        <CardFooter className="justify-between gap-3">
                            <span className="text-xs text-zinc-500">{t("security.bindingsRouteReady")}</span>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/payments">{t("security.paymentsShell")}</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("support.title")}</CardTitle>
                            <CardDescription>{t("support.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                                {SUPPORT_TOPIC_ITEMS.map((item) => (
                                    <Button key={item.key} asChild variant="outline" className="justify-between">
                                        <Link href={`/support?topic=${item.query}`}>
                                            {t(`support.topics.${item.key}`)}
                                            <ArrowRight className="size-4"/>
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("profile.title")}</CardTitle>
                        <CardDescription>{t("profile.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                            <InfoItem label={t("profile.email")} value={overview?.email}/>
                            <InfoItem label={t("profile.username")} value={overview?.username}/>
                            <InfoItem label={t("profile.nickname")} value={overview?.nickname}/>
                            <InfoItem label={t("profile.language")} value={overview?.language}/>
                        </dl>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <form action={logoutAction}>
                            <Button type="submit" variant="outline" size="sm">
                                <LogOut className="size-4"/>
                                {t("profile.logout")}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}

/**
 * 账户基础信息展示项
 */
function InfoItem({label, value}: { label: string; value: string | null | undefined }) {
    return (
        <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
            <dd className="break-all text-sm font-medium text-zinc-900">{value || "—"}</dd>
        </div>
    );
}

/**
 * 规范化账户总览加载错误
 *
 * @param error 原始错误
 * @param fallback 兜底文案
 * @returns 统一错误对象
 */
function toServerBffError(error: unknown, fallback: string): ServerBffError {
    if (error instanceof ServerBffError) {
        return error;
    }

    if (error instanceof Error) {
        return new ServerBffError({
            status: 500,
            message: error.message,
        });
    }

    return new ServerBffError({
        status: 500,
        message: fallback,
    });
}
