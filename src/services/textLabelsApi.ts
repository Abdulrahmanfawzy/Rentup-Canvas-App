// src/services/textLablesApi.ts
import { api } from "./api";

export type Label = {
  id: number;
  label: string;
  example: string;
};


// أنواع البيانات
export type LabelsData = {
  count: number;
  next: null;
  previous: null;
  results: {
    id: number;
    label: string;
    example: string;
  }[];
};

export type LabelResponse = {
  id: number;
  label: string;
};

// حقن endpoints خاصة بـ TextLables
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllTextLabels: builder.query<Label[], void>({
    async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
      let allLabels: Label[] = [];
      let nextUrl: string | null = "api/toilabels/";

      while (nextUrl) {
        const result = await baseQuery({ url: nextUrl });
        if (result.error) return { error: result.error };

        const data = result.data as LabelsData;
        allLabels = [...allLabels, ...data.results];
        nextUrl = data.next;
      }

      return { data: allLabels };
    },
    providesTags: ["TextLables"],
  }),


    getTextLabel: builder.query<LabelsData, string | void>({
    query: (url) => url ?? "api/toilabels/",
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

export const {
  useGetTextLabelQuery,
  useGetAllTextLabelsQuery,
  usePostTextLabelMutation,
} = extendedApi;
