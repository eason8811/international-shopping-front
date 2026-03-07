import {LockKeyhole} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * 登录页入参, 读取守卫带来的 redirect 参数
 */
interface LoginPageProps {
    /** 查询参数, redirect 用于记录原始目标路径 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * Phase 0 登录占位页, 作为守卫跳转承接点, 展示下一步可执行动作
 *
 * @param props 页面入参
 * @returns 登录占位页面
 */
export default async function LoginPage({searchParams}: LoginPageProps) {
    const t = await getTranslations("LoginPage");
    const {redirect} = await searchParams;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
            <Card className="w-full max-w-xl border border-zinc-200 bg-white">
                <CardHeader className="space-y-2">
                    <div
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                        <LockKeyhole className="size-3.5"/>
                        <span>{t("eyebrow")}</span>
                    </div>
                    <CardTitle className="text-2xl leading-tight text-zinc-950">{t("title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-zinc-600">
                    <p>{t("description")}</p>
                    {redirect ? (
                        <Badge variant="outline" className="break-all whitespace-normal">
                            {t("redirectLabel")}: {redirect}
                        </Badge>
                    ) : null}
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t border-zinc-200 bg-zinc-50/80">
                    <Button asChild variant="outline">
                        <Link href="/">{t("actions.goHome")}</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/products">{t("actions.continueAsGuest")}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
