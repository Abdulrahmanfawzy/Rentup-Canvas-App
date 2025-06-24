import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

import { addImageElement } from "@/features/canvas/canvasSlice";

import { BASE_API_URL } from "@/services/api";
import { Button } from "@/components/ui/Button";
import {
  useGetAssetsQuery,
  useLazyGetAssetsQuery,
  type ImageDataWithId,
} from "@/services/images";

export function UploadPanel() {
  const dispatch = useDispatch();

  // Fetch first page
  const { data, isLoading, isError } = useGetAssetsQuery();

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
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-400 rounded-lg p-5 flex flex-col items-center justify-center">
        <div className="w-10 h-10 mb-2 text-gray-700">
          <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center">
            <FaCloudUploadAlt className="w-5 h-5" />
          </div>
        </div>

        <h2 className="text-xl font-medium mb-2">Choose a file</h2>
        <p className="text-[12px] mb-4">JPEG, PNG, PDF, SVG</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer h-9 px-4 py-2"
        >
          Browse File
        </label>
      </div>

      {/* Remote Assets */}
      {isLoading && <p>Loading assets...</p>}
      {isError && <p className="text-destructive">Failed to load assets.</p>}

      <div
        className="grid grid-cols-2
      
      gap-4"
      >
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => handleRemoteClick(asset)}
            className="rounded border hover:shadow focus:outline-none"
          >
            <img
              src={`${BASE_API_URL}${asset.image}`}
              alt={asset.name}
              className="w-full h-auto object-cover"
            />
          </button>
        ))}
      </div>

      {/* Load More Button */}
      {nextUrl && (
        <Button variant="outline" onClick={handleLoadMore} className="w-full">
          Load more
        </Button>
      )}
    </div>
  );
}
