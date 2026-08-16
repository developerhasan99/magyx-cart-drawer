import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { createCartConfig } from "../models/cart-config.server";

// "New cart" creates the draft immediately and lands the merchant in the
// editor, so a mid-edit reload reopens the same draft instead of losing
// everything on a stateless creation screen. Left unnamed so the editor
// prompts for a name; lists render an "Untitled cart" fallback.
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const config = await createCartConfig(session.shop);
  return redirect(`/app/carts/${config.id}`);
};

// A GET here (e.g. a bookmarked URL) has nothing to show.
export const loader = () => redirect("/app");
