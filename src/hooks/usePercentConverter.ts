import { useCallback } from "react";

export function usePercentConverter() {
  const toPercent = useCallback((value: number, total: number) => {
    return Number(((value / total) * 100) / 100).toFixed(3); // value of shape (width, height, x , y) -- total (width,height) of canvas elment
  }, []);

  const fromPercent = useCallback((percent: number, total: number) => {
    return (percent / 100) * total; // percent -- total canvas
  }, []);

  return { toPercent, fromPercent };
}

// get percent from pixels of fontsize
export function toPercentFontSize(fontSize: number, stageWidth: number, stageHeight: number) {
  const avg = (stageWidth + stageHeight) / 2;
  return Number(((fontSize / avg) * 100).toFixed(1));
}

// get pixels from percent of fontsize
export function fromPercentFontSize(percent: number, stageWidth: number, stageHeight: number) {
  const avg = (stageWidth + stageHeight) / 2;
  return (percent / 100) * avg;
}
