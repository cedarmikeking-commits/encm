import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/es/storage';

import appReducer from './modules/app';
import menuReducer from './modules/menu';
import userReducer from './modules/user';

const persistConfig = {
  key: 'root', // 存储的 key
  storage, // 使用 localStorage
  // whitelist: ['user'],  // 只持久化 user 模块（按需配置）
};
const rootReducer = combineReducers({
  menu: menuReducer,
  app: appReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
// 👇 包装 rootReducer，支持"退出登录时清空状态"
const resetReducer = (state: any, action: any) => {
  if (action.type === 'user/logOut') {
    // 清空所有 redux 数据
    storage.removeItem('persist:root');
    return persistedReducer(undefined, action);
  }
  return persistedReducer(state, action);
};
export const store = configureStore({
  reducer: resetReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 关闭序列化检查（redux-persist 需要）
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
