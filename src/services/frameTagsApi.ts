// src/services/tagsApi.ts
import { api } from "./api";

// أنواع البيانات
export type TagsData = {
  count: number;
  next: null;
  previous: null;
  results: {
    id: number;
    tag: string;
  }[];
};

export type TagResponse = {
  id: number;
  tag: string;
};

// حقن endpoints خاصة بـ Tags
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFrameTags: builder.query<TagsData, void>({
      query: () => "creatives/tags",
      providesTags: ["FrameTags"],
    }),
    postFrameTag: builder.mutation<TagResponse, { tag: string }>({
      query: (newTag) => ({
        url: "creatives/tags/",
        method: "POST",
        body: { tag: newTag.tag },
      }),
      invalidatesTags: ["FrameTags"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFrameTagsQuery, usePostFrameTagMutation } = extendedApi;
