import { FaTiktok } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"
import { RiTwitterXFill } from "react-icons/ri"

import { Button } from "@/components/ui/button"
import { getAuthPageEnterItemProps } from "@/features/auth/ui/auth-stagger"
import { cn } from "@/lib/utils"

interface AuthProviderButtonsProps {
  locale: string
  returnTo?: string | null
  labels: {
    google: string
    tiktok: string
    x: string
  }
  className?: string
}

function buildProviderHref(
  provider: "google" | "tiktok" | "x",
  locale: string,
  returnTo?: string | null
) {
  const params = new URLSearchParams({ locale })
  if (returnTo) {
    params.set("returnTo", returnTo)
  }

  return `/api/bff/oauth2/${provider}/authorize?${params.toString()}`
}

export function AuthProviderButtons({
  locale,
  returnTo,
  labels,
  className,
}: AuthProviderButtonsProps) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="w-full" {...getAuthPageEnterItemProps()}>
        <Button
          asChild
          className="w-full"
          size="large"
          variant="primary"
        >
          <a href={buildProviderHref("google", locale, returnTo)}>
            <FcGoogle data-icon="inline-start" />
            {labels.google}
          </a>
        </Button>
      </div>
      <div className="w-full" {...getAuthPageEnterItemProps()}>
        <Button
          asChild
          className="w-full"
          size="large"
          variant="primary"
        >
          <a href={buildProviderHref("tiktok", locale, returnTo)}>
            <FaTiktok data-icon="inline-start" />
            {labels.tiktok}
          </a>
        </Button>
      </div>
      <div className="w-full" {...getAuthPageEnterItemProps()}>
        <Button
          asChild
          className="w-full"
          size="large"
          variant="primary"
        >
          <a href={buildProviderHref("x", locale, returnTo)}>
            <RiTwitterXFill data-icon="inline-start" />
            {labels.x}
          </a>
        </Button>
      </div>
    </div>
  )
}
