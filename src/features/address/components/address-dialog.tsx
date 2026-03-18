"use client";

import {type ComponentProps, useRef, useState} from "react";
import {AnimatePresence, motion} from "motion/react";
import {useTranslations} from "next-intl";

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
type Translate = (key: string, values?: Record<string, string | number>) => string;
type ValidationFieldName =
    | "recipientName"
    | "phone"
    | "country"
    | "province"
    | "city"
    | "district"
    | "zipcode"
    | "addressLine1";

const REQUIRED_VALIDATION_FIELDS: ValidationFieldName[] = [
    "recipientName",
    "phone",
    "country",
    "province",
    "city",
    "district",
    "zipcode",
    "addressLine1",
];
const PHONE_INPUT_REGEX = /^\d+$/;

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
const animatedPhoneFieldClassName =
    "relative flex h-12 w-full overflow-hidden rounded-[var(--radius)] border bg-muted/40 transition-all duration-500 ease-in-out focus-within:border-ring/50 focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 data-[invalid=true]:border-destructive/20 dark:bg-muted/30 dark:data-[invalid=true]:border-destructive/50 dark:data-[invalid=true]:ring-destructive/40";
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
    const [touchedFields, setTouchedFields] = useState<Record<ValidationFieldName, boolean>>({
        recipientName: false,
        phone: false,
        country: false,
        province: false,
        city: false,
        district: false,
        zipcode: false,
        addressLine1: false,
    });

    function updateField<Key extends keyof AddressFormValue>(field: Key, value: AddressFormValue[Key]) {
        setFormData((current) => ({...current, [field]: value}));
    }

    function touchField(field: ValidationFieldName) {
        setTouchedFields((current) => (current[field] ? current : {...current, [field]: true}));
    }

    function touchFields(fields: ValidationFieldName[]) {
        setTouchedFields((current) => {
            const next = {...current};

            for (const field of fields) {
                next[field] = true;
            }

            return next;
        });
    }

    const validationErrors: Record<ValidationFieldName, string | null> = {
        recipientName: composeReceiverName(formData.firstName, formData.lastName)
            ? null
            : t("validation.requiredField", {field: t("fields.recipientName")}),
        phone: resolvePhoneValidationError(formData.phone, t),
        country: formData.country.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.country")}),
        province: formData.province.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.state")}),
        city: formData.city.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.city")}),
        district: formData.district.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.district")}),
        zipcode: formData.zipcode.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.zipcode")}),
        addressLine1: formData.addressLine1.trim()
            ? null
            : t("validation.requiredField", {field: t("fields.line1")}),
    };
    const hasRequiredFieldMissing = REQUIRED_VALIDATION_FIELDS.some((field) => Boolean(validationErrors[field]));
    const isRecipientNameInvalid = Boolean(validationErrors.recipientName);
    const isPhoneInvalid = Boolean(validationErrors.phone);
    const isCountryInvalid = Boolean(validationErrors.country);
    const isProvinceInvalid = Boolean(validationErrors.province);
    const isCityInvalid = Boolean(validationErrors.city);
    const isDistrictInvalid = Boolean(validationErrors.district);
    const isZipcodeInvalid = Boolean(validationErrors.zipcode);
    const isAddressLine1Invalid = Boolean(validationErrors.addressLine1);
    const shouldShowRecipientNameError = isRecipientNameInvalid && touchedFields.recipientName;
    const shouldShowPhoneError = isPhoneInvalid && touchedFields.phone;
    const shouldShowCountryError = isCountryInvalid && touchedFields.country;
    const shouldShowProvinceError = isProvinceInvalid && touchedFields.province;
    const shouldShowCityError = isCityInvalid && touchedFields.city;
    const shouldShowDistrictError = isDistrictInvalid && touchedFields.district;
    const shouldShowZipcodeError = isZipcodeInvalid && touchedFields.zipcode;
    const shouldShowAddressLine1Error = isAddressLine1Invalid && touchedFields.addressLine1;

    function handleSubmit(event: FormSubmitEvent) {
        event.preventDefault();

        if (hasRequiredFieldMissing) {
            touchFields(REQUIRED_VALIDATION_FIELDS);
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
            zipcode: formData.zipcode.trim(),
        });
    }

    return (
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-0 p-0 shadow-xl sm:max-w-125">
                <motion.form
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 10}}
                    transition={formTransition}
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto"
                >
                    <motion.div layout className="space-y-4 p-6">
                        <DialogHeader className="mb-2">
                            <DialogTitle>{address ? t("editTitle") : t("createTitle")}</DialogTitle>
                            <DialogDescription>{t("description")}</DialogDescription>
                        </DialogHeader>

                        <motion.div layout className="space-y-4 py-2">
                            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <AddressField
                                    label={t("fields.country")}
                                    htmlFor="address-country"
                                    errorMessage={shouldShowCountryError ? validationErrors.country : null}
                                >
                                    <Input
                                        id="address-country"
                                        placeholder={t("placeholders.country")}
                                        value={formData.country}
                                        autoComplete="country"
                                        disabled={isPending}
                                        onBlur={() => touchField("country")}
                                        onChange={(event) => updateField("country", event.target.value)}
                                        aria-invalid={shouldShowCountryError || undefined}
                                        data-invalid={shouldShowCountryError ? "true" : undefined}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField
                                    label={t("fields.state")}
                                    htmlFor="address-state"
                                    errorMessage={shouldShowProvinceError ? validationErrors.province : null}
                                >
                                    <Input
                                        id="address-state"
                                        placeholder={t("placeholders.state")}
                                        value={formData.province}
                                        autoComplete="address-level1"
                                        disabled={isPending}
                                        onBlur={() => touchField("province")}
                                        onChange={(event) => updateField("province", event.target.value)}
                                        aria-invalid={shouldShowProvinceError || undefined}
                                        data-invalid={shouldShowProvinceError ? "true" : undefined}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField
                                    label={t("fields.city")}
                                    htmlFor="address-city"
                                    errorMessage={shouldShowCityError ? validationErrors.city : null}
                                >
                                    <Input
                                        id="address-city"
                                        placeholder={t("placeholders.city")}
                                        value={formData.city}
                                        autoComplete="address-level2"
                                        disabled={isPending}
                                        onBlur={() => touchField("city")}
                                        onChange={(event) => updateField("city", event.target.value)}
                                        aria-invalid={shouldShowCityError || undefined}
                                        data-invalid={shouldShowCityError ? "true" : undefined}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField
                                    label={t("fields.district")}
                                    htmlFor="address-district"
                                    errorMessage={shouldShowDistrictError ? validationErrors.district : null}
                                >
                                    <Input
                                        id="address-district"
                                        placeholder={t("placeholders.district")}
                                        value={formData.district}
                                        autoComplete="address-level3"
                                        disabled={isPending}
                                        onBlur={() => touchField("district")}
                                        onChange={(event) => updateField("district", event.target.value)}
                                        aria-invalid={shouldShowDistrictError || undefined}
                                        data-invalid={shouldShowDistrictError ? "true" : undefined}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                                <AddressField
                                    label={t("fields.zipcode")}
                                    htmlFor="address-zip"
                                    errorMessage={shouldShowZipcodeError ? validationErrors.zipcode : null}
                                >
                                    <Input
                                        id="address-zip"
                                        placeholder={t("placeholders.zipcode")}
                                        value={formData.zipcode}
                                        autoComplete="postal-code"
                                        disabled={isPending}
                                        onBlur={() => touchField("zipcode")}
                                        onChange={(event) => updateField("zipcode", event.target.value)}
                                        aria-invalid={shouldShowZipcodeError || undefined}
                                        data-invalid={shouldShowZipcodeError ? "true" : undefined}
                                        className={animatedInputClassName}
                                    />
                                </AddressField>
                            </motion.div>

                            <AddressField
                                label={t("fields.line1")}
                                htmlFor="address-line1"
                                errorMessage={shouldShowAddressLine1Error ? validationErrors.addressLine1 : null}
                            >
                                <Input
                                    id="address-line1"
                                    placeholder={t("placeholders.line1")}
                                    value={formData.addressLine1}
                                    autoComplete="address-line1"
                                    disabled={isPending}
                                    onBlur={() => touchField("addressLine1")}
                                    onChange={(event) => updateField("addressLine1", event.target.value)}
                                    aria-invalid={shouldShowAddressLine1Error || undefined}
                                    data-invalid={shouldShowAddressLine1Error ? "true" : undefined}
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

                            <motion.div layout className="space-y-2">
                                <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <AddressField label={t("fields.firstName")} htmlFor="address-first-name">
                                        <Input
                                            id="address-first-name"
                                            placeholder={t("placeholders.firstName")}
                                            value={formData.firstName}
                                            autoComplete="given-name"
                                            disabled={isPending}
                                            onBlur={() => touchField("recipientName")}
                                            onChange={(event) => updateField("firstName", event.target.value)}
                                            aria-invalid={shouldShowRecipientNameError || undefined}
                                            data-invalid={shouldShowRecipientNameError ? "true" : undefined}
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
                                            onBlur={() => touchField("recipientName")}
                                            onChange={(event) => updateField("lastName", event.target.value)}
                                            aria-invalid={shouldShowRecipientNameError || undefined}
                                            data-invalid={shouldShowRecipientNameError ? "true" : undefined}
                                            className={animatedInputClassName}
                                        />
                                    </AddressField>
                                </motion.div>
                                <AnimatedFieldError
                                    message={shouldShowRecipientNameError ? validationErrors.recipientName : null}
                                />
                            </motion.div>

                            <AddressField
                                label={t("fields.phone")}
                                htmlFor="address-phone"
                                errorMessage={shouldShowPhoneError ? validationErrors.phone : null}
                            >
                                <motion.div
                                    layout
                                    data-invalid={shouldShowPhoneError ? "true" : undefined}
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
                                        onBlur={() => touchField("phone")}
                                        onChange={(event) => updateField("phone", event.target.value)}
                                        aria-invalid={shouldShowPhoneError || undefined}
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
                            <Button
                                type="submit"
                                size="lg"
                                isLoading={isPending}
                                disabled={isPending || hasRequiredFieldMissing}
                            >
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </motion.form>
        </DialogContent>
    );
}

function AddressField({
                          label,
                          htmlFor,
                          className,
                          errorMessage,
                          children,
                      }: {
    label: string;
    htmlFor?: string;
    className?: string;
    errorMessage?: string | null;
    children: ComponentProps<"div">["children"];
}) {
    return (
        <motion.div layout transition={fieldTransition} className={cn("flex flex-col gap-2", className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <AnimatedFieldError message={errorMessage ?? null}/>
        </motion.div>
    );
}

function AnimatedFieldError({
                                message,
                                id,
                                className,
                            }: {
    message: string | null;
    id?: string;
    className?: string;
}) {
    return (
        <AnimatePresence initial={false}>
            {message ? (
                <motion.div
                    key={message}
                    initial={{opacity: 0, height: 0, y: -6}}
                    animate={{opacity: 1, height: "auto", y: 0}}
                    exit={{opacity: 0, height: 0, y: -6}}
                    transition={{duration: 0.2, ease: "easeOut"}}
                    className="overflow-hidden"
                >
                    <p id={id} className={cn("pt-0.5 text-xs text-destructive", className)} aria-live="polite">
                        {message}
                    </p>
                </motion.div>
            ) : null}
        </AnimatePresence>
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

function resolvePhoneValidationError(phone: string, translate: Translate) {
    const trimmed = phone.trim();

    if (!trimmed) {
        return translate("validation.requiredField", {field: translate("fields.phone")});
    }

    if (!PHONE_INPUT_REGEX.test(trimmed)) {
        return translate("validation.invalidPhone");
    }

    return null;
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
