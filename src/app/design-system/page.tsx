import type {Metadata} from "next";
import {CreditCard, Heart, Search, Settings, ShoppingBag, UserRound} from "lucide-react";

import {
    AddressCard,
    AuthBlock,
    FinancialSummary,
    HeaderHero,
    OrderCard,
    OrderHistoryButton,
    ProductListItem,
    ShipmentCard,
    StatusBadge,
    SupportThread,
} from "@/components/blocks";
import {Footer, GlobalSearch, LocaleSwitcher, Navbar, Sidebar} from "@/components/shared";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    IconButton,
    Input,
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    Label,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    RadioGroup,
    RadioGroupItem,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from "@/components/ui";

export const metadata: Metadata = {
    title: "Design System Validation",
};

function ShowcaseSection({
    id,
    eyebrow,
    title,
    children,
}: {
    id: string;
    eyebrow: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="flex scroll-mt-8 flex-col gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">{eyebrow}</p>
                <h2 className="font-serif text-3xl leading-tight text-text-primary">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function PreviewCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="rounded-card shadow-none">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

const navigation = [
    {label: "Women", href: "#", isActive: true},
    {label: "Men", href: "#"},
    {label: "Accessories", href: "#"},
    {label: "Orders", href: "#"},
];

export default function DesignSystemValidationPage() {
    return (
        <main className="min-h-dvh bg-background text-foreground">
            <Navbar
                brand="Atelier Cart"
                items={navigation}
                actions={
                    <LocaleSwitcher
                        options={[
                            {value: "en-US", label: "EN"},
                            {value: "zh-CN", label: "中文"},
                        ]}
                        placeholder="EN"
                    />
                }
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8">
                <HeaderHero
                    eyebrow="Design system validation"
                    title="Components and blocks"
                    description="A single inspection route for the shadcn-based primitives, shared layout components, and commerce blocks introduced for the Figma design-system rules."
                    actions={[
                        {label: "Review atoms", variant: "default"},
                        {label: "Review blocks", variant: "outline"},
                    ]}
                    media={
                        <Card className="rounded-card-emphasis shadow-dialog">
                            <CardHeader>
                                <CardTitle>Checkout Summary</CardTitle>
                                <CardDescription>Semantic tokens, status badges, and composed cards.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">Order</span>
                                    <StatusBadge domain="order" status="PAID" />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="font-mono text-lg font-semibold text-text-primary">$428.00</span>
                                </div>
                            </CardContent>
                        </Card>
                    }
                />

                <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start">
                    <Sidebar
                        className="rounded-card border"
                        sections={[
                            {
                                title: "Validation",
                                items: [
                                    {label: "Atoms", href: "#atoms", isActive: true},
                                    {label: "Forms", href: "#forms"},
                                    {label: "Overlays", href: "#overlays"},
                                    {label: "Shared", href: "#shared"},
                                    {label: "Blocks", href: "#blocks", badge: <Badge variant="secondary">10</Badge>},
                                ],
                            },
                        ]}
                    />

                    <div className="flex min-w-0 flex-col gap-12">
                        <ShowcaseSection id="atoms" eyebrow="ui primitives" title="Buttons, badges, cards, and pagination">
                            <div className="grid gap-4 xl:grid-cols-2">
                                <PreviewCard title="Button variants">
                                    <div className="flex flex-wrap gap-2">
                                        <Button>Primary</Button>
                                        <Button variant="secondary">Secondary</Button>
                                        <Button variant="outline">Outline</Button>
                                        <Button variant="ghost">Ghost</Button>
                                        <Button variant="destructive">Destructive</Button>
                                        <Button variant="link">Link</Button>
                                        <Button disabled>Disabled</Button>
                                        <IconButton icon={Heart} label="Save item" variant="outline" />
                                    </div>
                                </PreviewCard>

                                <PreviewCard title="Badges and status tones">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Default</Badge>
                                        <Badge variant="secondary">Secondary</Badge>
                                        <Badge variant="success">Success</Badge>
                                        <Badge variant="warning">Warning</Badge>
                                        <Badge variant="info">Info</Badge>
                                        <Badge variant="destructive">Danger</Badge>
                                        <StatusBadge domain="shipment" status="IN_TRANSIT" />
                                        <StatusBadge domain="support" status="RESOLVED" />
                                    </div>
                                </PreviewCard>

                                <PreviewCard title="Card composition">
                                    <Card size="sm" className="shadow-none">
                                        <CardHeader>
                                            <CardTitle>Compact product signal</CardTitle>
                                            <CardDescription>Card header, content, and footer slots.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex items-center justify-between gap-4">
                                            <span className="text-sm text-muted-foreground">Inventory</span>
                                            <span className="font-mono font-medium text-text-primary">24</span>
                                        </CardContent>
                                        <CardFooter className="justify-between">
                                            <Button size="sm" variant="outline">
                                                Details
                                            </Button>
                                            <Button size="sm">Add</Button>
                                        </CardFooter>
                                    </Card>
                                </PreviewCard>

                                <PreviewCard title="Pagination">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious href="#" />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#" isActive>
                                                    1
                                                </PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#">2</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext href="#" />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </PreviewCard>
                            </div>
                        </ShowcaseSection>

                        <ShowcaseSection id="forms" eyebrow="form controls" title="Inputs, selection, tabs, and OTP">
                            <div className="grid gap-4 xl:grid-cols-2">
                                <PreviewCard title="Form field states">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="validation-email">Email</FieldLabel>
                                            <Input id="validation-email" placeholder="customer@example.com" type="email" />
                                            <FieldDescription>Visible label and helper copy are rendered together.</FieldDescription>
                                        </Field>
                                        <Field data-invalid>
                                            <FieldLabel htmlFor="validation-code">Activation code</FieldLabel>
                                            <Input id="validation-code" aria-invalid defaultValue="12" />
                                            <FieldError>Code must contain 6 digits.</FieldError>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="validation-notes">Delivery notes</FieldLabel>
                                            <Textarea id="validation-notes" placeholder="Leave delivery instructions" />
                                        </Field>
                                    </FieldGroup>
                                </PreviewCard>

                                <PreviewCard title="Selection controls">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel>Country</FieldLabel>
                                            <Select defaultValue="de">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="de">Germany</SelectItem>
                                                        <SelectItem value="us">United States</SelectItem>
                                                        <SelectItem value="cn">China</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <FieldSet>
                                            <FieldLegend variant="label">Preferences</FieldLegend>
                                            <Field orientation="horizontal">
                                                <Checkbox id="validation-default-address" defaultChecked />
                                                <Label htmlFor="validation-default-address">Use as default address</Label>
                                            </Field>
                                            <RadioGroup defaultValue="express">
                                                <Field orientation="horizontal">
                                                    <RadioGroupItem id="shipping-standard" value="standard" />
                                                    <Label htmlFor="shipping-standard">Standard shipping</Label>
                                                </Field>
                                                <Field orientation="horizontal">
                                                    <RadioGroupItem id="shipping-express" value="express" />
                                                    <Label htmlFor="shipping-express">Express shipping</Label>
                                                </Field>
                                            </RadioGroup>
                                        </FieldSet>
                                    </FieldGroup>
                                </PreviewCard>

                                <PreviewCard title="Tabs">
                                    <Tabs defaultValue="profile">
                                        <TabsList>
                                            <TabsTrigger value="profile">Profile</TabsTrigger>
                                            <TabsTrigger value="orders">Orders</TabsTrigger>
                                            <TabsTrigger value="support">Support</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="profile">Profile content keeps the account editing surface compact.</TabsContent>
                                        <TabsContent value="orders">Order content uses the same tab foundation.</TabsContent>
                                        <TabsContent value="support">Support content reuses the interaction state.</TabsContent>
                                    </Tabs>
                                </PreviewCard>

                                <PreviewCard title="OTP input">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="validation-otp">One-time password</FieldLabel>
                                            <InputOTP id="validation-otp" maxLength={6}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </Field>
                                    </FieldGroup>
                                </PreviewCard>
                            </div>
                        </ShowcaseSection>

                        <ShowcaseSection id="overlays" eyebrow="interactive surfaces" title="Dialog and drawer">
                            <div className="grid gap-4 xl:grid-cols-2">
                                <PreviewCard title="Dialog">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <CreditCard data-icon="inline-start" />
                                                Open payment dialog
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Payment method</DialogTitle>
                                                <DialogDescription>Dialog includes a title, description, and keyboard dismissible close action.</DialogDescription>
                                            </DialogHeader>
                                            <div className="rounded-card border bg-muted p-3 text-sm">Visa ending in 4242</div>
                                            <DialogFooter showCloseButton>
                                                <DialogClose asChild>
                                                    <Button>Confirm</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </PreviewCard>

                                <PreviewCard title="Drawer">
                                    <Drawer>
                                        <DrawerTrigger asChild>
                                            <Button variant="outline">
                                                <Settings data-icon="inline-start" />
                                                Open drawer
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent>
                                            <DrawerHeader>
                                                <DrawerTitle>Filters</DrawerTitle>
                                                <DrawerDescription>Drawer has accessible title and description slots.</DrawerDescription>
                                            </DrawerHeader>
                                            <div className="grid gap-3 px-4">
                                                <Button variant="outline">Newest arrivals</Button>
                                                <Button variant="outline">Ready to ship</Button>
                                            </div>
                                            <DrawerFooter>
                                                <DrawerClose asChild>
                                                    <Button>Apply filters</Button>
                                                </DrawerClose>
                                                <DrawerClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DrawerClose>
                                            </DrawerFooter>
                                        </DrawerContent>
                                    </Drawer>
                                </PreviewCard>
                            </div>
                        </ShowcaseSection>

                        <ShowcaseSection id="shared" eyebrow="shared layout" title="Navbar, search, locale, sidebar, and footer">
                            <div className="grid gap-4">
                                <PreviewCard title="Global search and locale switcher">
                                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                                        <GlobalSearch placeholder="Search products, orders, or support" />
                                        <LocaleSwitcher
                                            options={[
                                                {value: "en-US", label: "English"},
                                                {value: "zh-CN", label: "中文"},
                                            ]}
                                        />
                                    </div>
                                </PreviewCard>

                                <Footer
                                    brand="Atelier Cart"
                                    description="A compact footer composition for brand, helper links, and secondary navigation."
                                    legal="© 2026 Atelier Cart"
                                    sections={[
                                        {
                                            title: "Shop",
                                            links: [
                                                {label: "New arrivals", href: "#"},
                                                {label: "Bestsellers", href: "#"},
                                            ],
                                        },
                                        {
                                            title: "Support",
                                            links: [
                                                {label: "Orders", href: "#"},
                                                {label: "Returns", href: "#"},
                                            ],
                                        },
                                    ]}
                                />
                            </div>
                        </ShowcaseSection>

                        <ShowcaseSection id="blocks" eyebrow="commerce blocks" title="Reusable product, checkout, order, auth, and support blocks">
                            <div className="grid gap-4 xl:grid-cols-2">
                                <ProductListItem
                                    image={{
                                        src: "/assets/figma/showcase/product-card.svg",
                                        alt: "Black shopping bag illustration",
                                        unoptimized: true,
                                    }}
                                    title="Structured wool tote"
                                    subtitle="Matte black · Medium"
                                    details={["SKU AC-2048", "Ships from Berlin"]}
                                    price="$248.00"
                                    quantity="Qty 1"
                                    status={<StatusBadge domain="shipment" status="IN_TRANSIT" />}
                                    actions={[
                                        {label: "Save", variant: "outline"},
                                        {label: "Remove", variant: "ghost"},
                                    ]}
                                />

                                <FinancialSummary
                                    lines={[
                                        {id: "subtotal", label: "Subtotal", value: "$248.00"},
                                        {id: "shipping", label: "Shipping", value: "$18.00"},
                                        {id: "discount", label: "Member discount", value: "-$20.00", tone: "success"},
                                    ]}
                                    total="$246.00"
                                    primaryAction={{label: "Checkout"}}
                                    secondaryAction={{label: "Continue shopping"}}
                                />

                                <AddressCard
                                    name="Mina Chen"
                                    phone="+49 30 1234 5678"
                                    lines={["Torstrasse 102", "10119 Berlin", "Germany"]}
                                    isDefault
                                    actions={[{label: "Edit"}, {label: "Use address"}]}
                                />

                                <ShipmentCard
                                    title="Express delivery"
                                    status={<StatusBadge domain="shipment" status="OUT_FOR_DELIVERY" />}
                                    carrier="DHL Express"
                                    trackingNumber="DHL-428915"
                                    estimate="Today, 16:00-18:00"
                                />

                                <OrderCard
                                    orderNumber="Order #AC-2026-0424"
                                    placedAt="April 24, 2026"
                                    status={<StatusBadge domain="order" status="FULFILLED" />}
                                    total="$428.00"
                                    meta={[
                                        {label: "Payment", value: <StatusBadge domain="pay" status="SUCCESS" />},
                                        {label: "Shipment", value: <StatusBadge domain="shipment" status="DELIVERED" />},
                                    ]}
                                    actions={[{label: "View order"}, {label: "Buy again", variant: "secondary"}]}
                                />

                                <AuthBlock
                                    title="Welcome back"
                                    description="Authentication block with field primitives and supporting actions."
                                    oauth={
                                        <Button variant="outline">
                                            <UserRound data-icon="inline-start" />
                                            Continue with account
                                        </Button>
                                    }
                                    footer="Need help signing in?"
                                >
                                    <Field>
                                        <FieldLabel htmlFor="auth-email">Email</FieldLabel>
                                        <Input id="auth-email" placeholder="customer@example.com" type="email" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="auth-password">Password</FieldLabel>
                                        <Input id="auth-password" placeholder="••••••••" type="password" />
                                    </Field>
                                    <Button>
                                        <ShoppingBag data-icon="inline-start" />
                                        Sign in
                                    </Button>
                                </AuthBlock>

                                <SupportThread
                                    title="Delivery support"
                                    status={<StatusBadge domain="support" status="IN_PROGRESS" />}
                                    messages={[
                                        {
                                            id: "m1",
                                            author: "Support",
                                            body: "We contacted the carrier and added a delivery note.",
                                            timestamp: "09:42",
                                            tone: "agent",
                                        },
                                        {
                                            id: "m2",
                                            author: "You",
                                            body: "Please leave the package with reception if I miss the delivery.",
                                            timestamp: "09:45",
                                            tone: "user",
                                        },
                                        {
                                            id: "m3",
                                            author: "System",
                                            body: "Tracking status changed to out for delivery.",
                                            timestamp: "10:12",
                                            tone: "system",
                                        },
                                    ]}
                                />

                                <PreviewCard title="Order history action">
                                    <div className="flex flex-wrap gap-3">
                                        <OrderHistoryButton />
                                        <Button variant="outline">
                                            <Search data-icon="inline-start" />
                                            Track package
                                        </Button>
                                    </div>
                                </PreviewCard>
                            </div>
                        </ShowcaseSection>
                    </div>
                </div>
            </div>
        </main>
    );
}
