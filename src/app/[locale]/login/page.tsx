import { Button, DesignSystemPageShell, EmptyState } from "@/components/design-system";
import { Link } from "@/i18n/navigation";

/**
 * 登录页入参, 读取守卫带来的 redirect 参数
 */
interface LoginPageProps {
    /** 查询参数, redirect 用于记录原始目标路径 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * 登录页占位壳, 后续会在 design-system 基础上重写
 *
 * @param props 页面入参
 * @returns 登录页面
 */
export default async function LoginPage({searchParams}: LoginPageProps) {
    const {redirect} = await searchParams;

    return (
        <DesignSystemPageShell patternName="editorialMasthead">
            <EmptyState
                eyebrow="Route placeholder"
                title="Login UI is scheduled for the next rebuild wave"
                description={
                    redirect
                        ? `The design-system auth flow is not rebuilt yet. Requested redirect: ${redirect}`
                        : "The design-system auth flow is not rebuilt yet. Authentication requests remain available through the retained feature API and BFF chain."
                }
                action={
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/">Back home</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/register">Register route</Link>
                        </Button>
                    </div>
                }
            />
        </DesignSystemPageShell>
    );
}
