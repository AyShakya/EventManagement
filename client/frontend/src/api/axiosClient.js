import axios from "axios";

const API_BASE = import.meta.env.SERVER_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  refreshQueue = [];
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if(err.response && err.response.status === 401 && !originalRequest._retry){
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResp = await api.post('/api/auth/refresh-token'); 
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
)

export async function fetchCsrfToken(){
  const resp = await api.get('/api/csrf-token');
  return resp.data && resp.data.csrfToken;
}

export default api;