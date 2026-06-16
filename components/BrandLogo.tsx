import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const SIZES = {
  sm: { width: 130, height: 65, className: "h-9 w-auto max-w-[65vw] sm:h-10" },
  md: { width: 165, height: 82, className: "h-11 w-auto max-w-[72vw] sm:h-12" },
  lg: { width: 200, height: 100, className: "h-12 w-auto max-w-full sm:h-14" },
} as const;

export function BrandLogo({
  className = "",
  size = "md",
  priority = false,
}: BrandLogoProps) {
  const { width, height, className: sizeClass } = SIZES[size];

  return (
    <Image
      src="/brand/saboart-wordmark.png"
      alt="SaboArt"
      width={width}
      height={height}
      className={`object-contain object-left ${sizeClass} ${className}`}
      priority={priority}
      unoptimized
    />
  );
}
