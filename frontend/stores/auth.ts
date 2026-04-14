import { defineStore } from 'pinia';
import type { AxiosInstance } from 'axios';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthClinic {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  logoUrl?: string;
  primaryColor: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  clinic: AuthClinic | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    refreshToken: null,
    user: null,
    clinic: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isOwner: (state) => state.user?.role === 'clinic_owner',
    isManager: (state) => ['clinic_owner', 'manager'].includes(state.user?.role || ''),
    clinicName: (state) => state.clinic?.name || 'ClinicaSaaS',
  },

  actions: {
    // Obtém a instância do axios do plugin (funciona fora do setup)
    _api(): AxiosInstance {
      return useNuxtApp().$api as AxiosInstance;
    },

    async login(email: string, password: string) {
      const { data } = await this._api().post('/auth/login', { email, password });
      this._saveSession(data);
      return data;
    },

    async refreshSession() {
      const refresh = this.refreshToken || (import.meta.client ? localStorage.getItem('auth_refresh') : null);
      if (!refresh) throw new Error('Sem refresh token');

      const { data } = await this._api().post('/auth/refresh', { refresh_token: refresh });
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;

      if (import.meta.client) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_refresh', data.refresh_token);
      }
    },

    async loadFromStorage() {
      if (!import.meta.client) return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      this.token = token;
      this.refreshToken = localStorage.getItem('auth_refresh');

      try {
        const { data } = await this._api().get('/auth/me');
        this.user = data;
      } catch {
        this.logout();
      }
    },

    _saveSession(data: any) {
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      this.clinic = data.clinic;

      if (import.meta.client) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_refresh', data.refresh_token);
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.clinic = null;

      if (import.meta.client) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh');
      }
    },
  },
});
