import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasElementUnion,
  CanvasFrameElement,
} from "@/features/canvas/types";
// import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { Button } from "@/components/ui/Button";
import { MdBlurOn } from "react-icons/md";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { useGetAllTagQuery, usePostFrameTagMutation } from "@/services/TagsApi";
import { useGetFrameTypesQuery } from "@/services/frameTypesApi";
// import { useGetFramePositionQuery } from "@/services/frmaPosisionApi";

export function FrameProperties({ element }: { element: CanvasFrameElement }) {
  const {
    data: tagsData,
    isLoading: tagsLoading,
    error: errorTags,
  } = useGetAllTagQuery();

  // const {
  //   data: positionData,
  //   isLoading: positionLoading,
  //   error: errorPosition,
  // } = useGetFramePositionQuery();

  const { data: typesData, isLoading: typesLoading } = useGetFrameTypesQuery();

  console.log(typesData);

  // Normalize typesData to options format
  const typeOptions = typesData
    ? typesData.map(([value, label]: [string, string]) => ({
        value,
        label,
      }))
    : [];
  const [postFrameTag, { isLoading: postTagLoading, error: postTagError }] =
    usePostFrameTagMutation();
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

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

  // Handle tag creation and selection
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

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-7">
          <div className="flex gap-4 items-center">
            <ColorInput
              label="border Color"
              value={element.stroke ?? "#000000"}
              onChange={(val) => update({ stroke: val })}
            />
            <div className="">
              <div className="text-sm font-medium mb-1">Transparent</div>
              <Button
                size="sm"
                variant={"outline"}
                className="mr-2 text-gray-500 font-bold"
                onClick={() => update({ stroke: "transparent" })}
              >
                <MdBlurOn />
              </Button>
            </div>
          </div>
          {/* Create select options of assetType */}
          <SelectInput
            isLoading={typesLoading}
            isSearchable
            className="col-span-full"
            label="Asset type"
            value={element.assetType}
            options={typeOptions}
            onChange={(val) => {
              if (typeof val === "string") {
                update({ assetType: val });
              }
            }}
          />
          {/* <div className="col-span-full">
            <TextInput
              label="Label"
              type="text"
              value={element.label}
              onChange={(val) => update({ label: val })}
            />
          </div> */}

          {/* <SelectInput
            isSearchable
            className="col-span-full"
            label="Frame-position"
            value={String(element.position)}
            options={
              Array.isArray(positionData)
                ? positionData.filter((v): v is string => typeof v === "string")
                : []
            }
            onChange={(val) => {
              if (typeof val === "string") {
                update({ position: val });
              }
            }}
            isLoading={positionLoading}
            error={errorPosition ? "Somethin error happen" : ""}
            placeholder="select position..."
          /> */}

          <SelectInput
            isSearchable
            className="col-span-full"
            label="Frame-position"
            value={String(element.frame_position_in_template)}
            options={Array.from({ length: 9 }, (_, i) => String(i + 1))}
            onChange={(val) => {
              if (typeof val === "string") {
                update({ frame_position_in_template: val });
              }
            }}
            // isLoading={positionLoading}
            // error={errorPosition ? "Something error happen" : ""}
            placeholder="select position..."
          />

          <SelectInput
            creatable
            isMulti
            isSearchable
            className="col-span-full"
            label="Tags"
            value={element.tags}
            options={tagOptions}
            valueKey="tag"
            labelKey="tag"
            onChange={handleTagsChange}
            isLoading={tagsLoading || postTagLoading}
            error={errorMessage}
            placeholder="Create or select tags..."
          />
        </div>
      </div>
    </div>
  );
}
