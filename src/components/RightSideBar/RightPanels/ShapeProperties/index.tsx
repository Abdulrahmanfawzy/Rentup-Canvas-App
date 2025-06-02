import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement, RectangleShape } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { InputRange } from "@/components/ui/controlled-inputs/InputRange";
import { useState, useEffect } from "react";
import { BsBorderWidth } from "react-icons/bs";
import { Button } from "@/components/ui/Button";
import { FaLock, FaUnlock } from "react-icons/fa";
import {
  RxCornerBottomLeft,
  RxCornerBottomRight,
  RxCorners,
  RxCornerTopLeft,
  RxCornerTopRight,
} from "react-icons/rx";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";

const isRectangleElement = (el: CanvasElement): el is RectangleShape => {
  return el.type === "rectangle";
};

export function ShapeProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const [individualCorners, setIndividualCorners] = useState(false);
  // get colors from store
  const brandingColors = useAppSelector((state) => state.branding.colors);

  const [branding, setBranding] = useState<string[]>([]);

  // Populate branding options from brandingColors
  useEffect(() => {
    const keysArray = Object.keys(brandingColors);
    setBranding(keysArray);
  }, [brandingColors]);
  // Check if corners are already different when component mounts (for rectangles)
  useEffect(() => {
    if (isRectangleElement(element)) {
      const br = element.borderRadius || {};
      const hasIndividualCorners =
        br.topLeft !== br.topRight ||
        br.topLeft !== br.bottomRight ||
        br.topLeft !== br.bottomLeft;

      if (hasIndividualCorners) {
        setIndividualCorners(true);
      }
    }
  }, [element]);

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-full my-2">
            <InputRange
              label="Opacity"
              value={element.opacity ?? 1}
              onChange={(val) => update({ opacity: val })}
            />
          </div>
          <div className="grid grid-cols-2 col-span-full gap-4">
            <ColorInput
              className="col-span-full"
              showOpacity
              label="Fill Color"
              value={element.fill}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
              showOpacity
              className="col-span-full"
              label="Stroke Color"
              value={element.stroke ?? "#000000"}
              onChange={(val) => update({ stroke: val })}
            />
            <SelectInput
              className="col-span-full"
              label="Fill Branding"
              value={element.fillBrandingType ?? "fixed"}
              onChange={(val) =>
                update({
                  fillBrandingType: val as (typeof branding)[number],
                })
              }
              options={branding as unknown as string[]}
            />
            <SelectInput
              className="col-span-full"
              label="Stroke Branding"
              value={element.strokeBrandingType ?? "fixed"}
              onChange={(val) =>
                update({
                  strokeBrandingType: val as (typeof branding)[number],
                })
              }
              options={branding as unknown as string[]}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 col-span-full items-center text-sm">
            <h4 className="col-span-full mb-2">Stroke Width</h4>
            <TextInput
              label={<BsBorderWidth />}
              type="number"
              min={0}
              value={element.strokeWidth?.toString() ?? "0"}
              onChange={(val) =>
                update({ strokeWidth: Number.parseFloat(val) })
              }
            />
          </div>
        </div>
      </div>

      {/* Rectangle Corner Radius */}
      {isRectangleElement(element) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Corner Radius</h4>

          <div className="flex flex-row-reverse gap-4 items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIndividualCorners(!individualCorners)}
              aria-label="Toggle C"
            >
              {individualCorners === false ? <FaLock /> : <FaUnlock />}
            </Button>
            {!individualCorners ? (
              <TextInput
                label={<RxCorners />}
                type="number"
                value={((element.cornerRadius as number) || 0).toString()}
                onChange={(val) => {
                  const radius = Number.parseFloat(val);
                  update<RectangleShape>({
                    cornerRadius: radius,
                    borderRadius: {
                      topLeft: radius,
                      topRight: radius,
                      bottomRight: radius,
                      bottomLeft: radius,
                    },
                  });
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  label={<RxCornerTopLeft />}
                  type="number"
                  value={(element.borderRadius?.topLeft ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        topLeft: Number.parseFloat(val),
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerTopRight />}
                  type="number"
                  value={(element.borderRadius?.topRight ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        topRight: Number.parseFloat(val),
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerBottomLeft />}
                  type="number"
                  value={(element.borderRadius?.bottomLeft ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        bottomLeft: Number.parseFloat(val),
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerBottomRight />}
                  type="number"
                  value={(element.borderRadius?.bottomRight ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        bottomRight: Number.parseFloat(val),
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
