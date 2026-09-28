// src/router/dynamicRoutes.ts
import React from 'react';

import { flattenTreeData } from '@/utils';

import type { RouteObject } from 'react-router-dom';

const modules = import.meta.glob('../pages/**/*.tsx');
export interface MenuItem {
  path: string;
  name: string;
  icon?: string;
  children?: MenuItem[];
  category?: number;
}

// 动态加载页面组件
const lazyImport = (path: string): React.LazyExoticComponent<React.ComponentType<any>> | null => {
  const _path = `../pages${path}.tsx`;
  const importer: any = modules[_path];
  if (importer) {
    return React.lazy(importer);
  }
  return null;
};

// 将菜单结构转换为路由配置
export const generateRoutes = (menus: MenuItem[]): RouteObject[] => {
  const _menus = flattenTreeData(menus, 'children');
  const res = _menus.map((menu) => {
    if (lazyImport(menu.path) === null) {
      // console.warn(`路径为 ${menu.path} 的组件未找到，请检查文件是否存在。`);
      return null;
    }
    const route: RouteObject = {
      path: menu.path,
      element: React.createElement(lazyImport(menu.path)!),
    };

    return route;
  });
  return res.filter((route) => route !== null) as RouteObject[];
};
