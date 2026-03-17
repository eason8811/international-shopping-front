"use client";

import {type ComponentProps, useRef, useState} from "react";
import {MapPin, SearchIcon} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {formatPhoneCountryCodeForInput} from "@/lib/format/phone";
import {cn} from "@/lib/utils";

export interface AddressFormValue {
    id?: number;
    firstName: string;
    lastName: string;
    phone: string;
    phoneCountryCode: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    district: string;
    country: string;
    countryCode: string;
    zipcode: string;
    isDefault: boolean;
}

interface AddressDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    address?: AddressFormValue | null;
    onSave: (address: AddressFormValue) => void;
    isPending?: boolean;
}

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

const mockSuggestions = [
    {
        text: "1234 E-commerce St, Los Angeles, CA",
        data: {
            addressLine1: "1234 E-commerce St",
            city: "Los Angeles",
            province: "CA",
            country: "United States",
            countryCode: "US",
            zipcode: "90001",
        },
    },
    {
        text: "5678 Tech Blvd, San Francisco, CA",
        data: {
            addressLine1: "5678 Tech Blvd",
            city: "San Francisco",
            province: "CA",
            country: "United States",
            countryCode: "US",
            zipcode: "94105",
        },
    },
    {
        text: "9012 Innovation Way, Austin, TX",
        data: {
            addressLine1: "9012 Innovation Way",
            city: "Austin",
            province: "TX",
            country: "United States",
            countryCode: "US",
            zipcode: "78701",
        },
    },
] as const;

const PHONE_COUNTRY_OPTIONS = [
    {value: "+1", label: "+1 (US)"},
    {value: "+44", label: "+44 (UK)"},
    {value: "+81", label: "+81 (JP)"},
    {value: "+86", label: "+86 (CN)"},
] as const;
const DEFAULT_PHONE_COUNTRY_CODE = PHONE_COUNTRY_OPTIONS[3].value;

const formTransition = {duration: 0.3, ease: "easeInOut"} as const;
const fieldTransition = {duration: 0.24, ease: "easeOut"} as const;
const animatedInputClassName =
    "h-12 rounded-[var(--radius)] border bg-muted/40 px-4 shadow-none transition-all duration-500 ease-in-out focus-visible:border-ring/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted/50 dark:bg-muted/30 dark:disabled:bg-muted/20";
const animatedInputGroupClassName =
    "h-12 rounded-[var(--radius)] border bg-muted/40 shadow-none transition-all duration-500 ease-in-out has-[[data-slot=input-group-control]:focus-visible]:border-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-disabled:bg-muted/50 dark:has-disabled:bg-muted/20";
const animatedInputGroupInputClassName =
    "h-full bg-transparent pr-4 pl-2 transition-all duration-500 ease-in-out";
const animatedPhoneFieldClassName =
    "relative flex h-12 w-full overflow-hidden rounded-[var(--radius)] border bg-muted/40 transition-all duration-500 ease-in-out focus-within:border-ring/50 focus-within:ring-3 focus-within:ring-ring/50 dark:bg-muted/30";
const animatedPhoneInputClassName =
    "h-full w-full border-none bg-transparent px-0 pr-4 pl-2 shadow-none transition-all duration-500 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent";

export function AddressDialog({
                                  open,
                                  onOpenChange,
                                  address,
                                  onSave,
                                  isPending = false,
                              }: AddressDialogProps) {
    const dialogKey = `${address?.id ?? "new"}-${open ? "open" : "closed"}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open ? (
                <AddressDialogBody
                    key={dialogKey}
                    address={address}
                    onOpenChange={onOpenChange}
                    onSave={onSave}
                    isPending={isPending}
                />
            ) : null}
        </Dialog>
    );
}

function AddressDialogBody({
                               address,
                               onOpenChange,
                               onSave,
                               isPending,
                           }: Omit<AddressDialogProps, "open"> & { isPending: boolean }) {
    const t = useTranslations("ProfilePage.dialog");
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<AddressFormValue>(() => resolveInitialAddressFormValue(address));
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    function updateField<Key extends keyof AddressFormValue>(field: Key, value: AddressFormValue[Key]) {
        setFormData((current) => ({...current, [field]: value}));
    }

    function handleSuggestionClick(data: Partial<AddressFormValue>) {
        setFormData((current) => ({...current, ...data}));
        setSearchQuery("");
        setShowDropdown(false);
    }

    function handleSubmit(event: FormSubmitEvent) {
        event.preventDefault();

        if (
            !composeReceiverName(formData.firstName, formData.lastName) ||
            !formData.phone.trim() ||
            !formData.addressLine1.trim() ||
            !formData.country.trim()
        ) {
            toast.error(t("validation.required"));
            return;
        }

        onSave({
            ...formData,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formData.phone.trim(),
            phoneCountryCode: formData.phoneCountryCode.trim(),
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2.trim(),
            city: formData.city.trim(),
            province: formData.province.trim(),
            district: formData.district.trim(),
            country: formData.country.trim(),
            countryCode: formData.countryCode.trim(),
            zipcode: formData.zipcode.trim(),
        });
    }

    const filteredSuggestions = mockSuggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-0 p-0 shadow-xl sm:max-w-125">
            <ScrollArea className="max-h-[90vh] flex-1 overflow-y-auto">
                <motion.form
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 10}}
                    transition={formTransition}
                    onSubmit={handleSubmit}
                >
                    <motion.div layout className="space-y-4 p-6">
                        <DialogHeader className="mb-2">
                            <DialogTitle>{address ? t("editTitle") : t("createTitle")}</DialogTitle>
                            <DialogDescription>{t("description")}</DialogDescription>
                        </DialogHeader>

                        <motion.div layout className="space-y-4 py-2">
                            <AddressField label={t("searchLabel")} className="relative">
                                <InputGroup className={animatedInputGroupClassName}>
                                    <InputGroupAddon align="inline-start" className="pl-4 pr-0">
                                        <SearchIcon className="size-4 text-muted-foreground transition-colors duration-300"/>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        placeholder={t("searchPlaceholder")}
                                        value={searchQuery}
                                        disabled={isPending}
                                        onChange={(event) => {
                                            setSearchQuery(event.target.value);
                                            setShowDropdown(event.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowDropdown(searchQuery.length > 0)}
                                        onBlur={() => {
                                            window.setTimeout(() => setShowDropdown(false), 200);
                                        }}
                                        className={animatedInputGroupInputClassName}
                                    />
                                </InputGroup>

                                <AnimatePresence initial={false}>
                                    {showDropdown ? (
                                        <motion.div
                                            key="search-suggestions"
                                            initial={{opacity: 0, y: -6, scale: 0.98}}
                                            animate={{opacity: 1, y: 0, scale: 1}}
                                            exit={{opacity: 0, y: -6, scale: 0.98}}
                                            transition={fieldTransition}
                                            className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border/80 bg-background/95 shadow-xl backdrop-blur"
                                        >
                                            {filteredSuggestions.length > 0 ? (
                                                filteredSuggestions.map((suggestion, index) => (
                                                    <motion.button
                                                        key={suggestion.text}
                                                        type="button"
                                                        initial={{opacity: 0, y: 8}}
                                                        animate={{opacity: 1, y: 0}}
                                                        transition={{...fieldTransition, delay: index * 0.03}}
                                                        className="flex w-full items-center gap-3 border-b border-border/70 px-4 py-3 text-left text-sm transition-colors last:border-0 hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none"
                                                        onMouseDown={(event) => {
                                                            event.preventDefault();
                                                            handleSuggestionClick(suggestion.data);
                                                        }}
                                                    >
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                                                            <MapPin className="size-3.5 text-muted-foreground"/>
                                                        </div>
                                                        <span className="truncate">{suggestion.text}</span>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <motion.div
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="px-4 py-4 text-center text-sm text-muted-foreground"
                                                >
                                                    {t("noPlaces")}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </AddressField>

                            <motion.div
                                layout
                                transition={fieldTransition}
                                className="group relative flex h-32 cursor-crosshair items-center justify-center overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-muted"
                            >
                                <div
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        backgroundImage:
                                            "url(https://images.unsplash.com/photo-1687294782370-5ae92f081c47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwY2xlYW4lMjB2ZWN0b3J8ZW58MXx8fHwxNzczMzE1NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080')",
                                        backgroundPosition: "center",
                                        backgroundSize: "cover",
                                    }}
                                />
                                <div className="absolute inset-0 bg-blue-500/10"/>
                                <div className="relative flex flex-col items-center">
                                    <MapPin className="-mt-8 size-8 text-primary drop-shadow-md transition-transform group-active:scale-90"/>
                                    <div className="mt-1 h-1 w-2 rounded-full bg-black/20 blur-[1px]"/>
                                </div>
                                <div className="absolute right-2 bottom-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                    {t("mapDisclaimer")}
                                </div>
                            </motion.div>

                            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <AddressField label={t("fields.country")} htmlFor="address-country">
                                    <Input
                                        id="address-country"
                                        placeholder={t("placeholders.country")}
                                        value={formData.country}
                                        autoComplete="country"
                                        disabled={isPending}
                                        onChange={(event) => updateField("country", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField label={t("fields.state")} htmlFor="address-state">
                                    <Input
                                        id="address-state"
                                        placeholder={t("placeholders.state")}
                                        value={formData.province}
                                        autoComplete="address-level1"
                                        disabled={isPending}
                                        onChange={(event) => updateField("province", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField label={t("fields.city")} htmlFor="address-city">
                                    <Input
                                        id="address-city"
                                        placeholder={t("placeholders.city")}
                                        value={formData.city}
                                        autoComplete="address-level2"
                                        disabled={isPending}
                                        onChange={(event) => updateField("city", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField label={t("fields.zipcode")} htmlFor="address-zip">
                                    <Input
                                        id="address-zip"
                                        placeholder={t("placeholders.zipcode")}
                                        value={formData.zipcode}
                                        autoComplete="postal-code"
                                        disabled={isPending}
                                        onChange={(event) => updateField("zipcode", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                            </motion.div>

                            <AddressField label={t("fields.line1")} htmlFor="address-line1">
                                <Input
                                    id="address-line1"
                                    placeholder={t("placeholders.line1")}
                                    value={formData.addressLine1}
                                    autoComplete="address-line1"
                                    disabled={isPending}
                                    onChange={(event) => updateField("addressLine1", event.target.value)}
                                    className={animatedInputClassName}
                                />
                            </AddressField>

                            <AddressField label={t("fields.line2")} htmlFor="address-line2">
                                <Input
                                    id="address-line2"
                                    placeholder={t("placeholders.line2")}
                                    value={formData.addressLine2}
                                    autoComplete="address-line2"
                                    disabled={isPending}
                                    onChange={(event) => updateField("addressLine2", event.target.value)}
                                    className={animatedInputClassName}
                                />
                            </AddressField>

                            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <AddressField label={t("fields.firstName")} htmlFor="address-first-name">
                                    <Input
                                        id="address-first-name"
                                        placeholder={t("placeholders.firstName")}
                                        value={formData.firstName}
                                        autoComplete="given-name"
                                        disabled={isPending}
                                        onChange={(event) => updateField("firstName", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField label={t("fields.lastName")} htmlFor="address-last-name">
                                    <Input
                                        id="address-last-name"
                                        placeholder={t("placeholders.lastName")}
                                        value={formData.lastName}
                                        autoComplete="family-name"
                                        disabled={isPending}
                                        onChange={(event) => updateField("lastName", event.target.value)}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                            </motion.div>

                            <AddressField label={t("fields.phone")} htmlFor="address-phone">
                                <motion.div
                                    layout
                                    className={cn(
                                        animatedPhoneFieldClassName,
                                        isPending && "bg-muted/50 dark:bg-muted/20",
                                    )}
                                >
                                    <motion.div
                                        key="phone-prefix"
                                        initial={{width: 0, opacity: 0, paddingLeft: 0}}
                                        animate={{width: "auto", opacity: 1, paddingLeft: 8}}
                                        transition={formTransition}
                                        className="flex shrink-0 items-center overflow-hidden whitespace-nowrap"
                                    >
                                        <Select
                                            value={formData.phoneCountryCode}
                                            onValueChange={(value) => updateField("phoneCountryCode", value)}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger className="h-auto w-auto gap-1 rounded-none border-none bg-transparent px-1 py-0 text-sm text-muted-foreground shadow-none hover:text-foreground focus:ring-0 focus:ring-offset-0">
                                                <SelectValue placeholder="Code"/>
                                            </SelectTrigger>
                                            <SelectContent
                                                className="min-w-30"
                                                onCloseAutoFocus={(event) => {
                                                    event.preventDefault();
                                                    phoneInputRef.current?.focus();
                                                }}
                                            >
                                                {PHONE_COUNTRY_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="mx-1 h-4 w-px shrink-0 bg-border"/>
                                    </motion.div>

                                    <Input
                                        ref={phoneInputRef}
                                        id="address-phone"
                                        type="tel"
                                        inputMode="tel"
                                        placeholder={t("phonePlaceholder")}
                                        value={formData.phone}
                                        autoComplete="tel-national"
                                        disabled={isPending}
                                        onChange={(event) => updateField("phone", event.target.value)}
                                        className={animatedPhoneInputClassName}
                                    />
                                </motion.div>
                            </AddressField>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="address-default"
                                    checked={formData.isDefault}
                                    disabled={isPending}
                                    onCheckedChange={(checked) =>
                                        updateField("isDefault", Boolean(checked))
                                    }
                                />
                                <Label
                                    htmlFor="address-default"
                                    className="cursor-pointer text-sm font-medium leading-none"
                                >
                                    {t("setDefault")}
                                </Label>
                            </div>
                        </motion.div>

                        <DialogFooter className="mt-4 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" size="lg" isLoading={isPending} disabled={isPending}>
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </motion.form>
            </ScrollArea>
        </DialogContent>
    );
}

function AddressField({
                          label,
                          htmlFor,
                          className,
                          children,
                      }: {
    label: string;
    htmlFor?: string;
    className?: string;
    children: ComponentProps<"div">["children"];
}) {
    return (
        <motion.div layout transition={fieldTransition} className={cn("flex flex-col gap-2", className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
        </motion.div>
    );
}

function createEmptyAddress(): AddressFormValue {
    return {
        firstName: "",
        lastName: "",
        phone: "",
        phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        district: "",
        country: "",
        countryCode: "",
        zipcode: "",
        isDefault: false,
    };
}

function resolveInitialAddressFormValue(address?: AddressFormValue | null): AddressFormValue {
    const fallback = createEmptyAddress();

    if (!address) {
        return fallback;
    }

    const phoneCountryCode = resolvePhoneCountryCode(address.phoneCountryCode, address.phone);

    return {
        ...fallback,
        ...address,
        phoneCountryCode,
        phone: stripPhoneCountryCode(address.phone, phoneCountryCode),
    };
}

function composeReceiverName(firstName: string, lastName: string) {
    return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

function resolvePhoneCountryCode(phoneCountryCode: string, phone: string) {
    const formatted = formatPhoneCountryCodeForInput(phoneCountryCode);

    if (formatted) {
        return formatted;
    }

    return detectPhoneCountryCode(phone) ?? DEFAULT_PHONE_COUNTRY_CODE;
}

function detectPhoneCountryCode(phone: string) {
    const trimmed = phone.trim();

    if (!trimmed.startsWith("+")) {
        return null;
    }

    return [...PHONE_COUNTRY_OPTIONS]
        .map((option) => option.value)
        .sort((left, right) => right.length - left.length)
        .find((option) => trimmed.startsWith(option)) ?? null;
}

function stripPhoneCountryCode(phone: string, phoneCountryCode: string) {
    const trimmed = phone.trim();

    if (!trimmed.startsWith("+")) {
        return trimmed;
    }

    if (trimmed.startsWith(phoneCountryCode)) {
        return trimmed.slice(phoneCountryCode.length).replace(/^[\s-]+/, "");
    }

    const detected = detectPhoneCountryCode(trimmed);

    if (detected) {
        return trimmed.slice(detected.length).replace(/^[\s-]+/, "");
    }

    return trimmed;
}
