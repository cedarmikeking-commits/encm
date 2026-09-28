import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { CourseType } from '../course-standards/standard-course-development';
import CourseResourceManagement from '@/components/course/CourseResourceManagement';
import StandardCourseResourceEntry from '@/components/course/StandardCourseResourceEntry';

export type CourseStandardType = 'vocational' | 'professional' | 'action' | 'development';
const devTitleMap: Record<string, string> = {
  "1": '职业素养标准课程资源',
  "2": '专业能力标准课程资源',
  "3": '行动能力标准课程资源',
  "4": '发展能力标准课程资源',
};

const CourseStandardIndex: React.FC = () => {
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);
  let block: any = null;
  if (selectedCourseType === 1 || selectedCourseType === 2 || selectedCourseType === 3 || selectedCourseType === 4) {
    block = <CourseResourceManagement onBack={() => setSelectedCourseType(null)} courseType={selectedCourseType} title={devTitleMap[`${selectedCourseType}`]} />;
  }
  else {
    block = (
      <StandardCourseResourceEntry
        onSelect={(type: any) => setSelectedCourseType(type)}
      />
    );
  }
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程标准开发</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程学习资源</span>
        </div>
      </div>
      {block}
    </div>
  );
};

export default CourseStandardIndex;
