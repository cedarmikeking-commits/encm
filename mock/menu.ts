import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/menu',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        {
          path: '/dashboard',
          name: '仪表盘',
          icon: 'DashboardOutlined',
        },
        {
          path: '/orgExpertReview',
          name: '组织专家审定',
          icon: 'AuditOutlined',
          children: [
            {path: '/orgExpertReview/career-course-framework', name: '职业领域课程框架'},
            {path: '/orgExpertReview/career-course-standard', name: '职业领域课程标准'},
          ],
        },
        {
          path: '/courseDirectory',
          name: '课程目录管理',
          icon: 'BookOutlined',
          children: [
            {path: '/courseDirectory/courseDirectory-list', name: '课程目录清单'},
          ],
        },
      ],
    }),
  },
] as MockMethod[];
