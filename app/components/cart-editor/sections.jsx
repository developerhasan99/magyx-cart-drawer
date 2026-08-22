/* eslint-disable react/prop-types -- plain-JS codebase, no PropTypes in use */
import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  ColorPicker as PolarisColorPicker,
  Divider,
  InlineGrid,
  InlineStack,
  Popover,
  Select,
  Text,
  TextField,
  hexToRgb,
  hsbToHex,
  rgbToHsb,
} from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import "./sections.css";

/** Section shell: heading + subdued description, standard Polaris type. */
function Section({ title, description, children }) {
  return (
    <BlockStack gap="400">
      <BlockStack gap="100">
        <Text as="h2" variant="headingMd">
          {title}
        </Text>
        {description ? (
          <Text as="p" variant="bodyMd" tone="subdued">
            {description}
          </Text>
        ) : null}
      </BlockStack>
      {children}
    </BlockStack>
  );
}

/** Subheading between field groups inside a section. */
function Group({ title, children }) {
  return (
    <BlockStack gap="300">
      <Divider />
      <Text as="h3" variant="headingSm">
        {title}
      </Text>
      {children}
    </BlockStack>
  );
}

function TwoColumns({ children }) {
  return (
    <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
      {children}
    </InlineGrid>
  );
}

/** Opens Shopify's own native product editor (the same one merchants use
 * from the Products list) via App Bridge admin intents, instead of us
 * rebuilding a copy of it. Resolves once the merchant closes it. */
async function openProductEditor(shopify, productId) {
  if (!productId) return;
  if (!shopify.intents?.invoke) {
    shopify.toast.show("The product editor is unavailable", { isError: true });
    return;
  }
  const activity = await shopify.intents.invoke("edit:shopify/Product", {
    value: productId,
  });
  await activity.complete;
}

/** Shared "pick a product for this add-on" card: image, title, price, plus
 * Change and edit-product actions. Used by gift wrap and shipping
 * protection, which both link a real product the same way. */
function ProductPickerCard({ title, price, image, onChange, onEdit }) {
  return (
    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
      <InlineStack align="space-between" blockAlign="center" gap="300">
        <InlineStack gap="300" blockAlign="center">
          {image ? (
            <img
              src={image}
              alt=""
              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
            />
          ) : null}
          <BlockStack gap="0">
            <Text as="span" variant="bodyMd" fontWeight="medium">
              {title}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {(price / 100).toFixed(2)}
            </Text>
          </BlockStack>
        </InlineStack>
        <InlineStack gap="200" blockAlign="center">
          <Button icon={EditIcon} accessibilityLabel="Edit product" onClick={onEdit} />
          <Button onClick={onChange}>Change</Button>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function hexToHsb(hex) {
  return rgbToHsb(hexToRgb(HEX_PATTERN.test(hex) ? hex : "#000000"));
}

/** Hex text field with a swatch that opens Polaris's full HSB picker in a
 * popover — the same pattern as color settings in the theme editor. */
export function ColorPicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  // The picker works in HSB internally. Keeping HSB state here (instead of
  // re-deriving it from the hex on every render) preserves the hue while
  // dragging through white/black/greys, where hex loses that information.
  const [hsb, setHsb] = useState(() => hexToHsb(value));

  // Re-sync when the value changes from outside (e.g. the save bar's
  // Discard) — but not on our own edits, which would destroy the hue.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (HEX_PATTERN.test(value) && hsbToHex(hsb) !== value.toLowerCase()) {
      setHsb(hexToHsb(value));
    }
  }

  const handlePickerChange = useCallback(
    (next) => {
      setHsb(next);
      onChange(hsbToHex(next));
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (next) => {
      onChange(next);
      if (HEX_PATTERN.test(next)) setHsb(hexToHsb(next));
    },
    [onChange],
  );

  const swatchColor = HEX_PATTERN.test(value) ? value : hsbToHex(hsb);

  const activator = (
    <button
      type="button"
      onClick={() => setOpen((current) => !current)}
      aria-label={`Pick ${label}`}
      style={{
        width: "24px",
        height: "24px",
        padding: 0,
        background: swatchColor,
        border: "none",
        borderRadius: "var(--p-border-radius-100)",
        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.19)",
        cursor: "pointer",
        display: "block",
      }}
    />
  );

  return (
    <div className="magyx-color-field">
    <TextField
      label={label}
      value={value}
      onChange={handleTextChange}
      autoComplete="off"
      suffix={
        <Popover
          active={open}
          activator={activator}
          onClose={() => setOpen(false)}
          preferredAlignment="right"
        >
          <Box padding="300">
            <BlockStack gap="300">
              <PolarisColorPicker color={hsb} onChange={handlePickerChange} />
              <TextField
                label="Hex value"
                labelHidden
                value={value}
                onChange={handleTextChange}
                autoComplete="off"
                prefix={
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: swatchColor,
                      borderRadius: "var(--p-border-radius-100)",
                      boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.19)",
                    }}
                  />
                }
              />
            </BlockStack>
          </Box>
        </Popover>
      }
    />
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, suffix, helpText }) {
  return (
    <TextField
      label={label}
      type="number"
      value={String(value ?? "")}
      onChange={(next) => onChange(Number(next) || 0)}
      min={min}
      max={max}
      suffix={suffix}
      helpText={helpText}
      autoComplete="off"
    />
  );
}

export function DesignTab({ settings, updateSetting }) {
  return (
    <Section
      title="Design"
      description="Colors, icon, and button styling for the drawer."
    >
      <Checkbox
        label="Inherit fonts from theme"
        checked={settings.inherit_fonts}
        onChange={(value) => updateSetting("inherit_fonts", value)}
      />

      <Group title="Colors">
        <TwoColumns>
          <ColorPicker
            label="Background color"
            value={settings.bg_color}
            onChange={(value) => updateSetting("bg_color", value)}
          />
          <ColorPicker
            label="Cart accent color"
            value={settings.accent_color}
            onChange={(value) => updateSetting("accent_color", value)}
          />
          <ColorPicker
            label="Cart text color"
            value={settings.text_color}
            onChange={(value) => updateSetting("text_color", value)}
          />
          <ColorPicker
            label="Savings text color"
            value={settings.savings_text_color}
            onChange={(value) => updateSetting("savings_text_color", value)}
          />
        </TwoColumns>
      </Group>

      <Group title="Cart icon">
        <TwoColumns>
          <Select
            label="Icon style"
            options={[
              { label: "Bag 1", value: "bag-1" },
              { label: "Bag 2", value: "bag-2" },
              { label: "Cart", value: "cart" },
              { label: "Basket", value: "basket" },
            ]}
            value={settings.cart_icon_type}
            onChange={(value) => updateSetting("cart_icon_type", value)}
          />
          <NumberField
            label="Icon size"
            value={settings.cart_icon_size}
            onChange={(value) => updateSetting("cart_icon_size", value)}
            min={12}
            max={48}
            suffix="px"
          />
          <ColorPicker
            label="Icon color"
            value={settings.cart_icon_color}
            onChange={(value) => updateSetting("cart_icon_color", value)}
          />
          <ColorPicker
            label="Count bubble background"
            value={settings.cart_bubble_bg}
            onChange={(value) => updateSetting("cart_bubble_bg", value)}
          />
          <ColorPicker
            label="Count bubble text"
            value={settings.cart_bubble_text}
            onChange={(value) => updateSetting("cart_bubble_text", value)}
          />
        </TwoColumns>
        <Checkbox
          label="Show cart count"
          checked={settings.show_cart_count}
          onChange={(value) => updateSetting("show_cart_count", value)}
        />
      </Group>

      <Group title="Buttons">
        <TwoColumns>
          <NumberField
            label="Button corner radius"
            value={settings.btn_radius}
            onChange={(value) => updateSetting("btn_radius", value)}
            min={0}
            max={40}
            suffix="px"
          />
          <ColorPicker
            label="Button color"
            value={settings.btn_color}
            onChange={(value) => updateSetting("btn_color", value)}
          />
          <ColorPicker
            label="Button text color"
            value={settings.btn_text_color}
            onChange={(value) => updateSetting("btn_text_color", value)}
          />
          <ColorPicker
            label="Button hover color"
            value={settings.btn_hover_color}
            onChange={(value) => updateSetting("btn_hover_color", value)}
          />
          <ColorPicker
            label="Button hover text color"
            value={settings.btn_hover_text_color}
            onChange={(value) => updateSetting("btn_hover_text_color", value)}
          />
        </TwoColumns>
      </Group>
    </Section>
  );
}

export function AnnouncementsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Announcements"
      description="Show a bar at the top of the drawer, optionally with a countdown timer."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Show announcement bar"
          checked={settings.show_announcement}
          onChange={(value) => updateSetting("show_announcement", value)}
        />
        <TextField
          label="Announcement text"
          value={settings.announcement_text}
          onChange={(value) => updateSetting("announcement_text", value)}
          helpText="Use {timer} to insert the countdown."
          autoComplete="off"
        />
        <TwoColumns>
          <NumberField
            label="Timer duration"
            value={settings.timer_duration}
            onChange={(value) => updateSetting("timer_duration", value)}
            min={1}
            max={120}
            suffix="minutes"
          />
          <Select
            label="Bar size"
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
            value={settings.announcement_bar_size}
            onChange={(value) => updateSetting("announcement_bar_size", value)}
          />
          <ColorPicker
            label="Background color"
            value={settings.announcement_bg}
            onChange={(value) => updateSetting("announcement_bg", value)}
          />
          <ColorPicker
            label="Text color"
            value={settings.announcement_text_color}
            onChange={(value) =>
              updateSetting("announcement_text_color", value)
            }
          />
        </TwoColumns>
      </BlockStack>
    </Section>
  );
}

export function RewardsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Tiered rewards"
      description="A progress bar with rewards customers unlock as their cart grows."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Enable tiered rewards bar"
          checked={settings.enable_rewards_bar}
          onChange={(value) => updateSetting("enable_rewards_bar", value)}
        />
        <Checkbox
          label="Show rewards on empty cart"
          checked={settings.show_rewards_on_empty}
          onChange={(value) => updateSetting("show_rewards_on_empty", value)}
        />
        <Select
          label="Reward progress type"
          options={[
            { label: "Cart subtotal", value: "subtotal" },
            { label: "Item quantity", value: "quantity" },
          ]}
          value={settings.reward_type}
          onChange={(value) => updateSetting("reward_type", value)}
        />
        <TwoColumns>
          <TextField
            label="Away text"
            value={settings.reward_away_text}
            onChange={(value) => updateSetting("reward_away_text", value)}
            helpText="Use {amount} and {goal} as placeholders."
            autoComplete="off"
          />
          <TextField
            label="Completed text"
            value={settings.reward_completed_text}
            onChange={(value) => updateSetting("reward_completed_text", value)}
            autoComplete="off"
          />
        </TwoColumns>
      </BlockStack>

      <Group title="Goals">
        <TwoColumns>
          <NumberField
            label="First goal threshold"
            value={settings.reward_goal_one_threshold}
            onChange={(value) =>
              updateSetting("reward_goal_one_threshold", value)
            }
            min={0}
          />
          <TextField
            label="First goal label"
            value={settings.reward_goal_one_label}
            onChange={(value) => updateSetting("reward_goal_one_label", value)}
            autoComplete="off"
          />
          <NumberField
            label="Second goal threshold"
            value={settings.reward_goal_two_threshold}
            onChange={(value) =>
              updateSetting("reward_goal_two_threshold", value)
            }
            min={0}
            helpText="Set to 0 to use a single goal."
          />
          <TextField
            label="Second goal label"
            value={settings.reward_goal_two_label}
            onChange={(value) => updateSetting("reward_goal_two_label", value)}
            autoComplete="off"
          />
        </TwoColumns>
      </Group>

      <Group title="Bar colors">
        <TwoColumns>
          <ColorPicker
            label="Bar background"
            value={settings.rewards_bar_bg}
            onChange={(value) => updateSetting("rewards_bar_bg", value)}
          />
          <ColorPicker
            label="Bar fill"
            value={settings.rewards_bar_fg}
            onChange={(value) => updateSetting("rewards_bar_fg", value)}
          />
          <ColorPicker
            label="Reached icon color"
            value={settings.rewards_complete_icon_color}
            onChange={(value) =>
              updateSetting("rewards_complete_icon_color", value)
            }
          />
          <ColorPicker
            label="Unreached icon color"
            value={settings.rewards_incomplete_icon_color}
            onChange={(value) =>
              updateSetting("rewards_incomplete_icon_color", value)
            }
          />
        </TwoColumns>
      </Group>
    </Section>
  );
}

export function CartItemsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Cart items"
      description="What each line item shows inside the drawer."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Show product images"
          checked={settings.show_item_images}
          onChange={(value) => updateSetting("show_item_images", value)}
        />
        <Checkbox
          label="Show strikethrough original price"
          checked={settings.show_strikethrough}
          onChange={(value) => updateSetting("show_strikethrough", value)}
        />
        <Checkbox
          label="Show savings amount"
          checked={settings.show_savings}
          onChange={(value) => updateSetting("show_savings", value)}
        />
        <TwoColumns>
          <TextField
            label="Savings prefix"
            value={settings.trans_savings_prefix}
            onChange={(value) => updateSetting("trans_savings_prefix", value)}
            autoComplete="off"
          />
          <ColorPicker
            label="Savings text color"
            value={settings.savings_text_color}
            onChange={(value) => updateSetting("savings_text_color", value)}
          />
        </TwoColumns>
      </BlockStack>
    </Section>
  );
}

export function GiftWrapTab({ settings, updateSetting }) {
  const shopify = useAppBridge();

  const pickWrapProduct = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: "product",
      multiple: false,
      action: "select",
      filter: { draft: false, archived: false, variants: false },
    });
    const product = selection?.[0];
    const variant = product?.variants?.[0];
    if (!product || !variant) return;

    updateSetting("gift_wrap_product_id", product.id);
    updateSetting("gift_wrap_variant_id", variant.id);
    updateSetting("gift_wrap_product_title", product.title);
    updateSetting(
      "gift_wrap_product_image",
      product.images?.[0]?.originalSrc || "",
    );
    updateSetting(
      "gift_wrap_price",
      Math.round(parseFloat(variant.price || "0") * 100),
    );
  }, [shopify, updateSetting]);

  return (
    <Section
      title="Gift wrap"
      description="Let customers add gift wrapping as a checkbox in the cart."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Enable gift wrap option"
          checked={settings.enable_gift_wrap}
          onChange={(value) => updateSetting("enable_gift_wrap", value)}
        />
        <TextField
          label="Checkbox label"
          value={settings.gift_wrap_label}
          onChange={(value) => updateSetting("gift_wrap_label", value)}
          autoComplete="off"
        />
        <Select
          label="Placement"
          options={[
            { label: "Before upsells", value: "before-upsells" },
            { label: "After upsells", value: "after-upsells" },
          ]}
          value={settings.gift_wrap_placement}
          onChange={(value) => updateSetting("gift_wrap_placement", value)}
        />
      </BlockStack>

      <Group title="Wrap product">
        <Text as="p" variant="bodyMd" tone="subdued">
          Create a product in your store for gift wrapping (e.g. &quot;Gift
          Wrapping&quot;, priced however you like), then pick it here — its
          real price is what customers are charged when they check the box.
          Consider hiding it from your storefront and search results so it
          only ever appears through the cart.
        </Text>
        {settings.gift_wrap_product_title ? (
          <ProductPickerCard
            title={settings.gift_wrap_product_title}
            price={settings.gift_wrap_price}
            image={settings.gift_wrap_product_image}
            onChange={pickWrapProduct}
            onEdit={() => openProductEditor(shopify, settings.gift_wrap_product_id)}
          />
        ) : (
          <div>
            <Button onClick={pickWrapProduct}>Choose product</Button>
          </div>
        )}
      </Group>
    </Section>
  );
}

export function ShippingProtectionTab({ settings, updateSetting }) {
  const shopify = useAppBridge();

  const pickProtectionProduct = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: "product",
      multiple: false,
      action: "select",
      filter: { draft: false, archived: false, variants: false },
    });
    const product = selection?.[0];
    const variant = product?.variants?.[0];
    if (!product || !variant) return;

    updateSetting("shipping_protection_product_id", product.id);
    updateSetting("shipping_protection_variant_id", variant.id);
    updateSetting("shipping_protection_product_title", product.title);
    updateSetting(
      "shipping_protection_product_image",
      product.images?.[0]?.originalSrc || "",
    );
    updateSetting(
      "shipping_protection_price",
      Math.round(parseFloat(variant.price || "0") * 100),
    );
  }, [shopify, updateSetting]);

  return (
    <Section
      title="Shipping protection"
      description="Offer optional delivery protection in the cart footer."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Enable shipping protection"
          checked={settings.enable_shipping_protection}
          onChange={(value) =>
            updateSetting("enable_shipping_protection", value)
          }
        />
        <TextField
          label="Add-on title"
          value={settings.shipping_protection_label}
          onChange={(value) =>
            updateSetting("shipping_protection_label", value)
          }
          autoComplete="off"
        />
        <TextField
          label="Description"
          value={settings.shipping_protection_description}
          onChange={(value) =>
            updateSetting("shipping_protection_description", value)
          }
          autoComplete="off"
        />
      </BlockStack>

      <Group title="Protection product">
        <Text as="p" variant="bodyMd" tone="subdued">
          Create a product for shipping protection and pick it here. Its real
          price is charged when the customer enables protection. Consider
          hiding it from storefront search so it appears only through the cart.
        </Text>
        {settings.shipping_protection_product_title ? (
          <ProductPickerCard
            title={settings.shipping_protection_product_title}
            price={settings.shipping_protection_price}
            image={settings.shipping_protection_product_image}
            onChange={pickProtectionProduct}
            onEdit={() =>
              openProductEditor(shopify, settings.shipping_protection_product_id)
            }
          />
        ) : (
          <div>
            <Button onClick={pickProtectionProduct}>Choose product</Button>
          </div>
        )}
      </Group>
    </Section>
  );
}

export function UpsellsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Upsells"
      description="Recommend more products inside the drawer."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Show product recommendations"
          checked={settings.show_upsells}
          onChange={(value) => updateSetting("show_upsells", value)}
        />
        <Checkbox
          label="Show recommendations on empty cart"
          checked={settings.show_upsells_on_empty}
          onChange={(value) => updateSetting("show_upsells_on_empty", value)}
        />
        <TextField
          label="Section title"
          value={settings.upsell_title}
          onChange={(value) => updateSetting("upsell_title", value)}
          autoComplete="off"
        />
        <TwoColumns>
          <NumberField
            label="Maximum products"
            value={settings.upsell_max}
            onChange={(value) => updateSetting("upsell_max", value)}
            min={1}
            max={10}
          />
          <Select
            label="Recommendation source"
            options={[
              { label: "Related products", value: "related" },
              { label: "Complementary products", value: "complementary" },
            ]}
            value={settings.upsell_intent}
            onChange={(value) => updateSetting("upsell_intent", value)}
          />
        </TwoColumns>
        <TextField
          label="Add to cart button text"
          value={settings.upsell_btn_text}
          onChange={(value) => updateSetting("upsell_btn_text", value)}
          autoComplete="off"
        />
      </BlockStack>
    </Section>
  );
}

export function DiscountTab({ settings, updateSetting }) {
  return (
    <Section
      title="Coupon form"
      description="Let customers apply a coupon code without leaving the drawer."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Enable coupon field"
          checked={settings.enable_coupon}
          onChange={(value) => updateSetting("enable_coupon", value)}
        />
        <TwoColumns>
          <TextField
            label="Accordion title"
            value={settings.trans_coupon_accordion_title}
            onChange={(value) =>
              updateSetting("trans_coupon_accordion_title", value)
            }
            autoComplete="off"
          />
          <TextField
            label="Input placeholder"
            value={settings.trans_coupon_placeholder}
            onChange={(value) =>
              updateSetting("trans_coupon_placeholder", value)
            }
            autoComplete="off"
          />
          <TextField
            label="Apply button text"
            value={settings.trans_coupon_apply_btn}
            onChange={(value) => updateSetting("trans_coupon_apply_btn", value)}
            autoComplete="off"
          />
        </TwoColumns>
      </BlockStack>
    </Section>
  );
}

export function SummaryTab({ settings, updateSetting }) {
  return (
    <Section
      title="Summary"
      description="Totals, notices, and the checkout button at the bottom of the drawer."
    >
      <BlockStack gap="300">
        <Select
          label="Cart footer position"
          options={[
            { label: "Static — scroll with cart", value: "static" },
            { label: "Fixed — always visible", value: "fixed" },
          ]}
          value={settings.footer_position}
          onChange={(value) => updateSetting("footer_position", value)}
          helpText="Static is the default."
        />
        <Checkbox
          label="Show subtotal line"
          checked={settings.enable_subtotal_line}
          onChange={(value) => updateSetting("enable_subtotal_line", value)}
          helpText="Shown only when the subtotal differs from the total."
        />
        <Checkbox
          label="Show total line"
          checked={settings.enable_total_line}
          onChange={(value) => updateSetting("enable_total_line", value)}
        />
        <TwoColumns>
          <TextField
            label="Subtotal label"
            value={settings.trans_subtotal}
            onChange={(value) => updateSetting("trans_subtotal", value)}
            autoComplete="off"
          />
          <TextField
            label="Total label"
            value={settings.trans_total}
            onChange={(value) => updateSetting("trans_total", value)}
            autoComplete="off"
          />
          <TextField
            label="Discounts label"
            value={settings.trans_discounts}
            onChange={(value) => updateSetting("trans_discounts", value)}
            autoComplete="off"
          />
        </TwoColumns>
      </BlockStack>

      <Group title="Shipping notice">
        <Checkbox
          label="Show shipping notice"
          checked={settings.show_shipping_notice}
          onChange={(value) => updateSetting("show_shipping_notice", value)}
        />
        <TextField
          label="Notice text"
          value={settings.shipping_notice_text}
          onChange={(value) => updateSetting("shipping_notice_text", value)}
          autoComplete="off"
        />
      </Group>

      <Group title="Checkout button">
        <Checkbox
          label="Show total on checkout button"
          checked={settings.show_subtotal_on_checkout}
          onChange={(value) =>
            updateSetting("show_subtotal_on_checkout", value)
          }
        />
        <TextField
          label="Checkout button text"
          value={settings.trans_checkout_btn}
          onChange={(value) => updateSetting("trans_checkout_btn", value)}
          autoComplete="off"
        />
      </Group>
    </Section>
  );
}

export function BadgesTab({ settings, updateSetting }) {
  const shopify = useAppBridge();
  const fileFetcher = useFetcher();

  const pickBadgeImage = useCallback(async () => {
    if (!shopify.intents.invoke) {
      shopify.toast.show("The Shopify Files picker is unavailable", {
        isError: true,
      });
      return;
    }

    const activity = await shopify.intents.invoke("pick:shopify/File");
    const response = await activity.complete;
    const fileId = response?.code === "ok" ? response.data?.ids?.[0] : null;
    if (!fileId) return;

    fileFetcher.submit(
      { intent: "resolve-trust-badge-file", fileId },
      { method: "POST" },
    );
  }, [fileFetcher, shopify]);

  useEffect(() => {
    if (fileFetcher.state !== "idle" || !fileFetcher.data) return;
    if (fileFetcher.data.url) {
      updateSetting("trust_badge_image", fileFetcher.data.url);
    } else if (fileFetcher.data.error) {
      shopify.toast.show(fileFetcher.data.error, { isError: true });
    }
  }, [fileFetcher.data, fileFetcher.state, shopify, updateSetting]);

  return (
    <Section
      title="Trust badges"
      description="Show payment badges and trust rows under the checkout button."
    >
      <BlockStack gap="300">
        <Checkbox
          label="Show trust badges"
          checked={settings.show_trust_badges}
          onChange={(value) => updateSetting("show_trust_badges", value)}
        />
        <TextField
          label="Badge image"
          value={settings.trust_badge_image}
          onChange={(value) => updateSetting("trust_badge_image", value)}
          helpText="Choose an image from Shopify Files, or paste an image URL."
          autoComplete="off"
        />
        <div>
          <Button
            onClick={pickBadgeImage}
            loading={fileFetcher.state !== "idle"}
          >
            Choose from Shopify Files
          </Button>
        </div>
        {settings.trust_badge_image ? (
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <img
              src={settings.trust_badge_image}
              alt="Trust badges preview"
              style={{ maxWidth: "100%", maxHeight: "48px", display: "block" }}
            />
          </Box>
        ) : null}
      </BlockStack>

      <Group title="Trust rows">
        <BlockStack gap="300">
          <Checkbox
            label="Show delivery estimate"
            checked={settings.show_delivery_estimate}
            onChange={(value) =>
              updateSetting("show_delivery_estimate", value)
            }
          />
          <TextField
            label="Delivery estimate text"
            value={settings.delivery_estimate_text}
            onChange={(value) =>
              updateSetting("delivery_estimate_text", value)
            }
            autoComplete="off"
          />
          <Checkbox
            label="Show return policy"
            checked={settings.show_return_policy}
            onChange={(value) => updateSetting("show_return_policy", value)}
          />
          <TextField
            label="Return policy text"
            value={settings.return_policy_text}
            onChange={(value) => updateSetting("return_policy_text", value)}
            autoComplete="off"
          />
          <Checkbox
            label="Show reviews trust line"
            checked={settings.show_reviews_trust}
            onChange={(value) => updateSetting("show_reviews_trust", value)}
          />
          <TextField
            label="Reviews trust text"
            value={settings.reviews_trust_text}
            onChange={(value) => updateSetting("reviews_trust_text", value)}
            helpText="Free text — not pulled from a reviews app, so keep it accurate."
            autoComplete="off"
          />
        </BlockStack>
      </Group>
    </Section>
  );
}

export function GeneralTab({ settings, updateSetting }) {
  return (
    <Section
      title="General"
      description="Cart title and storefront behavior."
    >
      <TextField
        label="Cart title"
        value={settings.cart_title}
        onChange={(value) => updateSetting("cart_title", value)}
        autoComplete="off"
      />

      <Group title="Placement">
        <BlockStack gap="300">
          <Checkbox
            label="Auto open on add to cart"
            checked={settings.auto_open_cart}
            onChange={(value) => updateSetting("auto_open_cart", value)}
          />
          <Checkbox
            label="Show floating cart button"
            checked={settings.show_floating_trigger}
            onChange={(value) =>
              updateSetting("show_floating_trigger", value)
            }
          />
          {settings.show_floating_trigger && (
            <Select
              label="Floating button position"
              options={[
                { label: "Bottom right", value: "bottom-right" },
                { label: "Bottom left", value: "bottom-left" },
              ]}
              value={settings.floating_position}
              onChange={(value) => updateSetting("floating_position", value)}
            />
          )}
        </BlockStack>
      </Group>
    </Section>
  );
}

export function SettingsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Settings"
      description="Advanced customization for the cart drawer."
    >
      <TextField
        label="Custom CSS"
        value={settings.custom_css}
        onChange={(value) => updateSetting("custom_css", value)}
        multiline={8}
        monospaced
        placeholder="/* Add your custom CSS here */"
        helpText="Overrides the drawer's default styles. Use CSS selectors to target specific elements."
        autoComplete="off"
      />
    </Section>
  );
}

// Every customer-facing string in one place so merchants can localize the
// drawer without hunting through the other sections.
const TRANSLATION_FIELDS = [
  ["trans_checkout_btn", "Checkout button"],
  ["trans_continue_shopping", "Continue shopping button"],
  ["trans_empty_cart", "Empty cart message"],
  ["trans_subtotal", "Subtotal label"],
  ["trans_discounts", "Discounts label"],
  ["trans_total", "Total label"],
  ["trans_savings_prefix", "Savings prefix"],
  ["trans_coupon_accordion_title", "Coupon accordion title"],
  ["trans_coupon_placeholder", "Coupon input placeholder"],
  ["trans_coupon_apply_btn", "Coupon apply button"],
];

export function TranslationsTab({ settings, updateSetting }) {
  return (
    <Section
      title="Translations"
      description="Customize every text your customers see in the cart drawer."
    >
      <TwoColumns>
        {TRANSLATION_FIELDS.map(([key, label]) => (
          <TextField
            key={key}
            label={label}
            value={settings[key]}
            onChange={(value) => updateSetting(key, value)}
            autoComplete="off"
          />
        ))}
      </TwoColumns>
    </Section>
  );
}
