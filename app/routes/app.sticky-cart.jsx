import { Page, Card, BlockStack, Text, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function StickyCart() {
  return (
    <Page title="Sticky cart">
      <TitleBar title="Sticky cart" />
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Floating cart button
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              The sticky cart button keeps a floating cart icon visible in the
              corner of every page, so customers can open the drawer from
              anywhere. It&apos;s configured per cart version: open a cart and
              look under <strong>Placement</strong> for the floating button
              toggle and position, and under <strong>Design</strong> for its
              icon, colors, and count bubble.
            </Text>
            <div>
              <Button url="/app" variant="primary">
                Go to carts
              </Button>
            </div>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              More sticky options coming soon
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Corner offsets, mobile-only visibility, and a sticky
              add-to-cart bar are on the roadmap.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
