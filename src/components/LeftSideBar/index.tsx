import type { FC } from "react";
import CategorySidebar from "./CategorySidebar";
import MainSidebar from "./MainLeftSidebar";
import { useAppSelector } from "@/hooks/useRedux";

const LeftSideBar: FC = () => {
  const mainSidebarOpen = useAppSelector((state) => state.ui.mainSidebarOpen);

  return (
    <>
      <div className="flex ">
        <CategorySidebar />
        {mainSidebarOpen && <MainSidebar />}
      </div>
    </>
  );
};

export default LeftSideBar;
