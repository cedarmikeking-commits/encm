const TOKEN_KEY = 'token';

export function getTokenOnUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const refreshToken = params.get('refreshToken') || '';
  if (token) {
    setToken(token);
    localStorage.setItem('refreshToken', refreshToken);
  }
  return token;
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function toLogin(params: { [key: string]: string }) {
  const loginUrl = import.meta.env.VITE_LOGIN_URL || '/login';
  console.log('跳转登录，登录地址：', import.meta.env.VITE_LOGIN_URL);
  const url = new URL(loginUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  window.location.href = url.toString();
}
export function toPersonal(params: { [key: string]: string }) {
  const loginUrl = import.meta.env.VITE_PERSONAL_CENTER_URL || '/login';
  const url = new URL(loginUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  window.location.href = url.toString();
}
