import { useEffect, useState } from 'react';

import { Spin } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store';
import { getToken, toLogin } from '@/utils/auth';

// 路由白名单
const whiteList = ['/login'];

export default function AuthGuard({ children }: { children: JSX.Element }): JSX.Element {
  const location = useLocation();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const menuLoaded = useAppSelector((state) => state.menu.loaded);
  useEffect(() => {
    // 模拟异步验证，可在此请求用户信息
    const timer = setTimeout(() => setLoading(false), 200);

    return () => clearTimeout(timer);
  }, [location]);

  // 白名单直接放行
  if (whiteList.includes(location.pathname)) return children;

  // 无 token 跳转登录
  //@ts-expect-error - toLogin 函数暂时没有类型定义
  if (!token) return toLogin({ redirect: encodeURIComponent(window.location.href) });
  // 菜单未加载完，显示加载中

  // 加载中
  if (loading || !menuLoaded) {
    return (
      <div
        style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 通过验证后渲染页面
  return children;
}
