import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  BrandingType,
  CanvasElement,
  CanvasTextElement,
} from "@/features/canvas/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { Button } from "@/components/ui/Button";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaItalic,
} from "react-icons/fa";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { MdBlurOn } from "react-icons/md";
import { toPercentFontSize } from "@/hooks/usePercentConverter";
import { useGetGoogleFontsQuery } from "@/services/googleFontsApi";
import {
  useGetAllTextLabelsQuery,
  usePostTextLabelMutation,
} from "@/services/textLabelsApi";
import { useEffect, useState } from "react";
import { useBrandingResolver } from "@/hooks/useBrandingResolver"; // Added to resolve branded fonts
import { useGetAllTagQuery, usePostFrameTagMutation } from "@/services/TagsApi";

// Utility function to load Google Fonts dynamically
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

// Utility type guard for text elements
function isTextElement(element: CanvasElement): element is CanvasTextElement {
  return element.type === "text";
}

export default function TextProperties({
  element,
}: {
  element: CanvasTextElement;
}) {
  const {
    data: tagsData,
    isLoading: tagsLoading,
    error: errorTags,
  } = useGetAllTagQuery();
  const [postFrameTag, { isLoading: postTagLoading, error: postTagError }] =
    usePostFrameTagMutation();
  // Normalize tagsData.results to options format
  const tagOptions = tagsData
    ? tagsData.map((item) => ({
        id: String(item.id),
        tag: item.tag,
      }))
    : [];

  // Extract error message from errors
  const errorMessage = errorTags
    ? "Failed to load tags. Please try again."
    : postTagError
    ? (postTagError as any).data?.tag?.[0] ||
      "Failed to create tag. Please try again."
    : null;
  const handleTagsChange = async (val: string | string[]) => {
    const values = Array.isArray(val) ? val : val ? [val] : [];
    const currentTags = tagOptions.map((opt) => opt.tag);

    // Identify new tags (not in tagOptions)
    const newTags = values.filter(
      (tag) => tag && !currentTags.includes(tag) && tag.trim().length > 0
    );
    // Post new tags to the API
    for (const newTag of newTags) {
      try {
        await postFrameTag({ tag: newTag }).unwrap();
      } catch (err) {
        console.error("Failed to create tag:", newTag, err);
      }
    }

    // Update element.tags with the final values
    update({ tags: values });
  };
  const {
    data: fontsData,
    isLoading: fontsLoading,
    error: fontsError,
  } = useGetGoogleFontsQuery();
  const {
    data: labelsData,
    isLoading: labelsLoading,
    error: errorLabels,
  } = useGetAllTextLabelsQuery();
  const [
    postTextLabel,
    { isLoading: postTextLabelLoading, error: postTextLabelError },
  ] = usePostTextLabelMutation();
  const { resolveFont } = useBrandingResolver(); // Added to resolve font branding
  const stageWidth = useAppSelector((s) => s.canvas.stageWidth);
  const stageHeight = useAppSelector((s) => s.canvas.stageHeight);
  const dispatch = useAppDispatch();

  // Normalize labelsData.results to options format
  const labelOptions = labelsData
    ? labelsData.map((item) => ({
        id: String(item.id),
        label: item.label,
        example: item.example,
      }))
    : [];
  console.log(labelOptions);
  // get label option by label
  const getLabelOption = (label: string) => {
    return labelOptions.find((opt) => opt.label === label);
  };
  // Handle tag creation and selection
  const handleLabelsChange = async (val: string | string[]) => {
    const label = typeof val === "string" ? val.trim() : "";

    if (!label) {
      update({ toi_labels: "" });
      return;
    }

    const currentTags = labelOptions.map((opt) => opt.label);

    if (!currentTags.includes(label)) {
      try {
        await postTextLabel({ label }).unwrap();
      } catch (err) {
        console.error("Failed to create label:", label, err);
      }
    }
    update({ toi_labels: getLabelOption(label)?.label });
    /*     update({ initialValue: getLabelOption(label)?.example });
    update({ labelId: parseInt(getLabelOption(label)?.id || "0") }); */
    // console.log(element);
  };

  const update = <T extends CanvasTextElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  /* Start Branding Handlers */
  // Get colors from store
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const [branding, setBranding] = useState<string[]>([]);

  // Populate branding options from brandingColors
  useEffect(() => {
    const keysArray = Object.keys(brandingColors);
    setBranding(keysArray);
  }, [brandingColors]);

  // Get fonts from store
  const brandingFamilies = useAppSelector(
    (state) => state.branding.fontFamilies
  );
  const [brandingFamily, setBrandingFamily] = useState<string[]>([]);

  useEffect(() => {
    const keysArray = Object.keys(brandingFamilies);
    setBrandingFamily(keysArray);
  }, [brandingFamilies]);
  /* End Branding Handlers */

  return (
    <div className="space-y-4">
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      {isTextElement(element) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput
              className="col-span-full"
              showOpacity
              label="Text Color"
              value={element.fill ?? "#000000"}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
              className="col-span-full"
              showOpacity
              label="Background"
              value={element.background as string}
              onChange={(val) => update({ background: val })}
              disabled={element.fillBrandingType !== "fixed"}
            />
          </div>
          <SelectInput
            isClearable={false}
            className="col-span-full"
            label="Background Branding"
            value={element.fillBrandingType as string}
            onChange={(val) => {
              if (val !== "fixed") {
                update({
                  fillBrandingType: val as (typeof branding)[number],
                  background: brandingColors[val as (typeof branding)[number]],
                });
              } else {
                update({
                  fillBrandingType: "fixed",
                  background: element.background,
                });
              }
            }}
            options={["fixed", ...branding]}
          />

          <div className="text-sm font-medium mb-1">
            <div>Transparent</div>
            <Button
              size="sm"
              variant={"outline"}
              className="mr-2 text-gray-500 font-bold"
              onClick={() => update({ background: "transparent" })}
            >
              <MdBlurOn />
            </Button>
          </div>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "left" })}
          >
            <FaAlignLeft />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "center" })}
          >
            <FaAlignCenter />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "right" })}
          >
            <FaAlignRight />
          </Button>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-400 font-bold"
            onClick={() =>
              update({
                fontWeight: element.fontWeight === "bold" ? "normal" : "bold",
              })
            }
          >
            <FaBold />
          </Button>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-400 font-bold"
            onClick={() =>
              update({
                fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          >
            <FaItalic />
          </Button>

          <TextInput
            label="Font Size"
            type="number"
            value={(
              parseInt(element.fontSize!.toString() || "") ?? 24
            ).toString()}
            onChange={(val) =>
              update({
                fontSize: Number.parseInt(val),
                fontSize_percent: toPercentFontSize(
                  Number(Number.parseInt(val)),
                  stageWidth,
                  stageHeight
                ),
              } as Partial<CanvasTextElement>)
            }
          />

          {/* Updated Font Family SelectInput to handle both Google Fonts and branded fonts */}
          <SelectInput
            isClearable={false}
            isLoading={fontsLoading}
            error={fontsError ? "Something went wrong" : null}
            label="Font Family"
            value={
              element.fontBrandingType === "fixed"
                ? element.fontFamily ?? "Arial"
                : "Arial"
            }
            onChange={(val) => {
              if (
                typeof val === "string" &&
                element.fontBrandingType === "fixed"
              ) {
                // Load Google Font only if fontBrandingType is "fixed"
                loadGoogleFont(val);
                update({
                  fontFamily: val,
                  fontBrandingType: "fixed",
                } as Partial<CanvasTextElement>);
              }
            }}
            options={
              element.fontBrandingType === "fixed"
                ? fontsData?.items.map((font) => ({
                    label: font.family,
                    value: font.family,
                  })) ?? []
                : brandingFamily.map((key) => ({
                    label: key,
                    value: key,
                  }))
            }
            disabled={element.fontBrandingType !== "fixed"} // Disable if using branded font
          />

          {/* Updated Font Branding SelectInput to resolve branded fonts */}
          <SelectInput
            className="col-span-full"
            label="Font Branding"
            value={element.fontBrandingType ?? "fixed"}
            onChange={(val) => {
              const fontBrandingType = val as string;
              if (fontBrandingType !== "fixed") {
                // Resolve the branded font and load it if it's a Google Font
                const isBrandingType = (value: any): value is BrandingType =>
                  value === "fixed" || value === "dynamic";

                const validBrandingType = isBrandingType(fontBrandingType)
                  ? fontBrandingType
                  : undefined;

                const resolvedFont = resolveFont("", validBrandingType);
                if (resolvedFont.isFile) {
                  loadGoogleFont(resolvedFont.value);
                }
                update({
                  fontBrandingType,
                  fontFamily: resolvedFont.value,
                  fontVariant: resolvedFont.variant,
                } as Partial<CanvasTextElement>);
              } else {
                // Revert to default font when switching to "fixed"
                update({
                  fontBrandingType: "fixed",
                  fontFamily: element.fontFamily,
                  fontVariant: element.fontVariant,
                } as Partial<CanvasTextElement>);
              }
            }}
            options={["fixed", ...brandingFamily]}
          />

          <TextInput
            label="Padding"
            type="number"
            value={(element.padding ?? 10).toString()}
            onChange={(val) =>
              update<CanvasTextElement>({ padding: Number.parseFloat(val) })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Top Left Radius"
              type="number"
              value={(element.borderRadius?.topLeft ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    topLeft: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Top Right Radius"
              type="number"
              value={(element.borderRadius?.topRight ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    topRight: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Right Radius"
              type="number"
              value={(element.borderRadius?.bottomRight ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomRight: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Left Radius"
              type="number"
              value={(element.borderRadius?.bottomLeft ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomLeft: Number.parseFloat(val),
                  },
                })
              }
            />
          </div>

          <SelectInput
            creatable
            isSearchable
            className="col-span-full"
            label="Label"
            value={element.toi_labels ?? []}
            options={labelOptions}
            valueKey="label"
            labelKey="label"
            isLoading={labelsLoading || postTextLabelLoading}
            onChange={handleLabelsChange}
            error={
              errorLabels || postTextLabelError ? "Something went wrong" : null
            }
            placeholder="Create or select labels..."
          />
          <SelectInput
            creatable
            isMulti
            isSearchable
            className="col-span-full"
            label="Tags"
            value={element.tags as string[]}
            options={tagOptions}
            valueKey="tag"
            labelKey="tag"
            onChange={handleTagsChange}
            isLoading={tagsLoading || postTagLoading}
            error={errorMessage}
            placeholder="Create or select tags..."
          />
        </>
      )}
    </div>
  );
}
