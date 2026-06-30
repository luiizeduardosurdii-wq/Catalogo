import { CustomizationOptionType } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DEFAULT_CUSTOMIZATION_OPTIONS = [
  { type: CustomizationOptionType.FRAGRANCE, label: "Lavanda", hexColor: null, sortOrder: 1 },
  { type: CustomizationOptionType.FRAGRANCE, label: "Floral", hexColor: null, sortOrder: 2 },
  { type: CustomizationOptionType.FRAGRANCE, label: "Cítrico", hexColor: null, sortOrder: 3 },
  { type: CustomizationOptionType.FRAGRANCE, label: "Neutro", hexColor: null, sortOrder: 4 },
  { type: CustomizationOptionType.COLOR, label: "Branco", hexColor: "#FFFFFF", sortOrder: 1 },
  { type: CustomizationOptionType.COLOR, label: "Rosa claro", hexColor: "#F9A8D4", sortOrder: 2 },
  { type: CustomizationOptionType.COLOR, label: "Verde", hexColor: "#0E9F6E", sortOrder: 3 },
  { type: CustomizationOptionType.COLOR, label: "Lavanda", hexColor: "#C4B5FD", sortOrder: 4 },
] as const;

export async function ensureStoreCustomizationOptions(storeId: string) {
  const count = await prisma.customizationOption.count({ where: { storeId } });
  if (count > 0) return;

  await prisma.customizationOption.createMany({
    data: DEFAULT_CUSTOMIZATION_OPTIONS.map((option) => ({
      storeId,
      type: option.type,
      label: option.label,
      hexColor: option.hexColor,
      sortOrder: option.sortOrder,
      active: true,
    })),
  });
}
