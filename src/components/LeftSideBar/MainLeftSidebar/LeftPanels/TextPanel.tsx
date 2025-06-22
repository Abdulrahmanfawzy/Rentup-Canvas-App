import { Button } from "@/components/ui/Button";
import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useGetAllTextLabelsQuery } from "@/services/textLabelsApi";
import { useState } from "react";


export function TextPanel() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allLabels, isLoading, error } = useGetAllTextLabelsQuery();

  const filteredLabels = allLabels?.filter((item) =>
    (item.example?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.label?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Button onClick={() => dispatch(addElement({ type: "text", text: "Edit Me Now..." }))}>
        Add Text
      </Button>

      <input
        type="text"
        placeholder="Search examples..."
        className="mt-4 p-2 border rounded w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mt-4">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading labels</p>}

        {filteredLabels && filteredLabels.length > 0 ? (
          filteredLabels.map((item) =>
            item.example ? (
              <div
                key={item.id}
                className="mb-2 p-2 cursor-pointer border rounded"
              >
                <p
                  onClick={() =>
                    dispatch(
                      addElement({
                        type: "text",
                        text: item.example,
                        toi_labels: [item.label],
                      })
                    )
                  }
                >
                  {item.example}
                </p>
              </div>
            ) : null
          )
        ) : (
          <p>No result found</p>
        )}
      </div>
    </div>
  );
}