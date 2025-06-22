import { api } from "./api";

// أنواع البيانات
export type TagsData = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    tag: string;
  }[];
};

export type TagResponse = {
  id: number;
  tag: string;
};

export type AllTagsData = {
  id: number;
  tag: string;
}[];

// حقن endpoints خاصة بـ Tags
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // الـ endpoint الأصلي للصفحة الواحدة
    getTag: builder.query<TagsData, { page?: number }>({
      query: ({ page = 1 } = {}) => `creatives/tags/?page=${page}`,
      providesTags: ["Tags"],
    }),

    // endpoint جديد لجلب كل الـ tags من كل الصفحات
    getAllTag: builder.query<AllTagsData, void>({
      queryFn: async (_, __, ___, baseQuery) => {
        let allTags: AllTagsData = [];
        let nextUrl: string | null = "creatives/tags/";

        try {
          while (nextUrl) {
            const result = await baseQuery(nextUrl);

            if (result.error) {
              return { error: result.error };
            }

            const data = result.data as TagsData;
            allTags = [...allTags, ...data.results];

            // استخراج الـ URL التالي
            nextUrl = data.next;
            if (nextUrl) {
              // تحويل الـ URL الكامل إلى path نسبي
              const url = new URL(nextUrl);
              nextUrl = url.pathname + url.search;
            }
          }

          return { data: allTags };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Tags"],
    }),

    // endpoint للبحث في الـ tags
    searchTag: builder.query<TagsData, { search: string; page?: number }>({
      query: ({ search, page = 1 }) =>
        `creatives/tags/?search=${search}&page=${page}`,
      providesTags: ["Tags"],
    }),

    postFrameTag: builder.mutation<TagResponse, { tag: string }>({
      query: (newTag) => ({
        url: "creatives/tags/",
        method: "POST",
        body: { tag: newTag.tag },
      }),
      invalidatesTags: ["Tags"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTagQuery,
  useGetAllTagQuery,
  useSearchTagQuery,
  usePostFrameTagMutation,
} = extendedApi;
