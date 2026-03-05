"use client";

import {AlertCircle, ShieldAlert, ShieldX, Siren, TriangleAlert} from "lucide-react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * 统一错误展示最小模型, 所有错误卡片都使用该结构渲染
 */
export interface TrackedErrorStateModel {
    /** HTTP 状态码 */
    status: number;
    /** 业务错误码 */
    code: string;
    /** 后端返回的错误消息 */
    message: string;
    /** 可选链路追踪标识 */
    traceId?: string;
}

/**
 * 错误归类枚举, 用于驱动图标, 文案, 操作按钮
 */
type ErrorKind = "unauthorized" | "csrf" | "rateLimit" | "server" | "unknown";

/**
 * 统一错误组件入参
 */
interface TrackedErrorStateProps {
    /** 错误模型 */
    error: TrackedErrorStateModel;
    /** 可选重试回调 */
    onRetry?: () => void;
}

/**
 * 根据状态码, 错误码, 消息内容进行错误归类
 *
 * @param error 错误模型
 * @returns 错误类别
 */
function resolveErrorKind(error: TrackedErrorStateModel): ErrorKind {
    const normalizedCode = error.code.toUpperCase();
    const normalizedMessage = error.message.toLowerCase();

    if (error.status === 401 || normalizedCode === "UNAUTHORIZED")
        return "unauthorized";

    if (
        normalizedMessage.includes("csrf") ||
        normalizedCode === "FORBIDDEN" ||
        normalizedCode === "UNPROCESSABLE_ENTITY"
    )
        return "csrf";

    if (error.status === 429 || normalizedCode === "TOO_MANY_REQUESTS")
        return "rateLimit";

    if (error.status >= 500 || normalizedCode === "INTERNAL_SERVER_ERROR")
        return "server";

    return "unknown";
}

/**
 * 根据错误类别选择图标
 *
 * @param props 图标入参
 * @returns 错误图标节点
 */
function ErrorKindIcon({kind}: { kind: ErrorKind }) {
    if (kind === "unauthorized") {
        return <ShieldAlert className="size-4"/>;
    }

    if (kind === "csrf") {
        return <ShieldX className="size-4"/>;
    }

    if (kind === "rateLimit") {
        return <Siren className="size-4"/>;
    }

    if (kind === "server") {
        return <TriangleAlert className="size-4"/>;
    }

    return <AlertCircle className="size-4"/>;
}

/**
 * 可复用错误展示组件, 统一样式, 统一文案, 统一追踪信息位置
 *
 * @param props 组件入参
 * @returns 错误卡片节点
 */
export function TrackedErrorState({error, onRetry}: TrackedErrorStateProps) {
    const t = useTranslations("TrackedError");
    const kind = resolveErrorKind(error);

    return (
        <Card className="w-full border border-zinc-200 bg-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base text-zinc-900">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert variant={kind === "server" ? "destructive" : "default"}>
                    <ErrorKindIcon kind={kind}/>
                    <AlertTitle>{t(`kinds.${kind}.title`)}</AlertTitle>
                    <AlertDescription>{t(`kinds.${kind}.description`)}</AlertDescription>
                </Alert>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">HTTP {error.status}</Badge>
                    <Badge variant="outline">{t("labels.code")}: {error.code}</Badge>
                    <Badge variant="secondary">
                        {t("labels.traceId")}: {error.traceId ?? t("labels.missingTraceId")}
                    </Badge>
                </div>

                <p className="text-sm text-zinc-600">
                    {t("labels.backendMessage")}: {error.message}
                </p>
            </CardContent>

            <CardFooter className="justify-end gap-2 border-t border-zinc-200 bg-zinc-50/80">
                {kind === "unauthorized" ? (
                    <Button asChild size="sm">
                        <Link href="/login">{t("actions.goLogin")}</Link>
                    </Button>
                ) : null}
                {onRetry ? (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                        {t("actions.retry")}
                    </Button>
                ) : null}
            </CardFooter>
        </Card>
    );
}
