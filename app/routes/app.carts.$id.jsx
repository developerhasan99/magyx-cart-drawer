import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Card,
  BlockStack,
  Text,
  Badge,
  ActionList,
  Icon,
  Select,
  TextField,
} from "@shopify/polaris";
import {
  CartIcon,
  ConfettiIcon,
  DiscountCodeIcon,
  GiftCardIcon,
  LanguageTranslateIcon,
  LayoutSidebarRightIcon,
  MegaphoneIcon,
  MoneyIcon,
  PaintBrushFlatIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldCheckMarkIcon,
} from "@shopify/polaris-icons";
import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  deleteCartConfig,
  getCartConfig,
  parseSettings,
  publishCartConfig,
  unpublishCartConfig,
  updateCartConfig,
} from "../models/cart-config.server";
import {
  GeneralTab,
  DesignTab,
  AnnouncementsTab,
  RewardsTab,
  CartItemsTab,
  GiftWrapTab,
  ShippingProtectionTab,
  UpsellsTab,
  DiscountTab,
  SummaryTab,
  BadgesTab,
  TranslationsTab,
  SettingsTab,
} from "../components/cart-editor/sections";

const EXTENSION_ASSETS = path.join(
  // eslint-disable-next-line no-undef
  process.cwd(),
  "extensions",
  "magyx-cart-drawer",
  "assets",
);

/** A handful of real, active, in-stock products so the preview drawer shows
 * the merchant's own catalog instead of placeholder items. Best-effort: an
 * empty list just leaves the preview cart empty, never breaks the editor. */
async function fetchPreviewProducts(admin, excludeProductIds) {
  try {
    const response = await admin.graphql(
      `#graphql
      query MagyxPreviewProducts($first: Int!) {
        products(first: $first, query: "status:active", sortKey: UPDATED_AT, reverse: true) {
          nodes {
            id
            title
            featuredImage { url }
            variants(first: 1) {
              nodes {
                id
                title
                price
                compareAtPrice
                availableForSale
              }
            }
          }
        }
      }`,
      { variables: { first: 8 } },
    );
    const json = await response.json();
    const nodes = json?.data?.products?.nodes ?? [];

    return nodes
      .filter((product) => !excludeProductIds.has(product.id))
      .map((product) => {
        const variant = product.variants.nodes[0];
        if (!variant || !variant.availableForSale) return null;
        const price = Number(variant.price);
        const compareAtPrice = variant.compareAtPrice
          ? Number(variant.compareAtPrice)
          : null;
        return {
          id: product.id,
          title: product.title,
          variantTitle:
            variant.title && variant.title !== "Default Title"
              ? variant.title
              : "",
          image: product.featuredImage?.url || "",
          // Cents, to match the Storefront cart/product-recommendations
          // shape the drawer already renders.
          price: Math.round(price * 100),
          compareAtPrice:
            compareAtPrice && compareAtPrice > price
              ? Math.round(compareAtPrice * 100)
              : null,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Magyx Cart: failed to load preview products:", error);
    return [];
  }
}

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const config = await getCartConfig(session.shop, params.id);
  if (!config) throw new Response("Cart not found", { status: 404 });

  const settings = parseSettings(config);
  // Add-on products (gift wrap, shipping protection) are fees, not products
  // — never let the preview offer them up as an upsell.
  const excludeProductIds = new Set(
    [settings.gift_wrap_product_id, settings.shipping_protection_product_id].filter(
      Boolean,
    ),
  );

  // The preview iframe runs the real storefront drawer, so the editor ships
  // the extension's own CSS/JS inline — one source of truth, no copies.
  const [drawerCss, drawerJs, shippingProtectionIcon, previewProducts] = await Promise.all([
    readFile(path.join(EXTENSION_ASSETS, "magyx-cart-drawer.css"), "utf8"),
    readFile(path.join(EXTENSION_ASSETS, "magyx-cart-drawer.js"), "utf8"),
    readFile(path.join(EXTENSION_ASSETS, "shipping-protection.png")).then(
      (image) => `data:image/png;base64,${image.toString("base64")}`,
    ),
    fetchPreviewProducts(admin, excludeProductIds),
  ]);

  return {
    previewProducts,
    cart: {
      id: config.id,
      name: config.name,
      status: config.status,
      settings,
    },
    drawerCss,
    drawerJs,
    shippingProtectionIcon,
  };
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "resolve-trust-badge-file") {
    const fileId = String(formData.get("fileId") ?? "");
    if (!fileId) return { error: "Choose an image file first" };

    const response = await admin.graphql(
      `query TrustBadgeFile($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            image { url }
          }
          ... on GenericFile {
            url
            mimeType
          }
        }
      }`,
      { variables: { id: fileId } },
    );
    const result = await response.json();
    const file = result.data?.node;
    const url = file?.image?.url ?? file?.url;

    if (!url || (!file?.image && !String(file?.mimeType).startsWith("image/"))) {
      return {
        error: "Choose an image from Shopify Files",
      };
    }
    return { url };
  }

  if (intent === "save") {
    await updateCartConfig(session.shop, params.id, {
      name: String(formData.get("name") ?? ""),
      settings: JSON.parse(String(formData.get("settings") ?? "{}")),
    });
    // Status rides along with the same Save action — see CartEditor: a
    // single global Save button owns every pending change, publish state
    // included, rather than the sidebar's status control writing straight
    // to the database on its own.
    const status = String(formData.get("status") ?? "DRAFT");
    if (status === "PUBLISHED") {
      await publishCartConfig(session.shop, params.id);
    } else {
      await unpublishCartConfig(session.shop, params.id);
    }
    return { done: "save" };
  }
  if (intent === "delete") {
    await deleteCartConfig(session.shop, params.id);
    return redirect("/app");
  }
  return { done: null };
};

// Grouped the way the drawer itself is structured — top-level behavior,
// the scrollable body, then the footer — with Settings pinned on its own
// below a divider, mirroring the reference nav the user pointed to.
const EDITOR_NAV = [
  {
    title: "General",
    items: [
      { id: "general", label: "Placement", icon: LayoutSidebarRightIcon, Component: GeneralTab },
      { id: "design", label: "Design", icon: PaintBrushFlatIcon, Component: DesignTab },
    ],
  },
  {
    title: "Body",
    items: [
      { id: "announcements", label: "Announcements", icon: MegaphoneIcon, Component: AnnouncementsTab },
      { id: "rewards", label: "Tiered rewards", icon: ConfettiIcon, Component: RewardsTab },
      { id: "items", label: "Cart items", icon: CartIcon, Component: CartItemsTab },
      { id: "gift-wrap", label: "Gift wrap", icon: GiftCardIcon, Component: GiftWrapTab },
      { id: "upsells", label: "Upsells", icon: MoneyIcon, Component: UpsellsTab },
    ],
  },
  {
    title: "Footer",
    items: [
      { id: "shipping-protection", label: "Shipping protection", icon: ShieldCheckMarkIcon, Component: ShippingProtectionTab },
      { id: "discount", label: "Coupon form", icon: DiscountCodeIcon, Component: DiscountTab },
      { id: "summary", label: "Cart summary", icon: ReceiptIcon, Component: SummaryTab },
      { id: "badges", label: "Trust badges", icon: ShieldCheckMarkIcon, Component: BadgesTab },
    ],
  },
  {
    // No title: ActionList renders an untitled trailing section with a
    // divider above it instead of a heading — Translations + Settings sit
    // on their own, with Translations right before Settings.
    title: null,
    items: [
      { id: "translations", label: "Translations", icon: LanguageTranslateIcon, Component: TranslationsTab },
      { id: "settings", label: "Settings", icon: SettingsIcon, Component: SettingsTab },
    ],
  },
];

const EDITOR_SECTIONS = EDITOR_NAV.flatMap((group) => group.items);

/** The preview page is self-contained (srcDoc): extension CSS + JS inlined,
 * drawer element in preview mode. Settings arrive via postMessage so typing
 * in the editor updates the preview without reloading the frame. */
function buildPreviewDoc(drawerCss, drawerJs, shippingProtectionIcon) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${drawerCss}</style>
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #f6f6f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
</style>
</head>
<body>
<magyx-cart-drawer data-preview="true" data-shipping-protection-icon-src="${shippingProtectionIcon}"></magyx-cart-drawer>
<script>${drawerJs}</script>
</body>
</html>`;
}

export default function CartEditor() {
  const { cart, drawerCss, drawerJs, shippingProtectionIcon, previewProducts } = useLoaderData();
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const [name, setName] = useState(cart.name);
  const [settings, setSettings] = useState(cart.settings);
  const [status, setStatus] = useState(cart.status);
  const [activeSection, setActiveSection] = useState("general");
  const [previewOpen, setPreviewOpen] = useState(true);
  const iframeRef = useRef(null);

  // The last-saved baseline, used to detect unsaved changes. This is real
  // state (not a ref) on purpose: mutating a ref doesn't trigger a
  // re-render, so the SaveBar's `open` prop would keep showing the stale
  // pre-save value until something else happened to re-render the page.
  const [saved, setSaved] = useState({
    name: cart.name,
    settings: cart.settings,
    status: cart.status,
  });
  const isDirty =
    name !== saved.name ||
    status !== saved.status ||
    JSON.stringify(settings) !== JSON.stringify(saved.settings);
  const isSaving = fetcher.state !== "idle";

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    fetcher.submit(
      { intent: "save", name, status, settings: JSON.stringify(settings) },
      { method: "POST" },
    );
  }, [fetcher, name, status, settings]);

  const handleDiscard = useCallback(() => {
    setName(saved.name);
    setStatus(saved.status);
    setSettings(saved.settings);
  }, [saved]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.done === "save") {
      const statusChanged = status !== saved.status;
      setSaved({ name, settings, status });
      shopify.toast.show(
        statusChanged
          ? status === "PUBLISHED"
            ? "Cart published"
            : "Cart unpublished"
          : "Cart saved",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  // Live-sync current (unsaved) settings into the preview frame. Real
  // products ride along too — the drawer only applies them once (on the
  // first message) so later keystrokes don't reset quantities the merchant
  // changed while poking at the preview.
  const postSettings = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "magyx-preview:settings", settings, products: previewProducts },
      "*",
    );
  }, [settings, previewProducts]);

  useEffect(() => {
    if (previewOpen) postSettings();
  }, [settings, previewOpen, postSettings]);

  const previewDoc = useMemo(
    () => buildPreviewDoc(drawerCss, drawerJs, shippingProtectionIcon),
    [drawerCss, drawerJs, shippingProtectionIcon],
  );

  // The title badge reflects the last *saved* status, not the pending
  // dropdown selection — it only flips once Save actually persists it.
  const isPublished = saved.status === "PUBLISHED";

  const active = EDITOR_SECTIONS.find((s) => s.id === activeSection);
  const ActiveComponent = active?.Component ?? GeneralTab;

  // The drawer inside the iframe is fixed at right:0 with width 420px, so a
  // full-height 420px iframe shows the cart flush against every edge. The
  // page itself gets matching right padding — pushed aside, never overlaid.
  const PREVIEW_WIDTH = 420;

  return (
    <div
      style={{
        paddingRight: previewOpen ? `${PREVIEW_WIDTH}px` : 0,
        paddingBottom: "80px",
        transition: "padding-right 0.3s ease-in-out",
      }}
    >
    <Page
      backAction={{ content: "Carts", url: "/app" }}
      title={name || "Untitled cart"}
      titleMetadata={
        <Badge tone={isPublished ? "success" : undefined}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      }
      secondaryActions={[
        {
          content: previewOpen ? "Hide preview" : "Show preview",
          onAction: () => setPreviewOpen((open) => !open),
        },
        {
          content: "Delete",
          destructive: true,
          onAction: () => {
            deleteFetcher.submit({ intent: "delete" }, { method: "POST" });
            navigate("/app");
          },
        },
      ]}
      fullWidth
    >
      <TitleBar title={name || "Untitled cart"} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr)",
          gap: "var(--p-space-400)",
          alignItems: "start",
        }}
      >
        {/* Left column: publishing + section nav */}
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Publishing
              </Text>
              <Select
                label="Status"
                labelHidden
                options={[
                  { label: "Draft", value: "DRAFT" },
                  { label: "Published", value: "PUBLISHED" },
                ]}
                value={status}
                onChange={setStatus}
              />
              <Text as="p" variant="bodySm" tone="subdued">
                {status === "PUBLISHED"
                  ? "Goes live on your storefront when saved — unpublishes any other published cart."
                  : "Not visible on your storefront."}
              </Text>
            </BlockStack>
          </Card>

          <Card padding="200">
            <ActionList
              sections={EDITOR_NAV.map((group) => ({
                title: group.title ?? undefined,
                items: group.items.map((section) => ({
                  content: section.label,
                  prefix: <Icon source={section.icon} />,
                  active: section.id === activeSection,
                  onAction: () => setActiveSection(section.id),
                })),
              }))}
            />
          </Card>
        </BlockStack>

        {/* Main content: cart name + active section */}
        <BlockStack gap="400">
          <Card>
            <TextField
              label="Cart name"
              value={name}
              onChange={setName}
              autoComplete="off"
              placeholder="e.g. Holiday cart, Free shipping push"
              helpText="Only visible to you — used to tell your cart versions apart."
            />
          </Card>
          <Card>
            <ActiveComponent settings={settings} updateSetting={updateSetting} />
          </Card>
        </BlockStack>

      </div>

      {/* Preview: fixed to the viewport's right edge, full height, exactly
          as wide as the drawer panel so the cart fills it edge to edge. */}
      {previewOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: `${PREVIEW_WIDTH}px`,
            zIndex: 200,
          }}
        >
          <iframe
            ref={iframeRef}
            title="Cart drawer preview"
            srcDoc={previewDoc}
            sandbox="allow-scripts"
            onLoad={postSettings}
            style={{ border: "0", width: "100%", height: "100%", display: "block" }}
          />
        </div>
      )}

      <SaveBar id="cart-save-bar" open={isDirty || isSaving}>
        <button
          variant="primary"
          onClick={handleSave}
          loading={isSaving ? "" : undefined}
        >
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </SaveBar>
    </Page>
    </div>
  );
}
