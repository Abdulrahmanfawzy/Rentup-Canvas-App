// src/services/templateTextsApi.ts
import { api } from "./api";

// Data types matching the form schema
export type TemplateTextData = {
  template: number;
  initial_value: string;
  tags: number[];
  toi_label: number;
};

export type TemplatesTextsResponse = TemplateTextData[];
export type TemplateTextCreateResponse = TemplateTextData;

// Inject endpoints for Template TextBoxes
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplateTextBoxes: builder.query<TemplatesTextsResponse, void>({
      query: () => "creatives/textboxes",
      providesTags: ["TemplateTextBoxes"],
    }),
    getTemplateTextBox: builder.query<TemplateTextData, number>({
      query: (id) => `creatives/textboxes/${id}`,
      providesTags: ["TemplateTextBoxes"],
    }),
    createTemplateTextBox: builder.mutation<
      TemplateTextCreateResponse,
      TemplateTextData
    >({
      query: (data) => ({
        url: "creatives/textboxes/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TemplateTextBoxes"],
    }),
    updateTemplateTextBox: builder.mutation<
      TemplateTextCreateResponse,
      { id: number; data: TemplateTextData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/textboxes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TemplateTextBoxes"],
    }),
    deleteTemplateTextBox: builder.mutation<void, number>({
      query: (id) => ({
        url: `creatives/textboxes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TemplateTextBoxes"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplateTextBoxesQuery,
  useGetTemplateTextBoxQuery,
  useCreateTemplateTextBoxMutation,
  useUpdateTemplateTextBoxMutation,
  useDeleteTemplateTextBoxMutation,
} = extendedApi;
