import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import { useDispatch } from 'react-redux';

import { getUserInfoAndMenu } from './api/user';
import { websiteConfig } from './config';
import AppRouter from './router';
import { generateTreeData } from './utils';
import { getToken } from './utils/auth';
import eventEmitter from './utils/event-emitter';

const App = () => {
  const _antdApp = AntdApp.useApp();
  const token = getToken();
  const dispatch = useDispatch();
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo', token],
    enabled: !!token,
    queryFn: async () => {
      try {
        const { moduleList, ...user } = await getUserInfoAndMenu({
          clientId: websiteConfig.clientId,
        });
        const menu = generateTreeData(moduleList || [], 'id', 'parentId', 'children');
        dispatch({ type: 'user/setUserInfo', payload: user });
        dispatch({ type: 'menu/setMenu', payload: menu });
        return user;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });
  const handleError = (arg: string) => {
    console.log('触发全局异常事件');
    _antdApp.message.error(arg);
  };
  useEffect(() => {
    // 监听全局异常事件
    eventEmitter.on('API:SERVER_ERROR', handleError);
    return () => {
      // 卸载事件监听器
      eventEmitter.off('API:SERVER_ERROR', handleError);
    };
  }, []);
  return <AppRouter />;
};
export default App;
