import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  refreshQueue = [];
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const response = err.response;

    if (!response) {
      throw new Error("Network error or server is unreachable");
    }

    const status = response.status;
    const isRefreshCall = originalRequest?.url?.includes(
      "/api/auth/refresh-token"
    );

    if (status === 401 && !isRefreshCall && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrf = await fetchCsrfToken();
        const refreshResp = await api.post(
          "/api/auth/refresh-token",
          {},
          { headers: { "X-CSRF-Token": csrf } }
        );
        processQueue(null, refreshResp.data);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        throw refreshErr;
      }
    }
    throw err;
  }
);

export async function fetchCsrfToken() {
  const resp = await api.get("/api/csrf-token");
  return resp.data && resp.data.csrfToken;
}

export async function csrfPost(url, data = {}, config = {}) {
  const token = await fetchCsrfToken();
  return api.post(url, data, {
    ...config,
    headers: { ...(config.headers || {}), "X-CSRF-Token": token },
  });
}

export async function csrfDelete(url, config = {}) {
  const token = await fetchCsrfToken();
  return api.delete(url, {
    ...config,
    headers: { ...(config.headers || {}), "X-CSRF-Token": token },
  });
}

export default api;
