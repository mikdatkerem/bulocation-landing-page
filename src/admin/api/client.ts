import { ApiClientError, type ApiProblem } from './errors';

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '/admin-api';
  }

  return trimmed.replace(/\/$/, '');
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_ADMIN_API_BASE_URL);

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let error: ApiProblem | undefined;
    try {
      error = (await response.json()) as ApiProblem;
    } catch {
      error = undefined;
    }

    throw new ApiClientError(
      {
        status: response.status,
        title: error?.title,
        detail: error?.detail,
        code: error?.code,
        traceId: error?.traceId,
        errors: error?.errors,
      },
      `Request failed with ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
