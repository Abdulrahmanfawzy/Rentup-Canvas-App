import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ActiveCategoryType =
  | "shapes"
  | "text"
  | "layers"
  | "frame"
  | "upload"
  | "icons"
  | "qrCode"
  | "branding";

interface UiState {
  activeCategory: ActiveCategoryType;
  mainSidebarOpen: boolean;
  propertiesSidebarOpen: boolean;
}

const initialState: UiState = {
  activeCategory: "shapes",
  mainSidebarOpen: true,
  propertiesSidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<ActiveCategoryType>) => {
      state.activeCategory = action.payload;
      state.mainSidebarOpen = true; // Open main sidebar when category is selected
    },
    toggleMainSidebar: (state) => {
      state.mainSidebarOpen = !state.mainSidebarOpen;
    },
    togglePropertiesSidebar: (state) => {
      state.propertiesSidebarOpen = !state.propertiesSidebarOpen;
    },
    setMainSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mainSidebarOpen = action.payload;
    },
    setPropertiesSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.propertiesSidebarOpen = action.payload;
    },
  },
});

export const {
  setActiveCategory,
  toggleMainSidebar,
  togglePropertiesSidebar,
  setMainSidebarOpen,
  setPropertiesSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
