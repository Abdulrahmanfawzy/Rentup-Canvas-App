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
  CanvasFrameElement,
} from "../../features/canvas/types";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Html } from "react-konva-utils";
import Konva from "konva";
import {
  toPercentFontSize,
  usePercentConverter,
} from "@/hooks/usePercentConverter";
import { useBrandingResolver } from "@/hooks/useBrandingResolver";

interface Props {
  element: CanvasElementUnion;
  isSelected: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent>, id?: string) => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
}
type KonvaText = InstanceType<typeof Konva.Text>;

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  ({ element, onSelect, onChange }, ref) => {
    const elements = useSelector((store: any) => store.canvas.elements);
    const dispatch = useAppDispatch();
    const stageWidth = useAppSelector((s) => s.canvas.stageWidth);
    const stageHeight = useAppSelector((s) => s.canvas.stageHeight);
    const { toPercent } = usePercentConverter();
    const { resolveColor, resolveFont } = useBrandingResolver();
    const getBrandedFill = (element: CanvasElement) => {
      return resolveColor(element.fill, element.fillBrandingType);
    };

    const getBrandedStroke = (element: CanvasElement) => {
      return resolveColor(
        element.stroke || "#000000",
        element.strokeBrandingType
      );
    };
    /* ممكن تستخدم ده مع ال Text */
    const getBrandedFont = (element: CanvasTextElement) => {
      return resolveFont(
        element.fontFamily || "Arial",
        element.fontBrandingType
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

    switch (element.type) {
      
      case "text":
        const textElement = element as CanvasTextElement;
        const refText = useRef<KonvaText>(null);
        const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
        const trRef = useRef<Konva.Transformer>(null);
        const [isSelected, setIsSelected] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [editableText, setEditableText] = useState(textElement.text);

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

            const brandedFont = getBrandedFont(textElement);

            refText.current.fontStyle(fontStyleFinal);
            refText.current.fontFamily(brandedFont); // Use the branded font
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
          setIsSelected(true);
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
            {textElement.background && (
              <Rect
                x={textElement.x - (textElement.padding || 0)}
                y={textElement.y - (textElement.padding || 0)}
                width={bgSize.width + (textElement.padding || 0) * 2}
                height={bgSize.height + (textElement.padding || 0) * 2}
                fill={textElement.background}
                // stroke={textElement.backgroundStroke}
                // strokeWidth={textElement.backgroundStrokeWidth}
                opacity={textElement.opacity}
                rotation={textElement.rotation}
                cornerRadius={textCornerRadius}
              />
            )}
            <Text
              ref={refText}
              x={textElement.x}
              y={textElement.y}
              text={editableText}
              fill={textElement.fill || "#000"}
              stroke={textElement.stroke}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily || "Arial"}
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
                      height_percent: toPercent(element.height, stageHeight),
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
        );

      // case "frame": {
      //   return (
      //     <Rect
      //       ref={ref}
      //       x={element.x}
      //       y={element.y}
      //       width={element.width}
      //       height={element.height}
      //       fill={element.fill}
      //       dash={[4, 4]}
      //       stroke={element.stroke}
      //       strokeWidth={element.strokeWidth}
      //       rotation={element.rotation}
      //       draggable
      //       onClick={onSelect}
      //       onDragMove={(e) => {
      //         const node = e.target;
      //         const newX = node.x();
      //         const newY = node.y();

      //         // for percentage
      //         dispatch(
      //           updateElement({
      //             id: element.id,
      //             updates: {
      //               x: newX,
      //               y: newY,
      //               width_percent: toPercent(element.width, stageWidth),
      //               height_percent: toPercent(element.height, stageHeight),
      //               x_percent: toPercent(newX, stageWidth),
      //               y_percent: toPercent(newY, stageHeight),
      //             },
      //           })
      //         );

      //         // Update all images inside this frame
      //         const imagesInFrame = elements.filter(
      //           (el: CanvasElement) =>
      //             el.type === "image" && el.frameId === element.id
      //         );

      //         imagesInFrame.forEach((image: CanvasElement) => {
      //           // Calculate the new position based on the original offset
      //           const offsetX = image.x - element.x; // Original offset
      //           const offsetY = image.y - element.y;

      //           const newImageX = newX + offsetX;
      //           const newImageY = newY + offsetY;

      //           dispatch(
      //             updateElement({
      //               id: image.id,
      //               updates: {
      //                 x: newImageX,
      //                 y: newImageY,
      //                 width_percent: toPercent(element.width, stageWidth),
      //                 height_percent: toPercent(element.height, stageHeight),
      //                 x_percent: toPercent(newImageX, stageWidth),
      //                 y_percent: toPercent(newImageY, stageHeight),
      //               },
      //             })
      //           );
      //         });
      //       }}
      //       onTransform={(e) => {
      //         const node = e.target;
      //         const oldWidth = element.width;
      //         const oldHeight = element.height;

      //         const newWidth = node.width() * node.scaleX();
      //         const newHeight = node.height() * node.scaleY();

      //         const scaleX = newWidth / oldWidth;
      //         const scaleY = newHeight / oldHeight;

      //         // Update the frame
      //         onChange({
      //           x: node.x(),
      //           y: node.y(),
      //           width: newWidth,
      //           height: newHeight,
      //           rotation: node.rotation(),
      //           width_percent: toPercent(newWidth, stageWidth),
      //           height_percent: toPercent(newHeight, stageHeight),
      //           x_percent: toPercent(node.x(), stageWidth),
      //           y_percent: toPercent(node.y(), stageHeight),
      //         });

      //         node.scaleX(1);
      //         node.scaleY(1);

      //         // Resize the images inside the frame and keep them centered
      //         const imagesInFrame = elements.filter(
      //           (el: CanvasElement) =>
      //             el.type === "image" && el.frameId === element.id
      //         );

      //         imagesInFrame.forEach((img: CanvasElement) => {
      //           const newImgWidth = img.width * scaleX;
      //           const newImgHeight = img.height * scaleY;

      //           // Center the image in the new frame dimensions
      //           const newImgX = node.x() + (node.width() - newImgWidth) / 2;
      //           const newImgY = node.y() + (node.height() - newImgHeight) / 2;

      //           dispatch(
      //             updateElement({
      //               id: img.id,
      //               updates: {
      //                 x: newImgX,
      //                 y: newImgY,
      //                 width: newImgWidth,
      //                 height: newImgHeight,
      //                 width_percent: toPercent(newImgWidth, stageWidth),
      //                 height_percent: toPercent(newImgHeight, stageHeight),
      //                 x_percent: toPercent(newImgX, stageWidth),
      //                 y_percent: toPercent(newImgY, stageHeight),
      //               },
      //             })
      //           );
      //         });
      //       }}
      //     />
      //   );
      // }

      // case "image": {
      //   const [image] = useImage(element.src || "");
      //   const frame = elements.find(
      //     (f: CanvasElement) => f.id === element.frameId
      //   );
      //   const wasOverFrameRef = useRef(false);
      //   const [currentFitMode, setCurrentFitMode] = useState(
      //     element.fitMode || "fill"
      //   );
      //   const isDraggingImageRef = useRef(false);
      //   const [isMovable, setIsMovable] = useState(false); // New state to track if image is movable

      //   const applyFitMode = (
      //     newFitMode: string,
      //     targetFrame: CanvasElement
      //   ) => {
      //     const frameAspect = targetFrame.width / targetFrame.height;
      //     const imgAspect = element.width / element.height;

      //     let newWidth, newHeight, offsetX, offsetY;

      //     switch (newFitMode) {
      //       case "fit":
      //         if (imgAspect > frameAspect) {
      //           newWidth = targetFrame.width;
      //           newHeight = targetFrame.width / imgAspect;
      //         } else {
      //           newHeight = targetFrame.height;
      //           newWidth = targetFrame.height * imgAspect;
      //         }
      //         break;

      //       case "fill":
      //         if (imgAspect < frameAspect) {
      //           newWidth = targetFrame.width;
      //           newHeight = targetFrame.width / imgAspect;
      //         } else {
      //           newHeight = targetFrame.height;
      //           newWidth = targetFrame.height * imgAspect;
      //         }
      //         break;

      //       case "stretch":
      //         newWidth = targetFrame.width;
      //         newHeight = targetFrame.height;
      //         break;

      //       default:
      //         if (imgAspect < frameAspect) {
      //           newWidth = targetFrame.width;
      //           newHeight = targetFrame.width / imgAspect;
      //         } else {
      //           newHeight = targetFrame.height;
      //           newWidth = targetFrame.height * imgAspect;
      //         }
      //         break;
      //     }

      //     offsetX = (targetFrame.width - newWidth) / 2;
      //     offsetY = (targetFrame.height - newHeight) / 2;

      //     onChange({
      //       x: targetFrame.x + offsetX,
      //       y: targetFrame.y + offsetY,
      //       width: newWidth,
      //       height: newHeight,
      //       frameId: targetFrame.id,
      //       fitMode: newFitMode,
      //       width_percent: toPercent(newWidth, stageWidth),
      //       height_percent: toPercent(newHeight, stageHeight),
      //       x_percent: toPercent(targetFrame.x + offsetX, stageWidth),
      //       y_percent: toPercent(targetFrame.y + offsetY, stageHeight),
      //     });
      //   };

      //   if (frame) {
      //     return (
      //       <>
      //         <Group
      //           x={frame.x}
      //           y={frame.y}
      //           clipFunc={(ctx) => {
      //             ctx.rect(0, 0, frame.width, frame.height);
      //           }}
      //         >
      //           <KonvaImage
      //             ref={ref}
      //             image={image}
      //             x={element.x - frame.x} // Relative to frame
      //             y={element.y - frame.y} // Relative to frame
      //             width={element.width}
      //             height={element.height}
      //             draggable={isMovable} // Draggable only when isMovable is true
      //             onClick={() => {
      //               if (onSelect) {
      //                 onSelect();
      //               }
      //             }}
      //             onDblClick={() => {
      //               setIsMovable((prev) => !prev); // Toggle movable state on double-click
      //             }}
      //             onDragStart={() => {
      //               isDraggingImageRef.current = true;
      //             }}
      //             onDragMove={(e) => {
      //               if (!isDraggingImageRef.current || !isMovable) return;

      //               const imageNode = e.target;
      //               let newX = imageNode.x(); // Relative to frame
      //               let newY = imageNode.y(); // Relative to frame

      //               // Constrain image position within frame boundaries
      //               const minX = -(element.width - frame.width) / 2;
      //               const maxX = (element.width - frame.width) / 2;
      //               const minY = -(element.height - frame.height) / 2;
      //               const maxY = (element.height - frame.height) / 2;

      //               newX = Math.max(minX, Math.min(maxX, newX));
      //               newY = Math.max(minY, Math.min(maxY, newY));

      //               // Update image position
      //               onChange({
      //                 x: frame.x + newX,
      //                 y: frame.y + newY,
      //                 width: element.width,
      //                 height: element.height,
      //                 width_percent: toPercent(element.width, stageWidth),
      //                 height_percent: toPercent(element.height, stageHeight),
      //                 x_percent: toPercent(frame.x + newX, stageWidth),
      //                 y_percent: toPercent(frame.y + newY, stageHeight),
      //               });
      //             }}
      //             onDragEnd={() => {
      //               isDraggingImageRef.current = false;
      //             }}
      //             onTransform={(e) => {
      //               const node = e.target;
      //               const oldWidth = element.width;
      //               const oldHeight = element.height;
      //               const newWidth = node.width() * node.scaleX();
      //               const newHeight = node.height() * node.scaleY();
      //               const newX = node.x(); // Relative to frame
      //               const newY = node.y(); // Relative to frame

      //               // Calculate new absolute image position
      //               const newImageX = newX + frame.x;
      //               const newImageY = newY + frame.y;

      //               // Update image
      //               onChange({
      //                 x: newImageX,
      //                 y: newImageY,
      //                 width: newWidth,
      //                 height: newHeight,
      //                 rotation: node.rotation(),
      //                 width_percent: toPercent(newWidth, stageWidth),
      //                 height_percent: toPercent(newHeight, stageHeight),
      //                 x_percent: toPercent(newImageX, stageWidth),
      //                 y_percent: toPercent(newImageY, stageHeight),
      //               });

      //               // Reset scale to avoid compounding
      //               node.scaleX(1);
      //               node.scaleY(1);

      //               // Update frame size to match image resize
      //               const scaleX = newWidth / oldWidth;
      //               const scaleY = newHeight / oldHeight;
      //               const newFrameWidth = frame.width * scaleX;
      //               const newFrameHeight = frame.height * scaleY;

      //               // Center the frame around the image
      //               const imageCenterX = newImageX + newWidth / 2;
      //               const imageCenterY = newImageY + newHeight / 2;
      //               const newFrameX = imageCenterX - newFrameWidth / 2;
      //               const newFrameY = imageCenterY - newFrameHeight / 2;

      //               dispatch(
      //                 updateElement({
      //                   id: frame.id,
      //                   updates: {
      //                     x: newFrameX,
      //                     y: newFrameY,
      //                     width: newFrameWidth,
      //                     height: newFrameHeight,
      //                     rotation: node.rotation(),
      //                     width_percent: toPercent(newFrameWidth, stageWidth),
      //                     height_percent: toPercent(
      //                       newFrameHeight,
      //                       stageHeight
      //                     ),
      //                     x_percent: toPercent(newFrameX, stageWidth),
      //                     y_percent: toPercent(newFrameY, stageHeight),
      //                   },
      //                 })
      //               );
      //             }}
      //           />
      //         </Group>

      //         {element.isSelected && (
      //           <div
      //             style={{
      //               position: "absolute",
      //               top: 10,
      //               left: 10,
      //               zIndex: 1000,
      //             }}
      //           >
      //             <select
      //               value={currentFitMode}
      //               onChange={(e) => {
      //                 setCurrentFitMode(e.target.value);
      //                 if (frame) {
      //                   applyFitMode(e.target.value, frame);
      //                 }
      //               }}
      //             >
      //               <option value="fit">Fit</option>
      //               <option value="fill">Fill</option>
      //               <option value="stretch">Stretch</option>
      //             </select>
      //           </div>
      //         )}
      //       </>
      //     );
      //   }

      //   // Image without a frame (unchanged)
      //   return (
      //     <>
      //       <KonvaImage
      //         ref={ref}
      //         image={image}
      //         x={element.x}
      //         y={element.y}
      //         width={element.width}
      //         height={element.height}
      //         draggable
      //         onClick={() => {
      //           if (onSelect) {
      //             onSelect();
      //           }
      //         }}
      //         onDragMove={(e) => {
      //           const imageNode = e.target;
      //           const imgX = imageNode.x();
      //           const imgY = imageNode.y();
      //           const imgW = imageNode.width();
      //           const imgH = imageNode.height();

      //           const centerX = imgX + imgW / 2;
      //           const centerY = imgY + imgH / 2;

      //           dispatch(
      //             updateElement({
      //               id: element.id,
      //               updates: {
      //                 x: imgX,
      //                 y: imgY,
      //                 width_percent: toPercent(imgW, stageWidth),
      //                 height_percent: toPercent(imgH, stageHeight),
      //                 x_percent: toPercent(imgX, stageWidth),
      //                 y_percent: toPercent(imgY, stageHeight),
      //               },
      //             })
      //           );

      //           const frames = elements
      //             .filter(
      //               (el: CanvasElement) =>
      //                 el.type === "frame" &&
      //                 centerX >= el.x &&
      //                 centerX <= el.x + el.width &&
      //                 centerY >= el.y &&
      //                 centerY <= el.y + el.height
      //             )
      //             .sort(
      //               (a: CanvasElement, b: CanvasElement) =>
      //                 elements.indexOf(b) - elements.indexOf(a)
      //             );

      //           const frame = frames[0];

      //           if (!frame) {
      //             wasOverFrameRef.current = false;
      //             return;
      //           }

      //           const isAlreadyHasImage = elements.some(
      //             (el: CanvasElement) =>
      //               el.type === "image" &&
      //               el.frameId === frame.id &&
      //               el.id !== element.id
      //           );

      //           if (isAlreadyHasImage) {
      //             return;
      //           }

      //           if (!wasOverFrameRef.current) {
      //             const frameAspect = frame.width / frame.height;
      //             const imgAspect = imgW / imgH;

      //             let newWidth, newHeight, offsetX, offsetY;

      //             switch (currentFitMode) {
      //               case "fit":
      //                 if (imgAspect > frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;

      //               case "fill":
      //                 if (imgAspect < frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;

      //               case "stretch":
      //                 newWidth = frame.width;
      //                 newHeight = frame.height;
      //                 break;

      //               default:
      //                 if (imgAspect < frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;
      //             }

      //             offsetX = (frame.width - newWidth) / 2;
      //             offsetY = (frame.height - newHeight) / 2;

      //             onChange({
      //               x: frame.x + offsetX,
      //               y: frame.y + offsetY,
      //               width: newWidth,
      //               height: newHeight,
      //               frameId: frame.id,
      //               fitMode: currentFitMode,
      //               width_percent: toPercent(newWidth, stageWidth),
      //               height_percent: toPercent(newHeight, stageHeight),
      //               x_percent: toPercent(frame.x + offsetX, stageWidth),
      //               y_percent: toPercent(frame.y + offsetY, stageHeight),
      //             });

      //             wasOverFrameRef.current = true;
      //           }
      //         }}
      //         onDragEnd={(e) => {
      //           const img = e.target;
      //           const imgW = img.width();
      //           const imgH = img.height();

      //           const centerX = img.x() + imgW / 2;
      //           const centerY = img.y() + imgH / 2;

      //           const frames = elements
      //             .filter(
      //               (el: CanvasElement) =>
      //                 el.type === "frame" &&
      //                 centerX >= el.x &&
      //                 centerX <= el.x + el.width &&
      //                 centerY >= el.y &&
      //                 centerY <= el.y + el.height
      //             )
      //             .sort(
      //               (a: CanvasElement, b: CanvasElement) =>
      //                 elements.indexOf(b) - elements.indexOf(a)
      //             );

      //           const frame = frames[0];

      //           if (frame) {
      //             const isAlreadyHasImage = elements.some(
      //               (el: CanvasElement) =>
      //                 el.type === "image" &&
      //                 el.frameId === frame.id &&
      //                 el.id !== element.id
      //             );

      //             if (isAlreadyHasImage) {
      //               onChange({ x: img.x(), y: img.y(), frameId: null });
      //               wasOverFrameRef.current = false;
      //               return;
      //             }

      //             const frameAspect = frame.width / frame.height;
      //             const imgAspect = imgW / imgH;

      //             let newWidth, newHeight, offsetX, offsetY;

      //             switch (currentFitMode) {
      //               case "fit":
      //                 if (imgAspect > frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;

      //               case "fill":
      //                 if (imgAspect < frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;

      //               case "stretch":
      //                 newWidth = frame.width;
      //                 newHeight = frame.height;
      //                 break;

      //               default:
      //                 if (imgAspect < frameAspect) {
      //                   newWidth = frame.width;
      //                   newHeight = frame.width / imgAspect;
      //                 } else {
      //                   newHeight = frame.height;
      //                   newWidth = frame.height * imgAspect;
      //                 }
      //                 break;
      //             }

      //             offsetX = (frame.width - newWidth) / 2;
      //             offsetY = (frame.height - newHeight) / 2;

      //             onChange({
      //               x: frame.x + offsetX,
      //               y: frame.y + offsetY,
      //               width: newWidth,
      //               height: newHeight,
      //               frameId: frame.id,
      //               fitMode: currentFitMode,
      //               width_percent: toPercent(newWidth, stageWidth),
      //               height_percent: toPercent(newHeight, stageHeight),
      //               x_percent: toPercent(frame.x + offsetX, stageWidth),
      //               y_percent: toPercent(frame.y + offsetY, stageHeight),
      //             });
      //           } else {
      //             onChange({ x: img.x(), y: img.y(), frameId: null });
      //           }

      //           wasOverFrameRef.current = false;
      //         }}
      //         onTransform={(e) => {
      //           const node = e.target;
      //           const newWidth = node.width() * node.scaleX();
      //           const newHeight = node.height() * node.scaleY();
      //           const newX = node.x();
      //           const newY = node.y();

      //           onChange({
      //             x: newX,
      //             y: newY,
      //             width: newWidth,
      //             height: newHeight,
      //             rotation: node.rotation(),
      //             width_percent: toPercent(newWidth, stageWidth),
      //             height_percent: toPercent(newHeight, stageHeight),
      //             x_percent: toPercent(newX, stageWidth),
      //             y_percent: toPercent(newY, stageHeight),
      //           });

      //           node.scaleX(1);
      //           node.scaleY(1);
      //         }}
      //       />
      //       {element.isSelected && (
      //         <div
      //           style={{
      //             position: "absolute",
      //             top: 10,
      //             left: 10,
      //             zIndex: 1000,
      //           }}
      //         >
      //           <select
      //             value={currentFitMode}
      //             onChange={(e) => {
      //               setCurrentFitMode(e.target.value);
      //               if (frame) {
      //                 applyFitMode(e.target.value, frame);
      //               }
      //             }}
      //           >
      //             <option value="fit">Fit</option>
      //             <option value="fill">Fill</option>
      //             <option value="stretch">Stretch</option>
      //           </select>
      //         </div>
      //       )}
      //     </>
      //   );
      // }

    //   case "frame": {
    //   // Find if there's an image associated with this frame
    //   const imageInFrame = elements.find(
    //     (el) => el.type === "image" && el.frameId === element.id
    //   );

    //   // If there's an image, skip rendering the frame here as it will be rendered in the image case
    //   if (imageInFrame) {
    //     return null;
    //   }

    //   // Render standalone frame
    //   return (
    //     <Rect
    //       ref={ref}
    //       x={element.x}
    //       y={element.y}
    //       width={element.width}
    //       height={element.height}
    //       fill={element.fill}
    //       dash={[4, 4]}
    //       stroke={element.stroke}
    //       strokeWidth={element.strokeWidth}
    //       rotation={element.rotation}
    //       draggable
    //       onClick={onSelect}
    //       onDragMove={(e) => {
    //         const node = e.target;
    //         const newX = node.x();
    //         const newY = node.y();

    //         dispatch(
    //           updateElement({
    //             id: element.id,
    //             updates: {
    //               x: newX,
    //               y: newY,
    //               width_percent: toPercent(element.width, stageWidth),
    //               height_percent: toPercent(element.height, stageHeight),
    //               x_percent: toPercent(newX, stageWidth),
    //               y_percent: toPercent(newY, stageHeight),
    //             },
    //           })
    //         );
    //       }}
    //       onTransform={(e) => {
    //         const node = e.target;
    //         const newWidth = node.width() * node.scaleX();
    //         const newHeight = node.height() * node.scaleY();

    //         onChange({
    //           x: node.x(),
    //           y: node.y(),
    //           width: newWidth,
    //           height: newHeight,
    //           rotation: node.rotation(),
    //           width_percent: toPercent(newWidth, stageWidth),
    //           height_percent: toPercent(newHeight, stageHeight),
    //           x_percent: toPercent(node.x(), stageWidth),
    //           y_percent: toPercent(node.y(), stageHeight),
    //         });

    //         node.scaleX(1);
    //         node.scaleY(1);
    //       }}
    //     />
    //   );
    // }

    // case "image": {
    //   const [image] = useImage(element.src || "");
    //   const frame = elements.find(
    //     (f) => f.id === element.frameId
    //   );
    //   const wasOverFrameRef = useRef(false);
    //   const [currentFitMode, setCurrentFitMode] = useState(
    //     element.fitMode || "fill"
    //   );

    //   const applyFitMode = (
    //     newFitMode: string,
    //     targetFrame: CanvasElement
    //   ) => {
    //     const frameAspect = targetFrame.width / targetFrame.height;
    //     const imgAspect = element.width / element.height;

    //     let newWidth, newHeight, offsetX, offsetY;

    //     switch (newFitMode) {
    //       case "fit":
    //         if (imgAspect > frameAspect) {
    //           newWidth = targetFrame.width;
    //           newHeight = targetFrame.width / imgAspect;
    //         } else {
    //           newHeight = targetFrame.height;
    //           newWidth = targetFrame.height * imgAspect;
    //         }
    //         break;

    //       case "fill":
    //         if (imgAspect < frameAspect) {
    //           newWidth = targetFrame.width;
    //           newHeight = targetFrame.width / imgAspect;
    //         } else {
    //           newHeight = targetFrame.height;
    //           newWidth = targetFrame.height * imgAspect;
    //         }
    //         break;

    //       case "stretch":
    //         newWidth = targetFrame.width;
    //         newHeight = targetFrame.height;
    //         break;

    //       default:
    //         if (imgAspect < frameAspect) {
    //           newWidth = targetFrame.width;
    //           newHeight = targetFrame.width / imgAspect;
    //         } else {
    //           newHeight = targetFrame.height;
    //           newWidth = targetFrame.height * imgAspect;
    //         }
    //         break;
    //     }

    //     offsetX = (targetFrame.width - newWidth) / 2;
    //     offsetY = (targetFrame.height - newHeight) / 2;

    //     onChange({
    //       x: targetFrame.x + offsetX,
    //       y: targetFrame.y + offsetY,
    //       width: newWidth,
    //       height: newHeight,
    //       frameId: targetFrame.id,
    //       fitMode: newFitMode,
    //       width_percent: toPercent(newWidth, stageWidth),
    //       height_percent: toPercent(newHeight, stageHeight),
    //       x_percent: toPercent(targetFrame.x + offsetX, stageWidth),
    //       y_percent: toPercent(targetFrame.y + offsetY, stageHeight),
    //     });
    //   };

    //   if (frame) {
    //     return (
    //       <>
    //         <Group
    //           x={frame.x}
    //           y={frame.y}
    //           rotation={frame.rotation}
    //           draggable
    //           onClick={onSelect}
    //           onDragMove={(e) => {
    //             const node = e.target;
    //             const newX = node.x();
    //             const newY = node.y();

    //             // Update frame position
    //             dispatch(
    //               updateElement({
    //                 id: frame.id,
    //                 updates: {
    //                   x: newX,
    //                   y: newY,
    //                   width_percent: toPercent(frame.width, stageWidth),
    //                   height_percent: toPercent(frame.height, stageHeight),
    //                   x_percent: toPercent(newX, stageWidth),
    //                   y_percent: toPercent(newY, stageHeight),
    //                 },
    //               })
    //             );

    //             // Update image position (maintain offset)
    //             const offsetX = element.x - frame.x;
    //             const offsetY = element.y - frame.y;
    //             const newImageX = newX + offsetX;
    //             const newImageY = newY + offsetY;

    //             dispatch(
    //               updateElement({
    //                 id: element.id,
    //                 updates: {
    //                   x: newImageX,
    //                   y: newImageY,
    //                   width_percent: toPercent(element.width, stageWidth),
    //                   height_percent: toPercent(element.height, stageHeight),
    //                   x_percent: toPercent(newImageX, stageWidth),
    //                   y_percent: toPercent(newImageY, stageHeight),
    //                 },
    //               })
    //             );
    //           }}
    //           onTransform={(e) => {
    //             const node = e.target;
    //             const newWidth = node.width() * node.scaleX();
    //             const newHeight = node.height() * node.scaleY();
    //             const scaleX = newWidth / frame.width;
    //             const scaleY = newHeight / frame.height;

    //             // Update frame
    //             dispatch(
    //               updateElement({
    //                 id: frame.id,
    //                 updates: {
    //                   x: node.x(),
    //                   y: node.y(),
    //                   width: newWidth,
    //                   height: newHeight,
    //                   rotation: node.rotation(),
    //                   width_percent: toPercent(newWidth, stageWidth),
    //                   height_percent: toPercent(newHeight, stageHeight),
    //                   x_percent: toPercent(node.x(), stageWidth),
    //                   y_percent: toPercent(node.y(), stageHeight),
    //                 },
    //               })
    //             );

    //             // Update image (scale and center)
    //             const newImgWidth = element.width * scaleX;
    //             const newImgHeight = element.height * scaleY;
    //             const newImgX = node.x() + (newWidth - newImgWidth) / 2;
    //             const newImgY = node.y() + (newHeight - newImgHeight) / 2;

    //             dispatch(
    //               updateElement({
    //                 id: element.id,
    //                 updates: {
    //                   x: newImgX,
    //                   y: newImgY,
    //                   width: newImgWidth,
    //                   height: newImgHeight,
    //                   rotation: node.rotation(),
    //                   width_percent: toPercent(newImgWidth, stageWidth),
    //                   height_percent: toPercent(newImgHeight, stageHeight),
    //                   x_percent: toPercent(newImgX, stageWidth),
    //                   y_percent: toPercent(newImgY, stageHeight),
    //                 },
    //               })
    //             );

    //             node.scaleX(1);
    //             node.scaleY(1);
    //           }}
    //         >
    //           <Rect
    //             x={0}
    //             y={0}
    //             width={frame.width}
    //             height={frame.height}
    //             fill={frame.fill}
    //             dash={[4, 4]}
    //             stroke={frame.stroke}
    //             strokeWidth={frame.strokeWidth}
    //           />
    //           <KonvaImage
    //             ref={ref}
    //             image={image}
    //             x={element.x - frame.x} // Relative to group
    //             y={element.y - frame.y} // Relative to group
    //             width={element.width}
    //             height={element.height}
    //             clipFunc={(ctx) => {
    //               ctx.rect(0, 0, frame.width, frame.height);
    //             }}
    //           />
    //         </Group>

    //         {element.isSelected && (
    //           <div
    //             style={{
    //               position: "absolute",
    //               top: 10,
    //               left: 10,
    //               zIndex: 1000,
    //             }}
    //           >
    //             <select
    //               value={currentFitMode}
    //               onChange={(e) => {
    //                 setCurrentFitMode(e.target.value);
    //                 if (frame) {
    //                   applyFitMode(e.target.value, frame);
    //                 }
    //               }}
    //             >
    //               <option value="fit">Fit</option>
    //               <option value="fill">Fill</option>
    //               <option value="stretch">Stretch</option>
    //             </select>
    //           </div>
    //         )}
    //       </>
    //     );
    //   }

    //   // Image without a frame
    //   return (
    //     <>
    //       <KonvaImage
    //         ref={ref}
    //         image={image}
    //         x={element.x}
    //         y={element.y}
    //         width={element.width}
    //         height={element.height}
    //         draggable
    //         onClick={() => {
    //           if (onSelect) {
    //             onSelect();
    //           }
    //         }}
    //         onDragMove={(e) => {
    //           const imageNode = e.target;
    //           const imgX = imageNode.x();
    //           const imgY = imageNode.y();
    //           const imgW = imageNode.width();
    //           const imgH = imageNode.height();

    //           dispatch(
    //             updateElement({
    //               id: element.id,
    //               updates: {
    //                 x: imgX,
    //                 y: imgY,
    //                 width_percent: toPercent(imgW, stageWidth),
    //                 height_percent: toPercent(imgH, stageHeight),
    //                 x_percent: toPercent(imgX, stageWidth),
    //                 y_percent: toPercent(imgY, stageHeight),
    //               },
    //             })
    //           );

    //           const frames = elements
    //             .filter(
    //               (el) =>
    //                 el.type === "frame" &&
    //                 imgX + imgW / 2 >= el.x &&
    //                 imgX + imgW / 2 <= el.x + el.width &&
    //                 imgY + imgH / 2 >= el.y &&
    //                 imgY + imgH / 2 <= el.y + el.height
    //             )
    //             .sort(
    //               (a, b) => elements.indexOf(b) - elements.indexOf(a)
    //             );

    //           const targetFrame = frames[0];

    //           if (!targetFrame) {
    //             wasOverFrameRef.current = false;
    //             return;
    //           }

    //           const isAlreadyHasImage = elements.some(
    //             (el) =>
    //               el.type === "image" &&
    //               el.frameId === targetFrame.id &&
    //               el.id !== element.id
    //           );

    //           if (isAlreadyHasImage) {
    //             return;
    //           }

    //           if (!wasOverFrameRef.current) {
    //             const frameAspect = targetFrame.width / targetFrame.height;
    //             const imgAspect = imgW / imgH;

    //             let newWidth, newHeight, offsetX, offsetY;

    //             switch (currentFitMode) {
    //               case "fit":
    //                 if (imgAspect > frameAspect) {
    //                   newWidth = targetFrame.width;
    //                   newHeight = targetFrame.width / imgAspect;
    //                 } else {
    //                   newHeight = targetFrame.height;
    //                   newWidth = targetFrame.height * imgAspect;
    //                 }
    //                 break;

    //               case "fill":
    //                 if (imgAspect < frameAspect) {
    //                   newWidth = targetFrame.width;
    //                   newHeight = targetFrame.width / imgAspect;
    //                 } else {
    //                   newHeight = targetFrame.height;
    //                   newWidth = targetFrame.height * imgAspect;
    //                 }
    //                 break;

    //               case "stretch":
    //                 newWidth = targetFrame.width;
    //                 newHeight = targetFrame.height;
    //                 break;

    //               default:
    //                 if (imgAspect < frameAspect) {
    //                   newWidth = targetFrame.width;
    //                   newHeight = targetFrame.width / imgAspect;
    //                 } else {
    //                   newHeight = targetFrame.height;
    //                   newWidth = targetFrame.height * imgAspect;
    //                 }
    //                 break;
    //             }

    //             offsetX = (targetFrame.width - newWidth) / 2;
    //             offsetY = (targetFrame.height - newHeight) / 2;

    //             onChange({
    //               x: targetFrame.x + offsetX,
    //               y: targetFrame.y + offsetY,
    //               width: newWidth,
    //               height: newHeight,
    //               frameId: targetFrame.id,
    //               fitMode: currentFitMode,
    //               width_percent: toPercent(newWidth, stageWidth),
    //               height_percent: toPercent(newHeight, stageHeight),
    //               x_percent: toPercent(targetFrame.x + offsetX, stageWidth),
    //               y_percent: toPercent(targetFrame.y + offsetY, stageHeight),
    //             });

    //             wasOverFrameRef.current = true;
    //           }
    //         }}
    //         onDragEnd={(e) => {
    //           const img = e.target;
    //           const imgW = img.width();
    //           const imgH = img.height();

    //           const centerX = img.x() + imgW / 2;
    //           const centerY = img.y() + imgH / 2;

    //           const frames = elements
    //             .filter(
    //               (el) =>
    //                 el.type === "frame" &&
    //                 centerX >= el.x &&
    //                 centerX <= el.x + el.width &&
    //                 centerY >= el.y &&
    //                 centerY <= el.y + el.height
    //             )
    //             .sort(
    //               (a, b) => elements.indexOf(b) - elements.indexOf(a)
    //             );

    //           const frame = frames[0];

    //           if (frame) {
    //             const isAlreadyHasImage = elements.some(
    //               (el) =>
    //                 el.type === "image" &&
    //                 el.frameId === frame.id &&
    //                 el.id !== element.id
    //             );

    //             if (isAlreadyHasImage) {
    //               onChange({ x: img.x(), y: img.y(), frameId: null });
    //               wasOverFrameRef.current = false;
    //               return;
    //             }

    //             const frameAspect = frame.width / frame.height;
    //             const imgAspect = imgW / imgH;

    //             let newWidth, newHeight, offsetX, offsetY;

    //             switch (currentFitMode) {
    //               case "fit":
    //                 if (imgAspect > frameAspect) {
    //                   newWidth = frame.width;
    //                   newHeight = frame.width / imgAspect;
    //                 } else {
    //                   newHeight = frame.height;
    //                   newWidth = frame.height * imgAspect;
    //                 }
    //                 break;

    //               case "fill":
    //                 if (imgAspect < frameAspect) {
    //                   newWidth = frame.width;
    //                   newHeight = frame.width / imgAspect;
    //                 } else {
    //                   newHeight = frame.height;
    //                   newWidth = frame.height * imgAspect;
    //                 }
    //                 break;

    //               case "stretch":
    //                 newWidth = frame.width;
    //                 newHeight = frame.height;
    //                 break;

    //               default:
    //                 if (imgAspect < frameAspect) {
    //                   newWidth = frame.width;
    //                   newHeight = frame.width / imgAspect;
    //                 } else {
    //                   newHeight = frame.height;
    //                   newWidth = frame.height * imgAspect;
    //                 }
    //                 break;
    //             }

    //             offsetX = (frame.width - newWidth) / 2;
    //             offsetY = (frame.height - newHeight) / 2;

    //             onChange({
    //               x: frame.x + offsetX,
    //               y: frame.y + offsetY,
    //               width: newWidth,
    //               height: newHeight,
    //               frameId: frame.id,
    //               fitMode: currentFitMode,
    //               width_percent: toPercent(newWidth, stageWidth),
    //               height_percent: toPercent(newHeight, stageHeight),
    //               x_percent: toPercent(frame.x + offsetX, stageWidth),
    //               y_percent: toPercent(frame.y + offsetY, stageHeight),
    //             });
    //           } else {
    //             onChange({ x: img.x(), y: img.y(), frameId: null });
    //           }

    //           wasOverFrameRef.current = false;
    //         }}
    //         onTransform={(e) => {
    //           const node = e.target;
    //           const newWidth = node.width() * node.scaleX();
    //           const newHeight = node.height() * node.scaleY();
    //           const newX = node.x();
    //           const newY = node.y();

    //           onChange({
    //             x: newX,
    //             y: newY,
    //             width: newWidth,
    //             height: newHeight,
    //             rotation: node.rotation(),
    //             width_percent: toPercent(newWidth, stageWidth),
    //             height_percent: toPercent(newHeight, stageHeight),
    //             x_percent: toPercent(newX, stageWidth),
    //             y_percent: toPercent(newY, stageHeight),
    //           });

    //           node.scaleX(1);
    //           node.scaleY(1);
    //         }}
    //       />
          
    //     </>
    //   );
    // }

      case "frame": {
        const imageInFrame = (elements as CanvasElement[]).find((el) => el.type === "image" && el.frameId === element.id);

        // If there's an image, skip rendering the frame here as it will be rendered in the image case
        if (imageInFrame) {
          return null;
        }

        // Render standalone frame
        return (
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
        );
      }

      case "image": {
        const [image] = useImage(element.src || "");
        const frame = elements.find((f:CanvasElement) => f.id === element.frameId);
        const wasOverFrameRef = useRef(false);
        const [currentFitMode] = useState(element.fitMode || "fit");

        const applyFitMode = (newFitMode:string, targetFrame:CanvasFrameElement, imgElement:CanvasElement, nativeImage:HTMLImageElement) => {
          const frameAspect = targetFrame.width / targetFrame.height;
          // Use native image dimensions if available, else fall back to element dimensions
          const imgAspect = nativeImage
            ? nativeImage.width / nativeImage.height
            : imgElement.width / imgElement.height || 1; 

          let newWidth, newHeight, offsetX, offsetY;

          switch (newFitMode) {
            case "fit":
              if (imgAspect > frameAspect) {
                newWidth = targetFrame.width;
                newHeight = targetFrame.width / imgAspect;
                offsetX = 0;
                offsetY = (targetFrame.height - newHeight) / 2;
              } else {
                newHeight = targetFrame.height;
                newWidth = targetFrame.height * imgAspect;
                offsetX = (targetFrame.width - newWidth) / 2;
                offsetY = 0;
              }
              break;

            case "fill":
              if (imgAspect > frameAspect) {
                newHeight = targetFrame.height;
                newWidth = targetFrame.height * imgAspect;
                offsetX = (targetFrame.width - newWidth) / 2;
                offsetY = 0;
              } else {
                newWidth = targetFrame.width;
                newHeight = targetFrame.width / imgAspect;
                offsetX = 0;
                offsetY = (targetFrame.height - newHeight) / 2;
              }
              break;

            case "stretch":
              newWidth = targetFrame.width;
              newHeight = targetFrame.height;
              offsetX = 0;
              offsetY = 0;
              break;

            default:
              newWidth = targetFrame.width;
              newHeight = targetFrame.height;
              offsetX = 0;
              offsetY = 0;
              break;
          }

          return {
            x: targetFrame.x + offsetX,
            y: targetFrame.y + offsetY,
            width: newWidth,
            height: newHeight,
            fitMode: newFitMode,
            width_percent: toPercent(newWidth, stageWidth),
            height_percent: toPercent(newHeight, stageHeight),
            x_percent: toPercent(targetFrame.x + offsetX, stageWidth),
            y_percent: toPercent(targetFrame.y + offsetY, stageHeight),
          };
        };

        if (frame) {
          // Ensure image fits frame on initial render or when fit mode/frame changes
          useEffect(() => {
            if (image) {
              const imageUpdates = applyFitMode(currentFitMode, frame, element, image);
              dispatch(
                updateElement({
                  id: element.id,
                  updates: {
                    ...imageUpdates,
                    rotation: frame.rotation, 
                  },
                })
              );
            }
          }, [currentFitMode, frame.width, frame.height, frame.x, frame.y, frame.rotation, image]);

          return (
            <>
              <Group
                x={frame.x}
                y={frame.y}
                rotation={frame.rotation}
                draggable
                onClick={onSelect}
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

                  // Update image position based on fit mode
                  if (image) {
                    const imageUpdates = applyFitMode(currentFitMode, { ...frame, x: newX, y: newY }, element, image);
                    dispatch(
                      updateElement({
                        id: element.id,
                        updates: {
                          ...imageUpdates,
                          rotation: frame.rotation, // Maintain rotation alignment
                        },
                      })
                    );
                  }

                }}
                onTransform={(e) => {
                  const node = e.target;
                  const newWidth = node.width() * node.scaleX();
                  const newHeight = node.height() * node.scaleY();
                  const newX = node.x();
                  const newY = node.y();

                  // Update frame
                  dispatch(
                    updateElement({
                      id: frame.id,
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

                  const updatedFrame: CanvasFrameElement = {
                    ...frame,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                  };

                  // Update image based on fit mode
                  if(image){
                      const imageUpdates = applyFitMode(currentFitMode, updatedFrame, element, image);
                      dispatch(
                        updateElement({
                          id: element.id,
                          updates: {
                            ...imageUpdates,
                            rotation: node.rotation(), // Align rotation with frame
                          },
                        })
                      );
                  }

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              >
                <Rect
                  x={0}
                  y={0}
                  width={frame.width}
                  height={frame.height}
                  fill={frame.fill}
                  dash={[4, 4]}
                  stroke={frame.stroke}
                  strokeWidth={frame.strokeWidth}
                />
                <KonvaImage
                  ref={ref}
                  image={image}
                  x={element.x - frame.x}
                  y={element.y - frame.y}
                  width={element.width}
                  height={element.height}
                  clipFunc={(ctx:CanvasRenderingContext2D) => {
                    ctx.rect(0, 0, frame.width, frame.height);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    const newWidth = node.width() * node.scaleX();
                    const newHeight = node.height() * node.scaleY();
                    const newX = node.x() + frame.x; // Adjust for group offset
                    const newY = node.y() + frame.y;

                    // Update frame to match image size
                    dispatch(
                      updateElement({
                        id: frame.id,
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

                    const updatedFrame: CanvasFrameElement = {
                      ...frame,
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight,
                    };

                    // Update image with fit mode
                    if(image){
                      const imageUpdates = applyFitMode(currentFitMode, updatedFrame, element, image);
                      dispatch(
                        updateElement({
                          id: element.id,
                          updates: {
                            ...imageUpdates,
                            rotation: node.rotation(), 
                          },
                        })
                      );
                    }

                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />
              </Group>
            </>
          );
        }

        // Image without a frame
        return (
          <KonvaImage
            ref={ref}
            image={image}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            draggable
            onClick={onSelect}
            onDragMove={(e) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();

              // Update image position
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

              // Check for frame association
              const frames = (elements as CanvasElement[]).filter(
                (el) =>
                  el.type === "frame" &&
                  newX + element.width / 2 >= el.x &&
                  newX + element.width / 2 <= el.x + el.width &&
                  newY + element.height / 2 >= el.y &&
                  newY + element.height / 2 <= el.y + el.height
              )
              .sort((a, b) => elements.indexOf(b) - elements.indexOf(a));

              const targetFrame = frames[0];

              if (!targetFrame) {
                wasOverFrameRef.current = false;
                return;
              }

              const isAlreadyHasImage = elements.some(
                (el:CanvasElement) => el.type === "image" && el.frameId === targetFrame.id && el.id !== element.id
              );

              if (isAlreadyHasImage) {
                return;
              }

              if (!wasOverFrameRef.current && image) {
                const imageUpdates = applyFitMode(currentFitMode, targetFrame as CanvasFrameElement, element, image);
                dispatch(
                  updateElement({
                    id: element.id,
                    updates: {
                      ...imageUpdates,
                      frameId: targetFrame.id,
                      rotation: targetFrame.rotation, // Align rotation with frame
                    },
                  })
                );
                wasOverFrameRef.current = true;
              }
            }}
            onDragEnd={(e) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();

              // Check for frame association
              const frames = elements
                .filter(
                  (el:CanvasElement) =>
                    el.type === "frame" &&
                    newX + element.width / 2 >= el.x &&
                    newX + element.width / 2 <= el.x + el.width &&
                    newY + element.height / 2 >= el.y &&
                    newY + element.height / 2 <= el.y + el.height
                )
                .sort((a:CanvasElement, b:CanvasElement) => elements.indexOf(b) - elements.indexOf(a));

              const targetFrame = frames[0];

              if (targetFrame) {
                const isAlreadyHasImage = elements.some(
                  (el:CanvasElement) => el.type === "image" && el.frameId === targetFrame.id && el.id !== element.id
                );

                if (isAlreadyHasImage) {
                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        x: newX,
                        y: newY,
                        frameId: null,
                        width_percent: toPercent(element.width, stageWidth),
                        height_percent: toPercent(element.height, stageHeight),
                        x_percent: toPercent(newX, stageWidth),
                        y_percent: toPercent(newY, stageHeight),
                      },
                    })
                  );
                  wasOverFrameRef.current = false;
                  return;
                }

                if (image) {
                  const imageUpdates = applyFitMode(currentFitMode, targetFrame, element, image);
                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        ...imageUpdates,
                        frameId: targetFrame.id,
                        rotation: targetFrame.rotation,
                      },
                    })
                  );
                } else {
                  dispatch(
                    updateElement({
                      id: element.id,
                      updates: {
                        x: newX,
                        y: newY,
                        frameId: null,
                        width_percent: toPercent(element.width, stageWidth),
                        height_percent: toPercent(element.height, stageHeight),
                        x_percent: toPercent(newX, stageWidth),
                        y_percent: toPercent(newY, stageHeight),
                      },
                    })
                  );
                }

                wasOverFrameRef.current = false;
              }
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
                    x: newWidth,
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
        );
      }

      case "icon": {
        const [iconImage] = useImage(`https://api.iconify.design/${element.iconName}.svg`);

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
            onClick={onSelect}>
            <Image
              image={iconImage}
              filters={[Konva.Filters.RGB]}
              red={255}
              green={255}
              blue={255}
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
            onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
                width_percent: toPercent(element.width, stageWidth),
                height_percent: toPercent(element.height, stageHeight),
                x_percent: toPercent(element.x, stageWidth),
                y_percent: toPercent(element.y, stageHeight),
              })
            }
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
        );

      case "circle":
        const circleElement = element as CircleShape;
        const brandedFillCircle = getBrandedFill(circleElement);
        const brandedStrokeCircle = getBrandedStroke(circleElement);

        return (
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

              const newRadius = (circleElement.radius * (scaleX + scaleY)) / 2;

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
        );

      case "ellipse":
        const ellipseElement = element as EllipseShape;
        const brandedFillEllipse = getBrandedFill(ellipseElement);
        const brandedStrokeEllipse = getBrandedStroke(ellipseElement);

        return (
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
        );

      case "triangle":
        const triangleElement = element as TriangleShape;
        const brandedFillTriangle = getBrandedFill(triangleElement);
        const brandedStrokeTriangle = getBrandedStroke(triangleElement);

        return (
          <RegularPolygon
            ref={ref}
            x={triangleElement.x}
            y={triangleElement.y}
            sides={3}
            radius={Math.max(triangleElement.width, triangleElement.height) / 2}
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
                (Math.max(triangleElement.width, triangleElement.height) / 2) *
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
        );

      case "star":
        const starElement = element as StarShape;
        const brandedFillStar = getBrandedFill(starElement);
        const brandedStrokeStar = getBrandedStroke(starElement);

        return (
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
        );

      case "wedge":
        const wedgeElement = element as WedgeShape;
        const brandedFillWedge = getBrandedFill(wedgeElement);
        const brandedStrokeWedge = getBrandedStroke(wedgeElement);

        return (
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
        );

      case "ring":
        const ringElement = element as RingShape;
        const brandedFillRing = getBrandedFill(ringElement);
        const brandedStrokeRing = getBrandedStroke(ringElement);

        return (
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
