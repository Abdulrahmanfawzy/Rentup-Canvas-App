"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  addColor,
  removeColor,
  setColor,
  addFont,
  removeFont,
} from "@/features/branding/brandingSlice";
import { Button } from "../../../ui/Button";
import { TextInput } from "../../../ui/controlled-inputs/TextInput";
import { FileUploadInput } from "../../../ui/controlled-inputs/FileUploadInput";
import { MdDeleteOutline } from "react-icons/md";
import { ColorInput } from "../../../ui/controlled-inputs/ColorInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useGetGoogleFontsQuery } from "../../../../services/googleFontsApi";
import SelectInput, {
  type SelectOption,
} from "@/components/ui/controlled-inputs/SelectInput";

export function BrandingPanel() {
  const dispatch = useAppDispatch();
  const colors = useAppSelector((state) => state.branding.colors);
  const fontFamilies = useAppSelector((state) => state.branding.fontFamilies);
  const elements = useAppSelector((state) => state.canvas.elements);

  const [newKey, setNewKey] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [fontKey, setFontKey] = useState("");
  const [fontSource, setFontSource] = useState<"google" | "upload">("google");
  const [selectedGoogleFont, setSelectedGoogleFont] = useState<string>("");
  const [uploadedFontFile, setUploadedFontFile] = useState<File | null>(null);

  // Fetch Google Fonts
  const { data: googleFonts, isLoading: isFontsLoading } =
    useGetGoogleFontsQuery();

  // Prepare Google Fonts options
  const fontOptions: SelectOption[] =
    googleFonts?.items.map((font) => ({
      value: font.family,
      label: font.family,
    })) || [];

  // Inject @font-face for uploaded fonts
  useEffect(() => {
    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
    const styleSheet = styleElement.sheet;

    // Clear existing rules
    while (styleSheet?.cssRules.length) {
      styleSheet.deleteRule(0);
    }

    // Add @font-face rules for uploaded fonts
    Object.entries(fontFamilies).forEach(([key, fontData]) => {
      if (fontData.isFile) {
        // In a real app, fontData.value should be the URL from the server
        const fontUrl = `/fonts/${fontData.value}`; // Placeholder path
        const fontFaceRule = `
          @font-face {
            font-family: '${key}';
            src: url('${fontUrl}') format('truetype');
          }
        `;
        styleSheet?.insertRule(fontFaceRule, styleSheet.cssRules.length);
      }
    });

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [fontFamilies]);

  const handleAddColor = () => {
    if (newKey.trim()) {
      dispatch(addColor({ key: newKey.trim(), value: newColor }));
      setNewKey("");
      setNewColor("#000000");
    }
  };

  const handleUpdateColor = (key: string, value: string) => {
    dispatch(setColor({ key, value }));
    elements.forEach((element) => {
      if (
        element.fillBrandingType === key ||
        element.strokeBrandingType === key
      ) {
        dispatch(
          updateElement({
            id: element.id,
            updates: { opacity: element.opacity || 1 },
          })
        );
      }
    });
  };

  const handleDeleteColor = (key: string) => {
    dispatch(removeColor(key));
  };

  const handleAddFont = async () => {
    if (!fontKey.trim()) return;

    if (fontSource === "google" && selectedGoogleFont) {
      dispatch(addFont({ key: fontKey.trim(), value: selectedGoogleFont }));
    } else if (fontSource === "upload" && uploadedFontFile) {
      // In a real app, upload the file to a server and get a URL
      // For this example, we use the file name as a placeholder
      const fontUrl = uploadedFontFile.name; // Replace with actual server URL
      dispatch(addFont({ key: fontKey.trim(), value: fontUrl, isFile: true }));
    }

    setFontKey("");
    setSelectedGoogleFont("");
    setUploadedFontFile(null);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Branding Colors</h2>

      {/* Existing Colors */}
      <div className="space-y-2">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex flex-col w-full shadow gap-2">
            <span className="w-full font-medium">{key}</span>
            <ColorInput
              showOpacity
              value={value}
              onChange={(val) => handleUpdateColor(key, val)}
            />
            <Button variant="outline" onClick={() => handleDeleteColor(key)}>
              <MdDeleteOutline />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Color */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">Add New Color</h3>
        <div className="flex flex-col items-center gap-2 mb-3">
          <TextInput
            className="w-full"
            value={newKey}
            placeholder="e.g. highlight"
            onChange={(val) => setNewKey(val)}
          />
          <ColorInput
            showOpacity
            className="w-full"
            value={newColor}
            onChange={(val) => setNewColor(val)}
          />
        </div>
        <Button onClick={handleAddColor}>Add New Color Branding</Button>
      </div>

      {/* Existing Fonts */}
      <div className="space-y-2">
        <h3 className="font-semibold">Font Families</h3>
        {Object.entries(fontFamilies).map(([key, fontData]) => (
          <div key={key} className="flex flex-col w-full shadow gap-2">
            <span className="w-full font-medium">{key}</span>
            <span>
              {fontData.value}{" "}
              {fontData.isFile ? "(Uploaded)" : "(Google Font)"}
            </span>
            <Button variant="outline" onClick={() => dispatch(removeFont(key))}>
              <MdDeleteOutline />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Font */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">Add New Font</h3>
        <div className="flex flex-col items-center gap-2 mb-3">
          <TextInput
            className="w-full"
            value={fontKey}
            placeholder="e.g. primaryFont"
            onChange={(val) => setFontKey(val)}
          />
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant={fontSource === "google" ? "default" : "outline"}
              onClick={() => setFontSource("google")}
            >
              Google Fonts
            </Button>
            <Button
              size="sm"
              variant={fontSource === "upload" ? "default" : "outline"}
              onClick={() => setFontSource("upload")}
            >
              File
            </Button>
          </div>
          {fontSource === "google" ? (
            <SelectInput
              label="Select Google Font"
              value={selectedGoogleFont}
              onChange={(val) => setSelectedGoogleFont(val as string)}
              options={fontOptions}
              placeholder="Select a font..."
              isSearchable
              isLoading={isFontsLoading}
              className="w-full"
            />
          ) : (
            <FileUploadInput
              label="Upload TTF Font"
              onChange={(file) => setUploadedFontFile(file)}
              accept=".ttf"
              className="w-full"
            />
          )}
        </div>
        <Button onClick={handleAddFont} disabled={!fontKey.trim()}>
          Add New Font Branding
        </Button>
      </div>
    </div>
  );
}
