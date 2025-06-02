// src/services/tagsApi.ts
import { api } from "./api";

// أنواع البيانات
type TypesItem = [string, string];

type TypesData = TypesItem[];

const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFrameTypes: builder.query<TypesData, void>({
      query: () => "creatives/asset-choices",
      providesTags: ["FrameTypes"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFrameTypesQuery } = extendedApi;
