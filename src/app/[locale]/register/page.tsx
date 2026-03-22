import { Button, DesignSystemPageShell, EmptyState } from "@/components/design-system";
import { Link } from "@/i18n/navigation";

/**
 * 注册页占位壳, 后续会在 design-system 基础上重写
 *
 * @returns 注册页面
 */
export default function RegisterPage() {
    return (
        <DesignSystemPageShell patternName="editorialMasthead">
            <EmptyState
                eyebrow="Route placeholder"
                title="Register UI is scheduled for the next rebuild wave"
                description="Registration request logic stays in the auth feature and BFF routes. The visual flow will be rebuilt from the same canonical primitives now used by the account center."
                action={
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/">Back home</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/login">Login route</Link>
                        </Button>
                    </div>
                }
            />
        </DesignSystemPageShell>
    );
}
