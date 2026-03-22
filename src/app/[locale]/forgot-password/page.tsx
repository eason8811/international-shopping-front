import { Button, DesignSystemPageShell, EmptyState } from "@/components/design-system";
import { Link } from "@/i18n/navigation";

/**
 * 找回密码页占位壳, 后续会在 design-system 基础上重写
 *
 * @returns 找回密码页面
 */
export default function ForgotPasswordPage() {
    return (
        <DesignSystemPageShell patternName="editorialMasthead">
            <EmptyState
                eyebrow="Route placeholder"
                title="Password recovery UI is scheduled for the next rebuild wave"
                description="The route remains active so the request chain stays intact, but the interactive recovery flow will be rebuilt after the account and address validation surfaces."
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
