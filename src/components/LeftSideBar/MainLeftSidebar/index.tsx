import { useAppSelector } from "@/hooks/useRedux";
import type { FC } from "react";
import { ShapesPanel } from "./LeftPanels/Shapes";
import { TextPanel } from "./LeftPanels/TextPanel";
import { LayerPanel } from "./LeftPanels/LayerPanel";
import { FramePanel } from "./LeftPanels/FramePanel";
import { UploadPanel } from "./LeftPanels/UploadPanel";
import { IconsPanel } from "./LeftPanels/IconsPanel";
import QRCodePanel from "./LeftPanels/QRCodePanel";
import { BrandingPanel } from "./LeftPanels/BrandingPanel";

const MainSidebar: FC = () => {
  const { activeCategory } = useAppSelector((state) => state.ui);

  return (
    <div className="h-full w-64 bg-card border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 capitalize">
          {activeCategory}
        </h2>
        {activeCategory === "shapes" && <ShapesPanel />}
        {activeCategory === "frame" && <FramePanel />}
        {activeCategory === "upload" && <UploadPanel />}
        {activeCategory === "text" && <TextPanel />}
        {activeCategory === "layers" && <LayerPanel />}
        {activeCategory === "icons" && <IconsPanel />}
        {activeCategory === "qrCode" && <QRCodePanel />}
        {activeCategory === "branding" && <BrandingPanel />}
      </div>
    </div>
  );
};

export default MainSidebar;
