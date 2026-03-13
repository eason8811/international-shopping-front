"use client";

import {type ComponentProps, useState} from "react";
import {MapPin, SearchIcon} from "lucide-react";
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

export interface AddressFormValue {
    id?: number;
    receiverName: string;
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
    const [formData, setFormData] = useState<AddressFormValue>(address ?? createEmptyAddress());
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    function handleSuggestionClick(data: Partial<AddressFormValue>) {
        setFormData((current) => ({...current, ...data}));
        setSearchQuery("");
        setShowDropdown(false);
    }

    function handleSubmit(event: FormSubmitEvent) {
        event.preventDefault();

        if (!formData.receiverName.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.country.trim()) {
            toast.error(t("validation.required"));
            return;
        }

        onSave({
            ...formData,
            receiverName: formData.receiverName.trim(),
            phone: formData.phone.trim(),
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
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        <DialogHeader className="mb-2">
                            <DialogTitle>{address ? t("editTitle") : t("createTitle")}</DialogTitle>
                            <DialogDescription>{t("description")}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="relative space-y-2">
                                <Label>{t("searchLabel")}</Label>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <SearchIcon className="size-4 text-muted-foreground"/>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        placeholder={t("searchPlaceholder")}
                                        value={searchQuery}
                                        onChange={(event) => {
                                            setSearchQuery(event.target.value);
                                            setShowDropdown(event.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowDropdown(searchQuery.length > 0)}
                                        onBlur={() => {
                                            window.setTimeout(() => setShowDropdown(false), 200);
                                        }}
                                    />
                                </InputGroup>

                                {showDropdown ? (
                                    <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-lg">
                                        {filteredSuggestions.length > 0 ? (
                                            filteredSuggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.text}
                                                    className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 text-sm transition-colors last:border-0 hover:bg-muted"
                                                    onMouseDown={() => handleSuggestionClick(suggestion.data)}
                                                >
                                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                                                        <MapPin className="size-3.5 text-muted-foreground"/>
                                                    </div>
                                                    <span className="truncate">{suggestion.text}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                                {t("noPlaces")}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            <div className="group relative flex h-32 cursor-crosshair items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
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
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-country">{t("fields.country")}</Label>
                                    <Input
                                        id="address-country"
                                        value={formData.country}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, country: event.target.value}))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-state">{t("fields.state")}</Label>
                                    <Input
                                        id="address-state"
                                        value={formData.province}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, province: event.target.value}))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-city">{t("fields.city")}</Label>
                                    <Input
                                        id="address-city"
                                        value={formData.city}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, city: event.target.value}))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-zip">{t("fields.zipcode")}</Label>
                                    <Input
                                        id="address-zip"
                                        value={formData.zipcode}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, zipcode: event.target.value}))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="address-line1">{t("fields.line1")}</Label>
                                <Input
                                    id="address-line1"
                                    value={formData.addressLine1}
                                    onChange={(event) =>
                                        setFormData((current) => ({...current, addressLine1: event.target.value}))
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="address-line2">{t("fields.line2")}</Label>
                                <Input
                                    id="address-line2"
                                    placeholder={t("optional")}
                                    value={formData.addressLine2}
                                    onChange={(event) =>
                                        setFormData((current) => ({...current, addressLine2: event.target.value}))
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-name">{t("fields.name")}</Label>
                                    <Input
                                        id="address-name"
                                        value={formData.receiverName}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, receiverName: event.target.value}))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address-phone">{t("fields.phone")}</Label>
                                    <Input
                                        id="address-phone"
                                        placeholder={t("phonePlaceholder")}
                                        value={formData.phone}
                                        onChange={(event) =>
                                            setFormData((current) => ({...current, phone: event.target.value}))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="address-default"
                                    checked={formData.isDefault}
                                    onCheckedChange={(checked) =>
                                        setFormData((current) => ({...current, isDefault: Boolean(checked)}))
                                    }
                                />
                                <Label
                                    htmlFor="address-default"
                                    className="cursor-pointer text-sm font-medium leading-none"
                                >
                                    {t("setDefault")}
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" isLoading={isPending} disabled={isPending}>
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </ScrollArea>
        </DialogContent>
    );
}

function createEmptyAddress(): AddressFormValue {
    return {
        receiverName: "",
        phone: "",
        phoneCountryCode: "",
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
