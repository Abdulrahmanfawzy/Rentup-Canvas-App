// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://djangoapi.markomlabs.com/",
    prepareHeaders: (headers) => {
      const csrfToken =
        "Lk2uGM6UeXEJCdCBhzUyMdxlOdYcoX3Cy3dpW6qrfD0I3hF3mtAPW9ZmezIjiM7O";
      if (csrfToken) {
        headers.set("X-CSRFTOKEN", csrfToken);
      }
      headers.set("Accept", "*/*");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["FrameTags", "FrameTypes", "TextLables", "FramePostion"], // ممكن تزود عليها بعدين: Labels, Users, etc.
  endpoints: () => ({}),
});
