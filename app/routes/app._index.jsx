import { useCallback, useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Layout,
  Text,
  Card,
  Box,
  BlockStack,
  InlineStack,
  InlineGrid,
  Badge,
  Icon,
  Button,
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  EmptyState,
} from "@shopify/polaris";
import { AlertTriangleIcon, ExternalIcon } from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  deleteCartConfig,
  duplicateCartConfig,
  getCartConfigs,
  publishCartConfig,
  unpublishCartConfig,
} from "../models/cart-config.server";
import { getAppEmbedStatus } from "../models/theme.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const [configs, embedStatus] = await Promise.all([
    getCartConfigs(session.shop),
    getAppEmbedStatus(admin, session.shop),
  ]);
  return {
    carts: configs.map((config) => ({
      id: config.id,
      name: config.name,
      status: config.status,
      updatedAt: config.updatedAt,
    })),
    embedEnabled: embedStatus.enabled,
    themeEditorUrl: embedStatus.themeEditorUrl,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const ids = JSON.parse(String(formData.get("ids") ?? "[]"));

  if (intent === "delete") {
    for (const id of ids) await deleteCartConfig(session.shop, id);
  } else if (intent === "duplicate") {
    // Sequential on purpose — a handful of rows isn't worth write contention.
    for (const id of ids) await duplicateCartConfig(session.shop, id);
  } else if (intent === "publish") {
    // Only one cart can be live; publish is meaningful for a single id.
    if (ids.length === 1) await publishCartConfig(session.shop, ids[0]);
  } else if (intent === "unpublish") {
    for (const id of ids) await unpublishCartConfig(session.shop, id);
  }

  return { done: intent };
};

function AppEmbedNotice({ published, themeEditorUrl }) {
  return (
    <Box
      background="bg-surface-secondary"
      borderColor="border"
      borderWidth="025"
      borderStyle="dashed"
      borderRadius="300"
      padding="400"
    >
      <InlineStack align="space-between" blockAlign="center" gap="400">
        <InlineStack align="start" gap="400" blockAlign="center" wrap={false}>
          <Box
            background="bg-surface"
            borderColor="border"
            borderWidth="025"
            borderRadius="200"
            padding="300"
          >
            <Icon source={AlertTriangleIcon} tone="caution" />
          </Box>
          <BlockStack gap="100" inlineAlign="start">
            <InlineStack align="start" gap="200" blockAlign="center">
              <Text as="h3" variant="headingSm">
                {published > 0
                  ? "Your cart drawer isn't live"
                  : "No live carts configured"}
              </Text>
              <Badge tone="warning">App embed off</Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              Enable the Cart drawer app embed in your theme editor so your
              cart appears on your storefront.
            </Text>
          </BlockStack>
        </InlineStack>
        <Button url={themeEditorUrl} external icon={ExternalIcon}>
          Enable app embed
        </Button>
      </InlineStack>
    </Box>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="span" variant="bodyMd" tone="subdued">
          {label}
        </Text>
        <Text as="p" variant="headingLg">
          {value}
        </Text>
      </BlockStack>
    </Card>
  );
}

export default function Dashboard() {
  const { carts, embedEnabled, themeEditorUrl } = useLoaderData();
  const fetcher = useFetcher();
  const createFetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const total = carts.length;
  const published = carts.filter((c) => c.status === "PUBLISHED").length;
  const drafts = total - published;

  const [queryValue, setQueryValue] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode();

  const tabs = [
    { content: "All", id: "all" },
    { content: "Published", id: "published" },
    { content: "Drafts", id: "draft" },
  ].map((tab, index) => ({ ...tab, index, onAction: () => setSelectedTab(index) }));

  const filtered = carts.filter((cart) => {
    if (selectedTab === 1 && cart.status !== "PUBLISHED") return false;
    if (selectedTab === 2 && cart.status === "PUBLISHED") return false;
    if (
      queryValue &&
      !cart.name.toLowerCase().includes(queryValue.toLowerCase())
    )
      return false;
    return true;
  });

  const resourceState = useIndexResourceState(filtered);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    resourceState;

  const runBulk = useCallback(
    (intent) => {
      fetcher.submit(
        { intent, ids: JSON.stringify(selectedResources) },
        { method: "POST" },
      );
    },
    [fetcher, selectedResources],
  );

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.done) {
      resourceState.clearSelection();
      const messages = {
        publish: "Cart published",
        unpublish: "Cart unpublished",
        duplicate: "Carts duplicated as drafts",
        delete: "Carts deleted",
      };
      shopify.toast.show(messages[String(fetcher.data.done)] ?? "Done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  const promotedBulkActions = [
    ...(selectedResources.length === 1
      ? [{ content: "Publish", onAction: () => runBulk("publish") }]
      : []),
    { content: "Unpublish", onAction: () => runBulk("unpublish") },
    { content: "Duplicate", onAction: () => runBulk("duplicate") },
    {
      content: "Delete",
      destructive: true,
      onAction: () => runBulk("delete"),
    },
  ];

  const createCart = () =>
    createFetcher.submit(null, { method: "POST", action: "/app/carts/new" });

  return (
    <Page
      title="Magyx Cart Drawer"
      subtitle="Design cart drawers, publish the one your customers see, and switch versions any time."
      primaryAction={{
        content: "New cart",
        onAction: createCart,
        loading: createFetcher.state !== "idle",
      }}
    >
      <TitleBar title="Magyx Cart Drawer" />
      <BlockStack gap="500">
        {!embedEnabled && (
          <AppEmbedNotice published={published} themeEditorUrl={themeEditorUrl} />
        )}

        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          <StatCard label="Total carts" value={String(total)} />
          <StatCard label="Published" value={String(published)} />
          <StatCard label="Drafts" value={String(drafts)} />
        </InlineGrid>

        <Layout>
          <Layout.Section>
            <Card padding="0">
              {total === 0 ? (
                <EmptyState
                  heading="Create your first cart drawer"
                  action={{
                    content: "New cart",
                    onAction: createCart,
                    loading: createFetcher.state !== "idle",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Build multiple cart versions, then publish the one you want
                    your customers to see. Only one cart is live at a time.
                  </p>
                </EmptyState>
              ) : (
                <>
                  <IndexFilters
                    queryValue={queryValue}
                    queryPlaceholder="Search carts"
                    onQueryChange={setQueryValue}
                    onQueryClear={() => setQueryValue("")}
                    tabs={tabs}
                    selected={selectedTab}
                    onSelect={setSelectedTab}
                    filters={[]}
                    onClearAll={() => setQueryValue("")}
                    mode={mode}
                    setMode={setMode}
                    canCreateNewView={false}
                  />
                  <IndexTable
                    itemCount={filtered.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    promotedBulkActions={promotedBulkActions}
                    headings={[
                      { title: "Cart" },
                      { title: "Status" },
                      { title: "Last updated" },
                    ]}
                  >
                    {filtered.map((cart, index) => (
                      <IndexTable.Row
                        id={cart.id}
                        key={cart.id}
                        position={index}
                        selected={selectedResources.includes(cart.id)}
                        onClick={() => navigate(`/app/carts/${cart.id}`)}
                      >
                        <IndexTable.Cell>
                          <Text as="span" variant="bodyMd" fontWeight="semibold">
                            {cart.name || "Untitled cart"}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge
                            tone={
                              cart.status === "PUBLISHED" ? "success" : undefined
                            }
                          >
                            {cart.status === "PUBLISHED" ? "Published" : "Draft"}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          {new Date(cart.updatedAt).toLocaleDateString()}
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>
                </>
              )}
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  How it works
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  <strong>Create</strong> as many cart versions as you like —
                  each one keeps its own design, rewards, upsells, and
                  translations.
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  <strong>Publish</strong> the version you want live. Publishing
                  a cart automatically unpublishes the previous one, so exactly
                  one cart is ever shown to customers.
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  <strong>Preview</strong> any cart inside the editor before you
                  publish — no need to touch your live store.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
