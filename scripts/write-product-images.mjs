import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "products");
mkdirSync(outDir, { recursive: true });

function svg(label, emoji, bg, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg}"/>
      <stop offset="100%" style="stop-color:${accent}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="20" fill="url(#g)"/>
  <circle cx="100" cy="78" r="52" fill="rgba(255,255,255,0.2)"/>
  <text x="100" y="92" text-anchor="middle" font-size="52">${emoji}</text>
  <text x="100" y="155" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#fff">${label}</text>
</svg>`;
}

const images = [
  ["alfajor", "Alfajor", "🍫", "#a16207", "#ca8a04"],
  ["torrone", "Torrone", "🍬", "#b45309", "#d97706"],
  ["brigadeiro", "Brigadeiro", "🧁", "#9d174d", "#db2777"],
  ["panettone", "Panettone", "🎂", "#c2410c", "#ea580c"],
  ["doce-leite", "Doce de leite", "🥛", "#92400e", "#b45309"],
  ["vinho-tinto", "Vinho tinto", "🍷", "#7f1d1d", "#991b1b"],
  ["vinho-branco", "Vinho branco", "🥂", "#ca8a04", "#eab308"],
  ["whisky", "Whisky", "🥃", "#78350f", "#92400e"],
  ["gin", "Gin", "🍸", "#0f766e", "#14b8a6"],
  ["vodka", "Vodka", "🧊", "#475569", "#64748b"],
  ["cachaca", "Cachaça", "🌿", "#166534", "#22c55e"],
  ["rum", "Rum", "🍹", "#9a3412", "#c2410c"],
  ["espumante", "Espumante", "🍾", "#fbbf24", "#f59e0b"],
  ["vape", "Pod Vape", "💨", "#4c1d95", "#7c3aed"],
  ["celular", "Celular", "📱", "#1e3a8a", "#2563eb"],
  ["tablet", "Tablet", "📲", "#312e81", "#4f46e5"],
  ["iphone", "iPhone", "📱", "#18181b", "#3f3f46"],
  ["samsung", "Galaxy", "📱", "#0c4a6e", "#0284c7"],
];

for (const [file, label, emoji, bg, accent] of images) {
  writeFileSync(join(outDir, `${file}.svg`), svg(label, emoji, bg, accent));
}

console.log(`Geradas ${images.length} imagens em public/products/`);
