export interface DictionaryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  parentId?: string;
  order: number;
  status: 'active' | 'inactive' | 'deprecated';
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface DictionaryCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount: number;
  isEditable: boolean;
  order: number;
  status: 'active' | 'inactive';
}

export interface DataDictionary {
  categories: DictionaryCategory[];
  items: { [categoryCode: string]: DictionaryItem[] };
}

// 预定义的字典分类
export const DICTIONARY_CATEGORIES: DictionaryCategory[] = [
  {
    id: '1',
    code: 'resource_nature',
    name: '资源性质',
    description: '教学资源的性质分类',
    icon: 'Package',
    color: 'blue',
    itemCount: 0,
    isEditable: true,
    order: 1,
    status: 'active'
  },
  {
    id: '2',
    code: 'course_nature',
    name: '课程性质',
    description: '课程的性质和类型分类',
    icon: 'BookOpen',
    color: 'green',
    itemCount: 0,
    isEditable: true,
    order: 2,
    status: 'active'
  },
  {
    id: '3',
    code: 'teaching_method',
    name: '教学方式',
    description: '教学方法和授课方式',
    icon: 'Users',
    color: 'purple',
    itemCount: 0,
    isEditable: true,
    order: 3,
    status: 'active'
  },
  {
    id: '4',
    code: 'assessment_method',
    name: '考核方式',
    description: '课程考核和评价方式',
    icon: 'CheckSquare',
    color: 'amber',
    itemCount: 0,
    isEditable: true,
    order: 4,
    status: 'active'
  },
  {
    id: '5',
    code: 'course_level',
    name: '课程等级',
    description: 'IVRL等级和难度分类',
    icon: 'Layers',
    color: 'red',
    itemCount: 0,
    isEditable: false,
    order: 5,
    status: 'active'
  },
  {
    id: '6',
    code: 'department',
    name: '开设院系',
    description: '课程开设的院系部门',
    icon: 'Building',
    color: 'indigo',
    itemCount: 0,
    isEditable: true,
    order: 6,
    status: 'active'
  },
  {
    id: '7',
    code: 'course_status',
    name: '课程状态',
    description: '课程开发和审核状态',
    icon: 'Activity',
    color: 'pink',
    itemCount: 0,
    isEditable: false,
    order: 7,
    status: 'active'
  },
  {
    id: '8',
    code: 'resource_type',
    name: '资源类型',
    description: '教学资源的具体类型',
    icon: 'FileText',
    color: 'cyan',
    itemCount: 0,
    isEditable: true,
    order: 8,
    status: 'active'
  }
];

export interface DictionaryFilter {
  category?: string;
  status?: string;
  searchTerm?: string;
}

export interface DictionaryOperation {
  type: 'create' | 'update' | 'delete' | 'batch_import' | 'batch_export';
  categoryCode: string;
  itemId?: string;
  data?: any;
  timestamp: string;
  operator: string;
}