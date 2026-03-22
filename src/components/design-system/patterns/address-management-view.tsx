"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { Loader2, PlusIcon, SaveIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  CreateAddressInput,
  UpdateAddressInput,
  UserAddressListView,
  UserAddressView,
} from "@/entities/user";
import {
  ACCOUNT_CENTER_ADDRESS_PAGE_SIZE,
  createCurrentUserAddress,
  deleteCurrentUserAddress,
  listCurrentUserAddresses,
  setCurrentUserDefaultAddress,
  updateCurrentUserAddress,
} from "@/features/address";
import { normalizeClientError } from "@/lib/api/normalize-client-error";

import { EmptyState, ErrorState } from "../feedback";
import { DesignSystemPageShell } from "../page-shell";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../primitives";
import { AddressCard } from "./address-card";
import { EditorialMasthead } from "./editorial-masthead";
import { OrderSummaryCard } from "./order-summary-card";
import { PreferenceCard } from "./preference-card";

interface AddressNotice {
  kind: "success" | "error";
  title: string;
  message: string;
  traceId?: string;
}

interface AddressDraft {
  receiverName: string;
  phoneCountryCode: string;
  phoneNationalNumber: string;
  country: string;
  province: string;
  city: string;
  district: string;
  addressLine1: string;
  addressLine2: string;
  zipcode: string;
  isDefault: boolean;
}

const EMPTY_ADDRESS_DRAFT: AddressDraft = {
  receiverName: "",
  phoneCountryCode: "",
  phoneNationalNumber: "",
  country: "",
  province: "",
  city: "",
  district: "",
  addressLine1: "",
  addressLine2: "",
  zipcode: "",
  isDefault: false,
};

function toAddressDraft(address?: UserAddressView | null): AddressDraft {
  if (!address) {
    return EMPTY_ADDRESS_DRAFT;
  }

  return {
    receiverName: address.receiverName,
    phoneCountryCode: address.phone.countryCode ?? "",
    phoneNationalNumber: address.phone.nationalNumber ?? "",
    country: address.country ?? "",
    province: address.province ?? "",
    city: address.city ?? "",
    district: address.district ?? "",
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    zipcode: address.zipcode ?? "",
    isDefault: address.isDefault,
  };
}

function toCreateAddressInput(draft: AddressDraft): CreateAddressInput {
  return {
    receiverName: draft.receiverName.trim(),
    phoneCountryCode: draft.phoneCountryCode.trim(),
    phoneNationalNumber: draft.phoneNationalNumber.trim(),
    country: draft.country.trim(),
    province: draft.province.trim(),
    city: draft.city.trim(),
    district: draft.district.trim(),
    addressLine1: draft.addressLine1.trim(),
    addressLine2: draft.addressLine2.trim() || undefined,
    zipcode: draft.zipcode.trim(),
    isDefault: draft.isDefault,
  };
}

function toUpdateAddressInput(draft: AddressDraft): UpdateAddressInput {
  return toCreateAddressInput(draft);
}

function useIsMobileSheet() {
  const [isMobile, setIsMobile] = useState(false);
  const handleChange = useEffectEvent((query: MediaQueryList | MediaQueryListEvent) => {
    setIsMobile(query.matches);
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

function AddressEditorSurface({
  open,
  mode,
  draft,
  pending,
  error,
  onOpenChange,
  onSubmit,
  onChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  draft: AddressDraft;
  pending: boolean;
  error: string | null;
  onOpenChange: (nextOpen: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (key: keyof AddressDraft, value: string | boolean) => void;
}) {
  const t = useTranslations("AccountPage.addressDialog");
  const isMobile = useIsMobileSheet();
  const title = mode === "create" ? t("createTitle") : t("editTitle");
  const saveLabel = pending ? t("actions.saving") : t("actions.save");

  const formContent = (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="address-receiverName">{t("fields.receiverName")}</FieldLabel>
          <Input
            id="address-receiverName"
            value={draft.receiverName}
            onChange={(event) => onChange("receiverName", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-country">{t("fields.country")}</FieldLabel>
          <Input
            id="address-country"
            value={draft.country}
            onChange={(event) => onChange("country", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-phoneCountryCode">{t("fields.phoneCountryCode")}</FieldLabel>
          <Input
            id="address-phoneCountryCode"
            value={draft.phoneCountryCode}
            onChange={(event) => onChange("phoneCountryCode", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-phoneNationalNumber">{t("fields.phoneNationalNumber")}</FieldLabel>
          <Input
            id="address-phoneNationalNumber"
            value={draft.phoneNationalNumber}
            onChange={(event) => onChange("phoneNationalNumber", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="address-addressLine1">{t("fields.addressLine1")}</FieldLabel>
          <Input
            id="address-addressLine1"
            value={draft.addressLine1}
            onChange={(event) => onChange("addressLine1", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="address-addressLine2">{t("fields.addressLine2")}</FieldLabel>
          <Input
            id="address-addressLine2"
            value={draft.addressLine2}
            onChange={(event) => onChange("addressLine2", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-province">{t("fields.province")}</FieldLabel>
          <Input
            id="address-province"
            value={draft.province}
            onChange={(event) => onChange("province", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-city">{t("fields.city")}</FieldLabel>
          <Input
            id="address-city"
            value={draft.city}
            onChange={(event) => onChange("city", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-district">{t("fields.district")}</FieldLabel>
          <Input
            id="address-district"
            value={draft.district}
            onChange={(event) => onChange("district", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="address-zipcode">{t("fields.zipcode")}</FieldLabel>
          <Input
            id="address-zipcode"
            value={draft.zipcode}
            onChange={(event) => onChange("zipcode", event.target.value)}
          />
        </Field>
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.isDefault}
          onChange={(event) => onChange("isDefault", event.target.checked)}
        />
        <span className="ds-type-body-md text-[var(--ds-on-surface)]">{t("fields.isDefault")}</span>
      </label>
      {error ? <FieldError>{error}</FieldError> : null}
      {isMobile ? (
        <SheetFooter>
          <Button type="submit" disabled={pending} fullWidth>
            {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
            {saveLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} fullWidth>
            {t("actions.cancel")}
          </Button>
        </SheetFooter>
      ) : (
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent variant="mobileEditor">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{t("description")}</SheetDescription>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

export function AddressManagementView({
  initialAddresses,
}: {
  initialAddresses: UserAddressListView;
}) {
  const t = useTranslations("AccountPage");
  const pageT = useTranslations("AddressManagementPage");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [notice, setNotice] = useState<AddressNotice | null>(null);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [addressEditorMode, setAddressEditorMode] = useState<"create" | "edit">("create");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(EMPTY_ADDRESS_DRAFT);
  const [isAddressPending, startAddressTransition] = useTransition();

  const summary = useMemo(() => {
    const defaultAddress = addresses.defaultAddress;
    return {
      count: addresses.items.length,
      defaultAddress,
      ready: Boolean(defaultAddress),
    };
  }, [addresses.defaultAddress, addresses.items.length]);

  const refreshAddresses = async () => {
    const nextAddresses = await listCurrentUserAddresses({
      page: 1,
      size: ACCOUNT_CENTER_ADDRESS_PAGE_SIZE,
    });
    setAddresses(nextAddresses);
  };

  const pushErrorNotice = (title: string, error: unknown) => {
    const normalized = normalizeClientError(error, title);
    setNotice({
      kind: "error",
      title,
      message: normalized.message,
      traceId: normalized.traceId,
    });
  };

  const pushSuccessNotice = (title: string, message: string) => {
    setNotice({
      kind: "success",
      title,
      message,
    });
  };

  const openAddressEditor = (address?: UserAddressView) => {
    setAddressEditorMode(address ? "edit" : "create");
    setEditingAddressId(address?.id ?? null);
    setAddressDraft(toAddressDraft(address));
    setAddressError(null);
    setAddressEditorOpen(true);
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !addressDraft.receiverName.trim() ||
      !addressDraft.phoneCountryCode.trim() ||
      !addressDraft.phoneNationalNumber.trim() ||
      !addressDraft.country.trim() ||
      !addressDraft.addressLine1.trim()
    ) {
      setAddressError(t("addressDialog.errors.required"));
      return;
    }

    setAddressError(null);
    startAddressTransition(() => {
      void (async () => {
        try {
          if (addressEditorMode === "create") {
            await createCurrentUserAddress(toCreateAddressInput(addressDraft));
            pushSuccessNotice(t("addressSection.createTitle"), t("addressSection.createMessage"));
          } else if (editingAddressId !== null) {
            await updateCurrentUserAddress(editingAddressId, toUpdateAddressInput(addressDraft));
            pushSuccessNotice(t("addressSection.updateTitle"), t("addressSection.updateMessage"));
          }

          await refreshAddresses();
          setAddressEditorOpen(false);
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
  };

  const handleSetDefault = (addressId: number) => {
    startAddressTransition(() => {
      void (async () => {
        try {
          await setCurrentUserDefaultAddress(addressId);
          await refreshAddresses();
          pushSuccessNotice(t("addressSection.defaultTitle"), t("addressSection.defaultMessage"));
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
  };

  const handleDeleteAddress = (addressId: number) => {
    if (!window.confirm(t("addressSection.deleteConfirmDescription"))) {
      return;
    }

    startAddressTransition(() => {
      void (async () => {
        try {
          await deleteCurrentUserAddress(addressId);
          await refreshAddresses();
          pushSuccessNotice(t("addressSection.deleteTitle"), t("addressSection.deleteMessage"));
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
  };

  return (
    <DesignSystemPageShell patternName="addressManagement">
      <EditorialMasthead
        eyebrow={pageT("eyebrow")}
        metadata={`${summary.count} ${pageT("summary.count")}`}
        title={pageT("title")}
        description={pageT("description")}
        primaryAction={
          <Button onClick={() => openAddressEditor()}>
            <PlusIcon data-icon="inline-start" />
            {t("addressSection.actions.add")}
          </Button>
        }
      />

      {notice ? (
        notice.kind === "error" ? (
          <ErrorState
            title={notice.title}
            description={notice.message}
            traceId={notice.traceId}
            action={
              <Button variant="secondary" onClick={() => setNotice(null)}>
                {pageT("feedback.dismiss")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(18rem,4fr)]">
            <PreferenceCard title={notice.title} description={notice.message}>
              <Badge tone="success" size="sm">
                {pageT("feedback.updated")}
              </Badge>
            </PreferenceCard>
            <OrderSummaryCard
              eyebrow={pageT("eyebrow")}
              title={pageT("summary.default")}
              status={summary.ready ? pageT("summary.ready") : pageT("summary.pending")}
              amount={`${summary.count}`}
              amountLabel={pageT("summary.count")}
              itemSummary={summary.defaultAddress?.fullAddress ?? pageT("summary.defaultMissing")}
              timelineLabel={t("addressSection.title")}
              timeline={t("addressSection.description")}
            />
          </div>
        )
      ) : (
        <OrderSummaryCard
          eyebrow={pageT("eyebrow")}
          title={pageT("summary.default")}
          status={summary.ready ? pageT("summary.ready") : pageT("summary.pending")}
          amount={`${summary.count}`}
          amountLabel={pageT("summary.count")}
          itemSummary={summary.defaultAddress?.fullAddress ?? pageT("summary.defaultMissing")}
          timelineLabel={t("addressSection.title")}
          timeline={t("addressSection.description")}
          action={
            <Button variant="ghost" onClick={() => openAddressEditor(summary.defaultAddress ?? undefined)}>
              <StarIcon data-icon="inline-start" />
              {summary.defaultAddress ? t("addressSection.actions.edit") : t("addressSection.actions.add")}
            </Button>
          }
        />
      )}

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="ds-type-headline-md text-[var(--ds-on-surface-strong)]">{t("addressSection.title")}</h2>
            <p className="ds-type-body-md max-w-3xl text-[var(--ds-on-surface-muted)]">
              {t("addressSection.description")}
            </p>
          </div>
          <Button onClick={() => openAddressEditor()}>
            <PlusIcon data-icon="inline-start" />
            {t("addressSection.actions.add")}
          </Button>
        </div>

        {addresses.items.length === 0 ? (
          <EmptyState
            eyebrow={t("addressSection.title")}
            title={t("addressSection.emptyTitle")}
            description={t("addressSection.emptyDescription")}
            action={
              <Button onClick={() => openAddressEditor()}>
                <PlusIcon data-icon="inline-start" />
                {t("addressSection.actions.add")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {addresses.items.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                defaultLabel={t("addressSection.defaultBadge")}
                emptyPhoneLabel={t("addressSection.emptyPhone")}
                actions={
                  <div className="flex flex-wrap gap-2">
                    {!address.isDefault ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={isAddressPending}
                      >
                        {t("addressSection.actions.setDefault")}
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => openAddressEditor(address)}>
                      {t("addressSection.actions.edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isAddressPending}
                    >
                      {t("addressSection.actions.delete")}
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <AddressEditorSurface
        open={addressEditorOpen}
        mode={addressEditorMode}
        draft={addressDraft}
        pending={isAddressPending}
        error={addressError}
        onOpenChange={setAddressEditorOpen}
        onSubmit={handleAddressSubmit}
        onChange={(key, value) =>
          setAddressDraft((previous) => ({
            ...previous,
            [key]: value,
          }))
        }
      />
    </DesignSystemPageShell>
  );
}
