import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Listing,
  ListingsQueryArgs,
  ListingsResponse,
  MeResponse,
  User,
} from "../types";
import { clearAuthToken, getAuthToken, setAuthToken } from "../lib/authToken";

/**
 * Dev: `/` + Vite proxy → local API.
 * Prod: `VITE_API_URL` if set, else Render API (deployed SPA default).
 */
function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).replace(/\/+$/, "") + "/";
  }
  if (import.meta.env.DEV) {
    return "/";
  }
  return "https://server-reseller.onrender.com/";
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers) => {
    const t = getAuthToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
    return headers;
  },
});

function requestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : (args.url ?? "");
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const u = requestUrl(args);
    if (
      !u.includes("auth/login") &&
      !u.includes("auth/register") &&
      !u.includes("auth/me")
    ) {
      clearAuthToken();
    }
  }
  return result;
};

function apiOriginForStaticFiles(): string {
  const base = getApiBaseUrl();
  if (base.startsWith("/")) {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  return base.replace(/\/+$/, "");
}

function listingImageSrc(url: string): string {
  if (url == null || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const origin = apiOriginForStaticFiles();
  return origin ? `${origin}${path}` : path;
}

function parseListingsCacheKey(key: string): ListingsQueryArgs | undefined {
  const m = key.match(/^getListings\(([\s\S]*)\)$/);
  if (!m) return undefined;
  const inner = m[1].trim();
  if (inner === "undefined" || inner === "") return undefined;
  try {
    return JSON.parse(inner) as ListingsQueryArgs;
  } catch {
    return undefined;
  }
}

function forEachListingsCache(
  queries: Record<string, unknown>,
  fn: (args: ListingsQueryArgs | undefined) => void,
) {
  for (const key of Object.keys(queries)) {
    if (!key.startsWith("getListings(")) continue;
    fn(parseListingsCacheKey(key));
  }
}

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Listing",
    "Listings",
    "Mine",
    "Stats",
    "Auth",
    "Categories",
    "Billing",
  ],
  endpoints: (builder) => ({
    getCategories: builder.query<{ categories: string[] }, void>({
      query: () => "api/categories",
      providesTags: ["Categories"],
    }),

    getCurrencies: builder.query<{ currencies: string[] }, void>({
      query: () => "api/currencies",
      providesTags: ["Categories"],
    }),

    getMe: builder.query<MeResponse | null, void>({
      query: () => ({
        url: "api/auth/me",
        validateStatus: (response) => response.status === 200 || response.status === 401,
      }),
      transformResponse: (response: unknown, meta: { response?: Response } | undefined) => {
        const status = meta?.response?.status;
        if (status === 401) {
          clearAuthToken();
          return null;
        }
        const body = response as { user?: unknown } | null;
        if (body && typeof body === "object" && body.user) {
          return response as MeResponse;
        }
        return null;
      },
      providesTags: (result) => (result?.user ? ["Auth"] : []),
    }),

    login: builder.mutation<MeResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) setAuthToken(data.token);
        } catch {
          /* invalid login */
        }
      },
      invalidatesTags: ["Auth", "Mine", "Stats"],
    }),

    register: builder.mutation<
      MeResponse,
      { email: string; password: string; name: string }
    >({
      query: (body) => ({
        url: "api/auth/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      invalidatesTags: ["Auth", "Mine", "Stats"],
    }),

    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Mine", "Stats", "Billing"],
    }),

    purchaseProduct: builder.mutation<
      {
        ok: boolean;
        productId: string;
        user: User;
        limits: { maxImagesPerListing: number };
      },
      { productId: string }
    >({
      query: (body) => ({
        url: "api/billing/purchase",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      invalidatesTags: ["Auth", "Billing"],
    }),

    getListings: builder.query<ListingsResponse, ListingsQueryArgs | void>({
      query: (args) => {
        const p = new URLSearchParams();
        if (args?.category) p.set("category", args.category);
        if (args?.minPrice) p.set("minPrice", args.minPrice);
        if (args?.maxPrice) p.set("maxPrice", args.maxPrice);
        if (args?.sort) p.set("sort", args.sort);
        if (args?.page) p.set("page", String(args.page));
        if (args?.limit) p.set("limit", String(args.limit));
        const qs = p.toString();
        return `api/listings${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res: ListingsResponse) => ({
        ...res,
        listings: res.listings.map((l) => ({
          ...l,
          id: String(l.id),
          currency: l.currency || "USD",
          featured: Boolean(l.featured),
          images: (l.images || []).map(listingImageSrc),
        })),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.listings.map((l) => ({
                type: "Listing" as const,
                id: l.id,
              })),
              { type: "Listings" as const, id: "LIST" },
            ]
          : [{ type: "Listings", id: "LIST" }],
    }),

    getListing: builder.query<{ listing: Listing }, string>({
      query: (id) => `api/listings/${id}`,
      transformResponse: (res: { listing: Listing }) => ({
        listing: {
          ...res.listing,
          id: String(res.listing.id),
          currency: res.listing.currency || "USD",
          featured: Boolean(res.listing.featured),
          images: (res.listing.images || []).map(listingImageSrc),
        },
      }),
      providesTags: (_r, _e, id) => [{ type: "Listing", id }],
    }),

    getMine: builder.query<{ listings: Listing[] }, void>({
      query: () => "api/listings/mine",
      transformResponse: (res: { listings: Listing[] }) => ({
        listings: res.listings.map((l) => ({
          ...l,
          id: String(l.id),
          currency: l.currency || "USD",
          featured: Boolean(l.featured),
          images: (l.images || []).map(listingImageSrc),
        })),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.listings.map((l) => ({
                type: "Listing" as const,
                id: l.id,
              })),
              { type: "Mine" as const, id: "MINE" },
            ]
          : [{ type: "Mine", id: "MINE" }],
    }),

    getDashboardStats: builder.query<
      { listingCount: number; totalViews: number; totalContactClicks: number },
      void
    >({
      query: () => "api/listings/dashboard-stats",
      providesTags: ["Stats"],
    }),

    recordView: builder.mutation<{ views: number }, string>({
      query: (id) => ({
        url: `api/listings/${id}/view`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Listing", id }],
    }),

    recordContactClick: builder.mutation<{ contactClicks: number }, string>({
      query: (id) => ({
        url: `api/listings/${id}/contact-click`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Listing", id }],
    }),

    createListing: builder.mutation<{ listing: Listing }, FormData>({
      query: (body) => ({
        url: "api/listings",
        method: "POST",
        body,
      }),
      transformResponse: (res: { listing: Listing }) => ({
        listing: {
          ...res.listing,
          id: String(res.listing.id),
          currency: res.listing.currency || "USD",
          featured: Boolean(res.listing.featured),
          images: (res.listing.images || []).map(listingImageSrc),
        },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        const state = getState() as { api: ReturnType<typeof api.reducer> };
        const queries = state.api.queries;
        const tempId = `optimistic-${Date.now()}`;
        const patches: { undo: () => void }[] = [];

        forEachListingsCache(queries, (args) => {
          patches.push(
            dispatch(
              api.util.updateQueryData("getListings", args, (draft) => {
                if (!draft?.listings) return;
                const optimistic: Listing = {
                  id: tempId,
                  title: "Posting…",
                  description: "",
                  price: 0,
                  currency: "USD",
                  category: "other",
                  featured: false,
                  images: [],
                  contact: { phone: "", whatsapp: "", email: "" },
                  views: 0,
                  contactClicks: 0,
                  createdAt: new Date().toISOString(),
                };
                draft.listings.unshift(optimistic);
              }),
            ),
          );
        });

        patches.push(
          dispatch(
            api.util.updateQueryData("getMine", undefined, (draft) => {
              if (!draft?.listings) return;
              draft.listings.unshift({
                id: tempId,
                title: "Posting…",
                description: "",
                price: 0,
                currency: "USD",
                category: "other",
                featured: false,
                images: [],
                contact: { phone: "", whatsapp: "", email: "" },
                views: 0,
                contactClicks: 0,
                createdAt: new Date().toISOString(),
              });
            }),
          ),
        );

        try {
          const { data } = await queryFulfilled;
          const real = data.listing;
          forEachListingsCache(queries, (args) => {
            dispatch(
              api.util.updateQueryData("getListings", args, (draft) => {
                if (!draft?.listings) return;
                const i = draft.listings.findIndex((l) => l.id === tempId);
                if (i >= 0) draft.listings[i] = real;
              }),
            );
          });
          dispatch(
            api.util.updateQueryData("getMine", undefined, (draft) => {
              if (!draft?.listings) return;
              const i = draft.listings.findIndex((l) => l.id === tempId);
              if (i >= 0) draft.listings[i] = real;
            }),
          );
          dispatch(api.util.invalidateTags(["Stats"]));
        } catch {
          [...patches].reverse().forEach((p) => p.undo());
        }
      },
    }),

    updateListing: builder.mutation<
      { listing: Listing },
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `api/listings/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: { listing: Listing }) => ({
        listing: {
          ...res.listing,
          id: String(res.listing.id),
          currency: res.listing.currency || "USD",
          featured: Boolean(res.listing.featured),
          images: (res.listing.images || []).map(listingImageSrc),
        },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Listing", id },
        { type: "Listings", id: "LIST" },
        { type: "Mine", id: "MINE" },
        "Stats",
      ],
    }),

    deleteListing: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `api/listings/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches: { undo: () => void }[] = [];
        const state = getState() as { api: ReturnType<typeof api.reducer> };
        const queries = state.api.queries;

        forEachListingsCache(queries, (args) => {
          patches.push(
            dispatch(
              api.util.updateQueryData("getListings", args, (draft) => {
                if (!draft?.listings) return;
                draft.listings = draft.listings.filter((l) => l.id !== id);
                draft.total = Math.max(0, draft.total - 1);
              }),
            ),
          );
        });

        patches.push(
          dispatch(
            api.util.updateQueryData("getMine", undefined, (draft) => {
              if (!draft?.listings) return;
              draft.listings = draft.listings.filter((l) => l.id !== id);
            }),
          ),
        );

        try {
          await queryFulfilled;
          dispatch(api.util.invalidateTags([{ type: "Listing", id }, "Stats"]));
        } catch {
          [...patches].reverse().forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCurrenciesQuery,
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetListingsQuery,
  useGetListingQuery,
  useGetMineQuery,
  useGetDashboardStatsQuery,
  useRecordViewMutation,
  useRecordContactClickMutation,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  usePurchaseProductMutation,
} = api;
