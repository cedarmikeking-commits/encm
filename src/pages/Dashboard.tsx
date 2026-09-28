import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, BarChart3, Clipboard, FileText, FolderOpen, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { Spin } from 'antd';

interface CourseData {
  level: string;
  basicCourses: { count: number; credits: number };
  actionCourses: { count: number; credits: number };
  developmentCourses: { count: number; credits: number };
  totalCourses: number;
  totalCredits: number;
  totalHours: number;
}


const Dashboard: React.FC = () => {
  const [ivrlData, setIvrlData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    const data: CourseData[] = [
      {
        level: 'IVEL 1级',
        basicCourses: { count: 10, credits: 18 },
        actionCourses: { count: 3, credits: 9 },
        developmentCourses: { count: 4, credits: 4 },
        totalCourses: 17,
        totalCredits: 31,
        totalHours: 496
      },
      {
        level: 'IVEL 2级',
        basicCourses: { count: 10, credits: 18 },
        actionCourses: { count: 4, credits: 12 },
        developmentCourses: { count: 4, credits: 4 },
        totalCourses: 18,
        totalCredits: 34,
        totalHours: 544
      },
      {
        level: 'IVEL 3级',
        basicCourses: { count: 10, credits: 18 },
        actionCourses: { count: 5, credits: 15 },
        developmentCourses: { count: 8, credits: 8 },
        totalCourses: 23,
        totalCredits: 41,
        totalHours: 656
      },
      {
        level: 'IVEL 4级',
        basicCourses: { count: 10, credits: 18 },
        actionCourses: { count: 6, credits: 18 },
        developmentCourses: { count: 8, credits: 8 },
        totalCourses: 24,
        totalCredits: 44,
        totalHours: 704
      },
    ];
    setIvrlData(data);
  }, []);


  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div className="px-2 py-2">
      {/* <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">仪表盘</span>
        </div>
      </div> */}
      <div className="bg-white rounded-lg border border-gray-200 mb-3">
        <div className="px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">国际职业教育课程框架概览</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th rowSpan={2} className="text-left py-4 px-6 font-semibold text-gray-700 border-r border-gray-200 bg-white">
                  IVEL等级
                </th>
                <th colSpan={2} className="text-center py-4 px-6 font-semibold text-gray-700 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span>基础能力课程</span>
                  </div>
                </th>
                <th colSpan={2} className="text-center py-4 px-6 font-semibold text-gray-700 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span>行动能力课程</span>
                  </div>
                </th>
                <th colSpan={2} className="text-center py-4 px-6 font-semibold text-gray-700 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span>发展能力课程</span>
                  </div>
                </th>
                <th colSpan={2} className="text-center py-4 px-6 font-semibold text-gray-700 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 size={16} className="text-gray-500" />
                    <span>总计</span>
                  </div>
                </th>
                <th rowSpan={2} className="text-center py-4 px-6 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span>总学时</span>
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-center py-3 px-4 font-medium text-gray-600 border-r border-gray-200">门数</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">学分</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">门数</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">学分</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">门数</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">学分</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">总门数</th>
                <th className="text-center py-3 px-4  font-medium text-gray-600 border-r border-gray-200">总学分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ivrlData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900 border-r border-gray-200">
                    {row.level}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.basicCourses.count}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.basicCourses.credits}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.actionCourses.count}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.actionCourses.credits}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.developmentCourses.count}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-900 border-r border-gray-200">
                    {row.developmentCourses.credits}
                  </td>
                  <td className="text-center py-4 px-4 font-semibold text-gray-900 border-r border-gray-200 bg-gray-50">
                    {row.totalCourses}
                  </td>
                  <td className="text-center py-4 px-4 font-semibold text-gray-900 border-r border-gray-200 bg-gray-50">
                    {row.totalCredits}
                  </td>
                  <td className="text-center py-4 px-4 font-semibold text-gray-900 bg-gray-50">
                    {row.totalHours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 课程制作流程 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">国际职业教育课程制作流程</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: 1, title: '课程体系构建', description: '确定课程数量、学分、学时和整体框架结构', Icon: Clipboard },
              { step: 2, title: '组织专家审定', description: '专家审核职业领域课程框架的科学性与合理性', Icon: FileText },
              { step: 3, title: '课程标准设计', description: '制定课程标准、学习目标、考核方式和评价标准', Icon: FolderOpen },
              { step: 4, title: '组织专家审定', description: '专家审核课程标准和资源的科学性与合理性', Icon: CheckCircle },
              { step: 5, title: '标准课程开发', description: '收集、筛选和开发教材、课件、视频等教学资源', Icon: Database },
              { step: 6, title: '课程目录管理', description: '持续维护课程信息，定期更新内容和资源', Icon: RefreshCw }
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold shadow-sm">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 mb-2">
                      <item.Icon size={18} className="text-blue-600" />
                      <h3 className="font-bold text-base text-gray-900">
                        第{['一', '二', '三', '四', '五', '六'][item.step - 1]}步：{item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-6">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
