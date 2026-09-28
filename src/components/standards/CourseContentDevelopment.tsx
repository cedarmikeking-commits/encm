import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, CreditCard as Edit3, Eye, Trash2, Save, Upload, Download, Users, Clock, Target, CheckCircle, AlertCircle, FileText, Video, Headphones, Image, Link, Settings, BarChart3, Calendar, Award, Layers, PlayCircle, PenTool, MessageSquare, Briefcase, FlaskConical, Lightbulb, Zap, Database, Grid3x3, TreePine, Map, Workflow, Brain, Wrench, Puzzle, Star, Flag, ChevronRight, ChevronDown, Copy, Move, RotateCcw, FolderOpen, X } from 'lucide-react';
import { CourseContent, TeachingModule, KnowledgePoint, SkillPoint, TeachingActivity, PracticalProject, ModuleResource } from '../../types/courseContent';
import ResourceLibraryModal from './ResourceLibraryModal';

const CourseContentDevelopment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'knowledge' | 'skills' | 'activities' | 'projects' | 'quality' | 'preview'>('overview');
  const [courses, setCourses] = useState<CourseContent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseContent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TeachingModule | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'timeline'>('list');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    const mockCourses: CourseContent[] = [
      {
        id: '1',
        courseId: 'course-1',
        courseName: '三维角色动画制作',
        courseCode: 'IVRL3001',
        status: 'developing',
        version: '1.0',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        createdBy: '张教授',
        basicInfo: {
          courseName: '三维角色动画制作',
          courseCode: 'IVRL3001',
          totalHours: 64,
          theoreticalHours: 24,
          practicalHours: 40,
          credits: 4,
          ivrlLevel: '3级',
          abilityModule: '虚拟现实技术应用',
          description: '本课程旨在培养学生掌握三维角色动画制作的核心技能，包括角色建模、绑定、动画制作等专业技能。'
        },
        teachingModules: [
          {
            id: 'module-1',
            order: 1,
            title: '三维建模基础',
            description: '学习三维建模的基本概念、工具使用和建模技巧',
            objectives: ['掌握三维建模基本概念', '熟练使用建模工具', '能够创建基础三维模型'],
            totalHours: 16,
            theoreticalHours: 6,
            practicalHours: 10,
            difficulty: 'basic',
            importance: 'core',
            prerequisites: ['计算机图形学基础'],
            knowledgePoints: ['三维坐标系', '多边形建模', '曲面建模'],
            skillPoints: ['建模工具使用', '模型优化', '拓扑结构'],
            teachingMethods: ['理论讲授', '实践操作', '案例分析'],
            assessmentMethods: ['实践作业', '技能测试'],
            resources: [],
            activities: []
          }
        ],
        knowledgeSystem: {
          coreKnowledge: [],
          importantKnowledge: [],
          generalKnowledge: [],
          knowledgeMap: []
        },
        skillSystem: {
          cognitiveSkills: [],
          operationalSkills: [],
          comprehensiveSkills: [],
          skillProgression: []
        },
        teachingActivities: [],
        practicalProjects: [],
        qualityStandards: []
      }
    ];
    setCourses(mockCourses);
    setSelectedCourse(mockCourses[0]);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'developing': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'published': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'developing': return '开发中';
      case 'review': return '审核中';
      case 'approved': return '已批准';
      case 'published': return '已发布';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'core': return 'bg-red-100 text-red-700';
      case 'important': return 'bg-orange-100 text-orange-700';
      case 'general': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleAddResources = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowResourceModal(true);
  };

  const handleResourceSelect = (selectedResources: any[]) => {
    if (!currentModuleId || !selectedCourse) return;

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourse.id) {
        const updatedModules = course.teachingModules.map(module => {
          if (module.id === currentModuleId) {
            const newResources: ModuleResource[] = selectedResources.map(res => ({
              id: res.id,
              type: res.type === '教材' ? 'textbook' :
                    res.type === '教学课件' ? 'multimedia' :
                    res.type === '虚拟仿真软件' ? 'software' : 'reference',
              name: res.title,
              description: res.description || '',
              required: false,
              url: res.file_path
            }));
            return {
              ...module,
              resources: [...module.resources, ...newResources]
            };
          }
          return module;
        });
        return { ...course, teachingModules: updatedModules };
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
  };

  const handleRemoveResource = (moduleId: string, resourceId: string) => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourse.id) {
        const updatedModules = course.teachingModules.map(module => {
          if (module.id === moduleId) {
            return {
              ...module,
              resources: module.resources.filter(r => r.id !== resourceId)
            };
          }
          return module;
        });
        return { ...course, teachingModules: updatedModules };
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.id === selectedCourse.id) || null);
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* 课程内容统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '教学模块', value: selectedCourse?.teachingModules.length || 0, icon: Layers, color: 'blue', desc: '个教学模块' },
          { title: '知识点', value: '45', icon: Brain, color: 'green', desc: '个知识点' },
          { title: '技能点', value: '32', icon: Wrench, color: 'purple', desc: '个技能点' },
          { title: '实践项目', value: '8', icon: Briefcase, color: 'amber', desc: '个实践项目' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <span className="text-sm font-medium text-green-600">+3</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* 课程内容结构 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TreePine className="mr-2 text-green-600" size={20} />
          课程内容结构
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">学时分配</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-gray-900">理论学时</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{selectedCourse?.basicInfo.theoreticalHours}</span>
                  <span className="text-sm text-gray-500 ml-1">学时</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wrench className="text-green-600" size={16} />
                  <span className="text-sm font-medium text-gray-900">实践学时</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">{selectedCourse?.basicInfo.practicalHours}</span>
                  <span className="text-sm text-gray-500 ml-1">学时</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="text-purple-600" size={16} />
                  <span className="text-sm font-medium text-gray-900">实践占比</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-purple-600">
                    {Math.round(((selectedCourse?.basicInfo.practicalHours || 0) / (selectedCourse?.basicInfo.totalHours || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">内容分布</h4>
            <div className="space-y-3">
              {[
                { category: '核心内容', count: 12, percentage: 40, color: 'red' },
                { category: '重要内容', count: 18, percentage: 35, color: 'orange' },
                { category: '一般内容', count: 15, percentage: 25, color: 'blue' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm bg-${item.color}-100 text-${item.color}-700`}>
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-600">{item.count} 项</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${item.color}-600 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 开发进度 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="mr-2 text-blue-600" size={20} />
          内容开发进度
        </h3>
        <div className="space-y-4">
          {[
            { module: '教学模块设计', progress: 85, status: 'developing' },
            { module: '知识点梳理', progress: 70, status: 'developing' },
            { module: '技能点设计', progress: 60, status: 'developing' },
            { module: '教学活动设计', progress: 45, status: 'planned' },
            { module: '实践项目设计', progress: 30, status: 'planned' },
            { module: '质量标准制定', progress: 20, status: 'planned' }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{item.module}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.progress}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'developing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status === 'completed' ? '已完成' :
                     item.status === 'developing' ? '开发中' : '规划中'}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.progress >= 80 ? 'bg-green-600' :
                    item.progress >= 50 ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ModulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">教学模块设计</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              列表视图
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tree' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              树形视图
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              时间线
            </button>
          </div>
          <button
            onClick={() => setShowModuleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>添加模块</span>
          </button>
        </div>
      </div>

      {/* 模块列表 */}
      <div className="space-y-4">
        {selectedCourse?.teachingModules.map((module, index) => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedModules.has(module.id) ? 
                        <ChevronDown size={16} className="text-gray-500" /> : 
                        <ChevronRight size={16} className="text-gray-500" />
                      }
                    </button>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      模块 {module.order}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">{module.title}</h4>
                  </div>
                  <p className="text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty === 'basic' ? '基础' : 
                       module.difficulty === 'intermediate' ? '中级' : '高级'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getImportanceColor(module.importance)}`}>
                      {module.importance === 'core' ? '核心' : 
                       module.importance === 'important' ? '重要' : '一般'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>总学时: {module.totalHours}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen size={16} />
                  <span>理论: {module.theoreticalHours}h</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Wrench size={16} />
                  <span>实践: {module.practicalHours}h</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target size={16} />
                  <span>{module.objectives.length} 个目标</span>
                </div>
              </div>

              {expandedModules.has(module.id) && (
                <div className="border-t pt-4 space-y-4">
                  {/* 学习目标 */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="mr-2 text-green-600" size={16} />
                      学习目标
                    </h5>
                    <div className="space-y-2">
                      {module.objectives.map((objective, objIndex) => (
                        <div key={objIndex} className="flex items-center space-x-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-sm text-gray-700">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 知识点和技能点 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Brain className="mr-2 text-blue-600" size={16} />
                        知识点
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {module.knowledgePoints.map((point, pointIndex) => (
                          <span key={pointIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Wrench className="mr-2 text-purple-600" size={16} />
                        技能点
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {module.skillPoints.map((point, pointIndex) => (
                          <span key={pointIndex} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 教学方法 */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="mr-2 text-yellow-600" size={16} />
                      教学方法
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {module.teachingMethods.map((method, methodIndex) => (
                        <span key={methodIndex} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 课程资源 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 flex items-center">
                        <FolderOpen className="mr-2 text-orange-600" size={16} />
                        课程资源
                      </h5>
                      <button
                        onClick={() => handleAddResources(module.id)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Plus size={14} />
                        <span>添加资源</span>
                      </button>
                    </div>
                    {module.resources.length > 0 ? (
                      <div className="space-y-2">
                        {module.resources.map((resource, resIndex) => (
                          <div
                            key={resIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {resource.type === 'textbook' && <BookOpen size={16} className="text-blue-600" />}
                              {resource.type === 'multimedia' && <Video size={16} className="text-green-600" />}
                              {resource.type === 'software' && <Database size={16} className="text-purple-600" />}
                              {resource.type === 'reference' && <FileText size={16} className="text-gray-600" />}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">{resource.name}</span>
                                  {resource.required && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">必选</span>
                                  )}
                                </div>
                                {resource.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{resource.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveResource(module.id, resource.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FolderOpen className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-sm text-gray-500">暂无资源</p>
                        <p className="text-xs text-gray-400 mt-1">点击"添加资源"从资源库中选择</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 资源库选择模态框 */}
      <ResourceLibraryModal
        visible={showResourceModal}
        courseId={selectedCourse?.courseId}
        onCancel={() => {
          setShowResourceModal(false);
          setCurrentModuleId(null);
        }}
        onSelect={handleResourceSelect}
        selectedResourceIds={
          currentModuleId
            ? selectedCourse?.teachingModules
                .find(m => m.id === currentModuleId)
                ?.resources.map(r => r.id) || []
            : []
        }
        multiple={false}
      />
    </div>
  );

  const KnowledgeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">知识点体系</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>添加知识点</span>
        </button>
      </div>

      {/* 知识点分类 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { category: '核心知识', count: 15, color: 'red', icon: Star },
          { category: '重要知识', count: 20, color: 'orange', icon: Flag },
          { category: '一般知识', count: 10, color: 'blue', icon: BookOpen }
        ].map((item, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <item.icon className={`text-${item.color}-600`} size={24} />
              <span className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-700 rounded-full text-sm font-medium`}>
                {item.count}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{item.category}</h4>
            <p className="text-sm text-gray-600">管理{item.category.toLowerCase()}点</p>
          </div>
        ))}
      </div>

      {/* 知识点列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">知识点详情</h4>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload size={16} />
                <span>导入</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">知识点</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">类别</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">重要性</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">难度</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">学时</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: '三维坐标系统', category: 'theoretical', importance: 'core', difficulty: 'easy', hours: 2 },
                { name: '多边形建模原理', category: 'applied', importance: 'core', difficulty: 'medium', hours: 4 },
                { name: '材质与贴图', category: 'practical', importance: 'important', difficulty: 'medium', hours: 3 },
                { name: '光照与渲染', category: 'applied', importance: 'important', difficulty: 'hard', hours: 5 }
              ].map((knowledge, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{knowledge.name}</p>
                      <p className="text-sm text-gray-500">KP{String(index + 1).padStart(3, '0')}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      knowledge.category === 'theoretical' ? 'bg-blue-100 text-blue-700' :
                      knowledge.category === 'applied' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {knowledge.category === 'theoretical' ? '理论' :
                       knowledge.category === 'applied' ? '应用' : '实践'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${getImportanceColor(knowledge.importance)}`}>
                      {knowledge.importance === 'core' ? '核心' :
                       knowledge.importance === 'important' ? '重要' : '一般'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      knowledge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      knowledge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {knowledge.difficulty === 'easy' ? '简单' :
                       knowledge.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{knowledge.hours} 学时</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SkillsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">技能点体系</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>添加技能点</span>
        </button>
      </div>

      {/* 技能点分类 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { category: '认知技能', count: 12, color: 'blue', icon: Brain, desc: '理解和分析能力' },
          { category: '操作技能', count: 18, color: 'green', icon: Wrench, desc: '实际操作能力' },
          { category: '综合技能', count: 8, color: 'purple', icon: Puzzle, desc: '综合应用能力' }
        ].map((item, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <item.icon className={`text-${item.color}-600`} size={24} />
              <span className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-700 rounded-full text-sm font-medium`}>
                {item.count}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{item.category}</h4>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 技能进阶路径 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Workflow className="mr-2 text-purple-600" size={20} />
          技能进阶路径
        </h4>
        <div className="space-y-4">
          {[
            {
              skill: '三维建模',
              levels: [
                { level: '基础', description: '掌握基本建模工具', status: 'completed' },
                { level: '中级', description: '复杂模型制作', status: 'current' },
                { level: '高级', description: '专业级建模技能', status: 'planned' }
              ]
            },
            {
              skill: '角色绑定',
              levels: [
                { level: '基础', description: '基本骨骼绑定', status: 'planned' },
                { level: '中级', description: '高级绑定技术', status: 'planned' },
                { level: '高级', description: '自动化绑定系统', status: 'planned' }
              ]
            }
          ].map((skillPath, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">{skillPath.skill}</h5>
              <div className="flex items-center space-x-4">
                {skillPath.levels.map((level, levelIndex) => (
                  <React.Fragment key={levelIndex}>
                    <div className={`flex-1 p-3 rounded-lg border-2 ${
                      level.status === 'completed' ? 'border-green-200 bg-green-50' :
                      level.status === 'current' ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{level.level}</span>
                        {level.status === 'completed' && <CheckCircle size={16} className="text-green-600" />}
                        {level.status === 'current' && <Clock size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-600">{level.description}</p>
                    </div>
                    {levelIndex < skillPath.levels.length - 1 && (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ActivitiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">教学活动设计</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>添加活动</span>
        </button>
      </div>

      {/* 活动类型统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { type: 'lecture', name: '理论讲授', count: 8, icon: PlayCircle, color: 'blue' },
          { type: 'discussion', name: '讨论交流', count: 6, icon: MessageSquare, color: 'green' },
          { type: 'case_study', name: '案例分析', count: 4, icon: FileText, color: 'purple' },
          { type: 'experiment', name: '实验操作', count: 10, icon: FlaskConical, color: 'red' },
          { type: 'project', name: '项目实践', count: 5, icon: Briefcase, color: 'amber' },
          { type: 'simulation', name: '模拟训练', count: 3, icon: Settings, color: 'indigo' }
        ].map((activity, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <activity.icon className={`mx-auto mb-2 text-${activity.color}-600`} size={24} />
            <p className="text-sm font-medium text-gray-900 mb-1">{activity.name}</p>
            <p className="text-xs text-gray-500">{activity.count} 个活动</p>
          </div>
        ))}
      </div>

      {/* 活动列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">教学活动详情</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            {
              title: '三维建模基础理论讲授',
              type: 'lecture',
              duration: 90,
              participants: 30,
              objectives: ['理解三维建模基本概念', '掌握建模工具界面'],
              materials: ['PPT课件', '演示模型', '教学视频']
            },
            {
              title: '角色建模实践操作',
              type: 'experiment',
              duration: 180,
              participants: 15,
              objectives: ['完成角色头部建模', '掌握细节雕刻技巧'],
              materials: ['建模软件', '参考图片', '操作手册']
            },
            {
              title: '优秀作品案例分析',
              type: 'case_study',
              duration: 60,
              participants: 30,
              objectives: ['分析优秀作品特点', '学习制作技巧'],
              materials: ['案例作品', '分析报告模板']
            }
          ].map((activity, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-2">{activity.title}</h5>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.type === 'lecture' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'experiment' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type === 'lecture' ? '理论讲授' :
                       activity.type === 'experiment' ? '实验操作' : '案例分析'}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{activity.duration} 分钟</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{activity.participants} 人</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-sm font-medium text-gray-900 mb-2">活动目标</h6>
                  <div className="space-y-1">
                    {activity.objectives.map((objective, objIndex) => (
                      <div key={objIndex} className="flex items-center space-x-2">
                        <Target size={12} className="text-green-500" />
                        <span className="text-sm text-gray-600">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-gray-900 mb-2">所需材料</h6>
                  <div className="flex flex-wrap gap-1">
                    {activity.materials.map((material, matIndex) => (
                      <span key={matIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">实践项目设计</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>添加项目</span>
        </button>
      </div>

      {/* 项目类型分布 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { type: 'individual', name: '个人项目', count: 5, color: 'blue', desc: '独立完成的项目' },
          { type: 'group', name: '团队项目', count: 3, color: 'green', desc: '团队协作项目' },
          { type: 'enterprise', name: '企业项目', count: 2, color: 'purple', desc: '真实企业项目' }
        ].map((item, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <Briefcase className={`text-${item.color}-600`} size={24} />
              <span className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-700 rounded-full text-sm font-medium`}>
                {item.count}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 项目列表 */}
      <div className="space-y-4">
        {[
          {
            title: '角色动画短片制作',
            type: 'individual',
            difficulty: 'intermediate',
            duration: 4,
            objectives: ['完成3分钟角色动画短片', '展示角色表演技巧', '掌握动画制作流程'],
            requirements: ['原创角色设计', '流畅动画表现', '音效配合'],
            deliverables: ['动画短片文件', '制作过程文档', '技术总结报告']
          },
          {
            title: 'VR交互场景开发',
            type: 'group',
            difficulty: 'advanced',
            duration: 6,
            objectives: ['开发VR交互场景', '实现多人协作', '优化性能表现'],
            requirements: ['VR设备适配', '交互逻辑设计', '用户体验优化'],
            deliverables: ['VR应用程序', '用户手册', '演示视频']
          },
          {
            title: '企业宣传片制作',
            type: 'enterprise',
            difficulty: 'advanced',
            duration: 8,
            objectives: ['制作企业宣传片', '满足客户需求', '提升专业技能'],
            requirements: ['客户需求分析', '专业制作标准', '按时交付'],
            deliverables: ['宣传片成品', '客户反馈报告', '项目总结']
          }
        ].map((project, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.type === 'individual' ? 'bg-blue-100 text-blue-700' :
                    project.type === 'group' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {project.type === 'individual' ? '个人项目' :
                     project.type === 'group' ? '团队项目' : '企业项目'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty === 'basic' ? '基础' :
                     project.difficulty === 'intermediate' ? '中级' : '高级'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{project.duration} 周</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Target size={14} />
                    <span>{project.objectives.length} 个目标</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FileText size={14} />
                    <span>{project.deliverables.length} 个交付物</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Eye size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600">
                  <Edit3 size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">项目目标</h5>
                <div className="space-y-1">
                  {project.objectives.map((objective, objIndex) => (
                    <div key={objIndex} className="flex items-start space-x-2">
                      <CheckCircle size={12} className="text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-600">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">项目要求</h5>
                <div className="space-y-1">
                  {project.requirements.map((requirement, reqIndex) => (
                    <div key={reqIndex} className="flex items-start space-x-2">
                      <AlertCircle size={12} className="text-amber-500 mt-0.5" />
                      <span className="text-sm text-gray-600">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">交付物</h5>
                <div className="space-y-1">
                  {project.deliverables.map((deliverable, delIndex) => (
                    <div key={delIndex} className="flex items-start space-x-2">
                      <FileText size={12} className="text-blue-500 mt-0.5" />
                      <span className="text-sm text-gray-600">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QualityTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">内容质量标准</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>添加标准</span>
        </button>
      </div>

      {/* 质量维度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { dimension: '内容准确性', score: 92, color: 'green', icon: CheckCircle },
          { dimension: '教学有效性', score: 88, color: 'blue', icon: Target },
          { dimension: '实践相关性', score: 85, color: 'purple', icon: Wrench },
          { dimension: '评估有效性', score: 90, color: 'amber', icon: BarChart3 }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <item.icon className={`text-${item.color}-600`} size={24} />
              <span className={`text-2xl font-bold text-${item.color}-600`}>{item.score}</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{item.dimension}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-${item.color}-600 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 质量标准详情 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">质量标准详情</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            {
              category: '内容准确性',
              name: '知识点准确性检查',
              criteria: ['专业术语准确', '概念表述清晰', '案例真实有效', '数据来源可靠'],
              measurement: '专家评审',
              benchmark: '95%以上准确率'
            },
            {
              category: '教学有效性',
              name: '教学方法适用性',
              criteria: ['方法与目标匹配', '适合学生水平', '互动性充分', '反馈及时'],
              measurement: '教学效果评估',
              benchmark: '学生满意度90%以上'
            },
            {
              category: '实践相关性',
              name: '行业应用关联度',
              criteria: ['技能实用性强', '工具先进性', '项目真实性', '就业相关性'],
              measurement: '行业专家评价',
              benchmark: '行业认可度85%以上'
            },
            {
              category: '评估有效性',
              name: '考核方式合理性',
              criteria: ['评价标准明确', '考核方式多样', '难度适中', '反馈具体'],
              measurement: '学习成果分析',
              benchmark: '通过率80%以上'
            }
          ].map((standard, index) => (
            <div key={index} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      standard.category === '内容准确性' ? 'bg-green-100 text-green-700' :
                      standard.category === '教学有效性' ? 'bg-blue-100 text-blue-700' :
                      standard.category === '实践相关性' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {standard.category}
                    </span>
                    <h5 className="font-semibold text-gray-900">{standard.name}</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <h6 className="text-sm font-medium text-gray-900 mb-2">评价标准</h6>
                      <div className="space-y-1">
                        {standard.criteria.map((criterion, critIndex) => (
                          <div key={critIndex} className="flex items-center space-x-2">
                            <CheckCircle size={12} className="text-green-500" />
                            <span className="text-sm text-gray-600">{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-gray-900 mb-2">测量方法</h6>
                      <span className="text-sm text-gray-600">{standard.measurement}</span>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-gray-900 mb-2">质量基准</h6>
                      <span className="text-sm text-gray-600">{standard.benchmark}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-green-600">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PreviewTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">课程内容预览</h3>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            <span>导出预览</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Eye size={16} />
            <span>全屏预览</span>
          </button>
        </div>
      </div>

      {/* 课程内容大纲 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">课程内容大纲</h4>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">课程基本信息</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>课程名称: {selectedCourse?.basicInfo.courseName}</div>
              <div>课程代码: {selectedCourse?.basicInfo.courseCode}</div>
              <div>总学时: {selectedCourse?.basicInfo.totalHours}</div>
              <div>学分: {selectedCourse?.basicInfo.credits}</div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">教学模块 ({selectedCourse?.teachingModules.length || 0}个)</h5>
            <div className="space-y-2">
              {selectedCourse?.teachingModules.map((module, index) => (
                <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">模块{module.order}: {module.title}</span>
                  <span className="text-sm text-gray-500">{module.totalHours}学时</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">知识技能体系</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-sm font-medium text-gray-900 mb-1">核心知识点</h6>
                <div className="text-sm text-gray-600">15个核心知识点，涵盖理论基础和应用实践</div>
              </div>
              <div>
                <h6 className="text-sm font-medium text-gray-900 mb-1">关键技能点</h6>
                <div className="text-sm text-gray-600">32个技能点，包含认知、操作和综合技能</div>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-amber-500 pl-4">
            <h5 className="font-medium text-gray-900 mb-2">实践项目</h5>
            <div className="text-sm text-gray-600">
              设计8个实践项目，包括个人项目、团队项目和企业项目，
              全面培养学生的实际应用能力和职业素养。
            </div>
          </div>
        </div>
      </div>

      {/* 内容质量报告 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">内容质量报告</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">完成度统计</h5>
            <div className="space-y-3">
              {[
                { item: '教学模块', completed: 6, total: 8, percentage: 75 },
                { item: '知识点', completed: 38, total: 45, percentage: 84 },
                { item: '技能点', completed: 28, total: 32, percentage: 88 },
                { item: '教学活动', completed: 24, total: 30, percentage: 80 },
                { item: '实践项目', completed: 6, total: 8, percentage: 75 }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{stat.item}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{stat.completed}/{stat.total}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{stat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">质量评估</h5>
            <div className="space-y-3">
              {[
                { aspect: '内容完整性', score: 85, status: 'good' },
                { aspect: '逻辑连贯性', score: 92, status: 'excellent' },
                { aspect: '实践适用性', score: 78, status: 'good' },
                { aspect: '难度适中性', score: 88, status: 'good' }
              ].map((quality, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{quality.aspect}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{quality.score}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      quality.status === 'excellent' ? 'bg-green-100 text-green-700' :
                      quality.status === 'good' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {quality.status === 'excellent' ? '优秀' :
                       quality.status === 'good' ? '良好' : '待改进'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">制定课程内容</h1>
        <p className="text-gray-600">设计详细的课程内容，包括教学模块、知识技能体系、教学活动和实践项目</p>
      </div>

      <div className="flex gap-8">
        {/* 左侧课程列表 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* 搜索和筛选 */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="搜索课程..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                <option value="draft">草稿</option>
                <option value="developing">开发中</option>
                <option value="review">审核中</option>
                <option value="approved">已批准</option>
                <option value="published">已发布</option>
              </select>
            </div>

            {/* 课程列表 */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCourse?.id === course.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{course.courseName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{course.courseCode}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{course.basicInfo.credits} 学分</span>
                    <span>{course.basicInfo.totalHours} 学时</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 新建课程按钮 */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>新建课程内容</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧课程详情 */}
        <div className="flex-1">
          {selectedCourse ? (
            <>
              {/* 课程标题和操作 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.courseName}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{selectedCourse.courseCode}</span>
                      <span>•</span>
                      <span>{selectedCourse.basicInfo.ivrlLevel}</span>
                      <span>•</span>
                      <span>{selectedCourse.createdBy}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedCourse.status)}`}>
                        {getStatusText(selectedCourse.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download size={16} />
                      <span>导出</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Save size={16} />
                      <span>保存</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 标签页导航 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: '内容概览', icon: BarChart3 },
                      { id: 'modules', label: '教学模块', icon: Layers },
                      { id: 'knowledge', label: '知识体系', icon: Brain },
                      { id: 'skills', label: '技能体系', icon: Wrench },
                      { id: 'activities', label: '教学活动', icon: Zap },
                      { id: 'projects', label: '实践项目', icon: Briefcase },
                      { id: 'quality', label: '质量标准', icon: Award },
                      { id: 'preview', label: '内容预览', icon: Eye }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
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
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'modules' && <ModulesTab />}
                {activeTab === 'knowledge' && <KnowledgeTab />}
                {activeTab === 'skills' && <SkillsTab />}
                {activeTab === 'activities' && <ActivitiesTab />}
                {activeTab === 'projects' && <ProjectsTab />}
                {activeTab === 'quality' && <QualityTab />}
                {activeTab === 'preview' && <PreviewTab />}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择一个课程</h3>
              <p className="text-gray-600">从左侧列表中选择一个课程来设计内容，或创建新的课程内容。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContentDevelopment;