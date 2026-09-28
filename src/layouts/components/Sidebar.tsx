import React, { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Key,
  UserCheck,
  Handshake as HandshakeIcon,
  FileText,
  BarChart3,
  FileInput,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  Layers,
  Award,
  BookOpen,
  Network,
  FileSearch,
  Activity,
  UserPlus,
  UserMinus,
  UserX,
  AlertTriangle,
  Database,
  Globe,
  Upload,
  CheckSquare,
  CreditCard as Edit,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { http } from '@/api/http';

import type { MenuItem } from '../App';

interface SidebarProps {
  activeMenu: MenuItem;
  setActiveMenu: (menu: MenuItem) => void;
  collapsed: booLean;
  setCollapsed: (collapsed: booLean) => void;
}

interface SubMenuItem {
  key: MenuItem;
  label: string;
  icon: React.ComponentType<any>;

}

interface MenuItemType {
  key: MenuItem;
  label: string;
  icon: React.ComponentType<any>;
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  { key: 'dashboard' as MenuItem, label: '仪表盘', icon: LayoutDashboard },
  {
    key: 'users' as MenuItem,
    label: '用户管理',
    icon: Users,
    children: [
      { key: 'users-list' as MenuItem, label: '账号维护', icon: Users },
      { key: 'users-admin' as MenuItem, label: '管理类用户', icon: Shield },
      { key: 'users-org' as MenuItem, label: '机构类用户', icon: Building2 },
      { key: 'users-learner' as MenuItem, label: '学习类用户', icon: GraduationCap },
      { key: 'users-committee' as MenuItem, label: '组织类用户', icon: UserCheck },
    ],
  },
  {
    key: 'organizations' as MenuItem,
    label: '组织机构',
    icon: Building2,
    children: [
      { key: 'org-info' as MenuItem, label: '组织信息', icon: Building2 },
      { key: 'org-members' as MenuItem, label: '组织用户', icon: Users },
    ],
  },
  {
    key: 'roles' as MenuItem,
    label: '角色管理',
    icon: Shield,
    children: [
      { key: 'roles-system' as MenuItem, label: '系统角色', icon: Shield },
      { key: 'roles-custom' as MenuItem, label: '自定义角色', icon: Key },
      { key: 'roles-assignment' as MenuItem, label: '用户角色', icon: Users },
    ],
  },
  {
    key: 'permissions' as MenuItem,
    label: '应用权限',
    icon: Key,
    children: [
      { key: 'permissions-apps' as MenuItem, label: '应用管理', icon: Settings },
      { key: 'permissions-assign' as MenuItem, label: '角色权限', icon: Key },
    ],
  },
  {
    key: 'standards' as MenuItem,
    label: '通用标准',
    icon: FileText,
    children: [
      { key: 'standards-levels' as MenuItem, label: '等级水平', icon: Target },
      { key: 'standards-categories' as MenuItem, label: '目标分类', icon: Layers },
      { key: 'standards-grading' as MenuItem, label: '分级标准', icon: Award },
      { key: 'standards-mapping' as MenuItem, label: '标准映射表', icon: Network },
    ],
  },
  {
    key: 'industry' as MenuItem,
    label: '行业领域',
    icon: BarChart3,
    children: [
      { key: 'industry-data' as MenuItem, label: '行业目录', icon: Database },
      { key: 'industry-cooperation' as MenuItem, label: '职业领域', icon: Globe },
      { key: 'industry-relationship' as MenuItem, label: '职业领域专业关系表', icon: Globe },
    ],
  },
  {
    key: 'contractors' as MenuItem,
    label: '签约机构',
    icon: HandshakeIcon,
    children: [
      { key: 'contractors-application' as MenuItem, label: '加盟企业', icon: FileInput },
      { key: 'contractors-audit' as MenuItem, label: '加盟院校', icon: Shield },
      { key: 'contractors-cooperation' as MenuItem, label: '合作管理', icon: HandshakeIcon },
      /* { key: 'contractors-violation' as MenuItem, label: '违规处理', icon: AlertTriangle },*/
    ],
  },
  {
    key: 'experts' as MenuItem,
    label: '专家管理',
    icon: UserCheck,
    children: [
      { key: 'experts-admission' as MenuItem, label: '专家准入', icon: UserPlus },
      { key: 'experts-assignment' as MenuItem, label: '专家分配', icon: UserCheck },
      { key: 'experts-exit' as MenuItem, label: '专家退出', icon: UserX },
    ],
  },
  {
    key: 'config' as MenuItem,
    label: '系统配置',
    icon: Settings,
    children: [
      { key: 'config-logs' as MenuItem, label: '日志管理', icon: FileSearch },
      { key: 'config-behavior-logs' as MenuItem, label: '行为日志', icon: Activity },
    ],
  },
  {
    key: 'website' as MenuItem,
    label: '网站管理',
    icon: Settings,
    children: [
      { key: 'config-logs' as MenuItem, label: '首页信息', icon: FileSearch },
      { key: 'config-logs' as MenuItem, label: '栏目管理', icon: FileSearch },
      { key: 'config-logs' as MenuItem, label: '资讯管理', icon: FileSearch },
      { key: 'config-behavior-logs' as MenuItem, label: '资源管理', icon: Activity },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  collapsed,
  setCollapsed,
}) => {
  /*const [expandedMenus, setExpandedMenus] = React.useState<Set<MenuItem>>(new Set(['users', 'organizations', 'roles', 'permissions', 'experts', 'contractors', 'standards', 'industry', 'applications', 'config']));*/
  const [expandedMenus, setExpandedMenus] = React.useState<Set<MenuItem>>(new Set());
  const toggleSubmenu = (menuKey: MenuItem) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuKey)) {
      newExpanded.delete(menuKey);
    } else {
      newExpanded.add(menuKey);
    }
    setExpandedMenus(newExpanded);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    http.get('/menu').then((res: any) => {
      const _menu = renderMenu(res);
      setMenu(_menu);
    });
  }, []);

  const renderMenu = (items: MenuItem[]): MenuItem[] =>
    items.map((item) => ({
      key: item.path,
      icon: item.icon || null,
      label: item.name,
      children: item.children ? renderMenu(item.children) : ([] as MenuItem[]),
    }));
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white  flex flex-col`}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">深圳协议管理系统</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeMenu === item.key ||
              (item.children && item.children.some((sub: MenuItem) => sub.key === activeMenu));
            const isExpanded = expandedMenus.has(item.key);

            return (
              <li key={item.key} className="space-y-1">
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      item.children ? toggleSubmenu(item.key) : setActiveMenu(item.key)
                    }
                    className={`flex-1 flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${isActive && !item.children
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                      }`}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive && !item.children ? 'text-white' : ''} transition-colors`}
                    />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                  {!collapsed && item.children && (
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  )}
                </div>

                {!collapsed && item.children && isExpanded && (
                  <ul className="ml-8 space-y-1">
                    {item.children.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeMenu === subItem.key;

                      return (
                        <li key={subItem.key}>
                          <button
                            onClick={() => setActiveMenu(subItem.key)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${isSubActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                              }`}
                          >
                            <SubIcon
                              className={`w-4 h-4 ${isSubActive ? 'text-white' : ''} transition-colors`}
                            />
                            <span className="text-sm font-medium">{subItem.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
