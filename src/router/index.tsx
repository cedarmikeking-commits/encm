import { Suspense, useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { mergeRoutes } from './mergeRoutes';
import { localRoutes } from './localRoutes';
import { Spin } from 'antd';
import { generateRoutes } from './remoteRoutes';
// const router = createBrowserRouter(localRoutes);
const AppRouter = () => {
  const menuList = useAppSelector(state => state.menu.menuList);
  const [router, setRounter] = useState<any>(null);
  //const routes = mergeRoutes(localRoutes, menuList);
  useEffect(() => {
    const router = createBrowserRouter(localRoutes(menuList), {
      basename: '/',
    });
    const dynamicChildren = generateRoutes(menuList);
    router.patchRoutes('BasicLayout', dynamicChildren);
    setRounter(router);
  }, [menuList]);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      }
    >
      {router && <RouterProvider router={router} />}
    </Suspense>
  );
};
export default AppRouter;
