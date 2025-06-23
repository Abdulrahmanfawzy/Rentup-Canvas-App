// src/services/templateFramesApi.ts
import { api } from "./api";

// Data types matching the form schema
export type TemplateFrameData = {
  frame_position_in_template: number;
  template: number;
  type: string;
  tags: number[];
};

export type TemplatesFramesResponse = TemplateFrameData[];
export type TemplateFrameCreateResponse = TemplateFrameData;

// Inject endpoints for Template Frames
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplateFrames: builder.query<TemplatesFramesResponse, void>({
      query: () => "creatives/template-frames",
      providesTags: ["TemplateFrames"],
    }),
    getTemplateFrame: builder.query<TemplateFrameData, number>({
      query: (id) => `creatives/template-frames/${id}`,
      providesTags: ["TemplateFrames"],
    }),
    createTemplateFrame: builder.mutation<
      TemplateFrameCreateResponse,
      TemplateFrameData
    >({
      query: (data) => ({
        url: "creatives/template-frames/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TemplateFrames"],
    }),
    updateTemplateFrame: builder.mutation<
      TemplateFrameCreateResponse,
      { id: number; data: TemplateFrameData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/template-frames/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TemplateFrames"],
    }),
    deleteTemplateFrame: builder.mutation<void, number>({
      query: (id) => ({
        url: `creatives/template-frames/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TemplateFrames"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplateFramesQuery,
  useGetTemplateFrameQuery,
  useCreateTemplateFrameMutation,
  useUpdateTemplateFrameMutation,
  useDeleteTemplateFrameMutation,
} = extendedApi;
