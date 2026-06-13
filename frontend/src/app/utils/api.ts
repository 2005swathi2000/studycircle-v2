const NEXT_PUBLIC_API_URL_ENV = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = NEXT_PUBLIC_API_URL_ENV.endsWith('/api') ? NEXT_PUBLIC_API_URL_ENV : `${NEXT_PUBLIC_API_URL_ENV}/api`;

export const getUserInfo = (): any => {
    if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('studycircle_user');
          if (userStr) {
                  try {
                            return JSON.parse(userStr);
                  } catch (e) {
                            return null;
                  }
          }
    }
    return null;
};

export const setUserInfo = (user: any): void => {
    if (typeof window !== 'undefined') {
          localStorage.setItem('studycircle_user', JSON.stringify(user));
    }
};

export const clearUserInfo = (): void => {
    if (typeof window !== 'undefined') {
          localStorage.removeItem('studycircle_user');
    }
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string> || {}),
    };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: headers as HeadersInit,
  });

  const data = await response.json();

  if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}
