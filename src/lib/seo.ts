import { SITE_URL } from "./site";

export const SITE_NAME = "SwapYard";
export const SITE_DESCRIPTION =
  "Borrow tools, buy and sell secondhand items, and trade skills with neighbors near you in Nigeria. Chat instantly on WhatsApp.";

/** "Obio/Akpor" -> "obio-akpor", "Akwa Ibom" -> "akwa-ibom". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function placePath(state: string, city?: string): string {
  return city ? `/places/${slugify(state)}/${slugify(city)}` : `/places/${slugify(state)}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** Display name for a state: "Lagos State", "FCT (Abuja)". */
export function stateName(state: string): string {
  return state === "FCT" ? "FCT (Abuja)" : `${state} State`;
}
