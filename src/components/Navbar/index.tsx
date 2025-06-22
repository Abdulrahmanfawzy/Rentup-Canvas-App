import type { FC } from "react";
import logoBlue from "@/assets//LogoBlue.svg";
import LogoWhite from "@/assets/LogoWhite.svg";
import { useTheme } from "../ui/theme-provider";
import { HistoryControls } from "./HistoryControls";
import CanvasExportImport from "./CanvasExportImport";
import ToggleTheme from "./ToggleTheme";
import { ShortcutsHelp } from "../ui/ShortcutsHelp";
import { SaveToDataBase } from "./SaveToDataBase";

const Navbar: FC = () => {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center space-x-10">
        <h1 className="text-xl font-bold">
          <img
            src={theme === "dark" ? LogoWhite : logoBlue}
            alt="Logo"
            width={120}
          />
        </h1>
        <HistoryControls />
      </div>
      <div className="flex items-center space-x-4">
        <CanvasExportImport />
        <SaveToDataBase />
        <ShortcutsHelp />
        <ToggleTheme />
      </div>
    </div>
  );
};

export default Navbar;
