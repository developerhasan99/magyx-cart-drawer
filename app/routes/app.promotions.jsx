import { Page, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Promotions() {
  return (
    <Page title="Promotions">
      <TitleBar title="Promotions" />
      <Card>
        <EmptyState
          heading="Cart promotions are coming soon"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          action={{ content: "Go to carts", url: "/app" }}
        >
          <p>
            Create promotion rules that apply automatically inside the cart
            drawer — free gifts, tiered discounts, and promo campaigns. In the
            meantime, customers can already apply coupon codes in the drawer:
            enable the coupon field in a cart&apos;s Discount section.
          </p>
        </EmptyState>
      </Card>
    </Page>
  );
}
