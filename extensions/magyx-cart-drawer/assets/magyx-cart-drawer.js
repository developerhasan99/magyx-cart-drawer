(function () {
  "use strict";

  const CART_UPDATED_EVENT = "magyx-cart:cart-updated";
  const OPEN_CART_EVENT = "open-magyx-cart";
  const EXTERNAL_MUTATION_EVENT = "magyx-cart:external-mutation";
  const INTERNAL_FETCH_FLAG = "X-Magyx-Cart-Internal";

  const DEFAULTS = {
    enableCartDrawer: true,
    autoOpenCart: true,
    showFloatingTrigger: true,
    floatingPosition: "bottom-right",
    inheritFonts: true,
    cartTitle: "Your Cart",
    showCartCount: true,
    cartIconType: "bag-1",
    cartIconColor: "#000000",
    cartIconSize: 24,
    cartBubbleBg: "#000000",
    cartBubbleText: "#ffffff",
    bgColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#f6f6f7",
    btnColor: "#000000",
    btnTextColor: "#ffffff",
    btnHoverColor: "#333333",
    btnHoverTextColor: "#ffffff",
    btnRadius: 5,
    showAnnouncement: false,
    announcementText: "Your products are reserved for {timer}!",
    announcementBg: "#fffbeb",
    announcementTextColor: "#92400e",
    announcementSize: "medium",
    timerDuration: 15,
    enableRewardsBar: true,
    showRewardsOnEmpty: true,
    rewardType: "subtotal",
    rewardAwayText: "You're only {amount} away from {goal}",
    rewardCompletedText: "Congratulations! You have unlocked all rewards.",
    rewardGoalOneThreshold: 50,
    rewardGoalOneLabel: "Free Shipping",
    rewardGoalOneIcon: "truck",
    rewardGoalTwoThreshold: 100,
    rewardGoalTwoLabel: "10% Discount",
    rewardGoalTwoIcon: "tag",
    rewardsBarBg: "#e2e2e2",
    rewardsBarFg: "#93d3ff",
    rewardsCompleteIconColor: "#4d4949",
    rewardsIncompleteIconColor: "#4d4949",
    showItemImages: true,
    showStrikethrough: true,
    showSavings: true,
    savingsTextColor: "#2ea818",
    savingsPrefix: "Save",
    enableCoupon: true,
    footerPosition: "static",
    enableSubtotalLine: true,
    enableTotalLine: true,
    showShippingNotice: true,
    showSubtotalOnCheckout: true,
    enableGiftWrap: false,
    giftWrapLabel: "Wrap my order as a gift",
    giftWrapProductId: "",
    giftWrapVariantId: "",
    giftWrapProductTitle: "",
    giftWrapProductImage: "",
    giftWrapPrice: 0,
    showUpsells: true,
    showUpsellsOnEmpty: true,
    upsellTitle: "You might also like...",
    upsellMax: 3,
    upsellIntent: "related",
    upsellBtnText: "Add to Cart",
    showTrustBadges: true,
    trustBadgeUrl: "",
    showDeliveryEstimate: false,
    deliveryEstimateText: "Delivery in 1-3 business days",
    showReturnPolicy: false,
    returnPolicyText: "Free returns within 30 days",
    showReviewsTrust: false,
    reviewsTrustText: "5,000+ 5-star reviews",
    customCss: "",
    transCheckoutBtn: "Checkout",
    transContinueShopping: "Continue Shopping",
    transEmptyCart: "Your cart is currently empty.",
    transSubtotal: "Subtotal",
    transTotal: "Total",
    transDiscounts: "Discounts",
    transCouponAccordionTitle: "Have a Coupon?",
    transCouponPlaceholder: "Coupon code",
    transCouponApplyBtn: "Apply",
    shippingNoticeText: "Shipping and taxes will be calculated at checkout.",
  };

  function asBoolean(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    return value === true || value === "true" || value === "1";
  }

  function asNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function asText(value, fallback) {
    return value === undefined || value === null || value === ""
      ? fallback
      : value;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("//")) return `${window.location.protocol}${url}`;
    return url;
  }

  function humanizePropertyName(name) {
    return String(name).replace(/^_+/, "").replace(/[_-]+/g, " ");
  }

  function iconSvg(name, className = "") {
    const iconClass = escapeHtml(className);
    const icons = {
      truck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="${iconClass}"><path d="M4.75 4.5a.75.75 0 0 0 0 1.5h3.25a1 1 0 0 1 0 2h-4.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 0 0 1.5h.458a2.5 2.5 0 1 0 4.78.75h3.024a2.5 2.5 0 1 0 4.955-.153 1.75 1.75 0 0 0 1.033-1.597v-1.22a1.75 1.75 0 0 0-1.326-1.697l-1.682-.42a.25.25 0 0 1-.18-.174l-.426-1.494a2.75 2.75 0 0 0-2.645-1.995h-6.991Zm2.75 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill-rule="evenodd"></path></svg>`,
      tag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="${iconClass}"><path d="M8.575 4.649a3.75 3.75 0 0 1 2.7-1.149h1.975a3.25 3.25 0 0 1 3.25 3.25v2.187a3.25 3.25 0 0 1-.996 2.34l-4.747 4.572a2.5 2.5 0 0 1-3.502-.033l-2.898-2.898a2.75 2.75 0 0 1-.036-3.852l4.254-4.417Zm4.425 3.351a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill-rule="evenodd"></path></svg>`,
      gift: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="${iconClass}"><path d="M7.835 9.5h-.96c-.343 0-.625-.28-.625-.628 0-.344.28-.622.619-.622.242 0 .463.142.563.363l.403.887Z"></path><path d="M10.665 9.5h.96c.343 0 .625-.28.625-.628 0-.344-.28-.622-.619-.622-.242 0-.463.142-.563.363l-.403.887Z"></path><path fill-rule="evenodd" d="M8.5 4h-3.25c-1.519 0-2.75 1.231-2.75 2.75v2.25h1.25c.414 0 .75.336.75.75s-.336.75-.75.75h-1.25v2.75c0 1.519 1.231 2.75 2.75 2.75h3.441c-.119-.133-.191-.308-.191-.5v-2c0-.414.336-.75.75-.75s.75.336.75.75v2c0 .192-.072.367-.191.5h4.941c1.519 0 2.75-1.231 2.75-2.75v-2.75h-2.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.75v-2.25c0-1.519-1.231-2.75-2.75-2.75h-4.75v2.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-2.25Z"></path></svg>`,
      star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
      return: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`,
      image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
      close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-.5.2-1 .6-1h6c.4 0 .6.5.6 1v2"></path></svg>`,
      cart: `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path></svg>`,
      basket: `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18l-2 9H5l-2-9Zm6-5h6l3 5H6l3-5Z"></path></svg>`,
      "bag-2": `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"></path><circle cx="12" cy="14" r="2" stroke-width="2"></circle></svg>`,
      "bag-1": `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"></path></svg>`,
    };

    return icons[name] || icons["bag-1"];
  }

  const CART_MUTATION_PATTERN = /\/cart\/(add|change|update|clear)(\.js)?/;

  /**
   * Many themes add to cart over fetch/XHR without submitting a form, which
   * the drawer can't see through DOM events. Patching fetch + XHR once lets
   * the drawer refresh (and auto-open on adds) no matter how the theme talks
   * to the cart. The drawer marks its own requests so they don't loop back.
   */
  function installCartWatcher() {
    if (window.__magyxCartWatcherInstalled) return;
    window.__magyxCartWatcherInstalled = true;

    const announce = (url) => {
      const match = String(url).match(CART_MUTATION_PATTERN);
      if (!match) return;
      window.dispatchEvent(
        new CustomEvent(EXTERNAL_MUTATION_EVENT, {
          detail: { action: match[1] },
        }),
      );
    };

    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      const url =
        typeof input === "string" ? input : input?.url ? input.url : "";
      const headers = init?.headers;
      const isInternal =
        headers &&
        (headers[INTERNAL_FETCH_FLAG] ||
          (typeof headers.get === "function" &&
            headers.get(INTERNAL_FETCH_FLAG)));
      const result = originalFetch.apply(this, arguments);
      if (!isInternal && CART_MUTATION_PATTERN.test(String(url))) {
        result.then((response) => {
          if (response.ok) announce(url);
        }, () => {});
      }
      return result;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__magyxCartUrl = url;
      return originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      if (CART_MUTATION_PATTERN.test(String(this.__magyxCartUrl || ""))) {
        this.addEventListener("load", () => {
          if (this.status >= 200 && this.status < 300) {
            announce(this.__magyxCartUrl);
          }
        });
      }
      return originalSend.apply(this, arguments);
    };
  }

  // The admin preview shows the merchant's own catalog rather than fake
  // items — the editor loads a handful of real, active products and posts
  // them in once (see handlePreviewMessage). A product with a compare-at
  // price gets a synthetic "SALE" tag so the discount styling still has
  // something real to demonstrate.
  function previewCartItem(product, quantity) {
    const original = product.compareAtPrice || product.price;
    return {
      key: `preview-${product.id}`,
      product_id: product.id,
      quantity,
      product_title: product.title,
      variant_title: product.variantTitle || "",
      url: "#",
      image: product.image,
      original_price: original,
      final_price: product.price,
      line_level_discount_allocations: product.compareAtPrice
        ? [{ discount_application: { title: "SALE" } }]
        : [],
      properties: {},
    };
  }

  function buildPreviewCart(products) {
    const items = products.map((product, index) =>
      previewCartItem(product, index === 0 ? 1 : 2),
    );
    return recalculatePreviewCart({ items, currency: "USD" });
  }

  function recalculatePreviewCart(cart) {
    const items = cart.items;
    items.forEach((item) => {
      item.original_line_price = item.original_price * item.quantity;
      item.final_line_price = item.final_price * item.quantity;
    });
    const subtotal = items.reduce((sum, i) => sum + i.original_line_price, 0);
    const total = items.reduce((sum, i) => sum + i.final_line_price, 0);
    return {
      ...cart,
      items,
      item_count: items.reduce((sum, i) => sum + i.quantity, 0),
      items_subtotal_price: subtotal,
      original_total_price: subtotal,
      total_price: total,
      total_discount: subtotal - total,
      cart_level_discount_applications: [],
    };
  }

  /** A fetched preview product, in the shape renderUpsell() expects. Reuses
   * the product id as the variant id — the editor only fetches one variant
   * per product, so there's nothing to disambiguate. */
  function previewRecommendation(product) {
    return {
      id: product.id,
      title: product.title,
      url: "#",
      featured_image: product.image,
      price: product.price,
      compare_at_price: product.compareAtPrice,
      variants: [
        {
          id: product.id,
          title: product.variantTitle || "Default",
          available: true,
          price: product.price,
        },
      ],
    };
  }

  class MagyxCartDrawer extends HTMLElement {
    constructor() {
      super();
      this.cart = null;
      this.count = 0;
      this.error = "";
      this.isOpen = false;
      this.isLoading = false;
      this.couponOpen = false;
      this.timerCount = 0;
      this.timerInterval = null;
      this.recommendations = [];
      this.recommendationsSignature = "";
      this.previousBodyOverflow = "";
      this.settings = { ...DEFAULTS };
      this.isPreview = false;
      this.previewProducts = [];
      this.previewProductsApplied = false;
      this.inert = false;
      // Serializes cart mutations so rapid clicks apply in order instead of
      // racing each other, and lets refreshes ignore stale responses.
      this.mutationChain = Promise.resolve();
      this.refreshSequence = 0;

      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleCartSubmit = this.handleCartSubmit.bind(this);
      this.handleOpenEvent = this.handleOpenEvent.bind(this);
      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.handleExternalMutation = this.handleExternalMutation.bind(this);
      this.handlePreviewMessage = this.handlePreviewMessage.bind(this);
    }

    async connectedCallback() {
      const data = this.dataset;
      this.shopDomain = asText(data.shopDomain, "");
      this.blockId = asText(data.blockId, "");
      this.currentProductId = asText(data.currentProductId, "");
      this.isPreview = this.getAttribute("data-preview") === "true";

      if (this.isPreview) {
        // Real products arrive shortly via postMessage (handlePreviewMessage)
        // once the editor's settings effect fires; render an empty cart
        // until then rather than flashing placeholder products.
        this.cart = { item_count: 0, items: [], currency: "USD" };
        this.count = 0;
        this.timerCount = Math.max(1, this.settings.timerDuration) * 60;
        window.addEventListener("message", this.handlePreviewMessage);
        this.addEventListener("click", this.handleClick);
        this.addEventListener("change", this.handleChange);
        this.renderShell();
        this.openCart();
        return;
      }

      await this.fetchSettings();

      // No published cart, or the drawer disabled site-wide: stay inert so
      // the theme's own cart keeps working untouched.
      if (this.inert || !this.settings.enableCartDrawer) {
        this.inert = true;
        return;
      }

      this.timerCount = Math.max(1, this.settings.timerDuration) * 60;
      this.renderShell();

      this.addEventListener("click", this.handleClick);
      this.addEventListener("change", this.handleChange);
      document.addEventListener("keydown", this.handleKeydown);
      document.addEventListener("submit", this.handleCartSubmit, true);
      document.addEventListener("click", this.handleDocumentClick, true);
      window.addEventListener(OPEN_CART_EVENT, this.handleOpenEvent);
      window.addEventListener(
        EXTERNAL_MUTATION_EVENT,
        this.handleExternalMutation,
      );

      document.body.classList.add("magyx-cart-intercepting");
      installCartWatcher();
      this.refreshCart();
    }

    disconnectedCallback() {
      this.removeEventListener("click", this.handleClick);
      this.removeEventListener("change", this.handleChange);
      document.removeEventListener("keydown", this.handleKeydown);
      document.removeEventListener("submit", this.handleCartSubmit, true);
      document.removeEventListener("click", this.handleDocumentClick, true);
      window.removeEventListener(OPEN_CART_EVENT, this.handleOpenEvent);
      window.removeEventListener(
        EXTERNAL_MUTATION_EVENT,
        this.handleExternalMutation,
      );
      window.removeEventListener("message", this.handlePreviewMessage);
      document.body.classList.remove("magyx-cart-intercepting");
      this.stopTimer();
      if (this.isOpen) document.body.style.overflow = this.previousBodyOverflow;
    }

    async fetchSettings() {
      if (!this.shopDomain) {
        console.warn("Magyx Cart: Missing shop domain, staying inactive");
        this.inert = true;
        return;
      }

      try {
        const response = await fetch(
          `/apps/cart-drawer-settings?shop=${encodeURIComponent(this.shopDomain)}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }
        const data = await response.json();
        if (data.settings) {
          this.configId = data.configId || "";
          this.settings = this.mapApiSettings(data.settings);
        } else {
          // Nothing published — the drawer must not appear at all.
          this.inert = true;
        }
      } catch (error) {
        console.warn("Magyx Cart: Failed to fetch settings", error);
        this.inert = true;
      }
    }

    mapApiSettings(apiSettings) {
      return {
        blockId: this.blockId,
        currentProductId: this.currentProductId,
        enableCartDrawer: asBoolean(
          apiSettings.enable_cart_drawer,
          DEFAULTS.enableCartDrawer,
        ),
        autoOpenCart: asBoolean(
          apiSettings.auto_open_cart,
          DEFAULTS.autoOpenCart,
        ),
        showFloatingTrigger: asBoolean(
          apiSettings.show_floating_trigger,
          DEFAULTS.showFloatingTrigger,
        ),
        floatingPosition: asText(
          apiSettings.floating_position,
          DEFAULTS.floatingPosition,
        ),
        inheritFonts: asBoolean(
          apiSettings.inherit_fonts,
          DEFAULTS.inheritFonts,
        ),
        cartTitle: asText(apiSettings.cart_title, DEFAULTS.cartTitle),
        showCartCount: asBoolean(
          apiSettings.show_cart_count,
          DEFAULTS.showCartCount,
        ),
        cartIconType: asText(apiSettings.cart_icon_type, DEFAULTS.cartIconType),
        cartIconColor: asText(
          apiSettings.cart_icon_color,
          DEFAULTS.cartIconColor,
        ),
        cartIconSize: asNumber(
          apiSettings.cart_icon_size,
          DEFAULTS.cartIconSize,
        ),
        cartBubbleBg: asText(apiSettings.cart_bubble_bg, DEFAULTS.cartBubbleBg),
        cartBubbleText: asText(
          apiSettings.cart_bubble_text,
          DEFAULTS.cartBubbleText,
        ),
        bgColor: asText(apiSettings.bg_color, DEFAULTS.bgColor),
        textColor: asText(apiSettings.text_color, DEFAULTS.textColor),
        accentColor: asText(apiSettings.accent_color, DEFAULTS.accentColor),
        btnColor: asText(apiSettings.btn_color, DEFAULTS.btnColor),
        btnTextColor: asText(apiSettings.btn_text_color, DEFAULTS.btnTextColor),
        btnHoverColor: asText(
          apiSettings.btn_hover_color,
          DEFAULTS.btnHoverColor,
        ),
        btnHoverTextColor: asText(
          apiSettings.btn_hover_text_color,
          DEFAULTS.btnHoverTextColor,
        ),
        btnRadius: asNumber(apiSettings.btn_radius, DEFAULTS.btnRadius),
        showAnnouncement: asBoolean(
          apiSettings.show_announcement,
          DEFAULTS.showAnnouncement,
        ),
        announcementText: asText(
          apiSettings.announcement_text,
          DEFAULTS.announcementText,
        ),
        announcementBg: asText(
          apiSettings.announcement_bg,
          DEFAULTS.announcementBg,
        ),
        announcementTextColor: asText(
          apiSettings.announcement_text_color,
          DEFAULTS.announcementTextColor,
        ),
        announcementSize: asText(
          apiSettings.announcement_bar_size,
          DEFAULTS.announcementSize,
        ),
        timerDuration: asNumber(
          apiSettings.timer_duration,
          DEFAULTS.timerDuration,
        ),
        enableRewardsBar: asBoolean(
          apiSettings.enable_rewards_bar,
          DEFAULTS.enableRewardsBar,
        ),
        showRewardsOnEmpty: asBoolean(
          apiSettings.show_rewards_on_empty,
          DEFAULTS.showRewardsOnEmpty,
        ),
        rewardType: asText(apiSettings.reward_type, DEFAULTS.rewardType),
        rewardAwayText: asText(
          apiSettings.reward_away_text,
          DEFAULTS.rewardAwayText,
        ),
        rewardCompletedText: asText(
          apiSettings.reward_completed_text,
          DEFAULTS.rewardCompletedText,
        ),
        rewardGoalOneThreshold: asNumber(
          apiSettings.reward_goal_one_threshold,
          DEFAULTS.rewardGoalOneThreshold,
        ),
        rewardGoalOneLabel: asText(
          apiSettings.reward_goal_one_label,
          DEFAULTS.rewardGoalOneLabel,
        ),
        rewardGoalOneIcon: asText(
          apiSettings.reward_goal_one_icon,
          DEFAULTS.rewardGoalOneIcon,
        ),
        rewardGoalTwoThreshold: asNumber(
          apiSettings.reward_goal_two_threshold,
          DEFAULTS.rewardGoalTwoThreshold,
        ),
        rewardGoalTwoLabel: asText(
          apiSettings.reward_goal_two_label,
          DEFAULTS.rewardGoalTwoLabel,
        ),
        rewardGoalTwoIcon: asText(
          apiSettings.reward_goal_two_icon,
          DEFAULTS.rewardGoalTwoIcon,
        ),
        rewardsBarBg: asText(apiSettings.rewards_bar_bg, DEFAULTS.rewardsBarBg),
        rewardsBarFg: asText(apiSettings.rewards_bar_fg, DEFAULTS.rewardsBarFg),
        rewardsCompleteIconColor: asText(
          apiSettings.rewards_complete_icon_color,
          DEFAULTS.rewardsCompleteIconColor,
        ),
        rewardsIncompleteIconColor: asText(
          apiSettings.rewards_incomplete_icon_color,
          DEFAULTS.rewardsIncompleteIconColor,
        ),
        showItemImages: asBoolean(
          apiSettings.show_item_images,
          DEFAULTS.showItemImages,
        ),
        showStrikethrough: asBoolean(
          apiSettings.show_strikethrough,
          DEFAULTS.showStrikethrough,
        ),
        showSavings: asBoolean(apiSettings.show_savings, DEFAULTS.showSavings),
        savingsTextColor: asText(
          apiSettings.savings_text_color,
          DEFAULTS.savingsTextColor,
        ),
        savingsPrefix: asText(
          apiSettings.trans_savings_prefix,
          DEFAULTS.savingsPrefix,
        ),
        enableCoupon: asBoolean(
          apiSettings.enable_coupon,
          DEFAULTS.enableCoupon,
        ),
        footerPosition: asText(
          apiSettings.footer_position,
          DEFAULTS.footerPosition,
        ),
        enableSubtotalLine: asBoolean(
          apiSettings.enable_subtotal_line,
          DEFAULTS.enableSubtotalLine,
        ),
        enableTotalLine: asBoolean(
          apiSettings.enable_total_line,
          DEFAULTS.enableTotalLine,
        ),
        showShippingNotice: asBoolean(
          apiSettings.show_shipping_notice,
          DEFAULTS.showShippingNotice,
        ),
        showSubtotalOnCheckout: asBoolean(
          apiSettings.show_subtotal_on_checkout,
          DEFAULTS.showSubtotalOnCheckout,
        ),
        enableGiftWrap: asBoolean(
          apiSettings.enable_gift_wrap,
          DEFAULTS.enableGiftWrap,
        ),
        giftWrapLabel: asText(
          apiSettings.gift_wrap_label,
          DEFAULTS.giftWrapLabel,
        ),
        giftWrapProductId: asText(
          apiSettings.gift_wrap_product_id,
          DEFAULTS.giftWrapProductId,
        ),
        giftWrapVariantId: asText(
          apiSettings.gift_wrap_variant_id,
          DEFAULTS.giftWrapVariantId,
        ),
        giftWrapProductTitle: asText(
          apiSettings.gift_wrap_product_title,
          DEFAULTS.giftWrapProductTitle,
        ),
        giftWrapProductImage: asText(
          apiSettings.gift_wrap_product_image,
          DEFAULTS.giftWrapProductImage,
        ),
        giftWrapPrice: asNumber(
          apiSettings.gift_wrap_price,
          DEFAULTS.giftWrapPrice,
        ),
        showUpsells: asBoolean(apiSettings.show_upsells, DEFAULTS.showUpsells),
        showUpsellsOnEmpty: asBoolean(
          apiSettings.show_upsells_on_empty,
          DEFAULTS.showUpsellsOnEmpty,
        ),
        upsellTitle: asText(apiSettings.upsell_title, DEFAULTS.upsellTitle),
        upsellMax: Math.min(
          10,
          Math.max(1, asNumber(apiSettings.upsell_max, DEFAULTS.upsellMax)),
        ),
        upsellIntent: asText(apiSettings.upsell_intent, DEFAULTS.upsellIntent),
        upsellBtnText: asText(
          apiSettings.upsell_btn_text,
          DEFAULTS.upsellBtnText,
        ),
        showTrustBadges: asBoolean(
          apiSettings.show_trust_badges,
          DEFAULTS.showTrustBadges,
        ),
        trustBadgeUrl: asText(
          apiSettings.trust_badge_image,
          DEFAULTS.trustBadgeUrl,
        ),
        showDeliveryEstimate: asBoolean(
          apiSettings.show_delivery_estimate,
          DEFAULTS.showDeliveryEstimate,
        ),
        deliveryEstimateText: asText(
          apiSettings.delivery_estimate_text,
          DEFAULTS.deliveryEstimateText,
        ),
        showReturnPolicy: asBoolean(
          apiSettings.show_return_policy,
          DEFAULTS.showReturnPolicy,
        ),
        returnPolicyText: asText(
          apiSettings.return_policy_text,
          DEFAULTS.returnPolicyText,
        ),
        showReviewsTrust: asBoolean(
          apiSettings.show_reviews_trust,
          DEFAULTS.showReviewsTrust,
        ),
        reviewsTrustText: asText(
          apiSettings.reviews_trust_text,
          DEFAULTS.reviewsTrustText,
        ),
        customCss: asText(apiSettings.custom_css, DEFAULTS.customCss),
        transCheckoutBtn: asText(
          apiSettings.trans_checkout_btn,
          DEFAULTS.transCheckoutBtn,
        ),
        transContinueShopping: asText(
          apiSettings.trans_continue_shopping,
          DEFAULTS.transContinueShopping,
        ),
        transEmptyCart: asText(
          apiSettings.trans_empty_cart,
          DEFAULTS.transEmptyCart,
        ),
        transSubtotal: asText(
          apiSettings.trans_subtotal,
          DEFAULTS.transSubtotal,
        ),
        transTotal: asText(apiSettings.trans_total, DEFAULTS.transTotal),
        transDiscounts: asText(
          apiSettings.trans_discounts,
          DEFAULTS.transDiscounts,
        ),
        transCouponAccordionTitle: asText(
          apiSettings.trans_coupon_accordion_title,
          DEFAULTS.transCouponAccordionTitle,
        ),
        transCouponPlaceholder: asText(
          apiSettings.trans_coupon_placeholder,
          DEFAULTS.transCouponPlaceholder,
        ),
        transCouponApplyBtn: asText(
          apiSettings.trans_coupon_apply_btn,
          DEFAULTS.transCouponApplyBtn,
        ),
        shippingNoticeText: asText(
          apiSettings.shipping_notice_text,
          DEFAULTS.shippingNoticeText,
        ),
      };
    }

    // ------------------------------------------------------------------
    // Theme cart interception (event delegation — nothing is attached to
    // theme elements, so dynamically added ones are covered automatically)
    // ------------------------------------------------------------------

    handleDocumentClick(event) {
      const selector = [
        'a[href*="/cart"]',
        "button[data-cart-toggle]",
        ".cart-icon",
        ".cart-link",
        ".mini-cart-trigger",
        "#cart-icon-bubble",
        '[aria-label="Cart"]',
        ".header__cart",
        ".site-header-cart",
        ".cart-drawer-trigger",
        "[data-cart-drawer-toggle]",
      ].join(",");

      const control = event.target.closest?.(selector);
      if (!control) return;
      // Never hijack our own UI or another magyx trigger.
      if (this.contains(control) || control.closest("magyx-cart-trigger"))
        return;

      // For plain links, only a real "view cart" URL opens the drawer.
      // Links that merely contain "cart" (/products/cart-charm), mutate the
      // cart (/cart/add), or go to checkout must keep working untouched.
      const href = control.getAttribute?.("href");
      if (href) {
        let pathname = "";
        try {
          pathname = new URL(href, window.location.origin).pathname;
        } catch (_error) {
          return;
        }
        const isCartPage = /(^|\/)cart\/?$/.test(pathname);
        const isMutation = /\/cart\/(add|change|update|clear)/.test(pathname);
        const isCheckout = /\/checkout/.test(pathname);
        if (!isCartPage || isMutation || isCheckout) return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.openCart(true);
    }

    handleExternalMutation(event) {
      const action = event.detail?.action;
      const chain = this.refreshCart();
      if (action === "add" && this.settings.autoOpenCart) {
        chain.then(() => this.openCart());
      }
    }

    // ------------------------------------------------------------------
    // Network
    // ------------------------------------------------------------------

    route(path) {
      const root = window.Shopify?.routes?.root || "/";
      const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
      return `${normalizedRoot}${String(path).replace(/^\//, "")}`;
    }

    async fetchJson(path, options = {}) {
      const headers = {
        Accept: "application/json",
        [INTERNAL_FETCH_FLAG]: "1",
        ...(options.headers || {}),
      };

      const response = await fetch(this.route(path), {
        credentials: "same-origin",
        ...options,
        headers,
      });

      if (!response.ok) {
        let message = "Cart request failed.";
        try {
          const json = await response.json();
          message = json.description || json.message || message;
        } catch (_error) {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      return response.json();
    }

    async postJson(path, payload) {
      return this.fetchJson(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    /** Queues a cart mutation so operations run one at a time in click
     * order. Each operation gets the freshest cart state when it runs. */
    enqueueMutation(operation) {
      const run = async () => {
        this.setLoading(true);
        try {
          await operation();
        } catch (error) {
          this.setError(error.message);
        } finally {
          this.setLoading(false);
        }
      };
      this.mutationChain = this.mutationChain.then(run, run);
      return this.mutationChain;
    }

    async refreshCart({ loading = false } = {}) {
      if (this.isPreview) return;
      if (loading) this.setLoading(true);
      const sequence = ++this.refreshSequence;
      try {
        const cart = await this.fetchJson("cart.js");
        // A newer refresh finished first — this response is stale.
        if (sequence !== this.refreshSequence) return;
        this.receiveCart(cart);
      } catch (error) {
        if (sequence === this.refreshSequence) this.setError(error.message);
      } finally {
        if (loading) this.setLoading(false);
      }
    }

    receiveCart(cart) {
      this.cart = cart;
      this.count = Number(cart?.item_count || 0);
      this.error = "";
      this.updateContents();
      this.emitCartUpdated();
      this.loadRecommendations();
    }

    emitCartUpdated() {
      const detail = { cart: this.cart, count: this.count };
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail }));
      document.dispatchEvent(new CustomEvent("cart:updated", { detail }));
    }

    setError(message) {
      this.error = message || "";
      this.updateFooter();
      // Errors should be visible even when the cart is empty (no footer).
      if (this.error && this.isCartEmpty()) this.updateBody();
    }

    setLoading(loading) {
      this.isLoading = Boolean(loading);
      const body = this.querySelector(".bc-drawer-body");
      if (!body) return;
      body.classList.toggle("is-loading", this.isLoading);
      const overlay = body.querySelector(".bc-loading-overlay");
      if (this.isLoading && !overlay) {
        body.insertAdjacentHTML("beforeend", this.renderLoadingOverlay());
      } else if (!this.isLoading && overlay) {
        overlay.remove();
      }
    }

    // ------------------------------------------------------------------
    // User actions
    // ------------------------------------------------------------------

    handleOpenEvent() {
      this.openCart(true);
    }

    async handleCartSubmit(event) {
      if (!this.settings.autoOpenCart) return;

      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const action = form.getAttribute("action") || "";
      if (!action.includes("/cart/add") && !action.endsWith("cart/add")) return;
      if (form.dataset.magyxCartIgnore === "true") return;

      event.preventDefault();
      await this.addFromForm(form, event.submitter);
    }

    async handleClick(event) {
      const control = event.target.closest("[data-magyx-action]");
      if (!control || !this.contains(control)) return;

      const action = control.dataset.magyxAction;

      if (action === "checkout") {
        if (this.isPreview) event.preventDefault();
        return;
      }

      // A checkbox's native check/uncheck happens as part of its own click
      // activation — preventDefault() here would undo that toggle, so this
      // one action is left to flip on its own before the mutation runs.
      if (action !== "toggle-gift-wrap") event.preventDefault();

      if (action === "open") {
        this.openCart(true);
      } else if (action === "close" || action === "continue-shopping") {
        this.closeCart();
      } else if (action === "remove-item") {
        await this.changeItemQuantity(control.dataset.key, () => 0);
      } else if (action === "change-quantity") {
        const delta = Number(control.dataset.delta || 0);
        await this.changeItemQuantity(
          control.dataset.key,
          (current) => current + delta,
        );
      } else if (action === "toggle-coupon") {
        this.couponOpen = !this.couponOpen;
        this.updateFooter();
      } else if (action === "apply-coupon") {
        const input = this.querySelector(".bc-coupon-input");
        await this.applyCoupon(input?.value || "");
      } else if (action === "remove-coupon") {
        await this.removeCoupon(control.dataset.code || "");
      } else if (action === "add-upsell") {
        await this.addUpsell(control);
      } else if (action === "toggle-gift-wrap") {
        await this.toggleGiftWrap(control.checked);
      }
    }

    handleChange(event) {
      const select = event.target.closest(".bc-upsell-select");
      if (!select || !this.contains(select)) return;

      const option = select.selectedOptions[0];
      const price = option?.dataset.price;
      const item = select.closest(".bc-upsell-item");
      const priceEl = item?.querySelector(".bc-upsell-price");
      if (price && priceEl) priceEl.textContent = price;
    }

    handleKeydown(event) {
      if (event.key === "Escape" && this.isOpen) {
        this.closeCart();
        return;
      }

      if (event.key !== "Enter") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.classList.contains("bc-coupon-input")
      ) {
        event.preventDefault();
        this.applyCoupon(target.value);
      }
    }

    handlePreviewMessage(event) {
      const message = event.data;
      if (!message || message.type !== "magyx-preview:settings") return;
      this.settings = this.mapApiSettings(message.settings || {});
      this.timerCount = Math.max(1, this.settings.timerDuration) * 60;
      this.stopTimer();

      // Products only get applied once — later messages are settings-only
      // edits, and rebuilding the cart every keystroke would wipe out any
      // quantity changes made while poking at the preview.
      if (!this.previewProductsApplied) {
        this.previewProductsApplied = true;
        this.previewProducts = Array.isArray(message.products)
          ? message.products
          : [];
        this.cart = buildPreviewCart(this.previewProducts.slice(0, 2));
        this.count = this.cart.item_count;
      }

      this.recommendations = this.previewRecommendations();
      this.renderShell();
      this.openCart();
    }

    /** Remaining fetched products (not already in the preview cart), capped
     * to the upsell limit — recomputed whenever settings or cart contents
     * change so it reacts to both. */
    previewRecommendations() {
      const cartProductIds = new Set(
        (this.cart.items || []).map((item) => String(item.product_id)),
      );
      return this.previewProducts
        .filter((product) => !cartProductIds.has(String(product.id)))
        .slice(0, this.settings.upsellMax)
        .map(previewRecommendation);
    }

    /** Computes the target quantity from the item's CURRENT quantity at
     * execution time, so rapid +/- clicks accumulate instead of racing. */
    changeItemQuantity(key, computeQuantity) {
      if (!key) return Promise.resolve();
      return this.enqueueMutation(async () => {
        if (this.isPreview) {
          const items = this.cart.items.filter((item) => {
            if (item.key !== key) return true;
            item.quantity = Math.max(0, computeQuantity(item.quantity));
            return item.quantity > 0;
          });
          this.cart = recalculatePreviewCart({ ...this.cart, items });
          this.count = this.cart.item_count;
          // Removing an item frees it back up as a recommendation.
          this.recommendations = this.previewRecommendations();
          this.updateContents();
          return;
        }

        const current = (this.cart?.items || []).find(
          (item) => item.key === key,
        );
        const quantity = Math.max(
          0,
          computeQuantity(Number(current?.quantity || 0)),
        );
        const cart = await this.postJson("cart/change.js", {
          id: key,
          quantity,
        });
        this.refreshSequence++;
        this.receiveCart(cart);
      });
    }

    async addFromForm(form, submitter) {
      return this.enqueueMutation(async () => {
        let formData;
        try {
          formData = new FormData(form, submitter || undefined);
        } catch (_error) {
          formData = new FormData(form);
          if (submitter?.name) formData.append(submitter.name, submitter.value);
        }

        const response = await fetch(this.route("cart/add.js"), {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            [INTERNAL_FETCH_FLAG]: "1",
          },
          body: formData,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          this.openCart();
          throw new Error(
            payload.description ||
              payload.message ||
              "Unable to add this product.",
          );
        }

        await this.refreshCart();
        this.openCart();
      });
    }

    applyCoupon(rawCode) {
      const code = rawCode.trim();
      if (!code) return Promise.resolve();

      return this.enqueueMutation(async () => {
        if (this.isPreview) {
          this.couponOpen = false;
          this.updateFooter();
          return;
        }
        const codes = new Set(this.discountCodes());
        codes.add(code);
        const cart = await this.postJson("cart/update.js", {
          discount: Array.from(codes).join(","),
        });
        this.couponOpen = false;
        this.refreshSequence++;
        this.receiveCart(cart);
      });
    }

    removeCoupon(code) {
      if (!code) return Promise.resolve();

      return this.enqueueMutation(async () => {
        if (this.isPreview) return;
        const remainingCodes = this.discountCodes().filter(
          (existingCode) => existingCode !== code,
        );
        const cart = await this.postJson("cart/update.js", {
          discount: remainingCodes.join(","),
        });
        this.refreshSequence++;
        this.receiveCart(cart);
      });
    }

    addUpsell(button) {
      const item = button.closest(".bc-upsell-item");
      const select = item?.querySelector(".bc-upsell-select");
      const variantId = select?.value || button.dataset.variantId;
      if (!variantId) return Promise.resolve();

      return this.enqueueMutation(async () => {
        if (this.isPreview) {
          const product = this.previewProducts.find(
            (candidate) => String(candidate.id) === variantId,
          );
          if (product) {
            this.cart.items.push(previewCartItem(product, 1));
            this.cart = recalculatePreviewCart(this.cart);
            this.count = this.cart.item_count;
            this.recommendations = this.previewRecommendations();
            this.updateContents();
          }
          return;
        }
        await this.postJson("cart/add.js", {
          items: [{ id: Number(variantId), quantity: 1 }],
        });
        await this.refreshCart();
      });
    }

    /** Gift wrap is a real product/variant, added or removed as an actual
     * cart line so the customer is genuinely charged for it — the checkbox
     * just mirrors whether that line currently exists. It's filtered out of
     * the regular item list (see renderItems call site) so it only ever
     * shows as this one toggle row, not a duplicate line card. */
    toggleGiftWrap(checked) {
      const variantId = this.settings.giftWrapVariantId;
      if (!variantId) return Promise.resolve();

      return this.enqueueMutation(async () => {
        if (this.isPreview) {
          if (checked) {
            this.cart.items.push({
              key: "preview-gift-wrap",
              variant_id: variantId,
              product_id: this.settings.giftWrapProductId,
              quantity: 1,
              product_title:
                this.settings.giftWrapProductTitle ||
                this.settings.giftWrapLabel,
              variant_title: "",
              url: "#",
              image: this.settings.giftWrapProductImage,
              original_price: this.settings.giftWrapPrice,
              final_price: this.settings.giftWrapPrice,
              line_level_discount_allocations: [],
              properties: {},
            });
          } else {
            this.cart.items = this.cart.items.filter(
              (item) => item.key !== "preview-gift-wrap",
            );
          }
          this.cart = recalculatePreviewCart(this.cart);
          this.count = this.cart.item_count;
          this.updateContents();
          return;
        }

        if (checked) {
          await this.postJson("cart/add.js", {
            items: [{ id: Number(variantId), quantity: 1 }],
          });
        } else {
          const existing = (this.cart?.items || []).find(
            (item) => String(item.variant_id) === String(variantId),
          );
          if (existing) {
            await this.postJson("cart/change.js", {
              id: existing.key,
              quantity: 0,
            });
          }
        }
        await this.refreshCart();
      });
    }

    openCart(forceRefresh = false) {
      if (!this.isOpen) {
        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        this.isOpen = true;
        // The class toggle (not a rebuild) is what lets the CSS slide-in
        // transition actually play.
        this.querySelector(".bc-drawer-wrap")?.classList.add("is-open");
        this.startTimer();
        window.setTimeout(() => {
          this.querySelector(".bc-drawer-close")?.focus();
        }, 0);
      }

      if (forceRefresh && !this.isPreview) this.refreshCart({ loading: true });
    }

    closeCart() {
      if (this.isPreview) return; // The admin preview drawer stays open.
      if (!this.isOpen) return;
      this.isOpen = false;
      document.body.style.overflow = this.previousBodyOverflow;
      this.querySelector(".bc-drawer-wrap")?.classList.remove("is-open");
    }

    startTimer() {
      if (this.timerInterval || !this.settings.showAnnouncement) return;

      this.timerInterval = window.setInterval(() => {
        if (this.timerCount > 0) {
          this.timerCount -= 1;
          const timer = this.querySelector(".bc-timer-bold");
          if (timer) timer.textContent = this.formatTime(this.timerCount);
        } else {
          this.stopTimer();
        }
      }, 1000);
    }

    stopTimer() {
      if (!this.timerInterval) return;
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    formatMoney(cents) {
      const currency =
        this.cart?.currency || window.Shopify?.currency?.active || "USD";
      const locale =
        window.Shopify?.locale ||
        document.documentElement.lang ||
        navigator.language ||
        "en";
      const amount = Number(cents || 0) / 100;

      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(amount);
      } catch (_error) {
        return `${amount.toFixed(2)} ${currency}`;
      }
    }

    discountCodes() {
      const codes = new Set();
      const applications = this.cart?.cart_level_discount_applications || [];
      applications.forEach((discount) => {
        if (discount.title) codes.add(discount.title);
      });

      (this.cart?.items || []).forEach((item) => {
        this.itemDiscountTitles(item).forEach((title) => codes.add(title));
      });

      return Array.from(codes);
    }

    /** Discounts applied to one line item specifically — used for the badge
     * on that item, instead of stamping every cart-level code on every row. */
    itemDiscountTitles(item) {
      const titles = new Set();
      (item.line_level_discount_allocations || []).forEach((allocation) => {
        const title = allocation?.discount_application?.title;
        if (title) titles.add(title);
      });
      (item.discounts || []).forEach((discount) => {
        if (discount.title) titles.add(discount.title);
      });
      return Array.from(titles);
    }

    getRecommendationAnchorProductId() {
      const firstCartItem = this.cart?.items?.[0];
      return firstCartItem?.product_id || this.settings.currentProductId || "";
    }

    async loadRecommendations() {
      if (this.isPreview) return;
      if (!this.settings.showUpsells || !this.cart) return;

      const isEmpty = this.count === 0;
      if (isEmpty && !this.settings.showUpsellsOnEmpty) {
        this.recommendations = [];
        this.recommendationsSignature = "";
        this.updateBody();
        return;
      }

      const productId = this.getRecommendationAnchorProductId();
      if (!productId) {
        this.recommendations = [];
        this.recommendationsSignature = "";
        this.updateBody();
        return;
      }

      const cartProductIds = new Set(
        (this.cart.items || []).map((item) => Number(item.product_id)),
      );
      const signature = [
        productId,
        Array.from(cartProductIds).sort().join(":"),
        this.settings.upsellMax,
        this.settings.upsellIntent,
      ].join("|");

      if (signature === this.recommendationsSignature) return;
      this.recommendationsSignature = signature;

      try {
        const params = new URLSearchParams({
          product_id: String(productId),
          limit: String(this.settings.upsellMax),
          intent: this.settings.upsellIntent,
        });
        const response = await this.fetchJson(
          `recommendations/products.json?${params.toString()}`,
        );
        this.recommendations = (response.products || [])
          .filter((product) => !cartProductIds.has(Number(product.id)))
          .slice(0, this.settings.upsellMax);
        this.updateBody();
      } catch (_error) {
        this.recommendations = [];
        this.updateBody();
      }
    }

    cssVars() {
      const settings = this.settings;
      return [
        `--bc-bg: ${settings.bgColor}`,
        `--bc-text: ${settings.textColor}`,
        `--bc-accent: ${settings.accentColor}`,
        `--bc-btn-bg: ${settings.btnColor}`,
        `--bc-btn-text: ${settings.btnTextColor}`,
        `--bc-btn-hover-bg: ${settings.btnHoverColor}`,
        `--bc-btn-hover-text: ${settings.btnHoverTextColor}`,
        `--bc-btn-radius: ${settings.btnRadius}px`,
        `--bc-cart-icon-color: ${settings.cartIconColor}`,
        `--bc-cart-icon-size: ${settings.cartIconSize}px`,
        `--bc-cart-bubble-bg: ${settings.cartBubbleBg}`,
        `--bc-cart-bubble-text: ${settings.cartBubbleText}`,
        `--bc-savings: ${settings.savingsTextColor}`,
      ].join("; ");
    }

    // ------------------------------------------------------------------
    // Rendering. The shell (wrapper, overlay, panel, header) is built once;
    // everything after that patches individual regions, so open/close
    // transitions run, focus survives, and typing in the coupon field isn't
    // wiped by a cart refresh.
    // ------------------------------------------------------------------

    renderShell() {
      const settings = this.settings;

      this.innerHTML = `
        ${settings.customCss ? `<style>${settings.customCss}</style>` : ""}
        ${settings.showFloatingTrigger ? this.renderFloatingTrigger() : ""}
        <div class="bc-drawer-wrap ${this.isOpen ? "is-open" : ""}" style="${this.cssVars()}; font-family: ${settings.inheritFonts ? "inherit" : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'};">
          <div class="bc-overlay" data-magyx-action="close"></div>
          <aside class="bc-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(settings.cartTitle)}">
            <div class="bc-drawer-header">
              <h2 class="bc-drawer-title">
                <span>${escapeHtml(settings.cartTitle)}</span>
                <span class="bc-header-count"></span>
              </h2>
              <button type="button" title="Close Cart" aria-label="Close cart" class="bc-drawer-close" data-magyx-action="close">
                ${iconSvg("close")}
              </button>
            </div>
            ${this.renderAnnouncement()}
            <div class="bc-drawer-body">
              <div class="bc-cart-html-container"></div>
            </div>
          </aside>
        </div>
      `;

      this.updateContents();
    }

    /** Patches the trigger badge + header count + drawer contents. */
    updateContents() {
      this.updateTriggerCount();
      this.updateHeaderCount();
      this.updateBody();
      this.updateFooter();
    }

    updateTriggerCount() {
      const bubble = this.querySelector(
        ".magyx-cart-floating-trigger .magyx-cart-count-bubble",
      );
      if (!bubble) return;
      bubble.textContent = String(this.count);
      bubble.hidden = !(this.count > 0);
    }

    updateHeaderCount() {
      const slot = this.querySelector(".bc-header-count");
      if (!slot) return;
      slot.innerHTML = this.settings.showCartCount
        ? `<span class="bc-drawer-title-sep">•</span> <span class="bc-cart-count-display">${this.count}</span>`
        : "";
    }

    isCartEmpty() {
      return Number(this.cart?.item_count || 0) === 0;
    }

    /** Rewards + items + upsells (the scrollable middle). Preserves scroll
     * position across refreshes. */
    updateBody() {
      const container = this.querySelector(".bc-cart-html-container");
      if (!container) return;

      const cart = this.cart || { item_count: 0, items: [] };
      const isEmpty = this.isCartEmpty();
      const previousScroll =
        container.querySelector(".bc-cart-contents-scroll")?.scrollTop || 0;

      // The gift-wrap variant (if any) rides along as a real cart line so
      // checkout actually charges for it, but it's rendered as its own
      // toggle row below — not duplicated as a second line-item card here.
      const giftWrapVariantId = this.settings.giftWrapVariantId;
      const visibleItems = giftWrapVariantId
        ? (cart.items || []).filter(
            (item) => String(item.variant_id) !== String(giftWrapVariantId),
          )
        : cart.items || [];

      const scrollRegion = `
        <div class="bc-cart-contents-scroll">
          ${this.renderRewards(cart)}
          ${isEmpty ? this.renderEmptyCart() : this.renderItems(visibleItems)}
          ${isEmpty ? "" : this.renderGiftWrap()}
          ${this.renderUpsells(isEmpty)}
        </div>
      `;

      const existingScroll = container.querySelector(
        ".bc-cart-contents-scroll",
      );
      if (existingScroll) {
        existingScroll.outerHTML = scrollRegion;
      } else {
        container.insertAdjacentHTML("afterbegin", scrollRegion);
      }
      const newScroll = container.querySelector(".bc-cart-contents-scroll");
      if (newScroll) newScroll.scrollTop = previousScroll;
    }

    /** The footer re-renders on every cart change, so the coupon input's
     * text, focus, and cursor are captured and restored around the patch. */
    updateFooter() {
      const container = this.querySelector(".bc-cart-html-container");
      if (!container) return;

      const existingInput = container.querySelector(".bc-coupon-input");
      const couponState =
        existingInput && document.activeElement === existingInput
          ? {
              value: existingInput.value,
              selectionStart: existingInput.selectionStart,
              selectionEnd: existingInput.selectionEnd,
            }
          : existingInput
            ? { value: existingInput.value }
            : null;

      const markup = this.isCartEmpty() ? "" : this.renderFooter(this.cart);
      const existingFooter = container.querySelector(".bc-drawer-footer");
      if (existingFooter) existingFooter.remove();

      if (markup) {
        const staticFooter = this.settings.footerPosition !== "fixed";
        const target = staticFooter
          ? container.querySelector(".bc-cart-contents-scroll")
          : container;
        target?.insertAdjacentHTML("beforeend", markup);
      }

      if (couponState) {
        const input = container.querySelector(".bc-coupon-input");
        if (input) {
          input.value = couponState.value;
          if (couponState.selectionStart !== undefined) {
            input.focus();
            input.setSelectionRange(
              couponState.selectionStart,
              couponState.selectionEnd,
            );
          }
        }
      }
    }

    renderFloatingTrigger() {
      const settings = this.settings;
      return `
        <button
          type="button"
          class="magyx-cart-floating-trigger ${settings.floatingPosition === "bottom-left" ? "is-left" : "is-right"}"
          data-magyx-action="open"
          aria-label="Open cart"
          style="${this.cssVars()}"
        >
          ${iconSvg(settings.cartIconType, "magyx-cart-icon-svg")}
          ${settings.showCartCount ? `<span class="magyx-cart-count-bubble" ${this.count > 0 ? "" : "hidden"}>${this.count}</span>` : ""}
        </button>
      `;
    }

    renderAnnouncement() {
      const settings = this.settings;
      if (!settings.showAnnouncement) return "";

      const text = escapeHtml(settings.announcementText).replace(
        "{timer}",
        `<strong class="bc-timer-bold">${this.formatTime(this.timerCount)}</strong>`,
      );

      return `
        <div class="bc-drawer-top-notices">
          <div class="bc-announcement size-${escapeHtml(settings.announcementSize)}" style="background-color: ${settings.announcementBg}; color: ${settings.announcementTextColor};">
            ${text}
          </div>
        </div>
      `;
    }

    renderRewards(cart) {
      const settings = this.settings;
      const isEmpty = Number(cart.item_count || 0) === 0;
      if (
        !settings.enableRewardsBar ||
        (isEmpty && !settings.showRewardsOnEmpty)
      )
        return "";

      const goals = [
        {
          threshold: settings.rewardGoalOneThreshold,
          label: settings.rewardGoalOneLabel,
          icon: settings.rewardGoalOneIcon,
        },
        {
          threshold: settings.rewardGoalTwoThreshold,
          label: settings.rewardGoalTwoLabel,
          icon: settings.rewardGoalTwoIcon,
        },
      ]
        .filter((goal) => goal.threshold > 0)
        .sort((a, b) => a.threshold - b.threshold);

      if (!goals.length) return "";

      const currentValue =
        settings.rewardType === "quantity"
          ? Number(cart.item_count || 0)
          : Number(cart.items_subtotal_price || 0) / 100;
      const maxThreshold = goals[goals.length - 1].threshold;
      const progress = Math.min((currentValue / maxThreshold) * 100, 100);
      const nextGoal = goals.find((goal) => currentValue < goal.threshold);

      const progressText = nextGoal
        ? this.renderRewardAwayText(
            nextGoal,
            Math.max(nextGoal.threshold - currentValue, 0),
          )
        : escapeHtml(settings.rewardCompletedText);

      return `
        <div class="bc-rewards-bars-wrap">
          <div class="bc-progress-wrap">
            <div class="bc-progress-text">${progressText}</div>
            <div class="bc-progress-bar" style="background-color: ${settings.rewardsBarBg}; margin-bottom: 24px;">
              <div class="bc-progress-fill" style="width: ${progress}%; background-color: ${settings.rewardsBarFg};"></div>
              <div class="bc-checkpoints">
                ${goals
                  .map((goal) => {
                    const reached = currentValue >= goal.threshold;
                    const position = Math.min(
                      (goal.threshold / maxThreshold) * 100,
                      100,
                    );
                    return `
                      <div class="bc-checkpoint ${reached ? "is-reached" : ""}" style="left: ${position}%; background-color: ${
                        reached ? settings.rewardsBarFg : settings.rewardsBarBg
                      }; color: ${reached ? settings.rewardsCompleteIconColor : settings.rewardsIncompleteIconColor};">
                        ${iconSvg(goal.icon, "bc-checkpoint-icon")}
                        <div class="bc-checkpoint-label">${escapeHtml(goal.label)}</div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderRewardAwayText(goal, difference) {
      const amount =
        this.settings.rewardType === "quantity"
          ? String(Math.ceil(difference))
          : this.formatMoney(Math.ceil(difference * 100));

      return escapeHtml(this.settings.rewardAwayText)
        .replace("{amount}", `<strong>${escapeHtml(amount)}</strong>`)
        .replace("{goal}", `<strong>${escapeHtml(goal.label)}</strong>`);
    }

    renderItems(items) {
      return `
        <div class="bc-item-list">
          ${items.map((item) => this.renderItem(item)).join("")}
        </div>
      `;
    }

    renderGiftWrap() {
      const settings = this.settings;
      if (!settings.enableGiftWrap || !settings.giftWrapVariantId) return "";

      const isWrapped = (this.cart?.items || []).some(
        (item) => String(item.variant_id) === String(settings.giftWrapVariantId),
      );

      return `
        <label class="bc-gift-wrap-row">
          <span class="bc-gift-wrap-icon-wrap">${iconSvg("gift", "bc-gift-wrap-icon")}</span>
          <span class="bc-gift-wrap-text">${escapeHtml(settings.giftWrapLabel)}</span>
          <span class="bc-gift-wrap-price">+ ${this.formatMoney(settings.giftWrapPrice)}</span>
          <input
            type="checkbox"
            class="bc-gift-wrap-checkbox"
            data-magyx-action="toggle-gift-wrap"
            aria-label="${escapeHtml(settings.giftWrapLabel)}"
            ${isWrapped ? "checked" : ""}
          >
        </label>
      `;
    }

    renderItem(item) {
      const settings = this.settings;
      const title = item.product_title || item.title || "Product";
      const productUrl = item.url || "#";
      const imageUrl = normalizeImageUrl(item.image);
      const originalLine = Number(
        item.original_line_price ??
          Number(item.original_price || 0) * Number(item.quantity || 1),
      );
      const finalLine = Number(
        item.final_line_price ??
          Number(item.final_price || item.price || 0) *
            Number(item.quantity || 1),
      );
      const hasSale = originalLine > finalLine;
      const savings = originalLine - finalLine;
      const itemDiscounts = this.itemDiscountTitles(item);

      return `
        <div class="bc-item">
          ${
            settings.showItemImages
              ? `<a href="${escapeHtml(productUrl)}" class="bc-item-img-wrap">
                  ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy">` : iconSvg("image", "bc-placeholder-icon")}
                </a>`
              : ""
          }
          <div class="bc-item-details">
            <button type="button" class="bc-item-remove" aria-label="Remove ${escapeHtml(title)}" data-magyx-action="remove-item" data-key="${escapeHtml(item.key)}">
              ${iconSvg("trash")}
            </button>

            <a href="${escapeHtml(productUrl)}" class="bc-item-title-link">
              <h4 class="bc-item-title">${escapeHtml(title)}</h4>
            </a>
            ${this.renderItemMeta(item)}

            <div class="bc-item-prices">
              ${hasSale && settings.showStrikethrough ? `<span class="bc-item-old-price">${this.formatMoney(originalLine)}</span>` : ""}
              <span class="bc-item-price">${this.formatMoney(finalLine)}</span>
              ${
                hasSale && settings.showSavings && savings > 0
                  ? `<span class="bc-item-price bc-item-savings">(${escapeHtml(settings.savingsPrefix)} ${this.formatMoney(savings)})</span>`
                  : ""
              }
            </div>

            <div class="bc-item-bottom">
              <div class="bc-qty-wrap">
                <button type="button" class="bc-qty-btn minus" aria-label="Decrease ${escapeHtml(title)} quantity" data-magyx-action="change-quantity" data-key="${escapeHtml(item.key)}" data-delta="-1">-</button>
                <span class="bc-qty-val">${Number(item.quantity || 0)}</span>
                <button type="button" class="bc-qty-btn plus" aria-label="Increase ${escapeHtml(title)} quantity" data-magyx-action="change-quantity" data-key="${escapeHtml(item.key)}" data-delta="1">+</button>
              </div>

              ${
                itemDiscounts.length
                  ? `<div class="bc-item-coupons">
                      ${itemDiscounts
                        .map(
                          (code) => `
                            <div class="bc-item-discount-badge">
                              ${iconSvg("tag", "bc-badge-icon")}
                              <span class="bc-badge-text">${escapeHtml(code).toUpperCase()}</span>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    }

    renderItemMeta(item) {
      const meta = [];
      if (item.variant_title && item.variant_title !== "Default Title")
        meta.push(item.variant_title);
      if (Array.isArray(item.variant_options)) {
        item.variant_options
          .filter(
            (option) =>
              option &&
              option !== "Default Title" &&
              option !== item.variant_title,
          )
          .forEach((option) => meta.push(option));
      }

      Object.entries(item.properties || {}).forEach(([key, value]) => {
        if (!key || key.startsWith("_") || value === null || value === "")
          return;
        meta.push(`${humanizePropertyName(key)}: ${value}`);
      });

      return meta.length
        ? `<div class="bc-item-meta">${meta.map(escapeHtml).join(", ")}</div>`
        : "";
    }

    renderEmptyCart() {
      return `
        <div class="bc-empty-cart">
          ${this.error ? `<div class="bc-cart-error" role="alert">${escapeHtml(this.error)}</div>` : ""}
          <svg class="bc-empty-cart-icon" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p class="bc-empty-cart-text">${escapeHtml(this.settings.transEmptyCart)}</p>
          <button type="button" class="bc-empty-cart-btn" data-magyx-action="continue-shopping">${escapeHtml(this.settings.transContinueShopping)}</button>
        </div>
      `;
    }

    renderUpsells(isEmpty) {
      const settings = this.settings;
      if (
        !settings.showUpsells ||
        (isEmpty && !settings.showUpsellsOnEmpty) ||
        !this.recommendations.length
      )
        return "";

      return `
        <div class="bc-upsells">
          <h3 class="bc-upsells-title">${escapeHtml(settings.upsellTitle)}</h3>
          <div class="bc-upsells-list">
            ${this.recommendations.map((product) => this.renderUpsell(product)).join("")}
          </div>
        </div>
      `;
    }

    renderUpsell(product) {
      const variants = product.variants || [];
      const availableVariants = variants.filter((variant) => variant.available);
      const selectedVariant = availableVariants[0] || variants[0] || null;
      const productUrl =
        product.url ||
        (product.handle ? this.route(`products/${product.handle}`) : "#");
      const imageUrl = normalizeImageUrl(
        product.featured_image ||
          product.images?.[0] ||
          selectedVariant?.featured_image?.src,
      );
      const price =
        selectedVariant?.price ?? product.price_min ?? product.price;
      const compareAtPrice =
        selectedVariant?.compare_at_price ?? product.compare_at_price;
      const hasCompareAt = Number(compareAtPrice || 0) > Number(price || 0);

      return `
        <div class="bc-upsell-item">
          <div class="bc-upsell-img-wrap">
            <a href="${escapeHtml(productUrl)}" class="bc-upsell-link">
              ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.title)}" loading="lazy">` : iconSvg("image", "bc-placeholder-icon")}
            </a>
          </div>
          <div class="bc-upsell-details">
            <h5 class="bc-upsell-title">
              <a href="${escapeHtml(productUrl)}">${escapeHtml(product.title)}</a>
            </h5>
            <div class="bc-upsell-prices">
              ${hasCompareAt ? `<span class="bc-upsell-old-price">${this.formatMoney(compareAtPrice)}</span>` : ""}
              <span class="bc-upsell-price">${this.formatMoney(price)}</span>
            </div>
            <div class="bc-upsell-actions">
              ${
                variants.length > 1
                  ? `<div class="bc-upsell-select-wrap">
                      <select class="bc-upsell-select" aria-label="Choose ${escapeHtml(product.title)} variant">
                        ${variants
                          .map((variant) => {
                            const label =
                              variant.public_title ||
                              variant.title ||
                              "Default";
                            const disabled = variant.available
                              ? ""
                              : "disabled";
                            const selected =
                              selectedVariant &&
                              variant.id === selectedVariant.id
                                ? "selected"
                                : "";
                            return `<option value="${variant.id}" data-price="${this.formatMoney(variant.price)}" ${selected} ${disabled}>${escapeHtml(label)}</option>`;
                          })
                          .join("")}
                      </select>
                      <span class="bc-upsell-select-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                      </span>
                    </div>`
                  : ""
              }
              <button type="button" class="bc-upsell-add" data-magyx-action="add-upsell" data-variant-id="${selectedVariant?.id || ""}" ${
                selectedVariant ? "" : "disabled"
              }>
                ${escapeHtml(this.settings.upsellBtnText)}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderFooter(cart) {
      const settings = this.settings;
      const discountCodes = this.discountCodes();

      return `
        <div class="bc-drawer-footer">
          ${this.error ? `<div class="bc-cart-error" role="alert">${escapeHtml(this.error)}</div>` : ""}
          ${settings.enableCoupon ? this.renderCoupon() : ""}
          <div class="bc-summary-block">
            ${
              settings.enableSubtotalLine
                ? `<div class="bc-summary-row">
                    <span>${escapeHtml(settings.transSubtotal)}</span>
                    <span class="val-wrap">${this.formatMoney(cart.items_subtotal_price || cart.original_total_price || 0)}</span>
                  </div>`
                : ""
            }
            ${
              Number(cart.total_discount || 0) > 0
                ? `<div class="bc-summary-row">
                    <div class="label-wrap">
                      <span>${escapeHtml(settings.transDiscounts)}:</span>
                      ${discountCodes.map((code) => this.renderDiscountBadge(code)).join("")}
                    </div>
                    <span class="val-wrap bc-discount-val">- ${this.formatMoney(cart.total_discount)}</span>
                  </div>`
                : ""
            }
            ${
              settings.enableTotalLine
                ? `<div class="bc-summary-row bc-total-row">
                    <span>${escapeHtml(settings.transTotal)}</span>
                    <span class="val-wrap">${this.formatMoney(cart.total_price || 0)}</span>
                  </div>`
                : ""
            }
            ${settings.showShippingNotice ? `<div class="bc-shipping-notice">${escapeHtml(settings.shippingNoticeText)}</div>` : ""}
          </div>
          <div class="bc-checkout-btn-wrap">
            <a href="${this.route("checkout")}" class="bc-checkout-btn" data-magyx-action="checkout">
              <span>${escapeHtml(settings.transCheckoutBtn)}</span>
              ${
                settings.showSubtotalOnCheckout
                  ? `<span class="bc-checkout-sep">•</span><span>${this.formatMoney(cart.total_price || 0)}</span>`
                  : ""
              }
            </a>
          </div>
          ${
            settings.showTrustBadges && settings.trustBadgeUrl
              ? `<div class="bc-trust-badges"><img src="${escapeHtml(settings.trustBadgeUrl)}" alt="Payment badges" loading="lazy"></div>`
              : ""
          }
          ${this.renderTrustInfo()}
        </div>
      `;
    }

    renderTrustInfo() {
      const settings = this.settings;
      const rows = [
        settings.showDeliveryEstimate && settings.deliveryEstimateText
          ? { icon: "truck", text: settings.deliveryEstimateText }
          : null,
        settings.showReturnPolicy && settings.returnPolicyText
          ? { icon: "return", text: settings.returnPolicyText }
          : null,
        settings.showReviewsTrust && settings.reviewsTrustText
          ? { icon: "star", text: settings.reviewsTrustText }
          : null,
      ].filter(Boolean);

      if (!rows.length) return "";

      return `
        <div class="bc-trust-info">
          ${rows
            .map(
              (row) => `
                <div class="bc-trust-info-row">
                  ${iconSvg(row.icon, "bc-trust-info-icon")}
                  <span>${escapeHtml(row.text)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      `;
    }

    renderCoupon() {
      return `
        <div class="bc-coupon-accordion">
          <button type="button" class="bc-coupon-toggle" data-magyx-action="toggle-coupon" aria-expanded="${this.couponOpen ? "true" : "false"}">
            <span class="bc-coupon-toggle-label">
              ${iconSvg("tag", "bc-coupon-toggle-label-icon")}
              <span>${escapeHtml(this.settings.transCouponAccordionTitle)}</span>
            </span>
            <span class="bc-coupon-toggle-icon ${this.couponOpen ? "is-open" : ""}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
          </button>
          <div class="bc-coupon-accordion-content" style="max-height: ${this.couponOpen ? "92px" : "0"};">
            <div class="bc-coupon-wrap">
              <input type="text" placeholder="${escapeHtml(this.settings.transCouponPlaceholder)}" class="bc-coupon-input" autocomplete="off">
              <button type="button" class="bc-coupon-btn" data-magyx-action="apply-coupon">${escapeHtml(this.settings.transCouponApplyBtn)}</button>
            </div>
          </div>
        </div>
      `;
    }

    renderDiscountBadge(code) {
      return `
        <button type="button" class="bc-summary-discount-badge" data-magyx-action="remove-coupon" data-code="${escapeHtml(code)}" aria-label="Remove discount ${escapeHtml(code)}">
          <span class="bc-summary-badge-text">${escapeHtml(code).toUpperCase()}</span>
          <span class="bc-badge-remove" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </span>
        </button>
      `;
    }

    renderLoadingOverlay() {
      return `
        <div class="bc-loading-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="bc-spinner" aria-hidden="true">
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647Z"></path>
          </svg>
        </div>
      `;
    }
  }

  class MagyxCartTrigger extends HTMLElement {
    constructor() {
      super();
      this.count = 0;
      this.handleClick = this.handleClick.bind(this);
      this.handleCartUpdated = this.handleCartUpdated.bind(this);
    }

    connectedCallback() {
      this.settings = this.readSettings();
      this.render();
      this.addEventListener("click", this.handleClick);
      window.addEventListener(CART_UPDATED_EVENT, this.handleCartUpdated);
      this.refreshCount();
    }

    disconnectedCallback() {
      this.removeEventListener("click", this.handleClick);
      window.removeEventListener(CART_UPDATED_EVENT, this.handleCartUpdated);
    }

    readSettings() {
      const data = this.dataset;
      return {
        cartIconType: asText(data.cartIconType, DEFAULTS.cartIconType),
        cartIconColor: asText(data.cartIconColor, DEFAULTS.cartIconColor),
        cartIconSize: asNumber(data.cartIconSize, DEFAULTS.cartIconSize),
        cartBubbleBg: asText(data.cartBubbleBg, DEFAULTS.cartBubbleBg),
        cartBubbleText: asText(data.cartBubbleText, DEFAULTS.cartBubbleText),
        showCartCount: asBoolean(data.showCartCount, DEFAULTS.showCartCount),
        label: asText(data.label, "Open cart"),
      };
    }

    route(path) {
      const root = window.Shopify?.routes?.root || "/";
      const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
      return `${normalizedRoot}${String(path).replace(/^\//, "")}`;
    }

    async refreshCount() {
      try {
        const response = await fetch(this.route("cart.js"), {
          credentials: "same-origin",
          headers: { Accept: "application/json", [INTERNAL_FETCH_FLAG]: "1" },
        });
        if (!response.ok) return;
        const cart = await response.json();
        this.count = Number(cart.item_count || 0);
        this.updateCount();
      } catch (_error) {
        // The drawer remains usable if a theme blocks the count request.
      }
    }

    handleCartUpdated(event) {
      this.count = Number(event.detail?.count || 0);
      this.updateCount();
    }

    handleClick(event) {
      event.preventDefault();
      const drawer = document.querySelector("magyx-cart-drawer");
      if (drawer && typeof drawer.openCart === "function" && !drawer.inert) {
        drawer.openCart(true);
        return;
      }

      window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));

      window.setTimeout(() => {
        const lateDrawer = document.querySelector("magyx-cart-drawer");
        if (!lateDrawer || lateDrawer.inert) {
          window.location.href = this.route("cart");
        }
      }, 50);
    }

    cssVars() {
      const settings = this.settings;
      return [
        `--bc-cart-icon-color: ${settings.cartIconColor}`,
        `--bc-cart-icon-size: ${settings.cartIconSize}px`,
        `--bc-cart-bubble-bg: ${settings.cartBubbleBg}`,
        `--bc-cart-bubble-text: ${settings.cartBubbleText}`,
      ].join("; ");
    }

    updateCount() {
      const bubble = this.querySelector(".magyx-cart-count-bubble");
      if (!bubble) return;
      bubble.textContent = String(this.count);
      bubble.hidden = !(this.count > 0);
    }

    render() {
      if (!this.settings) return;

      this.innerHTML = `
        <button type="button" class="magyx-cart-icon-wrapper bc-icon-trigger" aria-label="${escapeHtml(this.settings.label)}" style="${this.cssVars()}">
          ${iconSvg(this.settings.cartIconType, "magyx-cart-icon-svg")}
          ${
            this.settings.showCartCount
              ? `<span class="magyx-cart-count-bubble" ${this.count > 0 ? "" : "hidden"}>${this.count}</span>`
              : ""
          }
        </button>
      `;
    }
  }

  if (!customElements.get("magyx-cart-drawer")) {
    customElements.define("magyx-cart-drawer", MagyxCartDrawer);
  }

  if (!customElements.get("magyx-cart-trigger")) {
    customElements.define("magyx-cart-trigger", MagyxCartTrigger);
  }
})();
