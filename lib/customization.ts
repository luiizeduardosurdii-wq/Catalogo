export type CustomizationOptionType = "FRAGRANCE" | "COLOR";

export type CustomizationOption = {
  id: string;
  type: CustomizationOptionType;
  label: string;
  hexColor: string | null;
};

export type CartCustomization = {
  fragranceId?: string;
  fragranceLabel?: string;
  colorId?: string;
  colorLabel?: string;
};

export const SOAP_CATEGORY_SLUG = "sabonetes";

export function isSoapProduct(categorySlug: string) {
  return categorySlug === SOAP_CATEGORY_SLUG;
}

export function buildCartLineKey(
  productId: string,
  customization?: CartCustomization
) {
  return `${productId}:${customization?.fragranceId ?? "_"}:${customization?.colorId ?? "_"}`;
}

export function parseOrderOptions(
  optionsJson: string | null | undefined
): CartCustomization | null {
  if (!optionsJson) return null;
  try {
    const parsed = JSON.parse(optionsJson) as CartCustomization;
    if (!parsed.fragranceLabel && !parsed.colorLabel) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatOrderOptionsLabel(options: CartCustomization | null) {
  if (!options) return "";
  const parts: string[] = [];
  if (options.fragranceLabel) parts.push(`Fragrância: ${options.fragranceLabel}`);
  if (options.colorLabel) parts.push(`Cor: ${options.colorLabel}`);
  return parts.length > 0 ? ` (${parts.join(" · ")})` : "";
}

export function formatCartCustomizationSummary(
  customization: CartCustomization | undefined
) {
  if (!customization?.fragranceLabel && !customization?.colorLabel) return null;
  const parts: string[] = [];
  if (customization.fragranceLabel) {
    parts.push(`🌸 ${customization.fragranceLabel}`);
  }
  if (customization.colorLabel) {
    parts.push(`🎨 ${customization.colorLabel}`);
  }
  return parts.join(" · ");
}
