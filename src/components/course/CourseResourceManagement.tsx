import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Row,
  Col,
  message,
  Tooltip,
  Badge,
  Statistic,
  Divider,
  Upload,
  Modal,
  Form,
  Spin,
  Popconfirm,
  Empty,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FolderOpenOutlined,
  BookOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  FileOutlined,
  DownloadOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd';
import { ChevronRight } from 'lucide-react';
import { getStandardCourseList, getOneAbilityCareerCourseList, getTwoAbilityCareerCourseList, getResourceTypeStatistics, getCourseResourcePage, removeResource, saveOrUpdateResource, updateDownloadNum } from '@/api/course';
import { describe } from 'node:test';
import { useDict } from '@/hooks/useDict';
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;
import { postResourceGetBylds } from '@/api/course-standards';
import UploadDraggerFile from '@/components/UploadDraggerFile';
import { UploadData } from '@/hooks/useOssUpload';
import { getResourceFormatByType, getResourceTypeByFile } from '@/utils';
import { use } from 'i18next';
import { CourseType } from '@/pages/course-standards/standard-course-development';

interface StandardCourse {
  id: string;
  category_code: string;
  category_name: string;
  course_names: string[];
  target_objectives?: string;
  implementation_standards?: string[];
  status: string;
  competency_level1_name?: string;
  competency_level2_name?: string;
  standard_name?: string;
  standard_code?: string;
  resource_type_statistics?: any;
}

interface CourseResourceManagementProps {
  onNavigate?: (item: any) => void;
  courseType: CourseType;
  onBack?: () => void;
  title?: string;
}

const RESOURCE_TYPES = [
  { code: 'video', value: '1', label: '视频', color: 'blue' },
  { code: 'document', value: '2', label: '文档', color: 'green' },
  { code: 'audio', value: '3', label: '音频', color: 'orange' },
  { code: 'image', value: '4', label: '图片', color: 'cyan' },
  { code: 'ppt', value: '5', label: '课件', color: 'purple' },
  { code: 'other', value: '6', label: '其他', color: 'default' },
];

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  "0": { text: '', color: 'default' },
  "1": { text: '', color: 'processing' },
  "2": { text: '', color: 'success' },
};

function formatFileSize(bytes: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getResourceTypeIcon(type: any) {
  const icons: Record<string, React.ReactNode> = {
    "1": <VideoCameraOutlined style={{ color: '#1677ff' }} />,
    "2": <FileTextOutlined style={{ color: '#52c41a' }} />,
    "3": <AudioOutlined style={{ color: '#fa8c16' }} />,
    "4": <FileImageOutlined style={{ color: '#13c2c2' }} />,
    "5": <FilePdfOutlined style={{ color: '#722ed1' }} />,
    "6": <FileOutlined style={{ color: '#8c8c8c' }} />,
  };
  return icons[type] || icons.other;
}

const CourseResourceManagement: React.FC<CourseResourceManagementProps> = ({ title, courseType, onBack }) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedCourse, setSelectedCourse] = useState<StandardCourse | null>(null);

  return view === 'list' ? (
    <CourseListView
      title={title}
      onBack={onBack}
      courseType={courseType}
      onEnterDetail={(course) => {
        setSelectedCourse(course);
        setView('detail');
      }}
    />
  ) : (
    <CourseResourceDetail
      course={selectedCourse!}
      onBack={() => {
        setView('list');
        setSelectedCourse(null);
      }}
    />
  );
};

// ─── List View ───────────────────────────────────────────────────────────────
const CourseListView: React.FC<{ title: string, courseType: CourseType, onBack?: any, onEnterDetail: (c: StandardCourse) => void }> = ({ title, courseType, onBack, onEnterDetail }) => {
  const [pagingSearch, setPagingSearch] = useState<any>({ courseType: courseType, size: 10, current: 1, keyword: '', courseStatus: '', contentStatus: '' });
  const [loading, setLoading] = useState(true);
  const [tabledata, setTableData] = useState<StandardCourse[]>([]);
  const [filtered, setFiltered] = useState<StandardCourse[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchStandard, setSearchStandard] = useState('');
  const [eduLevelMap, setEduLevelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourses();
  }, [pagingSearch]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let data = {};
      if (courseType == 1 || courseType == 4) {
        data = await getStandardCourseList(pagingSearch);
      }
      else if (courseType == 2) {
        data = await getTwoAbilityCareerCourseList(pagingSearch);
      }
      else if (courseType == 3) {
        data = await getOneAbilityCareerCourseList(pagingSearch);
      }
      //调用接口整合数据
      const statRequest = (data.records || []).map((r: any) => getResourceTypeStatistics({ courseId: r.id }));
      Promise.all(statRequest).then(res => {
        const processedData = (data.records || []).map((item: any, index: number) => ({
          ...item,
          resource_type_statistics: res[index]//请注意返回的数据结果是个map对象，根据资源类型分组汇总的数据，例如{1:10,2:2,3:5,4:2}
        }));
        setTableData({ ...data, records: processedData });
      });
    } catch (e: any) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<StandardCourse> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'course_names',
      width: 220,
      // render: (names: string[], record) => (
      //   <div>
      //     {(names || []).length > 0 ? (
      //       <div className="space-y-1">
      //         {(names || []).slice(0, 3).map((n, i) => (
      //           <div key={i}>
      //             <Text className="text-sm font-medium text-gray-800">{n}</Text>
      //           </div>
      //         ))}
      //         {(names || []).length > 3 && (
      //           <Text type="secondary" className="text-xs">+{(names || []).length - 3} 门课程</Text>
      //         )}
      //       </div>
      //     ) : (
      //       <Text type="secondary" className="text-sm">{record.category_name}</Text>
      //     )}
      //   </div>
      // ),
    },
    {
      title: '能力目标',
      key: 'competency',
      dataIndex: 'abilityName',
      width: 200,
      //   render: (_, record) => (
      //     <div className="space-y-1">
      //       {record.target_objectives ? (
      //         <Paragraph
      //           ellipsis={{ rows: 2, tooltip: record.target_objectives }}
      //           className="text-sm text-gray-600 mb-0"
      //           style={{ marginBottom: 0 }}
      //         >
      //           {record.target_objectives}
      //         </Paragraph>
      //       ) : (
      //         <div className="flex flex-col gap-1">
      //           {record.competency_level1_name && (
      //             <Tag color="blue" style={{ fontSize: 11 }}>{record.competency_level1_name}</Tag>
      //           )}
      //           {record.competency_level2_name && (
      //             <Tag color="cyan" style={{ fontSize: 11 }}>{record.competency_level2_name}</Tag>
      //           )}
      //           {!record.competency_level1_name && !record.competency_level2_name && (
      //             <Text type="secondary" className="text-sm">-</Text>
      //           )}
      //         </div>
      //       )}
      //     </div>
      //   ),
    },
    {
      title: '执行标准',
      key: 'standards',
      dataIndex: 'levelName',
      width: 180,
      // render: (_, record) => {
      //   const standards = record.implementation_standards || [];
      //   return standards.length > 0 ? (
      //     <div className="flex flex-wrap gap-1">
      //       {standards.slice(0, 3).map((s, i) => (
      //         <Tag key={i} color="geekblue" style={{ fontSize: 11, margin: 0 }}>
      //           {eduLevelMap[s] || s}
      //         </Tag>
      //       ))}
      //       {standards.length > 3 && (
      //         <Tag style={{ fontSize: 11 }}>+{standards.length - 3}</Tag>
      //       )}
      //     </div>
      //   ) : (
      //     <Text type="secondary" className="text-sm">-</Text>
      //   );
      // },
    },
    {
      title: '资源数量',
      dataIndex: 'resource_count',
      key: 'resource_count',
      width: 100,
      align: 'center',
      render: (count: number, record) => {
        let resource_count = 0;
        // 由于 resource_type_statistics 是一个 map 对象，我们需要遍历它的值来求和
        const stats = record?.resource_type_statistics || {};
        if (stats && typeof stats === 'object') {
          resource_count = Object.values(stats).reduce((sum: number, value: any) => sum + Number(value), 0);
        }

        //汇总资源数量  
        return (<Badge
          count={resource_count}  // 使用计算后的总数而不是原始 count
          showZero
          style={{
            backgroundColor: resource_count > 0 ? '#1677ff' : '#d9d9d9',
            fontSize: 12,
          }}
        />)
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="资源管理">
          <Button
            type="primary"
            size="small"
            icon={<AppstoreOutlined />}
            onClick={() => onEnterDetail(record)}
            style={{ borderRadius: 6 }}
          />
        </Tooltip>
      ),
    },
  ];

  const totalResources = filtered.reduce((s, r) => s + (r.resource_count || 0), 0);

  return (
    <div style={{ padding: '0px 32px 48px', minHeight: '100vh' }}>
      {onBack && (
        <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 8 }}>
            返回
          </Button>
          <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>{title || '课程学习资源'}</Title>
        </div>
      )}
      {/* Search */}
      <Card
        bordered={false}
        className="mb-5 shadow-sm"
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={10}>
            <div className="mb-1">
              <Text type="secondary" className="text-xs">课程名称</Text>
            </div>
            <Search
              placeholder="搜索课程名称..."
              value={pagingSearch.keyword}
              onChange={(e) => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
              onSearch={(value) => setPagingSearch((prev: any) => ({ ...prev, keyword: value, current: 1 }))}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={4}>
            <div className="mb-1 invisible">
              <Text className="text-xs">操作</Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setPagingSearch((prev: any) => ({ ...prev, keyword: '', current: 1 }))
              }}
              style={{ width: '100%', borderRadius: 8 }}
            >
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        className="shadow-sm"
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={tabledata.records}
          columns={columns}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${tabledata.total} 条记录`,
            total: tabledata.total,
            current: pagingSearch.current,
            defaultPageSize: 10,
            onChange: (page, pageSize) => {
              if (pageSize !== pagingSearch.size) {
                setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
              } else {
                setPagingSearch((prev: any) => ({ ...prev, current: page }))
              }
            }
          }}
          scroll={{ x: 820 }}
          locale={{
            emptyText: (
              !loading && <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-400">
                    {searchName || searchStandard ? '暂无匹配课程' : '暂无已发布课程'}
                  </span>
                }
              />
            ),
          }}
          rowClassName="hover:bg-blue-50 transition-colors"
          style={{ borderRadius: 10, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

// ─── Detail View ──────────────────────────────────────────────────────────────
const CourseResourceDetail: React.FC<{
  course: StandardCourse;
  onBack: () => void;
}> = ({ course, onBack }) => {
  const [pagingSearch, setPagingSearch] = useState<any>({ courseId: course.id, size: 10, current: 1, keyword: null, resourceType: null, status: null, isStorage: null });
  const [tableData, setTableData] = useState({} as any);
  const [statisticsData, setStatisticsData] = useState({} as any);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadResIDs, setUploadResIDs] = useState<string>('');
  //字典
  const { getLabel, formatOptions } = useDict([
    'course_resource_type', 'resource_status'
  ]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [eduLevelMap, setEduLevelMap] = useState<Record<string, string>>({});
  const [uploadResourceType, setUploadResourceType] = useState<string>('1');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [previewResource, setPreviewResource] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchResources();
  }, [course.id, pagingSearch]);

  // useEffect(() => {
  //   applyFilters();
  // }, [resources, searchText, filterType, filterStatus]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getCourseResourcePage(pagingSearch);
      setTableData(data || []);
      fetchResourceStatistics();
    } catch {
      message.error('加载资源失败');
    } finally {
      setLoading(false);
    }
  };
  const fetchResourceStatistics = async () => {
    setLoading(true);
    try {
      const data = await getResourceTypeStatistics({ courseId: course.id });
      setStatisticsData(data || []);
    } catch {
      message.error('加载资源统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.warning('请选择要上传的文件');
        return;
      }

      setUploading(true);
      setUploadProgress(10);
      setUploadProgress(30);

      setUploadProgress(70);

      const apiData = {
        courseId: course.id,
        resourceName: values.title,
        resourceType: values.type,
        resourceFformat: fileList[0].extensionName,
        resourceSize: fileList[0].size,
        remark: values.description,
        isStorage: 0,
        resourceFile: uploadResIDs,
        resourceDownloadNum: 0,
      }
      await saveOrUpdateResource(apiData);
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setAddModalOpen(false);
        form.resetFields();
        setFileList([]);
        setUploadResIDs('');
        fetchResources();
        message.success('资源上传成功');
      }, 500);
    } catch (e: any) {
      setUploading(false);
      setUploadProgress(0);
      if (e.errorFields) return;
      message.error('上传失败：' + (e.message || '未知错误'));
    }
  };

  const handleEditSave = async () => {
    if (!editingResource) return;
    try {
      const values = await editForm.validateFields();
      const apiData = {
        resourceName: values.title,
        remark: values.description,
        resourceType: values.type,
        status: values.status,
      };
      await saveOrUpdateResource({ id: editingResource.id, ...apiData });
      message.success('保存成功');
      setEditModalOpen(false);
      setEditingResource(null);
      fetchResources();
    } catch (e: any) {
      if (e.errorFields) return;
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeResource({ id });
      message.success('删除成功');
      fetchResources();
    } catch {
      message.error('删除失败');
    }
  };

  const onDownload = (record: any) => {
    postResourceGetBylds([record.resourceFile]).then((data: any) => {
      if (data && data.length > 0) {
        const url = (data[0].signUrl);
        if (url) {
          window.open(url, '_blank');
          //记录下载次数
          updateDownloadNum({ id: record.id }).then(() => {

          }).catch((error: any) => {
            message.error(error.message);
          }).finally(() => {

          });
        }
      }
    }).catch((error: any) => {
      message.error(error.message);
    }).finally(() => {

    });

  }
  const openView = (record: any) => {
    postResourceGetBylds([record.resourceFile]).then((data: any) => {
      if (data && data.length > 0) {
        setPreviewResource({ ...data[0], ...record });
        setPreviewModalOpen(true);
      }
    }).catch((error: any) => {
      message.error(error.message);
    }).finally(() => {

    });

  }

  const openEdit = (record: any) => {
    setEditingResource(record);
    editForm.setFieldsValue({
      title: record.resourceName,
      type: record.resourceType,
      description: record.remark,
      status: record.status,
    });
    setEditModalOpen(true);
  };

  const countByType = (type: string) => {
    switch (type) {
      case 'video':
        return statisticsData['1'] || 0;
      case 'document':
        return statisticsData['2'] || 0;
      case 'audio':
        return statisticsData['3'] || 0;
      case 'image':
        return statisticsData['4'] || 0;
      case 'ppt':
        return statisticsData['5'] || 0;
      case 'other':
        return statisticsData['6'] || 0;
      default:
        return 0;
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '资源名称',
      dataIndex: 'resourceName',
      key: 'title',
      width: 220,
      render: (title, record) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getResourceTypeIcon(record.resourceType)}</span>
          <div>
            <Text strong className="text-sm text-gray-800 block leading-tight">{title}</Text>
            <Text type="secondary" className="text-xs">{(record.format || '').toUpperCase()}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'resourceType',
      key: 'type',
      width: 90,
      render: (type: string) => {
        const t = RESOURCE_TYPES.find(t => t.value === type);
        return <Tag color={t?.color || 'default'} style={{ borderRadius: 12 }}>{t?.label || type}</Tag>;
      },
    },
    {
      title: '文件大小',
      dataIndex: 'resourceSize',
      key: 'file_size',
      width: 100,
      align: 'right',
      render: (size: number) => (
        <Text type="secondary" className="text-xs">{formatFileSize(size)}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (status: string) => {
        const s = STATUS_MAP[status] || { text: '', color: 'default' };
        return <Badge status={s.color as any} text={getLabel('resource_status', status)} />;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'created_at',
      width: 150,
      render: (val: string) => (
        <Text type="secondary" className="text-xs">
          {val ? new Date(val).toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }) : '-'}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="预览">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                openView(record);
              }}
              style={{ color: '#1677ff' }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => onDownload(record)}
              style={{ color: '#fa8c16' }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'published' ? '已发布资源不可删除' : '删除'}>
            <Popconfirm
              title="确定删除该资源？"
              description="删除后不可恢复"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              disabled={record.status === 'published'}
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                disabled={record.status === 'published'}
                style={{ color: record.status === 'published' ? '#d9d9d9' : '#ff4d4f' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const courseTitle = (course?.courseName);
  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType =
      /*[
        // PDF
        'application/pdf',
        // Word文档
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // PPT演示文稿
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Excel表格
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // 视频
        'video/mp4',
        'video/x-msvideo',
        'video/quicktime',
        // 音频
        'audio/mpeg',
        'audio/wav',
        // 图片
        'image/jpeg',
        'image/png',
        'image/gif',
        // 压缩包
        'application/zip']
        */
      getResourceTypeByFile(file.type) == uploadResourceType;
    if (!isAllowedType) {
      message.error(`仅支持 ${getResourceFormatByType(uploadResourceType).map(a => a.toUpperCase()).join(',')} 格式的文件`);
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 200;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 200MB');
      return false;
    }
    return isAllowedType && isLt10M;
  };
  const handleUploaded_BusinessLicense = (data: UploadData[]) => {
    console.log('上传完成，返回：', data);
    if (data.length > 0 && data[0].file.size > 0) {
      setFileList(data.map((item: any) => ({ id: item.resourceId, url: item.Location, name: item.file.name, type: item.file.type, size: item.file.size })));
      setUploadResIDs(data.map(item => item.resourceId).join(','));
    }
  };

  return (
    <div className="p-6">
      {/* Back + Header */}
      <div className="mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="mb-3 px-0 text-gray-500 hover:text-blue-500"
        >
          返回课程列表
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <Title level={4} style={{ margin: 0 }}>{courseTitle}</Title>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              form.setFieldValue('type', uploadResourceType);
              setFileList([]);
              setUploadResIDs('');
              setAddModalOpen(true);
            }}
            style={{ borderRadius: 8 }}
          >
            上传资源
          </Button>
        </div>
      </div>

      {/* Type stats */}
      <Row gutter={12} className="mb-5">
        {RESOURCE_TYPES.map(t => (
          <Col key={t.value} xs={12} sm={8} md={4}>
            <Card
              bordered={false}
              className="shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '12px 8px' }}
              onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
              style={{
                borderRadius: 10,
                border: filterType === t.value ? `2px solid #1677ff` : '1px solid #f0f0f0',
              }}
            >
              <div className="text-2xl mb-1">{getResourceTypeIcon(t.value)}</div>
              <div className="text-lg font-bold text-gray-800">{countByType(t.code)}</div>
              <Text type="secondary" className="text-xs">{t.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        bordered={false}
        className="mb-5 shadow-sm"
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: '14px 20px' }}
      >
        <Row gutter={12} align="middle">
          <Col xs={24} sm={9}>
            <Search
              placeholder="搜索资源名称或描述..."
              value={pagingSearch.keyword}
              onChange={e => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="资源类型"
              value={pagingSearch.resourceType}
              onChange={v => setPagingSearch((prev: any) => ({ ...prev, resourceType: v, current: 1 }))}
              allowClear
              style={{ width: '100%', borderRadius: 8 }}
            >
              {RESOURCE_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="状态"
              value={pagingSearch.status}
              onChange={v => setPagingSearch((prev: any) => ({ ...prev, status: v, current: 1 }))}
              allowClear
              style={{ width: '100%', borderRadius: 8 }}
              options={formatOptions('resource_status')}
            >
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setPagingSearch((prev: any) => ({ ...prev, keyword: null, resourceType: null, status: null, current: 1 }))
              }}
              style={{ width: '100%', borderRadius: 8 }}
            >
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        className="shadow-sm"
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: 0 }}
        title={
          <div className="flex items-center justify-between px-4 pt-2">
            <Space>
              <Text strong>资源列表</Text>
              <Tag color="blue">{tableData.total} 个</Tag>
            </Space>
          </div>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={tableData.records}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${tableData.total} 个资源`,
            style: { padding: '12px 20px' },
            defaultPageSize: 10,
            current: pagingSearch.current,
            onChange: (page, pageSize) => {
              if (pageSize !== pagingSearch.size) {
                setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
              } else {
                setPagingSearch((prev: any) => ({ ...prev, current: page }))
              }
            }
          }}
          scroll={{ x: 900 }}
          locale={{ emptyText: !loading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无资源，点击上方「上传资源」添加" /> }}
          rowClassName="hover:bg-blue-50 transition-colors"
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloudUploadOutlined style={{ color: '#1677ff' }} />
            <span>上传学习资源</span>
          </div>
        }
        open={addModalOpen}
        onCancel={() => {
          if (!uploading) {
            setAddModalOpen(false);
            form.resetFields();
            setFileList([]);
            setUploadResIDs('');
          }
        }}
        footer={null}
        width={560}
        maskClosable={!uploading}
        style={{ top: 80 }}
        destroyOnHidden={true}
      >
        <Divider style={{ margin: '12px 0' }} />
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="资源标题"
            rules={[{ required: true, message: '请输入资源标题' }]}
          >
            <Input placeholder="请输入资源标题" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="type" label="资源类型">
            <Select placeholder="自动识别，也可手动指定" style={{ borderRadius: 8 }}
              options={formatOptions('course_resource_type')}
              onChange={(value) => setUploadResourceType(value)}
            >
            </Select>
          </Form.Item>
          <Form.Item name="description" label="资源描述">
            <TextArea
              placeholder="简要描述资源内容..."
              rows={3}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item label="上传文件" required>
            <UploadDraggerFile
              name="file"
              accept={getResourceFormatByType(uploadResourceType).join(',')}
              maxCount={1}
              multiple={false}
              beforeUpload={beforeUpload}
              onUploaded={handleUploaded_BusinessLicense}
              uploadResIDs={uploadResIDs}
              onRemove={() => { setFileList([]); setUploadResIDs(''); }}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#1677ff', fontSize: 40 }} />
              </p>
              <p className="text-sm font-medium text-gray-700">点击或拖拽文件到此区域</p>
              <p className="text-xs text-gray-400 mt-1">
                支持 {getResourceFormatByType(uploadResourceType).map(a => a.toUpperCase()).join(',')} 格式，单文件不超过 200MB
              </p>
            </UploadDraggerFile>
          </Form.Item>

          {uploading && (
            <div className="mb-4">
              <Text type="secondary" className="text-xs mb-2 block">正在上传...</Text>
              <Progress percent={uploadProgress} strokeColor="#1677ff" size="small" />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                if (!uploading) {
                  setAddModalOpen(false);
                  form.resetFields();
                  setFileList([]);
                  setUploadResIDs('');
                }
              }}
              disabled={uploading}
              style={{ borderRadius: 8 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              icon={uploading ? <Spin size="small" /> : <UploadOutlined />}
              onClick={handleUpload}
              loading={uploading}
              style={{ borderRadius: 8 }}
            >
              {uploading ? '上传中...' : '确认上传'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined style={{ color: '#52c41a' }} />
            <span>编辑资源信息</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingResource(null);
        }}
        footer={null}
        width={480}
        style={{ top: 80 }}
      >
        <Divider style={{ margin: '12px 0' }} />
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="资源标题"
            rules={[{ required: true, message: '请输入资源标题' }]}
          >
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="type" label="资源类型" rules={[{ required: true }]}>
            <Select style={{ borderRadius: 8 }} options={formatOptions('course_resource_type')}>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select style={{ borderRadius: 8 }} options={formatOptions('resource_status')}>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="资源描述">
            <TextArea rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                setEditingResource(null);
              }}
              style={{ borderRadius: 8 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleEditSave}
              style={{ borderRadius: 8 }}
            >
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined style={{ color: '#1677ff' }} />
            <span>{previewResource?.title || '资源预览'}</span>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => {
          setPreviewModalOpen(false);
          setPreviewResource(null);
        }}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => {
              onDownload(previewResource);
            }}
          >
            下载
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
        style={{ top: 60 }}
      >
        {previewResource && (
          <div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">类型</Text>
                  <div className="font-medium text-gray-800">
                    {getResourceTypeIcon(previewResource.resourceType)} {RESOURCE_TYPES.find(a => a.value == previewResource.resourceType)?.label}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">文件大小</Text>
                  <div className="font-medium text-gray-800">{formatFileSize(previewResource.resourceSize)}</div>
                </Col>
                <Col span={12} className="mt-3">
                  <Text type="secondary" className="text-xs">状态</Text>
                  <div>
                    <Badge
                      status={(STATUS_MAP[previewResource.status]?.color || 'default') as any}
                      text={getLabel('resource_status', previewResource.status)}
                    />
                  </div>
                </Col>
                <Col span={12} className="mt-3">
                  <Text type="secondary" className="text-xs">下载次数</Text>
                  <div className="font-medium text-gray-800">{previewResource.resourceDownloadNum || 0}</div>
                </Col>
              </Row>
              {previewResource.remark && (
                <div className="mt-3">
                  <Text type="secondary" className="text-xs">描述</Text>
                  <div className="text-sm text-gray-700 mt-1">{previewResource.remark}</div>
                </div>
              )}
            </div>

            {/* File preview */}
            {(() => {
              const url = (previewResource.signUrl);
              const fmt = (previewResource.resourceType || '').toLowerCase();
              if (previewResource.resourceType == 4) {
                return (
                  <div className="text-center border rounded-xl overflow-hidden bg-gray-50 p-4">
                    <img src={url} alt={previewResource.resourceName} className="max-w-full max-h-80 object-contain mx-auto" />
                  </div>
                );
              }
              if (previewResource.resourceType == 1) {
                return (
                  <div className="border rounded-xl overflow-hidden bg-black">
                    <video src={url} controls className="w-full max-h-64" />
                  </div>
                );
              }
              if (previewResource.resourceType == 3) {
                return (
                  <div className="border rounded-xl p-4 text-center bg-gray-50">
                    <AudioOutlined style={{ fontSize: 40, color: '#fa8c16' }} />
                    <div className="mt-3">
                      <audio src={url} controls className="w-full" />
                    </div>
                  </div>
                );
              }
              if (fmt === 'pdf') {
                return (
                  <div className="border rounded-xl overflow-hidden" style={{ height: 400 }}>
                    <iframe src={url} className="w-full h-full" title={previewResource.resourceName} />
                  </div>
                );
              }
              return (
                <div className="text-center py-8 border rounded-xl bg-gray-50">
                  <div className="text-5xl mb-3">{getResourceTypeIcon(previewResource.type)}</div>
                  <Text type="secondary">该格式暂不支持在线预览</Text>
                  <div className="mt-3">
                    <Button type="primary" icon={<DownloadOutlined />} onClick={() =>
                      onDownload(previewResource)}>
                      点击下载查看
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div >
  );
};

export default CourseResourceManagement;
