import type { ReactNode } from "react"
import { MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

import { LogoLockup } from "./logo-lockup"

interface NavbarCopy {
  collections: string
  newArrivals: string
  support: string
}

interface NavbarProps {
  brandLabel: string
  nav: NavbarCopy
  searchPlaceholder: string
  menuLabel: string
  searchLabel: string
  cartLabel: string
  profileLabel: string
  className?: string
}

function NavbarShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "relative isolate z-10 w-full overflow-hidden",
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/20" />
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 backdrop-blur-md",
          "[-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_100%)]",
          "mask-[linear-gradient(to_top,transparent_0%,black_100%)]",
        ].join(" ")}
      />
      <div className="relative z-10 flex h-full items-center justify-between px-6 py-4">
        {children}
      </div>
    </header>
  )
}

export function Navbar({
  brandLabel,
  nav,
  searchPlaceholder,
  menuLabel,
  searchLabel,
  cartLabel,
  profileLabel,
  className,
}: NavbarProps) {
  return (
    <>
      <NavbarShell className={cn("h-15 lg:hidden", className)}>
        <div className="flex items-center gap-6">
          <Button aria-label={menuLabel} size="default" type="button" variant="naked-icon">
            <MenuIcon />
          </Button>
          <Button aria-label={searchLabel} size="default" type="button" variant="naked-icon">
            <SearchIcon />
          </Button>
        </div>
        <LogoLockup brandLabel={brandLabel} />
        <div className="flex items-center gap-6">
          <Button aria-label={searchLabel} size="default" type="button" variant="naked-icon">
            <SearchIcon />
          </Button>
          <Button aria-label={cartLabel} size="default" type="button" variant="naked-icon">
            <ShoppingBagIcon />
          </Button>
        </div>
      </NavbarShell>

      <NavbarShell className={cn("hidden h-19 lg:block xl:hidden", className)}>
        <div className="flex items-center gap-8">
          <LogoLockup brandLabel={brandLabel} />
          <nav aria-label="Primary" className="flex items-center gap-10">
            <Button size="default" type="button" variant="naked">
              {nav.collections}
            </Button>
            <Button size="default" type="button" variant="naked">
              {nav.newArrivals}
            </Button>
            <Button size="default" type="button" variant="naked">
              {nav.support}
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <SearchInput label={searchLabel} placeholder={searchPlaceholder} />
          <Button aria-label={profileLabel} size="default" type="button" variant="naked-icon">
            <UserIcon />
          </Button>
          <Button aria-label={cartLabel} size="default" type="button" variant="naked-icon">
            <ShoppingBagIcon />
          </Button>
        </div>
      </NavbarShell>

      <NavbarShell className={cn("hidden h-19 xl:block", className)}>
        <div className="flex items-center gap-8">
          <LogoLockup brandLabel={brandLabel} />
          <nav aria-label="Primary" className="flex items-center gap-10">
            <Button size="default" type="button" variant="naked">
              {nav.collections}
            </Button>
            <Button size="default" type="button" variant="naked">
              {nav.newArrivals}
            </Button>
            <Button size="default" type="button" variant="naked">
              {nav.support}
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <SearchInput label={searchLabel} placeholder={searchPlaceholder} />
          <Button aria-label={cartLabel} size="default" type="button" variant="naked-icon">
            <ShoppingBagIcon />
          </Button>
        </div>
      </NavbarShell>
    </>
  )
}
