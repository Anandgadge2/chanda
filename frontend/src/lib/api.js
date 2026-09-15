const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get stored JWT auth token from localStorage
 */
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chanda_token');
  }
  return null;
};

/**
 * Set stored JWT auth token
 */
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('chanda_token', token);
    } else {
      localStorage.removeItem('chanda_token');
    }
  }
};

/**
 * Helper to generate Authorization headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'लॉगिन अयशस्वी झाले. (Login failed)');
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'नोंदणी अयशस्वी झाली. (Registration failed)');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'सत्र अवैध किंवा समाप्त झाले. (Session invalid)');
    return data;
  },

  logout: async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });
    } catch {
      // Ignore errors on logout
    } finally {
      setAuthToken(null);
    }
  },

  // Analytics
  getAnalyticsSummary: async (taluka = '', forceRefresh = false) => {
    const params = new URLSearchParams();
    if (taluka) params.set('taluka', taluka);
    if (forceRefresh) params.set('refresh', 'true');
    const q = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/api/analytics/summary${q}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },

  // Parcels
  getParcels: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/parcels?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch parcels');
    return res.json();
  },

  getParcelTrace: async (upi) => {
    const res = await fetch(`${BASE_URL}/api/parcels/${encodeURIComponent(upi)}/trace`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch trace for parcel ${upi}`);
    return res.json();
  },

  uploadVillageExcel: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/parcels/bulk-upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bulk upload Excel');
    return data;
  },

  // Cases & Hearings
  getCases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/cases?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  createCase: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create case');
    return data;
  },

  addHearing: async (caseId, payload) => {
    const res = await fetch(`${BASE_URL}/api/cases/${caseId}/hearings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to schedule hearing');
    return data;
  },

  updateCaseStatus: async (caseId, payload) => {
    const res = await fetch(`${BASE_URL}/api/cases/${caseId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update case status');
    return data;
  },

  // DMS Documents
  uploadDocument: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data;
  },

  getDocuments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/documents?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  // Reports
  getPrapatra3Preview: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/reports/prapatra-3/preview?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch Prapatra-3 preview');
    return res.json();
  },

  getPrapatra3DownloadUrl: (taluka = '', violationType = '') => {
    const params = new URLSearchParams();
    if (taluka) params.set('taluka', taluka);
    if (violationType) params.set('violationType', violationType);
    const token = getAuthToken();
    if (token) params.set('token', token);
    return `${BASE_URL}/api/reports/prapatra-3?${params.toString()}`;
  },

  getSampleTemplateUrl: () => `${BASE_URL}/api/parcels/sample-template`,
};
