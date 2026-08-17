import { data } from "react-router";
import {
  getPublishedCartConfig,
  parseSettings,
} from "../models/cart-config.server";
import { authenticate } from "../shopify.server";

// Storefront-facing (via the app proxy at /apps/cart-drawer-settings).
// Serves the one PUBLISHED cart config; `settings: null` tells the drawer
// to stay inert rather than fall back to defaults, so unpublishing all
// carts genuinely turns the drawer off.
export const loader = async ({ request }) => {
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return data({ error: "App is not installed for this shop" }, { status: 403 });
  }

  try {
    const config = await getPublishedCartConfig(session.shop);
    if (!config) return data({ settings: null });
    // configId gives future storefront analytics a stable key to report on.
    return data({ configId: config.id, settings: parseSettings(config) });
  } catch (error) {
    console.error("Magyx Cart: failed to fetch settings:", error);
    return data({ error: "Failed to fetch settings" }, { status: 500 });
  }
};
