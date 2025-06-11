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
  stageWidth:number;
  stageHeight:number;
  setGuides: (guides: GuideLineType[]) => void;
}
type KonvaText = InstanceType<typeof Konva.Text>;
interface RootState {
  canvas: {
    elements: CanvasElement[];
  };
}

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  ({ element, onSelect, onChange , stageWidth, stageHeight, setGuides }, ref) => {
    const elements = useSelector((store: any) => store.canvas.elements);
    const dispatch = useAppDispatch();
    // const stageWidth = useAppSelector((s) => s.canvas.stageWidth);
    // const stageHeight = useAppSelector((s) => s.canvas.stageHeight);
    const { toPercent } = usePercentConverter();
    const { resolveColor, resolveFont } = useBrandingResolver();
    const getBrandedFill = (element: CanvasElement) => {
      return resolveColor(element.fill, element.fillBrandingType);
    };
    const getBrandedFillText = (element: CanvasTextElement) => {
      return resolveColor(
        element.background ?? "#fff",
        element.fillBrandingType
      );
    };

    const getBrandedStroke = (element: CanvasElement) => {
      return resolveColor(
        element.stroke || "#000000",
        element.strokeBrandingType
      );
    };
    // const getBrandedTextColor = (element: CanvasTextElement) => {
    //   return resolveColor(element.fill || "#000000", element.colorBrandingType);
    // };

    // const getBrandedBackground = (element: CanvasTextElement) => {
    //   return resolveColor(
    //     element.background || "transparent",
    //     element.backgroundBrandingType
    //   );
    // };

    const drawGuidelines = (node: Konva.Node, stageWidth: number, stageHeight: number) => {
      const snapThreshold = 80; // Pixels tolerance for snapping
      const shapeRect = node.getClientRect();
      const guidelines: {
        points: number[];
        text?: string;
        textPosition?: { x: number; y: number };
      }[] = [];

      // Canvas edge guidelines (as before)
      // Left edge
      if (Math.abs(shapeRect.x) < snapThreshold) {
        const distance = Math.round(shapeRect.x);
        guidelines.push({
          points: [0, shapeRect.y + shapeRect.height / 2, shapeRect.x, shapeRect.y + shapeRect.height / 2],
          text: `${distance}px`,
          textPosition: {
            x: shapeRect.x / 2,
            y: shapeRect.y + shapeRect.height / 2 + 10,
          },
        });
      }
      // Right edge
      if (Math.abs(shapeRect.x + shapeRect.width - stageWidth) < snapThreshold) {
        const distance = Math.round(stageWidth - (shapeRect.x + shapeRect.width));
        guidelines.push({
          points: [
            shapeRect.x + shapeRect.width,
            shapeRect.y + shapeRect.height / 2,
            stageWidth,
            shapeRect.y + shapeRect.height / 2,
          ],
          text: `${distance}px`,
          textPosition: {
            x: (shapeRect.x + shapeRect.width + stageWidth) / 2,
            y: shapeRect.y + shapeRect.height / 2 + 10,
          },
        });
      }
      // Top edge
      if (Math.abs(shapeRect.y) < snapThreshold) {
        const distance = Math.round(shapeRect.y);
        guidelines.push({
          points: [shapeRect.x + shapeRect.width / 2, 0, shapeRect.x + shapeRect.width / 2, shapeRect.y],
          text: `${distance}px`,
          textPosition: {
            x: shapeRect.x + shapeRect.width / 2 + 10,
            y: shapeRect.y / 2,
          },
        });
      }
      // Bottom edge
      if (Math.abs(shapeRect.y + shapeRect.height - stageHeight) < snapThreshold) {
        const distance = Math.round(stageHeight - (shapeRect.y + shapeRect.height));
        guidelines.push({
          points: [
            shapeRect.x + shapeRect.width / 2,
            shapeRect.y + shapeRect.height,
            shapeRect.x + shapeRect.width / 2,
            stageHeight,
          ],
          text: `${distance}px`,
          textPosition: {
            x: shapeRect.x + shapeRect.width / 2 + 10,
            y: (shapeRect.y + shapeRect.height + stageHeight) / 2,
          },
        });
      }
      // Horizontal center
      if (Math.abs(shapeRect.x + shapeRect.width / 2 - stageWidth / 2) < snapThreshold) {
        guidelines.push({
          points: [stageWidth / 2, 0, stageWidth / 2, stageHeight],
        });
      }
      // Vertical center
      if (Math.abs(shapeRect.y + shapeRect.height / 2 - stageHeight / 2) < snapThreshold) {
        guidelines.push({
          points: [0, stageHeight / 2, stageWidth, stageHeight / 2],
        });
      }

      // Shape-to-shape alignment guidelines
      elements.forEach((otherElement:CanvasElementUnion) => {
        if (otherElement.id === element.id || !(otherElement.visible ?? true)) return; // Skip self and invisible elements

        const otherRect = {
          x: otherElement.x - otherElement.width / 2,
          y: otherElement.y - otherElement.height / 2,
          width: otherElement.width,
          height: otherElement.height,
        };

        // Horizontal alignment (top, center, bottom)
        const currentEdgesY = [
          shapeRect.y, // Top
          shapeRect.y + shapeRect.height / 2, // Center
          shapeRect.y + shapeRect.height, // Bottom
        ];
        const otherEdgesY = [
          otherRect.y, // Top
          otherRect.y + otherRect.height / 2, // Center
          otherRect.y + otherRect.height, // Bottom
        ];

        currentEdgesY.forEach((currentY) => {
          otherEdgesY.forEach((otherY) => {
            if (Math.abs(currentY - otherY) < snapThreshold) {
              const minX = Math.min(shapeRect.x, otherRect.x);
              const maxX = Math.max(shapeRect.x + shapeRect.width, otherRect.x + otherRect.width);
              guidelines.push({
                points: [minX, currentY, maxX, currentY],
                text: `${Math.round(Math.abs(shapeRect.x - otherRect.x))}px`,
                textPosition: {
                  x: (minX + maxX) / 2,
                  y: currentY + 10, // Below the line
                },
              });
            }
          });
        });

        // Vertical alignment (left, center, right)
        const currentEdgesX = [
          shapeRect.x, // Left
          shapeRect.x + shapeRect.width / 2, // Center
          shapeRect.x + shapeRect.width, // Right
        ];
        const otherEdgesX = [
          otherRect.x, // Left
          otherRect.x + otherRect.width / 2, // Center
          otherRect.x + otherRect.width, // Right
        ];

        currentEdgesX.forEach((currentX) => {
          otherEdgesX.forEach((otherX) => {
            if (Math.abs(currentX - otherX) < snapThreshold) {
              const minY = Math.min(shapeRect.y, otherRect.y);
              const maxY = Math.max(shapeRect.y + shapeRect.height, otherRect.y + otherRect.height);
              guidelines.push({
                points: [currentX, minY, currentX, maxY],
                text: `${Math.round(Math.abs(shapeRect.y - otherRect.y))}px`,
                textPosition: {
                  x: currentX + 10, // Right of the line
                  y: (minY + maxY) / 2,
                },
              });
            }
          });
        });
      });

      setGuides(guidelines);
    };


    switch (element.type) {
      case "text":
        const textElement = element as CanvasTextElement;
        const refText = useRef<KonvaText>(null);
        const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
        const trRef = useRef<Konva.Transformer>(null);
        // const [isSelected, setIsSelected] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [editableText, setEditableText] = useState(textElement.text);
        const isSelected = useSelector(
          (state: RootState) =>
            state.canvas.elements.find((el) => el.id === textElement.id)
              ?.selected
        );
        const textAlign = useSelector(
          (state: any) =>
            state.canvas.elements.find((el: any) => el.id === textElement.id)
              ?.align || "left"
        );
        const fontWeight = useSelector(
          (state: {
            canvas: { elements: { id: string; fontWeight?: string }[] };
          }) =>
            state.canvas.elements.find((el) => el.id === textElement.id)
              ?.fontWeight || "normal"
        );
        const fontStyle = useSelector(
          (state: {
            canvas: { elements: { id: string; fontStyle?: string }[] };
          }) =>
            state.canvas.elements.find((el) => el.id === textElement.id)
              ?.fontStyle || "normal"
        );

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
          textElement?.fontBrandingType, // Add this dependency
          textElement?.padding,
          textAlign,
          fontWeight,
          fontStyle,
          dispatch,
        ]);

        useEffect(() => {
          if (isSelected && refText.current && trRef.current && !isEditing) {
            trRef.current.nodes([refText.current]);
            trRef.current.getLayer()?.batchDraw();
          }
        }, [isSelected, isEditing]);

        const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
          if (onSelect) onSelect(e, textElement.id as string); // تأكد إن `id` هو string
        };

        const handleDoubleClick = () => {
          setIsEditing(true);
        };

        const handleTextChange = (
          e: React.ChangeEvent<HTMLTextAreaElement>
        ) => {
          setEditableText(e.target.value);
          if (refText.current) {
            refText.current.text(e.target.value);
            refText.current.width(textElement.width || 100);
            refText.current._setTextData();
            const box = refText.current.getClientRect({ skipTransform: true });
            setBgSize({ width: box.width, height: box.height });
          }
        };

        const handleTextBlur = () => {
          setIsEditing(false);

          if (textElement.id !== undefined) {
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
        };

        const handleKeyPress = (
          e: React.KeyboardEvent<HTMLTextAreaElement>
        ) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            if (textElement.id !== undefined) {
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
          }
        };

        return (
          <>
            {textElement.background && (element.visible ?? true) && (
              <Rect
                x={textElement.x - (textElement.padding || 0)}
                y={textElement.y - (textElement.padding || 0)}
                width={bgSize.width + (textElement.padding || 0) * 2}
                height={bgSize.height + (textElement.padding || 0) * 2}
                fill={getBrandedFillText(textElement)}
                // stroke={textElement.backgroundStroke}
                // strokeWidth={textElement.backgroundStrokeWidth}
                opacity={textElement.opacity}
                rotation={textElement.rotation}
                cornerRadius={textCornerRadius}
              />
            )}
            {(element.visible ?? true) && (
              <>
                <Text
                  ref={refText}
                  x={textElement.x}
                  y={textElement.y}
                  text={editableText}
                  fill={textElement.fill || "#000"}
                  stroke={textElement.stroke}
                  padding={textElement.padding}
                  fontSize={textElement.fontSize}
                  fontFamily={resolveFont(
                    textElement.fontFamily || "",
                    textElement.fontBrandingType
                  )}
                  opacity={textElement.opacity}
                  verticalAlign="middle"
                  align={textAlign}
                  fontStyle={fontWeight}
                  draggable
                  width={textElement.width || 100} // 🟢 Enforce fixed width for wrapping
                  wrap="word" // Ensure word wrapping
                  onClick={handleSelect}
                  onDblClick={handleDoubleClick}
                  onDragMove={(e) =>
                    dispatch(
                      updateElement({
                        id: textElement.id,
                        updates: {
                          x: e.target.x(),
                          y: e.target.y(),
                          width_percent: toPercent(element.width, stageWidth),
                          height_percent: toPercent(
                            element.height,
                            stageHeight
                          ),
                          x_percent: toPercent(e.target.x(), stageWidth),
                          y_percent: toPercent(e.target.y(), stageHeight),
                          fontSize_percent: toPercentFontSize(
                            Number(element.fontSize),
                            stageWidth,
                            stageHeight
                          ),
                        },
                      })
                    )
                  }
                  onTransform={(e) => {
                    const node = refText.current;
                    const newWidth = Math.max(
                      30,
                      e.target.width() * e.target.scaleX()
                    );

                    // fontSize_percent: toPercentFontSize(20, stageWidth, stageHeight)

                    if (node) {
                      node.width(newWidth);
                      node.scaleX(1);
                      node.scaleY(1);
                      node._setTextData();
                      const box = node.getClientRect({ skipTransform: true });
                      setBgSize({ width: newWidth, height: box.height });
                    }
                  }}
                  onTransformEnd={() => {
                    const node = refText.current;
                    if (!node) return;
                    const newWidth = Math.max(30, node.width());
                    node.width(newWidth);
                    node._setTextData();
                    const box = node.getClientRect({ skipTransform: true });
                    const newHeight = box.height;

                    setBgSize({ width: newWidth, height: newHeight });

                    dispatch(
                      updateElement({
                        id: textElement.id,
                        updates: {
                          x: node.x(),
                          y: node.y(),
                          width: newWidth,
                          height: newHeight,
                          align: textAlign,
                          fontWeight,
                          width_percent: toPercent(newWidth, stageWidth),
                          height_percent: toPercent(newHeight, stageHeight),
                          x_percent: toPercent(node.x(), stageWidth),
                          y_percent: toPercent(node.y(), stageHeight),
                          fontSize_percent: toPercentFontSize(
                            Number(element.fontSize),
                            stageWidth,
                            stageHeight
                          ),
                        },
                      })
                    );

                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />
                {isSelected && !isEditing && (
                  <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    // 'top-left', 'top-right',
                    enabledAnchors={["bottom-left", "bottom-right"]}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 30) {
                        return oldBox; // 🟢 Prevent width from going too small
                      }
                      return newBox;
                    }}
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
                        fontFamily: textElement.fontFamily || "Arial",
                        padding: textElement.padding || 0,
                        color: textElement.fill,
                        background: "white",
                        border: "1px dashed #ccc",
                        resize: "none",
                        outline: "none",
                        overflow: "hidden",
                        lineHeight: "1",
                        textAlign: textAlign,
                        fontWeight: fontWeight,
                        fontStyle: fontStyle,
                      }}
                      value={editableText}
                      onChange={handleTextChange}
                      onBlur={handleTextBlur}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                  </Html>
                )}
              </>
            )}
          </>
        );

      case "frame": {
        const imageInFrame = (elements as CanvasElement[]).find(
          (el) => el.type === "image" && el.frameId === element.id
        );

        // If there's an image, skip rendering the frame here as it will be rendered in the image case
        if (imageInFrame) {
          return null;
        }

        // Render standalone frame
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
        const [currentFitMode, setCurrentFitMode] = useState(
          element.fitMode || "fill"
        );
        const isDraggingImageRef = useRef(false);
        const [isMovable, setIsMovable] = useState(false); // New state to track if image is movable

        const applyFitMode = (
          newFitMode: string,
          targetFrame: CanvasElement
        ) => {
          const frameAspect = targetFrame.width / targetFrame.height;
          const imgAspect = element.width / element.height;

          let newWidth, newHeight, offsetX, offsetY;

          switch (newFitMode) {
            case "fit":
              if (imgAspect > frameAspect) {
                newWidth = targetFrame.width;
                newHeight = targetFrame.width / imgAspect;
              } else {
                newHeight = targetFrame.height;
                newWidth = targetFrame.height * imgAspect;
              }
              break;

            case "fill":
              if (imgAspect < frameAspect) {
                newWidth = targetFrame.width;
                newHeight = targetFrame.width / imgAspect;
              } else {
                newHeight = targetFrame.height;
                newWidth = targetFrame.height * imgAspect;
              }
              break;

            case "stretch":
              newWidth = targetFrame.width;
              newHeight = targetFrame.height;
              break;

            default:
              if (imgAspect < frameAspect) {
                newWidth = targetFrame.width;
                newHeight = targetFrame.width / imgAspect;
              } else {
                newHeight = targetFrame.height;
                newWidth = targetFrame.height * imgAspect;
              }
              break;
          }

          offsetX = (targetFrame.width - newWidth) / 2;
          offsetY = (targetFrame.height - newHeight) / 2;

          onChange({
            x: targetFrame.x + offsetX,
            y: targetFrame.y + offsetY,
            width: newWidth,
            height: newHeight,
            frameId: targetFrame.id,
            fitMode: newFitMode,
            width_percent: toPercent(newWidth, stageWidth),
            height_percent: toPercent(newHeight, stageHeight),
            x_percent: toPercent(targetFrame.x + offsetX, stageWidth),
            y_percent: toPercent(targetFrame.y + offsetY, stageHeight),
          });
        };

        if (frame) {
          return (
            <>
              <Group
                x={frame.x}
                y={frame.y}
                clipFunc={(ctx) => {
                  ctx.rect(0, 0, frame.width, frame.height);
                }}
                draggable
                onDragMove={(e) => {
                  const node = e.target;
                  const newX = node.x();
                  const newY = node.y();

                  // Update frame position
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

                  // Update image position to stay aligned with frame
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
              >
                <KonvaImage
                  ref={ref}
                  image={image}
                  x={element.x - frame.x} // Relative to frame
                  y={element.y - frame.y} // Relative to frame
                  width={element.width}
                  height={element.height}
                  draggable={isMovable} // Draggable only when isMovable is true
                  onClick={() => {
                    if (onSelect) {
                      onSelect();
                    }
                  }}
                  onDblClick={() => {
                    setIsMovable((prev) => !prev); // Toggle movable state on double-click
                  }}
                  onDragStart={() => {
                    isDraggingImageRef.current = true;
                  }}
                  onDragMove={(e) => {
                    if (!isDraggingImageRef.current || !isMovable) return;

                    const imageNode = e.target;
                    let newX = imageNode.x(); // Relative to frame
                    let newY = imageNode.y(); // Relative to frame

                    // Constrain image position within frame boundaries
                    const minX = -(element.width - frame.width) / 2;
                    const maxX = (element.width - frame.width) / 2;
                    const minY = -(element.height - frame.height) / 2;
                    const maxY = (element.height - frame.height) / 2;

                    newX = Math.max(minX, Math.min(maxX, newX));
                    newY = Math.max(minY, Math.min(maxY, newY));

                    // Calculate new frame position to move with image
                    const newFrameX = frame.x + newX - (element.x - frame.x);
                    const newFrameY = frame.y + newY - (element.y - frame.y);

                    // Update frame position
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

                    // Update image position
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
                  }}
                  onDragEnd={() => {
                    isDraggingImageRef.current = false;
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const oldWidth = element.width;
                    const oldHeight = element.height;
                    const newWidth = node.width() * node.scaleX();
                    const newHeight = node.height() * node.scaleY();
                    const newX = node.x(); // Relative to frame
                    const newY = node.y(); // Relative to frame

                    // Calculate new absolute image position
                    const newImageX = newX + frame.x;
                    const newImageY = newY + frame.y;

                    // Update image
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

                    // Reset scale to avoid compounding
                    node.scaleX(1);
                    node.scaleY(1);

                    // Update frame size to match image resize
                    const scaleX = newWidth / oldWidth;
                    const scaleY = newHeight / oldHeight;
                    const newFrameWidth = frame.width * scaleX;
                    const newFrameHeight = frame.height * scaleY;

                    // Center the frame around the image
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

              {element.isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 1000,
                  }}
                >
                  <select
                    value={currentFitMode}
                    onChange={(e) => {
                      setCurrentFitMode(e.target.value);
                      if (frame) {
                        applyFitMode(e.target.value, frame);
                      }
                    }}
                  >
                    <option value="fit">Fit</option>
                    <option value="fill">Fill</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
              )}
            </>
          );
        }

        // Image without a frame (unchanged)
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
            {element.isSelected && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 1000,
                }}
              >
                <select
                  value={currentFitMode}
                  onChange={(e) => {
                    setCurrentFitMode(e.target.value);
                    if (frame) {
                      applyFitMode(e.target.value, frame);
                    }
                  }}
                >
                  <option value="fit">Fit</option>
                  <option value="fill">Fill</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
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
              <Rect
                ref={ref}
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
                offsetX={rectangleElement.width / 2}
                offsetY={rectangleElement.height / 2}
                onClick={onSelect}
                onDragMove={(e) =>{
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(element.x, stageWidth),
                    y_percent: toPercent(element.y, stageHeight),
                  })
                  // Draw alignment guidelines
                  drawGuidelines(e.target as Konva.Rect, stageWidth, stageHeight);
                  }
                }
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
                x={circleElement.x}
                y={circleElement.y}
                radius={circleElement.radius}
                fill={brandedFillCircle}
                stroke={brandedStrokeCircle}
                strokeWidth={circleElement.strokeWidth}
                rotation={circleElement.rotation}
                opacity={circleElement.opacity}
                draggable
                onClick={onSelect}
                onDragMove={(e) => {
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(element.x, stageWidth),
                    y_percent: toPercent(element.y, stageHeight),
                  });
                }}
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const newRadius =
                    (circleElement.radius * (scaleX + scaleY)) / 2;

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
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

      case "ellipse":
        const ellipseElement = element as EllipseShape;
        const brandedFillEllipse = getBrandedFill(ellipseElement);
        const brandedStrokeEllipse = getBrandedStroke(ellipseElement);

        return (
          <>
            {(element.visible ?? true) && (
              <Ellipse
                ref={ref}
                x={ellipseElement.x}
                y={ellipseElement.y}
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
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(element.x, stageWidth),
                    y_percent: toPercent(element.y, stageHeight),
                  });
                }}
                onTransform={(e) => {
                  const node = e.target;

                  const newRadiusX = ellipseElement.radiusX * node.scaleX();
                  const newRadiusY = ellipseElement.radiusY * node.scaleY();

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
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
                onDragMove={(e) =>
                  onChange({
                    x: e.target.x() - centerX,
                    y: e.target.y() - centerY,
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x() - centerX, stageWidth),
                    y_percent: toPercent(e.target.y() - centerY, stageHeight),
                  })
                }
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

        return (
          <>
            {(element.visible ?? true) && (
              <RegularPolygon
                ref={ref}
                x={triangleElement.x}
                y={triangleElement.y}
                sides={3}
                radius={
                  Math.max(triangleElement.width, triangleElement.height) / 2
                }
                fill={brandedFillTriangle}
                stroke={brandedStrokeTriangle}
                strokeWidth={triangleElement.strokeWidth}
                rotation={triangleElement.rotation}
                opacity={triangleElement.opacity}
                draggable
                onClick={onSelect}
                onDragMove={(e) =>
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x(), stageWidth),
                    y_percent: toPercent(e.target.y(), stageHeight),
                  })
                }
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const newRadius =
                    (Math.max(triangleElement.width, triangleElement.height) /
                      2) *
                    Math.max(scaleX, scaleY);

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
                    rotation: node.rotation(),
                    width: newRadius * 2,
                    height: newRadius * 2,
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

        return (
          <>
            {(element.visible ?? true) && (
              <Star
                ref={ref}
                x={starElement.x}
                y={starElement.y}
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
                onDragMove={(e) =>
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x(), stageWidth),
                    y_percent: toPercent(e.target.y(), stageHeight),
                  })
                }
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  const newInnerRadius =
                    starElement.innerRadius * Math.min(scaleX, scaleY);
                  const newOuterRadius =
                    starElement.outerRadius * Math.max(scaleX, scaleY);

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
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

        return (
          <>
            {(element.visible ?? true) && (
              <Wedge
                ref={ref}
                x={wedgeElement.x}
                y={wedgeElement.y}
                radius={wedgeElement.radius}
                angle={wedgeElement.angle}
                fill={brandedFillWedge}
                stroke={brandedStrokeWedge}
                strokeWidth={wedgeElement.strokeWidth}
                rotation={wedgeElement.rotation}
                opacity={wedgeElement.opacity}
                draggable
                onClick={onSelect}
                onDragMove={(e) =>
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x(), stageWidth),
                    y_percent: toPercent(e.target.y(), stageHeight),
                  })
                }
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  const scale = (scaleX + scaleY) / 2;

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
                    radius: wedgeElement.radius * scale,
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

        return (
          <>
            {(element.visible ?? true) && (
              <Ring
                ref={ref}
                x={ringElement.x}
                y={ringElement.y}
                innerRadius={ringElement.innerRadius}
                outerRadius={ringElement.outerRadius}
                fill={brandedFillRing}
                stroke={brandedStrokeRing}
                strokeWidth={ringElement.strokeWidth}
                rotation={ringElement.rotation}
                opacity={ringElement.opacity}
                draggable
                onClick={onSelect}
                onDragMove={(e) =>
                  onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(e.target.x(), stageWidth),
                    y_percent: toPercent(e.target.y(), stageHeight),
                  })
                }
                onTransform={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  const scale = (scaleX + scaleY) / 2;

                  onChange({
                    x: node.x(),
                    y: node.y(),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
                    innerRadius: ringElement.innerRadius * scale,
                    outerRadius: ringElement.outerRadius * scale,
                    rotation: node.rotation(),
                  });

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            )}
          </>
        );
      /* qr code */
      // case "qrcode": {
      //   const qrElement = element as QRCodeElement;
      //   const [qrError, setQrError] = useState<string | null>(null);

      //   // Validate QR code data
      //   const isValidQRData = qrElement.value && qrElement.value.trim() !== "";

      //   if (!isValidQRData) {
      //     return (
      //       <Html
      //         groupProps={{
      //           x: qrElement.x,
      //           y: qrElement.y,
      //           draggable: true,
      //           onClick: onSelect,
      //         }}
      //       >
      //         <div
      //           style={{
      //             width: qrElement.width,
      //             height: qrElement.height,
      //             cursor: "move",
      //             display: "flex",
      //             alignItems: "center",
      //             justifyContent: "center",
      //             border: "2px dashed #ccc",
      //             backgroundColor: "#f5f5f5",
      //             color: "#666",
      //             fontSize: "12px",
      //             textAlign: "center",
      //           }}
      //         >
      //           Invalid QR Data
      //         </div>
      //       </Html>
      //     );
      //   }

      default:
        return null;
    }
  }
);
