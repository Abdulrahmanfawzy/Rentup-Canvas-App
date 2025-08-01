import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Rect,
  Text,
  Image as KonvaImage,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Star,
  Wedge,
  Ring,
  Group,
  Transformer,
  Image,
} from "react-konva";
import type {
  CanvasElementUnion,
  CanvasTextElement,
  RectangleShape,
  CircleShape,
  EllipseShape,
  LineShape,
  TriangleShape,
  StarShape,
  WedgeShape,
  RingShape,
  CanvasElement,
  BrandingType,
} from "../../features/canvas/types";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Html } from "react-konva-utils";
import Konva from "konva";
import {
  toPercentFontSize,
  usePercentConverter,
} from "@/hooks/usePercentConverter";
import { useBrandingResolver } from "@/hooks/useBrandingResolver";

type GuideLineType = {
  points: number[];
};

interface Props {
  element: CanvasElementUnion;
  isSelected: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent>, id?: string) => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
  stageWidth: number;
  stageHeight: number;
  setGuides: (guides: GuideLineType[]) => void;
  stageRef: React.RefObject<Konva.Stage>; // ✅ ضيف دي
}

interface RootState {
  canvas: {
    elements: CanvasElement[];
  };
}

type GuideLine = {
  points: number[];
  text?: string;
  textPosition?: { x: number; y: number };
};

// const calculateSnappingPosition = (
//   node: Konva.Node,
//   elements: CanvasElement[],
//   currentElement: CanvasElement,
//   snapThreshold: number,
//   offsetX: number, // e.g., width/2 for Rectangle, radius for Circle
//   offsetY: number // e.g., height/2 for Rectangle, radius for Circle
// ): { newX: number; newY: number } => {
//   const shapeRect = node.getClientRect();
//   let newX = node.x();
//   let newY = node.y();

//   // Snapping to other shapes
//   elements.forEach((otherElement) => {
//     if (
//       otherElement.id === currentElement.id ||
//       !(otherElement.visible ?? true)
//     )
//       return;

//     const otherRect = {
//       x: otherElement.x - otherElement.width / 2,
//       y: otherElement.y - otherElement.height / 2,
//       width: otherElement.width,
//       height: otherElement.height,
//     };

//     // Horizontal alignment
//     const currentEdgesY = [
//       shapeRect.y, // Top
//       shapeRect.y + shapeRect.height / 2, // Center
//       shapeRect.y + shapeRect.height, // Bottom
//     ];
//     const otherEdgesY = [
//       otherRect.y, // Top
//       otherRect.y + otherRect.height / 2, // Center
//       otherRect.y + otherRect.height, // Bottom
//     ];

//     currentEdgesY.forEach((currentY) => {
//       otherEdgesY.forEach((otherY) => {
//         if (Math.abs(currentY - otherY) < snapThreshold) {
//           newY = otherY + offsetY - (currentY - shapeRect.y);
//         }
//       });
//     });

//     // Vertical alignment
//     const currentEdgesX = [
//       shapeRect.x, // Left
//       shapeRect.x + shapeRect.width / 2, // Center
//       shapeRect.x + shapeRect.width, // Right
//     ];
//     const otherEdgesX = [
//       otherRect.x, // Left
//       otherRect.x + otherRect.width / 2, // Center
//       otherRect.x + otherRect.width, // Right
//     ];

//     currentEdgesX.forEach((currentX) => {
//       otherEdgesX.forEach((otherX) => {
//         if (Math.abs(currentX - otherX) < snapThreshold) {
//           newX = otherX + offsetX - (currentX - shapeRect.x);
//         }
//       });
//     });
//   });

//   return { newX, newY };
// };

// Utility function to load Google Fonts dynamically

const calculateSnappingPosition = (
  node: Konva.Node,
  elements: CanvasElement[],
  currentElement: CanvasElement,
  snapThreshold: number,
  offsetX: number,
  offsetY: number
): { newX: number; newY: number } => {
  const shapeRect = node.getClientRect();
  let newX = node.x();
  let newY = node.y();
  let minDistanceX = snapThreshold + 1;
  let minDistanceY = snapThreshold + 1;

  elements.forEach((otherElement) => {
    if (otherElement.id === currentElement.id || !(otherElement.visible ?? true)) return;

    const otherRect = {
      x: otherElement.x - otherElement.width / 2,
      y: otherElement.y - otherElement.height / 2,
      width: otherElement.width,
      height: otherElement.height,
    };

    // Horizontal alignment
    const currentEdgesY = [
      shapeRect.y,
      shapeRect.y + shapeRect.height / 2,
      shapeRect.y + shapeRect.height,
    ];
    const otherEdgesY = [
      otherRect.y,
      otherRect.y + otherRect.height / 2,
      otherRect.y + otherRect.height,
    ];

    currentEdgesY.forEach((currentY) => {
      otherEdgesY.forEach((otherY) => {
        const distance = Math.abs(currentY - otherY);
        if (distance < snapThreshold && distance < minDistanceY) {
          minDistanceY = distance;
          newY = otherY + offsetY - (currentY - shapeRect.y);
        }
      });
    });

    // Vertical alignment
    const currentEdgesX = [
      shapeRect.x,
      shapeRect.x + shapeRect.width / 2,
      shapeRect.x + shapeRect.width,
    ];
    const otherEdgesX = [
      otherRect.x,
      otherRect.x + otherRect.width / 2,
      otherRect.x + otherRect.width,
    ];

    currentEdgesX.forEach((currentX) => {
      otherEdgesX.forEach((otherX) => {
        const distance = Math.abs(currentX - otherX);
        if (distance < snapThreshold && distance < minDistanceX) {
          minDistanceX = distance;
          newX = otherX + offsetX - (currentX - shapeRect.x);
        }
      });
    });
  });

  return { newX, newY };
};

const loadGoogleFont = (fontFamily: string) => {
  // Check if font is already loaded to avoid duplicates
  if (
    document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, "+")}"]`)
  ) {
    return;
  }

  // Create link element to load the font
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
    /\s+/g,
    "+"
  )}:wght@400;700&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  (
    { element, onSelect, onChange, stageWidth, stageHeight, setGuides , stageRef },
    ref
  ) => {
    const elements = useSelector((store: any) => store.canvas.elements);
    const dispatch = useAppDispatch();
    const snapThreshold = 2;
    const { toPercent } = usePercentConverter();
    const { resolveColor, resolveFont } = useBrandingResolver();
    const brandingFamilies = useSelector(
      (state: any) => state.branding.fontFamilies
    ); // Added to check isFile

    const isBrandingType = (value: any): value is BrandingType => {
      return value === "fixed" || value === "dynamic";
    };

    const getBrandedFill = (element: CanvasElement) => {
      const brandingType = isBrandingType(element.fillBrandingType)
        ? element.fillBrandingType
        : undefined;

      return resolveColor(element.fill, brandingType);
    };

    const getBrandedFillText = (element: CanvasTextElement) => {
      const brandingType = isBrandingType(element.fillBrandingType)
        ? element.fillBrandingType
        : undefined;

      return resolveColor(element.background ?? "#fff", brandingType);
    };

    const getBrandedStroke = (element: CanvasElement) => {
      const brandingType = isBrandingType(element.strokeBrandingType)
        ? element.strokeBrandingType
        : undefined;

      return resolveColor(element.stroke || "#000000", brandingType);
    };

    const drawGuidelines = (node: Konva.Node) => {
      const nodeBox = node.getClientRect();
      const nodeCenterX = nodeBox.x + nodeBox.width / 2;
      const nodeCenterY = nodeBox.y + nodeBox.height / 2;

      const canvasCenterX = stageWidth / 2;
      const canvasCenterY = stageHeight / 2;
      const threshold = 4;

      const newGuides: GuideLine[] = [];

      elements.forEach((el: CanvasElement) => {
        if (el.id === element.id) return;

        const otherNode = stageRef.current?.findOne(`#${el.id}`);
        if (!otherNode) return;

        const otherBox = otherNode.getClientRect();
        const otherCenterX = otherBox.x + otherBox.width / 2;
        const otherCenterY = otherBox.y + otherBox.height / 2;

        // Left
        const leftDiff = Math.abs(nodeBox.x - otherBox.x);
        if (leftDiff < threshold) {
          newGuides.push({
            points: [otherBox.x, 0, otherBox.x, stageHeight],
            text: `${leftDiff.toFixed(0)}px`,
            textPosition: { x: otherBox.x + 5, y: 10 },
          });
        }

        // Right
        const rightDiff = Math.abs(nodeBox.x + nodeBox.width - (otherBox.x + otherBox.width));
        if (rightDiff < threshold) {
          const x = otherBox.x + otherBox.width;
          newGuides.push({
            points: [x, 0, x, stageHeight],
            text: `${rightDiff.toFixed(0)}px`,
            textPosition: { x: x + 5, y: 10 },
          });
        }

        // Top
        const topDiff = Math.abs(nodeBox.y - otherBox.y);
        if (topDiff < threshold) {
          newGuides.push({
            points: [0, otherBox.y, stageWidth, otherBox.y],
            text: `${topDiff.toFixed(0)}px`,
            textPosition: { x: 10, y: otherBox.y + 5 },
          });
        }

        // Bottom
        const bottomDiff = Math.abs(nodeBox.y + nodeBox.height - (otherBox.y + otherBox.height));
        if (bottomDiff < threshold) {
          const y = otherBox.y + otherBox.height;
          newGuides.push({
            points: [0, y, stageWidth, y],
            text: `${bottomDiff.toFixed(0)}px`,
            textPosition: { x: 10, y: y + 5 },
          });
        }

        // Top to Bottom
        const topToBottomDiff = Math.abs(nodeBox.y - (otherBox.y + otherBox.height));
        if (topToBottomDiff < threshold) {
          const y = otherBox.y + otherBox.height;
          newGuides.push({
            points: [0, y, stageWidth, y],
            text: `${topToBottomDiff.toFixed(0)}px`,
            textPosition: { x: 10, y: y + 5 },
          });
        }

        // Bottom to Top
        const bottomToTopDiff = Math.abs(nodeBox.y + nodeBox.height - otherBox.y);
        if (bottomToTopDiff < threshold) {
          const y = otherBox.y;
          newGuides.push({
            points: [0, y, stageWidth, y],
            text: `${bottomToTopDiff.toFixed(0)}px`,
            textPosition: { x: 10, y: y + 5 },
          });
        }

        // Left to Right
        const leftToRightDiff = Math.abs(nodeBox.x - (otherBox.x + otherBox.width));
        if (leftToRightDiff < threshold) {
          const x = otherBox.x + otherBox.width;
          newGuides.push({
            points: [x, 0, x, stageHeight],
            text: `${leftToRightDiff.toFixed(0)}px`,
            textPosition: { x: x + 5, y: nodeBox.y + 10 },
          });
        }

        // Right to Left
        const rightToLeftDiff = Math.abs(nodeBox.x + nodeBox.width - otherBox.x);
        if (rightToLeftDiff < threshold) {
          const x = otherBox.x;
          newGuides.push({
            points: [x, 0, x, stageHeight],
            text: `${rightToLeftDiff.toFixed(0)}px`,
            textPosition: { x: x + 5, y: nodeBox.y + 10 },
          });
        }

        // Center X to Center X
        const centerToCenterXDiff = Math.abs(nodeCenterX - otherCenterX);
        if (centerToCenterXDiff < threshold) {
          newGuides.push({
            points: [otherCenterX, 0, otherCenterX, stageHeight],
            text: `${centerToCenterXDiff.toFixed(0)}px`,
            textPosition: { x: otherCenterX + 5, y: nodeBox.y + 10 },
          });
        }

        // Center Y to Center Y
        const centerToCenterYDiff = Math.abs(nodeCenterY - otherCenterY);
        if (centerToCenterYDiff < threshold) {
          newGuides.push({
            points: [0, otherCenterY, stageWidth, otherCenterY],
            text: `${centerToCenterYDiff.toFixed(0)}px`,
            textPosition: { x: nodeBox.x + 10, y: otherCenterY + 5 },
          });
        }

        // Center X to Left
        const centerXToLeftDiff = Math.abs(nodeCenterX - otherBox.x);
        if (centerXToLeftDiff < threshold) {
          newGuides.push({
            points: [otherBox.x, 0, otherBox.x, stageHeight],
            text: `${centerXToLeftDiff.toFixed(0)}px`,
            textPosition: { x: otherBox.x + 5, y: nodeBox.y + 10 },
          });
        }

        // Center X to Right
        const centerXToRightDiff = Math.abs(nodeCenterX - (otherBox.x + otherBox.width));
        if (centerXToRightDiff < threshold) {
          const x = otherBox.x + otherBox.width;
          newGuides.push({
            points: [x, 0, x, stageHeight],
            text: `${centerXToRightDiff.toFixed(0)}px`,
            textPosition: { x: x + 5, y: nodeBox.y + 10 },
          });
        }

        // Center Y to Top
        const centerYToTopDiff = Math.abs(nodeCenterY - otherBox.y);
        if (centerYToTopDiff < threshold) {
          newGuides.push({
            points: [0, otherBox.y, stageWidth, otherBox.y],
            text: `${centerYToTopDiff.toFixed(0)}px`,
            textPosition: { x: nodeBox.x + 10, y: otherBox.y + 5 },
          });
        }

        // Center Y to Bottom
        const centerYToBottomDiff = Math.abs(nodeCenterY - (otherBox.y + otherBox.height));
        if (centerYToBottomDiff < threshold) {
          const y = otherBox.y + otherBox.height;
          newGuides.push({
            points: [0, y, stageWidth, y],
            text: `${centerYToBottomDiff.toFixed(0)}px`,
            textPosition: { x: nodeBox.x + 10, y: y + 5 },
          });
        }

        // Top inside center of another
        const topInCenterDiff = Math.abs(otherCenterY - nodeBox.y);
        if (topInCenterDiff < threshold) {
          newGuides.push({
            points: [0, nodeBox.y, stageWidth, nodeBox.y],
            text: `${topInCenterDiff.toFixed(0)}px`,
            textPosition: { x: nodeBox.x + 10, y: nodeBox.y + 5 },
          });
        }

        // Bottom inside center of another
        const bottomInCenterDiff = Math.abs(otherCenterY - (nodeBox.y + nodeBox.height));
        if (bottomInCenterDiff < threshold) {
          const y = nodeBox.y + nodeBox.height;
          newGuides.push({
            points: [0, y, stageWidth, y],
            text: `${bottomInCenterDiff.toFixed(0)}px`,
            textPosition: { x: nodeBox.x + 10, y: y + 5 },
          });
        }
      });

      // Center X of canvas
      const centerXDiff = Math.abs(nodeCenterX - canvasCenterX);
      if (centerXDiff < threshold) {
        newGuides.push({
          points: [canvasCenterX, 0, canvasCenterX, stageHeight],
          text: `${Math.round(centerXDiff)}px`,
          textPosition: {
            x: canvasCenterX + 10,
            y: nodeBox.y + nodeBox.height / 2 - 30,
          },
        });
      }

      // Center Y of canvas
      const centerYDiff = Math.abs(nodeCenterY - canvasCenterY);
      if (centerYDiff < threshold) {
        newGuides.push({
          points: [0, canvasCenterY, stageWidth, canvasCenterY],
          text: `${Math.round(centerYDiff)}px`,
          textPosition: {
            x: nodeBox.x + nodeBox.width / 2 + 10,
            y: canvasCenterY + 20,
          },
        });
      }

      setGuides(newGuides);
    };

    switch (element.type) {
      
      case "text": {
      const textElement = element as CanvasTextElement;
      const refText = useRef<Konva.Text>(null);
      const refGroup = useRef<Konva.Group>(null);
      const trRef = useRef<Konva.Transformer>(null);

      const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
      const [isEditing, setIsEditing] = useState(false);
      const [editableText, setEditableText] = useState(textElement.text);

      const isSelected = useSelector((state: RootState) =>
        state.canvas.elements.find((el) => el.id === textElement.id)?.selected
      );
      const textAlign = useSelector((state: any) =>
        state.canvas.elements.find((el: any) => el.id === textElement.id)?.align || "left"
      );
      const fontWeight = useSelector(
        (state: RootState) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.fontWeight || "normal"
      );
      const fontStyle = useSelector(
        (state: RootState) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.fontStyle || "normal"
      );

      const brandingType = ["fixed", "dynamic"].includes(textElement.fontBrandingType || "")
        ? textElement.fontBrandingType
        : undefined;

      const resolvedFont = resolveFont(textElement.fontFamily || "", brandingType);

      useEffect(() => {
        const fontData = brandingFamilies[textElement.fontBrandingType || ""] || { isFile: false };
        if (!fontData.isFile && resolvedFont.value) {
          loadGoogleFont(resolvedFont.value);
        }
      }, [resolvedFont.value, textElement.fontBrandingType, brandingFamilies]);

      const borderRadius = textElement.borderRadius || {};
      const textCornerRadius = [
        borderRadius.topLeft || 0,
        borderRadius.topRight || 0,
        borderRadius.bottomRight || 0,
        borderRadius.bottomLeft || 0,
      ];

      useEffect(() => {
        if (refText.current) {
          const fontStyleFinal =
            fontWeight === "bold"
              ? fontStyle === "italic"
                ? "bold italic"
                : "bold"
              : fontStyle;

          refText.current.fontStyle(fontStyleFinal);
          refText.current.width(textElement.width || 100);
          refText.current._setTextData();
          const box = refText.current.getClientRect({ skipTransform: true });
          setBgSize({ width: box.width, height: box.height });

          if (textElement.id !== undefined) {
            dispatch(
              updateElement({
                id: String(textElement.id),
                updates: {
                  width: box.width,
                  height: box.height,
                },
              })
            );
          }

          refText.current.getLayer()?.batchDraw();
        }
      }, [
        textElement?.text,
        textElement?.fontSize,
        textElement?.fontFamily,
        textElement?.fontBrandingType,
        textElement?.padding,
        textAlign,
        fontWeight,
        fontStyle,
        dispatch,
      ]);

      useEffect(() => {
        if (isSelected && refGroup.current && trRef.current && !isEditing) {
          trRef.current.nodes([refGroup.current]);
          trRef.current.getLayer()?.batchDraw();
        }
      }, [isSelected, isEditing]);

      const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableText(e.target.value);
        if (refText.current) {
          refText.current.text(e.target.value);
          refText.current.width(textElement.width || 100);
          refText.current._setTextData();
          const box = refText.current.getClientRect({ skipTransform: true });
          setBgSize({ width: box.width, height: box.height });
        }
      };

      return (
        <>
          {(element.visible ?? true) && (
            <Group
              ref={refGroup}
              id={textElement.id?.toString()}
              x={textElement.x}
              y={textElement.y}
              rotation={textElement.rotation}
              draggable
              onClick={(e) => onSelect?.(e, textElement.id as string)}
              onDblClick={() => setIsEditing(true)}
              onDragMove={(e) => {
              const node = e.target as Konva.Group;

              // تحديث مكان الـ Text بدون Snapping
              dispatch(
                updateElement({
                  id: textElement.id,
                  updates: {
                    x: node.x(),
                    y: node.y(),
                    width_percent: toPercent(bgSize.width, stageWidth),
                    height_percent: toPercent(bgSize.height, stageHeight),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
                    fontSize_percent: toPercentFontSize(
                      Number(textElement.fontSize),
                      stageWidth,
                      stageHeight
                    ),
                  },
                })
              );

              drawGuidelines(node);
            }}

              onDragEnd={() => setGuides([])}
              onTransform={() => {
                const group = refGroup.current;
                const text = refText.current;
                if (!group || !text) return;

                const newWidth = Math.max(30, text.width() * group.scaleX());
                text.width(newWidth);
                group.scaleX(1);
                group.scaleY(1);
                text._setTextData();
                const box = text.getClientRect({ skipTransform: true });
                setBgSize({ width: newWidth, height: box.height });
              }}
              onTransformEnd={() => {
                const group = refGroup.current;
                const text = refText.current;
                if (!group || !text) return;

                const newWidth = text.width();
                text._setTextData();
                const box = text.getClientRect({ skipTransform: true });

                dispatch(
                  updateElement({
                    id: textElement.id,
                    updates: {
                      x: group.x(),
                      y: group.y(),
                      width: newWidth,
                      height: box.height,
                      align: textAlign,
                      width_percent: toPercent(newWidth, stageWidth),
                      height_percent: toPercent(box.height, stageHeight),
                      x_percent: toPercent(group.x(), stageWidth),
                      y_percent: toPercent(group.y(), stageHeight),
                      fontSize_percent: toPercentFontSize(
                        Number(textElement.fontSize),
                        stageWidth,
                        stageHeight
                      ),
                    },
                  })
                );

                group.scaleX(1);
                group.scaleY(1);
              }}
            >
              {textElement.background && (
                <Rect
                  x={-(textElement.padding || 0)}
                  y={-(textElement.padding || 0)}
                  width={bgSize.width + (textElement.padding || 0) * 2}
                  height={bgSize.height + (textElement.padding || 0) * 2}
                  fill={getBrandedFillText(textElement)}
                  opacity={textElement.opacity}
                  cornerRadius={textCornerRadius}
                />
              )}
              <Text
                ref={refText}
                id={textElement.id?.toString()}
                x={0}
                y={0}
                text={editableText}
                fill={textElement.fill || "#000"}
                stroke={textElement.stroke}
                padding={textElement.padding}
                fontSize={textElement.fontSize}
                fontFamily={resolvedFont.value}
                fontStyle={resolvedFont.variant || "normal"}
                opacity={textElement.opacity}
                verticalAlign="middle"
                align={textAlign}
                width={textElement.width || 100}
                wrap="word"
              />
            </Group>
          )}
          {isSelected && !isEditing && (
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              enabledAnchors={["middle-left", "middle-right"]}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 30 ? oldBox : newBox)}
              onClick={(e) => (e.cancelBubble = true)}
            />
          )}
          {isEditing && (
            <Html>
              <textarea
                style={{
                  position: "absolute",
                  top: textElement.y,
                  left: textElement.x,
                  width: textElement.width || 100,
                  height: bgSize.height,
                  fontSize: textElement.fontSize,
                  fontFamily: resolvedFont.value || "Arial",
                  fontWeight: /bold|700|800|900/.test(resolvedFont.variant || "")
                    ? "bold"
                    : "normal",
                  fontStyle: /italic/.test(resolvedFont.variant || "") ? "italic" : "normal",
                  padding: textElement.padding || 0,
                  color: textElement.fill,
                  background: "white",
                  border: "1px dashed #ccc",
                  resize: "none",
                  outline: "none",
                  overflow: "hidden",
                  lineHeight: "1",
                  textAlign: textAlign,
                }}
                value={editableText}
                onChange={handleTextChange}
                onBlur={() => {
                  setIsEditing(false);
                  dispatch(
                    updateElement({
                      id: String(textElement.id),
                      updates: {
                        text: editableText,
                        width: bgSize.width,
                        height: bgSize.height,
                        align: textAlign,
                      },
                    })
                  );
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setIsEditing(false);
                    dispatch(
                      updateElement({
                        id: String(textElement.id),
                        updates: {
                          text: editableText,
                          width: bgSize.width,
                          height: bgSize.height,
                          align: textAlign,
                        },
                      })
                    );
                  }
                }}
                autoFocus
              />
            </Html>
          )}
        </>
      );
      }

      // case "frame": {
      //   const imageInFrame = (elements as CanvasElement[]).find(
      //     (el) => el.type === "image" && el.frameId === element.id
      //   );

      //   // If there's an image, skip rendering the frame here as it will be rendered in the image case
      //   if (imageInFrame) {
      //     return null;
      //   }

      //   // Render standalone frame
      //   return (
      //     <>
      //       {(element.visible ?? true) && (
      //         <Rect
      //           ref={ref}
      //           x={element.x}
      //           y={element.y}
      //           width={element.width}
      //           height={element.height}
      //           fill={element.fill}
      //           dash={[4, 4]}
      //           stroke={element.stroke}
      //           strokeWidth={element.strokeWidth}
      //           rotation={element.rotation}
      //           draggable
      //           onClick={onSelect}
      //           onDragMove={(e) => {
      //             const node = e.target;
      //             const newX = node.x();
      //             const newY = node.y();

      //             dispatch(
      //               updateElement({
      //                 id: element.id,
      //                 updates: {
      //                   x: newX,
      //                   y: newY,
      //                   width_percent: toPercent(element.width, stageWidth),
      //                   height_percent: toPercent(element.height, stageHeight),
      //                   x_percent: toPercent(newX, stageWidth),
      //                   y_percent: toPercent(newY, stageHeight),
      //                 },
      //               })
      //             );
      //           }}
      //           onTransform={(e) => {
      //             const node = e.target;
      //             const newWidth = node.width() * node.scaleX();
      //             const newHeight = node.height() * node.scaleY();
      //             const newX = node.x();
      //             const newY = node.y();

      //             dispatch(
      //               updateElement({
      //                 id: element.id,
      //                 updates: {
      //                   x: newX,
      //                   y: newY,
      //                   width: newWidth,
      //                   height: newHeight,
      //                   rotation: node.rotation(),
      //                   width_percent: toPercent(newWidth, stageWidth),
      //                   height_percent: toPercent(newHeight, stageHeight),
      //                   x_percent: toPercent(newX, stageWidth),
      //                   y_percent: toPercent(newY, stageHeight),
      //                 },
      //               })
      //             );

      //             node.scaleX(1);
      //             node.scaleY(1);
      //           }}
      //         />
      //       )}
      //     </>
      //   );
      // }

      case "frame": {
        const imageInFrame = (elements as CanvasElement[]).find(
          (el) => el.type === "image" && el.frameId === element.id
        );

        // لو في صورة جوه الفريم، متعرضوش لأن الصورة هتتعرض جوه
        if (imageInFrame) {
          return null;
        }

        return (
          <>
            {(element.visible ?? true) && (
              <Rect
                ref={ref}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                dash={[4, 4]}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                rotation={element.rotation}
                draggable
                onClick={onSelect}
                onDragMove={(e) => {
                  const node = e.target;
                  const newX = node.x();
                  const newY = node.y();

                  drawGuidelines(node);

                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        x: newX,
                        y: newY,
                        width_percent: toPercent(element.width, stageWidth),
                        height_percent: toPercent(element.height, stageHeight),
                        x_percent: toPercent(newX, stageWidth),
                        y_percent: toPercent(newY, stageHeight),
                      },
                    })
                  );
                }}
                onDragEnd={() => {
                  setGuides([]);
                }}
                onTransform={(e) => {
                  const node = e.target;
                  const newWidth = node.width() * node.scaleX();
                  const newHeight = node.height() * node.scaleY();
                  const newX = node.x();
                  const newY = node.y();

                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                        rotation: node.rotation(),
                        width_percent: toPercent(newWidth, stageWidth),
                        height_percent: toPercent(newHeight, stageHeight),
                        x_percent: toPercent(newX, stageWidth),
                        y_percent: toPercent(newY, stageHeight),
                      },
                    })
                  );

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            )}
          </>
        );
      }


      case "image": {
        const [image] = useImage(element.src || "");
        const frame = elements.find(
          (f: CanvasElement) => f.id === element.frameId
        );
        const wasOverFrameRef = useRef(false);
        const [currentFitMode] = useState(
          element.fitMode || "fill"
        );
        const isDraggingImageRef = useRef(false);
        const [isMovable, setIsMovable] = useState(false);

        if (frame) {
          const borderRadius = frame.borderRadiusSpecial || 0;
          return (
            <Group
              x={frame.x}
              y={frame.y}
              draggable
              onDragMove={(e) => {
                const node = e.target;
                const newX = node.x();
                const newY = node.y();
                drawGuidelines(node);

                dispatch(
                  updateElement({
                    id: frame.id,
                    updates: {
                      x: newX,
                      y: newY,
                      width_percent: toPercent(frame.width, stageWidth),
                      height_percent: toPercent(frame.height, stageHeight),
                      x_percent: toPercent(newX, stageWidth),
                      y_percent: toPercent(newY, stageHeight),
                    },
                  })
                );

                const offsetX = (frame.width - element.width) / 2;
                const offsetY = (frame.height - element.height) / 2;
                onChange({
                  x: newX + offsetX,
                  y: newY + offsetY,
                  width: element.width,
                  height: element.height,
                  frameId: frame.id,
                  fitMode: currentFitMode,
                  width_percent: toPercent(element.width, stageWidth),
                  height_percent: toPercent(element.height, stageHeight),
                  x_percent: toPercent(newX + offsetX, stageWidth),
                  y_percent: toPercent(newY + offsetY, stageHeight),
                });
              }}
              onClick={() => {
                if (onSelect) {
                  onSelect();
                }
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
            >
              <Rect
                x={0}
                y={0}
                width={frame.width}
                height={frame.height}
                // stroke="black"
                strokeWidth={2}
                fill="transparent"
                cornerRadius={borderRadius} // Apply border radius to frame border
              />
              <Group
                clipFunc={(ctx) => {
                  // Create a rounded rectangle for clipping
                  const r = borderRadius;
                  const width = frame.width;
                  const height = frame.height;
                  ctx.beginPath();
                  ctx.moveTo(r, 0);
                  ctx.lineTo(width - r, 0);
                  ctx.quadraticCurveTo(width, 0, width, r);
                  ctx.lineTo(width, height - r);
                  ctx.quadraticCurveTo(width, height, width - r, height);
                  ctx.lineTo(r, height);
                  ctx.quadraticCurveTo(0, height, 0, height - r);
                  ctx.lineTo(0, r);
                  ctx.quadraticCurveTo(0, 0, r, 0);
                  ctx.closePath();
                }}
              >
                <KonvaImage
                  ref={ref}
                  image={image}
                  x={element.x - frame.x}
                  y={element.y - frame.y}
                  width={element.width}
                  height={element.height}
                  draggable={isMovable}
                  onClick={() => {
                    if (onSelect) {
                      onSelect();
                    }
                  }}
                  onDblClick={() => {
                    setIsMovable((prev) => !prev);
                  }}
                  onDragStart={() => {
                    isDraggingImageRef.current = true;
                  }}
                  onDragMove={(e) => {
                    if (!isDraggingImageRef.current || !isMovable) return;

                    const imageNode = e.target;
                    let newX = imageNode.x();
                    let newY = imageNode.y();

                    const minX = -(element.width - frame.width) / 2;
                    const maxX = (element.width - frame.width) / 2;
                    const minY = -(element.height - frame.height) / 2;
                    const maxY = (element.height - frame.height) / 2;

                    newX = Math.max(minX, Math.min(maxX, newX));
                    newY = Math.max(minY, Math.min(maxY, newY));

                    const newFrameX = frame.x + newX - (element.x - frame.x);
                    const newFrameY = frame.y + newY - (element.y - frame.y);

                    dispatch(
                      updateElement({
                        id: frame.id,
                        updates: {
                          x: newFrameX,
                          y: newFrameY,
                          width_percent: toPercent(frame.width, stageWidth),
                          height_percent: toPercent(frame.height, stageHeight),
                          x_percent: toPercent(newFrameX, stageWidth),
                          y_percent: toPercent(newFrameY, stageHeight),
                        },
                      })
                    );

                    onChange({
                      x: newFrameX + newX,
                      y: newFrameY + newY,
                      width: element.width,
                      height: element.height,
                      width_percent: toPercent(element.width, stageWidth),
                      height_percent: toPercent(element.height, stageHeight),
                      x_percent: toPercent(newFrameX + newX, stageWidth),
                      y_percent: toPercent(newFrameY + newY, stageHeight),
                    });
                    drawGuidelines(imageNode);
                  }}
                  onDragEnd={() => {
                    isDraggingImageRef.current = false;
                    setGuides([]);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const oldWidth = element.width;
                    const oldHeight = element.height;
                    const newWidth = node.width() * node.scaleX();
                    const newHeight = node.height() * node.scaleY();
                    const newX = node.x();
                    const newY = node.y();

                    const newImageX = newX + frame.x;
                    const newImageY = newY + frame.y;

                    onChange({
                      x: newImageX,
                      y: newImageY,
                      width: newWidth,
                      height: newHeight,
                      rotation: node.rotation(),
                      width_percent: toPercent(newWidth, stageWidth),
                      height_percent: toPercent(newHeight, stageHeight),
                      x_percent: toPercent(newImageX, stageWidth),
                      y_percent: toPercent(newImageY, stageHeight),
                    });

                    node.scaleX(1);
                    node.scaleY(1);

                    const scaleX = newWidth / oldWidth;
                    const scaleY = newHeight / oldHeight;
                    const newFrameWidth = frame.width * scaleX;
                    const newFrameHeight = frame.height * scaleY;

                    const imageCenterX = newImageX + newWidth / 2;
                    const imageCenterY = newImageY + newHeight / 2;
                    const newFrameX = imageCenterX - newFrameWidth / 2;
                    const newFrameY = imageCenterY - newFrameHeight / 2;

                    dispatch(
                      updateElement({
                        id: frame.id,
                        updates: {
                          x: newFrameX,
                          y: newFrameY,
                          width: newFrameWidth,
                          height: newFrameHeight,
                          rotation: node.rotation(),
                          width_percent: toPercent(newFrameWidth, stageWidth),
                          height_percent: toPercent(
                            newFrameHeight,
                            stageHeight
                          ),
                          x_percent: toPercent(newFrameX, stageWidth),
                          y_percent: toPercent(newFrameY, stageHeight),
                        },
                      })
                    );
                  }}
                />
              </Group>
            </Group>
          );
        }

        return (
          <>
            {(element.visible ?? true) && (
              <KonvaImage
                ref={ref}
                image={image}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                draggable
                onClick={() => {
                  if (onSelect) {
                    onSelect();
                  }
                }}
                onDragMove={(e) => {
                  const imageNode = e.target;
                  const imgX = imageNode.x();
                  const imgY = imageNode.y();
                  const imgW = imageNode.width();
                  const imgH = imageNode.height();
                  const centerX = imgX + imgW / 2;
                  const centerY = imgY + imgH / 2;
                  drawGuidelines(imageNode);

                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        x: imgX,
                        y: imgY,
                        width_percent: toPercent(imgW, stageWidth),
                        height_percent: toPercent(imgH, stageHeight),
                        x_percent: toPercent(imgX, stageWidth),
                        y_percent: toPercent(imgY, stageHeight),
                      },
                    })
                  );

                  const frames = elements
                    .filter(
                      (el: CanvasElement) =>
                        el.type === "frame" &&
                        centerX >= el.x &&
                        centerX <= el.x + el.width &&
                        centerY >= el.y &&
                        centerY <= el.y + el.height
                    )
                    .sort(
                      (a: CanvasElement, b: CanvasElement) =>
                        elements.indexOf(b) - elements.indexOf(a)
                    );

                  const frame = frames[0];

                  if (!frame) {
                    wasOverFrameRef.current = false;
                    return;
                  }

                  const isAlreadyHasImage = elements.some(
                    (el: CanvasElement) =>
                      el.type === "image" &&
                      el.frameId === frame.id &&
                      el.id !== element.id
                  );

                  if (isAlreadyHasImage) {
                    return;
                  }

                  if (!wasOverFrameRef.current) {
                    const frameAspect = frame.width / frame.height;
                    const imgAspect = imgW / imgH;

                    let newWidth, newHeight, offsetX, offsetY;

                    switch (currentFitMode) {
                      case "fit":
                        if (imgAspect > frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;

                      case "fill":
                        if (imgAspect < frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;

                      case "stretch":
                        newWidth = frame.width;
                        newHeight = frame.height;
                        break;

                      default:
                        if (imgAspect < frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;
                    }

                    offsetX = (frame.width - newWidth) / 2;
                    offsetY = (frame.height - newHeight) / 2;

                    onChange({
                      x: frame.x + offsetX,
                      y: frame.y + offsetY,
                      width: newWidth,
                      height: newHeight,
                      frameId: frame.id,
                      fitMode: currentFitMode,
                      width_percent: toPercent(newWidth, stageWidth),
                      height_percent: toPercent(newHeight, stageHeight),
                      x_percent: toPercent(frame.x + offsetX, stageWidth),
                      y_percent: toPercent(frame.y + offsetY, stageHeight),
                    });

                    wasOverFrameRef.current = true;
                  }
                }}
                onDragEnd={(e) => {
                  const img = e.target;
                  const imgW = img.width();
                  const imgH = img.height();

                  const centerX = img.x() + imgW / 2;
                  const centerY = img.y() + imgH / 2;

                  const frames = elements
                    .filter(
                      (el: CanvasElement) =>
                        el.type === "frame" &&
                        centerX >= el.x &&
                        centerX <= el.x + el.width &&
                        centerY >= el.y &&
                        centerY <= el.y + el.height
                    )
                    .sort(
                      (a: CanvasElement, b: CanvasElement) =>
                        elements.indexOf(b) - elements.indexOf(a)
                    );

                  const frame = frames[0];

                  if (frame) {
                    const isAlreadyHasImage = elements.some(
                      (el: CanvasElement) =>
                        el.type === "image" &&
                        el.frameId === frame.id &&
                        el.id !== element.id
                    );

                    if (isAlreadyHasImage) {
                      onChange({ x: img.x(), y: img.y(), frameId: null });
                      wasOverFrameRef.current = false;
                      return;
                    }

                    const frameAspect = frame.width / frame.height;
                    const imgAspect = imgW / imgH;

                    let newWidth, newHeight, offsetX, offsetY;

                    switch (currentFitMode) {
                      case "fit":
                        if (imgAspect > frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;

                      case "fill":
                        if (imgAspect < frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;

                      case "stretch":
                        newWidth = frame.width;
                        newHeight = frame.height;
                        break;

                      default:
                        if (imgAspect < frameAspect) {
                          newWidth = frame.width;
                          newHeight = frame.width / imgAspect;
                        } else {
                          newHeight = frame.height;
                          newWidth = frame.height * imgAspect;
                        }
                        break;
                    }

                    offsetX = (frame.width - newWidth) / 2;
                    offsetY = (frame.height - newHeight) / 2;

                    onChange({
                      x: frame.x + offsetX,
                      y: frame.y + offsetY,
                      width: newWidth,
                      height: newHeight,
                      frameId: frame.id,
                      fitMode: currentFitMode,
                      width_percent: toPercent(newWidth, stageWidth),
                      height_percent: toPercent(newHeight, stageHeight),
                      x_percent: toPercent(frame.x + offsetX, stageWidth),
                      y_percent: toPercent(frame.y + offsetY, stageHeight),
                    });
                  } else {
                    onChange({ x: img.x(), y: img.y(), frameId: null });
                  }

                  wasOverFrameRef.current = false;
                }}
                onTransform={(e) => {
                  const node = e.target;
                  const newWidth = node.width() * node.scaleX();
                  const newHeight = node.height() * node.scaleY();
                  const newX = node.x();
                  const newY = node.y();

                  onChange({
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                    rotation: node.rotation(),
                    width_percent: toPercent(newWidth, stageWidth),
                    height_percent: toPercent(newHeight, stageHeight),
                    x_percent: toPercent(newX, stageWidth),
                    y_percent: toPercent(newY, stageHeight),
                  });

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            )}
          </>
        );
      }

      case "icon": {
        const [iconImage] = useImage(
          `https://api.iconify.design/${element.iconName}.svg`
        );

        return (
          <Group
            x={element.x}
            y={element.y}
            draggable
            onDragMove={(e) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();
              dispatch(
                updateElement({
                  id: element.id,
                  updates: {
                    x: newX,
                    y: newY,
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(newX, stageWidth),
                    y_percent: toPercent(newY, stageHeight),
                  },
                })
              );
            }}
            onClick={onSelect}
          >
            <Image
              image={iconImage}
              tint={element.color}
              filters={[Konva.Filters.RGB]}
              width={element.width}
              height={element.height}
            />
          </Group>
        );
      }

      case "rectangle":
        const rectangleElement = element as RectangleShape;
        const brandedFillRect = getBrandedFill(rectangleElement);
        const brandedStrokeRect = getBrandedStroke(rectangleElement);

        let cornerRadiusValue = rectangleElement.cornerRadius;
        if (rectangleElement.borderRadius) {
          const br = rectangleElement.borderRadius;
          cornerRadiusValue = [
            br.topLeft || 0,
            br.topRight || 0,
            br.bottomRight || 0,
            br.bottomLeft || 0,
          ];
        }
        return (
          <>
            {(element.visible ?? true) && (
              <>
                <Rect
                  ref={ref}
                  id={element.id?.toString()} // مهم علشان نجيب العنصر نفسه
                  x={rectangleElement.x}
                  y={rectangleElement.y}
                  width={rectangleElement.width}
                  height={rectangleElement.height}
                  fill={brandedFillRect}
                  stroke={brandedStrokeRect}
                  strokeWidth={rectangleElement.strokeWidth}
                  rotation={rectangleElement.rotation}
                  cornerRadius={cornerRadiusValue}
                  opacity={rectangleElement.opacity}
                  draggable
                  onClick={onSelect}
                  onDragMove={(e) => {
                    const node = e.target as Konva.Rect;
                    const newX = node.x();
                    const newY = node.y();

                    onChange({
                      x: newX,
                      y: newY,
                      width_percent: toPercent(rectangleElement.width, stageWidth),
                      height_percent: toPercent(rectangleElement.height, stageHeight),
                      x_percent: toPercent(newX, stageWidth),
                      y_percent: toPercent(newY, stageHeight),
                    });

                    drawGuidelines(node);
                  }}
                  onDragEnd={() => {
                    setGuides([]);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const newWidth = node.width() * node.scaleX();
                    const newHeight = node.height() * node.scaleY();

                    onChange({
                      x: node.x(),
                      y: node.y(),
                      width: newWidth,
                      height: newHeight,
                      width_percent: toPercent(newWidth, stageWidth),
                      height_percent: toPercent(newHeight, stageHeight),
                      x_percent: toPercent(node.x(), stageWidth),
                      y_percent: toPercent(node.y(), stageHeight),
                      rotation: node.rotation(),
                    });

                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />

              </>
            )}
          </>

        );

      case "circle":
        const circleElement = element as CircleShape;
        const brandedFillCircle = getBrandedFill(circleElement);
        const brandedStrokeCircle = getBrandedStroke(circleElement);

        return (
          <>
            {(element.visible ?? true) && (

              <Circle
              ref={ref}
              id={circleElement.id?.toString()} // مهم علشان نستخدمه في drawGuidelines
              x={circleElement.x + circleElement.radius}
              y={circleElement.y + circleElement.radius}
              radius={circleElement.radius}
              fill={brandedFillCircle}
              stroke={brandedStrokeCircle}
              strokeWidth={circleElement.strokeWidth}
              rotation={circleElement.rotation}
              opacity={circleElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.Circle;

                // ✅ نستخدم السنتر الحالي للمقارنة
                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  circleElement.radius,
                  circleElement.radius
                );

                // ✅ نحسب الإحداثيات من فوق شمال
                const adjustedX = newX - circleElement.radius;
                const adjustedY = newY - circleElement.radius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                });

                drawGuidelines(node); // ✅ يطلع خطوط السنتر والمسافات
                }}
                onDragEnd={() => {
                  setGuides([]); // ✅ نمسح الخطوط
                }}
                onTransform={(e) => {
                  const node = e.target;

                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const newRadius = (circleElement.radius * (scaleX + scaleY)) / 2;

                  // ✅ نحسب مكانه الجديد من فوق شمال
                  const adjustedX = node.x() - newRadius;
                  const adjustedY = node.y() - newRadius;

                  onChange({
                    x: adjustedX,
                    y: adjustedY,
                    radius: newRadius,
                    x_percent: toPercent(adjustedX, stageWidth),
                    y_percent: toPercent(adjustedY, stageHeight),
                    rotation: node.rotation(),
                  });

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />

            )}
          </>
        );

      case "ellipse":
      const ellipseElement = element as EllipseShape;
      const brandedFillEllipse = getBrandedFill(ellipseElement);
      const brandedStrokeEllipse = getBrandedStroke(ellipseElement);

      return (
        <>
          {(element.visible ?? true) && (
            <Ellipse
              ref={ref}
              id={ellipseElement.id?.toString()} // ضروري علشان نستخدمه في drawGuidelines
              x={ellipseElement.x + ellipseElement.radiusX}
              y={ellipseElement.y + ellipseElement.radiusY}
              radiusX={ellipseElement.radiusX}
              radiusY={ellipseElement.radiusY}
              fill={brandedFillEllipse}
              stroke={brandedStrokeEllipse}
              strokeWidth={ellipseElement.strokeWidth}
              rotation={ellipseElement.rotation}
              opacity={ellipseElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.Ellipse;

                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  ellipseElement.radiusX,
                  ellipseElement.radiusY
                );

                const adjustedX = newX - ellipseElement.radiusX;
                const adjustedY = newY - ellipseElement.radiusY;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  width_percent: toPercent(element.width, stageWidth),
                  height_percent: toPercent(element.height, stageHeight),
                });

                drawGuidelines(node); // ✅ خطوط السنتر + المسافات
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
              onTransform={(e) => {
                const node = e.target;

                const newRadiusX = ellipseElement.radiusX * node.scaleX();
                const newRadiusY = ellipseElement.radiusY * node.scaleY();

                const adjustedX = node.x() - newRadiusX;
                const adjustedY = node.y() - newRadiusY;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  radiusX: newRadiusX,
                  radiusY: newRadiusY,
                  rotation: node.rotation(),
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </>
      );

      case "line":
        const lineElement = element as LineShape;
        const brandedStrokeLine = getBrandedStroke(lineElement);

        const [x1, y1, x2, y2] = lineElement.points;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        const adjustedPoints = [
          x1 - centerX,
          y1 - centerY,
          x2 - centerX,
          y2 - centerY,
        ];
        const lineWidth = Math.abs(x2 - x1);
        const lineHeight = Math.abs(y2 - y1);

        return (
          <>
            {(element.visible ?? true) && (
              <Line
                ref={ref}
                x={lineElement.x + centerX}
                y={lineElement.y + centerY}
                points={adjustedPoints}
                fill={lineElement.fill}
                stroke={brandedStrokeLine}
                strokeWidth={lineElement.strokeWidth}
                rotation={lineElement.rotation}
                opacity={lineElement.opacity}
                draggable
                onClick={onSelect}
                onDragMove={(e) => {
                  const node = e.target as Konva.Line;
                  const { newX, newY } = calculateSnappingPosition(
                    node,
                    elements,
                    element,
                    snapThreshold,
                    lineWidth / 2,
                    lineHeight / 2
                  );
                  onChange({
                    x: newX - centerX,
                    y: newY - centerY,
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x() - centerX, stageWidth),
                    y_percent: toPercent(e.target.y() - centerY, stageHeight),
                  });

                  drawGuidelines(node);
                }}
                onDragEnd={() => {
                  setGuides([]);
                }}
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const newPoints = adjustedPoints.map((point, index) =>
                    index % 2 === 0 ? point * scaleX : point * scaleY
                  );

                  onChange({
                    x: node.x() - centerX,
                    y: node.y() - centerY,
                    x_percent: toPercent(node.x() - centerX, stageWidth),
                    y_percent: toPercent(node.y() - centerY, stageHeight),
                    rotation: node.rotation(),
                    points: newPoints.map((p, i) =>
                      i % 2 === 0 ? p + centerX : p + centerY
                    ),
                  });

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            )}
          </>
        );

      case "triangle":
      const triangleElement = element as TriangleShape;
      const brandedFillTriangle = getBrandedFill(triangleElement);
      const brandedStrokeTriangle = getBrandedStroke(triangleElement);

      const radius = Math.max(triangleElement.width, triangleElement.height) / 2;

      return (
        <>
          {(element.visible ?? true) && (
            <RegularPolygon
              ref={ref}
              id={triangleElement.id?.toString()} // ضروري علشان drawGuidelines يتجاهله
              x={triangleElement.x + radius}
              y={triangleElement.y + radius}
              sides={3}
              radius={radius}
              fill={brandedFillTriangle}
              stroke={brandedStrokeTriangle}
              strokeWidth={triangleElement.strokeWidth}
              rotation={triangleElement.rotation}
              opacity={triangleElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.RegularPolygon;

                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  radius,
                  radius
                );

                const adjustedX = newX - radius;
                const adjustedY = newY - radius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  width_percent: toPercent(triangleElement.width, stageWidth),
                  height_percent: toPercent(triangleElement.height, stageHeight),
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                });

                drawGuidelines(node); // ✅ خطوط السنتر + مسافات العناصر
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
              onTransform={(e) => {
                const node = e.target;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                const newRadius =
                  (Math.max(triangleElement.width, triangleElement.height) / 2) *
                  Math.max(scaleX, scaleY);

                const adjustedX = node.x() - newRadius;
                const adjustedY = node.y() - newRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  width: newRadius * 2,
                  height: newRadius * 2,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  rotation: node.rotation(),
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </>
      );

      case "star":
      const starElement = element as StarShape;
      const brandedFillStar = getBrandedFill(starElement);
      const brandedStrokeStar = getBrandedStroke(starElement);
      const starWidth = starElement.outerRadius * 2;
      const starHeight = starElement.outerRadius * 2;

      return (
        <>
          {(element.visible ?? true) && (
            <Star
              ref={ref}
              id={starElement.id?.toString()} // عشان drawGuidelines يعرف يتجاهله
              x={starElement.x + starElement.outerRadius}
              y={starElement.y + starElement.outerRadius}
              innerRadius={starElement.innerRadius}
              outerRadius={starElement.outerRadius}
              numPoints={starElement.numPoints}
              fill={brandedFillStar}
              stroke={brandedStrokeStar}
              strokeWidth={starElement.strokeWidth}
              rotation={starElement.rotation}
              opacity={starElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.Star;

                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  starWidth / 2,
                  starHeight / 2
                );

                const adjustedX = newX - starElement.outerRadius;
                const adjustedY = newY - starElement.outerRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  width_percent: toPercent(starWidth, stageWidth),
                  height_percent: toPercent(starHeight, stageHeight),
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                });

                drawGuidelines(node); // ✅ يرسم خطوط السنتر والمسافات
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
              onTransform={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                const newInnerRadius = starElement.innerRadius * Math.min(scaleX, scaleY);
                const newOuterRadius = starElement.outerRadius * Math.max(scaleX, scaleY);

                const adjustedX = node.x() - newOuterRadius;
                const adjustedY = node.y() - newOuterRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  rotation: node.rotation(),
                  innerRadius: newInnerRadius,
                  outerRadius: newOuterRadius,
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </>
      );

      case "wedge":
      const wedgeElement = element as WedgeShape;
      const brandedFillWedge = getBrandedFill(wedgeElement);
      const brandedStrokeWedge = getBrandedStroke(wedgeElement);
      const wedgeWidth = wedgeElement.radius * 2;
      const wedgeHeight = wedgeElement.radius * 2;

      return (
        <>
          {(element.visible ?? true) && (
            <Wedge
              ref={ref}
              id={wedgeElement.id?.toString()} // عشان drawGuidelines يعرف يتجاهله
              x={wedgeElement.x + wedgeElement.radius}
              y={wedgeElement.y + wedgeElement.radius}
              radius={wedgeElement.radius}
              angle={wedgeElement.angle}
              fill={brandedFillWedge}
              stroke={brandedStrokeWedge}
              strokeWidth={wedgeElement.strokeWidth}
              rotation={wedgeElement.rotation}
              opacity={wedgeElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.Wedge;

                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  wedgeWidth / 2,
                  wedgeHeight / 2
                );

                const adjustedX = newX - wedgeElement.radius;
                const adjustedY = newY - wedgeElement.radius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  width_percent: toPercent(wedgeWidth, stageWidth),
                  height_percent: toPercent(wedgeHeight, stageHeight),
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                });

                drawGuidelines(node);
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
              onTransform={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                const scale = (scaleX + scaleY) / 2;

                const newRadius = wedgeElement.radius * scale;
                const adjustedX = node.x() - newRadius;
                const adjustedY = node.y() - newRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  radius: newRadius,
                  rotation: node.rotation(),
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </>
      );

      case "ring":
      const ringElement = element as RingShape;
      const brandedFillRing = getBrandedFill(ringElement);
      const brandedStrokeRing = getBrandedStroke(ringElement);
      const ringWidth = ringElement.outerRadius * 2;
      const ringHeight = ringElement.outerRadius * 2;

      return (
        <>
          {(element.visible ?? true) && (
            <Ring
              ref={ref}
              id={ringElement.id?.toString()}
              x={ringElement.x + ringElement.outerRadius}
              y={ringElement.y + ringElement.outerRadius}
              innerRadius={ringElement.innerRadius}
              outerRadius={ringElement.outerRadius}
              fill={brandedFillRing}
              stroke={brandedStrokeRing}
              strokeWidth={ringElement.strokeWidth}
              rotation={ringElement.rotation}
              opacity={ringElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const node = e.target as Konva.Ring;

                const { newX, newY } = calculateSnappingPosition(
                  node,
                  elements,
                  element,
                  snapThreshold,
                  ringWidth / 2,
                  ringHeight / 2
                );

                const adjustedX = newX - ringElement.outerRadius;
                const adjustedY = newY - ringElement.outerRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  width_percent: toPercent(ringWidth, stageWidth),
                  height_percent: toPercent(ringHeight, stageHeight),
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                });

                drawGuidelines(node);
              }}
              onDragEnd={() => {
                setGuides([]);
              }}
              onTransform={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                const scale = (scaleX + scaleY) / 2;

                const newInnerRadius = ringElement.innerRadius * scale;
                const newOuterRadius = ringElement.outerRadius * scale;

                const adjustedX = node.x() - newOuterRadius;
                const adjustedY = node.y() - newOuterRadius;

                onChange({
                  x: adjustedX,
                  y: adjustedY,
                  x_percent: toPercent(adjustedX, stageWidth),
                  y_percent: toPercent(adjustedY, stageHeight),
                  innerRadius: newInnerRadius,
                  outerRadius: newOuterRadius,
                  rotation: node.rotation(),
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          )}
        </>
      );

      default:
        return null;
    }
  }
);
