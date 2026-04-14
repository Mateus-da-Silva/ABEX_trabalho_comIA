import type { AxiosInstance } from 'axios';

/**
 * Retorna a instância do axios criada no plugin /plugins/api.ts.
 * Funciona em qualquer contexto: setup, event handlers, store actions.
 */
export const useApi = (): AxiosInstance => {
  const { $api } = useNuxtApp();
  return $api as AxiosInstance;
};

/**
 * Wrapper tipado para os métodos HTTP mais comuns.
 */
export const useApiRequest = () => {
  const api = useApi();

  const get = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const { data } = await api.get<T>(url, { params });
    return data;
  };

  const post = async <T>(url: string, body?: any): Promise<T> => {
    const { data } = await api.post<T>(url, body);
    return data;
  };

  const put = async <T>(url: string, body?: any): Promise<T> => {
    const { data } = await api.put<T>(url, body);
    return data;
  };

  const patch = async <T>(url: string, body?: any): Promise<T> => {
    const { data } = await api.patch<T>(url, body);
    return data;
  };

  const del = async <T>(url: string): Promise<T> => {
    const { data } = await api.delete<T>(url);
    return data;
  };

  return { get, post, put, patch, del };
};
