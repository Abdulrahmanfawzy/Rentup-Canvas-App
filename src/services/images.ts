// src/services/assetsApi.ts
import { api } from "./api";

// ----------------------------------
// Data Models
// ----------------------------------

export interface Tag {
  id: number;
  tag: string;
}

export interface ImageData {
  project: number;
  promotion: string | null;
  developer: string | null;
  tags: Tag[];
  name: string;
  type: "image"; // literal type keeps IntelliSense strict
  public: boolean;
  image: string;
  video: string | null;
  asset_desc: string;
  performance_label: boolean;
  preferred_backgrounds: string | null;
  aspect_ratio: string | null;
  resolution: string | null;
  video_length_seconds: number | null;
  video_length_type: string | null;
  asset_creator: string | null;
  size_rules: string;
  placement_rules: string;
  created_at: string;
}

export type ImageDataWithId = ImageData & { id: number };

export interface ImagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ImageDataWithId[];
}

// ----------------------------------
// API Endpoints
// ----------------------------------

const assetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetch a paginated list of image assets.
     * Pass `{ next: url }` returned from the previous response to continue pagination.
     * If no `next` is provided, the first page ("creatives/assets/") is fetched.
     */
    getAssets: builder.query<ImagesResponse, void | { next?: string | null }>({
      query: (arg) =>
        arg && arg.next
          ? { url: arg.next } // the API already returns an absolute URL in `next`
          : { url: "creatives/assets/" },
      providesTags: (result) =>
        result
          ? [
              // individual asset caching
              ...result.results.map(({ id }) => ({
                type: "Assets" as const,
                id,
              })),
              { type: "Assets", id: "LIST" }, // list-level cache
            ]
          : [{ type: "Assets", id: "LIST" }],
    }),

    /**
     * Fetch a single image asset by its numeric ID.
     */
    getAsset: builder.query<ImageDataWithId, number>({
      query: (id) => `creatives/assets/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Assets", id }],
    }),

    /**
     * Create a new image asset.
     * If you need to upload a file, send a `FormData` instance.
     */
    createAsset: builder.mutation<ImageDataWithId, ImageData | FormData>({
      query: (data) => ({
        url: "creatives/assets/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Assets", id: "LIST" }],
    }),

    /**
     * Update an existing image asset by ID.
     */
    updateAsset: builder.mutation<
      ImageDataWithId,
      { id: number; data: ImageData | FormData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/assets/${id}`,
        method: "PUT", // or "PATCH" if your backend supports partial updates
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Assets", id },
        { type: "Assets", id: "LIST" },
      ],
    }),

    /**
     * Delete an image asset by ID.
     */
    deleteAsset: builder.mutation<void, number>({
      query: (id) => ({
        url: `creatives/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Assets", id },
        { type: "Assets", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

// ----------------------------------
// Hooks
// ----------------------------------

export const {
  useGetAssetsQuery,
  useLazyGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;

export { assetsApi };
