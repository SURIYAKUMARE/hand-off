import type { PaginatedResult } from '@helpdesk360/shared';

export class ApiError extends Error {
  status: number;
  validationErrors?: Array<{ field: string; message: string }>;
  details?: any;

  constructor(
    message: string,
    status: number,
    validationErrors?: Array<{ field: string; message: string }>,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
    this.details = details;
  }
}

function normalizeUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (endpoint.startsWith('/api/') || endpoint === '/api') {
    return endpoint;
  }
  return `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = normalizeUrl(endpoint);

  const token = typeof window !== 'undefined' ? localStorage.getItem('helpdesk360_token') : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Ensure cookies are sent and received
  });

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage =
      data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data?.validationErrors, data?.details);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  postFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const url = normalizeUrl(endpoint);
    const token = typeof window !== 'undefined' ? localStorage.getItem('helpdesk360_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers,
    });
    let data: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }
    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.validationErrors, data?.details);
    }
    return data as T;
  },
};

export async function getAllPages<T>(endpoint: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await api.get<any>(`${endpoint}${separator}page=${page}&limit=100`);
    const pageItems = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.users)
      ? response.users
      : Array.isArray(response?.logs)
      ? response.logs
      : Array.isArray(response?.assets)
      ? response.assets
      : Array.isArray(response?.technicians)
      ? response.technicians
      : Array.isArray(response)
      ? response
      : [];
    items.push(...pageItems);
    totalPages = response?.pagination?.totalPages ?? 1;
    page++;
  } while (page <= totalPages);
  return items;
}
