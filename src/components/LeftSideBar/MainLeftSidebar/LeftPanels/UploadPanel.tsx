"use client";

import type React from "react";

import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";

import { addImageElement } from "@/features/canvas/canvasSlice";

import { BASE_API_URL } from "@/services/api";
import {
  useGetAssetsQuery,
  useLazyGetAssetsQuery,
  type ImageDataWithId,
} from "@/services/images";
import { useGetProjectsQuery } from "@/services/projectsApi";
import { toast } from "sonner";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { useGetFrameTypesQuery } from "@/services/frameTypesApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";

export function UploadPanel() {
  // saving project id
  const [projectId, setProjectId] = useState<number | null>(null);

  const dispatch = useDispatch();
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
  } = useGetProjectsQuery();

  const {
    data: assetsTypes,
    // isLoading: isAssetsTypesLoading,
    isError: isAssetTypesError,
    error: assetTypesError,
  } = useGetFrameTypesQuery();

  // Handle errors
  useEffect(() => {
    if (isProjectsError) {
      console.error("Error fetching projects:", projectsError);
      toast.error("Error fetching projects");
    }
    if (isAssetTypesError) {
      console.error("Error fetching types:", assetTypesError);
      toast.error("Error fetching asset types");
    }
  }, [isProjectsError, projectsError, isAssetTypesError, assetTypesError]);

  // Fetch first page
  const {
    data,
    isLoading: isAssetsLoading,
    isError: isAssetsError,
  } = useGetAssetsQuery({
    project_id: projectId ?? undefined,
  });

  // Lazy fetch next page
  const [triggerNext] = useLazyGetAssetsQuery();

  // Local state for paginated asset accumulation
  const [assets, setAssets] = useState<ImageDataWithId[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // On first page load, set assets and nextUrl
  useEffect(() => {
    if (data) {
      setAssets(data.results);
      setNextUrl(data.next);
    }
  }, [data]);

  // Handle file upload from local input
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        dispatch(
          addImageElement({
            src: img.src,
            width: img.width,
            height: img.height,
          })
        );
        toast.success("Image added to canvas");
      };
    };
    reader.readAsDataURL(file);
  };

  // Load next page of assets
  const handleLoadMore = async () => {
    if (!nextUrl) return;

    try {
      const next = await triggerNext({ next: nextUrl }).unwrap();
      setAssets((prev) => [...prev, ...next.results]);
      setNextUrl(next.next);
    } catch (err) {
      console.error("Error loading next page:", err);
      toast.error("Failed to load more assets");
    }
  };

  // Handle clicking a remote image to add to canvas
  const handleRemoteClick = (asset: ImageDataWithId) => {
    dispatch(
      addImageElement({
        src: `${BASE_API_URL}${asset.image}`,
        width: 300,
        height: 300,
      })
    );
    toast.success(`${asset.name} added to canvas`);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
        <div className="w-12 h-12 mb-4 text-gray-500">
          <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center">
            <CloudUpload className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-medium mb-2">Choose a file</h2>
        <p className="text-sm text-gray-600 mb-4">JPEG, PNG, PDF, SVG</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer h-10 px-6 py-2"
        >
          Browse Files
        </label>
      </div>

      {/* Project Filter */}
      <SelectInput
        value={""}
        isSearchable
        className="w-full"
        label="Filter by Project"
        options={projects?.results || []}
        valueKey="id"
        labelKey="name"
        onChange={(value) => {
          if (typeof value === "number") {
            setProjectId(value);
          } else if (value === "") {
            setProjectId(null);
          }
        }}
        isLoading={isProjectsLoading}
        error={isProjectsError ? "Error fetching projects" : undefined}
        placeholder="All Projects"
      />

      {/* Remote Assets */}
      {isAssetsLoading && (
        <p className="text-center text-gray-600">Loading assets...</p>
      )}
      {isAssetsError && (
        <p className="text-center text-destructive">Failed to load assets.</p>
      )}

      {assetsTypes && assetsTypes.length > 0 && (
        <Tabs defaultValue={assetsTypes[0][1]} className="w-full">
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${assetsTypes.length}, 1fr)`,
            }}
          >
            {assetsTypes.map((type, index) => (
              <TabsTrigger key={type[1]} value={type[1]}>
                {index}
              </TabsTrigger>
            ))}
          </TabsList>

          {assetsTypes.map((type) => (
            <TabsContent key={type[1]} value={type[1]} className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {assets
                  .filter((asset) => asset.type === type[0])
                  .map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleRemoteClick(asset)}
                      className="rounded-lg border hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all overflow-hidden"
                    >
                      <img
                        src={`${BASE_API_URL}${asset.image}`}
                        alt={asset.name}
                        className="w-full h-32 object-contain"
                      />
                      <div className="p-2 text-sm text-gray-700 truncate">
                        {asset.name}
                      </div>
                    </button>
                  ))}
              </div>

              {assets.filter((asset) => asset.type === type[0]).length ===
                0 && (
                <div className="text-center py-8 text-gray-500">
                  No {type[0].toLowerCase()} assets found
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Load More Button */}
      {nextUrl && (
        <Button variant="outline" onClick={handleLoadMore} className="w-full">
          Load More Assets
        </Button>
      )}
    </div>
  );
}
