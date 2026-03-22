/**
 * 找回密码页, 提供验证码申请与密码重置流程
 *
 * @returns 找回密码页面
 */
export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Route placeholder
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">Forgot password UI removed</h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    This route is reserved for the upcoming rewrite on the new design system. Request logic is still
                    preserved in the auth feature and BFF routes.
                </p>
            </section>
        </main>
    );
}
