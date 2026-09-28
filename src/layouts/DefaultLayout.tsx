import { useEffect } from 'react';

import { Layout, Modal } from 'antd';
import NProgress from 'nprogress';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import AuthGuard from '@/router/gurd';
import { useAppSelector } from '@/store';
import eventEmitter from '@/utils/event-emitter';

import Header from './components/Header';
import SiderbarMenu from './components/SidebarMenu';

const { Header: LayoutHeader, Sider, Content } = Layout;

const DefaultLayout = () => {
  const collapsed = useAppSelector((state) => state.app.sidebarCollapsed);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navigationType = useNavigationType();
  const handleLogin = () => {
    Modal.destroyAll();
    console.log('触发未授权异常事件，跳转登录');
    dispatch({ type: 'user/logOut' });
    window.location.href = import.meta.env.VITE_LOGIN_URL || '/login';
  };
  useEffect(() => {
    NProgress.start();
    // 模拟加载延迟，确保进度条可见（生产可去掉）
    const timer = setTimeout(() => NProgress.done(), 200);
    Modal.destroyAll();
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location, navigationType]);
  useEffect(() => {
    eventEmitter.on('API:UN_AUTH', handleLogin);
    return () => {
      eventEmitter.off('API:UN_AUTH', handleLogin);
    };
  }, []);

  return (
    <AuthGuard>
      <Layout>
        <Sider
          width={320}
          className=" h-screen sticky top-0 shadow-lg border-r border-slate-200 transition-all duration-300 overflow-y-auto  z-1"
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <SiderbarMenu />
          {/* <Sidebar /> */}
        </Sider>
        <Layout>
          <LayoutHeader className=" sticky top-0 z-10 leading-normal flex items-center border-b border-slate-200 ">
            <Header />
          </LayoutHeader>
          <Content className="p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
};
export default DefaultLayout;
