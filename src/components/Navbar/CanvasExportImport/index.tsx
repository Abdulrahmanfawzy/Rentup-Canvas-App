import { useRef, type FC } from "react";
import { FaFileImport, FaSave } from "react-icons/fa";
import { Button } from "../../ui/Button";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  setElements,
  setStageSize,
  setAspectRatio,
} from "@/features/canvas/canvasSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCanvas } from "@/context/CanvasContext";
import { addColor, addFont } from "@/features/branding/brandingSlice";
import { BASE_API_URL } from "@/services/api";

const CanvasExportImport: FC = () => {
  const dispatch = useAppDispatch();
  const {
    handleExportJSON,
    handleExportPNG,
    handleExportSVG,
    handleExportSummary,
  } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileViaBackEndInputRef = useRef<HTMLInputElement>(null);

  // Import handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);

        if (
          importedData &&
          Array.isArray(importedData.elements) &&
          importedData.stage &&
          importedData.stage.height &&
          importedData.stage.width &&
          importedData.stage.aspectRatio
        ) {
          dispatch(setElements(importedData.elements));
          dispatch(
            setStageSize({
              height: importedData.stage.height,
              width: importedData.stage.width,
            })
          );
          dispatch(setAspectRatio(importedData.stage.aspectRatio));

          // ✅ استيراد الـ branding
          if (importedData.branding) {
            if (importedData.branding.colors) {
              Object.entries(importedData.branding.colors).forEach(
                ([key, value]) => {
                  dispatch(addColor({ key, value: String(value) }));
                }
              );
            }

            if (importedData.branding.fonts) {
              Object.entries(importedData.branding.fonts).forEach(
                ([key, fontData]: [string, any]) => {
                  dispatch(
                    addFont({
                      key,
                      value: fontData.value,
                      isFile: fontData.isFile,
                      variant: fontData.variant,
                    })
                  );
                }
              );
            }
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
      }
    };

    reader.readAsText(file);
  };
  // handle Import Via Back-End
  /* add image to frames like this
     {
      "id": "0F_6JNANZWYNOxUDSQrwG",
      "type": "image",
      "x": 409,
      "y": 305,
      "width": 250,
      "height": 250,
      "rotation": 0,
      "selected": false,
      "src": "https://djangoapi.markomlabs.com/media/assets/images/%D8%A7%D9%85%D9%88%D8%A7%D8%AC-%D8%A7%D9%84%D8%B3%D8%A7%D8%AD%D9%84-%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D9%84%D9%8A-6.jpg",
      "originalWidth": 300,
      "originalHeight": 300,
      "fill": "",
      "width_percent": 0.23148148148148148,
      "height_percent": 0.23148148148148148,
      "x_percent": 0.3787037037037037,
      "y_percent": 0.2824074074074074,
      "frameId": "1",
      "fitMode": "fill"
    }
      and data will have into file like this         "frames": [
          {
            "frame_id": 113,
            "type": "image",
            "frame_position_in_template": 1,
            "tags": [
              "horizontal"
            ],
            "assets": [
              {
                "id": 64,
                "name": "1 - 1:1",
                "image_url": "/media/assets/images/Frame_57.png",
                "type": "image",
                "tags": [
                  "horizontal",
                  "down-focus",
                  "Dark"
                ]
              }
            ]
          },
          {
            "frame_id": 114,
            "type": "developer_logo",
            "frame_position_in_template": 2,
            "tags": [
              "vertical",
              "Icon + Txt"
            ],
            "assets": [
              {
                "id": 48,
                "name": "Palm Hills Developments3",
                "image_url": "/media/assets/images/V_with_Logo.svg",
                "type": "developer_logo",
                "tags": [
                  "vertical",
                  "Icon + Txt",
                  "On Dark Bgd"
                ]
              }
            ]
          },
          {
            "frame_id": 115,
            "type": "project_logo",
            "frame_position_in_template": 3,
            "tags": [
              "horizontal"
            ],
            "assets": [
              {
                "id": 49,
                "name": "Badya Logo",
                "image_url": "/media/assets/images/badya_new_logo_copy_1.png",
                "type": "project_logo",
                "tags": [
                  "horizontal",
                  "TXT W/O Icon",
                  "On Light Bgd"
                ]
              }
            ]
          }
        ]
  */
  const handleImportViaBackEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);
        console.log(importedData);
        if (
          importedData &&
          Array.isArray(
            importedData.results.templates[0].json_template.elements
          ) &&
          importedData.results.templates[0].json_template.stage &&
          importedData.results.templates[0].json_template.stage.height &&
          importedData.results.templates[0].json_template.stage.width &&
          importedData.results.templates[0].json_template.stage.aspectRatio
        ) {
          // handle image into elements
          importedData.results.templates[0].frames.forEach((frame: any) => {
            console.log(frame.assets[0]);
            // search about frame in elements
            const frameElement =
              importedData.results.templates[0].json_template.elements.find(
                (el: any) =>
                  el.frame_position_in_template ==
                  frame.frame_position_in_template
              );
            console.log("frame", frameElement);
            const newImageElement = {
              id: "image_" + frame.frame_id,
              type: "image",
              x: frameElement.x,
              y: frameElement.y,
              width: frameElement.width,
              height: frameElement.height,
              rotation: 0,
              selected: false,
              src: `${BASE_API_URL}${frame.assets[0].image_url}`,
              originalWidth: frame.assets[0].width,
              originalHeight: frame.assets[0].height,
              fill: "",
              width_percent: 0.23148148148148148,
              height_percent: 0.23148148148148148,
              x_percent: 0.3787037037037037,
              y_percent: 0.2824074074074074,
              frameId: frame.frame_id,
              fitMode: "fill",
            };
            importedData.results.templates[0].json_template.elements.push(
              newImageElement
            );
          });
          console.log("data", importedData.results.templates[0].json_template);
          dispatch(
            setElements(
              importedData.results.templates[0].json_template.elements
            )
          );
          dispatch(
            setStageSize({
              height:
                importedData.results.templates[0].json_template.stage.height,
              width:
                importedData.results.templates[0].json_template.stage.width,
            })
          );
          dispatch(
            setAspectRatio(
              importedData.results.templates[0].json_template.stage.aspectRatio
            )
          );

          // ✅ استيراد الـ branding
          if (importedData.results.templates[0].json_template.branding) {
            if (
              importedData.results.templates[0].json_template.branding.colors
            ) {
              Object.entries(
                importedData.results.templates[0].json_template.branding.colors
              ).forEach(([key, value]) => {
                dispatch(addColor({ key, value: String(value) }));
              });
            }

            if (
              importedData.results.templates[0].json_template.branding.fonts
            ) {
              Object.entries(
                importedData.results.templates[0].json_template.branding.fonts
              ).forEach(([key, fontData]: [string, any]) => {
                dispatch(
                  addFont({
                    key,
                    value: fontData.value,
                    isFile: fontData.isFile,
                    variant: fontData.variant,
                  })
                );
              });
            }
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
        console.log(error);
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button
          variant="secondary"
          onClick={() => fileViaBackEndInputRef.current?.click()}
        >
          <FaFileImport className="mr-2" />
          Import Via Back-End
        </Button>
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaFileImport className="mr-2" />
          Import
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileViaBackEndInputRef}
          className="hidden"
          onChange={handleImportViaBackEnd}
        />
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              <FaSave className="mr-2" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Save As</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExportPNG}>PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                JSON File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSummary}>
                Summary File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSVG} disabled>
                SVG
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default CanvasExportImport;
