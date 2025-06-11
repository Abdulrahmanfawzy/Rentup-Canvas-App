import { useAppSelector } from "./useRedux";
import type { BrandingType } from "@/features/canvas/types";

export function useBrandingResolver() {
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);

  const resolveColor = (color: string, brandingType?: BrandingType): string => {
    if (!brandingType || brandingType === "fixed") {
      return color;
    }

    return brandingColors[brandingType] || color;
  };

  const resolveFont = (font: string, brandingType?: BrandingType): string => {
    if (!brandingType || brandingType === "fixed") {
      return font;
    }

    const resolved = brandingFonts[brandingType];
    return resolved?.value || font;
  };

  return { resolveColor, resolveFont };
}
