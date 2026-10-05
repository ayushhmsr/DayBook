// ─────────────────────────────────────────────────────────────────────────────
// DATA & API LAYER.
// Connects to Express backend (/api/auth/*) and isolates entries strictly
// per authenticated user account & selected profession template.
// ─────────────────────────────────────────────────────────────────────────────
import { addDays, dayKey } from '../utils/dates.js';

const USER_KEY = 'daybook.user.v1';
const TOKEN_KEY = 'daybook.token.v1';
const PROF_KEY_PREFIX = 'daybook.user_prof.';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable in restricted modes */
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const sortEntries = (list) =>
  [...list].sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));

// ── Clean legacy demo/mock storage ──────────────────────────────────────────
try {
  localStorage.removeItem('daybook.entries.v1');
  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('daybook.entries.')) {
        const raw = localStorage.getItem(k);
        if (raw && (raw.includes('demo-') || raw.includes('Opening Range Breakout') || raw.includes('NIFTY 24800 CE'))) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const clean = parsed.filter((e) => e && e.id && !String(e.id).startsWith('demo-'));
              localStorage.setItem(k, JSON.stringify(clean));
            }
          } catch {}
        }
      }
    });
  }
} catch {}

// ── User Scoped Storage Helpers ─────────────────────────────────────────────
const getUserIdentifier = (user) => {
  if (!user) return 'guest';
  if (user.id) return `uid_${user.id}`;
  if (user._id) return `uid_${user._id}`;
  if (user.email) return `eml_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return 'guest';
};

const getUserEntriesKey = (user) => {
  const ident = getUserIdentifier(user);
  return `daybook.entries.${ident}.v1`;
};

const getUserEntries = (user) => {
  const key = getUserEntriesKey(user);
  const entries = read(key, []);
  // Filter out any leftover demo/sample entries
  const clean = entries.filter((e) => e && e.id && !String(e.id).startsWith('demo-'));
  if (clean.length !== entries.length) {
    write(key, clean);
  }
  return clean;
};

const saveUserEntries = (user, list) => {
  const key = getUserEntriesKey(user);
  const clean = (list || []).filter((e) => e && e.id && !String(e.id).startsWith('demo-'));
  write(key, clean);
};


// ── HTTP API Client ─────────────────────────────────────────────────────────
const PRODUCTION_BACKEND_URL = 'https://daybook-backend-p7be.onrender.com';
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : PRODUCTION_BACKEND_URL;

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  let res;
  try {
    res = await fetch(targetUrl, {
      ...options,
      headers,
      credentials: 'include', // send & receive httpOnly refreshToken cookies
    });
  } catch {
    throw new Error('Network error. Please make sure the backend server is running.');
  }

  // Handle automatic 401 token refresh if not already calling refresh
  if (res.status === 401 && !endpoint.includes('/refresh-token') && !endpoint.includes('/login')) {
    try {
      const refreshUrl = `${API_BASE}/api/auth/refresh-token`;
      const refreshRes = await fetch(refreshUrl, {
        method: 'GET',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          localStorage.setItem(TOKEN_KEY, refreshData.accessToken);
          headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return apiRequest(endpoint, { ...options, headers });
        }
      }
    } catch {
      // refresh failed
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Public API ───────────────────────────────────────────────────────────────
export const api = {
  getUserSync() {
    return read(USER_KEY, null);
  },

  getAccessToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Calls Backend POST /api/auth/register
  async register({ name, email, password, profession = 'trader' }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password,
      }),
    });

    // Save chosen profession permanently linked to user's email
    write(`${PROF_KEY_PREFIX}${cleanEmail}`, profession);

    const pendingUser = {
      name: data?.user?.name || cleanName,
      email: data?.user?.email || cleanEmail,
      profession,
      verified: false,
    };
    write(USER_KEY, pendingUser);

    return {
      message: data.message || 'Verification code sent to your email',
      user: pendingUser,
    };
  },

  // Calls Backend POST /api/auth/verify-email
  async verifyEmail({ email, otp, password, profession }) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: cleanEmail,
        otp: otp.trim(),
      }),
    });

    const storedProf = profession || read(`${PROF_KEY_PREFIX}${cleanEmail}`, 'trader');
    write(`${PROF_KEY_PREFIX}${cleanEmail}`, storedProf);

    // Auto-login to obtain accessToken
    if (password) {
      try {
        return await this.login({ email: cleanEmail, password, profession: storedProf });
      } catch {
        // continue with verified user object
      }
    }

    const verifiedUser = {
      id: data?.user?.id || data?.user?._id,
      name: data?.user?.name || cleanEmail.split('@')[0],
      email: data?.user?.email || cleanEmail,
      profession: storedProf,
      verified: true,
    };
    write(USER_KEY, verifiedUser);

    return {
      message: data.message || 'Email verified successfully',
      user: verifiedUser,
    };
  },

  // Calls Backend POST /api/auth/login
  async login({ email, password, profession }) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: cleanEmail,
        password,
      }),
    });

    if (data.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
    }

    const savedProf = profession || read(`${PROF_KEY_PREFIX}${cleanEmail}`, null);
    const existing = read(USER_KEY, null);
    const userProf = savedProf || (existing?.email === cleanEmail && existing?.profession ? existing.profession : 'trader');
    write(`${PROF_KEY_PREFIX}${cleanEmail}`, userProf);

    const user = {
      id: data.user?.id || data.user?._id,
      name: data.user?.name || cleanEmail.split('@')[0],
      email: data.user?.email || cleanEmail,
      profession: userProf,
      verified: true,
    };
    write(USER_KEY, user);
    return user;
  },

  // Calls Backend POST /api/auth/forgot-password
  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail }),
    });
    return data;
  },

  // Calls Backend POST /api/auth/reset-password
  async resetPassword({ email, otp, newPassword }) {
    const cleanEmail = email.trim().toLowerCase();
    const data = await apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: cleanEmail,
        otp: otp.trim(),
        newPassword,
      }),
    });
    return data;
  },

  // Calls Backend GET /api/auth/get-me
  async getMe() {
    try {
      const data = await apiRequest('/api/auth/get-me', { method: 'GET' });
      const existing = read(USER_KEY, {});
      const cleanEmail = data.email?.toLowerCase();
      const userProf = existing.profession || read(`${PROF_KEY_PREFIX}${cleanEmail}`, 'trader');
      const user = {
        ...existing,
        id: data.id || data._id,
        name: data.name,
        email: data.email,
        profession: userProf,
        verified: true,
      };
      write(USER_KEY, user);
      return user;
    } catch {
      return this.getUserSync();
    }
  },

  // Calls Backend POST /api/auth/logout
  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      remove(USER_KEY);
      remove(TOKEN_KEY);
    }
  },

  // Backend Connected & User-isolated Journal Entries
  async listEntries({ templateId } = {}) {
    const user = this.getUserSync();
    const userProf = user?.profession;
    const target = templateId || userProf;
    const query = target ? `?templateId=${encodeURIComponent(target)}` : '';

    try {
      const data = await apiRequest(`/api/entries${query}`, { method: 'GET' });
      if (data.entries && Array.isArray(data.entries)) {
        saveUserEntries(user, data.entries);
        return sortEntries(data.entries);
      }
    } catch {
      // Offline / fallback to local cache
    }

    const userEntries = getUserEntries(user);
    const filtered = target ? userEntries.filter((e) => e.templateId === target) : userEntries;
    return sortEntries(filtered);
  },

  async createEntry({ templateId, date, values }) {
    const user = this.getUserSync();
    const ident = getUserIdentifier(user);
    const userTemplate = templateId || user?.profession || 'trader';

    let entry = {
      id: newId(),
      userId: ident,
      templateId: userTemplate,
      date,
      createdAt: new Date().toISOString(),
      values,
    };

    try {
      const data = await apiRequest('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
          templateId: userTemplate,
          date,
          values,
        }),
      });
      if (data.entry) {
        entry = { ...entry, id: data.entry.id || data.entry._id || entry.id };
      }
    } catch {
      // Local fallback
    }

    const current = getUserEntries(user);
    const updated = [...current, entry];
    saveUserEntries(user, updated);
    return entry;
  },

  async deleteEntry(id) {
    const user = this.getUserSync();
    try {
      await apiRequest(`/api/entries/${id}`, { method: 'DELETE' });
    } catch {
      // Local fallback
    }
    const current = getUserEntries(user);
    const updated = current.filter((e) => e.id !== id);
    saveUserEntries(user, updated);
  },
};




