/** Separa descrição em subtítulo e peso/tamanho (ex.: "Hidratante…, 90g"). */
export function splitProductDescription(description: string | null): {
  subtitle: string | null;
  sizeLabel: string | null;
} {
  if (!description?.trim()) {
    return { subtitle: null, sizeLabel: null };
  }

  const trimmed = description.trim();
  const commaIdx = trimmed.lastIndexOf(",");

  if (commaIdx > 0) {
    const tail = trimmed.slice(commaIdx + 1).trim();
    if (
      /^\d+\s*(?:g|ml|kg|l)\b/i.test(tail) ||
      /^pacote com \d+/i.test(tail) ||
      /^frasco \d+/i.test(tail)
    ) {
      return {
        subtitle: trimmed.slice(0, commaIdx).trim(),
        sizeLabel: tail,
      };
    }
  }

  const inline = trimmed.match(/\b(\d+\s*(?:ml|g|kg|l))\b/i);
  if (inline) {
    const withoutSize = trimmed
      .replace(inline[0], "")
      .replace(/,\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      subtitle: withoutSize || trimmed,
      sizeLabel: inline[1],
    };
  }

  return { subtitle: trimmed, sizeLabel: null };
}

const FRAGRANCE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /lavanda/i, label: "Lavanda" },
  { pattern: /floral|jasmim|jardim/i, label: "Floral" },
  { pattern: /c[ií]tric|lim[aã]o/i, label: "Cítrico" },
  { pattern: /eucalipto/i, label: "Eucalipto" },
  { pattern: /bambu/i, label: "Bambu" },
  { pattern: /linho/i, label: "Linho" },
  { pattern: /karit[eé]/i, label: "Karité" },
  { pattern: /glicerina/i, label: "Neutro / Glicerina" },
  { pattern: /infantil/i, label: "Suave / Infantil" },
  { pattern: /esfoliante/i, label: "Esfoliante" },
];

export function parseProductDetails(
  description: string | null,
  name: string
): {
  subtitle: string | null;
  sizeLabel: string | null;
  fragrance: string | null;
  ingredients: string[];
  detailsText: string | null;
} {
  const { subtitle, sizeLabel } = splitProductDescription(description);
  const combined = `${name} ${subtitle ?? ""}`;

  let fragrance: string | null = null;
  for (const { pattern, label } of FRAGRANCE_PATTERNS) {
    if (pattern.test(combined)) {
      fragrance = label;
      break;
    }
  }

  const ingredients = subtitle
    ? subtitle
        .split(/[,;]/)
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

  return {
    subtitle,
    sizeLabel,
    fragrance,
    ingredients,
    detailsText: subtitle,
  };
}
