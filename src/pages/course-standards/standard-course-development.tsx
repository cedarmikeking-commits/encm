import StandardCourseLibrary from '@/components/course-standards/StandardCourseLibrary';
import CourseStandardDevelopment from '@/components/course-standards/CourseStandardDevelopment';
import CourseStandardEntry from '@/components/course-standards/CourseStandardEntry';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

export type CourseStandardType = 'vocational' | 'professional' | 'action' | 'development';
export type CourseType = 1 | 2 | 3 | 4;
const CourseStandardIndex: React.FC = () => {
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);

  let block: any = null;
  if (selectedCourseType === 1 || selectedCourseType === 4) {
    block = <StandardCourseLibrary onBack={() => setSelectedCourseType(null)} courseType={1} />;
  }
  else if (selectedCourseType === 2 || selectedCourseType === 3) {
    block = <CourseStandardDevelopment onBack={() => setSelectedCourseType(null)} courseType={selectedCourseType} />;
  }
  else {
    block = (
      <CourseStandardEntry
        onSelect={(type) => setSelectedCourseType(type)}
      />
    );
  }
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程标准设计</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">研制课程标准</span>
        </div>
      </div>
      {block}
    </div>
  );
};

export default CourseStandardIndex;
