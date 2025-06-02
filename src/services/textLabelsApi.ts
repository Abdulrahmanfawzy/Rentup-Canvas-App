// src/services/textLablesApi.ts
import { api } from "./api";

// أنواع البيانات
export type LabelsData = {
  count: number;
  next: null;
  previous: null;
  results: {
    id: number;
    label: string;
  }[];
};

export type LabelResponse = {
  id: number;
  label: string;
};

// حقن endpoints خاصة بـ TextLables
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTextLabel: builder.query<LabelsData, void>({
      query: () => "api/toilabels",
      providesTags: ["TextLables"],
    }),
    postTextLabel: builder.mutation<LabelResponse, { label: string }>({
      query: (newLabel) => ({
        url: "api/toilabels/",
        method: "POST",
        body: { label: newLabel.label },
      }),
      invalidatesTags: ["TextLables"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTextLabelQuery, usePostTextLabelMutation } = extendedApi;
