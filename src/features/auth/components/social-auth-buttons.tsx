"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import { FcGoogle } from "react-icons/fc";
import { SiTiktok, SiX } from "react-icons/si";

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
                <FcGoogle className={"h-6 w-6"}/>
                {t("google")}
            </Button>

            <Button
                variant="outline"
                className="relative flex h-12 w-full items-center justify-center gap-3 bg-black font-medium text-white hover:bg-black/90 hover:text-white"
                isLoading={loadingProvider === "tiktok"}
                disabled={loadingProvider !== null}
                onClick={() => handleAuth("tiktok")}
            >
                <SiTiktok className={"h-6 w-6"}/>
                {t("tiktok")}
            </Button>

            <Button
                variant="outline"
                className="relative flex h-12 w-full items-center justify-center gap-3 bg-black font-medium text-white hover:bg-black/90 hover:text-white"
                isLoading={loadingProvider === "x"}
                disabled={loadingProvider !== null}
                onClick={() => handleAuth("x")}
            >
                <SiX className={"h-6 w-6"}/>
                {t("x")}
            </Button>
        </div>
    );
}
