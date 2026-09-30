export interface SiteTitleConfig {
  siteName?: string;
  brand?: { logo?: string; title?: string; subtitle?: string };
  home?: { title?: { behavior?: "default" | "custom"; customTitle?: string } };
}

const DEFAULT_SITE_TITLE = "ShokaX";

function normalize(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function resolveSiteTitle(config: SiteTitleConfig): string {
  const customTitle = normalize(config.home?.title?.customTitle);
  if (config.home?.title?.behavior === "custom" && customTitle.length > 0) {
    return customTitle;
  }

  const brandParts = [
    normalize(config.brand?.logo),
    normalize(config.brand?.title),
    normalize(config.brand?.subtitle),
  ].filter((part) => part.length > 0);

  if (brandParts.length > 0) {
    return brandParts.join(" = ");
  }

  const siteName = normalize(config.siteName);
  if (siteName.length > 0) {
    return siteName;
  }

  return DEFAULT_SITE_TITLE;
}
