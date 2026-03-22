import {Link} from "@/i18n/navigation";

/**
 * 个人中心页, 服务端首屏读取账户, 资料, 地址三类数据
 *
 * @returns 个人中心页面
 */
export default function MeAccountPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Route placeholder
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">Account center UI removed</h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    The account, profile, and address request modules remain in place. This page is intentionally
                    reduced so the next implementation can be rebuilt cleanly on the updated design system.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        Back home
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        Login route
                    </Link>
                </div>
            </section>
        </main>
    );
}
