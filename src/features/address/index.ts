export {
    createCurrentUserAddress,
    deleteCurrentUserAddress,
    getCurrentUserAddress,
    listCurrentUserAddresses,
    setCurrentUserDefaultAddress,
    updateCurrentUserAddress,
} from "./api";
export type {
    CreateAddressInput,
    CreateUserAddressResult,
    ListUserAddressesInput,
    UpdateAddressInput,
    UserAddressListView,
    UserAddressView,
    UserMutationNotice,
} from "@/entities/user";
