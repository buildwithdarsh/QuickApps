const API_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001/api/v1";

interface ApiOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, Array.isArray(message) ? message[0] : message);
  }

  return json?.data ?? json;
}

// ── Auth ─────────────────────────────────────────────

export const auth = {
  register: (data: { email: string; password: string; name?: string; orgName: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  verifyEmail: (data: { email: string; code: string }) =>
    request("/auth/verify-email", { method: "POST", body: JSON.stringify(data) }),

  resendVerification: (email: string) =>
    request("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),

  refresh: (refreshToken: string) =>
    request("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  logout: (refreshToken: string, token: string) =>
    request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }), token }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
};

// ── Users ────────────────────────────────────────────

export const users = {
  me: (token: string) => request("/users/me", { token }),
  update: (data: { name?: string }, token: string) =>
    request("/users/me", { method: "PATCH", body: JSON.stringify(data), token }),
};

// ── Organisations ────────────────────────────────────

export const orgs = {
  me: (token: string) => request("/organisations/me", { token }),
  update: (data: Record<string, unknown>, token: string) =>
    request("/organisations/me", { method: "PATCH", body: JSON.stringify(data), token }),
  members: (token: string) => request("/organisations/me/members", { token }),
};

// ── Apps ─────────────────────────────────────────────

export const apps = {
  list: (token: string) => request("/apps", { token }),

  get: (id: string, token: string) => request(`/apps/${id}`, { token }),

  create: (data: { name: string; url: string; bundleId?: string }, token: string) =>
    request("/apps", { method: "POST", body: JSON.stringify(data), token }),

  update: (id: string, data: Record<string, unknown>, token: string) =>
    request(`/apps/${id}`, { method: "PATCH", body: JSON.stringify(data), token }),

  updateConfig: (id: string, config: Record<string, unknown>, token: string) =>
    request(`/apps/${id}/config`, { method: "PUT", body: JSON.stringify(config), token }),

  delete: (id: string, token: string) =>
    request(`/apps/${id}`, { method: "DELETE", token }),
};

// ── Addons ───────────────────────────────────────────

export const addons = {
  catalog: (full = false) => request(`/addons/catalog${full ? "?full=true" : ""}`),

  purchased: (token: string) => request("/addons/purchased", { token }),

  forApp: (appId: string, token: string) =>
    request(`/addons/apps/${appId}`, { token }),

  purchase: (appId: string, slug: string, token: string) =>
    request(`/addons/apps/${appId}/${slug}`, { method: "POST", token }),

  purchaseBulk: (appId: string, slugs: string[], token: string) =>
    request(`/addons/apps/${appId}/bulk`, { method: "POST", body: JSON.stringify({ slugs }), token }),

  remove: (appId: string, slug: string, token: string) =>
    request(`/addons/apps/${appId}/${slug}`, { method: "DELETE", token }),

  getConfig: (appId: string, slug: string, token: string) =>
    request(`/addons/apps/${appId}/${slug}/config`, { token }),

  saveConfig: (appId: string, slug: string, config: Record<string, unknown>, token: string) =>
    request(`/addons/apps/${appId}/${slug}/config`, { method: "PUT", body: JSON.stringify(config), token }),

  toggle: (appId: string, slug: string, isActive: boolean, token: string) =>
    request(`/addons/apps/${appId}/${slug}/toggle`, { method: "PATCH", body: JSON.stringify({ isActive }), token }),
};

// ── Builds ───────────────────────────────────────────

export const builds = {
  trigger: (appId: string, token: string) =>
    request(`/apps/${appId}/builds`, { method: "POST", token }),

  list: (appId: string, token: string, page = 1) =>
    request(`/apps/${appId}/builds?page=${page}`, { token }),

  get: (appId: string, buildId: string, token: string) =>
    request(`/apps/${appId}/builds/${buildId}`, { token }),

  retry: (appId: string, buildId: string, token: string) =>
    request(`/apps/${appId}/builds/${buildId}/retry`, { method: "POST", token }),

  download: (appId: string, buildId: string, artifact: string, token: string) =>
    request(`/apps/${appId}/builds/${buildId}/download/${artifact}`, { token }),

  downloadSourceUrl: (appId: string, buildId: string) =>
    `/apps/${appId}/builds/${buildId}/download-source`,
};

// ── Revisions ────────────────────────────────────────

export const revisions = {
  status: (appId: string, token: string) =>
    request(`/apps/${appId}/revisions`, { token }),

  purchase: (appId: string, token: string) =>
    request(`/apps/${appId}/revisions/purchase`, { method: "POST", token }),
};

// ── Payments ─────────────────────────────────────────

export const payments = {
  createOrder: (data: { amount: number; type: string; metadata?: Record<string, unknown> }, token: string) =>
    request("/payments/create-order", { method: "POST", body: JSON.stringify(data), token }),

  verify: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }, token: string) =>
    request("/payments/verify", { method: "POST", body: JSON.stringify(data), token }),

  history: (token: string, page = 1) =>
    request(`/payments/history?page=${page}`, { token }),
};

// ── Wallet ───────────────────────────────────────────

export const wallet = {
  balance: (token: string) => request("/wallet/balance", { token }),
  transactions: (token: string, page = 1) =>
    request(`/wallet/transactions?page=${page}`, { token }),
};

// ── Upload ───────────────────────────────────────────

export const upload = {
  presignedUrl: (data: { assetType: string; fileName: string; contentType: string; appId?: string }, token: string) =>
    request("/upload/presigned-url", { method: "POST", body: JSON.stringify(data), token }),
};

// ── Admin ────────────────────────────────────────────

export const admin = {
  stats: (token: string) => request("/admin/stats", { token }),
  orgs: (token: string, page = 1) => request(`/admin/organisations?page=${page}`, { token }),
  orgDetails: (id: string, token: string) => request(`/admin/organisations/${id}`, { token }),
  suspendOrg: (id: string, token: string) =>
    request(`/admin/organisations/${id}/suspend`, { method: "PATCH", token }),
  reactivateOrg: (id: string, token: string) =>
    request(`/admin/organisations/${id}/reactivate`, { method: "PATCH", token }),
  builds: (token: string, page = 1, status?: string) =>
    request(`/admin/builds?page=${page}${status ? `&status=${status}` : ""}`, { token }),
};

// ── Site Meta ────────────────────────────────────────

export interface SiteMetadata {
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  favicon: string | null;
  ogImage: string | null;
  themeColor: string | null;
  generator: string | null;
  language: string | null;
  isReachable: boolean;
}

export const siteMeta = {
  fetch: (url: string) => request<SiteMetadata>(`/site-meta?url=${encodeURIComponent(url)}`),
};

export { ApiError };
