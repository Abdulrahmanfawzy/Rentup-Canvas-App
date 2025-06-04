// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://djangoapi.markomlabs.com/",
    prepareHeaders: (headers) => {
      const csrfToken =
        "h48eODX6yD9j6r1XOeRNbkAvLAWP0hj64Nj94XhDzjvixv4pT8x4lg2wbWGWU6ni";
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
