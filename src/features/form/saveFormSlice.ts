import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SaveFormState {
  templateId: number | undefined;
}

const initialState: SaveFormState = {
  templateId: undefined,
};

const saveFormSlice = createSlice({
  name: "saveForm",
  initialState,
  reducers: {
    addTemplateId(state, action: PayloadAction<number>) {
      state.templateId = action.payload; // ✅ immer-style OK
    },
    removeTemplateId(state) {
      state.templateId = undefined;
    },
  },
});

export const { addTemplateId, removeTemplateId } = saveFormSlice.actions;
export default saveFormSlice.reducer;
