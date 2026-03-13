import {TrackedErrorState} from "@/components/error/tracked-error-state";
import {listCurrentUserAddresses} from "@/features/address";
import {getCurrentUserAccount, getCurrentUserProfile} from "@/features/profile";
import {AccountCenter} from "@/features/profile/components/account-center";
import {normalizeClientError} from "@/lib/api/normalize-client-error";

/**
 * 个人中心首屏数据结果
 */
type AccountPageDataResult =
    | {
    account: Awaited<ReturnType<typeof getCurrentUserAccount>>;
    profile: Awaited<ReturnType<typeof getCurrentUserProfile>>;
    addresses: Awaited<ReturnType<typeof listCurrentUserAddresses>>;
}
    | {
    error: ReturnType<typeof normalizeClientError>;
};

/**
 * 个人中心页, 服务端首屏读取账户, 资料, 地址三类数据
 *
 * @returns 个人中心页面
 */
export default async function MeAccountPage() {
    const result = await loadAccountPageData();

    if ("error" in result) {
        return (
            <div className="flex min-h-screen items-center justify-center px-6 py-16">
                <main className="w-full max-w-3xl">
                    <TrackedErrorState error={result.error}/>
                </main>
            </div>
        );
    }

    return (
        <AccountCenter
            initialAccount={result.account}
            initialProfile={result.profile}
            initialAddresses={result.addresses}
        />
    );
}

/**
 * 服务端读取个人中心首屏数据, 失败时返回统一错误模型
 *
 * @returns 成功数据或错误对象
 */
async function loadAccountPageData(): Promise<AccountPageDataResult> {
    try {
        const [account, profile, addresses] = await Promise.all([
            getCurrentUserAccount(),
            getCurrentUserProfile(),
            listCurrentUserAddresses({page: 1, size: 20}),
        ]);

        return {account, profile, addresses};
    } catch (error) {
        return {
            error: normalizeClientError(error, "Failed to load account page"),
        };
    }
}
