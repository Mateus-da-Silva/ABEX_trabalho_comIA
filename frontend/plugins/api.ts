import axios, { type AxiosInstance } from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const api: AxiosInstance = axios.create({
    baseURL: `${config.public.apiUrl}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30_000,
  });

  // Injeta o token antes de cada request
  api.interceptors.request.use((config) => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Trata 401: tenta renovar token ou redireciona para login (apenas no cliente)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!import.meta.client) return Promise.reject(error);

      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = localStorage.getItem('auth_refresh');
          if (!refreshToken) throw new Error('no refresh token');

          const { data } = await axios.post(
            `${config.public.apiUrl}/api/v1/auth/refresh`,
            { refresh_token: refreshToken },
          );

          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('auth_refresh', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh');
          await navigateTo('/auth/login');
        }
      }
      return Promise.reject(error);
    },
  );

  // Disponibiliza como $api em qualquer contexto
  return { provide: { api } };
});
