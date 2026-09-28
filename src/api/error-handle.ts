import i18n from '@/i18n';
import eventEmitter from '@/utils/event-emitter';

import type { AxiosError } from 'axios';

export enum ErrorCode {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,

  // 业务类错误
  PARAM_ERROR = 1001,
  VALIDATION_FAILED = 1002,
  TOKEN_EXPIRED = 1003,
  BUSINESS_ERROR = 1004,
}

export const ErrorMessages: any = {
  [ErrorCode.UNAUTHORIZED]: 'error.unauthorized',
  [ErrorCode.FORBIDDEN]: 'error.forbidden',
  [ErrorCode.NOT_FOUND]: 'error.notFound',
  [ErrorCode.SERVER_ERROR]: 'error.serverError',
  [ErrorCode.PARAM_ERROR]: 'error.param',
  [ErrorCode.VALIDATION_FAILED]: 'error.validation',
  [ErrorCode.TOKEN_EXPIRED]: 'error.tokenExpired',
  [ErrorCode.BUSINESS_ERROR]: 'error.business',
};

export function handleBusinessError(code?: number, msg?: string) {
  const t = i18n.t.bind(i18n);
  const key = ErrorMessages[code as ErrorCode];
  const text = key ? t(key) : msg || t('error.business');

  switch (code) {
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.TOKEN_EXPIRED:
      eventEmitter.emit('API:UN_AUTH', text);
      localStorage.removeItem('token');
      break;

    case ErrorCode.FORBIDDEN:
    case ErrorCode.NOT_FOUND:
    case ErrorCode.PARAM_ERROR:
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.SERVER_ERROR:
    case ErrorCode.BUSINESS_ERROR:
      eventEmitter.emit('API:SERVER_ERROR', text);
      break;

    default:
      eventEmitter.emit('API:SERVER_ERROR', t('error.business'));
  }
}

export function handleHttpError(error: AxiosError) {
  const t = i18n.t.bind(i18n);
  if (error.code === 'ECONNABORTED') {
    eventEmitter.emit('API:SERVER_ERROR', t('error.timeout') || '请求超时，请稍后再试');
    return;
  }

  if (!error.response) {
    eventEmitter.emit('API:SERVER_ERROR', t('error.network') || '网络异常，请检查网络连接');
    return;
  }

  const { status } = error.response;
  switch (status) {
    case 400: {
      const message: string =
        (error.response?.data as any)?.msg || t('error.badRequest') || '错误请求';
      eventEmitter.emit('API:SERVER_ERROR', message);
      //eventEmitter.emit("API:SERVER_ERROR", t("error.badRequest") || "错误请求");
      break;
    }
    case 401:
      eventEmitter.emit('API:UN_AUTH', t('error.unauthorized') || '未授权，请重新登录');
      break;
    case 403:
      eventEmitter.emit('API:SERVER_ERROR', t('error.forbidden') || '拒绝访问');
      break;
    case 404:
      eventEmitter.emit('API:SERVER_ERROR', t('error.notFound') || '请求资源未找到');
      break;
    case 500:
      eventEmitter.emit('API:SERVER_ERROR', t('error.serverError') || '服务器异常，请稍后重试');
      break;
    default:
      eventEmitter.emit(
        'API:SERVER_ERROR',
        t('error.httpError', { status }) || `HTTP 错误：${status}`
      );
      break;
  }
}
