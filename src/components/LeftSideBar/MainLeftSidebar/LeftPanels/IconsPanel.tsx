// components/IconsPanel.tsx
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { addElement } from "@/features/canvas/canvasSlice";

type IconItem = { name: string };

export function IconsPanel() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [query, setQuery] = useState("home");
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch(`https://api.iconify.design/search?query=${query}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        const results = data.icons || [];
        setIcons(results.map((name: string) => ({ name })));
      });
  }, [query]);

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
        placeholder="Search Icons..."
      />
      <div className="grid grid-cols-3 gap-3">
        {icons.map((icon) => (
          <button
            key={icon.name}
            onClick={() =>
              dispatch(
                addElement({
                  type: "icon",
                  iconName: icon.name,
                })
              )
            }
            className="p-2 border rounded hover:bg-gray-500"
          >
            <img
              src={`https://api.iconify.design/${icon.name}.svg?color=%23dddddd`}
              alt={icon.name}
              className="w-8 h-8 mx-auto"
            />
          </button>
        ))}
      </div>
    </>
  );
}
