import { data } from "react-router";
import { prisma } from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return data({ error: "Shop parameter required" }, { status: 400 });
  }

  try {
    const settingsRecord = await prisma.cartDrawerSettings.findUnique({
      where: { shop },
    });

    if (!settingsRecord) {
      return data({ settings: null });
    }

    const settings = JSON.parse(settingsRecord.settings);
    return data({ settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return data({ error: "Failed to fetch settings" }, { status: 500 });
  }
};
