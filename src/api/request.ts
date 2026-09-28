import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios';
import { Base64 } from 'js-base64';

import { websiteConfig } from '@/config';
import { getToken } from '@/utils/auth';

import { ErrorCode, handleBusinessError, handleHttpError } from './error-handle';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// =============== 请求拦截器 ===============
service.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = `Basic ${Base64.encode(
      `${websiteConfig.clientId}:${websiteConfig.clientSecret}`
    )}`;
    if (getToken()) {
      config.headers[websiteConfig.tokenHeader] = `bearer ${getToken()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============== 响应拦截器 ===============
service.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    if (response.config.url?.includes('oauth/token')) {
      return response.data;
    }
    const { code, msg, data } = response.data;
    console.log('response.data:', response.data);
    if (code === ErrorCode.SUCCESS || code === 200) {
      return data;
    }

    handleBusinessError(code, msg);
    return Promise.reject({ code, msg });
  },
  (error: AxiosError) => {
    handleHttpError(error);
    return Promise.reject(error);
  }
);

export default service;
