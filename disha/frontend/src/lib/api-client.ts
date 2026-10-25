const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
};

interface FetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | undefined | null>;
}

async function request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const { token, params, headers, ...rest } = options;
  const baseUrl = getBackendUrl();
  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      cache: rest.cache || 'no-store',
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error(`API Client Error [${endpoint}]:`, err);
    return {
      success: false,
      error: err.message || 'Network request failed',
    };
  }
}

export const apiClient = {
  careers: {
    list: (params?: { cluster?: string; stream?: string; q?: string }) =>
      request('/api/careers', { method: 'GET', params }),
    clusters: () =>
      request('/api/careers/clusters', { method: 'GET' }),
    getBySlug: (slug: string) =>
      request(`/api/careers/${encodeURIComponent(slug)}`, { method: 'GET' }),
  },

  quiz: {
    get: () =>
      request('/api/quiz', { method: 'GET' }),
    submit: (payload: { versionId: string; responses: any[]; currentClass?: string; stream?: string }, token?: string) =>
      request('/api/quiz', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      }),
  },

  auth: {
    login: (credentials: { email: string; password: string }) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (payload: {
      name: string;
      email: string;
      password: string;
      currentClass: string;
      stream?: string;
      parentEmail: string;
    }) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    verifyConsent: (token: string) =>
      request('/api/auth/verify-consent', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    me: (token: string) =>
      request('/api/auth/me', {
        method: 'GET',
        token,
      }),
  },

  dashboard: {
    get: (token: string) =>
      request('/api/dashboard', {
        method: 'GET',
        token,
      }),
  },

  moderation: {
    list: (status: string, token: string) =>
      request('/api/moderation', {
        method: 'GET',
        params: { status },
        token,
      }),
    decide: (payload: { submissionId: string; decision: string; reviewNotes?: string }, token: string) =>
      request('/api/moderation', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      }),
  },

  contributors: {
    submit: (payload: { entityType: string; data: any }, token: string) =>
      request('/api/contributors/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      }),
  },
};
