// src/router/mergeRoutes.tsx
import { generateRoutes } from './remoteRoutes';

export function mergeRoutes(local: any[], remote: any[]) {
  const dynamicChildren = generateRoutes(remote);

  // 找到 BasicLayout 下的 children 插入动态路由
  const merged = local.map(route => {
    if (route.path === '/') {
      return { ...route, children: [...(route.children || []), ...dynamicChildren] };
    }
    return route;
  });
  return merged;
}
