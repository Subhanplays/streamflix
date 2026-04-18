/**
 * Browser: use same-origin `/api` (Next.js rewrites → Express). Do not point the browser at
 * http://localhost:5000 directly — that often fails (firewall, IPv6, env leftovers).
 * Set NEXT_PUBLIC_API_URL only for a real remote API (e.g. production).
 */
function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  const env = raw.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const looksLikeLocalExpress =
      !env ||
      /^https?:\/\/(localhost|127\.0\.0\.1):5000(\/api)?\/?$/i.test(env);
    if (looksLikeLocalExpress) return "/api";
    return env;
  }

  return (process.env.INTERNAL_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers: hdr, ...rest } = options;
  const auth = token !== undefined ? token : getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(hdr || {}),
  };
  if (auth) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${auth}`;
  }
  const base = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...rest, headers });
  } catch (e) {
    const hint =
      typeof window !== "undefined"
        ? ` Cannot reach API (${base}). Start Express: cd server && npm run dev (default port 5000). Match API_PROXY_TARGET in client/.env.local if you use a different port. Remove NEXT_PUBLIC_API_URL for local dev so requests use /api (proxied by Next.js).`
        : "";
    throw new ApiError(
      (e instanceof Error ? e.message : "Network error") + hint,
      0,
      e
    );
  }
  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    throw new ApiError(text.slice(0, 120) || "Invalid response from server", res.status);
  }
  if (!res.ok) {
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (Array.isArray(data?.errors) && data.errors[0] && typeof (data.errors[0] as { msg?: string }).msg === "string"
        ? (data.errors[0] as { msg: string }).msg
        : null) ||
      res.statusText;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      apiFetch<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify(body) }
      ),
    register: (body: { name: string; email: string; password: string }) =>
      apiFetch<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(body) }
      ),
    me: () => apiFetch<{ user: unknown }>("/auth/me"),
  },
  movies: {
    list: (params: Record<string, string | number | undefined>) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") q.set(k, String(v));
      });
      return apiFetch<{
        items: unknown[];
        page: number;
        total: number;
        pages: number;
      }>(`/movies?${q.toString()}`);
    },
    featured: () => apiFetch<{ items: unknown[] }>("/movies/featured"),
    home: () =>
      apiFetch<{
        featured: unknown[];
        trending: unknown[];
        rows: { title: string; items: unknown[] }[];
      }>("/movies/home"),
    genres: () => apiFetch<{ genres: string[] }>("/movies/genres"),
    get: (id: string) => apiFetch<{ movie: unknown }>(`/movies/${id}`),
    create: (body: unknown) =>
      apiFetch<{ movie: unknown }>("/movies", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: unknown) =>
      apiFetch<{ movie: unknown }>(`/movies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string) => apiFetch<{ message: string }>(`/movies/${id}`, { method: "DELETE" }),
  },
  user: {
    progress: (body: {
      movieId: string;
      progress: number;
      duration: number;
      episodeIndex?: number | null;
    }) => apiFetch<unknown>("/user/progress", { method: "POST", body: JSON.stringify(body) }),
    watchHistory: () =>
      apiFetch<{ entries: { movie: unknown; progress: number; duration: number; episodeIndex: number | null }[] }>(
        "/user/watch-history"
      ),
    toggleFavorite: (movieId: string) =>
      apiFetch<{ favorites: string[] }>(`/user/favorites/${movieId}`, { method: "POST" }),
    favorites: () => apiFetch<{ items: unknown[] }>("/user/favorites"),
  },
  admin: {
    dashboard: () =>
      apiFetch<{
        totalUsers: number;
        totalMovies: number;
        popular: { id: string; title: string; views: number; thumbnailUrl: string }[];
      }>("/admin/dashboard"),
  },
};
