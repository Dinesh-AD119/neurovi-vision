const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  // Set headers appropriately
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An error occurred on the server.";
    try {
      const errData = await response.json();
      if (errData?.error?.message) {
        errorDetail = errData.error.message;
      } else if (errData?.detail) {
        errorDetail = typeof errData.detail === "string" 
          ? errData.detail 
          : JSON.stringify(errData.detail);
      }
    } catch {
      // JSON parsing failed, use status text
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
