// store/brandingSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BrandingState {
  colors: Record<string, string>;
  fontFamilies: Record<string, string>;
}

const initialState: BrandingState = {
  colors: {
    primary: "#FF0000",
    secondary: "#00FF00",
  },
  fontFamilies: {
    default: "Arial",
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
    addFont(state, action: PayloadAction<{ key: string; value: string }>) {
      state.fontFamilies[action.payload.key] = action.payload.value;
    },
    setFont(state, action: PayloadAction<{ key: string; value: string }>) {
      if (state.fontFamilies[action.payload.key] !== undefined) {
        state.fontFamilies[action.payload.key] = action.payload.value;
      }
    },
    removeFont(state, action: PayloadAction<string>) {
      delete state.fontFamilies[action.payload];
    },
    // Reset branding (optional)
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
