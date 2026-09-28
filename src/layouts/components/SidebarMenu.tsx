import { Menu, MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { get } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { iconMap } from '@/components/icons/DynamicIcon';
import { LayoutDashboard, Settings, CheckCircle, List, Award, FileText, Archive, ArrowRightLeft, BookOpen, Tag, Globe, AlertCircle, ChevronLeft, ChevronRight, FolderOpen, User, Activity, Grid2x2 as Grid, ClipboardCheck, BookCheck, GraduationCap, FileCheck, FileBadge, Medal, Library, Bookmark, FilePlus, RefreshCw, Layers, XCircle } from 'lucide-react';
//import weblogo from '@/img/logo.png';
const weblogo = import.meta.env.VITE_STATIC_URL + "/logo.png";
interface MenuItemType {
  path: string;
  name: string;
  icon: any;
  children?: MenuItemType[];
  className?: string;
  description?: string;
  source?: string;
}
const CustomMenuItem = ({ item }: { item: MenuItemType }) => {
  return (
    <div className="flex flex-col w-full py-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-gray-600">{item.name}</span>
      </div>
      {/* {item.description && (
        <div className="text-xs text-gray-400 mt-0.5 leading-tight">
          {item.description}
        </div>
      )} */}
    </div>
  );
};

const menuItems = [
  /*{ {
     id: 'academic-records',
     label: '学业档案',
     icon: FolderOpen,
     subItems: [
       { id: 'learner-profile', label: '学习者档案', icon: User },
       { id: 'learning-process', label: '学习过程档案', icon: Activity },
       { id: 'assessment-records', label: '考核评估档案', icon: ClipboardCheck },
       { id: 'achievement-records', label: '成果认定档案', icon: BookCheck }
     ]
   }
   /*{
     id: 'mutualcatalog',
     label: '成果互认',
     icon: Library,
     subItems: [
       { id: 'storage-form', label: '入库单', icon: FilePlus },
       { id: 'criteria1', label: '入库目录', icon: Bookmark }
     ]
   }
   /*{ id: 'mutual-recognition', label: '互认归档', icon: ArrowRightLeft },*/
];

const renderMenuItems = (items: any): MenuProps['items'] => {
  return items.map((item: any) => ({
    key: item.path,
    icon: React.createElement(
      iconMap[item.source] || ClipboardCheck,
      { size: 16 }
    ),
    label: <CustomMenuItem item={item} />,
    children: item.children.length > 0 ? renderMenuItems(item.children) : undefined,
  }));
};
export default function SiderbarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppSelector((state) => get(state, 'app.sidebarCollapsed', false));
  const menu: MenuItemType[] = useAppSelector((state) => get(state, 'menu.menuList', []));
  const dispatch = useAppDispatch();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 页面加载/路由变化时自动展开对应菜单
  useEffect(() => {
    // 渲染菜单列表
    const menuList = menu;
    const pathname = location.pathname;
    // 如果是登录后进入根路径 / 或者空白，就自动跳转到你指定的页面
    if (pathname === '/' || pathname === '') {
      if (menuList.length > 0 && (!menuList[0].children || menuList[0].children.length == 0)) {
        navigate(menuList[0].path);
      }
      if (menuList.length > 0 && menuList[0].children && menuList[0].children.length > 0) {
        navigate(menuList[0].children[0].path);
        onOpenChange([menuList[0].path])
      }
    }
  }, [location.pathname, menu]);
  // useEffect(() => {
  //   try {
  //     http.get('/menu').then((res: any) => {
  //       if (res && res.length) {
  //         dispatch({ type: 'menu/setMenu', payload: res })
  //       } else {
  //         console.log('Using default menu items')
  //         dispatch({ type: 'menu/setMenu', payload: menuItems })
  //       }
  //     })
  //   } catch (error) {
  //     console.log('Using default menu items')
  //   }
  //   dispatch({ type: 'menu/setMenu', payload: menuItems })
  // }, [])


  // const iconMap: Record<string, any> = {
  //   DashboardOutlined: <AppstoreOutlined />,
  //   UserOutlined: <UserOutlined />,
  // }

  // const renderMenu = (items: any[]): any => {
  //   return items.map((item) => ({
  //     key: item.path || item.path,
  //     icon: iconMap[item.source] || (item.source ? React.createElement(item.source) : null),
  //     label: item.name || item.name,
  //     children: item.children ? renderMenu(item.children) : undefined,
  //   }))
  // }

  const toggleCollapsed = () => {
    console.log('collapsed', collapsed);
    dispatch({ type: 'app/toggleSidebar', payload: !collapsed });
  };
  const onOpenChange = (keys: any) => {
    // 如果当前有展开的菜单，且点击的是新的菜单
    if (openKeys.length > 0 && keys.length > 0) {
      const lastOpenKey = openKeys[openKeys.length - 1];
      const currentOpenKey = keys[keys.length - 1];

      // 如果点击的是不同的父菜单，则关闭所有其他菜单
      if (lastOpenKey !== currentOpenKey) {
        setOpenKeys([currentOpenKey]);
      } else {
        setOpenKeys(keys);
      }
    } else {
      setOpenKeys(keys);
    }
  }

  return (
    <div className="relative">
      <div className="absolute -right-3 top-6 z-50">
        <button
          onClick={toggleCollapsed}
          className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-slate-600" />
          )}
        </button>
      </div>
      <div className="p-6 border-slate-200 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center">
            {/* <LayoutDashboard className="w-5 h-5 text-white"  /> */}
            <img
              src={weblogo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && <h1 className="text-2xl font-bold text-slate-800">课程管理系统</h1>}
        </div>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={renderMenuItems(menu)}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={({ key }) => navigate(key)}
        className="gradient-menu"
        defaultSelectedKeys={['/dashboard/Dashboard']}

      />
    </div>
  );
}
