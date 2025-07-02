// src/services/projectsApi.ts
import { api } from "./api";

// ----------------------------------
// Data Models
// ----------------------------------
export interface ProjectData {
  id: number;
  name: string;
  developer: string | null;
}

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectData[];
}

// ----------------------------------
// API Endpoints
// ----------------------------------

const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetch a paginated list of projects.
     * Pass `{ next: url }` returned from the previous response to continue pagination.
     * If no `next` is provided, the first page ("projects/") is fetched.
     */
    getProjects: builder.query<
      ProjectsResponse,
      void | { next?: string | null }
    >({
      query: (arg) =>
        arg && arg.next ? { url: arg.next } : { url: "api/projects/" },
      providesTags: (result) =>
        result
          ? [
              // individual asset caching
              ...result.results.map(({ id }) => ({
                type: "Projects" as const,
                id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

// ----------------------------------
// Hooks
// ----------------------------------

export const { useGetProjectsQuery } = projectsApi;

export { projectsApi };
