import { MenuIcon, SearchIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  className?: string
}

function SearchPill({
  label,
  placeholder,
  className,
}: {
  label: string
  placeholder: string
  className?: string
}) {
  return (
    <div
      className={cn(
        [
          "flex items-center gap-2 rounded-full border border-(--input-search-border-default)",
          "bg-(--input-search-bg-default) px-4 py-1",
        ].join(" "),
        className
      )}
    >
      <SearchIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-(--color-icon-placeholder)"
      />
      <Input
        aria-label={label}
        className="w-40 text-(--color-text-placeholder)"
        placeholder={placeholder}
        readOnly
        tabIndex={-1}
        variant="search"
      />
    </div>
  )
}

export function Navbar({
  brandLabel,
  nav,
  searchPlaceholder,
  menuLabel,
  searchLabel,
  cartLabel,
  className,
}: NavbarProps) {
  const sharedClassName = cn(
    "relative z-10 w-full border-b border-transparent bg-white/20 backdrop-blur-md",
    className
  )

  return (
    <>
      <header
        className={cn(
          sharedClassName,
          "flex h-15 items-center justify-between px-6 py-4 xl:hidden"
        )}
      >
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
      </header>

      <header
        className={cn(
          sharedClassName,
          "hidden h-19 items-center justify-between px-6 py-4 xl:flex"
        )}
      >
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
          <SearchPill label={searchLabel} placeholder={searchPlaceholder} />
          <Button aria-label={cartLabel} size="default" type="button" variant="naked-icon">
            <ShoppingBagIcon />
          </Button>
        </div>
      </header>
    </>
  )
}
