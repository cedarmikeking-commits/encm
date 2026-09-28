import StandardCourseLibrary from '@/components/course-standards/StandardCourseLibrary';
import CourseStandardDevelopment from '@/components/course-standards/CourseStandardDevelopment';
import CourseStandardEntry from '@/components/course-standards/CourseStandardEntry';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import StandardCourseDevEntry from '@/components/course/StandardCourseDevEntry';
import PublishedCourseDevelopment from '@/components/course/PublishedCourseDevelopment';
import { CourseType } from '../course-standards/standard-course-development';

export type CourseStandardType = 'vocational' | 'professional' | 'action' | 'development';
const devTitleMap: Record<string, string> = {
  "1": '职业素养标准课程开发',
  "4": '发展能力标准课程开发',
};

const CourseStandardIndex: React.FC = () => {
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);
  let block: any = null;
  if (selectedCourseType === 1 || selectedCourseType === 4) {
    block = <PublishedCourseDevelopment onBack={() => setSelectedCourseType(null)} courseType={selectedCourseType} title={devTitleMap[`${selectedCourseType}`]} />;
  }
  else if (selectedCourseType === 2 || selectedCourseType === 3) {
    block = <div>未开放</div>
  }
  else {
    block = (
      <StandardCourseDevEntry
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
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程内容开发</span>
        </div>
      </div>
      {block}
    </div>
  );
};

export default CourseStandardIndex;
