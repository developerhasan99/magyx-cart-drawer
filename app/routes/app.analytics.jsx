import { Page, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Analytics() {
  return (
    <Page title="Analytics">
      <TitleBar title="Analytics" />
      <Card>
        <EmptyState
          heading="Cart analytics are coming soon"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          action={{ content: "Go to carts", url: "/app" }}
        >
          <p>
            See how each cart version performs — drawer opens, add-to-cart
            events, upsell conversions, reward goals reached, and checkout
            click-through — so you can compare versions before deciding which
            one to keep published.
          </p>
        </EmptyState>
      </Card>
    </Page>
  );
}
