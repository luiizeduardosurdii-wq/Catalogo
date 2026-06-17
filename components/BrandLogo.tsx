import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  priority?: boolean;
  centered?: boolean;
};

const SIZES = {
  sm: { width: 130, height: 65, className: "h-9 w-auto max-w-[65vw] sm:h-10" },
  md: { width: 200, height: 80, className: "h-12 w-auto max-w-[80vw] sm:h-14" },
  lg: { width: 260, height: 100, className: "h-14 w-auto max-w-full sm:h-16" },
  hero: { width: 320, height: 100, className: "h-[100px] w-auto max-w-[90vw]" },
} as const;

export function BrandLogo({
  className = "",
  size = "md",
  priority = false,
  centered = false,
}: BrandLogoProps) {
  const { width, height, className: sizeClass } = SIZES[size];

  return (
    <Image
      src="/brand/saboart-logo-transparent.png"
      alt="Sabo Art da Dag — Saboaria Artesanal"
      width={width}
      height={height}
      className={`object-contain bg-transparent ${centered ? "mx-auto object-center" : "object-left"} ${sizeClass} ${className}`}
      priority={priority}
      unoptimized
    />
  );
}
