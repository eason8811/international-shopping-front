"use client";

import {type ReactNode, useState} from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Lock,
    LogOut,
    MapPin,
    MessageSquare,
    Package,
    Plus,
    RefreshCcw,
    Settings,
    Shield,
    Ticket,
    Truck,
    Wallet,
} from "lucide-react";
import {useTranslations} from "next-intl";
import {AnimatePresence, motion} from "motion/react";
import {toast} from "sonner";

import {
    createCurrentUserAddress,
    listCurrentUserAddresses,
    setCurrentUserDefaultAddress,
    updateCurrentUserAddress,
} from "@/features/address";
import {type AddressFormValue, AddressDialog} from "@/features/address/components/address-dialog";
import {logoutUser} from "@/features/auth";
import {type UserAccountView, type UserAddressListView, type UserAddressView, type UserProfileView} from "@/entities/user";
import {useRouter} from "@/i18n/navigation";
import {normalizeClientError} from "@/lib/api/normalize-client-error";
import {normalizePhoneCountryCodeInput} from "@/lib/format/phone";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {Toaster} from "@/components/ui/sonner";

interface AccountCenterProps {
    initialAccount: UserAccountView;
    initialProfile: UserProfileView;
    initialAddresses: UserAddressListView;
}

export function AccountCenter({initialAccount, initialProfile, initialAddresses}: AccountCenterProps) {
    const t = useTranslations("ProfilePage");
    const router = useRouter();
    const [addresses, setAddresses] = useState(initialAddresses.items);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [logoutOpenPC, setLogoutOpenPC] = useState(false);
    const [logoutOpenMobile, setLogoutOpenMobile] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [isAddressPending, setIsAddressPending] = useState(false);
    const [isSessionPending, setIsSessionPending] = useState(false);

    const displayName = resolveDisplayName(initialAccount, initialProfile);
    const initials = getInitials(displayName);
    const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
    const editingAddress = editingAddressId
        ? addresses.find((item) => item.id === editingAddressId) ?? null
        : null;

    const orderItems = [
        {icon: Wallet, label: t("orders.unpaid"), count: 1},
        {icon: Package, label: t("orders.toShip"), count: 3},
        {icon: Truck, label: t("orders.shipped")},
        {icon: CheckCircle2, label: t("orders.delivered")},
        {icon: RefreshCcw, label: t("orders.returns")},
    ];

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {staggerChildren: 0.08},
        },
    } as const;

    const itemVariants = {
        hidden: {opacity: 0, y: 15},
        visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: "easeOut"}},
    } as const;

    async function refreshAddresses() {
        const next = await listCurrentUserAddresses({page: 1, size: 20});
        setAddresses(next.items);
    }

    async function handleSaveAddress(value: AddressFormValue) {
        const payload = toAddressPayload(value);

        if (!payload) {
            toast.error(t("common.invalidPhone"));
            return;
        }

        setIsAddressPending(true);

        try {
            if (value.id) {
                await updateCurrentUserAddress(value.id, payload);

                if (value.isDefault) {
                    await setCurrentUserDefaultAddress(value.id);
                }
            } else {
                await createCurrentUserAddress(payload);
            }

            await refreshAddresses();
            setIsAddressDialogOpen(false);
            setEditingAddressId(null);
            toast.success(value.id ? t("address.updated") : t("address.created"));
        } catch (error) {
            const normalized = normalizeClientError(error, t("common.addressSaveFailed"));
            toast.error(normalized.message);
        } finally {
            setIsAddressPending(false);
        }
    }

    async function handleLogout() {
        setIsSessionPending(true);

        try {
            await logoutUser();
            setLogoutOpenPC(false);
            setLogoutOpenMobile(false);
            router.push("/login");
            router.refresh();
        } catch (error) {
            const normalized = normalizeClientError(error, t("common.logoutFailed"));
            toast.error(normalized.message);
        } finally {
            setIsSessionPending(false);
        }
    }

    async function handleCopyEmail() {
        if (!initialAccount.email) {
            return;
        }

        try {
            await navigator.clipboard.writeText(initialAccount.email);
            toast.success(t("common.emailCopied"));
        } catch {
            toast.error(t("common.copyFailed"));
        }
    }

    function handleSoon() {
        toast.message(t("common.comingSoon"));
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <Toaster position="top-center" richColors/>

            <motion.aside
                initial={false}
                animate={{width: isSidebarExpanded ? 260 : 80}}
                className="z-10 hidden shrink-0 flex-col overflow-hidden border-r bg-background lg:flex"
                transition={{duration: 0.3, ease: "easeInOut"}}
            >
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex h-full w-full flex-col">
                    <motion.div variants={itemVariants} className="relative flex h-22 shrink-0 items-center border-b border-transparent pl-4.5">
                        <Avatar
                            className={`h-11 w-11 shrink-0 border bg-muted transition-all duration-300 ${!isSidebarExpanded ? "cursor-pointer hover:ring-2 hover:ring-primary/20" : ""}`}
                            onClick={() => {
                                if (!isSidebarExpanded) {
                                    setIsSidebarExpanded(true);
                                }
                            }}
                            title={!isSidebarExpanded ? t("sidebar.expand") : undefined}
                        >
                            <AvatarImage src={initialProfile.avatarUrl ?? undefined}/>
                            <AvatarFallback className="font-medium">{initials}</AvatarFallback>
                        </Avatar>

                        <motion.div
                            animate={{opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0}}
                            transition={{duration: 0.3, ease: "easeInOut"}}
                            className="ml-3 flex flex-col overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="truncate text-sm font-semibold">{displayName}</h1>
                            <p
                                className="truncate pt-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                onClick={handleCopyEmail}
                                title={initialAccount.email ?? undefined}
                            >
                                <span className="border-b border-dashed border-muted-foreground/50">
                                    {initialAccount.email ?? initialAccount.username}
                                </span>
                            </p>
                        </motion.div>

                        <AnimatePresence>
                            {isSidebarExpanded ? (
                                <motion.div
                                    initial={{opacity: 0, scale: 0.8}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.8}}
                                    transition={{duration: 0.2}}
                                    className="absolute right-4"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                                        onClick={() => setIsSidebarExpanded(false)}
                                    >
                                        <ChevronLeft className="size-4"/>
                                    </Button>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>

                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden py-4">
                        <motion.div variants={itemVariants}>
                            <AnimatePresence initial={false}>
                                {isSidebarExpanded ? (
                                    <motion.div
                                        initial={{opacity: 0, height: 0}}
                                        animate={{opacity: 1, height: "auto"}}
                                        exit={{opacity: 0, height: 0}}
                                        className="mb-1.5 overflow-hidden whitespace-nowrap px-6.5 text-xs font-semibold text-muted-foreground"
                                    >
                                        {t("sidebar.ordersTitle")}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </motion.div>

                        {orderItems.map((item) => (
                            <motion.div key={item.label} variants={itemVariants}>
                                <Button
                                    variant="ghost"
                                    className="relative mx-4 flex h-11 w-[calc(100%-32px)] shrink-0 items-center justify-start overflow-hidden rounded-xl px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    title={!isSidebarExpanded ? item.label : undefined}
                                    onClick={handleSoon}
                                >
                                    <div className="flex w-6 shrink-0 items-center justify-center">
                                        <item.icon className="size-5" strokeWidth={1.5}/>
                                    </div>

                                    <motion.div
                                        animate={{opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0}}
                                        transition={{duration: 0.3, ease: "easeInOut"}}
                                        className="ml-3 flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {item.count ? (
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                                                {item.count}
                                            </span>
                                        ) : null}
                                    </motion.div>

                                    <AnimatePresence>
                                        {!isSidebarExpanded && item.count ? (
                                            <motion.span
                                                initial={{opacity: 0, scale: 0.5}}
                                                animate={{opacity: 1, scale: 1}}
                                                exit={{opacity: 0, scale: 0.5}}
                                                className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground ring-2 ring-background shadow-sm"
                                            >
                                                {item.count}
                                            </motion.span>
                                        ) : null}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div variants={itemVariants} className="flex shrink-0 flex-col gap-1.5 overflow-x-hidden border-t py-4 pb-6">
                        <Button
                            variant="ghost"
                            className="relative mx-4 flex h-11 w-[calc(100%-32px)] shrink-0 items-center justify-start overflow-hidden rounded-xl px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            title={!isSidebarExpanded ? t("sidebar.settings") : undefined}
                            onClick={handleSoon}
                        >
                            <div className="flex w-6 shrink-0 items-center justify-center">
                                <Settings className="size-5" strokeWidth={1.5}/>
                            </div>
                            <motion.span
                                animate={{opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0}}
                                transition={{duration: 0.3, ease: "easeInOut"}}
                                className="ml-3 overflow-hidden whitespace-nowrap text-sm font-medium"
                            >
                                {t("sidebar.settings")}
                            </motion.span>
                        </Button>

                        <Popover open={logoutOpenPC} onOpenChange={setLogoutOpenPC}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative mx-4 flex h-11 w-[calc(100%-32px)] shrink-0 items-center justify-start overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] px-3 text-destructive hover:bg-[color-mix(in_oklab,var(--destructive)_20%,transparent)] hover:text-destructive"
                                    title={!isSidebarExpanded ? t("sidebar.logout") : undefined}
                                >
                                    <div className="flex w-6 shrink-0 items-center justify-center">
                                        <LogOut className="size-5" strokeWidth={1.5}/>
                                    </div>
                                    <motion.span
                                        animate={{opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0}}
                                        transition={{duration: 0.3, ease: "easeInOut"}}
                                        className="ml-3 overflow-hidden whitespace-nowrap text-sm font-medium"
                                    >
                                        {t("sidebar.logout")}
                                    </motion.span>
                                </Button>
                            </PopoverTrigger>
                            <LogoutPopover
                                title={t("sidebar.logoutConfirmTitle")}
                                description={t("sidebar.logoutConfirmDescription")}
                                cancelLabel={t("sidebar.cancel")}
                                confirmLabel={t("sidebar.logout")}
                                isPending={isSessionPending}
                                onCancel={() => setLogoutOpenPC(false)}
                                onConfirm={handleLogout}
                                side="right"
                                sideOffset={16}
                            />
                        </Popover>
                    </motion.div>
                </motion.div>
            </motion.aside>

            <ScrollArea className="h-screen min-w-0 flex-1">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col pb-24 sm:pb-12 lg:pb-16"
                >
                    <motion.div variants={itemVariants} className="shrink-0 border-b bg-background px-4 py-6 sm:px-6 sm:py-8 lg:hidden">
                        <div className="mx-auto flex max-w-5xl items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
                                <Avatar className="h-14 w-14 border bg-muted sm:h-16 sm:w-16 md:h-20 md:w-20">
                                    <AvatarImage src={initialProfile.avatarUrl ?? undefined}/>
                                    <AvatarFallback className="text-lg font-medium sm:text-xl md:text-2xl">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                                        {displayName}
                                    </h1>
                                    <p
                                        className="inline-block cursor-pointer pt-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                                        onClick={handleCopyEmail}
                                        title={initialAccount.email ?? undefined}
                                    >
                                        <span className="border-b border-dashed border-muted-foreground/50 pb-px">
                                            {initialAccount.email ?? initialAccount.username}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-1 sm:gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground sm:h-10 sm:w-10"
                                    onClick={handleSoon}
                                >
                                    <Settings className="size-4 sm:size-5"/>
                                </Button>
                                <Popover open={logoutOpenMobile} onOpenChange={setLogoutOpenMobile}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-md bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] text-destructive hover:bg-[color-mix(in_oklab,var(--destructive)_20%,transparent)] hover:text-destructive sm:h-10 sm:w-10"
                                        >
                                            <LogOut className="size-4 sm:size-5"/>
                                        </Button>
                                    </PopoverTrigger>
                                    <LogoutPopover
                                        title={t("sidebar.logoutConfirmTitle")}
                                        description={t("sidebar.logoutConfirmDescription")}
                                        cancelLabel={t("sidebar.cancel")}
                                        confirmLabel={t("sidebar.logout")}
                                        isPending={isSessionPending}
                                        onCancel={() => setLogoutOpenMobile(false)}
                                        onConfirm={handleLogout}
                                        side="bottom"
                                        sideOffset={8}
                                    />
                                </Popover>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mx-auto mt-4 w-full max-w-5xl space-y-4 px-4 sm:mt-6 sm:space-y-6 sm:px-6 lg:mt-8 lg:space-y-8 lg:px-8">
                        <motion.div variants={itemVariants}>
                            <Card className="shrink-0 border-muted shadow-sm lg:hidden">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                                        {t("orders.title")}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs text-muted-foreground sm:mr-0 sm:text-sm"
                                        onClick={handleSoon}
                                    >
                                        {t("orders.viewAll")}
                                        <ChevronRight className="ml-0.5 size-3 sm:ml-1 sm:size-4"/>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-1 pt-2 pb-1 sm:gap-2 md:gap-4">
                                        {orderItems.map((item) => (
                                            <button
                                                key={item.label}
                                                type="button"
                                                className="group flex flex-col items-center gap-1.5 transition-transform duration-200 active:scale-[0.97] sm:gap-2"
                                                onClick={handleSoon}
                                            >
                                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                                                    <item.icon className="size-5 text-foreground transition-colors group-hover:text-primary sm:size-6" strokeWidth={1.5}/>
                                                    {item.count ? (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground ring-2 ring-background sm:right-0 sm:h-5 sm:w-5 sm:text-[10px]">
                                                            {item.count}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <span className="text-center text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs md:text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6 lg:gap-8">
                            <motion.div variants={itemVariants} className="h-full">
                                <Card className="flex h-full flex-col shadow-sm border-muted">
                                    <CardHeader className="pb-2 sm:pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 sm:h-10 sm:w-10">
                                                <MapPin className="size-4 sm:size-5"/>
                                            </div>
                                            <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                                                {t("address.title")}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 flex-col justify-between">
                                        {defaultAddress ? (
                                            <div
                                                onClick={() => {
                                                    setEditingAddressId(defaultAddress.id);
                                                    setIsAddressDialogOpen(true);
                                                }}
                                                className="group relative mb-3 cursor-pointer overflow-hidden rounded-lg border border-muted/50 bg-muted/30 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98] sm:mb-4 sm:p-4"
                                            >
                                                <div className="absolute top-0 left-0 h-full w-1 bg-primary opacity-80 transition-opacity group-hover:opacity-100"/>
                                                <div className="mb-1.5 flex flex-col gap-1 sm:mb-1 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
                                                    <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
                                                        {defaultAddress.receiverName}
                                                        {defaultAddress.isDefault ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="h-3.5 bg-primary/10 px-1.5 text-[9px] font-normal text-primary hover:bg-primary/20 sm:h-4 sm:text-[10px]"
                                                            >
                                                                {t("address.defaultBadge")}
                                                            </Badge>
                                                        ) : null}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground sm:text-sm">
                                                        {defaultAddress.phone.display ?? defaultAddress.phone.e164 ?? t("address.phoneFallback")}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                                    {formatAddressLines(defaultAddress).map((line) => (
                                                        <span key={line} className="block">
                                                            {line}
                                                        </span>
                                                    ))}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mb-4 flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                                {t("address.empty")}
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full gap-2 border-dashed bg-background text-xs shadow-sm sm:h-10 sm:text-sm"
                                            onClick={() => {
                                                setEditingAddressId(null);
                                                setIsAddressDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="size-3.5 sm:size-4"/>
                                            {t("address.add")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={itemVariants} className="h-full">
                                <Card className="flex h-full flex-col border-muted shadow-sm">
                                    <CardHeader className="pb-2 sm:pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 sm:h-10 sm:w-10">
                                                <MessageSquare className="size-4 sm:size-5"/>
                                            </div>
                                            <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                                                {t("support.title")}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ActionRow icon={Ticket} label={t("support.tickets")} onClick={handleSoon}/>
                                        <Separator/>
                                        <ActionRow icon={AlertTriangle} label={t("support.logistics")} onClick={handleSoon}/>
                                        <Separator/>
                                        <ActionRow icon={HelpCircle} label={t("support.help")} onClick={handleSoon}/>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                            <Card className="shrink-0 border-muted shadow-sm">
                                <CardHeader className="pb-2 sm:pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 sm:h-10 sm:w-10">
                                            <Shield className="size-4 sm:size-5"/>
                                        </div>
                                        <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                                            {t("security.title")}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col">
                                        <SecurityRow
                                            icon={<Lock className="size-4 text-foreground/70 sm:size-5"/>}
                                            title={t("security.passwordTitle")}
                                            description={t("security.passwordMeta")}
                                            actionLabel={t("security.update")}
                                            actionVariant="outline"
                                            onAction={() => router.push("/forgot-password")}
                                        />
                                        <Separator/>
                                        <SecurityRow
                                            icon={<GoogleIcon className="size-4 sm:size-5"/>}
                                            title={t("security.google")}
                                            description={initialAccount.email ?? t("security.notConnected")}
                                            badgeLabel={initialAccount.email ? t("security.connected") : undefined}
                                            actionLabel={initialAccount.email ? t("security.unlink") : t("security.connect")}
                                            actionVariant={initialAccount.email ? "ghost" : "outline"}
                                            onAction={handleSoon}
                                        />
                                        <Separator/>
                                        <SecurityRow
                                            icon={<XIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5"/>}
                                            title={t("security.x")}
                                            description={t("security.notConnected")}
                                            actionLabel={t("security.connect")}
                                            actionVariant="outline"
                                            onAction={handleSoon}
                                        />
                                        <Separator/>
                                        <SecurityRow
                                            icon={<TikTokIcon className="size-4 sm:size-5"/>}
                                            title={t("security.tiktok")}
                                            description={t("security.notConnected")}
                                            actionLabel={t("security.connect")}
                                            actionVariant="outline"
                                            onAction={handleSoon}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </ScrollArea>

            <AddressDialog
                open={isAddressDialogOpen}
                onOpenChange={(open) => {
                    setIsAddressDialogOpen(open);
                    if (!open) {
                        setEditingAddressId(null);
                    }
                }}
                address={editingAddress ? toAddressFormValue(editingAddress) : null}
                onSave={handleSaveAddress}
                isPending={isAddressPending}
            />
        </div>
    );
}

function LogoutPopover({
                           title,
                           description,
                           cancelLabel,
                           confirmLabel,
                           isPending,
                           onCancel,
                           onConfirm,
                           side,
                           sideOffset,
                       }: {
    title: string;
    description: string;
    cancelLabel: string;
    confirmLabel: string;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    side: "bottom" | "right";
    sideOffset: number;
}) {
    return (
        <PopoverContent className="w-56" align="end" side={side} sideOffset={sideOffset}>
            <div className="space-y-3">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={isPending}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="ghost"
                        className="bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] text-destructive hover:bg-[color-mix(in_oklab,var(--destructive)_20%,transparent)] hover:text-destructive"
                        isLoading={isPending}
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </PopoverContent>
    );
}

function ActionRow({
                       icon: Icon,
                       label,
                       onClick,
                   }: {
    icon: typeof Ticket;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className="group -mx-2 flex w-[calc(100%+16px)] items-center justify-between rounded-md px-2 py-2.5 text-left transition-all duration-200 hover:bg-muted/50 active:scale-[0.98] active:bg-muted/60 sm:py-3"
            onClick={onClick}
        >
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted sm:h-8 sm:w-8">
                    <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground sm:size-4"/>
                </div>
                <span className="text-sm font-medium sm:text-base">{label}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-foreground"/>
        </button>
    );
}

function SecurityRow({
                         icon,
                         title,
                         description,
                         actionLabel,
                         actionVariant,
                         badgeLabel,
                         onAction,
                     }: {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant: "ghost" | "outline";
    badgeLabel?: string;
    onAction: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 sm:h-10 sm:w-10">
                    {icon}
                </div>
                <div className="min-w-0 pr-2">
                    <p className="flex items-center gap-1.5 text-sm font-medium sm:gap-2 sm:text-base">
                        <span className="truncate">{title}</span>
                        {badgeLabel ? (
                            <Badge
                                variant="secondary"
                                className="h-3.5 whitespace-nowrap border-none bg-emerald-500/10 px-1.5 text-[9px] font-normal text-emerald-600 hover:bg-emerald-500/20 sm:h-4 sm:text-[10px]"
                            >
                                {badgeLabel}
                            </Badge>
                        ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">{description}</p>
                </div>
            </div>
            <Button
                variant={actionVariant}
                size="sm"
                className={`h-7 shrink-0 px-2 sm:h-8 ${actionVariant === "ghost" ? "text-muted-foreground hover:text-foreground" : "shadow-sm"} sm:px-3`}
                onClick={onAction}
            >
                {actionLabel}
            </Button>
        </div>
    );
}

const GoogleIcon = ({className}: { className?: string }) => (
    <svg className={className ?? "h-5 w-5"} viewBox="0 0 24 24" aria-hidden="true">
        <g transform="matrix(1, 0, 0, 1, 27.009001, 39.238998)">
            <path fill="#4285F4" d="M -3.264 -15.192 C -3.264 -15.936 -3.324 -16.632 -3.456 -17.328 L -15.012 -17.328 L -15.012 -13.116 L -8.364 -13.116 C -8.664 -11.724 -9.444 -10.536 -10.608 -9.756 L -10.608 -7.032 L -6.6 -7.032 C -4.26 -9.18 -3.264 -12.432 -3.264 -15.192 Z"/>
            <path fill="#34A853" d="M -15.012 -0.852 C -11.712 -0.852 -8.892 -1.944 -6.828 -3.936 L -10.608 -6.66 C -11.736 -5.904 -13.236 -5.46 -15.012 -5.46 C -18.42 -5.46 -21.312 -7.764 -22.356 -10.848 L -26.292 -10.848 L -26.292 -7.788 C -24.228 -3.684 -20.004 -0.852 -15.012 -0.852 Z"/>
            <path fill="#FBBC05" d="M -22.356 -10.848 C -22.62 -11.64 -22.776 -12.48 -22.776 -13.332 C -22.776 -14.184 -22.62 -15.024 -22.356 -15.816 L -22.356 -18.876 L -26.292 -18.876 C -27.108 -17.244 -27.564 -15.372 -27.564 -13.332 C -27.564 -11.292 -27.108 -9.42 -26.292 -7.788 L -22.356 -10.848 Z"/>
            <path fill="#EA4335" d="M -15.012 -21.204 C -13.212 -21.204 -11.58 -20.58 -10.308 -19.464 L -6.528 -23.244 C -8.76 -25.296 -11.67 -26.46 -15.012 -26.46 C -20.004 -26.46 -24.228 -23.628 -26.292 -19.524 L -22.356 -16.464 C -21.312 -19.548 -18.42 -21.204 -15.012 -21.204 Z"/>
        </g>
    </svg>
);

const XIcon = ({className}: { className?: string }) => (
    <svg className={className ?? "h-4.5 w-4.5"} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L5.09 21.75H1.78l7.509-8.578L1.084 2.25h6.828l4.717 6.251L18.244 2.25h.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/>
    </svg>
);

const TikTokIcon = ({className}: { className?: string }) => (
    <svg className={className ?? "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-1.539 4.994 4.994 0 0 1-1.18-3.4l-.03-.2h-4.32v13.497a2.864 2.864 0 0 1-2.853 2.86 2.864 2.864 0 0 1-2.86-2.86 2.864 2.864 0 0 1 2.86-2.853c.12 0 .237.01.353.03V7.868a7.195 7.195 0 0 0-3.213-.746 7.197 7.197 0 0 0-7.195 7.194 7.197 7.197 0 0 0 7.195 7.195 7.197 7.197 0 0 0 7.2-7.195V10.61c1.554.912 3.326 1.43 5.213 1.43v-4.32a8.03 8.03 0 0 0-2.8-.838l-.4-.096z"/>
    </svg>
);

function resolveDisplayName(account: UserAccountView, profile: UserProfileView) {
    return profile.displayName || account.nickname || account.username;
}

function getInitials(value: string) {
    const segments = value.trim().split(/\s+/).filter(Boolean);
    return segments.slice(0, 2).map((item) => item[0]?.toUpperCase() ?? "").join("") || "IS";
}

function formatAddressLines(address: UserAddressView) {
    const cityLine = [address.city, address.province, address.zipcode].filter(Boolean).join(", ").replace(", ,", ",");
    return [
        [address.addressLine1, address.addressLine2].filter(Boolean).join(", "),
        cityLine,
        address.country ?? "",
    ].filter(Boolean);
}

function toAddressFormValue(value: UserAddressView): AddressFormValue {
    const {firstName, lastName} = splitReceiverName(value.receiverName);

    return {
        id: value.id,
        firstName,
        lastName,
        phone: value.phone.display ?? value.phone.e164 ?? "",
        phoneCountryCode: value.phone.countryCode ?? "",
        addressLine1: value.addressLine1,
        addressLine2: value.addressLine2 ?? "",
        city: value.city ?? "",
        province: value.province ?? "",
        district: value.district ?? "",
        country: value.country ?? "",
        zipcode: value.zipcode ?? "",
        isDefault: value.isDefault,
    };
}

function toAddressPayload(value: AddressFormValue) {
    const phone = parsePhoneInput(value.phone, value.phoneCountryCode);

    if (!phone) {
        return null;
    }

    return {
        receiverName: composeReceiverName(value.firstName, value.lastName),
        phoneCountryCode: phone.phoneCountryCode,
        phoneNationalNumber: phone.phoneNationalNumber,
        countryCode: deriveCountryCode(value.country, ""),
        country: value.country.trim(),
        province: value.province.trim(),
        city: value.city.trim(),
        district: value.district.trim(),
        addressLine1: value.addressLine1.trim(),
        addressLine2: normalizeOptionalString(value.addressLine2),
        zipcode: value.zipcode.trim(),
        languageCode: null,
        addressSource: "MANUAL" as const,
        rawInput: buildAddressRawInput(value),
        googlePlaceId: null,
        placeResponse: null,
        isDefault: value.isDefault,
    };
}

function buildAddressRawInput(value: AddressFormValue) {
    return [
        composeReceiverName(value.firstName, value.lastName),
        value.phoneCountryCode.trim(),
        value.phone.trim(),
        value.country.trim(),
        value.province.trim(),
        value.city.trim(),
        value.district.trim(),
        value.addressLine1.trim(),
        value.addressLine2.trim(),
        value.zipcode.trim(),
    ].filter(Boolean).join(", ");
}

function splitReceiverName(value: string) {
    const segments = value.trim().split(/\s+/).filter(Boolean);

    if (segments.length <= 1) {
        return {
            firstName: segments[0] ?? "",
            lastName: "",
        };
    }

    return {
        firstName: segments.slice(0, -1).join(" "),
        lastName: segments.at(-1) ?? "",
    };
}

function composeReceiverName(firstName: string, lastName: string) {
    return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

function parsePhoneInput(phone: string, fallbackCountryCode: string) {
    const trimmed = phone.trim();

    if (!trimmed) {
        return null;
    }

    const intlMatch = trimmed.match(/^\+(\d{1,4})[\s-]*(.+)$/);
    if (intlMatch) {
        const nationalNumber = intlMatch[2].replace(/[^\d]/g, "");
        if (!nationalNumber) {
            return null;
        }

        return {
            phoneCountryCode: intlMatch[1],
            phoneNationalNumber: nationalNumber,
        };
    }

    const fallback = normalizePhoneCountryCodeInput(fallbackCountryCode);
    const nationalNumber = trimmed.replace(/[^\d]/g, "");

    if (!fallback || !nationalNumber) {
        return null;
    }

    return {
        phoneCountryCode: fallback,
        phoneNationalNumber: nationalNumber,
    };
}

function deriveCountryCode(country: string, fallback: string) {
    const normalized = country.trim().toLowerCase();
    const direct = COUNTRY_CODE_MAP[normalized];
    if (direct) {
        return direct;
    }

    if (fallback.trim()) {
        return fallback.trim().toUpperCase();
    }

    const letters = country.replace(/[^A-Za-z]/g, "").toUpperCase();
    return letters.slice(0, 2) || "US";
}

function normalizeOptionalString(value: string) {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
    china: "CN",
    "hong kong": "HK",
    japan: "JP",
    singapore: "SG",
    "united kingdom": "GB",
    uk: "GB",
    "united states": "US",
    usa: "US",
};
