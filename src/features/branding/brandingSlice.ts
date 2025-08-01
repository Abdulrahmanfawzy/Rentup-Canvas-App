import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FontData {
  value: string; // Font name (Google Fonts) or file name (TTF)
  isFile?: boolean; // Flag to indicate if it's a file upload
  variant?: string; // Font variant (e.g., "regular", "700")
}

interface BrandingState {
  colors: Record<string, string>;
  fontFamilies: Record<string, FontData>;
}

const initialState: BrandingState = {
  colors: {
    primary_colors: "#FF0000",
    secondary_colors: "#00FF00",
    accent_colors: "#0000FF",
  },
  fontFamilies: {
    primary_font: { value: "Arial", isFile: false, variant: "regular" },
    secondary_font: {
      value: "Times New Roman",
      isFile: false,
      variant: "regular",
    },
  },
};

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    addColor(state, action: PayloadAction<{ key: string; value: string }>) {
      state.colors[action.payload.key] = action.payload.value;
    },
    setColor(state, action: PayloadAction<{ key: string; value: string }>) {
      if (state.colors[action.payload.key] !== undefined) {
        state.colors[action.payload.key] = action.payload.value;
      }
    },
    removeColor(state, action: PayloadAction<string>) {
      delete state.colors[action.payload];
    },
    addFont(
      state,
      action: PayloadAction<{
        key: string;
        value: string;
        isFile?: boolean;
        variant?: string;
      }>
    ) {
      state.fontFamilies[action.payload.key] = {
        value: action.payload.value,
        isFile: action.payload.isFile || false,
        variant: action.payload.variant || "regular",
      };
    },
    setFont(
      state,
      action: PayloadAction<{
        key: string;
        value: string;
        isFile?: boolean;
        variant?: string;
      }>
    ) {
      if (state.fontFamilies[action.payload.key] !== undefined) {
        state.fontFamilies[action.payload.key] = {
          value: action.payload.value,
          isFile: action.payload.isFile || false,
          variant:
            action.payload.variant ||
            state.fontFamilies[action.payload.key].variant ||
            "regular",
        };
      }
    },
    removeFont(state, action: PayloadAction<string>) {
      delete state.fontFamilies[action.payload];
    },
    resetBranding(state) {
      state.colors = {};
      state.fontFamilies = {};
    },
  },
});

export const {
  addColor,
  setColor,
  removeColor,
  addFont,
  setFont,
  removeFont,
  resetBranding,
} = brandingSlice.actions;

export default brandingSlice.reducer;
