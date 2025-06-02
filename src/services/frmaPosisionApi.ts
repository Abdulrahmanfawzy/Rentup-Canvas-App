// src/services/FramePostionApi.ts
import { api } from "./api";

// أنواع البيانات
export type PositionData = string[] | [null];

// حقن endpoints خاصة بـ FramePostion
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFramePosition: builder.query<PositionData, void>({
      query: () => "/creatives/frame-positions/",
      providesTags: ["FramePostion"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFramePositionQuery } = extendedApi;
