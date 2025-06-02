// services/googleFontsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; //

const GOOGLE_FONTS_API_KEY = "AIzaSyBVzbz8cX6gKtf_oWIL-LcEIe0SDqqwoc4";

type GoogleFont = {
  family: string;
  variants: string[];
  category: string;
  files: Record<string, string>;
};

type GoogleFontsResponse = {
  kind: string;
  items: GoogleFont[];
};

export const googleFontsApi = createApi({
  reducerPath: "googleFontsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://www.googleapis.com/webfonts/v1/",
  }),
  endpoints: (builder) => ({
    getGoogleFonts: builder.query<GoogleFontsResponse, void>({
      query: () => `webfonts?key=${GOOGLE_FONTS_API_KEY}`,
    }),
  }),
});

export const { useGetGoogleFontsQuery } = googleFontsApi;
