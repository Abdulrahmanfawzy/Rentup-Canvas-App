// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const BASE_API_URL = "https://djangoapi.markomlabs.com";
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      /*       const csrfToken =
        "Lk2uGM6UeXEJCdCBhzUyMdxlOdYcoX3Cy3dpW6qrfD0I3hF3mtAPW9ZmezIjiM7O";
      if (csrfToken) {
        headers.set("X-CSRFTOKEN", csrfToken);
      } */
      headers.set("Authorization", "Basic YToxMjM0");
      return headers;
    },
  }),
  tagTypes: [
    "Tags",
    "FrameTypes",
    "TextLables",
    "FramePostion",
    "Templates",
    "Template",
    "TemplateFrames",
    "FrameTags",
    "TemplateTextBoxes",
    "Assets",
    "Projects",
  ], // ممكن تزود عليها بعدين: Labels, Users, etc.
  endpoints: () => ({}),
});
