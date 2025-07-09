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
          // Clone the elements array to avoid mutating the original
          const elements = [...importedData.results.templates[0].json_template.elements];

          // Handle image elements by replacing frame elements
          importedData.results.templates[0].frames.forEach((frame: any) => {
            console.log(frame.assets[0]);
            // Find the frame element in the elements array
            const frameIndex = elements.findIndex(
              (el: any) =>
                el.frame_position_in_template == frame.frame_position_in_template
            );

            if (frameIndex !== -1) {
              const frameElement = elements[frameIndex];
              console.log(frameElement);
              
              const newImageElement = {
                id: "image_" + frame.frame_id,
                type: "image",
                x: frameElement.x,
                y: frameElement.y,
                width: frameElement.width,
                height: frameElement.height,
                x_percent: frameElement.x_percent,
                y_percent: frameElement.y_percent,
                width_percent: frameElement.width_percent,
                height_percent: frameElement.height_percent,
                rotation: frameElement.rotation || 0,
                selected: false,
                src: `https://api.markomlabs.com${frame.assets[0].image_url}`,
                originalWidth: frame.assets[0].width || frameElement.width,
                originalHeight: frame.assets[0].height || frameElement.height,
                fill: frameElement.fill || "transparent",
                opacity: frameElement.opacity || 1,
                frameId: frame.frame_id,
                fitMode: frameElement.fitMode || "fill",
                assetType: frameElement.assetType,
                tags: frameElement.tags || [],
                visible: frameElement.visible !== undefined ? frameElement.visible : true,
                borderRadiusSpecial: frameElement.borderRadiusSpecial || 0,
                borderStyle: frameElement.borderStyle || [0, 0],
                borderWidth: frameElement.borderWidth || 0,
                borderColor: frameElement.borderColor || "transparent",
                objectFit: frameElement.objectFit || "fill",
              };
              // Replace the frame element with the new image element at the same index
              elements[frameIndex] = newImageElement;
            }
          });

          dispatch(setElements(elements));
          dispatch(
            setStageSize({
              height: importedData.results.templates[0].json_template.stage.height,
              width: importedData.results.templates[0].json_template.stage.width,
            })
          );
          dispatch(
            setAspectRatio(
              importedData.results.templates[0].json_template.stage.aspectRatio
            )
          );

          // Import branding
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


  // const handleImportViaBackEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     try {
  //       const importedData = JSON.parse(reader.result as string);
  //       console.log(importedData);
  //       if (
  //         importedData &&
  //         Array.isArray(
  //           importedData.results.templates[0].json_template.elements
  //         ) &&
  //         importedData.results.templates[0].json_template.stage &&
  //         importedData.results.templates[0].json_template.stage.height &&
  //         importedData.results.templates[0].json_template.stage.width &&
  //         importedData.results.templates[0].json_template.stage.aspectRatio
  //       ) {
  //         // Clone the elements array to avoid mutating the original
  //         const elements = [...importedData.results.templates[0].json_template.elements];

  //         // Handle image elements by replacing frame elements
  //         // داخل handleImportViaBackEnd بدل الكود اللي بيحط newImage
  //         importedData.results.templates[0].frames.forEach((frame: any) => {
  //           const frameIndex = elements.findIndex(
  //             (el: any) =>
  //               el.frame_position_in_template == frame.frame_position_in_template
  //           );

  //           if (frameIndex !== -1) {
  //             const frameElement = elements[frameIndex];

  //             // دمج الصورة جوه الفريم
  //             elements[frameIndex] = {
  //               ...frameElement,
  //               type: "frame", // تأكيد إنه فريم
  //               imageData: {
  //                 src: `https://api.markomlabs.com${frame.assets?.[0]?.image_url}`,
  //                 originalWidth: frame.assets?.[0]?.width || frameElement.width,
  //                 originalHeight: frame.assets?.[0]?.height || frameElement.height,
  //                 fitMode: frameElement.fitMode || "fill",
  //                 objectFit: frameElement.objectFit || "fill",
  //                 opacity: frameElement.opacity ?? 1,
  //               },
  //             };
  //           }
  //         });


  //         console.log("elements", elements);
  //         dispatch(setElements(elements));
  //         dispatch(
  //           setStageSize({
  //             height: importedData.results.templates[0].json_template.stage.height,
  //             width: importedData.results.templates[0].json_template.stage.width,
  //           })
  //         );
  //         dispatch(
  //           setAspectRatio(
  //             importedData.results.templates[0].json_template.stage.aspectRatio
  //           )
  //         );

  //         // Import branding
  //         if (importedData.results.templates[0].json_template.branding) {
  //           if (
  //             importedData.results.templates[0].json_template.branding.colors
  //           ) {
  //             Object.entries(
  //               importedData.results.templates[0].json_template.branding.colors
  //             ).forEach(([key, value]) => {
  //               dispatch(addColor({ key, value: String(value) }));
  //             });
  //           }

  //           if (
  //             importedData.results.templates[0].json_template.branding.fonts
  //           ) {
  //             Object.entries(
  //               importedData.results.templates[0].json_template.branding.fonts
  //             ).forEach(([key, fontData]: [string, any]) => {
  //               dispatch(
  //                 addFont({
  //                   key,
  //                   value: fontData.value,
  //                   isFile: fontData.isFile,
  //                   variant: fontData.variant,
  //                 })
  //               );
  //             });
  //           }
  //         }
  //       } else {
  //         alert("Invalid file format.");
  //       }
  //     } catch (error) {
  //       alert("Failed to import. Invalid JSON.");
  //       console.log(error);
  //     }
  //   };

  //   reader.readAsText(file);
  // };


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
