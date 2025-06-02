import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchLabels = createAsyncThunk("labels/fetchLabels", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  return data;
});

interface Label {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface LabelsState {
  data: Label[];
  loading: boolean;
  error: string | null;
}

const initialState: LabelsState = {
  data: [],
  loading: false,
  error: null,
};

const labelsSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default labelsSlice.reducer;
