import type { AspectRatio } from "../../../features/canvas/types";
import { useAspectRatioChange } from "../../../hooks/useAspectRatioChange";

export function AspectRatioSelector() {
  const changeAspectRatio = useAspectRatioChange();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Aspect Ratio</label>
      <select className="select-input" onChange={(e) => changeAspectRatio(e.target.value as AspectRatio)}>
        <option value="1:1">1:1</option>
        <option value="9:16">9:16</option>
      </select>
    </div>
  );
}
