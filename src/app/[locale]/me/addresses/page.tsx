import {AccountAddressWorkspace} from "@/features/account/components/account-address-workspace";

/**
 * 地址页, 复用账号与地址工作台, 统一交互与视觉
 *
 * @returns 页面节点
 */
export default function AddressesPage() {
    return <AccountAddressWorkspace initialTab="addresses"/>;
}
