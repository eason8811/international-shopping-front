import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {requireAuthRoute} from "@/lib/auth/route-guard";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * 支付壳页入参
 */
interface PaymentsPageProps {
    /** locale 路由参数 */
    params: Promise<{ locale: string }>;
}

/**
 * 支付方式壳页，优先用于保持 `/account` IA 稳定
 *
 * @param props 页面入参
 * @returns 支付壳页
 */
export default async function PaymentsPage({params}: PaymentsPageProps) {
    const {locale} = await params;
    await requireAuthRoute({locale, pathname: "/payments"});

    const t = await getTranslations({locale, namespace: "PaymentsPage"});

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
                        <CardTitle>{t("phase1.title")}</CardTitle>
                        <CardDescription>{t("phase1.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-zinc-700">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{t("phase1.binding")}</Badge>
                            <Badge variant="outline">{t("phase1.password")}</Badge>
                            <Badge variant="outline">{t("phase1.future")}</Badge>
                        </div>
                        <p>{t("phase1.note")}</p>
                    </CardContent>
                    <CardFooter className="justify-between gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/account">{t("actions.backAccount")}</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/support?topic=CONTACT_SUPPORT">{t("actions.goSupport")}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
