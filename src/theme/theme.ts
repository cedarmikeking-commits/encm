import type { ThemeConfig } from 'antd';

// 覆盖antd主题
const OverrideTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3b82f6',
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 75,
      siderBg: '#ffffff',
    },
    Table: {
      headerBg: '#eff6ff', // 表头背景色
      headerColor: '333', // 表头文字颜色
    },
  },
};

export default OverrideTheme;
