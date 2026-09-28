import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Eye, CreditCard as Edit3, Trash2, Save, Upload, Download, Users, Clock, Target, CheckCircle, AlertCircle, BarChart3, Calendar, Award, Layers, PlayCircle, PenTool, MessageSquare, Briefcase, FlaskConical, Settings, BookOpen, Star, Zap, Database, Shield, Building, Link, RefreshCw, Copy, Timer, TrendingUp, PieChart, Activity, FileCheck, UserCheck, GraduationCap, ClipboardList, HelpCircle, CheckSquare, X, ChevronDown, ChevronRight } from 'lucide-react';
import { CourseAssessment, ExamPaper, Question, QuestionBank, AssessmentPlan } from '../../types/courseAssessment';

const CourseAssessmentDevelopment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'questions' | 'plan' | 'grades' | 'statistics' | 'settings'>('overview');
  const [assessments, setAssessments] = useState<CourseAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<CourseAssessment | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');

  // Mock data
  useEffect(() => {
    const mockAssessments: CourseAssessment[] = [
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
          totalScore: 100,
          passingScore: 60,
          duration: 120,
          attempts: 2,
          description: '三维角色动画课程考核体系'
        },
        examPapers: [
          {
            id: '1',
            title: '期中考试',
            description: '三维角色动画期中理论与实践考核',
            type: 'midterm',
            status: 'published',
            totalScore: 100,
            passingScore: 60,
            duration: 120,
            attempts: 2,
            randomize: true,
            showResults: true,
            allowReview: false,
            instructions: '请仔细阅读题目，选择最佳答案。考试时间120分钟。',
            sections: [
              {
                id: '1',
                title: '基础理论',
                description: '三维动画基础理论知识',
                order: 1,
                totalScore: 40,
                questionCount: 20,
                instructions: '单选题，每题2分',
                questions: []
              },
              {
                id: '2',
                title: '实践应用',
                description: '软件操作和实践应用',
                order: 2,
                totalScore: 60,
                questionCount: 15,
                instructions: '多选题和判断题',
                questions: []
              }
            ],
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20',
            createdBy: '张教授'
          }
        ],
        questionBank: {
          id: '1',
          name: '三维角色动画题库',
          description: '包含理论知识和实践操作题目',
          categories: [],
          totalQuestions: 150,
          questionsByType: {
            single_choice: 80,
            multiple_choice: 30,
            true_false: 25,
            fill_blank: 10,
            short_answer: 5,
            essay: 0
          },
          questionsByDifficulty: {
            easy: 60,
            medium: 70,
            hard: 20
          }
        },
        assessmentPlan: {
          id: '1',
          name: '综合考核方案',
          description: '包含平时成绩、期中考试、期末考试等多个组件',
          components: [
            {
              id: '1',
              name: '平时成绩',
              type: 'participation',
              weight: 20,
              description: '课堂参与、作业完成情况',
              maxScore: 100,
              requirements: ['按时出勤', '积极参与讨论', '按时提交作业']
            },
            {
              id: '2',
              name: '期中考试',
              type: 'exam',
              weight: 30,
              description: '理论知识和基础技能考核',
              maxScore: 100,
              requirements: ['掌握基础理论', '熟悉软件操作']
            },
            {
              id: '3',
              name: '期末项目',
              type: 'project',
              weight: 50,
              description: '综合项目作品评估',
              maxScore: 100,
              requirements: ['完整作品', '技术报告', '答辩展示']
            }
          ],
          totalWeight: 100,
          passingCriteria: {
            minimumScore: 60,
            requiredComponents: ['期中考试', '期末项目'],
            additionalRequirements: ['出勤率不低于80%']
          },
          gradingScale: [
            { grade: 'A', minScore: 90, maxScore: 100, description: '优秀', gpa: 4.0 },
            { grade: 'B', minScore: 80, maxScore: 89, description: '良好', gpa: 3.0 },
            { grade: 'C', minScore: 70, maxScore: 79, description: '中等', gpa: 2.0 },
            { grade: 'D', minScore: 60, maxScore: 69, description: '及格', gpa: 1.0 },
            { grade: 'F', minScore: 0, maxScore: 59, description: '不及格', gpa: 0.0 }
          ]
        },
        gradeManagement: {
          students: [],
          statistics: {
            totalStudents: 30,
            passedStudents: 26,
            failedStudents: 4,
            passRate: 86.7,
            averageScore: 78.5,
            medianScore: 80,
            standardDeviation: 12.3,
            gradeDistribution: {
              'A': 8,
              'B': 12,
              'C': 6,
              'D': 2,
              'F': 2
            }
          },
          reports: []
        },
        statistics: {
          overview: {
            totalPapers: 3,
            totalQuestions: 150,
            totalAttempts: 90,
            averageScore: 78.5,
            passRate: 86.7
          },
          questionAnalysis: [],
          paperAnalysis: [],
          difficultyAnalysis: {
            easy: { count: 60, averageCorrectRate: 85.2 },
            medium: { count: 70, averageCorrectRate: 72.8 },
            hard: { count: 20, averageCorrectRate: 58.3 }
          },
          timeAnalysis: {
            averageCompletionTime: 95,
            timeDistribution: {
              '0-60分钟': 5,
              '60-90分钟': 15,
              '90-120分钟': 8,
              '超时': 2
            },
            timeoutRate: 6.7
          }
        }
      }
    ];
    setAssessments(mockAssessments);
    setSelectedAssessment(mockAssessments[0]);
  }, []);

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assessment.status === filterStatus;
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

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'single_choice': return '单选题';
      case 'multiple_choice': return '多选题';
      case 'true_false': return '判断题';
      case 'fill_blank': return '填空题';
      case 'short_answer': return '简答题';
      case 'essay': return '论述题';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '试卷总数', value: '12', change: '+3', icon: FileText, color: 'blue' },
          { title: '题库题目', value: '450', change: '+25', icon: HelpCircle, color: 'green' },
          { title: '考试场次', value: '36', change: '+8', icon: Timer, color: 'purple' },
          { title: '通过率', value: '87%', change: '+5%', icon: TrendingUp, color: 'amber' }
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

      {/* 考核方案概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="mr-2 text-blue-600" size={20} />
            成绩构成分布
          </h3>
          <div className="space-y-4">
            {selectedAssessment?.assessmentPlan.components.map((component, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    component.type === 'exam' ? 'bg-blue-500' :
                    component.type === 'project' ? 'bg-green-500' :
                    component.type === 'participation' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{component.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${component.weight}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{component.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-green-600" size={20} />
            成绩分布统计
          </h3>
          <div className="space-y-4">
            {Object.entries(selectedAssessment?.gradeManagement.statistics.gradeDistribution || {}).map(([grade, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    grade === 'A' ? 'bg-green-100 text-green-700' :
                    grade === 'B' ? 'bg-blue-100 text-blue-700' :
                    grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                    grade === 'D' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {grade}
                  </span>
                  <span className="text-sm text-gray-600">{count} 人</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        grade === 'A' ? 'bg-green-600' :
                        grade === 'B' ? 'bg-blue-600' :
                        grade === 'C' ? 'bg-yellow-600' :
                        grade === 'D' ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${(count / (selectedAssessment?.gradeManagement.statistics.totalStudents || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round((count / (selectedAssessment?.gradeManagement.statistics.totalStudents || 1)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 题型分布 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="mr-2 text-purple-600" size={20} />
          题库题型分布
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(selectedAssessment?.questionBank.questionsByType || {}).map(([type, count], index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{getQuestionTypeText(type)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PapersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">试卷管理</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>创建试卷</span>
        </button>
      </div>

      {/* 试卷列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">试卷列表</h4>
            <div className="flex items-center space-x-2">
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
        
        <div className="divide-y divide-gray-100">
          {selectedAssessment?.examPapers.map((paper, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">{paper.title}</h5>
                  <p className="text-gray-600 mt-1">{paper.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(paper.status)}`}>
                    {getStatusText(paper.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    paper.type === 'midterm' ? 'bg-blue-100 text-blue-700' :
                    paper.type === 'final' ? 'bg-red-100 text-red-700' :
                    paper.type === 'quiz' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {paper.type === 'midterm' ? '期中考试' :
                     paper.type === 'final' ? '期末考试' :
                     paper.type === 'quiz' ? '随堂测验' :
                     paper.type === 'practice' ? '练习测试' : '补考'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target size={16} />
                  <span>总分: {paper.totalScore}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Timer size={16} />
                  <span>时长: {paper.duration}分钟</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <RefreshCw size={16} />
                  <span>尝试: {paper.attempts}次</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Layers size={16} />
                  <span>题目: {paper.sections.reduce((sum, section) => sum + section.questionCount, 0)}题</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>创建时间: {paper.createdAt}</span>
                  <span>创建者: {paper.createdBy}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPaper(paper)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 试卷详情 */}
      {selectedPaper && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">试卷详情: {selectedPaper.title}</h4>
            <button
              onClick={() => setSelectedPaper(null)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedPaper.totalScore}</div>
                <div className="text-sm text-blue-700">总分</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedPaper.duration}</div>
                <div className="text-sm text-green-700">分钟</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{selectedPaper.attempts}</div>
                <div className="text-sm text-purple-700">尝试次数</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {selectedPaper.sections.reduce((sum, section) => sum + section.questionCount, 0)}
                </div>
                <div className="text-sm text-amber-700">题目数</div>
              </div>
            </div>

            {/* 试卷结构 */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">试卷结构</h5>
              <div className="space-y-3">
                {selectedPaper.sections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-semibold text-gray-900">{section.title}</h6>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{section.questionCount} 题</span>
                        <span>{section.totalScore} 分</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                    <p className="text-sm text-gray-500">{section.instructions}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 考试设置 */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">考试设置</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className={`${selectedPaper.randomize ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                    <span className="text-sm text-gray-700">随机出题</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className={`${selectedPaper.showResults ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                    <span className="text-sm text-gray-700">显示结果</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className={`${selectedPaper.allowReview ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                    <span className="text-sm text-gray-700">允许查看答案</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>及格分数: {selectedPaper.passingScore}分</div>
                  <div>考试时长: {selectedPaper.duration}分钟</div>
                  <div>允许尝试: {selectedPaper.attempts}次</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const QuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">题库管理</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowQuestionModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>添加题目</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload size={16} />
            <span>批量导入</span>
          </button>
        </div>
      </div>

      {/* 题库统计 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(selectedAssessment?.questionBank.questionsByType || {}).map(([type, count], index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
            <div className="text-sm text-gray-600">{getQuestionTypeText(type)}</div>
          </div>
        ))}
      </div>

      {/* 难度分布 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">难度分布</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(selectedAssessment?.questionBank.questionsByDifficulty || {}).map(([difficulty, count], index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                difficulty === 'easy' ? 'bg-green-100' :
                difficulty === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  difficulty === 'easy' ? 'text-green-600' :
                  difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {count}
                </span>
              </div>
              <div className={`text-sm font-medium ${
                difficulty === 'easy' ? 'text-green-700' :
                difficulty === 'medium' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {getDifficultyText(difficulty)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 题目列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">题目列表</h4>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">所有类型</option>
                <option value="single_choice">单选题</option>
                <option value="multiple_choice">多选题</option>
                <option value="true_false">判断题</option>
                <option value="fill_blank">填空题</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">所有难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* 示例题目 */}
          {[
            {
              id: '1',
              type: 'single_choice',
              content: '在三维动画制作中，关键帧动画的主要特点是什么？',
              difficulty: 'medium',
              score: 2,
              category: '基础理论',
              correctRate: 78.5,
              usageCount: 45
            },
            {
              id: '2',
              type: 'multiple_choice',
              content: '以下哪些软件可以用于三维角色建模？（多选）',
              difficulty: 'easy',
              score: 3,
              category: '软件操作',
              correctRate: 85.2,
              usageCount: 52
            },
            {
              id: '3',
              type: 'true_false',
              content: '在角色绑定过程中，骨骼系统必须完全对称。',
              difficulty: 'hard',
              score: 2,
              category: '高级技术',
              correctRate: 62.3,
              usageCount: 38
            }
          ].map((question, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      question.type === 'single_choice' ? 'bg-blue-100 text-blue-700' :
                      question.type === 'multiple_choice' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {getQuestionTypeText(question.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyText(question.difficulty)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {question.category}
                    </span>
                    <span className="text-sm text-gray-500">{question.score}分</span>
                  </div>
                  <p className="text-gray-900 font-medium">{question.content}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>使用次数: {question.usageCount}</span>
                  <span>正确率: {question.correctRate}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        question.correctRate >= 80 ? 'bg-green-600' :
                        question.correctRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${question.correctRate}%` }}
                    ></div>
                  </div>
                  <span>{question.correctRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StatisticsTab = () => (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '总考试次数', value: '156', icon: Activity, color: 'blue' },
          { title: '平均分', value: '78.5', icon: Target, color: 'green' },
          { title: '通过率', value: '87%', icon: TrendingUp, color: 'purple' },
          { title: '平均用时', value: '95分钟', icon: Timer, color: 'amber' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`text-${stat.color}-600`} size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* 难度分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 text-blue-600" size={20} />
          题目难度分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(selectedAssessment?.statistics.difficultyAnalysis || {}).map(([difficulty, data], index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${
                  difficulty === 'easy' ? 'text-green-700' :
                  difficulty === 'medium' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {getDifficultyText(difficulty)}题目
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(difficulty)}`}>
                  {data.count}题
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">平均正确率:</span>
                  <span className="font-medium">{data.averageCorrectRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      difficulty === 'easy' ? 'bg-green-600' :
                      difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${data.averageCorrectRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 时间分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2 text-purple-600" size={20} />
          考试时间分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">时间分布</h4>
            <div className="space-y-3">
              {Object.entries(selectedAssessment?.statistics.timeAnalysis.timeDistribution || {}).map(([timeRange, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{timeRange}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / 30) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}人</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">时间统计</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">平均完成时间:</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedAssessment?.statistics.timeAnalysis.averageCompletionTime}分钟
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">超时率:</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedAssessment?.statistics.timeAnalysis.timeoutRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">建议时长:</span>
                <span className="text-sm font-medium text-gray-900">120分钟</span>
              </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">制定课程考核</h1>
        <p className="text-gray-600">创建和管理课程考核体系，包含试卷管理、题库建设、成绩统计等功能</p>
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
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  onClick={() => setSelectedAssessment(assessment)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedAssessment?.id === assessment.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{assessment.courseName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assessment.status)}`}>
                      {getStatusText(assessment.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{assessment.courseCode}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{assessment.examPapers.length} 份试卷</span>
                    <span>{assessment.questionBank.totalQuestions} 道题目</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 新建考核按钮 */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>新建考核</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧考核详情 */}
        <div className="flex-1">
          {selectedAssessment ? (
            <>
              {/* 考核标题和操作 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssessment.courseName}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{selectedAssessment.courseCode}</span>
                      <span>•</span>
                      <span>总分: {selectedAssessment.basicInfo.totalScore}</span>
                      <span>•</span>
                      <span>及格: {selectedAssessment.basicInfo.passingScore}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedAssessment.status)}`}>
                        {getStatusText(selectedAssessment.status)}
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
                      { id: 'overview', label: '考核概览', icon: BarChart3 },
                      { id: 'papers', label: '试卷管理', icon: FileText },
                      { id: 'questions', label: '题库管理', icon: HelpCircle },
                      { id: 'plan', label: '考核方案', icon: Target },
                      { id: 'grades', label: '成绩管理', icon: GraduationCap },
                      { id: 'statistics', label: '统计分析', icon: TrendingUp },
                      { id: 'settings', label: '考核设置', icon: Settings }
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
                {activeTab === 'papers' && <PapersTab />}
                {activeTab === 'questions' && <QuestionsTab />}
                {activeTab === 'statistics' && <StatisticsTab />}
                {activeTab === 'plan' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Target className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">考核方案功能</h3>
                    <p className="text-gray-600">考核方案设计功能正在开发中...</p>
                  </div>
                )}
                {activeTab === 'grades' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">成绩管理功能</h3>
                    <p className="text-gray-600">成绩管理功能正在开发中...</p>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">考核设置功能</h3>
                    <p className="text-gray-600">考核设置功能正在开发中...</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileCheck className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择一个课程</h3>
              <p className="text-gray-600">从左侧列表中选择一个课程来管理考核，或创建新的考核体系。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAssessmentDevelopment;