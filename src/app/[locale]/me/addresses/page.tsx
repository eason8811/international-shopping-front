import { AddressManagementView } from "@/components/design-system";
import { listCurrentUserAddresses, ACCOUNT_CENTER_ADDRESS_PAGE_SIZE } from "@/features/address";

export default async function AddressManagementPage() {
  const initialAddresses = await listCurrentUserAddresses({
    page: 1,
    size: ACCOUNT_CENTER_ADDRESS_PAGE_SIZE,
  });

  return <AddressManagementView initialAddresses={initialAddresses} />;
}
