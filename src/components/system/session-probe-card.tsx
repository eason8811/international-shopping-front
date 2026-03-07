"use client";

import {CheckCircle2, LoaderCircle} from "lucide-react";
import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";

import {TrackedErrorState, type TrackedErrorStateModel} from "@/components/error/tracked-error-state";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * 会话探针成功数据, 对应 /api/bff/me 的核心字段
 */
interface SessionProbeData {
    /** 用户 ID */
    id: number;
    /** 用户名, 可选 */
    name?: string;
}

/**
 * 成功响应结构, 与 BFF Result 协议保持一致
 */
interface SuccessEnvelope<T = unknown> {
    /** 成功标记 */
    success: true;
    /** 业务码 */
    code: string;
    /** 业务消息 */
    message: string;
    /** 时间戳 */
    timestamp: string;
    /** trace 标识 */
    traceId?: string;
    /** 业务数据 */
    data?: T;
}

/**
 * 失败响应结构, 与 BFF Result 协议保持一致
 */
interface ErrorEnvelope {
    /** 成功标记 */
    success: false;
    /** 业务码 */
    code: string;
    /** 业务消息 */
    message: string;
    /** 时间戳 */
    timestamp: string;
    /** trace 标识 */
    traceId?: string;
}

/**
 * 探针组件状态机, 用于驱动加载, 成功, 失败三态视图
 */
type ProbeState =
    | { type: "loading" }
    | { type: "success"; payload: SuccessEnvelope<SessionProbeData> }
    | { type: "error"; payload: TrackedErrorStateModel };

/**
 * Phase 0 联调探针组件, 拉取 /api/bff/me, 展示统一成功与错误状态
 *
 * @returns 探针卡片节点
 */
export function SessionProbeCard() {
    const t = useTranslations("SessionProbe");
    const [state, setState] = useState<ProbeState>({type: "loading"});

    /**
     * 执行会话探针请求, 并将返回结果归一到组件状态机
     *
     * @returns Promise<void>
     */
    async function probe() {
        try {
            const response = await fetch("/api/bff/me", {
                method: "GET",
                cache: "no-store",
                credentials: "include",
            });

            const payload = (await response.json()) as SuccessEnvelope<SessionProbeData> | ErrorEnvelope;
            if (response.ok && payload.success) {
                setState({
                    type: "success",
                    payload,
                });
                return;
            }

            setState({
                type: "error",
                payload: {
                    status: response.status,
                    code: payload.code ?? "INTERNAL_SERVER_ERROR",
                    message: payload.message ?? t("unknownError"),
                    traceId: payload.traceId,
                },
            });
        } catch (error) {
            const fallbackMessage = error instanceof Error ? error.message : t("unknownError");
            setState({
                type: "error",
                payload: {
                    status: 500,
                    code: "INTERNAL_SERVER_ERROR",
                    message: fallbackMessage,
                },
            });
        }
    }

    /**
     * 手动重试探针, 先切回 loading, 再重新请求
     */
    function retryProbe() {
        setState({type: "loading"});
        void probe();
    }

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const response = await fetch("/api/bff/me", {
                    method: "GET",
                    cache: "no-store",
                    credentials: "include",
                });

                const payload = (await response.json()) as SuccessEnvelope<SessionProbeData> | ErrorEnvelope;
                if (cancelled)
                    return;

                if (response.ok && payload.success) {
                    setState({
                        type: "success",
                        payload,
                    });
                    return;
                }

                setState({
                    type: "error",
                    payload: {
                        status: response.status,
                        code: payload.code ?? "INTERNAL_SERVER_ERROR",
                        message: payload.message ?? t("unknownError"),
                        traceId: payload.traceId,
                    },
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const fallbackMessage = error instanceof Error ? error.message : t("unknownError");
                setState({
                    type: "error",
                    payload: {
                        status: 500,
                        code: "INTERNAL_SERVER_ERROR",
                        message: fallbackMessage,
                    },
                });
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [t]);

    if (state.type === "loading") {
        return (
            <Card className="w-full border border-zinc-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-900">{t("title")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-zinc-600">
                    <LoaderCircle className="size-4 animate-spin"/>
                    <span>{t("loading")}</span>
                </CardContent>
            </Card>
        );
    }

    if (state.type === "error") {
        return <TrackedErrorState error={state.payload} onRetry={retryProbe}/>;
    }

    return (
        <Card className="w-full border border-zinc-200 bg-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base text-zinc-900">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="inline-flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="size-4"/>
                    <span>{t("success")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{t("labels.userId")}: {state.payload.data?.id ?? "-"}</Badge>
                    <Badge variant="outline">{t("labels.code")}: {state.payload.code}</Badge>
                    <Badge variant="secondary">
                        {t("labels.traceId")}: {state.payload.traceId ?? t("labels.missingTraceId")}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
