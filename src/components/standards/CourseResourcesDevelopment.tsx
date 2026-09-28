import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Eye, CreditCard as Edit3, Trash2, Save, Upload, Download, Users, Clock, Target, CheckCircle, AlertCircle, BarChart3, Calendar, Award, Layers, PlayCircle, PenTool, MessageSquare, Briefcase, FlaskConical, Settings, BookOpen, Star, Zap, Database, Shield, Building, Link, RefreshCw, Copy, Timer, TrendingUp, PieChart, Activity, FileText, Video, Headphones, Image, Monitor, Smartphone, Tablet, Globe, HardDrive, Cpu, MemoryStick, Wifi, Camera, Mic, Speaker, Printer, Projector, Microscope, Calculator, Wrench, Hammer, Scissors, Palette, Brush, Ruler, Compass, Beaker, TestTube, Dna, Atom, Zap as Lightning, Battery, Power, Usb, Bluetooth, Radio, Tv, TowerControl as GameController, Joystick, Keyboard, Mouse, Folder, Waves as Wave } from 'lucide-react';
import { CourseResource, ResourceCategory, Resource, MultimediaResource, TeachingMaterial, EquipmentTool, DigitalResource } from '../../types/courseResources';

const CourseResourcesDevelopment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'multimedia' | 'materials' | 'equipment' | 'digital' | 'collections' | 'analytics' | 'settings'>('overview');
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<CourseResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    const mockResources: CourseResource[] = [
      {
        id: '1',
        courseId: '1',
        courseName: '三维角色动画',
        courseCode: 'IVRL3001',
        status: 'developing',
        version: '1.0',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        createdBy: '张教授',
        basicInfo: {
          courseName: '三维角色动画',
          courseCode: 'IVRL3001',
          totalResources: 156,
          resourceCategories: 8,
          storageUsed: 2048,
          lastUpdated: '2024-01-20',
          description: '三维角色动画课程的完整教学资源库'
        },
        resourceCategories: [
          {
            id: '1',
            name: '视频教程',
            type: 'multimedia',
            description: '课程相关的视频教学内容',
            icon: 'Video',
            color: 'blue',
            resourceCount: 45,
            totalSize: 1024,
            subcategories: [
              {
                id: '11',
                name: '基础教程',
                description: '三维动画基础知识视频',
                resources: []
              },
              {
                id: '12',
                name: '高级技巧',
                description: '高级动画制作技巧',
                resources: []
              }
            ]
          },
          {
            id: '2',
            name: '教学文档',
            type: 'document',
            description: '课程教学相关文档资料',
            icon: 'FileText',
            color: 'green',
            resourceCount: 32,
            totalSize: 256,
            subcategories: [
              {
                id: '21',
                name: '教学大纲',
                description: '课程教学大纲和计划',
                resources: []
              },
              {
                id: '22',
                name: '参考资料',
                description: '课程参考书籍和资料',
                resources: []
              }
            ]
          },
          {
            id: '3',
            name: '软件工具',
            type: 'software',
            description: '课程使用的软件和工具',
            icon: 'Monitor',
            color: 'purple',
            resourceCount: 12,
            totalSize: 512,
            subcategories: [
              {
                id: '31',
                name: '建模软件',
                description: '三维建模相关软件',
                resources: []
              },
              {
                id: '32',
                name: '动画软件',
                description: '动画制作相关软件',
                resources: []
              }
            ]
          },
          {
            id: '4',
            name: '实验设备',
            type: 'equipment',
            description: '课程实验所需设备',
            icon: 'Monitor',
            color: 'amber',
            resourceCount: 25,
            totalSize: 0,
            subcategories: [
              {
                id: '41',
                name: '计算机设备',
                description: '高性能计算机和工作站',
                resources: []
              },
              {
                id: '42',
                name: '输入设备',
                description: '数位板、手柄等输入设备',
                resources: []
              }
            ]
          }
        ],
        multimediaResources: [],
        teachingMaterials: [],
        equipmentTools: [],
        digitalResources: [],
        qualityStandards: []
      }
    ];
    setResources(mockResources);
    setSelectedResource(mockResources[0]);
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    return matchesSearch && matchesStatus;
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

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'multimedia': return Video;
      case 'document': return FileText;
      case 'software': return Monitor;
      case 'equipment': return Settings;
      case 'digital': return Globe;
      case 'assessment': return CheckSquare;
      default: return Package;
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'amber': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '总资源数', value: '1,256', change: '+45', icon: Package, color: 'blue' },
          { title: '资源分类', value: '24', change: '+3', icon: Folder, color: 'green' },
          { title: '存储使用', value: '15.6 GB', change: '+2.3 GB', icon: HardDrive, color: 'purple' },
          { title: '使用率', value: '89%', change: '+12%', icon: TrendingUp, color: 'amber' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-700">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* 资源分类概览 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="mr-2 text-blue-600" size={20} />
          资源分类概览
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {selectedResource?.resourceCategories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.type);
            return (
              <div key={index} className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getCategoryColor(category.color)}`}>
                <div className="flex items-center justify-between mb-3">
                  <IconComponent size={24} />
                  <span className="text-sm font-medium">{category.resourceCount} 个</span>
                </div>
                <h4 className="font-semibold mb-2">{category.name}</h4>
                <p className="text-sm opacity-75 mb-3">{category.description}</p>
                <div className="text-xs opacity-60">
                  存储: {formatFileSize(category.totalSize * 1024 * 1024)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 存储使用情况 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HardDrive className="mr-2 text-green-600" size={20} />
            存储使用分析
          </h3>
          <div className="space-y-4">
            {selectedResource?.resourceCategories.map((category, index) => {
              const percentage = Math.round((category.totalSize / (selectedResource.basicInfo.storageUsed || 1)) * 100);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${category.color}-500`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${category.color}-600 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="mr-2 text-purple-600" size={20} />
            资源使用统计
          </h3>
          <div className="space-y-4">
            {[
              { label: '本周访问', value: '2,456', trend: '+15%', color: 'blue' },
              { label: '下载次数', value: '1,234', trend: '+8%', color: 'green' },
              { label: '收藏数量', value: '567', trend: '+22%', color: 'purple' },
              { label: '分享次数', value: '234', trend: '+5%', color: 'amber' }
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium text-${stat.color}-600`}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2 text-amber-600" size={20} />
          最近活动
        </h3>
        <div className="space-y-4">
          {[
            { action: '上传了新的视频教程', resource: '三维建模基础.mp4', time: '2小时前', user: '张教授', type: 'upload' },
            { action: '更新了教学文档', resource: '课程大纲.pdf', time: '4小时前', user: '李老师', type: 'update' },
            { action: '添加了软件工具', resource: 'Blender 4.0', time: '6小时前', user: '王助教', type: 'add' },
            { action: '删除了过期资源', resource: '旧版教程.avi', time: '1天前', user: '系统', type: 'delete' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-2 rounded-full ${
                activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'update' ? 'bg-green-100 text-green-600' :
                activity.type === 'add' ? 'bg-purple-100 text-purple-600' :
                'bg-red-100 text-red-600'
              }`}>
                {activity.type === 'upload' ? <Upload size={16} /> :
                 activity.type === 'update' ? <Edit3 size={16} /> :
                 activity.type === 'add' ? <Plus size={16} /> :
                 <Trash2 size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user} {activity.action}
                </p>
                <p className="text-sm text-gray-600">{activity.resource}</p>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MultimediaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">多媒体资源</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            <span>上传资源</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Plus size={16} />
            <span>创建资源</span>
          </button>
        </div>
      </div>

      {/* 多媒体类型统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: '视频教程', count: 45, icon: Video, color: 'blue', size: '8.5 GB' },
          { type: '音频资料', count: 23, icon: Headphones, color: 'green', size: '1.2 GB' },
          { type: '图片素材', count: 156, icon: Image, color: 'purple', size: '2.8 GB' },
          { type: '动画演示', count: 34, icon: PlayCircle, color: 'amber', size: '3.1 GB' }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-${item.color}-100`}>
              <item.icon className={`text-${item.color}-600`} size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{item.count}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{item.type}</div>
            <div className="text-xs text-gray-500">{item.size}</div>
          </div>
        ))}
      </div>

      {/* 资源列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">多媒体资源列表</h4>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">所有类型</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
                <option value="image">图片</option>
                <option value="animation">动画</option>
              </select>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  网格
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  列表
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* 示例多媒体资源 */}
              {[
                {
                  id: '1',
                  title: '三维建模基础教程',
                  type: 'video',
                  duration: '45:32',
                  size: '256 MB',
                  thumbnail: '/api/placeholder/300/200',
                  views: 1234,
                  rating: 4.8
                },
                {
                  id: '2',
                  title: '角色绑定演示',
                  type: 'video',
                  duration: '28:15',
                  size: '189 MB',
                  thumbnail: '/api/placeholder/300/200',
                  views: 856,
                  rating: 4.6
                },
                {
                  id: '3',
                  title: '动画原理讲解',
                  type: 'audio',
                  duration: '32:45',
                  size: '45 MB',
                  thumbnail: '/api/placeholder/300/200',
                  views: 567,
                  rating: 4.7
                },
                {
                  id: '4',
                  title: '参考图片集合',
                  type: 'image',
                  duration: '50张',
                  size: '125 MB',
                  thumbnail: '/api/placeholder/300/200',
                  views: 2341,
                  rating: 4.9
                }
              ].map((resource, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resource.type === 'video' ? 'bg-blue-100 text-blue-700' :
                        resource.type === 'audio' ? 'bg-green-100 text-green-700' :
                        resource.type === 'image' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {resource.type === 'video' ? '视频' :
                         resource.type === 'audio' ? '音频' :
                         resource.type === 'image' ? '图片' : '其他'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {resource.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h5>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{resource.size}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400" size={14} />
                        <span>{resource.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{resource.views} 次观看</span>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Download size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* 列表视图 */}
            {[
              {
                title: '三维建模基础教程',
                type: 'video',
                size: '256 MB',
                duration: '45:32',
                views: 1234,
                rating: 4.8,
                uploadDate: '2024-01-20',
                uploader: '张教授'
              },
              {
                title: '角色绑定演示',
                type: 'video',
                size: '189 MB',
                duration: '28:15',
                views: 856,
                rating: 4.6,
                uploadDate: '2024-01-19',
                uploader: '李老师'
              }
            ].map((resource, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      resource.type === 'video' ? 'bg-blue-100 text-blue-600' :
                      resource.type === 'audio' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {resource.type === 'video' ? <Video size={20} /> :
                       resource.type === 'audio' ? <Headphones size={20} /> :
                       <Image size={20} />}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{resource.title}</h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{resource.size}</span>
                        <span>{resource.duration}</span>
                        <span>{resource.views} 次观看</span>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400" size={14} />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-500">
                      <div>{resource.uploadDate}</div>
                      <div>{resource.uploader}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const MaterialsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">教学材料</h3>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>添加材料</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload size={16} />
            <span>批量上传</span>
          </button>
        </div>
      </div>

      {/* 材料类型统计 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { type: '教材', count: 12, icon: BookOpen, color: 'blue' },
          { type: '讲义', count: 28, icon: FileText, color: 'green' },
          { type: '练习册', count: 15, icon: PenTool, color: 'purple' },
          { type: '案例', count: 34, icon: Briefcase, color: 'amber' },
          { type: '参考资料', count: 67, icon: Link, color: 'red' },
          { type: '手册', count: 23, icon: Settings, color: 'indigo' }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 bg-${item.color}-100`}>
              <item.icon className={`text-${item.color}-600`} size={20} />
            </div>
            <div className="text-lg font-bold text-gray-900">{item.count}</div>
            <div className="text-sm text-gray-600">{item.type}</div>
          </div>
        ))}
      </div>

      {/* 教学材料列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">教学材料列表</h4>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">所有类型</option>
                <option value="textbook">教材</option>
                <option value="handout">讲义</option>
                <option value="worksheet">练习册</option>
                <option value="case_study">案例</option>
              </select>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                <span>批量下载</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[
            {
              title: '三维动画制作教程',
              type: 'textbook',
              author: '张三',
              publisher: '清华大学出版社',
              pages: 320,
              size: '45 MB',
              language: '中文',
              isbn: '978-7-302-12345-6',
              rating: 4.8,
              downloads: 1234
            },
            {
              title: '角色建模实践指南',
              type: 'handout',
              author: '李四',
              publisher: '内部资料',
              pages: 85,
              size: '12 MB',
              language: '中文',
              isbn: '',
              rating: 4.6,
              downloads: 856
            },
            {
              title: '动画制作案例集',
              type: 'case_study',
              author: '王五',
              publisher: '电子工业出版社',
              pages: 156,
              size: '28 MB',
              language: '中文',
              isbn: '978-7-121-98765-4',
              rating: 4.9,
              downloads: 2341
            }
          ].map((material, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    material.type === 'textbook' ? 'bg-blue-100 text-blue-600' :
                    material.type === 'handout' ? 'bg-green-100 text-green-600' :
                    material.type === 'case_study' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {material.type === 'textbook' ? <BookOpen size={20} /> :
                     material.type === 'handout' ? <FileText size={20} /> :
                     material.type === 'case_study' ? <Briefcase size={20} /> :
                     <PenTool size={20} />}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-2">{material.title}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">作者:</span> {material.author}
                      </div>
                      <div>
                        <span className="text-gray-500">出版社:</span> {material.publisher}
                      </div>
                      <div>
                        <span className="text-gray-500">页数:</span> {material.pages}
                      </div>
                      <div>
                        <span className="text-gray-500">大小:</span> {material.size}
                      </div>
                      {material.isbn && (
                        <div className="col-span-2">
                          <span className="text-gray-500">ISBN:</span> {material.isbn}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400" size={14} />
                        <span>{material.rating}</span>
                      </div>
                      <span>{material.downloads} 次下载</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        material.type === 'textbook' ? 'bg-blue-100 text-blue-700' :
                        material.type === 'handout' ? 'bg-green-100 text-green-700' :
                        material.type === 'case_study' ? 'bg-amber-100 text-amber-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {material.type === 'textbook' ? '教材' :
                         material.type === 'handout' ? '讲义' :
                         material.type === 'case_study' ? '案例' : '练习'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600">
                    <Download size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600">
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

  const EquipmentTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">实验设备与工具</h3>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>添加设备</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings size={16} />
            <span>设备管理</span>
          </button>
        </div>
      </div>

      {/* 设备状态统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { status: '优秀', count: 45, color: 'green', icon: CheckCircle },
          { status: '良好', count: 32, color: 'blue', icon: CheckCircle },
          { status: '一般', count: 12, color: 'yellow', icon: AlertCircle },
          { status: '需维修', count: 3, color: 'red', icon: AlertCircle }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
              </div>
              <item.icon className={`text-${item.color}-600`} size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* 设备分类 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">设备分类</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { type: '计算机', count: 25, icon: Monitor, color: 'blue' },
            { type: '输入设备', count: 18, icon: Mouse, color: 'green' },
            { type: '显示设备', count: 12, icon: Tv, color: 'purple' },
            { type: '音响设备', count: 8, icon: Speaker, color: 'amber' },
            { type: '网络设备', count: 15, color: 'red', icon: Wifi },
            { type: '其他设备', count: 14, icon: Settings, color: 'indigo' }
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 bg-${item.color}-100`}>
                <item.icon className={`text-${item.color}-600`} size={20} />
              </div>
              <div className="text-lg font-bold text-gray-900">{item.count}</div>
              <div className="text-sm text-gray-600">{item.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 设备列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">设备清单</h4>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">所有状态</option>
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="fair">一般</option>
                <option value="needs_repair">需维修</option>
              </select>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                <span>导出清单</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">设备信息</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">型号规格</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">数量</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">状态</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">位置</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">购买日期</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  name: '高性能工作站',
                  type: 'hardware',
                  model: 'Dell Precision 7000',
                  manufacturer: 'Dell',
                  quantity: 25,
                  condition: 'excellent',
                  location: '实验室A',
                  purchaseDate: '2023-09-15',
                  warranty: '2026-09-15'
                },
                {
                  name: '专业数位板',
                  type: 'hardware',
                  model: 'Wacom Cintiq Pro 24',
                  manufacturer: 'Wacom',
                  quantity: 30,
                  condition: 'good',
                  location: '实验室B',
                  purchaseDate: '2023-08-20',
                  warranty: '2025-08-20'
                },
                {
                  name: '4K显示器',
                  type: 'hardware',
                  model: 'LG 27UP850',
                  manufacturer: 'LG',
                  quantity: 50,
                  condition: 'excellent',
                  location: '实验室A/B',
                  purchaseDate: '2023-10-10',
                  warranty: '2026-10-10'
                }
              ].map((equipment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900">{equipment.name}</p>
                      <p className="text-sm text-gray-500">{equipment.manufacturer}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{equipment.model}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{equipment.quantity}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      equipment.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                      equipment.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                      equipment.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {equipment.condition === 'excellent' ? '优秀' :
                       equipment.condition === 'good' ? '良好' :
                       equipment.condition === 'fair' ? '一般' : '需维修'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{equipment.location}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="text-gray-900">{equipment.purchaseDate}</p>
                      <p className="text-gray-500">保修至: {equipment.warranty}</p>
                    </div>
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

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* 使用统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '总访问量', value: '12,456', change: '+15%', icon: Eye, color: 'blue' },
          { title: '下载次数', value: '8,234', change: '+22%', icon: Download, color: 'green' },
          { title: '活跃用户', value: '1,567', change: '+8%', icon: Users, color: 'purple' },
          { title: '平均评分', value: '4.7', change: '+0.2', icon: Star, color: 'amber' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="flex flex-col items-end">
                <stat.icon className={`text-${stat.color}-600 mb-2`} size={24} />
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 资源使用趋势 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          资源使用趋势
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">图表区域 - 显示资源使用趋势</p>
        </div>
      </div>

      {/* 热门资源排行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="mr-2 text-amber-600" size={20} />
            热门资源排行
          </h3>
          <div className="space-y-4">
            {[
              { name: '三维建模基础教程', views: 2456, type: 'video', rating: 4.9 },
              { name: '角色动画制作指南', views: 1834, type: 'document', rating: 4.8 },
              { name: '材质贴图技巧', views: 1567, type: 'video', rating: 4.7 },
              { name: '渲染优化方法', views: 1234, type: 'document', rating: 4.6 },
              { name: '动画原理讲解', views: 987, type: 'audio', rating: 4.5 }
            ].map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{resource.views} 次观看</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400" size={12} />
                        <span>{resource.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  resource.type === 'video' ? 'bg-blue-100 text-blue-700' :
                  resource.type === 'document' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {resource.type === 'video' ? '视频' :
                   resource.type === 'document' ? '文档' : '音频'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-green-600" size={20} />
            用户活跃度
          </h3>
          <div className="space-y-4">
            {[
              { period: '今日', users: 234, sessions: 456, duration: '25分钟' },
              { period: '本周', users: 1567, sessions: 2890, duration: '32分钟' },
              { period: '本月', users: 5432, sessions: 9876, duration: '28分钟' },
              { period: '本季度', users: 12345, sessions: 23456, duration: '30分钟' }
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{stat.period}</p>
                  <p className="text-sm text-gray-500">平均时长: {stat.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stat.users}</p>
                  <p className="text-sm text-gray-500">{stat.sessions} 次访问</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">开发课程资源</h1>
        <p className="text-gray-600">管理和开发完整的课程教学资源，包括多媒体资源、教学材料、实验设备等</p>
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
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedResource?.id === resource.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{resource.courseName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(resource.status)}`}>
                      {getStatusText(resource.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{resource.courseCode}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{resource.basicInfo.totalResources} 个资源</span>
                    <span>{formatFileSize(resource.basicInfo.storageUsed * 1024 * 1024)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 新建资源按钮 */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>新建资源</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧资源详情 */}
        <div className="flex-1">
          {selectedResource ? (
            <>
              {/* 资源标题和操作 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedResource.courseName}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{selectedResource.courseCode}</span>
                      <span>•</span>
                      <span>{selectedResource.basicInfo.totalResources} 个资源</span>
                      <span>•</span>
                      <span>{formatFileSize(selectedResource.basicInfo.storageUsed * 1024 * 1024)}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedResource.status)}`}>
                        {getStatusText(selectedResource.status)}
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
                      { id: 'overview', label: '资源概览', icon: BarChart3 },
                      { id: 'multimedia', label: '多媒体资源', icon: Video },
                      { id: 'materials', label: '教学材料', icon: FileText },
                      { id: 'equipment', label: '实验设备', icon: Settings },
                      { id: 'digital', label: '数字化资源', icon: Globe },
                      { id: 'collections', label: '资源集合', icon: Package },
                      { id: 'analytics', label: '使用分析', icon: TrendingUp },
                      { id: 'settings', label: '资源设置', icon: Settings }
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
                {activeTab === 'multimedia' && <MultimediaTab />}
                {activeTab === 'materials' && <MaterialsTab />}
                {activeTab === 'equipment' && <EquipmentTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'digital' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Globe className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">数字化资源功能</h3>
                    <p className="text-gray-600">数字化资源管理功能正在开发中...</p>
                  </div>
                )}
                {activeTab === 'collections' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">资源集合功能</h3>
                    <p className="text-gray-600">资源集合管理功能正在开发中...</p>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">资源设置功能</h3>
                    <p className="text-gray-600">资源设置功能正在开发中...</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择一个课程</h3>
              <p className="text-gray-600">从左侧列表中选择一个课程来管理资源，或创建新的资源库。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseResourcesDevelopment;