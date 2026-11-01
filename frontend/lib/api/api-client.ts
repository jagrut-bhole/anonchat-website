const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiErrorResponse {
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API URL is not conrfigured!!");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },

      credentials: "include"
    });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));

    throw new ApiError(
      errorData.message || "API request falied!!",
      response.status
    )
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>
}
