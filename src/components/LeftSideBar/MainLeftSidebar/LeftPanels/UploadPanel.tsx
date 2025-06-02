import { useDispatch } from "react-redux";
import { addImageElement } from "../../../../features/canvas/canvasSlice";
import { FaCloudUploadAlt } from "react-icons/fa";

export function UploadPanel() {
  const dispatch = useDispatch();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        dispatch(
          addImageElement({
            src: img.src,
            width,
            height,
          })
        );
      };
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto ">
      <div className="border-2 border-dashed border-gray-400 rounded-lg p-5 flex flex-col items-center justify-center">
        <div className="w-10 h-10 mb-2 text-gray-700">
          <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center">
            <FaCloudUploadAlt className="w-5 h-5" />
          </div>
        </div>

        <h2 className="text-xl font-medium  mb-2">Choose a file</h2>

        <p className=" text-[12px] mb-4">JPEG, PNG, PDG, SVG</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e)}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer h-9 px-4 py-2 has-[>svg]:px-3"
        >
          Browse File
        </label>
      </div>
    </div>
  );
}
