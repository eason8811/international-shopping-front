"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { Loader2, LogOutIcon, MapPinIcon, PlusIcon, SaveIcon, ShieldCheckIcon, StarIcon, UserRoundIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type {
  CreateAddressInput,
  UpdateAccountInput,
  UpdateAddressInput,
  UpdateProfileInput,
  UserAccountView,
  UserAddressListView,
  UserAddressView,
  UserProfileView,
} from "@/entities/user";
import {
  ACCOUNT_CENTER_ADDRESS_PAGE_SIZE,
  createCurrentUserAddress,
  deleteCurrentUserAddress,
  listCurrentUserAddresses,
  setCurrentUserDefaultAddress,
  updateCurrentUserAddress,
} from "@/features/address";
import { logoutUser } from "@/features/auth";
import { useRouter } from "@/i18n/navigation";
import { normalizeClientError } from "@/lib/api/normalize-client-error";

import { updateCurrentUserAccount, updateCurrentUserProfile } from "@/features/profile";
import { ErrorState, EmptyState } from "../feedback";
import { DesignSystemPageShell } from "../page-shell";
import { AddressCard } from "./address-card";
import { EditorialMasthead } from "./editorial-masthead";
import { OrderSummaryCard } from "./order-summary-card";
import { PreferenceCard } from "./preference-card";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  SelectControl,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  TextareaControl,
} from "../primitives";

interface AccountNotice {
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

function formatDateTime(locale: string, value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toUpdateAccountInput(draft: {
  nickname: string;
  phoneCountryCode: string;
  phoneNationalNumber: string;
}): UpdateAccountInput {
  return {
    nickname: draft.nickname.trim() || undefined,
    phoneCountryCode: draft.phoneCountryCode.trim() || undefined,
    phoneNationalNumber: draft.phoneNationalNumber.trim() || undefined,
  };
}

function toUpdateProfileInput(draft: {
  displayName: string;
  birthday: string;
  gender: string;
  country: string;
  province: string;
  city: string;
  addressLine: string;
  zipcode: string;
}): UpdateProfileInput {
  return {
    displayName: draft.displayName.trim() || undefined,
    birthday: draft.birthday.trim() || undefined,
    gender: draft.gender ? (draft.gender as UpdateProfileInput["gender"]) : undefined,
    country: draft.country.trim() || undefined,
    province: draft.province.trim() || undefined,
    city: draft.city.trim() || undefined,
    addressLine: draft.addressLine.trim() || undefined,
    zipcode: draft.zipcode.trim() || undefined,
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
          <FieldLabel htmlFor="receiverName">{t("fields.receiverName")}</FieldLabel>
          <Input
            id="receiverName"
            value={draft.receiverName}
            onChange={(event) => onChange("receiverName", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="country">{t("fields.country")}</FieldLabel>
          <Input
            id="country"
            value={draft.country}
            onChange={(event) => onChange("country", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phoneCountryCode">{t("fields.phoneCountryCode")}</FieldLabel>
          <Input
            id="phoneCountryCode"
            value={draft.phoneCountryCode}
            onChange={(event) => onChange("phoneCountryCode", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phoneNationalNumber">{t("fields.phoneNationalNumber")}</FieldLabel>
          <Input
            id="phoneNationalNumber"
            value={draft.phoneNationalNumber}
            onChange={(event) => onChange("phoneNationalNumber", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="addressLine1">{t("fields.addressLine1")}</FieldLabel>
          <Input
            id="addressLine1"
            value={draft.addressLine1}
            onChange={(event) => onChange("addressLine1", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="addressLine2">{t("fields.addressLine2")}</FieldLabel>
          <Input
            id="addressLine2"
            value={draft.addressLine2}
            onChange={(event) => onChange("addressLine2", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="province">{t("fields.province")}</FieldLabel>
          <Input
            id="province"
            value={draft.province}
            onChange={(event) => onChange("province", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="city">{t("fields.city")}</FieldLabel>
          <Input
            id="city"
            value={draft.city}
            onChange={(event) => onChange("city", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="district">{t("fields.district")}</FieldLabel>
          <Input
            id="district"
            value={draft.district}
            onChange={(event) => onChange("district", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="zipcode">{t("fields.zipcode")}</FieldLabel>
          <Input
            id="zipcode"
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

export function UserProfileDashboard({
  initialAccount,
  initialProfile,
  initialAddresses,
}: {
  initialAccount: UserAccountView;
  initialProfile: UserProfileView;
  initialAddresses: UserAddressListView;
}) {
  const t = useTranslations("AccountPage");
  const locale = useLocale();
  const router = useRouter();
  const accountSectionRef = useRef<HTMLElement | null>(null);
  const profileSectionRef = useRef<HTMLElement | null>(null);
  const addressSectionRef = useRef<HTMLElement | null>(null);

  const [account, setAccount] = useState(initialAccount);
  const [profile, setProfile] = useState(initialProfile);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [notice, setNotice] = useState<AccountNotice | null>(null);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [addressEditorMode, setAddressEditorMode] = useState<"create" | "edit">("create");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(EMPTY_ADDRESS_DRAFT);
  const [accountDraft, setAccountDraft] = useState({
    nickname: initialAccount.nickname,
    phoneCountryCode: initialAccount.phone.countryCode ?? "",
    phoneNationalNumber: initialAccount.phone.nationalNumber ?? "",
  });
  const [profileDraft, setProfileDraft] = useState({
    displayName: initialProfile.displayName ?? "",
    birthday: initialProfile.birthday ?? "",
    gender: initialProfile.gender ?? "",
    country: initialProfile.country ?? "",
    province: initialProfile.province ?? "",
    city: initialProfile.city ?? "",
    addressLine: initialProfile.addressLine ?? "",
    zipcode: initialProfile.zipcode ?? "",
  });

  const [isAccountPending, startAccountTransition] = useTransition();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isAddressPending, startAddressTransition] = useTransition();
  const [isLogoutPending, startLogoutTransition] = useTransition();

  const readinessItems = useMemo(() => {
    const profileReady = Boolean(
      profile.displayName || profile.country || profile.city || profile.addressLine,
    );
    const defaultAddress = addresses.defaultAddress;

    return [
      {
        label: t("summary.emailReady"),
        ready: Boolean(account.email),
        value: account.email ?? t("summary.emailMissing"),
      },
      {
        label: t("summary.phoneReady"),
        ready: Boolean(account.phone.display),
        value: account.phone.display ?? t("summary.phoneMissing"),
      },
      {
        label: t("summary.profileReady"),
        ready: profileReady,
        value: profile.fullAddress ?? t("summary.defaultAddressReady"),
      },
      {
        label: t("summary.addressReady"),
        ready: Boolean(defaultAddress),
        value: defaultAddress?.fullAddress ?? t("summary.addressMissing"),
      },
    ];
  }, [account.email, account.phone.display, addresses.defaultAddress, profile.fullAddress, profile.displayName, profile.country, profile.city, profile.addressLine, t]);

  const readyCount = readinessItems.filter((item) => item.ready).length;
  const lastLoginLabel = formatDateTime(locale, account.lastLoginAt) ?? t("headerStats.never");
  const accountUpdatedLabel = formatDateTime(locale, account.updatedAt);
  const profileUpdatedLabel =
    typeof profile.extra?.updatedAt === "string"
      ? formatDateTime(locale, profile.extra.updatedAt)
      : null;

  const handleScrollTo = (section: "account" | "profile" | "address") => {
    const element =
      section === "account"
        ? accountSectionRef.current
        : section === "profile"
          ? profileSectionRef.current
          : addressSectionRef.current;

    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startAccountTransition(() => {
      void (async () => {
        try {
          const nextAccount = await updateCurrentUserAccount(toUpdateAccountInput(accountDraft));
          setAccount(nextAccount);
          setAccountDraft({
            nickname: nextAccount.nickname,
            phoneCountryCode: nextAccount.phone.countryCode ?? "",
            phoneNationalNumber: nextAccount.phone.nationalNumber ?? "",
          });
          pushSuccessNotice(t("accountForm.successTitle"), t("accountForm.successMessage"));
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startProfileTransition(() => {
      void (async () => {
        try {
          const nextProfile = await updateCurrentUserProfile(toUpdateProfileInput(profileDraft));
          setProfile(nextProfile);
          setProfileDraft({
            displayName: nextProfile.displayName ?? "",
            birthday: nextProfile.birthday ?? "",
            gender: nextProfile.gender ?? "",
            country: nextProfile.country ?? "",
            province: nextProfile.province ?? "",
            city: nextProfile.city ?? "",
            addressLine: nextProfile.addressLine ?? "",
            zipcode: nextProfile.zipcode ?? "",
          });
          pushSuccessNotice(t("profileForm.successTitle"), t("profileForm.successMessage"));
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
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

  const handleLogout = () => {
    startLogoutTransition(() => {
      void (async () => {
        try {
          await logoutUser();
          startTransition(() => {
            router.replace("/login");
          });
        } catch (error) {
          pushErrorNotice(t("errors.title"), error);
        }
      })();
    });
  };

  return (
    <DesignSystemPageShell patternName="userProfileDashboard">
      <EditorialMasthead
        eyebrow={t("eyebrow")}
        metadata={account.status === "ACTIVE" ? t("status.ACTIVE") : t("status.DISABLED")}
        title={t("title")}
        description={t("description")}
        primaryAction={
          <Button onClick={() => openAddressEditor()}>
            <PlusIcon data-icon="inline-start" />
            {t("summary.addAddress")}
          </Button>
        }
        secondaryAction={
          <Button variant="secondary" onClick={handleLogout} disabled={isLogoutPending}>
            {isLogoutPending ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <LogOutIcon data-icon="inline-start" />
            )}
            {isLogoutPending ? t("summary.loggingOut") : t("summary.logout")}
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
                {t("feedback.dismiss")}
              </Button>
            }
          />
        ) : (
          <Card variant="nested">
            <CardHeader>
              <Badge tone="success" size="sm">
                {t("feedback.updated")}
              </Badge>
              <CardTitle>{notice.title}</CardTitle>
              <CardDescription>{notice.message}</CardDescription>
            </CardHeader>
          </Card>
        )
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,5fr)]">
        <div className="flex flex-col gap-6">
          <Card ref={accountSectionRef} variant="base" id="account">
            <CardHeader>
              <CardTitle>{t("accountForm.title")}</CardTitle>
              <CardDescription>{t("accountForm.description")}</CardDescription>
            </CardHeader>
            <CardContent className="gap-5 pt-0">
              <form className="flex flex-col gap-5" onSubmit={handleAccountSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="username">{t("accountForm.fields.username")}</FieldLabel>
                    <Input id="username" value={account.username} disabled />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">{t("accountForm.fields.email")}</FieldLabel>
                    <Input id="email" value={account.email ?? ""} disabled />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nickname">{t("accountForm.fields.nickname")}</FieldLabel>
                    <Input
                      id="nickname"
                      value={accountDraft.nickname}
                      onChange={(event) =>
                        setAccountDraft((previous) => ({ ...previous, nickname: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phoneCountryCode">{t("accountForm.fields.phoneCountryCode")}</FieldLabel>
                    <Input
                      id="phoneCountryCode"
                      value={accountDraft.phoneCountryCode}
                      onChange={(event) =>
                        setAccountDraft((previous) => ({
                          ...previous,
                          phoneCountryCode: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="phoneNationalNumber">{t("accountForm.fields.phoneNationalNumber")}</FieldLabel>
                    <Input
                      id="phoneNationalNumber"
                      value={accountDraft.phoneNationalNumber}
                      onChange={(event) =>
                        setAccountDraft((previous) => ({
                          ...previous,
                          phoneNationalNumber: event.target.value,
                        }))
                      }
                    />
                    {accountUpdatedLabel ? (
                      <FieldDescription>
                        {t("accountForm.updatedAt")}: {accountUpdatedLabel}
                      </FieldDescription>
                    ) : null}
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isAccountPending}>
                    {isAccountPending ? (
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <SaveIcon data-icon="inline-start" />
                    )}
                    {isAccountPending ? t("accountForm.actions.saving") : t("accountForm.actions.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card ref={profileSectionRef} variant="base" id="profile">
            <CardHeader>
              <CardTitle>{t("profileForm.title")}</CardTitle>
              <CardDescription>{t("profileForm.description")}</CardDescription>
            </CardHeader>
            <CardContent className="gap-5 pt-0">
              <form className="flex flex-col gap-5" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="displayName">{t("profileForm.fields.displayName")}</FieldLabel>
                    <Input
                      id="displayName"
                      value={profileDraft.displayName}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({
                          ...previous,
                          displayName: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="birthday">{t("profileForm.fields.birthday")}</FieldLabel>
                    <Input
                      id="birthday"
                      type="date"
                      value={profileDraft.birthday}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, birthday: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="gender">{t("profileForm.fields.gender")}</FieldLabel>
                    <SelectControl
                      id="gender"
                      value={profileDraft.gender}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, gender: event.target.value }))
                      }
                    >
                      <option value="">{t("profileForm.placeholders.gender")}</option>
                      <option value="UNKNOWN">{t("profileForm.gender.UNKNOWN")}</option>
                      <option value="MALE">{t("profileForm.gender.MALE")}</option>
                      <option value="FEMALE">{t("profileForm.gender.FEMALE")}</option>
                    </SelectControl>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="countryProfile">{t("profileForm.fields.country")}</FieldLabel>
                    <Input
                      id="countryProfile"
                      value={profileDraft.country}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, country: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="provinceProfile">{t("profileForm.fields.province")}</FieldLabel>
                    <Input
                      id="provinceProfile"
                      value={profileDraft.province}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, province: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cityProfile">{t("profileForm.fields.city")}</FieldLabel>
                    <Input
                      id="cityProfile"
                      value={profileDraft.city}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, city: event.target.value }))
                      }
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="addressLine">{t("profileForm.fields.addressLine")}</FieldLabel>
                    <TextareaControl
                      id="addressLine"
                      value={profileDraft.addressLine}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, addressLine: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="zipcodeProfile">{t("profileForm.fields.zipcode")}</FieldLabel>
                    <Input
                      id="zipcodeProfile"
                      value={profileDraft.zipcode}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({ ...previous, zipcode: event.target.value }))
                      }
                    />
                    {profileUpdatedLabel ? (
                      <FieldDescription>
                        {t("profileForm.updatedAt")}: {profileUpdatedLabel}
                      </FieldDescription>
                    ) : null}
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isProfilePending}>
                    {isProfilePending ? (
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <SaveIcon data-icon="inline-start" />
                    )}
                    {isProfilePending ? t("profileForm.actions.saving") : t("profileForm.actions.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <PreferenceCard title={t("readiness.title")} description={t("readiness.description")}>
            {readinessItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--ds-surface-container-low)] px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="ds-type-title-md text-[var(--ds-on-surface-strong)]">{item.label}</p>
                  <p className="ds-type-body-md text-[var(--ds-on-surface-muted)]">{item.value}</p>
                </div>
                <Badge tone={item.ready ? "success" : "warning"}>{item.ready ? t("readiness.ready") : t("readiness.pending")}</Badge>
              </div>
            ))}
          </PreferenceCard>

          <PreferenceCard title={t("navigation.title")} description={t("navigation.description")}>
            <Button variant="secondary" fullWidth onClick={() => handleScrollTo("account")}>
              <UserRoundIcon data-icon="inline-start" />
              {t("navigation.account")}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => handleScrollTo("profile")}>
              <ShieldCheckIcon data-icon="inline-start" />
              {t("navigation.profile")}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => handleScrollTo("address")}>
              <MapPinIcon data-icon="inline-start" />
              {t("navigation.address")}
            </Button>
          </PreferenceCard>

          <OrderSummaryCard
            eyebrow={t("headerStats.status")}
            title={t("readiness.title")}
            status={`${readyCount}/${readinessItems.length}`}
            amount={`${readyCount}/${readinessItems.length}`}
            amountLabel={t("headerStats.addresses")}
            itemSummary={t("description")}
            timelineLabel={t("headerStats.lastLogin")}
            timeline={lastLoginLabel}
            action={
              <Button variant="ghost" onClick={() => handleScrollTo("address")}>
                <StarIcon data-icon="inline-start" />
                {t("summary.defaultAddress")}
              </Button>
            }
          />
        </div>
      </section>

      <section ref={addressSectionRef} id="address" className="flex flex-col gap-6">
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
