import { useCallback } from "react";

export function usePercentConverter() {
  const toPercent = useCallback((value: number, total: number) => {
    return Number(Number(value / total)); // value of shape (width, height, x , y) -- total (width,height) of canvas elment
  }, []);

  const fromPercent = useCallback((percent: number, total: number) => {
    return (percent / 100) * total; // percent -- total canvas
  }, []);

  return { toPercent, fromPercent };
}

// get percent from pixels of fontsize
export function toPercentFontSize(
  fontSize: number,
  stageWidth: number,
  stageHeight: number
) {
  const avg = (stageWidth + stageHeight) / 2;
  return Number(fontSize / avg);
}

// get pixels from percent of fontsize
export function fromPercentFontSize(
  percent: number,
  stageWidth: number,
  stageHeight: number
) {
  const avg = (stageWidth + stageHeight) / 2;
  return (percent / 100) * avg;
}
