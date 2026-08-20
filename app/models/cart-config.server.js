import { Prisma } from "@prisma/client";
import { prisma } from "../db.server";
import { DEFAULT_SETTINGS } from "../settings/defaults";

export const CART_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

/** Parses a config's settings blob, filling gaps with DEFAULT_SETTINGS so
 * callers always see the full shape even for configs saved before a
 * setting existed. */
export function parseSettings(config) {
  let saved = {};
  try {
    saved = JSON.parse(config.settings) || {};
  } catch (_error) {
    // Corrupt blob — fall back to defaults rather than crash the editor.
  }
  // Publication is now the only live-state switch. Drop this retired setting
  // from older saved carts so the next save cleans it out of the JSON blob.
  delete saved.enable_cart_drawer;
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function getCartConfigs(shop) {
  return prisma.cartConfig.findMany({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });
}

export function getCartConfig(shop, id) {
  return prisma.cartConfig.findFirst({ where: { id, shop } });
}

/** The one config the storefront should render, or null if nothing is
 * published yet. */
export function getPublishedCartConfig(shop) {
  return prisma.cartConfig.findFirst({
    where: { shop, status: CART_STATUS.PUBLISHED },
  });
}

export function createCartConfig(shop, { name = "", settings } = {}) {
  return prisma.cartConfig.create({
    data: {
      shop,
      name,
      status: CART_STATUS.DRAFT,
      settings: JSON.stringify(settings ?? DEFAULT_SETTINGS),
    },
  });
}

export async function updateCartConfig(shop, id, { name, settings }) {
  const existing = await prisma.cartConfig.findFirst({ where: { id, shop } });
  if (!existing) throw new Response("Cart not found", { status: 404 });
  return prisma.cartConfig.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(settings !== undefined ? { settings: JSON.stringify(settings) } : {}),
    },
  });
}

/** Duplicates always start as drafts so a copy can never displace the live
 * published cart by accident. */
export async function duplicateCartConfig(shop, id) {
  const source = await prisma.cartConfig.findFirst({ where: { id, shop } });
  if (!source) throw new Response("Cart not found", { status: 404 });
  const name = source.name.trim() ? `${source.name} (copy)` : "";
  return prisma.cartConfig.create({
    data: {
      shop,
      name,
      status: CART_STATUS.DRAFT,
      settings: source.settings,
    },
  });
}

export async function deleteCartConfig(shop, id) {
  const existing = await prisma.cartConfig.findFirst({ where: { id, shop } });
  if (!existing) return null;
  return prisma.cartConfig.delete({ where: { id } });
}

/** Publishing is exclusive: the transaction demotes every other config so
 * the storefront proxy always finds at most one PUBLISHED row. */
export async function publishCartConfig(shop, id) {
  const existing = await prisma.cartConfig.findFirst({ where: { id, shop } });
  if (!existing) throw new Response("Cart not found", { status: 404 });
  // Serializable, because under read-committed two concurrent publishes can
  // each demote the other's not-yet-published row and then both promote,
  // leaving two PUBLISHED configs.
  return prisma.$transaction(
    async (tx) => {
      await tx.cartConfig.updateMany({
        where: { shop, status: CART_STATUS.PUBLISHED, id: { not: id } },
        data: { status: CART_STATUS.DRAFT },
      });
      return tx.cartConfig.update({
        where: { id },
        data: { status: CART_STATUS.PUBLISHED },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function unpublishCartConfig(shop, id) {
  const existing = await prisma.cartConfig.findFirst({ where: { id, shop } });
  if (!existing) throw new Response("Cart not found", { status: 404 });
  return prisma.cartConfig.update({
    where: { id },
    data: { status: CART_STATUS.DRAFT },
  });
}
