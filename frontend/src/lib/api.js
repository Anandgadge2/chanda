const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  // Analytics
  getAnalyticsSummary: async (taluka = '') => {
    const q = taluka ? `?taluka=${encodeURIComponent(taluka)}` : '';
    const res = await fetch(`${BASE_URL}/api/analytics/summary${q}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },

  // Parcels
  getParcels: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/parcels?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch parcels');
    return res.json();
  },

  getParcelTrace: async (upi) => {
    const res = await fetch(`${BASE_URL}/api/parcels/${encodeURIComponent(upi)}/trace`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch trace for parcel ${upi}`);
    return res.json();
  },

  uploadVillageExcel: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/parcels/bulk-upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bulk upload Excel');
    return data;
  },

  // Cases & Hearings
  getCases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/cases?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  createCase: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create case');
    return data;
  },

  addHearing: async (caseId, payload) => {
    const res = await fetch(`${BASE_URL}/api/cases/${caseId}/hearings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to schedule hearing');
    return data;
  },

  updateCaseStatus: async (caseId, payload) => {
    const res = await fetch(`${BASE_URL}/api/cases/${caseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data;
  },

  getDocuments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/documents?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  // Reports
  getPrapatra3Preview: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/reports/prapatra-3/preview?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch Prapatra-3 preview');
    return res.json();
  },

  getPrapatra3DownloadUrl: (taluka = '', violationType = '') => {
    const params = new URLSearchParams();
    if (taluka) params.set('taluka', taluka);
    if (violationType) params.set('violationType', violationType);
    return `${BASE_URL}/api/reports/prapatra-3?${params.toString()}`;
  },

  getSampleTemplateUrl: () => `${BASE_URL}/api/parcels/sample-template`,
};
