'use client';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = endpoint;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Có lỗi xảy ra');
  }

  return data;
}

export const authAPI = {
  login: async (username: string, password: string) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
  getMe: async () => {
    return apiRequest('/api/auth/me');
  },
};

export const booksAPI = {
  getAll: async (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/api/books${query ? `?${query}` : ''}`);
  },
  getById: async (id: number) => {
    return apiRequest(`/api/books/${id}`);
  },
  create: async (data: any) => {
    return apiRequest('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: any) => {
    return apiRequest(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return apiRequest(`/api/books/${id}`, {
      method: 'DELETE',
    });
  },
};

export const loansAPI = {
  getAll: async (params?: { status?: string; user_id?: number; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/api/loans${query ? `?${query}` : ''}`);
  },
  getById: async (id: number) => {
    return apiRequest(`/api/loans/${id}`);
  },
  create: async (data: { book_id: number; user_id?: number; due_date?: string }) => {
    return apiRequest('/api/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  return: async (id: number) => {
    return apiRequest(`/api/loans/${id}/return`, {
      method: 'POST',
    });
  },
};

