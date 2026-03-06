"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, MapPin, PencilLine, Plus, RefreshCw, Trash2} from "lucide-react";
import {useTranslations} from "next-intl";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";

import {
    createAddress,
    deleteAddress,
    getCurrentAccount,
    getCurrentProfile,
    listAddresses,
    setDefaultAddress,
    updateAddress,
    updateCurrentAccount,
    updateCurrentProfile,
} from "@/features/account/api";
import {
    accountFormSchema,
    addressFormSchema,
    profileFormSchema,
    type AccountFormSchema,
    type AddressFormSchema,
    type ProfileFormSchema,
} from "@/features/account/schemas";
import type {Address} from "@/features/account/types";
import {FrontendApiError} from "@/lib/api/frontend";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Textarea} from "@/components/ui/textarea";

/**
 * 账号与地址工作台可切换分区
 */
type AccountWorkspaceTab = "account" | "profile" | "addresses";

/**
 * 账号与地址工作台入参
 */
interface AccountAddressWorkspaceProps {
    /** 初始激活分区, 用于 `/me/account` 与 `/me/addresses` 路由入口对齐 */
    initialTab?: AccountWorkspaceTab;
}

/**
 * 账号与地址工作台组件
 *
 * @param props 组件入参
 * @returns 账号与地址页面主体
 */
export function AccountAddressWorkspace({initialTab = "account"}: AccountAddressWorkspaceProps) {
    const t = useTranslations("AccountWorkspace");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(true);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [accountPending, setAccountPending] = useState(false);
    const [profilePending, setProfilePending] = useState(false);
    const [addressPending, setAddressPending] = useState(false);
    const [activeTab, setActiveTab] = useState<AccountWorkspaceTab>(initialTab);

    const accountForm = useForm<AccountFormSchema>({
        resolver: zodResolver(accountFormSchema),
        defaultValues: {
            nickname: "",
            phone_country_code: "",
            phone_national_number: "",
        },
    });

    const profileForm = useForm<ProfileFormSchema>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            display_name: "",
            avatar_url: "",
            gender: "UNKNOWN",
            birthday: "",
            country: "",
            province: "",
            city: "",
            address_line: "",
            zipcode: "",
        },
    });

    const addressForm = useForm<AddressFormSchema>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            receiver_name: "",
            phone_country_code: "",
            phone_national_number: "",
            country: "",
            province: "",
            city: "",
            district: "",
            address_line1: "",
            address_line2: "",
            zipcode: "",
            is_default: false,
        },
    });

    /**
     * 翻译表单校验信息
     *
     * @param key 校验 key
     * @returns 可展示文本
     */
    const renderValidationMessage = useCallback(
        (key?: string) => {
            if (!key) {
                return "";
            }

            try {
                return t(`validation.${key}` as never);
            } catch {
                return t("validation.invalid");
            }
        },
        [t],
    );

    /**
     * 刷新账号, 资料, 地址数据
     */
    const refreshAll = useCallback(async () => {
        setRefreshing(true);
        setLoadError(null);

        try {
            const [account, profile, addressList] = await Promise.all([
                getCurrentAccount(),
                getCurrentProfile(),
                listAddresses(1, 20),
            ]);

            accountForm.reset({
                nickname: account?.nickname ?? "",
                phone_country_code: account?.phone_country_code ?? "",
                phone_national_number: account?.phone_national_number ?? "",
            });

            profileForm.reset({
                display_name: profile?.displayName ?? "",
                avatar_url: profile?.avatarUrl ?? "",
                gender: (profile?.gender as "UNKNOWN" | "MALE" | "FEMALE" | undefined) ?? "UNKNOWN",
                birthday: profile?.birthday ?? "",
                country: profile?.country ?? "",
                province: profile?.province ?? "",
                city: profile?.city ?? "",
                address_line: profile?.addressLine ?? "",
                zipcode: profile?.zipcode ?? "",
            });

            setAddresses(addressList);
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.loadFailed"));
            }
        } finally {
            setRefreshing(false);
        }
    }, [accountForm, profileForm, t]);

    useEffect(() => {
        void refreshAll();
    }, [refreshAll]);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    /**
     * 保存账户信息
     */
    const handleSaveAccount = accountForm.handleSubmit(async (values) => {
        setAccountPending(true);
        setStatusText(null);

        try {
            await updateCurrentAccount(values);
            setStatusText(t("status.accountSaved"));
            await refreshAll();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.saveFailed"));
            }
        } finally {
            setAccountPending(false);
        }
    });

    /**
     * 保存资料信息
     */
    const handleSaveProfile = profileForm.handleSubmit(async (values) => {
        setProfilePending(true);
        setStatusText(null);

        try {
            await updateCurrentProfile(values);
            setStatusText(t("status.profileSaved"));
            await refreshAll();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.saveFailed"));
            }
        } finally {
            setProfilePending(false);
        }
    });

    /**
     * 打开新增地址弹窗
     */
    const openCreateAddressDialog = () => {
        setEditingAddress(null);
        addressForm.reset({
            receiver_name: "",
            phone_country_code: "",
            phone_national_number: "",
            country: "",
            province: "",
            city: "",
            district: "",
            address_line1: "",
            address_line2: "",
            zipcode: "",
            is_default: false,
        });
        setAddressDialogOpen(true);
    };

    /**
     * 打开编辑地址弹窗
     *
     * @param address 地址数据
     */
    const openEditAddressDialog = (address: Address) => {
        setEditingAddress(address);
        addressForm.reset({
            receiver_name: address.receiver_name,
            phone_country_code: address.phone_country_code,
            phone_national_number: address.phone_national_number,
            country: address.country ?? "",
            province: address.province ?? "",
            city: address.city ?? "",
            district: address.district ?? "",
            address_line1: address.address_line1,
            address_line2: address.address_line2 ?? "",
            zipcode: address.zipcode ?? "",
            is_default: address.is_default,
        });
        setAddressDialogOpen(true);
    };

    /**
     * 提交地址表单
     *
     * @param values 表单值
     */
    const handleSubmitAddress = addressForm.handleSubmit(async (values) => {
        setAddressPending(true);
        setStatusText(null);

        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, values);
                setStatusText(t("status.addressUpdated"));
            } else {
                await createAddress(values);
                setStatusText(t("status.addressCreated"));
            }

            setAddressDialogOpen(false);
            await refreshAll();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.saveFailed"));
            }
        } finally {
            setAddressPending(false);
        }
    });

    /**
     * 删除地址
     *
     * @param address 地址
     */
    const handleDeleteAddress = async (address: Address) => {
        if (!window.confirm(t("addresses.confirmDelete"))) {
            return;
        }

        setAddressPending(true);
        setStatusText(null);

        try {
            await deleteAddress(address.id);
            setStatusText(t("status.addressDeleted"));
            await refreshAll();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.saveFailed"));
            }
        } finally {
            setAddressPending(false);
        }
    };

    /**
     * 设为默认地址
     *
     * @param address 地址
     */
    const handleSetDefault = async (address: Address) => {
        if (address.is_default) {
            return;
        }

        setAddressPending(true);
        setStatusText(null);

        try {
            await setDefaultAddress(address.id);
            setStatusText(t("status.defaultUpdated"));
            await refreshAll();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setLoadError(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setLoadError(t("errors.saveFailed"));
            }
        } finally {
            setAddressPending(false);
        }
    };

    const sortedAddresses = useMemo(
        () => [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
        [addresses],
    );

    return (
        <section className="relative min-h-screen bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.97_0_0),transparent_56%)]"
            />
            <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refreshAll()}
                        disabled={refreshing || accountPending || profilePending || addressPending}
                    >
                        <RefreshCw className={refreshing ? "animate-spin" : ""}/>
                        {t("actions.refresh")}
                    </Button>
                </div>

                {statusText ? <p className="mb-4 text-sm text-emerald-700">{statusText}</p> : null}
                {loadError ? <p className="mb-4 text-sm text-destructive">{loadError}</p> : null}

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as AccountWorkspaceTab)}
                    className="mb-5 xl:hidden"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="account">{t("account.title")}</TabsTrigger>
                        <TabsTrigger value="profile">{t("profile.title")}</TabsTrigger>
                        <TabsTrigger value="addresses">{t("addresses.title")}</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Card
                        className={cn(
                            "animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
                            activeTab === "account" ? "block" : "hidden",
                            "xl:block",
                        )}
                    >
                        <CardHeader>
                            <CardTitle>{t("account.title")}</CardTitle>
                            <CardDescription>{t("account.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSaveAccount}>
                                <div className="space-y-2">
                                    <Label htmlFor="account-nickname">{t("account.fields.nickname")}</Label>
                                    <Input id="account-nickname" {...accountForm.register("nickname")}/>
                                    {accountForm.formState.errors.nickname ? (
                                        <p className="text-xs text-destructive">
                                            {renderValidationMessage(accountForm.formState.errors.nickname.message)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="account-phone-country">{t("account.fields.phoneCountry")}</Label>
                                        <Input id="account-phone-country" placeholder="+81" {...accountForm.register("phone_country_code")}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="account-phone">{t("account.fields.phone")}</Label>
                                        <Input id="account-phone" {...accountForm.register("phone_national_number")}/>
                                    </div>
                                </div>
                                {accountForm.formState.errors.phone_country_code || accountForm.formState.errors.phone_national_number ? (
                                    <p className="text-xs text-destructive">{renderValidationMessage("phone_pair_required")}</p>
                                ) : null}
                                <Button type="submit" disabled={accountPending || refreshing}>
                                    {accountPending ? <LoaderCircle className="animate-spin"/> : null}
                                    {t("actions.saveAccount")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card
                        className={cn(
                            "animate-in fade-in-0 slide-in-from-bottom-1 duration-500",
                            activeTab === "profile" ? "block" : "hidden",
                            "xl:block",
                        )}
                    >
                        <CardHeader>
                            <CardTitle>{t("profile.title")}</CardTitle>
                            <CardDescription>{t("profile.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSaveProfile}>
                                <div className="space-y-2">
                                    <Label htmlFor="profile-display-name">{t("profile.fields.displayName")}</Label>
                                    <Input id="profile-display-name" {...profileForm.register("display_name")}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profile-avatar-url">{t("profile.fields.avatarUrl")}</Label>
                                    <Input id="profile-avatar-url" placeholder="https://" {...profileForm.register("avatar_url")}/>
                                    {profileForm.formState.errors.avatar_url ? (
                                        <p className="text-xs text-destructive">
                                            {renderValidationMessage(profileForm.formState.errors.avatar_url.message)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-gender">{t("profile.fields.gender")}</Label>
                                        <Select
                                            value={profileForm.watch("gender") ?? "UNKNOWN"}
                                            onValueChange={(value) =>
                                                profileForm.setValue("gender", value as "UNKNOWN" | "MALE" | "FEMALE")
                                            }
                                        >
                                            <SelectTrigger id="profile-gender">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UNKNOWN">{t("profile.gender.UNKNOWN")}</SelectItem>
                                                <SelectItem value="MALE">{t("profile.gender.MALE")}</SelectItem>
                                                <SelectItem value="FEMALE">{t("profile.gender.FEMALE")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-birthday">{t("profile.fields.birthday")}</Label>
                                        <Input id="profile-birthday" type="date" {...profileForm.register("birthday")}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-country">{t("profile.fields.country")}</Label>
                                        <Input id="profile-country" {...profileForm.register("country")}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-province">{t("profile.fields.province")}</Label>
                                        <Input id="profile-province" {...profileForm.register("province")}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-city">{t("profile.fields.city")}</Label>
                                        <Input id="profile-city" {...profileForm.register("city")}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-zipcode">{t("profile.fields.zipcode")}</Label>
                                        <Input id="profile-zipcode" {...profileForm.register("zipcode")}/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profile-address-line">{t("profile.fields.addressLine")}</Label>
                                    <Textarea id="profile-address-line" rows={3} {...profileForm.register("address_line")}/>
                                </div>
                                <Button type="submit" disabled={profilePending || refreshing}>
                                    {profilePending ? <LoaderCircle className="animate-spin"/> : null}
                                    {t("actions.saveProfile")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <Card
                    className={cn(
                        "mt-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-700",
                        activeTab === "addresses" ? "block" : "hidden",
                        "xl:block",
                    )}
                >
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>{t("addresses.title")}</CardTitle>
                            <CardDescription>{t("addresses.description")}</CardDescription>
                        </div>
                        <Button type="button" onClick={openCreateAddressDialog} disabled={addressPending || refreshing}>
                            <Plus/>
                            {t("addresses.actions.add")}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {sortedAddresses.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                {t("addresses.empty")}
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                {sortedAddresses.map((address) => (
                                    <li key={address.id} className="rounded-lg border bg-background p-4">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="font-medium text-foreground">{address.receiver_name}</p>
                                            {address.is_default ? <Badge>{t("addresses.default")}</Badge> : null}
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>{address.phone_country_code} {address.phone_national_number}</p>
                                            <p className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 size-3.5"/>
                                                <span>
                                                    {address.country} {address.province} {address.city} {address.district}
                                                    <br/>
                                                    {address.address_line1} {address.address_line2 ?? ""}
                                                    <br/>
                                                    {address.zipcode ?? ""}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {!address.is_default ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={addressPending || refreshing}
                                                    onClick={() => void handleSetDefault(address)}
                                                >
                                                    {t("addresses.actions.setDefault")}
                                                </Button>
                                            ) : null}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={addressPending || refreshing}
                                                onClick={() => openEditAddressDialog(address)}
                                            >
                                                <PencilLine/>
                                                {t("addresses.actions.edit")}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={addressPending || refreshing}
                                                onClick={() => void handleDeleteAddress(address)}
                                            >
                                                <Trash2/>
                                                {t("addresses.actions.delete")}
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? t("addresses.dialog.editTitle") : t("addresses.dialog.createTitle")}
                        </DialogTitle>
                        <DialogDescription>{t("addresses.dialog.description")}</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSubmitAddress}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address-receiver">{t("addresses.fields.receiver")}</Label>
                                <Input id="address-receiver" {...addressForm.register("receiver_name")}/>
                                {addressForm.formState.errors.receiver_name ? (
                                    <p className="text-xs text-destructive">
                                        {renderValidationMessage(addressForm.formState.errors.receiver_name.message)}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-zipcode">{t("addresses.fields.zipcode")}</Label>
                                <Input id="address-zipcode" {...addressForm.register("zipcode")}/>
                                {addressForm.formState.errors.zipcode ? (
                                    <p className="text-xs text-destructive">
                                        {renderValidationMessage(addressForm.formState.errors.zipcode.message)}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address-phone-country">{t("addresses.fields.phoneCountry")}</Label>
                                <Input id="address-phone-country" placeholder="+81" {...addressForm.register("phone_country_code")}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-phone">{t("addresses.fields.phone")}</Label>
                                <Input id="address-phone" {...addressForm.register("phone_national_number")}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address-country">{t("addresses.fields.country")}</Label>
                                <Input id="address-country" {...addressForm.register("country")}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-province">{t("addresses.fields.province")}</Label>
                                <Input id="address-province" {...addressForm.register("province")}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address-city">{t("addresses.fields.city")}</Label>
                                <Input id="address-city" {...addressForm.register("city")}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-district">{t("addresses.fields.district")}</Label>
                                <Input id="address-district" {...addressForm.register("district")}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address-line1">{t("addresses.fields.addressLine1")}</Label>
                            <Input id="address-line1" {...addressForm.register("address_line1")}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address-line2">{t("addresses.fields.addressLine2")}</Label>
                            <Input id="address-line2" {...addressForm.register("address_line2")}/>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                            <Checkbox
                                id="address-is-default"
                                checked={addressForm.watch("is_default")}
                                onCheckedChange={(checked) => addressForm.setValue("is_default", Boolean(checked))}
                            />
                            <Label htmlFor="address-is-default">{t("addresses.fields.isDefault")}</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
                                {t("addresses.actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={addressPending}>
                                {addressPending ? <LoaderCircle className="animate-spin"/> : null}
                                {editingAddress ? t("addresses.actions.saveEdit") : t("addresses.actions.saveCreate")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
