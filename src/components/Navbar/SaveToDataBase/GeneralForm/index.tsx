"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useCreateTemplateMutation,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
} from "@/services/templateApi";
import { useGetAllTagQuery } from "@/services/TagsApi";
import transformElementsKeys from "@/utils/transformElementKeys";
import { useCanvas } from "@/context/CanvasContext";
import { Button } from "@/components/ui/Button";
import { addTemplateId } from "@/features/form/saveFormSlice";
import { useDispatch } from "react-redux";
import { useEffect, useCallback } from "react";
import FramesForm from "../FramesForm";

// Define the form schema with stricter validation
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  group: z.string().min(1, "Group cannot be empty"),
  type: z.enum(["default", "customized", "branded"], {
    required_error: "Type cannot be empty",
  }),
  category: z.enum([
    "commercial_ads",
    "commercial_ads_for_developers",
    "commercial_ads_for_project",
    "seasonal_posts",
    "special_events",
  ]),
  tags: z.array(z.number()),
  aspect_ratio: z.enum(["9:16", "1:1","Square","SQUARE"]),
  raw_input: z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Raw input must be valid JSON" }
  ),
  is_public: z.boolean(),
  default_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  default_secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  icon: z.instanceof(File).optional(), // Icon is a File, not a string
});

type FormValues = z.infer<typeof formSchema>;

export default function GeneralForm() {
  const templateId = useAppSelector((state) => state.saveForm.templateId);
  const {
    data: specificTemplateData,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useGetTemplateQuery(templateId!, { skip: !templateId });
  const { stageRef } = useCanvas();
  const { data: frameTags, isLoading: isTagsLoading } = useGetAllTagQuery();
  const [createTemplate, { isLoading: isCreating }] =
    useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateTemplateMutation();
  const dispatch = useDispatch();

  const elements = useAppSelector((state) => state.canvas.elements);
  const stageHeight = useAppSelector((state) => state.canvas.stageHeight);
  const stageWidth = useAppSelector((state) => state.canvas.stageWidth);
  const aspectRatio = useAppSelector((state) => state.canvas.aspectRatio);
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);
  // start frames handler

  const handleJSON = useCallback(() => {
    const keyMappingsByType = {
      text: {
        backgroundStrokeWidth: "borderWidth",
        backgroundStroke: "borderColor",
        dashed: "borderStyle",
      },
      frame: {
        dash: "borderStyle",
        strokeWidth: "borderWidth",
        stroke: "borderColor",
        // ❌ متشيلش fitMode خلاص! خليه زي ما هو، عايزينه يظهر في الـ export
      },
  };

  const fallbackMapping = {
    stroke: "borderColor",
    strokeWidth: "borderWidth",
    backgroundStroke: "borderColor",
    backgroundStrokeWidth: "borderWidth",
    dashed: "borderStyle",
  };

  const exportData = {
    elements: transformElementsKeys(
      elements,
      keyMappingsByType,
      fallbackMapping
    ),
    stage: {
      height: stageHeight,
      width: stageWidth,
      aspectRatio: aspectRatio,
    },
    branding: {
      colors: brandingColors,
      fonts: brandingFonts,
    },
  };

  return JSON.stringify(exportData, null, 2);
}, [
  elements,
  stageHeight,
  stageWidth,
  aspectRatio,
  brandingColors,
  brandingFonts,
]);

  // Convert RGBA to Hex
  const rgbaToHex = useCallback((color: string): string => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const [r, g, b] = match.slice(1, 4).map(Number);
      return `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
    }
    return color.startsWith("#") ? color : "#000000";
  }, []);

  // Capture Konva stage as PNG
  const captureStageAsPNG = useCallback(async (): Promise<File | null> => {
    if (!stageRef?.current) {
      return null;
    }

    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 0.8, // Increased quality for better previews
        pixelRatio: 2, // Higher resolution for clarity
      });

      const response = await fetch(dataURL);
      const blob = await response.blob();
      return new File([blob], "stage-preview.png", { type: "image/png" });
    } catch (error) {
      console.error("Failed to capture stage as PNG:", error);
      return null;
    }
  }, [stageRef]);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      group: "",
      type: "default",
      category: "commercial_ads",
      tags: [],
      aspect_ratio: aspectRatio || "9:16",
      raw_input: handleJSON(),
      is_public: true,
      default_primary: rgbaToHex(brandingColors?.primary || "#000000"),
      default_secondary_color: rgbaToHex(
        brandingColors?.secondary || "#ffffff"
      ),
      icon: undefined,
    },
  });

  // Reset form when template data changes
  useEffect(() => {
    if (specificTemplateData) {
      form.reset({
        name: specificTemplateData.name || "",
        group: specificTemplateData.group || "",
        type: ["default", "customized", "branded"].includes(
          specificTemplateData.type
        )
          ? (specificTemplateData.type as "default" | "customized" | "branded")
          : "default",
        category: [
          "commercial_ads",
          "commercial_ads_for_developers",
          "commercial_ads_for_project",
          "seasonal_posts",
          "special_events",
        ].includes(specificTemplateData.category)
          ? (specificTemplateData.category as
              | "commercial_ads"
              | "commercial_ads_for_developers"
              | "commercial_ads_for_project"
              | "seasonal_posts"
              | "special_events")
          : "commercial_ads",
        tags: specificTemplateData.tags || [],
        is_public: specificTemplateData.is_public ?? true,
        raw_input: handleJSON(),
        aspect_ratio: aspectRatio || "9:16",
        default_primary: rgbaToHex(brandingColors?.primary || "#000000"),
        default_secondary_color: rgbaToHex(
          brandingColors?.secondary || "#ffffff"
        ),
        icon: undefined,
      });
    }
  }, [
    specificTemplateData,
    form,
    handleJSON,
    aspectRatio,
    brandingColors,
    rgbaToHex,
  ]);

  // Handle tag toggling
  const toggleTag = useCallback(
    (tagId: number) => {
      const currentTags = form.getValues("tags");
      form.setValue(
        "tags",
        currentTags.includes(tagId)
          ? currentTags.filter((id) => id !== tagId)
          : [...currentTags, tagId]
      );
    },
    [form]
  );

  // Get tag by ID
  const getTagById = useCallback(
    (id: number) => frameTags?.find((tag) => tag.id === id),
    [frameTags]
  );

  // Form submission handler
  const onSubmit = useCallback(
    async (values: FormValues, actionType: "addNew" | "update") => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("group", values.group);
        formData.append("type", values.type);
        formData.append("category", values.category);
        values.tags.forEach((tag) => formData.append("tags", tag.toString()));
        formData.append("aspect_ratio", values.aspect_ratio);
        formData.append("raw_input", values.raw_input);
        formData.append("is_public", values.is_public.toString());
        formData.append("default_primary", values.default_primary);
        formData.append(
          "default_secondary_color",
          values.default_secondary_color
        );

        const iconFile = await captureStageAsPNG();
        if (iconFile) {
          formData.append("icon", iconFile);
        }

        let response;
        if (actionType === "addNew") {
          response = await createTemplate(formData).unwrap();
          dispatch(addTemplateId(response.id));
        } else if (templateId || actionType === "update") {
          response = await updateTemplate({
            id: templateId as number,
            data: formData,
          }).unwrap();
        } else {
          throw new Error("Template ID is missing for update action");
        }

        dispatch(addTemplateId(response.id));
      } catch (error) {
        console.error("Failed to submit template:", error);
      }
    },
    [captureStageAsPNG, createTemplate, updateTemplate, dispatch, templateId]
  );

  // Handle preview capture (for debugging)
  const handleCapturePreview = useCallback(async () => {
    const file = await captureStageAsPNG();
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stage-preview.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [captureStageAsPNG]);

  // Loading state
  if (isTemplateLoading || isTagsLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (templateError) {
    return (
      <div className="p-4 text-red-500">
        Failed to load template data. Please try again.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">General Form</h1>

      {/* Preview capture button (for debugging, consider removing in production) */}
      <Button
        type="button"
        variant="outline"
        onClick={handleCapturePreview}
        className="mb-4"
      >
        Preview Stage Capture
      </Button>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const submitEvent = e.nativeEvent as SubmitEvent;
            const actionType =
              (submitEvent.submitter as HTMLButtonElement)?.name || "addNew";
            form.handleSubmit((values) =>
              onSubmit(values, actionType as "addNew" | "update")
            )(e);
          }}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Template Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="customized">Custom</SelectItem>
                    <SelectItem value="branded">Branded</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="commercial_ads">
                      Commercial Ads
                    </SelectItem>
                    <SelectItem value="commercial_ads_for_developers">
                      Commercial Ads for Developers
                    </SelectItem>
                    <SelectItem value="commercial_ads_for_project">
                      Commercial Ads for Project
                    </SelectItem>
                    <SelectItem value="seasonal_posts">
                      Seasonal Posts
                    </SelectItem>
                    <SelectItem value="special_events">
                      Special Events
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormDescription>
                  Click tags to add or remove them from your template
                </FormDescription>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.watch("tags").map((tagId) => {
                    const tag = getTagById(tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleTag(tagId)}
                      >
                        {tag.tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {frameTags?.map(
                    (tag) =>
                      !form.watch("tags").includes(tag.id) && (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.tag}
                        </Badge>
                      )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // control={form.control}
            name="aspect_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect Ratio</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="SQUARE">Square</SelectItem>
                    <SelectItem value="Vertical">vertical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="raw_input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Input</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter raw input data..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter any raw input data or configuration for your template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Make this template public</FormLabel>
                  <FormDescription>
                    Public templates can be viewed and used by other users
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="default_primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input {...field} placeholder="#000000" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_secondary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Secondary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input {...field} placeholder="#ffffff" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || isUpdating}
              name="addNew"
            >
              {isCreating
                ? "Submitting..."
                : templateId
                ? "Add As New"
                : "Submit Template"}
            </Button>
            {templateId && (
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                variant="secondary"
                name="update"
              >
                {isUpdating ? "Updating..." : "Update Template"}
              </Button>
            )}
          </div>
        </form>
      </Form>
      <FramesForm />
    </div>
  );
}
