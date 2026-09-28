import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Eye, CreditCard as Edit3, Trash2, Save, Upload, Download, Users, Clock, Target, CheckCircle, AlertCircle, Award, Layers, PlayCircle, PenTool, MessageSquare, Briefcase, FlaskConical, Settings, BookOpen, Star, Zap, Database, Shield, Building, Link, RefreshCw, Copy, Timer, PieChart, Activity, FileCheck, UserCheck, GraduationCap, ClipboardList, HelpCircle, CheckSquare, X, ChevronDown, ChevronRight, ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react';

import { Table, Button, Input, Select, Space, Tag, Modal, Card, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, SendOutlined, RollbackOutlined, FolderAddOutlined, DownloadOutlined, FileProtectOutlined, AuditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import CreateCourseStandard from './CreateCourseStandard';
import CourseStandardDetail from './CourseStandardDetail';
import EditCourseStandard from './EditCourseStandard';
import DomainFrameworkTab from './DomainFrameworkTab';
import { CourseStandardStatus, getStatusLabel, getStatusColor, getStatusAntdColor, getNextStates } from '../../utils/courseStandardStatus';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table as DocxTable, TableRow, TableCell, WidthType, BorderStyle, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';

import { getLevelList, getOneAbilityCareerCoursePage, getTwoAbilityCareerCoursePage, saveOrUpdate, publishCourse, postRemove, setCourseStandardAttach, setCourseAudit, postResourceGetBylds } from '@/api/course-standards';
import { getUserInfoAndMenu } from '@/api/user';
import { useDict } from '@/hooks/useDict';
import { IndustryCategory } from '@/types/framework';
import { websiteConfig } from '@/config';
const { Search } = Input;
const { Option } = Select;

interface CourseStandard {
  id: string;
  standardName: string;
  courseName: string;
  courseCode: string;
  courseType: string;
  abilityModule: string;
  ivrlLevel: string;
  status: CourseStandardStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewer?: string;
  reviewComments?: string;
  reviewedAt?: string;
  approver?: string;
  approvedAt?: string;
  hasReviewHistory?: boolean;
  isInCatalog?: boolean;
  isFiled?: boolean;
  importFilePath?: string | null;
  level1?: { id: string; name: string } | null;
  level2?: { id: string; name: string } | null;
  level3?: { id: string; name: string } | null;

  // 基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    courseType: string;
    abilityModule: string;
    ivrlLevel: string;
    description: string;
    isInternational: boolean;
    credits: number;
    practicalHours: number;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    courseImage?: string;
    notes: string;
  };

  // 课程目标
  objectives: {
    overallObjective: string;
    knowledgeObjectives: string[];
    skillObjectives: string[];
    attitudeObjectives: string[];
  };

  // 内容规划
  contentPlanning: {
    modules: ContentModule[];
    totalHours: number;
    practicalRatio: number;
  };

  // 完成创建
  completion: {
    reviewChecklist: ChecklistItem[];
    approvalStatus: string;
    publishDate?: string;
  };
}

interface ContentModule {
  id: string;
  title: string;
  description: string;
  hours: number;
  type: 'theory' | 'practice' | 'mixed';
  objectives: string[];
}

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  required: boolean;
}

interface CreateCourseStepProps {
  currentStep: number;
  courseData: Partial<CourseStandard>;
  onDataChange: (data: Partial<CourseStandard>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
}

interface CourseStandardDevelopmentProps {
  onBack?: () => void;
  courseType?: 2 | 3;
}

const PROFESSIONAL_LEVEL2_ID = '11111111-1111-1111-1111-111111111113';
const ACTION_LEVEL1_ID = '22222222-2222-2222-2222-222222222222';


const CourseStandardDevelopment: React.FC<CourseStandardDevelopmentProps> = ({ onBack, courseType }) => {
  const { getLabel, formatOptions } = useDict([
    'course_nature', 'course_study_way', 'course_evaluation_method', 'course_credit_hour', 'course_development_type',
  ]);
  const [pagingSearch, setPagingSearch] = useState<any>({ courseType: courseType, size: 10, current: 1, keyword: '', courseStatus: null, abilityId: null, levelId: null, careerId: null, contentStatus: null });
  const [tableData, setTableData] = useState({} as any);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);

  const [activeTab, setActiveTab] = useState<'domain-framework' | 'create' | 'manage' | 'review'>('domain-framework');
  const [standards, setStandards] = useState<CourseStandard[]>([]);
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExecutionStandard, setFilterExecutionStandard] = useState<string>('');
  const [filterOccupationalField, setFilterOccupationalField] = useState<string>('');
  const [filterAbilityTarget, setFilterAbilityTarget] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingStandardId, setEditingStandardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCourseForCreate, setSelectedCourseForCreate] = useState<CourseStandard | null>(null);
  const [wordViewerOpen, setWordViewerOpen] = useState(false);
  const [wordViewerTitle, setWordViewerTitle] = useState<string>('');
  const [wordViewerHtml, setWordViewerHtml] = useState<string>('');
  const [wordViewerLoading, setWordViewerLoading] = useState(false);

  // 新建课程状态
  const [createStep, setCreateStep] = useState(1);
  const [courseData, setCourseData] = useState<Partial<CourseStandard>>({});

  // 从数据库加载数据
  useEffect(() => {
    fetchUserInfoAndMenu();
    fetchLevelList();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [pagingSearch]);
  const fetchUserInfoAndMenu = async () => {
    setLoading(true);
    try {
      const data: any = await getUserInfoAndMenu({ clientId: websiteConfig.clientId, });
      let industryScopeList: any = [];
      data.industryScopeList.map((firstNode: any) => {
        firstNode.children.map((secondNode: any) => {
          industryScopeList = [...industryScopeList, ...(secondNode.children || [secondNode])];
        });
      });
      setIndustries(industryScopeList);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (courseType == 2) {
        const data = await getTwoAbilityCareerCoursePage(pagingSearch);
        setTableData(data);
      }
      else if (courseType == 3) {
        const data = await getOneAbilityCareerCoursePage(pagingSearch);
        setTableData(data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelList = async () => {
    try {
      const data = await getLevelList();
      setLevelList(data);
    } catch (error: any) {
      message.error('加载数据失败: ' + error.message);
    } finally {
    }
  };

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const { data: approvedFrameworks, error: frameworksError } = await supabase
        .from('domain_level_course_framework')
        .select('domain_code, level_name')
        .eq('review_status', 'approved');

      if (frameworksError) throw frameworksError;

      const { data: educationLevels, error: edError } = await supabase
        .from('education_levels')
        .select('id, name');

      if (edError) throw edError;

      const { data: allIndustries, error: indError } = await supabase
        .from('industry_categories')
        .select('id, code')
        .eq('level', 3);

      if (indError) throw indError;

      const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

      const approvedSet = new Set<string>(
        (approvedFrameworks || []).flatMap(fw => {
          const matchedLevel = (educationLevels || []).find(
            el => normalize(el.name) === normalize(fw.level_name)
          );
          const matchedIndustries = (allIndustries || []).filter(
            ind => ind.code === fw.domain_code
          );
          if (!matchedLevel || matchedIndustries.length === 0) return [];
          return matchedIndustries.map(ind => `${ind.id}__${matchedLevel.id}`);
        })
      );

      if (approvedSet.size === 0) {
        setStandards([]);
        setLoading(false);
        return;
      }

      const { data: coreCoursesData, error: coreCoursesError } = await supabase
        .from('core_courses')
        .select(`
          *,
          industry_categories(name),
          level1:competency_level1(id, name),
          level2:competency_level2(id, name),
          level3:competency_level3(id, name)
        `)
        .eq('status', 'active');

      if (coreCoursesError) throw coreCoursesError;

      const filteredCoreCoursesData = (coreCoursesData || []).filter((cc: any) =>
        approvedSet.has(`${cc.industry_id}__${cc.ivrl_level}`)
      );

      const { data: standardsData, error: standardsError } = await supabase
        .from('course_standards')
        .select('*');

      if (standardsError) throw standardsError;

      const standardsMap = new Map(
        (standardsData || []).map((standard: any) => [standard.course_code, standard])
      );

      const { data: reviews } = await supabase
        .from('course_standard_reviews')
        .select('standard_id');

      const reviewedStandardIds = new Set((reviews || []).map((r: any) => r.standard_id));

      const { data: catalogs } = await supabase
        .from('course_catalog')
        .select('standard_id');

      const catalogStandardIds = new Set((catalogs || []).map((c: any) => c.standard_id));

      const { data: filings } = await supabase
        .from('course_catalog_filing')
        .select('catalog_id, course_catalog!inner(standard_id)');

      const filedStandardIds = new Set(
        (filings || []).map((f: any) => f.course_catalog?.standard_id).filter(Boolean)
      );

      const educationLevelMap = new Map(
        (educationLevels || []).map((level: any) => [level.id, level.name])
      );

      const formattedData: CourseStandard[] = filteredCoreCoursesData
        .map((coreCourse: any) => {
          const standard = standardsMap.get(coreCourse.code);
          const industryName = coreCourse.industry_categories?.name || '';

          const ivrlLevelDisplay = educationLevelMap.get(coreCourse.ivrl_level) || coreCourse.ivrl_level || '';

          const teachingImpl = standard?.teaching_implementation || {};
          const courseType = standard?.course_type || teachingImpl.course_type || '';

          return {
            id: standard?.id || coreCourse.id,
            standardName: standard?.standard_name || '',
            courseName: coreCourse.name,
            courseCode: coreCourse.code,
            courseType: courseType,
            abilityModule: industryName,
            ivrlLevel: ivrlLevelDisplay,
            status: (standard?.status || 'draft') as any,
            progress: standard?.progress || 0,
            level1: coreCourse.level1 || null,
            level2: coreCourse.level2 || null,
            level3: coreCourse.level3 || null,
            createdAt: standard?.created_at
              ? new Date(standard.created_at).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })
              : '-',
            updatedAt: standard?.updated_at
              ? new Date(standard.updated_at).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })
              : '-',
            createdBy: standard?.created_by || '系统',
            hasReviewHistory: standard ? reviewedStandardIds.has(standard.id) : false,
            isInCatalog: standard ? catalogStandardIds.has(standard.id) : false,
            isFiled: standard ? filedStandardIds.has(standard.id) : false,
            importFilePath: standard?.import_file_path || null,
            basicInfo: {
              courseName: coreCourse.name,
              courseCode: coreCourse.code,
              courseType: courseType,
              abilityModule: industryName,
              ivrlLevel: coreCourse.ivrl_level || '',
              description: standard?.description || '',
              isInternational: standard?.is_international || false,
              credits: standard?.credits || coreCourse.credits || 0,
              practicalHours: standard?.practical_hours || coreCourse.hours || 0,
              contactPerson: standard?.contact_person || '',
              contactPhone: standard?.contact_phone || '',
              contactEmail: standard?.contact_email || '',
              notes: ''
            },
            objectives: {
              overallObjective: standard?.overall_objective || '',
              knowledgeObjectives: standard?.knowledge_objectives || [],
              skillObjectives: standard?.skill_objectives || [],
              attitudeObjectives: standard?.attitude_objectives || []
            },
            contentPlanning: {
              modules: standard?.content_modules || [],
              totalHours: standard?.practical_hours || 0,
              practicalRatio: 0
            },
            completion: {
              reviewChecklist: [],
              approvalStatus: 'pending'
            }
          };
        })
        .sort((a, b) => {
          if (a.createdAt === '-' && b.createdAt === '-') return 0;
          if (a.createdAt === '-') return 1;
          if (b.createdAt === '-') return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

      setStandards(formattedData);
    } catch (error) {
      console.error('Error fetching standards:', error);
      message.error('获取课程标准失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredStandards = standards.filter(standard => {
    const matchesSearch = standard.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || standard.status === filterStatus;
    const matchesExecutionStandard = !filterExecutionStandard || standard.ivrlLevel === filterExecutionStandard;
    const matchesOccupationalField = !filterOccupationalField || standard.abilityModule === filterOccupationalField;
    const matchesAbilityTarget = !filterAbilityTarget || (
      standard.level1?.name === filterAbilityTarget ||
      standard.level2?.name === filterAbilityTarget ||
      standard.level3?.name === filterAbilityTarget
    );

    let matchesCourseType = true;
    if (courseType === 'professional') {
      matchesCourseType = standard.level2?.id === PROFESSIONAL_LEVEL2_ID;
    } else if (courseType === 'action') {
      matchesCourseType = standard.level1?.id === ACTION_LEVEL1_ID;
    }

    return matchesSearch && matchesStatus && matchesExecutionStandard && matchesOccupationalField && matchesAbilityTarget && matchesCourseType;
  });



  // 新建课程步骤组件
  const CreateCourseStep: React.FC<CreateCourseStepProps> = ({
    currentStep,
    courseData,
    onDataChange,
    onNext,
    onPrev,
    onSave
  }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        // 处理文件上传
        console.log('文件上传:', e.dataTransfer.files[0]);
      }
    };

    const updateBasicInfo = (field: string, value: any) => {
      onDataChange({
        ...courseData,
        basicInfo: {
          ...courseData.basicInfo,
          [field]: value
        }
      });
    };
    // 步骤1: 基本信息
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${step === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step < currentStep
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                    }`}>
                    {step < currentStep ? <CheckCircle size={20} /> : step}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${step === currentStep ? 'text-blue-600' :
                      step < currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {step === 1 ? '基本信息' :
                        step === 2 ? '课程目标' :
                          step === 3 ? '内容规划' : '完成创建'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step === 1 ? '填写课程的基本信息，包括名称、编码、类型等' :
                        step === 2 ? '设定课程的学习目标和能力要求' :
                          step === 3 ? '规划课程内容模块和教学安排' : '检查信息并完成课程标准创建'}
                    </div>
                  </div>
                  {step < 4 && (
                    <ArrowRight className={`${step < currentStep ? 'text-green-600' : 'text-gray-300'
                      }`} size={20} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 基本信息表单 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">课程基本信息</h3>
              <p className="text-gray-600">填写课程的基本信息，包括名称、编码、类型等</p>
            </div>

            <div className="space-y-6">
              {/* 第一行：课程名称和课程编码 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    课程名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入课程名称"
                    value={courseData.basicInfo?.courseName || ''}
                    onChange={(e) => updateBasicInfo('courseName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">请使用清晰、准确的名称，体现课程核心内容</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    课程编码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="自动生成"
                      value={courseData.basicInfo?.courseCode || ''}
                      onChange={(e) => updateBasicInfo('courseCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                      readOnly
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      自动生成
                    </button>
                  </div>
                </div>
              </div>

              {/* 第二行：课程类型、所属模块、IVRL等级 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    课程类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseData.basicInfo?.courseType || ''}
                    onChange={(e) => updateBasicInfo('courseType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择课程类型</option>
                    <option value="基础能力课程">基础能力课程</option>
                    <option value="行动能力课程">行动能力课程</option>
                    <option value="发展能力课程">发展能力课程</option>
                    <option value="专业核心课程">专业核心课程</option>
                    <option value="专业拓展课程">专业拓展课程</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    所属能力模块 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseData.basicInfo?.abilityModule || ''}
                    onChange={(e) => updateBasicInfo('abilityModule', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择所属模块</option>
                    <option value="职业素养">职业素养</option>
                    <option value="专业能力">专业能力</option>
                    <option value="工作准备">工作准备</option>
                    <option value="工作执行">工作执行</option>
                    <option value="个人能力">个人能力</option>
                    <option value="人际能力">人际能力</option>
                    <option value="数字内容创作">数字内容创作</option>
                    <option value="虚拟现实技术">虚拟现实技术</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    适用IVRL等级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseData.basicInfo?.ivrlLevel || ''}
                    onChange={(e) => updateBasicInfo('ivrlLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择IVRL等级</option>
                    <option value="1级">1级</option>
                    <option value="2级">2级</option>
                    <option value="3级">3级</option>
                    <option value="4级">4级</option>
                  </select>
                </div>
              </div>

              {/* 课程介绍*/}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">课程介绍</label>
                <textarea
                  rows={4}
                  placeholder="请输入目标介绍..."
                  value={courseData.basicInfo?.description || ''}
                  onChange={(e) => updateBasicInfo('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">详细描述课程的主要内容</p>
                  <span className="text-xs text-gray-400">
                    {(courseData.basicInfo?.description || '').length}/500
                  </span>
                </div>
              </div>


              {/* 是否国际化课程 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">是否国际化课程</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isInternational"
                      checked={courseData.basicInfo?.isInternational === true}
                      onChange={() => updateBasicInfo('isInternational', true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">是</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isInternational"
                      checked={courseData.basicInfo?.isInternational === false}
                      onChange={() => updateBasicInfo('isInternational', false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">否</span>
                  </label>
                </div>
              </div>

              {/* 课程学分和参考学时 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">课程学分</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="请输入课程学分"
                      value={courseData.basicInfo?.credits || ''}
                      onChange={(e) => updateBasicInfo('credits', parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="text-sm text-gray-500">学分</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">参考学时</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="自动计算"
                      value={courseData.basicInfo?.practicalHours || ''}
                      onChange={(e) => updateBasicInfo('practicalHours', parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                      readOnly
                    />
                    <span className="text-sm text-gray-500">学时</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      自动计算
                    </button>
                  </div>
                </div>
              </div>

              {/* 联系信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    课程负责人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入负责人姓名"
                    value={courseData.basicInfo?.contactPerson || ''}
                    onChange={(e) => updateBasicInfo('contactPerson', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="请输入联系电话"
                    value={courseData.basicInfo?.contactPhone || ''}
                    onChange={(e) => updateBasicInfo('contactPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    电子邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="请输入电子邮箱"
                    value={courseData.basicInfo?.contactEmail || ''}
                    onChange={(e) => updateBasicInfo('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onSave}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>下一步</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 步骤2: 课程目标
    if (currentStep === 2) {
      return (
        <div className="space-y-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${step === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step < currentStep
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                    }`}>
                    {step < currentStep ? <CheckCircle size={20} /> : step}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${step === currentStep ? 'text-blue-600' :
                      step < currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {step === 1 ? '基本信息' :
                        step === 2 ? '课程目标' :
                          step === 3 ? '内容规划' : '完成创建'}
                    </div>
                  </div>
                  {step < 4 && (
                    <ArrowRight className={`${step < currentStep ? 'text-green-600' : 'text-gray-300'
                      }`} size={20} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">课程目标</h3>
              <p className="text-gray-600">设定课程的学习目标和能力要求</p>
            </div>

            <div className="space-y-6">
              {/* 总体目标 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">总体目标</label>
                <textarea
                  rows={3}
                  placeholder="请描述课程的总体学习目标..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* 知识目标 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">知识目标</label>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    placeholder="请输入知识目标..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                    <Plus size={16} />
                    <span>添加更多知识目标</span>
                  </button>
                </div>
              </div>

              {/* 技能目标 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">技能目标</label>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    placeholder="请输入技能目标..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                    <Plus size={16} />
                    <span>添加更多技能目标</span>
                  </button>
                </div>
              </div>

              {/* 素养目标 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">素养目标</label>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    placeholder="请输入素养目标..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                    <Plus size={16} />
                    <span>添加更多素养目标</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>上一步</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onSave}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>下一步</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 步骤3: 内容规划
    if (currentStep === 3) {
      return (
        <div className="space-y-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${step === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step < currentStep
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                    }`}>
                    {step < currentStep ? <CheckCircle size={20} /> : step}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${step === currentStep ? 'text-blue-600' :
                      step < currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {step === 1 ? '基本信息' :
                        step === 2 ? '课程目标' :
                          step === 3 ? '内容规划' : '完成创建'}
                    </div>
                  </div>
                  {step < 4 && (
                    <ArrowRight className={`${step < currentStep ? 'text-green-600' : 'text-gray-300'
                      }`} size={20} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">内容规划</h3>
              <p className="text-gray-600">规划课程内容模块和教学安排</p>
            </div>

            <div className="space-y-6">
              {/* 内容模块 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-900">内容模块</label>
                  <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Plus size={16} />
                    <span>添加模块</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 示例模块 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">模块1: 课程内容与知识点/技能点</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="请输入模块描述..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">模块2: 教学方法与学时分配</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="请输入模块描述..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">模块3: 考核方式与评价标准</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="请输入模块描述..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">模块4: 所需资源与条件</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="请输入模块描述..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>上一步</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onSave}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>下一步</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 步骤4: 完成创建
    if (currentStep === 4) {
      return (
        <div className="space-y-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${step === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step < currentStep
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                    }`}>
                    {step < currentStep ? <CheckCircle size={20} /> : step}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${step === currentStep ? 'text-blue-600' :
                      step < currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                      {step === 1 ? '基本信息' :
                        step === 2 ? '课程目标' :
                          step === 3 ? '内容规划' : '完成创建'}
                    </div>
                  </div>
                  {step < 4 && (
                    <ArrowRight className={`${step < currentStep ? 'text-green-600' : 'text-gray-300'
                      }`} size={20} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">课程标准创建完成</h3>
              <p className="text-gray-600">恭喜！您已成功创建课程标准，可以进行后续的开发工作。</p>
            </div>

            {/* 后续步骤 */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">后续步骤</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <ChevronRight size={16} />
                  <span>完善课程内容和教学资源</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronRight size={16} />
                  <span>设计考核评价体系</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronRight size={16} />
                  <span>提交专家评审</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronRight size={16} />
                  <span>纳入课程目录</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>上一步</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                稍后完成
              </button>
              <button
                onClick={() => {
                  onSave();
                  setShowCreateModal(false);
                  setCreateStep(1);
                  setCourseData({});
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>完成创建</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const handleNext = () => {
    if (createStep < 4) {
      setCreateStep(createStep + 1);
    }
  };

  const handlePrev = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      const saveData = {
        standard_code: courseData.basicInfo?.courseCode || `STD${Date.now()}`,
        standard_name: '课程标准',
        course_name: courseData.basicInfo?.courseName || '',
        course_code: courseData.basicInfo?.courseCode || `CS${Date.now()}`,
        ivrl_level: courseData.basicInfo?.ivrlLevel || '',
        credits: courseData.basicInfo?.credits || 0,
        hours: courseData.basicInfo?.practicalHours || 0,
        theory_hours: 0,
        practice_hours: courseData.basicInfo?.practicalHours || 0,
        version: '1.0',
        status: 'draft',
        teaching_implementation: {
          course_type: courseData.basicInfo?.courseType || '',
          teaching_design: '',
          resource_development: '',
          teacher_requirements: '',
          school_enterprise_cooperation: '',
          textbook_selection: ''
        },
        course_nature_task: {
          nature: '',
          task: ''
        },
        course_assessment: {
          evaluation_methods: '',
          grading_criteria: ''
        },
        responsible_person: courseData.basicInfo?.contactPerson || '',
        responsible_department: '',
        development_team: [],
        remarks: courseData.basicInfo?.notes || ''
      };

      const { data, error } = await supabase
        .from('course_standards')
        .insert([saveData])
        .select();

      if (error) throw error;

      message.success('课程标准保存成功');
      fetchStandards();
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('保存课程标准失败');
    }
  };

  const handleDataChange = (data: Partial<CourseStandard>) => {
    setCourseData(data);
  };

  const handleSubmitForReview = async (record: any) => {
    setLoading(true);
    try {
      // 校验1：检查是否设置了课程标准


      // 校验2：检查是否添加了资源
      //const hasResources = resourcesData && resourcesData.length > 0;

      // 收集缺失的项目
      const missingItems: string[] = [];
      if (!record.courseStandardAttach) {
        missingItems.push('设置课程标准');
      }
      // if (!hasResources) {
      //   missingItems.push('添加教学资源');
      // }

      // 如果有缺失项，显示统一提示
      if (missingItems.length > 0) {
        setLoading(false);
        Modal.warning({
          title: '提交条件不满足',
          content: (
            <div>
              <p>提交审核前，请先完成以下操作：</p>
              <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                {missingItems.map((item, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ),
          okText: '知道了',
          width: 450,
        });
        return;
      }

      // 两个条件都满足，执行提交
      await setCourseAudit({ id: record.id, auditStatus: "1" });
      message.success('已提交审核');
      await fetchCourses();
    } catch (error) {
      console.error('Error submitting for review:', error);
      message.error('提交审核失败');
      setLoading(false);
    }
  };

  const handleCancelReview = async (record: any) => {
    setLoading(true);
    try {
      await setCourseAudit({ id: record.id, auditStatus: "0" });
      message.success('已撤销审核');
      await fetchCourses();
    } catch (error) {
      console.error('Error canceling review:', error);
      message.error('撤销失败');
      setLoading(false);
    }
  };

  const handleExport = async (record: any) => {
    try {
      message.loading('正在导出课程标准...', 0);

      // 获取完整的课程标准数据
      const { data: standardData, error: standardError } = await supabase
        .from('course_standards')
        .select('*')
        .eq('id', record.id)
        .single();

      if (standardError) throw standardError;

      // 获取关联的资源
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('course_standard_resources')
        .select(`
          *,
          course_resources (
            id,
            title,
            type,
            format,
            description,
            tags
          )
        `)
        .eq('course_standard_id', record.id);

      if (resourcesError) throw resourcesError;

      // 创建 Word 文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 文档标题
            new Paragraph({
              text: '课程标准',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // 基本信息标题
            new Paragraph({
              text: '一、基本信息',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),

            // 基本信息表格
            new DocxTable({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '课程名称', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.course_name || '-' })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '课程编码', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.course_code || '-' })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '课程类型', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.course_type || '-' })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'IVRL等级', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.ivrl_level || '-' })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '学分', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: String(standardData.credits || 0) })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '总学时', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: String(standardData.hours || 0) })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '理论学时', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: String(standardData.theory_hours || 0) })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '实践学时', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: String(standardData.practice_hours || 0) })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '状态', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: getStatusLabel(standardData.status) })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '版本', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.version || '-' })] })
                  ]
                })
              ]
            }),

            // 课程对象与任务
            new Paragraph({
              text: '二、课程对象与任务',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: `课程对象：${standardData.course_target_audience || '未填写'}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `课程任务：${typeof standardData.course_nature_task === 'string' ? standardData.course_nature_task : JSON.stringify(standardData.course_nature_task || {}, null, 2)}`,
              spacing: { after: 200 }
            }),

            // 课程目标
            new Paragraph({
              text: '三、课程目标',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: typeof standardData.course_objectives === 'string'
                ? standardData.course_objectives
                : JSON.stringify(standardData.course_objectives || {}, null, 2),
              spacing: { after: 200 }
            }),

            // 课程内容
            new Paragraph({
              text: '四、课程内容',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: typeof standardData.course_content === 'string'
                ? standardData.course_content
                : JSON.stringify(standardData.course_content || {}, null, 2),
              spacing: { after: 200 }
            }),

            // 教学实施
            new Paragraph({
              text: '五、教学实施',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: typeof standardData.teaching_implementation === 'string'
                ? standardData.teaching_implementation
                : JSON.stringify(standardData.teaching_implementation || {}, null, 2),
              spacing: { after: 200 }
            }),

            // 课程考核
            new Paragraph({
              text: '六、课程考核',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: typeof standardData.course_assessment === 'string'
                ? standardData.course_assessment
                : JSON.stringify(standardData.course_assessment || {}, null, 2),
              spacing: { after: 200 }
            }),

            // 教学资源
            new Paragraph({
              text: '七、教学资源',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            ...(resourcesData && resourcesData.length > 0
              ? [new DocxTable({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '资源标题', bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '资源类型', bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '资源类别', bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '是否必修', bold: true })] })] })
                    ]
                  }),
                  ...resourcesData.map((r: any) => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: r.course_resources?.title || '-' })] }),
                      new TableCell({ children: [new Paragraph({ text: r.course_resources?.type || '-' })] }),
                      new TableCell({ children: [new Paragraph({ text: r.resource_category || '-' })] }),
                      new TableCell({ children: [new Paragraph({ text: r.is_required ? '是' : '否' })] })
                    ]
                  }))
                ]
              })]
              : [new Paragraph({ text: '暂无教学资源' })]
            ),

            // 开发团队信息
            new Paragraph({
              text: '八、开发团队信息',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new DocxTable({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '负责人', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.responsible_person || '-' })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '负责部门', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.responsible_department || '-' })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '开发团队', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: standardData.development_team || '-' })] })
                  ]
                })
              ]
            }),

            // 备注
            new Paragraph({
              text: '九、备注',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              text: standardData.remarks || '无',
              spacing: { after: 200 }
            }),

            // 时间戳
            new Paragraph({
              text: '',
              spacing: { before: 400 }
            }),
            new Paragraph({
              text: `创建时间: ${new Date(standardData.created_at).toLocaleString('zh-CN')}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `更新时间: ${new Date(standardData.updated_at).toLocaleString('zh-CN')}`
            })
          ]
        }]
      });

      // 生成并下载文档
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${standardData.course_name}_${standardData.course_code}_课程标准.docx`);

      message.destroy();
      message.success('导出成功');
    } catch (error) {
      message.destroy();
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  const onDownload = (record: any) => {
    if (!record.courseStandardAttach) {
      message.warning('该课程未上传标准!');
      return;
    }
    postResourceGetBylds([record.courseStandardAttach]).then((data: any) => {
      if (data && data.length > 0) {
        const url = (data[0].signUrl);
        if (url) {
          window.open(url, '_blank');
        }
      }
    }).catch((error: any) => {
      message.error(error.message);
    }).finally(() => {

    });

  }

  const getStatusTag = (status: any, record: any) => {
    if (status == 0) {
      status = 'draft'
    }
    if (status == 1) {
      status = 'pending_review'
    }
    if (status == 2) {
      status = 'approved'
    }
    if (status == 3) {
      status = 'rejected'
    }
    return <Tag color={getStatusAntdColor(status)}>{getStatusLabel(status)}</Tag>;
  };
  const html2 = '<div style="font-family: &quot;Source Han Serif CN&quot;, SimSun, serif; font-size: 14px; line-height: 1.8; color: rgb(29, 29, 29);"><p>2026.03.27 张斌提</p><p>1.课程框架构建：</p><p>1.1国际职业教育课程框架概览（包括学分、门数、等级等）直观呈现 ，一目了然。</p><p>1.2职业领域课程框架构建</p><p>审核流程：职业领域课程框架构建—职业领域专业委员会组织专家审定（内容审核：审核课程名称和等级设定是否恰当）—专家委员会审定（形式审核）：备注：目前职业领域委员会暂未成立，所以由专家委员会审定，后续等职业领域委员会成熟以后，可能只有职业领域委员会审定或者两个都审定，所以课程框架发布以后，职业领域专业委员会和专家委员会暂时都开通审定权限。</p><p><img src="data:image/png;base64,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CIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDCCIkzCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgwgiJMwiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIMIIiTMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiDC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ERERERERERERERERERERTSOGM4iIiIiIiIiIiIiIiIiIiIimEcMZRERERERERERERERERERERNOI4QwiIiIiIiIiIiIiIiIiIiKiacRwBhEREREREREREREREREREdE0YjiDiIiIiIiIiIiIiIiIiIiIaBoxnEFEREREREREREREREREREQ0jRjOICIiIiIiIiIiIiIiIiIiIppGDGcQERERERERERERERERERERTSOGM4iIiIiIiIiIiIiIiIiIiIimEcMZRERERERERERERERERERERNOI4QwiIiIiIiIiIiIiIiIiIiKiacRwBhEREREREREREREREREREdE0YjiDiIiIiIiIiIiIiIiIiIiIaBoxnEFEREREREREREREREREREQ0jRjOICIiIiIiIiIiIiIiIiIiIppGDGcQERERERERERERERERERERTSOGM4iIiIiIiIiIiIiIiIiIiIimEcMZRERERERERERERERERERERNOI4QwiIiIiIiIiIiIiIiIiIiKiacRwBhEREREREREREREREREREdE0YjiDiIiIiIiIiIiIiIiIiIiIaBoxnEFEREREREREREREREREREQ0jRjOICIiIiIiIiIiIiIiIiIiIppGDGcQERERERERERERERERERER+WnGDPlXXDGcQURERERERERERERERERERDSNGM4gIiIiIiIiIiIiIiIiIiIi8tMMFaUzGM4gIiIiIiIiIiIiIiIiIiIi8tMMFckLFU8hIiIiIiIiIiIiIiIiIiIiIkUz/iD/iguGM4iIiIiIiIiIiIiIiIiIiIj8NOM5tjUhIiIiIiIiIiIiIiIiIiIimhYzngOeU5G8UPEUIiIiIiIiIiIiIiIiIiIiIpJ7TgPAe+EMhjOIiIiIiIiIiIiIiIiIiIiIfPWcBnjueRXJDIYziIiIiIiIiIiIiIiIiIiIiHz3nGYGZqjLZjCcQUREREREREREREREREREROQLzfMz8Nzz8q+6x3AGERERERERERERERERERERkUpCO5M/yL/sEcMZRERERERERERERERERERERCrMeA7QBMzAjOdU9jMRMZxBRERERERERERERERERERE5MVzGuD5wBmY4UfSwo+XEBEREREREREREREREREREX11aJ6fAU2AUDnDH36+jIiIiIiIiIiIiIiIiIiIiOjLzVYtQxMIn1uZSDGcQURERERERERERERERERERCQx4zlAEwBoAmfgueflj/qO4QwiIiIiIiIiIiIiIiIiIiL6apoBzJgBPPfcDHvrkudnzkDAH82AJmAGZvhfLMPJjD/84Q9/kH+RiIiIiIiIiIiIiIiIiIiIiKYGK2cQERERERERERERERERERERTaP/HxK7jtvY6MkaAAAAAElFTkSuQmCC"></p><p>这个不叫指导原则，它是一个课程体系构建的分工。如果各个职业领域进去以后直接对应的专业能力和行动能力课程就不用写这个分工，可以删除；如果各个职业领域进去以后，是一个整体的课程框架，目的是让他明确他要做的哪两类课程。这样的话要修改一下标题和内容，应该是职业领域课程框架构建任务分工。</p><p>2.课程标准设计</p><p>2.1课程标准模版</p><p>2.1.1基础能力课程标准模版</p><p>2.1.1.1职业素养课程标准模版</p><p>2.2.1.2专业能力课程标准模版</p><p>2.2.2行动能力课程标准模版</p><p>2.2.3发展能力课程标准模版</p><p>2.2研制课程标准（这样呈现比较清，跟方案一致，也没有其他名字，取其他名字容易导致误解。）</p><p>2.2.1基础能力课程标准</p><p>2.2.1.1职业素养课程标准</p><p>2.2.1.2专业能力课程标准</p><p>2.2.2行动能力课程标准</p><p>2.2.3发展能力课程标准	</p><p>审核流程：职业领域课程标准—职业领域专业委员会组织专家审定（内容审核）—专家委员会审定（形式审核）：</p><p>3.标准课程开发</p><p>3.1.标准课程开发</p><p>3.1.1基础能力标准课程开发</p><p>3.1.1.1职业素养标准课程开发</p><p>3.1.1.2专业能力标准课程开发（暂定线下）</p><p>3.1.2行动能力标准课程开发（暂定线下）</p><p>3.1.3发展能力标准课程开发</p><p>3.2课程学习资源</p><p>备注：如果专业能力和行动能力课程不在平台上发布的话，这里的学习资源应该是职业素养标准课程和发展能力标准课程的学习资源。</p><p>3.3课程考核评价</p><p>备注：如果专业能力和行动能力课程不在平台上发布的话，这里的课程考核应该是职业素养标准课程和发展能力标准课程的考核。</p><p>4（原系统中）认可课程认定建议这一部分内容放到学分转化系统当中去，如果课程系统确实要保留的话，只呈现简要的介绍和概述。比如说</p><p>  4.1概述（内容包括：认可课程定义、认定标准、认定流程）</p><p>4.2认可课程结果查询</p><p>或者是将课程系统的这一部分与转换系统的这一部分打通。</p><p>5.（原系统中）领域课程目录和课程目录管理这两个可以合并为一个，应该属于后面的学分转换系统当中的内容，建议放到学分转换系统当中去，如果这边确实要保留的话，只呈现简要的介绍和概述，以及<strong>简要的一个全部课程的目录</strong>。或者是将课程系统的这一部分与转换系统的这一部分打通。</p></div>'
  const html3 = '<div style="font-family: &quot;Source Han Serif CN&quot;, SimSun, serif; font-size: 14px; line-height: 1.8; color: rgb(29, 29, 29);"><h1>[课程名称]</h1><h2>课程标准</h2><h2>目    录</h2><p>一、课程适应对象</p><p>二、课程基本信息</p><p>三、课程性质与任务</p><p>    （一）课程性质</p><p>    （二）课程任务</p><p>四、课程目标</p><p>五、课程内容</p><p>六、教学实施与保障</p><p>    （一）教学设计</p><p>    （二）教学资源开发与应用</p><p>    （三）师资要求</p><p>    （四）校企合作情况</p><p>    （五）教材选用及辅助教学资料</p><p>七、课程考核与评价</p><p>    （一）课程评价方法</p><p>    （二）评分标准</p><h2>一、课程适应对象</h2><p>        [请描述课程适应对象...]</p><h2>二、课程基本信息</h2><table><tbody><tr><td><p>课程名称：</p></td><td></td><td><p>课程代码：</p></td><td></td></tr><tr><td><p>学分：</p></td><td></td><td><p>学时：</p></td><td></td></tr><tr><td><p>课程类型：</p></td><td></td><td><p>授课时间：</p></td><td></td></tr><tr><td><p>授课对象：</p></td><td></td><td></td><td></td></tr></tbody></table><h2>三、课程性质与任务</h2><h3>（一）课程性质</h3><p>        [课程性质描述...]</p><h3>（二）课程任务</h3><p>        [课程任务描述...]</p><h2>四、课程目标</h2><p>        [课程目标描述...]</p><h2>五、课程内容</h2><p>        [课程内容描述...]</p><h2>六、教学实施与保障</h2><h3>（一）教学设计</h3><p>        [教学设计描述...]</p><h3>（二）教学资源开发与应用</h3><p>        [教学资源开发与应用描述...]</p><h3>（三）师资要求</h3><p>        [师资要求描述...]</p><h3>（四）校企合作情况</h3><p>        [校企合作情况描述...]</p><h3>（五）教材选用及辅助教学资料</h3><p>        [教材选用及辅助教学资料描述...]</p><h2>七、课程考核与评价</h2><h3>（一）课程评价方法</h3><p>        [课程评价方法描述...]</p><h3>（二）评分标准</h3><p>        [评分标准描述...]</p><p>制定人：___________</p><p>审核人：___________</p><p>批准人：___________</p><p>制定日期：____年__月__日</p></div>'
  const columns: ColumnsType<any> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 180,
      fixed: 'left',
      render: (name) => (
        <div className="font-semibold text-gray-900">{name}</div>
      ),
    },
    {
      title: '执行标准',
      dataIndex: 'levelName',
      key: 'ivrlLevel',
      width: 120,
      align: 'center',
      render: (level) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: '课程代码',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: 120,
      render: (code) => (
        <div className="text-sm font-medium text-gray-900">{code}</div>
      ),
    },

    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'abilityModule',
      width: 240,
      // render: (_, record) => {
      //   return (
      //     <div className="text-sm font-medium text-gray-900">{(industries.find(a => a.id == record.careerId) || { id: 0, name: '-' }).name}</div>
      //   );
      // }
    },
    {
      title: '能力目标',
      dataIndex: 'abilityName',
      key: 'abilityName',
      width: 250,
    },
    {
      title: '学分/学制',
      key: 'creditsAndHours',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const credits = record.courseCredit || 0;
        const hours = record.courseHour || 0;
        return (
          <div className="text-sm">
            {credits > 0 || hours > 0 ? (
              <>
                {credits > 0 && <div>{credits}学分</div>}
                {hours > 0 && <div>{hours}学时</div>}
              </>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: '课标状态',
      dataIndex: 'auditStatus',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status, record) => getStatusTag(status, record),
    },
    {
      title: '课标创建时间',
      dataIndex: 'createTime',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        let status = '';
        if (record.auditStatus == 0) {
          status = 'draft'
        }
        if (record.auditStatus == 1) {
          status = 'pending_review'
        }
        if (record.auditStatus == 2) {
          status = 'approved'
        }
        if (record.auditStatus == 3) {
          status = 'rejected'
        }
        const isDraft = status === 'draft';
        const isSubmitted = status === 'approved';
        const isPendingReview = status === 'pending_review';
        const isRejected = status === 'rejected';

        return (
          <Space size="small">
            <Tooltip title="查看标准">
              <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => {
                  onDownload(record);
                  // setWordViewerTitle(record.courseName || '课程标准');
                  // setWordViewerHtml('');
                  // setWordViewerOpen(true);
                  // setWordViewerLoading(true);
                  // try {
                  //   if (courseType == 2)
                  //     setWordViewerHtml(html2);
                  //   else
                  //     setWordViewerHtml(html3);
                  // } catch (err) {
                  //   setWordViewerHtml('<p style="color:red">文件加载失败，请稍后重试。</p>');
                  // } finally {
                  //   setWordViewerLoading(false);
                  // }
                }}
              />
            </Tooltip>
            {isDraft && (
              <>
                <Tooltip title="设置课标">
                  <Button
                    type="link"
                    icon={<FileProtectOutlined />}
                    size="small"
                    onClick={() => {
                      setSelectedCourseForCreate(record);
                      setShowCreatePage(true);
                    }}
                  />
                </Tooltip>

                {record.courseStandardAttach && <Tooltip title="提交审核">
                  <Button
                    type="link"
                    icon={<AuditOutlined />}
                    size="small"
                    onClick={() => {
                      Modal.confirm({
                        title: '提交审核',
                        content: '确定要提交此课程标准进行审核吗？',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => handleSubmitForReview(record),
                      });
                    }}
                  />
                </Tooltip>
                }
              </>
            )}

            {isPendingReview && (
              <Tooltip title="撤销审核">
                <Button
                  type="link"
                  icon={<RollbackOutlined />}
                  size="small"
                  onClick={() => {
                    Modal.confirm({
                      title: '撤销审核',
                      content: '确定要撤销审核吗？标准将恢复为草稿状态。',
                      okText: '确定',
                      cancelText: '取消',
                      onOk: () => handleCancelReview(record),
                    });
                  }}
                />
              </Tooltip>
            )}

            {isRejected && (
              <>
                <Tooltip title="设置课标">
                  <Button
                    type="link"
                    icon={<FileProtectOutlined />}
                    size="small"
                    onClick={() => {
                      setSelectedCourseForCreate(record);
                      setShowCreatePage(true);
                    }}
                  />
                </Tooltip>

                {record.courseStandardAttach && <Tooltip title="提交审核">
                  <Button
                    type="link"
                    icon={<AuditOutlined />}
                    size="small"
                    onClick={() => {
                      Modal.confirm({
                        title: '提交审核',
                        content: '确定要重新提交此课程标准进行审核吗？',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => handleSubmitForReview(record.id),
                      });
                    }}
                  />
                </Tooltip>
                }
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const ManageTab = () => {
    const uniqueExecutionStandards = [...new Set(standards.map(s => s.ivrlLevel).filter(Boolean))];
    const uniqueOccupationalFields = [...new Set(standards.map(s => s.abilityModule).filter(Boolean))];
    const uniqueAbilityTargets = [...new Set(
      standards.flatMap(s => [s.level1?.name, s.level2?.name, s.level3?.name].filter(Boolean))
    )].filter(name => name !== '基础能力');

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div className="space-y-4">
            <Space wrap>
              <Search
                placeholder="搜索课程名称或编码..."
                prefix={<SearchOutlined />}
                value={pagingSearch.keyword}
                onChange={(e) => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
                onSearch={(value) => setPagingSearch((prev: any) => ({ ...prev, keyword: value, current: 1 }))}
                style={{ width: 240 }}
              />
              <Select
                placeholder="执行标准"
                value={pagingSearch.levelId}
                onChange={(value) => setPagingSearch((prev: any) => ({ ...prev, levelId: value, current: 1 }))}
                style={{ width: 140 }}
                allowClear
              >
                {levelList.map(standard => (
                  <Option key={standard.id} value={standard.id}>{standard.levelName}</Option>
                ))}
              </Select>
              <Select
                placeholder="职业领域"
                value={pagingSearch.careerId}
                onChange={(value) => setPagingSearch((prev: any) => ({ ...prev, careerId: value, current: 1 }))}
                style={{ width: 300 }}
                allowClear
              >
                {industries.map(industry => (
                  <Select.Option key={industry.id} value={industry.id}>
                    {industry.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={tableData.records || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1300 }}
            pagination={{
              showSizeChanger: true,
              current: pagingSearch.current,
              showTotal: (total) => `共 ${tableData.total} 条记录`,
              defaultPageSize: 10,
              total: tableData.total,
              onChange: (page, pageSize) => {
                if (pageSize !== pagingSearch.size) {
                  setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
                } else {
                  setPagingSearch((prev: any) => ({ ...prev, current: page }))
                }
              }
            }}
          />
        </Card>
      </Space>
    );
  };

  if (editingStandardId) {
    return (
      <EditCourseStandard
        standardId={editingStandardId}
        onBack={() => setEditingStandardId(null)}
        onSaveSuccess={() => {
          setEditingStandardId(null);
          fetchStandards();
        }}
      />
    );
  }

  if (showCreatePage) {
    return (
      <CreateCourseStandard
        onBack={() => {
          setShowCreatePage(false);
          setSelectedCourseForCreate(null);
        }}
        onSaveSuccess={() => {
          setShowCreatePage(false);
          setSelectedCourseForCreate(null);
          fetchCourses();
        }}
        preSelectedCourse={selectedCourseForCreate ? {
          ...selectedCourseForCreate,
          level1Name: selectedCourseForCreate.level1?.name || '',
        } : null}
      />
    );
  }

  if (selectedStandardId) {
    return (
      <CourseStandardDetail
        standardId={selectedStandardId}
        onBack={() => setSelectedStandardId(null)}
      />
    );
  }

  return (
    <div className="p-8">
      {/* 返回按钮 */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-5 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          返回课程标准选择
        </button>
      )}

      {/* 标签页导航 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'domain-framework', label: '职业领域分级课程框架', icon: Layers },
              { id: 'manage', label: courseType === 'professional' ? '专业能力课程标准' : courseType === 'action' ? '行动能力课程标准' : '职业领域分级课程标准', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {activeTab === 'domain-framework' && <DomainFrameworkTab />}
        {activeTab === 'manage' && <ManageTab />}
      </div>

      {/* 新建课程标准模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">新建课程标准</h2>
                  <p className="text-gray-600 mt-1">步骤 {createStep} / 4</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStep(1);
                    setCourseData({});
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <CreateCourseStep
                currentStep={createStep}
                courseData={courseData}
                onDataChange={handleDataChange}
                onNext={handleNext}
                onPrev={handlePrev}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      )}


      <Modal
        open={wordViewerOpen}
        onCancel={() => { setWordViewerOpen(false); setWordViewerHtml(''); }}
        title={
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {wordViewerTitle} — 课标文件预览
          </span>
        }
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        styles={{ body: { padding: '24px 32px', height: '80vh', overflowY: 'auto' } }}
        destroyOnClose
      >
        {wordViewerLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div>文件加载中，请稍候...</div>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontFamily: "'Source Han Serif CN', 'SimSun', serif",
              fontSize: 14,
              lineHeight: 1.8,
              color: '#1d1d1d',
            }}
            dangerouslySetInnerHTML={{ __html: wordViewerHtml }}
          />
        )}
      </Modal>
    </div>
  );
};

export default CourseStandardDevelopment;