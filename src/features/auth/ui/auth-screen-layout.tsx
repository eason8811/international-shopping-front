import type { ReactNode } from "react"

const authOrbCool = "#dde4e5"
const authOrbWarm = "#e4e2e1"

interface AuthScreenLayoutProps {
  navbar: ReactNode
  picture: ReactNode
  children: ReactNode
}

export function AuthScreenLayout({
  navbar,
  picture,
  children,
}: AuthScreenLayoutProps) {
  return (
    <div className="relative min-h-screen bg-(--color-background-page)">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 -top-27 size-80 rounded-full opacity-40 blur-[3.75rem] xl:size-128"
          style={{ backgroundColor: authOrbCool }}
        />
        <div
          className="absolute -right-16 -bottom-18 size-72 rounded-full opacity-40 blur-[3.125rem] xl:size-112"
          style={{ backgroundColor: authOrbWarm }}
        />
      </div>

      <div className="relative z-10">
        {navbar}

        <main className="flex min-h-[calc(100svh-3.75rem)] xl:min-h-[calc(100svh-4.75rem)]">
          <section className="flex w-full justify-center px-8 py-12 xl:w-lg xl:px-16">
            <div className="flex w-full items-center justify-center xl:max-w-sm">
              {children}
            </div>
          </section>

          <aside className="hidden flex-1 xl:flex">{picture}</aside>
        </main>
      </div>
    </div>
  )
}
