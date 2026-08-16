import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function HelpSupport() {
  return (
    <Page title="Help & Support">
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Getting started
                </Text>
                <List type="number">
                  <List.Item>
                    Create a cart from the <strong>Carts</strong> page and
                    design it — every section updates the live preview.
                  </List.Item>
                  <List.Item>
                    Press <strong>Publish</strong> when you&apos;re happy.
                    Publishing a cart automatically unpublishes the previous
                    one, so exactly one version is ever live.
                  </List.Item>
                  <List.Item>
                    Enable the <strong>Cart drawer</strong> app embed in your
                    theme editor so the drawer appears on your storefront.
                    Optionally add the <strong>Cart icon</strong> block to your
                    header.
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Common questions
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    <strong>The drawer doesn&apos;t show on my store.</strong>
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Make sure a cart is published here, the app embed is
                    enabled in the theme editor, and the cart&apos;s Placement
                    section has &quot;Enable cart drawer site-wide&quot;
                    checked.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    <strong>My theme&apos;s own cart drawer still opens.</strong>
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Some themes bind their cart very aggressively. Try
                    disabling the theme&apos;s cart drawer in its own settings
                    (many themes have a &quot;cart type&quot; setting — set it
                    to &quot;page&quot;).
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Contact us
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Found a bug or need a hand setting things up? We usually reply
                within one business day.
              </Text>
              <div>
                <Button
                  url="mailto:developerhasan99@gmail.com"
                  external
                  variant="primary"
                >
                  Email support
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
