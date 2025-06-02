import { type CanvasElement } from "../features/canvas/types";

export function rescaleElementsForAspectRatio(
  elements: CanvasElement[],
  oldStage: { width: number; height: number },
  newStage: { width: number; height: number }
): CanvasElement[] {
  const xScale = newStage.width / oldStage.width;
  const yScale = newStage.height / oldStage.height;

  return elements.map((el) => {
    const updated: Partial<CanvasElement> = {
      x: el.x * xScale,
      y: el.y * yScale,
    };

    // لو عنده width و height
    if (el.width !== undefined && el.height !== undefined) {
      updated.width = el.width * xScale;
      updated.height = el.height * yScale;
    }

    // لو عنده scaleX و scaleY
    if ('scaleX' in el && 'scaleY' in el) {
      updated.scaleX = (el.scaleX ?? 1) * xScale;
      updated.scaleY = (el.scaleY ?? 1) * yScale;
    }

    // لو عنده radius (زي Circle)
    if ('radius' in el && el.radius !== undefined) {
      const avgScale = (xScale + yScale) / 2;
      updated.radius = el.radius * avgScale;
    }

    // لو Text عنده fontSize
    if (el.type === 'text' && el.fontSize !== undefined) {
      const avgScale = (xScale + yScale) / 2;
      updated.fontSize = el.fontSize * avgScale;
    }

    return { ...el, ...updated };
  });
}
