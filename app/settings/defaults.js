// The full shape of one cart configuration's settings blob. Every key the
// storefront drawer reads exists here, so merging a saved blob over this
// object always yields a complete settings set. Keys are snake_case because
// the blob is served as-is to the storefront via the app proxy.
export const DEFAULT_SETTINGS = {
  // Placement
  enable_cart_drawer: true,
  auto_open_cart: true,
  show_floating_trigger: true,
  floating_position: "bottom-right",

  // Design
  inherit_fonts: true,
  bg_color: "#ffffff",
  accent_color: "#f6f6f7",
  text_color: "#000000",
  savings_text_color: "#2ea818",
  cart_icon_type: "bag-1",
  cart_icon_color: "#000000",
  cart_icon_size: 24,
  show_cart_count: true,
  cart_bubble_bg: "#000000",
  cart_bubble_text: "#ffffff",
  btn_radius: 12,
  btn_color: "#000000",
  btn_text_color: "#ffffff",
  btn_hover_color: "#333333",
  btn_hover_text_color: "#ffffff",

  // Announcements
  show_announcement: false,
  announcement_text: "Your products are reserved for {timer}!",
  announcement_bg: "#fffbeb",
  announcement_text_color: "#92400e",
  announcement_font_size: "13px",
  announcement_bar_size: "medium",
  timer_duration: 15,

  // Rewards
  enable_rewards_bar: true,
  show_rewards_on_empty: true,
  reward_type: "subtotal",
  reward_away_text: "You're only {amount} away from {goal}",
  reward_completed_text: "Congratulations! You have unlocked all rewards.",
  reward_goal_one_threshold: 50,
  reward_goal_one_label: "Free Shipping",
  reward_goal_one_icon: "truck",
  reward_goal_two_threshold: 100,
  reward_goal_two_label: "10% Discount",
  reward_goal_two_icon: "tag",
  rewards_bar_bg: "#e2e2e2",
  rewards_bar_fg: "#93d3ff",
  rewards_complete_icon_color: "#4d4949",
  rewards_incomplete_icon_color: "#4d4949",

  // Cart Items
  show_item_images: true,
  show_strikethrough: true,
  show_savings: true,

  // Gift wrap
  enable_gift_wrap: false,
  gift_wrap_label: "Wrap my order as a gift",
  // The real Shopify product/variant added to cart when checked — its own
  // price is what the customer is charged. Cached fields (title/image/price)
  // let the drawer show "+ $X" without a live lookup on every render.
  gift_wrap_product_id: "",
  gift_wrap_variant_id: "",
  gift_wrap_product_title: "",
  gift_wrap_product_image: "",
  gift_wrap_price: 0, // cents, matches formatMoney()

  // Upsells
  show_upsells: true,
  show_upsells_on_empty: true,
  upsell_title: "You might also like...",
  upsell_max: 3,
  upsell_intent: "related",
  upsell_btn_text: "Add to Cart",

  // Discount
  enable_coupon: true,

  // Summary
  // Static keeps the footer in the cart's scroll region. Merchants can opt
  // into Fixed when they want checkout controls visible at all times.
  footer_position: "static",
  enable_subtotal_line: true,
  enable_total_line: true,
  show_shipping_notice: true,
  shipping_notice_text: "Shipping and taxes will be calculated at checkout.",
  show_subtotal_on_checkout: true,

  // Badges & trust rows
  show_trust_badges: true,
  trust_badge_image: "",
  show_delivery_estimate: false,
  delivery_estimate_text: "Delivery in 1-3 business days",
  show_return_policy: false,
  return_policy_text: "Free returns within 30 days",
  show_reviews_trust: false,
  reviews_trust_text: "5,000+ 5-star reviews",

  // General
  cart_title: "Your Cart",
  custom_css: "",

  // Translations — every customer-facing string in one place, so a
  // per-locale layer can wrap this group later without touching the rest.
  trans_savings_prefix: "Save",
  trans_coupon_accordion_title: "Have a Coupon?",
  trans_coupon_placeholder: "Coupon code",
  trans_coupon_apply_btn: "Apply",
  trans_subtotal: "Subtotal",
  trans_discounts: "Discounts",
  trans_total: "Total",
  trans_checkout_btn: "Checkout",
  trans_continue_shopping: "Continue Shopping",
  trans_empty_cart: "Your cart is currently empty.",
};
