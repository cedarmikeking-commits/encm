import service from './request';

import type { AxiosRequestConfig } from 'axios';

export const http = {
  get<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    // 处理请求参数，去掉 undefined 或 null 的值
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    return service<T>({ url, method: 'get', params: filteredParams, ...config }) as Promise<T>;
  },
  post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    return service<T>({ url, method: 'post', data, ...config }) as Promise<T>;
  },
  put<T = any>(url: string, data?: object, config?: AxiosRequestConfig) {
    return service<T>({ url, method: 'put', data, ...config }) as Promise<T>;
  },
  delete<T = any>(url: string, params?: object, config?: AxiosRequestConfig) {
    return service<T>({ url, method: 'delete', params, ...config }) as Promise<T>;
  },
  postParams<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    return service<T>({ url, method: 'post', params, ...config }) as Promise<T>;
  },
  patch<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    return service<T>({ url, method: 'patch', data, ...config }) as Promise<T>;
  },
};
