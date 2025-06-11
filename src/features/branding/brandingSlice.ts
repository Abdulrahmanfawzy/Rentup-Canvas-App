import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FontData {
  value: string; // Font name (Google Fonts) or file name (TTF)
  isFile?: boolean; // Flag to indicate if it's a file upload
}

interface BrandingState {
  colors: Record<string, string>;
  fontFamilies: Record<string, FontData>;
}

const initialState: BrandingState = {
  colors: {
    primary: "#FF0000",
    secondary: "#00FF00",
  },
  fontFamilies: {
    default: { value: "Arial", isFile: false },
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
      action: PayloadAction<{ key: string; value: string; isFile?: boolean }>
    ) {
      state.fontFamilies[action.payload.key] = {
        value: action.payload.value,
        isFile: action.payload.isFile || false,
      };
    },
    setFont(
      state,
      action: PayloadAction<{ key: string; value: string; isFile?: boolean }>
    ) {
      if (state.fontFamilies[action.payload.key] !== undefined) {
        state.fontFamilies[action.payload.key] = {
          value: action.payload.value,
          isFile: action.payload.isFile || false,
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
