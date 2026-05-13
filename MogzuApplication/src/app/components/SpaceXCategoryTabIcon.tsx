type SpaceXCategoryTabIconProps = {
  src: string;
  active: boolean;
  tone?: "conference" | "coworking" | "casual" | "corporate";
};

const toneFilters: Record<NonNullable<SpaceXCategoryTabIconProps["tone"]>, string> = {
  conference:
    "brightness(0) saturate(100%) invert(34%) sepia(85%) saturate(1278%) hue-rotate(229deg) brightness(100%) contrast(95%)",
  coworking:
    "brightness(0) saturate(100%) invert(49%) sepia(97%) saturate(1867%) hue-rotate(5deg) brightness(101%) contrast(103%)",
  casual:
    "brightness(0) saturate(100%) invert(56%) sepia(90%) saturate(2109%) hue-rotate(170deg) brightness(95%) contrast(89%)",
  corporate:
    "brightness(0) saturate(100%) invert(72%) sepia(35%) saturate(1038%) hue-rotate(103deg) brightness(90%) contrast(87%)",
};

export function SpaceXCategoryTabIcon({
  src,
  active,
  tone,
}: SpaceXCategoryTabIconProps) {
  const filter = tone ? toneFilters[tone] : undefined;

  return (
    <img
      src={src}
      alt=""
      className={`h-7 w-7 max-h-7 shrink-0 object-contain transition-transform duration-200 ${
        active ? "scale-105" : ""
      }`}
      style={{ filter }}
      aria-hidden
    />
  );
}
