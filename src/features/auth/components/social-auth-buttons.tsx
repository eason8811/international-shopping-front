"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";

export function SocialAuthButtons() {
    const t = useTranslations("AuthUi.social");
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    function handleAuth(provider: string) {
        setLoadingProvider(provider);

        window.setTimeout(() => {
            setLoadingProvider(null);
            toast.message(t("comingSoon"));
        }, 1200);
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <Button
                variant="outline"
                className="relative flex h-12 w-full items-center justify-center gap-3 bg-black font-medium text-white hover:bg-black/90 hover:text-white"
                isLoading={loadingProvider === "google"}
                disabled={loadingProvider !== null}
                onClick={() => handleAuth("google")}
            >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("google")}
            </Button>

            <Button
                variant="outline"
                className="relative flex h-12 w-full items-center justify-center gap-3 bg-black font-medium text-white hover:bg-black/90 hover:text-white"
                isLoading={loadingProvider === "tiktok"}
                disabled={loadingProvider !== null}
                onClick={() => handleAuth("tiktok")}
            >
                <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-.71 4.46-2.1 6.13-1.39 1.67-3.34 2.86-5.5 3.1-2.17.24-4.46-.07-6.38-1.15-1.92-1.08-3.46-2.89-4.25-4.94-.79-2.05-.82-4.4-.1-6.5C.32 10.95 2.52 9.07 4.94 8.44c1.19-.31 2.45-.33 3.65-.05V12.4c-1.29-.16-2.67.22-3.6 1.09-.93.88-1.46 2.2-1.28 3.5.18 1.3 1.05 2.45 2.25 2.98 1.2.53 2.62.43 3.73-.25 1.12-.68 1.87-1.87 2.04-3.18.15-1.14.07-5.53.07-6.53 0-3.36.03-6.72-.03-10.08Z"/>
                </svg>
                {t("tiktok")}
            </Button>

            <Button
                variant="outline"
                className="relative flex h-12 w-full items-center justify-center gap-3 bg-black font-medium text-white hover:bg-black/90 hover:text-white"
                isLoading={loadingProvider === "x"}
                disabled={loadingProvider !== null}
                onClick={() => handleAuth("x")}
            >
                <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                {t("x")}
            </Button>
        </div>
    );
}
