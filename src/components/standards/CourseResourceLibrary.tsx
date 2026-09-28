import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  message,
  Tooltip,
  Typography,
  Statistic,
  Row,
  Col,
  Form,
  Checkbox,
  Cascader
} from 'antd';
import {
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../../lib/supabase';
import CourseResourceUpload from './CourseResourceUpload';

const { Title, Text } = Typography;

interface ResourceItem {
  id: string;
  title: string;
  development_type?: string;
  type: string;
  format: string;
  is_general_education: boolean;
  industry_field: any[];
  competency_level: any[];
  education_level: any[];
  status: string;
  created_at: string;
  file_path: string;
  file_size?: number;
  description?: string;
  tags?: string[];
  industryNames?: string[];
  competencyNames?: string[];
  educationNames?: string[];
  courseName?: string;
  standard_course_id?: string;
  core_course_id?: string;
}

const CourseResourceLibrary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [industryMap, setIndustryMap] = useState<Map<string, string>>(new Map());
  const [competencyMap, setCompetencyMap] = useState<Map<string, string>>(new Map());
  const [educationMap, setEducationMap] = useState<Map<string, string>>(new Map());
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [editForm] = Form.useForm();
  const [industryOptions, setIndustryOptions] = useState<any[]>([]);
  const [competencyOptions, setCompetencyOptions] = useState<any[]>([]);
  const [educationOptions, setEducationOptions] = useState<any[]>([]);
  const [industryData, setIndustryData] = useState<any[]>([]);
  const [competencyData, setCompetencyData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [viewingResource, setViewingResource] = useState<ResourceItem | null>(null);
  const [standardCourses, setStandardCourses] = useState<any[]>([]);
  const [coreCourses, setCoreCourses] = useState<any[]>([]);

  useEffect(() => {
    loadMappingData();
    loadCascaderData();
    loadCourses();
  }, []);

  useEffect(() => {
    if (industryMap.size > 0 && competencyMap.size > 0 && educationMap.size > 0) {
      loadResources();
    }
  }, [industryMap, competencyMap, educationMap]);

  useEffect(() => {
    filterResources();
  }, [searchText, selectedType, resources]);

  const loadMappingData = async () => {
    try {
      const [industryResult, competencyResult, educationResult] = await Promise.all([
        supabase.from('industry_categories').select('id, code, name').eq('is_deleted', false),
        supabase.from('competency_categories').select('id, code, name').eq('is_deleted', false),
        supabase.from('education_levels').select('id, name').eq('is_deleted', false).eq('status', 'published')
      ]);

      if (industryResult.data) {
        const map = new Map();
        industryResult.data.forEach(item => {
          map.set(item.id, `${item.code} ${item.name}`);
        });
        setIndustryMap(map);
      }

      if (competencyResult.data) {
        const map = new Map();
        competencyResult.data.forEach(item => {
          map.set(item.id, `${item.code} ${item.name}`);
        });
        setCompetencyMap(map);
      }

      if (educationResult.data) {
        const map = new Map();
        educationResult.data.forEach(item => {
          map.set(item.id, item.name);
        });
        setEducationMap(map);
      }
    } catch (error) {
      console.error('加载映射数据失败:', error);
    }
  };

  const buildPath = (id: string, dataArray: any[]): string[] => {
    const item = dataArray.find(d => d.id === id);
    if (!item) return [];

    if (item.parent_id) {
      return [...buildPath(item.parent_id, dataArray), item.id];
    }
    return [item.id];
  };

  const loadCascaderData = async () => {
    try {
      const [industryResult, competencyResult, educationResult] = await Promise.all([
        supabase.from('industry_categories').select('id, parent_id, name, code, level').eq('is_deleted', false).eq('status', 'active').order('code'),
        supabase.from('competency_categories').select('id, code, name, level, parent_id').eq('is_deleted', false).eq('status', 'published').order('sort_order').order('code'),
        supabase.from('education_levels').select('id, name, code').eq('is_deleted', false).eq('status', 'published').order('code')
      ]);

      if (industryResult.data && industryResult.data.length > 0) {
        setIndustryData(industryResult.data);
        const level1 = industryResult.data.filter(item => item.level === 1);
        const level2 = industryResult.data.filter(item => item.level === 2);
        const level3 = industryResult.data.filter(item => item.level === 3);

        const treeData = level1.map(l1 => ({
          value: l1.id,
          label: `${l1.code} ${l1.name}`,
          code: l1.code,
          children: level2.filter(l2 => l2.parent_id === l1.id).map(l2 => ({
            value: l2.id,
            label: `${l2.code} ${l2.name}`,
            code: l2.code,
            children: level3.filter(l3 => l3.parent_id === l2.id).map(l3 => ({
              value: l3.id,
              label: `${l3.code} ${l3.name}`,
              code: l3.code
            })).filter(children => children.length > 0 || true)
          })).filter(children => children.children && children.children.length > 0)
        }));
        setIndustryOptions(treeData);
      }

      if (competencyResult.data && competencyResult.data.length > 0) {
        setCompetencyData(competencyResult.data);
        const level1 = competencyResult.data.filter(item => item.level === 1);
        const level2 = competencyResult.data.filter(item => item.level === 2);
        const level3 = competencyResult.data.filter(item => item.level === 3);

        const treeData = level1.map(l1 => ({
          value: l1.id,
          label: `${l1.code} ${l1.name}`,
          code: l1.code,
          children: level2.filter(l2 => l2.parent_id === l1.id).map(l2 => ({
            value: l2.id,
            label: `${l2.code} ${l2.name}`,
            code: l2.code,
            children: level3.filter(l3 => l3.parent_id === l2.id).map(l3 => ({
              value: l3.id,
              label: `${l3.code} ${l3.name}`,
              code: l3.code
            })).filter(children => children.length > 0 || true)
          })).filter(children => children.children && children.children.length > 0)
        }));
        setCompetencyOptions(treeData);
      }

      if (educationResult.data && educationResult.data.length > 0) {
        setEducationData(educationResult.data);
        const options = educationResult.data.map(item => ({
          label: `${item.code} ${item.name}`,
          value: item.id
        }));
        setEducationOptions(options);
      }
    } catch (error) {
      console.error('加载级联数据失败:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const [standardCoursesResult, coreCoursesResult] = await Promise.all([
        supabase
          .from('standard_courses')
          .select('id, code, name')
          .eq('is_deleted', false)
          .order('code', { ascending: true }),
        supabase
          .from('core_courses')
          .select('id, code, name')
          .eq('is_deleted', false)
          .order('code', { ascending: true })
      ]);

      if (standardCoursesResult.data) {
        setStandardCourses(standardCoursesResult.data);
      }

      if (coreCoursesResult.data) {
        setCoreCourses(coreCoursesResult.data);
      }
    } catch (error) {
      console.error('加载课程列表失败:', error);
    }
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_resources')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load standard courses and core courses to get course names
      const [standardCoursesResult, coreCoursesResult] = await Promise.all([
        supabase
          .from('standard_courses')
          .select('id, category_code, category_name, course_names'),
        supabase
          .from('core_courses')
          .select('id, code, name')
          .eq('is_deleted', false)
      ]);

      const standardCoursesMap = new Map();
      if (standardCoursesResult.data) {
        standardCoursesResult.data.forEach(course => {
          standardCoursesMap.set(course.id, course);
        });
      }

      const coreCoursesMap = new Map();
      if (coreCoursesResult.data) {
        coreCoursesResult.data.forEach(course => {
          coreCoursesMap.set(course.id, course);
        });
      }

      if (data) {
        const formattedData: ResourceItem[] = data.map(item => {
          const { data: { publicUrl } } = supabase.storage
            .from('course-files')
            .getPublicUrl(item.file_path);

          const industryIds = Array.isArray(item.industry_field) ? item.industry_field : [];
          const competencyIds = Array.isArray(item.competency_level) ? item.competency_level : [];
          const educationIds = Array.isArray(item.education_level) ? item.education_level : [];

          // Get course name
          let courseName = item.course_name || '';

          // If course_name is empty, try to get from related course
          if (!courseName && item.standard_course_id) {
            const standardCourse = standardCoursesMap.get(item.standard_course_id);
            if (standardCourse) {
              // Use course_names array if available, otherwise use category_name
              if (standardCourse.course_names && standardCourse.course_names.length > 0) {
                courseName = standardCourse.course_names.join('、');
              } else if (standardCourse.category_name) {
                courseName = standardCourse.category_code
                  ? `${standardCourse.category_code} ${standardCourse.category_name}`
                  : standardCourse.category_name;
              }
            }
          } else if (!courseName && item.core_course_id) {
            const coreCourse = coreCoursesMap.get(item.core_course_id);
            if (coreCourse) {
              courseName = coreCourse.code ? `${coreCourse.code} - ${coreCourse.name}` : coreCourse.name;
            }
          }

          return {
            id: item.id,
            title: item.title,
            development_type: item.development_type,
            type: item.type,
            format: item.format,
            is_general_education: item.is_general_education,
            industry_field: industryIds,
            competency_level: competencyIds,
            education_level: educationIds,
            status: item.status,
            created_at: item.created_at,
            url: publicUrl,
            file_path: item.file_path,
            industryNames: industryIds.length > 0 ? [industryMap.get(industryIds[industryIds.length - 1]) || industryIds[industryIds.length - 1]].filter(Boolean) : [],
            competencyNames: competencyIds.map((id: string) => competencyMap.get(id) || id).filter(Boolean),
            educationNames: educationIds.map((id: string) => educationMap.get(id) || id).filter(Boolean),
            courseName: courseName,
            standard_course_id: item.standard_course_id,
            core_course_id: item.core_course_id
          };
        });

        setResources(formattedData);
      }
    } catch (error) {
      console.error('加载资源失败:', error);
      message.error('加载资源失败');
    } finally {
      setLoading(false);
    }
  };


  const filterResources = () => {
    let filtered = [...resources];

    if (searchText) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handlePreview = (record: ResourceItem) => {
    setViewingResource(record);
    setIsDetailVisible(true);
  };

  const getFileUrl = (filePath: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/course-files/${filePath}`;
  };

  const renderFilePreview = (resource: ResourceItem) => {
    const fileUrl = getFileUrl(resource.file_path);
    const format = resource.format?.toLowerCase();

    if (format === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          style={{ width: '100%', height: '600px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          title="PDF Preview"
        />
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(format || '')) {
      return (
        <img
          src={fileUrl}
          alt={resource.title}
          style={{ maxWidth: '100%', maxHeight: '600px', display: 'block', margin: '0 auto' }}
        />
      );
    } else if (['mp4', 'webm', 'ogg'].includes(format || '')) {
      return (
        <video
          controls
          style={{ width: '100%', maxHeight: '600px' }}
        >
          <source src={fileUrl} type={`video/${format}`} />
          您的浏览器不支持视频播放
        </video>
      );
    } else if (['mp3', 'wav', 'ogg'].includes(format || '')) {
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={fileUrl} type={`audio/${format}`} />
          您的浏览器不支持音频播放
        </audio>
      );
    } else {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">此文件格式不支持在线预览</Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => window.open(fileUrl, '_blank')}>
              下载文件
            </Button>
          </div>
        </div>
      );
    }
  };

  const handlePublish = async (id: string, currentStatus: string, isGeneralEducation: boolean) => {
    let newStatus: string;
    let actionText: string;

    if (currentStatus === 'published') {
      newStatus = 'draft';
      actionText = '取消发布';
    } else if (currentStatus === 'draft') {
      if (isGeneralEducation) {
        newStatus = 'published';
        actionText = '发布';
      } else {
        newStatus = 'submitted';
        actionText = '提交审核';
      }
    } else {
      newStatus = 'published';
      actionText = '发布';
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('course_resources')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      message.success(`${actionText}成功`);
      loadResources();
    } catch (error) {
      console.error(`${actionText}失败:`, error);
      message.error(`${actionText}失败`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: ResourceItem) => {
    setEditingResource(record);

    const industryPath = record.industry_field && record.industry_field.length > 0 && industryData.length > 0
      ? buildPath(record.industry_field[record.industry_field.length - 1], industryData)
      : [];

    const competencyPath = record.competency_level && record.competency_level.length > 0 && competencyData.length > 0
      ? buildPath(record.competency_level[record.competency_level.length - 1], competencyData)
      : [];

    editForm.setFieldsValue({
      title: record.title,
      development_type: record.development_type || undefined,
      type: record.type,
      format: record.format,
      description: record.description || '',
      is_general_education: record.is_general_education,
      standard_course_id: record.standard_course_id || undefined,
      core_course_id: record.core_course_id || undefined,
      industry_field: industryPath,
      competency_level: competencyPath,
      education_level: record.education_level || []
    });
    setIsEditVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);

      const industryField = !values.is_general_education && values.industry_field
        ? (Array.isArray(values.industry_field) ? values.industry_field : [values.industry_field])
        : null;

      const competencyLevel = values.competency_level
        ? (Array.isArray(values.competency_level) ? values.competency_level : [values.competency_level])
        : null;

      const educationLevel = values.education_level
        ? (Array.isArray(values.education_level) ? values.education_level : [values.education_level])
        : null;

      // Get course name for the selected course
      let courseName = '';
      if (values.is_general_education && values.standard_course_id) {
        const course = standardCourses.find(c => c.id === values.standard_course_id);
        if (course) {
          courseName = course.code ? `${course.code} ${course.name}` : course.name;
        }
      } else if (!values.is_general_education && values.core_course_id) {
        const course = coreCourses.find(c => c.id === values.core_course_id);
        if (course) {
          courseName = course.code ? `${course.code} ${course.name}` : course.name;
        }
      }

      const { error } = await supabase
        .from('course_resources')
        .update({
          title: values.title,
          development_type: values.development_type || null,
          type: values.type,
          format: values.format || null,
          description: values.description || null,
          is_general_education: values.is_general_education,
          standard_course_id: values.is_general_education ? (values.standard_course_id || null) : null,
          core_course_id: !values.is_general_education ? (values.core_course_id || null) : null,
          course_name: courseName || null,
          industry_field: industryField,
          competency_level: competencyLevel,
          education_level: educationLevel
        })
        .eq('id', editingResource!.id);

      if (error) throw error;

      message.success('更新成功');
      setIsEditVisible(false);
      setEditingResource(null);
      editForm.resetFields();
      loadResources();
    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: ResourceItem) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除资源 "${record.title}" 吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);

          const { error: storageError } = await supabase.storage
            .from('course-files')
            .remove([record.file_path]);

          if (storageError) {
            console.warn('Storage file deletion warning:', storageError);
          }

          const { error } = await supabase
            .from('course_resources')
            .update({ is_deleted: true })
            .eq('id', record.id);

          if (error) throw error;

          message.success('删除成功');
          loadResources();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns: ColumnsType<ResourceItem> = [
   {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
       fixed: 'left',
      render: (courseName: string, record) => {
        if (!courseName) {
          return <Tag icon={<MinusCircleOutlined />} color="default">未关联</Tag>;
        }
        return <Text>{courseName}</Text>;
      }
    },
    {
      title: '资源名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '职业领域',
      dataIndex: 'industryNames',
      key: 'industryNames',
      width: 200,
      render: (names: string[], record) => {
        if (record.is_general_education) {
          return <Tag icon={<MinusCircleOutlined />} color="default">-</Tag>;
        }
        if (!names || names.length === 0) {
          return <Tag icon={<MinusCircleOutlined />} color="default">未设置</Tag>;
        }
        return <Tag style={{ fontSize: 12 }}>{names[0]}</Tag>;
      }
    },
    {
      title: '能力等级',
      dataIndex: 'competencyNames',
      key: 'competencyNames',
      width: 270,
      render: (names: string[]) => {
        if (!names || names.length === 0) {
          return <Tag icon={<MinusCircleOutlined />} color="default">未设置</Tag>;
        }
        return (
          <Space wrap size={[0, 4]}>
            {names.slice(0, 2).map((name, index) => (
              <Tag key={index} color="purple" style={{ fontSize: 12 }}>{name}</Tag>
            ))}
            {names.length > 2 && (
              <Tooltip title={names.slice(2).join(', ')}>
                <Tag color="purple" style={{ fontSize: 12 }}>+{names.length - 2}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: '对应目标',
      dataIndex: 'educationNames',
      key: 'educationNames',
      width: 260,
      render: (names: string[]) => {
        if (!names || names.length === 0) {
          return <Tag icon={<MinusCircleOutlined />} color="default">未设置</Tag>;
        }
        return (
          <Space wrap size={[0, 4]}>
            {names.slice(0, 2).map((name, index) => (
              <Tag key={index} color="orange" style={{ fontSize: 12 }}>{name}</Tag>
            ))}
            {names.length > 2 && (
              <Tooltip title={names.slice(2).join(', ')}>
                <Tag color="orange" style={{ fontSize: 12 }}>+{names.length - 2}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: '资源类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: '资源状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          submitted: { color: 'processing', text: '已提交' },
          published: { color: 'success', text: '已发布' },
          archived: { color: 'warning', text: '已归档' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          {record.status !== 'published' && (
            <Tooltip title="编辑资源">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {record.status === 'draft' && (
            <Tooltip title={record.is_general_education ? '发布' : '提交审核'}>
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handlePublish(record.id, record.status, record.is_general_education)}
              />
            </Tooltip>
          )}
          {record.status === 'submitted' && (
            <Tooltip title="审核中">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                disabled
              />
            </Tooltip>
          )}
          {record.status === 'published' && (
            <Tooltip title="取消发布">
              <Button
                type="text"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handlePublish(record.id, record.status, record.is_general_education)}
              />
            </Tooltip>
          )}
          {record.status !== 'published' && (
            <Tooltip title="删除资源">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const stats = {
    total: resources.length,
    published: resources.filter(r => r.status === 'published').length,
    submitted: resources.filter(r => r.status === 'submitted').length,
    draft: resources.filter(r => r.status === 'draft').length,
    general: resources.filter(r => r.is_general_education).length,
    vocational: resources.filter(r => !r.is_general_education).length
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总资源数" value={stats.total} suffix="个" />
          </Col>
          <Col span={6}>
            <Statistic
              title="已发布"
              value={stats.published}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已提交"
              value={stats.submitted}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="草稿"
              value={stats.draft}
              suffix="个"
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Input
                placeholder="搜索资源名称"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                style={{ width: 150 }}
                value={selectedType}
                onChange={setSelectedType}
                options={[
                  { label: '全部类型', value: 'all' },
                  { label: '教学课件（视频）', value: '视频' },
                  { label: '教学课件（文档）', value: '文档' },
                  { label: '外链', value: '外链' }
                ]}
              />
            </Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadVisible(true)}
            >
              添加资源
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredResources}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1600 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSize: 20
            }}
          />
        </Space>
      </Card>

      <CourseResourceUpload
        visible={isUploadVisible}
        onClose={() => setIsUploadVisible(false)}
        onSuccess={() => {
          loadResources();
        }}
      />

      <Modal
        title="编辑资源信息"
        open={isEditVisible}
        onOk={handleEditSave}
        onCancel={() => {
          setIsEditVisible(false);
          setEditingResource(null);
          editForm.resetFields();
        }}
        width={800}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="资源名称"
            name="title"
            rules={[{ required: true, message: '请输入资源名称' }]}
          >
            <Input placeholder="请输入资源名称" />
          </Form.Item>

          <Form.Item
            label="开发类型"
            name="development_type"
          >
            <Select
              placeholder="请选择开发类型"
              allowClear
              options={[
                { label: '新建', value: '新建' },
                { label: '改造', value: '改造' },
                { label: '升级', value: '升级' },
                { label: '遴选', value: '遴选' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="资源类型"
            name="type"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select
              placeholder="请选择资源类型"
              options={[
                { label: '教学课件（视频）', value: '教学课件（视频）' },
                { label: '教学课件（文档）', value: '教学课件（文档）' },
                { label: '外链', value: '外链' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="文件格式"
            name="format"
          >
            <Select
              placeholder="请选择文件格式"
              options={[
                { label: 'PDF', value: 'PDF' },
                { label: 'Word', value: 'DOCX' },
                { label: 'PowerPoint', value: 'PPTX' },
                { label: 'Excel', value: 'XLSX' },
                { label: 'MP4 视频', value: 'MP4' },
                { label: 'ZIP 压缩包', value: 'ZIP' },
                { label: '其他', value: '其他' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="资源描述"
            name="description"
          >
            <Input.TextArea
              placeholder="请输入资源描述"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="is_general_education"
            valuePropName="checked"
          >
            <Checkbox>标准课程</Checkbox>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.is_general_education !== currentValues.is_general_education}>
            {({ getFieldValue }) => {
              const isGeneralEducation = getFieldValue('is_general_education');
              return isGeneralEducation ? (
                <Form.Item
                  label="课程名称"
                  name="standard_course_id"
                >
                  <Select
                    placeholder="请选择标准课程"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={standardCourses.map(course => ({
                      label: course.code ? `${course.code} ${course.name}` : course.name,
                      value: course.id
                    }))}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label="课程名称"
                  name="core_course_id"
                >
                  <Select
                    placeholder="请选择职业课程"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={coreCourses.map(course => ({
                      label: course.code ? `${course.code} ${course.name}` : course.name,
                      value: course.id
                    }))}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.is_general_education !== currentValues.is_general_education}>
            {({ getFieldValue }) => {
              const isGeneralEducation = getFieldValue('is_general_education');
              return !isGeneralEducation ? (
                <Form.Item
                  label="职业领域"
                  name="industry_field"
                  rules={[{ required: true, message: '请选择职业领域' }]}
                >
                  <Cascader
                    options={industryOptions}
                    placeholder="请选择职业领域（三级）"
                    showSearch
                    changeOnSelect={false}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            label="能力等级"
            name="competency_level"
            rules={[{ required: true, message: '请选择能力等级' }]}
          >
            <Cascader
              options={competencyOptions}
              placeholder="请选择能力等级（三级）"
              showSearch
              changeOnSelect={false}
            />
          </Form.Item>

          <Form.Item
            label="对应目标"
            name="education_level"
            rules={[{ required: true, message: '请选择对应目标' }]}
          >
            <Select
              mode="multiple"
              options={educationOptions}
              placeholder="请选择对应目标"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="资源详情"
        open={isDetailVisible}
        onCancel={() => {
          setIsDetailVisible(false);
          setViewingResource(null);
        }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailVisible(false);
            setViewingResource(null);
          }}>
            关闭
          </Button>
        ]}
      >
        {viewingResource && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text strong>资源名称：</Text>
                <Text>{viewingResource.title}</Text>
              </Col>
              <Col span={12}>
                <Text strong>开发类型：</Text>
                {viewingResource.development_type ? (
                  <Tag color={
                    viewingResource.development_type === '新建' ? 'blue' :
                    viewingResource.development_type === '改造' ? 'orange' :
                    viewingResource.development_type === '升级' ? 'green' :
                    viewingResource.development_type === '遴选' ? 'purple' : 'default'
                  }>
                    {viewingResource.development_type}
                  </Tag>
                ) : (
                  <Tag color="default">未设置</Tag>
                )}
              </Col>
              <Col span={12}>
                <Text strong>资源类型：</Text>
                <Tag>{viewingResource.type}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>文件格式：</Text>
                <Tag color="blue">{viewingResource.format}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                <Tag color={
                  viewingResource.status === 'published' ? 'success' :
                  viewingResource.status === 'submitted' ? 'processing' : 'default'
                }>
                  {viewingResource.status === 'published' ? '已发布' :
                   viewingResource.status === 'submitted' ? '已提交' : '草稿'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>课程类型：</Text>
                <Tag color={viewingResource.is_general_education ? 'blue' : 'green'}>
                  {viewingResource.is_general_education ? '标准课程' : '职业领域课'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>上传时间：</Text>
                <Text>{new Date(viewingResource.created_at).toLocaleString('zh-CN')}</Text>
              </Col>
            </Row>

            {viewingResource.courseName && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>课程名称：</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{viewingResource.courseName}</Text>
                </div>
              </div>
            )}

            {!viewingResource.is_general_education && viewingResource.industryNames && viewingResource.industryNames.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>职业领域：</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {viewingResource.industryNames.map((name, index) => (
                      <Tag key={index}>{name}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}

            {viewingResource.competencyNames && viewingResource.competencyNames.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>能力等级：</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {viewingResource.competencyNames.map((name, index) => (
                      <Tag key={index} color="purple">{name}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}

            {viewingResource.educationNames && viewingResource.educationNames.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>对应目标：</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {viewingResource.educationNames.map((name, index) => (
                      <Tag key={index} color="orange">{name}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}

            {viewingResource.description && (
              <div style={{ marginBottom: 24 }}>
                <Text strong>资源描述：</Text>
                <div style={{ marginTop: 8, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <Text>{viewingResource.description}</Text>
                </div>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>文件预览：</Text>
              {renderFilePreview(viewingResource)}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CourseResourceLibrary;
