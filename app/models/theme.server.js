// Shopify persists app embeds as
// shopify://apps/<app-handle>/blocks/<block-handle>/<extension-version-id>.
// The version id changes when a theme extension is deployed, whereas the app
// and block handles remain stable. Match the durable portion of that type.
const CART_DRAWER_EXTENSION_UID = "d46ffcab-9f2e-ec5e-b4ed-c977a9c580ed470f9c5f";
const CART_DRAWER_BLOCK_TYPE_PREFIX =
  "shopify://apps/magyx-cart-drawer/blocks/cart-drawer/";

// Shopify's settings_data.json is JSONC: it can begin with a block comment.
// JSON.parse rejects that valid theme file format, which previously made the
// status check fall through to "off" even when the embed was enabled.
function parseThemeSettings(content) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      result += character;
    } else if (character === "/" && nextCharacter === "/") {
      index += 1;
      while (index + 1 < content.length && content[index + 1] !== "\n") {
        index += 1;
      }
    } else if (character === "/" && nextCharacter === "*") {
      index += 1;
      while (
        index + 1 < content.length &&
        !(content[index] === "*" && content[index + 1] === "/")
      ) {
        index += 1;
      }
      index += 1;
    } else {
      result += character;
    }
  }

  return JSON.parse(result.replace(/^\uFEFF/, ""));
}

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

    const blocks = parseThemeSettings(content)?.current?.blocks ?? {};
    const enabled = Object.values(blocks).some(
      (block) =>
        typeof block?.type === "string" &&
        (block.type.startsWith(CART_DRAWER_BLOCK_TYPE_PREFIX) ||
          block.type.includes(CART_DRAWER_EXTENSION_UID)) &&
        block.disabled !== true,
    );
    return { enabled, themeEditorUrl };
  } catch {
    return { enabled: false, themeEditorUrl: fallbackUrl };
  }
}
