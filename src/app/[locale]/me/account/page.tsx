import { listCurrentUserAddresses } from "@/features/address";
import { getCurrentUserAccount, getCurrentUserProfile } from "@/features/profile";
import { UserProfileDashboard } from "@/components/design-system";

/**
 * 个人中心页, 首个 design-system 验证页面
 *
 * @returns 个人中心页面
 */
export default async function MeAccountPage() {
    const [account, profile, addresses] = await Promise.all([
        getCurrentUserAccount(),
        getCurrentUserProfile(),
        listCurrentUserAddresses(),
    ]);

    return (
        <UserProfileDashboard
            initialAccount={account}
            initialProfile={profile}
            initialAddresses={addresses}
        />
    );
}
