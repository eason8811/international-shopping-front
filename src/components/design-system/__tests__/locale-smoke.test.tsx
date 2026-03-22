import type { ComponentProps, ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import enMessages from "@/i18n/messages/en-US.json";
import zhMessages from "@/i18n/messages/zh-CN.json";
import { AddressManagementView } from "@/components/design-system/patterns/address-management-view";
import { UserProfileDashboard } from "@/components/design-system/patterns/user-profile-dashboard";
import type { UserAccountView, UserAddressListView, UserProfileView } from "@/entities/user";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  Link: ({ children, href, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const accountFixture: UserAccountView = {
  id: 42,
  username: "traveler.global",
  nickname: "A very long multilingual nickname that still needs to remain readable",
  email: "traveler@example.com",
  phone: {
    countryCode: "+49",
    nationalNumber: "15123456789",
    e164: "+4915123456789",
    display: "+49 151 2345 6789",
  },
  status: "ACTIVE",
  lastLoginAt: "2026-03-21T18:30:00.000Z",
  createdAt: "2025-11-01T12:00:00.000Z",
  updatedAt: "2026-03-22T08:00:00.000Z",
};

const profileFixture: UserProfileView = {
  displayName: "Alexandria Chen-Li Mendoza",
  avatarUrl: null,
  gender: "UNKNOWN",
  birthday: "1996-10-18",
  country: "Germany",
  province: "Berlin",
  city: "Berlin",
  addressLine: "Friedrichstrasse 100, Building C, Unit 4B, multilingual delivery instructions available upon request.",
  zipcode: "10117",
  extra: {
    updatedAt: "2026-03-22T09:15:00.000Z",
  },
  locationLabel: "Berlin, Germany",
  fullAddress:
    "Friedrichstrasse 100, Building C, Unit 4B, multilingual delivery instructions available upon request.",
};

const addressItems: UserAddressListView["items"] = [
  {
    id: 1,
    receiverName: "Alexandria Chen-Li Mendoza",
    phone: {
      countryCode: "+49",
      nationalNumber: "15123456789",
      e164: "+4915123456789",
      display: "+49 151 2345 6789",
    },
    country: "Germany",
    province: "Berlin",
    city: "Berlin",
    district: "Mitte",
    addressLine1: "Friedrichstrasse 100, Building C",
    addressLine2: "Unit 4B, leave at multilingual concierge desk",
    zipcode: "10117",
    isDefault: true,
    createdAt: "2025-12-01T09:30:00.000Z",
    updatedAt: "2026-03-22T09:15:00.000Z",
    locationLabel: "Berlin, Mitte",
    addressLines: [
      "Friedrichstrasse 100, Building C",
      "Unit 4B, leave at multilingual concierge desk",
    ],
    fullAddress:
      "Friedrichstrasse 100, Building C, Unit 4B, leave at multilingual concierge desk, Berlin, Mitte, 10117, Germany",
  },
  {
    id: 2,
    receiverName: "李安娜",
    phone: {
      countryCode: null,
      nationalNumber: null,
      e164: null,
      display: null,
    },
    country: "中国",
    province: "上海市",
    city: "上海市",
    district: "浦东新区",
    addressLine1: "张江高科技园区示例路 88 号",
    addressLine2: "国际配送请联系前台, 备注请保留简体中文原文。",
    zipcode: "201203",
    isDefault: false,
    createdAt: "2025-12-10T07:20:00.000Z",
    updatedAt: "2026-03-19T07:20:00.000Z",
    locationLabel: "上海市, 浦东新区",
    addressLines: [
      "张江高科技园区示例路 88 号",
      "国际配送请联系前台, 备注请保留简体中文原文。",
    ],
    fullAddress:
      "张江高科技园区示例路 88 号, 国际配送请联系前台, 备注请保留简体中文原文。, 上海市浦东新区, 201203, 中国",
  },
];

const addressesFixture: UserAddressListView = {
  items: addressItems,
  defaultAddress: addressItems[0],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

function renderWithLocale(locale: "en-US" | "zh-CN", children: ReactNode) {
  const messages = locale === "en-US" ? enMessages : zhMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("locale smoke coverage", () => {
  it("renders the user profile dashboard in English with long-copy data", () => {
    renderWithLocale(
      "en-US",
      <UserProfileDashboard
        initialAccount={accountFixture}
        initialProfile={profileFixture}
        initialAddresses={addressesFixture}
      />,
    );

    expect(screen.getByRole("heading", { name: enMessages.AccountPage.title })).toBeInTheDocument();
    expect(screen.getAllByText(enMessages.AccountPage.addressSection.title)).toHaveLength(2);
    expect(screen.getByText("Alexandria Chen-Li Mendoza")).toBeInTheDocument();
    expect(screen.getByText("Unit 4B, leave at multilingual concierge desk")).toBeInTheDocument();
  });

  it("renders the address management page in Simplified Chinese with multilingual addresses", () => {
    renderWithLocale(
      "zh-CN",
      <AddressManagementView initialAddresses={addressesFixture} />,
    );

    expect(screen.getByRole("heading", { name: zhMessages.AddressManagementPage.title })).toBeInTheDocument();
    expect(screen.getAllByText(zhMessages.AccountPage.addressSection.title).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("李安娜")).toBeInTheDocument();
    expect(screen.getByText("国际配送请联系前台, 备注请保留简体中文原文。")).toBeInTheDocument();
  });
});
