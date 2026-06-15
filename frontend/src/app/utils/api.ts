let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Enforce correct Render domain (k1l7) when running in production Vercel environment
if (typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || rawApiUrl.includes('studycircle-v2') || rawApiUrl.includes('studycircle-backend'))) {
  rawApiUrl = 'https://studycircle-backend-k1l7.onrender.com/api';
}

const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

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
