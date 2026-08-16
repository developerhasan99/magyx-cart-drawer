// The Cart drawer app embed block's extension UID
// (extensions/magyx-cart-drawer/shopify.extension.toml). Theme
// settings_data.json embeds this exact id in each app block's `type` field,
// so matching on it — rather than the app handle, which isn't known here —
// reliably identifies our embed even if the app's name/handle changes.
const CART_DRAWER_EXTENSION_UID = "d46ffcab-9f2e-ec5e-b4ed-c977a9c580ed470f9c5f";

/** Whether the Cart drawer app embed is enabled on the shop's live theme,
 * plus a deep link to the theme editor's App embeds panel. Used to warn
 * merchants when a published cart won't actually render on the storefront. */
export async function getAppEmbedStatus(admin, shop) {
  const fallbackUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  try {
    const response = await admin.graphql(`
      query CartDrawerAppEmbed {
        themes(first: 1, roles: [MAIN]) {
          nodes {
            id
            files(filenames: ["config/settings_data.json"]) {
              nodes {
                body {
                  ... on OnlineStoreThemeFileBodyText {
                    content
                  }
                }
              }
            }
          }
        }
      }
    `);
    const { data } = await response.json();
    const theme = data?.themes?.nodes?.[0];
    if (!theme) return { enabled: false, themeEditorUrl: fallbackUrl };

    const themeId = theme.id.split("/").pop();
    const themeEditorUrl = `https://${shop}/admin/themes/${themeId}/editor?context=apps`;

    const content = theme.files?.nodes?.[0]?.body?.content;
    if (!content) return { enabled: false, themeEditorUrl };

    const blocks = JSON.parse(content)?.current?.blocks ?? {};
    const enabled = Object.values(blocks).some(
      (block) =>
        typeof block?.type === "string" &&
        block.type.includes(CART_DRAWER_EXTENSION_UID) &&
        block.disabled !== true,
    );
    return { enabled, themeEditorUrl };
  } catch {
    return { enabled: false, themeEditorUrl: fallbackUrl };
  }
}
