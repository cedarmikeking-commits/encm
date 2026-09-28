import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body;
      if (username === 'admin' && password === '123456') {
        return { code: 200, data: { token: 'mock-token' } };
      }
      return { code: 401, message: '用户名或密码错误' };
    },
  },
] as MockMethod[];
