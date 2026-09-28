import NotFound from '@/pages/NotFound';
import DefaultLayout from '@/layouts/DefaultLayout';
import FullPageLayout from '@/layouts/FullPageLayout';
import Dashboard from '@/pages/Dashboard';
import { Navigate } from 'react-router-dom';
import { AuthPage } from '@/layouts/login/AuthPage';


export function localRoutes(menuList: any) {
  let defaultPage = '/dashboard';
  if (!menuList.find((a: any) => a?.path?.toLowerCase() === '/dashboard')) {
    defaultPage = '/'
  }
  return [
    {
      path: '/login',
      element: <FullPageLayout />,
      children: [{ index: true, element: <AuthPage /> }],
    },
    {
      path: '/',
      element: <DefaultLayout />,
      routeId: 'BasicLayout',
      key: 'BasicLayout',
      id: 'BasicLayout',
      children: [
        { index: defaultPage != '/', element: <Navigate to={defaultPage} replace /> },
        // {
        //   path: '/dashboard',
        //   element: <Dashboard />,
        // },
      ], // 动态菜单会插入这里
    },

    {
      path: '*',
      element: <NotFound />,
    },
  ];
}
