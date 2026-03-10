import {AlertTriangle, ArrowRight, MapPinned, NotebookText} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {
    getAddressCollectionView,
    getAddressDetailView,
    getAddressRegionText,
    getAddressStreetText,
    type AddressCollectionView,
    type AddressSummary,
} from "@/features/account/server";
import {sanitizeInternalPath} from "@/features/auth/api/client";
import {Link} from "@/i18n/navigation";
import {ServerBffError} from "@/lib/api/server-bff";
import {requireAuthRoute} from "@/lib/auth/route-guard";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

const CREATE_ADDRESS_FIELDS = [
    "receiver_name",
    "phone_country_code",
    "phone_national_number",
    "country",
    "province",
    "city",
    "district",
    "address_line1",
    "address_line2",
    "zipcode",
    "is_default",
    "country_code",
    "language_code",
    "address_source",
    "raw_input",
    "google_placeId",
    "place_response",
];

const UPDATE_ADDRESS_FIELDS = [
    "receiver_name",
    "phone_country_code",
    "phone_national_number",
    "country",
    "province",
    "city",
    "district",
    "address_line1",
    "address_line2",
    "zipcode",
    "is_default",
    "country_code",
    "language_code",
    "address_source",
    "raw_input",
    "google_placeId",
    "place_response",
];

/**
 * 地址页查询参数
 */
interface AddressesPageSearchParams {
    [key: string]: string | string[] | undefined;
    mode?: string;
    intent?: string;
    edit?: string;
    returnTo?: string;
    page?: string;
    size?: string;
}

/**
 * 地址页入参
 */
interface AddressesPageProps {
    /** locale 路由参数 */
    params: Promise<{ locale: string }>;
    /** 查询参数 */
    searchParams: Promise<AddressesPageSearchParams>;
}

/**
 * Phase 1 地址管理页路由
 *
 * 说明：
 * - 本阶段以路由与 BFF 契约接通为主
 * - 新增/编辑表单 UI 先保留为独立路由态说明，不拆实际表单组件
 *
 * @param props 页面入参
 * @returns 地址管理页
 */
export default async function AddressesPage({params, searchParams}: AddressesPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    await requireAuthRoute({locale, pathname: "/addresses", searchParams: search});

    const t = await getTranslations({locale, namespace: "AddressesPage"});
    const safeReturnTo = sanitizeInternalPath(search.returnTo);
    const isOnboarding = search.mode === "onboarding";
    const page = parsePositiveInteger(search.page, 1);
    const size = clamp(parsePositiveInteger(search.size, 20), 1, 50);
    const editId = search.edit?.trim() || undefined;
    const showCreatePanel = search.intent === "create";

    let collection: AddressCollectionView = {
        items: [],
        total: 0,
        defaultAddress: null,
    };
    let listError: ServerBffError | null = null;

    try {
        collection = await getAddressCollectionView(page, size);
    } catch (error) {
        listError = toServerBffError(error, t("errors.listLoadFailed"));
    }

    let editingAddress: AddressSummary | null = null;
    let detailError: ServerBffError | null = null;

    if (editId) {
        try {
            editingAddress = await getAddressDetailView(editId);
        } catch (error) {
            detailError = toServerBffError(error, t("errors.detailLoadFailed"));
        }
    }

    const continueHref = safeReturnTo ?? "/";
    const continueLabel = safeReturnTo?.includes("checkout")
        ? t("actions.returnCheckout")
        : t("actions.continueShopping");

    const createHref = buildAddressesHref({
        mode: isOnboarding ? "onboarding" : undefined,
        returnTo: safeReturnTo ?? undefined,
        intent: "create",
    });

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {t("shell.eyebrow")}
                    </p>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                                {t("shell.title")}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                                {t("shell.description")}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{t("summary.count")}: {collection.total}</Badge>
                            {collection.defaultAddress ? (
                                <Badge variant="secondary">{t("summary.defaultReady")}</Badge>
                            ) : (
                                <Badge variant="destructive">{t("summary.defaultMissing")}</Badge>
                            )}
                            <Button asChild size="sm">
                                <Link href={createHref}>{t("actions.add")}</Link>
                            </Button>
                        </div>
                    </div>
                </header>

                {isOnboarding ? (
                    <Alert>
                        <MapPinned className="size-4"/>
                        <AlertTitle>{t("onboarding.title")}</AlertTitle>
                        <AlertDescription>
                            {collection.defaultAddress
                                ? t("onboarding.completed")
                                : t("onboarding.pending")}
                        </AlertDescription>
                    </Alert>
                ) : null}

                <Alert>
                    <NotebookText className="size-4"/>
                    <AlertTitle>{t("routeOnly.title")}</AlertTitle>
                    <AlertDescription>{t("routeOnly.description")}</AlertDescription>
                </Alert>

                {listError ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="size-4"/>
                        <AlertTitle>{t("errors.listLoadFailed")}</AlertTitle>
                        <AlertDescription>
                            {t("errors.loadFailedDescription", {
                                code: listError.code,
                                traceId: listError.traceId ?? t("errors.traceUnknown"),
                            })}
                        </AlertDescription>
                    </Alert>
                ) : null}

                {showCreatePanel ? (
                    <RouteIntentCard
                        title={t("intent.createTitle")}
                        description={t("intent.createDescription")}
                        endpoint="POST /api/bff/account/addresses"
                        fields={CREATE_ADDRESS_FIELDS}
                    />
                ) : null}

                {editId ? (
                    <RouteIntentCard
                        title={t("intent.editTitle")}
                        description={editingAddress
                            ? t("intent.editDescriptionWithReceiver", {
                                receiver: editingAddress.receiverName ?? t("common.missing"),
                            })
                            : t("intent.editDescription")}
                        endpoint={`PATCH /api/bff/account/addresses/${editId}`}
                        fields={UPDATE_ADDRESS_FIELDS}
                        error={detailError
                            ? t("errors.loadFailedDescription", {
                                code: detailError.code,
                                traceId: detailError.traceId ?? t("errors.traceUnknown"),
                            })
                            : undefined}
                    />
                ) : null}

                {collection.defaultAddress && isOnboarding ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("ready.title")}</CardTitle>
                            <CardDescription>{t("ready.description")}</CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-between gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/account">{t("actions.backAccount")}</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href={continueHref}>{continueLabel}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ) : null}

                {collection.items.length === 0 && !listError ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("empty.title")}</CardTitle>
                            <CardDescription>{t("empty.description")}</CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-between gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/account">{t("actions.backAccount")}</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href={createHref}>{t("actions.add")}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ) : null}

                {collection.items.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {collection.items.map((address) => {
                            const editHref = buildAddressesHref({
                                mode: isOnboarding ? "onboarding" : undefined,
                                returnTo: safeReturnTo ?? undefined,
                                edit: address.id,
                            });

                            return (
                                <Card key={address.id} className={address.id === editId ? "ring-2 ring-zinc-900/10" : undefined}>
                                    <CardHeader>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="space-y-1">
                                                <CardTitle>{address.receiverName ?? t("common.missing")}</CardTitle>
                                                <CardDescription>{address.phone ?? t("common.missing")}</CardDescription>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {address.isDefault ? (
                                                    <Badge variant="secondary">{t("cards.defaultBadge")}</Badge>
                                                ) : null}
                                                <Badge variant={resolveValidationVariant(address.validationStatus)}>
                                                    {getValidationLabel(address.validationStatus, t)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm leading-6 text-zinc-700">
                                        <AddressRow label={t("cards.region")} value={getAddressRegionText(address) || t("common.missing")}/>
                                        <AddressRow label={t("cards.street")} value={getAddressStreetText(address) || t("common.missing")}/>
                                        <AddressRow label={t("cards.zipcode")} value={address.zipcode ?? t("common.missing")}/>
                                        <AddressRow label={t("cards.validatedAt")} value={address.validatedAt ?? t("cards.notValidatedYet")}/>
                                    </CardContent>
                                    <CardFooter className="justify-between gap-3">
                                        <span className="text-xs text-zinc-500">{t("cards.actionsReady")}</span>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={editHref}>
                                                {t("actions.edit")}
                                                <ArrowRight className="size-4"/>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : null}
            </main>
        </div>
    );
}

/**
 * 路由态卡片：用于承接新增/编辑的未来独立表单层
 */
function RouteIntentCard(props: {
    title: string;
    description: string;
    endpoint: string;
    fields: string[];
    error?: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{props.title}</CardTitle>
                <CardDescription>{props.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700">
                    <p className="font-medium text-zinc-950">{props.endpoint}</p>
                </div>
                {props.error ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="size-4"/>
                        <AlertTitle>{props.title}</AlertTitle>
                        <AlertDescription>{props.error}</AlertDescription>
                    </Alert>
                ) : null}
                <div className="flex flex-wrap gap-2">
                    {props.fields.map((field) => (
                        <Badge key={field} variant="outline">{field}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 地址字段展示行
 */
function AddressRow({label, value}: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p>
            <p className="text-sm text-zinc-900">{value}</p>
        </div>
    );
}

/**
 * 生成地址页查询字符串链接
 */
function buildAddressesHref(options: {
    mode?: string;
    returnTo?: string;
    intent?: string;
    edit?: string;
}): string {
    const search = new URLSearchParams();

    if (options.mode) {
        search.set("mode", options.mode);
    }

    if (options.returnTo) {
        search.set("returnTo", options.returnTo);
    }

    if (options.intent) {
        search.set("intent", options.intent);
    }

    if (options.edit) {
        search.set("edit", options.edit);
    }

    const query = search.toString();
    return query ? `/addresses?${query}` : "/addresses";
}

/**
 * 解析正整数查询参数
 */
function parsePositiveInteger(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

/**
 * 约束数值范围
 */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * 将地址加载错误统一为页面可消费的模型
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

/**
 * 地址校验状态文案
 */
function getValidationLabel(
    status: string | null,
    t: Awaited<ReturnType<typeof getTranslations>>,
): string {
    switch (status) {
        case "ACCEPT":
            return t("validation.accept");
        case "REVIEW":
            return t("validation.review");
        case "FIX":
            return t("validation.fix");
        case "REJECT":
            return t("validation.reject");
        case "UNVALIDATED":
            return t("validation.unvalidated");
        default:
            return t("validation.unknown");
    }
}

/**
 * 地址校验状态 badge 样式
 */
function resolveValidationVariant(status: string | null): "outline" | "secondary" | "destructive" {
    switch (status) {
        case "ACCEPT":
            return "secondary";
        case "REVIEW":
        case "FIX":
        case "REJECT":
            return "destructive";
        default:
            return "outline";
    }
}
