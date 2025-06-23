import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  CanvasElementUnion,
  CanvasTextElement,
} from "@/features/canvas/types";
import { useAppSelector } from "@/hooks/useRedux";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { useGetAllTagQuery, type TagResponse } from "@/services/TagsApi";
import {
  useGetAllTextLabelsQuery,
  type LabelResponse,
} from "@/services/textLabelsApi"; // Assuming you have this API
import { useCreateTemplateTextBoxMutation } from "@/services/templateTextsApi";

type TextSummaryElement = {
  toi_labels: number;
  tags: number[];
  text: string;
};

interface FormData {
  textBoxes: TextSummaryElement[];
}

function isCanvasTextElement(el: CanvasElementUnion): el is CanvasTextElement {
  return el.type === "text";
}

export default function TextsForm() {
  const { data: tags, isLoading: isTagsLoading } = useGetAllTagQuery();
  const { data: labels, isLoading: isLabelsLoading } =
    useGetAllTextLabelsQuery();
  const [createText, { isLoading: isCreatingText }] =
    useCreateTemplateTextBoxMutation();

  const elements = useAppSelector(
    (state) => state.canvas.elements
  ) as CanvasElementUnion[];
  const templateId = useAppSelector((state) => state.saveForm.templateId);

  const getIdByTag = (tag: string): number | null => {
    const item = tags?.find((obj: TagResponse) => obj.tag === tag);
    return item ? item.id : null;
  };

  const getIdByLabel = (label: string): number | null => {
    const item = labels?.find((obj: LabelResponse) => obj.label === label);
    return item ? item.id : null;
  };

  // Generate text boxes array
  const textBoxes = (): TextSummaryElement[] => {
    return elements.filter(isCanvasTextElement).map((el) => ({
      tags:
        el.tags
          ?.map((tag) => getIdByTag(tag))
          .filter((id): id is number => id !== null) || [],
      toi_labels: el.toi_labels ? getIdByLabel(el.toi_labels) ?? 0 : 0,
      text: el.text || "",
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!templateId) {
      console.error(
        "Template ID is missing. Please submit the general form first."
      );
      return;
    }

    const allTextBoxes = textBoxes();

    if (allTextBoxes.length === 0) {
      console.error(
        "No text boxes to submit. Please add text elements to the canvas."
      );
      return;
    }

    for (const textBox of allTextBoxes) {
      const payload = {
        template: templateId,
        initial_value: textBox.text,
        toi_label: textBox.toi_labels,
        tags: textBox.tags,
      };

      try {
        const res = await createText(payload).unwrap();
        console.log("Text sent successfully:", res);
      } catch (error) {
        console.error("Error sending text:", error);
      }
    }
  };

  const methods = useForm<FormData>({
    defaultValues: {
      textBoxes: [], // Initialize with empty array; we'll populate dynamically
    },
  });

  if (isTagsLoading || isLabelsLoading) {
    return <p>Loading tags and labels...</p>;
  }

  if (!elements || elements.length === 0) {
    return <p>Please add text elements to the canvas</p>;
  }

  if (!templateId) {
    return <p>Please submit the general form first</p>;
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {textBoxes().map((textBox, index) => (
          <div
            key={index}
            className="space-y-2 border-2 border-accent p-2 rounded"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  value={`Text Box ${index + 1}`}
                  placeholder="Text Box Name"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Input
                  value={textBox.text}
                  placeholder="Text content"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>TOI Label</FormLabel>
              <FormControl>
                <Input
                  value={
                    labels?.find(
                      (l: LabelResponse) => l.id === textBox.toi_labels
                    )?.label || "No label assigned"
                  }
                  placeholder="TOI Label"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                {textBox.tags.length > 0 ? (
                  textBox.tags.map((tagId, tagIndex) => {
                    const tagName =
                      tags?.find((t: TagResponse) => t.id === tagId)?.tag ||
                      "Unknown";
                    return (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {tagName}
                      </Badge>
                    );
                  })
                ) : (
                  <p>No tags assigned</p>
                )}
              </div>
            </FormItem>
          </div>
        ))}

        <p className="text-red-500 text-sm">
          If you want to update the text boxes, please update the template
          first.
        </p>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isCreatingText}
        >
          {isCreatingText ? "Saving..." : "Save Text Boxes"}
        </Button>
      </div>
    </FormProvider>
  );
}
