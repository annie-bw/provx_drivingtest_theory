interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8081/api";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8081";
const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST ?? "";

const buildAssetUrl = (baseUrl: string, relativePath: string) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${normalizedBase}${normalizedPath}`;
};

export function getImageUrl(relativePath: string): string {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith("http")) {
    return relativePath;
  }
  if (IMAGE_HOST) {
    return buildAssetUrl(IMAGE_HOST, relativePath);
  }
  return buildAssetUrl(BACKEND_BASE_URL, relativePath);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(`Unexpected API response: ${text}`);
  }

  if (!response.ok) {
    throw new Error(
      payload?.message || response.statusText || "API request failed",
    );
  }

  if (!payload || payload.success === false) {
    throw new Error(payload?.message || "API error");
  }

  return payload.data;
}
