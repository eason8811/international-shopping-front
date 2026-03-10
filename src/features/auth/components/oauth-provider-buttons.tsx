import type {ComponentType} from "react";
import {SiGoogle, SiTiktok, SiX} from "react-icons/si";

import {Button} from "@/components/ui/button";
import {OAUTH_PROVIDERS, type OAuthProvider} from "@/features/auth/constants";

/**
 * 提供方图标映射, 统一提供方顺序, 图标来源和品牌颜色类名
 */
const PROVIDER_ICON_MAP: Record<OAuthProvider, {
    icon: ComponentType<{ className?: string }>;
    iconClassName: string
}> = {
    GOOGLE: {
        icon: SiGoogle,
        iconClassName: "text-[#4285F4]",
    },
    TIKTOK: {
        icon: SiTiktok,
        iconClassName: "text-[#111111]",
    },
    X: {
        icon: SiX,
        iconClassName: "text-[#111111]",
    },
};

/**
 * 提供方按钮组属性, 用于 OAuth 登录入口
 */
interface OAuthProviderButtonsProps {
    labels: Record<OAuthProvider, string>;
    pendingProvider: OAuthProvider | null;
    onSelect: (provider: OAuthProvider) => void;
    disabled?: boolean;
}

/**
 * 渲染 OAuth 提供方按钮, 包含进行中和禁用态处理
 *
 * @param props OAuth 按钮组属性
 * @returns OAuth 提供方按钮组
 */
export function OAuthProviderButtons({
                                         labels,
                                         pendingProvider,
                                         onSelect,
                                         disabled = false,
                                     }: OAuthProviderButtonsProps) {
    return (
        <div className="space-y-3">
            {OAUTH_PROVIDERS.map((provider) => {
                const isPending = pendingProvider === provider;
                const iconConfig = PROVIDER_ICON_MAP[provider];
                const Icon = iconConfig.icon;

                return (
                    <Button
                        key={provider}
                        variant="outline"
                        size="lg"
                        className="h-11 w-full justify-center gap-2"
                        disabled={disabled || pendingProvider !== null}
                        onClick={() => onSelect(provider)}
                        type="button"
                    >
                        <Icon className={`size-4 ${iconConfig.iconClassName}`}/>
                        <span>{isPending ? `${labels[provider]}...` : labels[provider]}</span>
                    </Button>
                );
            })}
        </div>
    );
}
