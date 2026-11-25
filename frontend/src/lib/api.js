const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

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

// In-flight GET request deduplication for React dev mode & parallel triggers
const inFlightRequests = new Map();

// Client-side Stale-While-Revalidate (SWR) response cache for instant button/filter/tab clicks
const CLIENT_FRESH_TTL_MS = 2 * 60 * 1000; // 2 minutes fresh
const CLIENT_STALE_TTL_MS = 15 * 60 * 1000; // 15 minutes stale-while-revalidate
const MAX_CLIENT_CACHE_ENTRIES = 200;
const clientResponseCache = new Map();

export const invalidateClientCache = () => {
  clientResponseCache.clear();
};

function setClientCacheEntry(key, data) {
  if (clientResponseCache.size >= MAX_CLIENT_CACHE_ENTRIES) {
    const oldestKey = clientResponseCache.keys().next().value;
    clientResponseCache.delete(oldestKey);
  }
  clientResponseCache.set(key, { timestamp: Date.now(), data });
}

function buildSortedQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== '') {
        sp.set(k, String(v));
      }
    });
  return sp.toString();
}

function buildPrapatraUrl(id, query = {}) {
  const params = new URLSearchParams();
  if (typeof query === 'string') {
    if (query) params.append('taluka', query);
  } else {
    Object.keys(query)
      .sort()
      .forEach((k) => {
        const v = query[k];
        if (v !== undefined && v !== null && v !== '') {
          if (v === 'all' && k !== 'pageSize' && k !== 'limit') return;
          params.append(k, String(v));
        }
      });
  }
  const qs = params.toString();
  return `${BASE_URL}/api/prapatra/${id}${qs ? `?${qs}` : ''}`;
}

async function cachedJsonFetch(url, options = {}, { forceRefresh = false, freshMs = CLIENT_FRESH_TTL_MS, staleMs = CLIENT_STALE_TTL_MS, errorMessage = 'Request failed' } = {}) {
  const authHeader = options.headers?.Authorization || '';
  const cacheKey = `${url}::${authHeader}`;
  const now = Date.now();

  if (!forceRefresh) {
    const cached = clientResponseCache.get(cacheKey);
    if (cached) {
      const age = now - cached.timestamp;
      if (age < freshMs) {
        return cached.data;
      }
      if (age < staleMs) {
        // Return cached data immediately and refresh silently in background
        dedupedFetch(url, options)
          .then(async (res) => {
            if (res.ok) {
              const freshData = await res.json();
              setClientCacheEntry(cacheKey, freshData);
            }
          })
          .catch(() => {});
        return cached.data;
      }
    }
  }

  const res = await dedupedFetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || errorMessage);
  }
  const data = await res.json();
  setClientCacheEntry(cacheKey, data);
  return data;
}

function prefetchJson(url, options = {}, freshMs = CLIENT_FRESH_TTL_MS) {
  const authHeader = options.headers?.Authorization || '';
  const cacheKey = `${url}::${authHeader}`;
  const cached = clientResponseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < freshMs) {
    return;
  }
  cachedJsonFetch(url, options, { freshMs }).catch(() => {});
}

async function dedupedFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    return fetch(url, options);
  }

  const authHeader = options.headers?.Authorization || '';
  const dedupKey = `${url}::${authHeader}`;

  if (inFlightRequests.has(dedupKey)) {
    const originalRes = await inFlightRequests.get(dedupKey);
    return originalRes.clone();
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      return res;
    } finally {
      setTimeout(() => {
        inFlightRequests.delete(dedupKey);
      }, 150);
    }
  })();

  inFlightRequests.set(dedupKey, promise);
  const res = await promise;
  return res.clone();
}

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
    invalidateClientCache();
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
    const res = await dedupedFetch(`${BASE_URL}/api/auth/me`, {
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
      invalidateClientCache();
    }
  },

  // DPDPA 2023 Data Principal Rights
  exportData: async () => {
    const res = await dedupedFetch(`${BASE_URL}/api/auth/dpdpa/export`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'डेटा निर्यात अयशस्वी झाला.');
    return data;
  },

  requestErasure: async (reason = '') => {
    const res = await fetch(`${BASE_URL}/api/auth/dpdpa/erasure-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'डेटा हटविण्याची विनंती अयशस्वी झाली.');
    return data;
  },


  // Analytics
  getAnalyticsSummary: async (taluka = '', forceRefresh = false) => {
    const params = new URLSearchParams();
    if (taluka) params.set('taluka', taluka);
    if (forceRefresh) params.set('refresh', 'true');
    const q = params.toString() ? `?${params.toString()}` : '';
    return cachedJsonFetch(
      `${BASE_URL}/api/analytics/summary${q}`,
      { headers: { ...getAuthHeaders() }, cache: 'no-store' },
      { forceRefresh, errorMessage: 'Failed to fetch analytics summary' }
    );
  },

  prefetchAnalyticsSummary: (taluka = '') => {
    const params = new URLSearchParams();
    if (taluka) params.set('taluka', taluka);
    const q = params.toString() ? `?${params.toString()}` : '';
    prefetchJson(`${BASE_URL}/api/analytics/summary${q}`, { headers: { ...getAuthHeaders() }, cache: 'no-store' });
  },

  // Parcels
  getParcels: async (params = {}, { forceRefresh = false } = {}) => {
    const query = buildSortedQuery(params);
    return cachedJsonFetch(
      `${BASE_URL}/api/parcels${query ? `?${query}` : ''}`,
      { headers: { ...getAuthHeaders() }, cache: 'no-store' },
      { forceRefresh, errorMessage: 'Failed to fetch parcels' }
    );
  },

  prefetchParcels: (params = {}) => {
    const query = buildSortedQuery(params);
    prefetchJson(`${BASE_URL}/api/parcels${query ? `?${query}` : ''}`, { headers: { ...getAuthHeaders() }, cache: 'no-store' });
  },

  updateParcel: async (upi, payload) => {
    const res = await fetch(`${BASE_URL}/api/parcels/${encodeURIComponent(upi)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update parcel');
    invalidateClientCache();
    return data;
  },

  getParcelTrace: async (upi, forceRefresh = false) => {
    return cachedJsonFetch(
      `${BASE_URL}/api/parcels/${encodeURIComponent(upi)}/trace`,
      { headers: { ...getAuthHeaders() }, cache: 'no-store' },
      { forceRefresh, errorMessage: `Failed to fetch trace for parcel ${upi}` }
    );
  },

  downloadParcelDossierPdf: async (upi) => {
    const res = await fetch(`${BASE_URL}/api/parcels/${encodeURIComponent(upi)}/export-pdf`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'दस्तऐवज अहवाल पीडीएफ डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'दस्तऐवज अहवाल पीडीएफ डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeUpi = upi.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `Parcel_Dossier_${safeUpi}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
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
    invalidateClientCache();
    return data;
  },

  // Cases & Hearings
  getCases: async (params = {}, { forceRefresh = false } = {}) => {
    const query = buildSortedQuery(params);
    return cachedJsonFetch(
      `${BASE_URL}/api/cases${query ? `?${query}` : ''}`,
      { headers: { ...getAuthHeaders() }, cache: 'no-store' },
      { forceRefresh, errorMessage: 'Failed to fetch cases' }
    );
  },

  prefetchCases: (params = {}) => {
    const query = buildSortedQuery(params);
    prefetchJson(`${BASE_URL}/api/cases${query ? `?${query}` : ''}`, { headers: { ...getAuthHeaders() }, cache: 'no-store' });
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
    invalidateClientCache();
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
    invalidateClientCache();
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
    invalidateClientCache();
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
    const res = await dedupedFetch(`${BASE_URL}/api/documents?${query}`, {
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
    const res = await dedupedFetch(`${BASE_URL}/api/reports/prapatra-3/preview?${query}`, {
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

  // Booklets (Prapatra 1-4)
  getBookletPreview: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await dedupedFetch(`${BASE_URL}/api/booklets/preview?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'बुकलेट पूर्वावलोकन लोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'Failed to fetch booklet preview');
    }
    return res.json();
  },

  downloadBookletExcel: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/booklets/export-excel?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'एक्सेल डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'एक्सेल डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${params.type || 'Booklet'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getBookletDownloadUrl: ({ type = 'ceiling', taluka = '', village = '', format = 'excel' } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (taluka) params.set('taluka', taluka);
    if (village) params.set('village', village);
    const token = getAuthToken();
    if (token) params.set('token', token);
    const endpoint = format === 'pdf' ? 'export-pdf' : 'export-excel';
    return `${BASE_URL}/api/booklets/${endpoint}?${params.toString()}`;
  },

  downloadBookletPdf: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/booklets/export-pdf?${query}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'पीडीएफ डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'पीडीएफ डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${params.type || 'Booklet'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  saveBookletRecord: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/booklets/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'नोंद जतन करणे अयशस्वी झाले.');
    return data;
  },

  getSampleTemplateUrl: () => `${BASE_URL}/api/parcels/sample-template`,

  // DPDPA 2023 Data Principal Rights
  exportDpdpaData: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/dpdpa/export`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'डेटा निर्यात अयशस्वी झाले.' }));
      throw new Error(err.error || 'डेटा निर्यात अयशस्वी झाले.');
    }
    return res.json();
  },

  requestDpdpaErasure: async (reason) => {
    const res = await fetch(`${BASE_URL}/api/auth/dpdpa/erasure-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'विनंती नोंदवणे अयशस्वी झाले.' }));
      throw new Error(err.error || 'विनंती नोंदवणे अयशस्वी झाले.');
    }
    return data;
  },

  updateProfile: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'प्रोफाइल अद्यतन अयशस्वी झाले.');
    }
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'संकेतशब्द बदलणे अयशस्वी झाले.');
    }
    return data;
  },

  getPrapatraReport: async (id, query = {}, { forceRefresh = false } = {}) => {
    const url = buildPrapatraUrl(id, query);
    return cachedJsonFetch(
      url,
      { headers: { ...getAuthHeaders() } },
      { forceRefresh, freshMs: 5 * 60 * 1000, staleMs: 30 * 60 * 1000, errorMessage: 'प्रपत्र डेटा लोड करणे अयशस्वी झाले.' }
    );
  },

  prefetchPrapatraReport: (id, query = {}) => {
    const url = buildPrapatraUrl(id, query);
    prefetchJson(url, { headers: { ...getAuthHeaders() } }, 5 * 60 * 1000);
  },

  getTalukaVillages: async (taluka = 'all') => {
    const params = new URLSearchParams();
    if (taluka && taluka !== 'all') params.append('taluka', taluka);
    const qs = params.toString();
    return cachedJsonFetch(
      `${BASE_URL}/api/prapatra/villages${qs ? `?${qs}` : ''}`,
      {},
      { freshMs: 10 * 60 * 1000, staleMs: 60 * 60 * 1000, errorMessage: 'गावांची यादी लोड करणे अयशस्वी झाले.' }
    );
  },

  updatePrapatraRollup: async (id, data) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/rollup/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'अभिलेख अद्ययावत करणे अयशस्वी झाले.');
    }
    invalidateClientCache();
    return resData;
  },

  inspectPrapatraDiff: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/inspect-diff`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'तपासणी प्रपत्र पडताळणी अयशस्वी झाली.');
    }
    return resData;
  },

  uploadPrapatraExcel: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/upload`, {
      method: 'POST',
      headers: {
        // Do not set Content-Type header so browser sets multipart boundary automatically
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'एक्सेल फाईल अपलोड करणे अयशस्वी झाले.');
    }
    invalidateClientCache();
    return resData;
  },

  purgeVillageData: async ({ taluka, villageName }) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/village/purge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ taluka, villageName }),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'गाव डेटा हटवणे अयशस्वी झाले.');
    }
    invalidateClientCache();
    return resData;
  },

  getPrapatraSummary: async () => {
    const res = await dedupedFetch(`${BASE_URL}/api/prapatra/summary`);
    if (!res.ok) {
      throw new Error('जिल्हा सारांश लोड करणे अयशस्वी झाले.');
    }
    return res.json();
  },

  getPrapatraExcelUrl: (id, query = {}) => {
    const params = new URLSearchParams();
    params.append('format', 'excel');
    if (typeof query === 'string') {
      params.append('taluka', query);
    } else {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          params.append(k, v);
        }
      });
    }
    const token = getAuthToken();
    if (token) params.append('token', token);
    return `${BASE_URL}/api/prapatra/${id}?${params.toString()}`;
  },

  getPrapatraPdfUrl: (id, query = {}) => {
    const params = new URLSearchParams();
    params.append('format', 'pdf');
    if (typeof query === 'string') {
      params.append('taluka', query);
    } else {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          params.append(k, v);
        }
      });
    }
    const token = getAuthToken();
    if (token) params.append('token', token);
    return `${BASE_URL}/api/prapatra/${id}?${params.toString()}`;
  },
  getBookletCategories: async () => {
    const res = await dedupedFetch(`${BASE_URL}/api/prapatra/categories`);
    if (!res.ok) {
      throw new Error('प्रपत्र श्रेणी लोड करणे अयशस्वी झाले.');
    }
    return res.json();
  },

  getRenumberingParchaData: async (taluka = '', village = '') => {
    const params = new URLSearchParams();
    if (taluka && taluka !== 'all') params.append('taluka', taluka);
    if (village && village !== 'all') params.append('village', village);
    const qs = params.toString();
    return cachedJsonFetch(
      `${BASE_URL}/api/prapatra/renumbering-parcha/data${qs ? `?${qs}` : ''}`,
      { headers: { ...getAuthHeaders() } },
      { freshMs: 5 * 60 * 1000, staleMs: 30 * 60 * 1000, errorMessage: 'रिनंबरिंग पर्चा डेटा लोड करणे अयशस्वी झाले.' }
    );
  },

  exportRenumberingParchaExcel: async (payload = {}) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/renumbering-parcha/export-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'रिनंबरिंग पर्चा एक्सेल डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'रिनंबरिंग पर्चा एक्सेल डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const vName = payload.header?.villageName ? `_${payload.header.villageName}` : '';
    a.download = `Renumbering_Parcha${vName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  exportRenumberingParchaPdf: async (payload = {}) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/renumbering-parcha/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'रिनंबरिंग पर्चा पीडीएफ डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'रिनंबरिंग पर्चा पीडीएफ डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const vName = payload.header?.villageName ? `_${payload.header.villageName}` : '';
    a.download = `Renumbering_Parcha${vName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  exportGoshwaraExcel: async (payload = {}) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/goshwara/export-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'गोषवारा एक्सेल डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'गोषवारा एक्सेल डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const tierName = payload.tier === 'village' ? 'Gavacha' : (payload.tier === 'taluka' ? 'Talukyacha' : (payload.tier === 'district' ? 'Jilhacha' : 'Sarva'));
    a.download = `${tierName}_Ghoshwara_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  exportGoshwaraPdf: async (payload = {}) => {
    const res = await fetch(`${BASE_URL}/api/prapatra/goshwara/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'गोषवारा पीडीएफ डाऊनलोड अयशस्वी झाले.' }));
      throw new Error(err.error || 'गोषवारा पीडीएफ डाऊनलोड अयशस्वी झाले.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const tierName = payload.tier === 'village' ? 'Gavacha' : (payload.tier === 'taluka' ? 'Talukyacha' : (payload.tier === 'district' ? 'Jilhacha' : 'Sarva'));
    a.download = `${tierName}_Ghoshwara_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // ==========================================
  // GOOGLE DRIVE ON-DEMAND SYNC APIs
  // ==========================================
  getDriveStatus: async () => {
    const res = await fetch(`${BASE_URL}/api/drive-sync/status`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'गुगल ड्राइव्ह जोडणी तपासण्यात अयशस्वी' }));
      throw new Error(err.error || 'गुगल ड्राइव्ह जोडणी तपासण्यात अयशस्वी');
    }
    return res.json();
  },

  scanDriveHierarchy: async (rootFolderId = '') => {
    const url = rootFolderId
      ? `${BASE_URL}/api/drive-sync/scan?rootFolderId=${encodeURIComponent(rootFolderId)}`
      : `${BASE_URL}/api/drive-sync/scan`;
    const res = await fetch(url, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'गुगल ड्राइव्ह स्कॅन अयशस्वी झाले' }));
      throw new Error(err.error || 'गुगल ड्राइव्ह स्कॅन अयशस्वी झाले');
    }
    return res.json();
  },

  pullVillageFromDrive: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/drive-sync/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({ error: 'ड्राईव्ह डेटा सिंक अयशस्वी' }));
    if (!res.ok) throw new Error(data.error || 'ड्राईव्ह डेटा सिंक अयशस्वी');
    return data;
  },

  pushVillageToDrive: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/drive-sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({ error: 'ड्राईव्हवर डेटा पाठवणे अयशस्वी' }));
    if (!res.ok) throw new Error(data.error || 'ड्राईव्हवर डेटा पाठवणे अयशस्वी');
    return data;
  },

  addDriveColumn: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/drive-sync/add-column`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({ error: 'कॉलम जोडण्यात अयशस्वी' }));
    if (!res.ok) throw new Error(data.error || 'कॉलम जोडण्यात अयशस्वी');
    return data;
  },

  addDriveRow: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/drive-sync/add-row`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({ error: 'रो जोडण्यात अयशस्वी' }));
    if (!res.ok) throw new Error(data.error || 'रो जोडण्यात अयशस्वी');
    return data;
  },

  // ==========================================
  // RBAC: ROLES, PERMISSIONS & USER MANAGEMENT
  // ==========================================
  getRbacPermissions: async () => {
    const res = await fetch(`${BASE_URL}/api/rbac/permissions`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'अधिकार सूची लोड करणे अयशस्वी');
    return data;
  },

  getRbacRoles: async () => {
    const res = await fetch(`${BASE_URL}/api/rbac/roles`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'भूमिका यादी लोड करणे अयशस्वी');
    return data;
  },

  createRbacRole: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/rbac/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'भूमिका तयार करणे अयशस्वी');
    return data;
  },

  updateRbacRole: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/rbac/roles/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'भूमिका अद्यतन करणे अयशस्वी');
    return data;
  },

  deleteRbacRole: async (id) => {
    const res = await fetch(`${BASE_URL}/api/rbac/roles/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'भूमिका हटवणे अयशस्वी');
    return data;
  },

  getRbacUsers: async () => {
    const res = await fetch(`${BASE_URL}/api/rbac/users`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'वापरकर्ता यादी लोड करणे अयशस्वी');
    return data;
  },

  createRbacUser: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/rbac/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'वापरकर्ता तयार करणे अयशस्वी');
    return data;
  },

  updateRbacUser: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/api/rbac/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'वापरकर्ता अद्यतन करणे अयशस्वी');
    return data;
  },

  getRbacAuditLogs: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const res = await fetch(`${BASE_URL}/api/rbac/audit-logs?${qs.toString()}`, {
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'ऑडिट नोंदी लोड करणे अयशस्वी');
    return data;
  },
};
