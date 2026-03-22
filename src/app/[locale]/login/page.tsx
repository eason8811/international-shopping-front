import {Link} from "@/i18n/navigation";

/**
 * 登录页入参, 读取守卫带来的 redirect 参数
 */
interface LoginPageProps {
    /** 查询参数, redirect 用于记录原始目标路径 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * 登录页, 承接认证入口与守卫跳转
 *
 * @param props 页面入参
 * @returns 登录页面
 */
export default async function LoginPage({searchParams}: LoginPageProps) {
    const {redirect} = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Route placeholder
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">Login UI removed</h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Authentication requests are still available through the retained feature API and BFF chain.
                </p>
                {redirect ? (
                    <p className="mt-4 text-xs text-muted-foreground">Requested redirect: {redirect}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        Back home
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        Register route
                    </Link>
                </div>
            </section>
        </main>
    );
}
