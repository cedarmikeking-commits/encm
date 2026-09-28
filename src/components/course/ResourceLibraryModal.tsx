import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Tag, Space, Button, message, Row, Col, Card, Typography, Tooltip, Cascader } from 'antd';
import { SearchOutlined, FileTextOutlined, BookOutlined, VideoCameraOutlined, LinkOutlined, CloseCircleOutlined, EyeOutlined, AudioOutlined, FileImageOutlined, FilePdfOutlined, FileOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CascaderProps } from 'antd';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface ResourceItem {
  id: string;
  title: string;
  development_type?: string;
  type: string;
  format?: string;
  description?: string;
  is_general_education: boolean;
  industry_field?: string[];
  competency_level?: string[];
  education_level?: string[];
  status: string;
  created_at: string;
  file_path?: string;
}

interface ResourceLibraryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (resources: ResourceItem[]) => void;
  selectedResourceIds?: string[];
  multiple?: boolean;
  courseId?: string;
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
import { getCourseResourcePage } from '@/api/course';
import { useDict } from '@/hooks/useDict';
import { postResourceGetBylds } from '@/api/course-standards';
const ResourceLibraryModal: React.FC<ResourceLibraryModalProps> = ({
  visible,
  onCancel,
  onSelect,
  selectedResourceIds = [],
  multiple = false,
  courseId
}) => {
  const { getLabel, formatOptions } = useDict([
    'knowledge_point_difficulty', 'course_resource_type'
  ]);
  const [pagingSearch, setPagingSearch] = useState<any>({ courseId: courseId, size: 10, current: 1, keyword: null, resourceType: null, status: null, isStorage: null });
  const [tableData, setTableData] = useState({} as any);

  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDevelopmentType, setFilterDevelopmentType] = useState<string>('all');
  const [filterCompetencyLevel, setFilterCompetencyLevel] = useState<(string | number)[][]>([]);
  const [filterEducationLevel, setFilterEducationLevel] = useState<string[]>([]);
  const [filterIndustryField, setFilterIndustryField] = useState<(string | number)[][]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [competencyOptions, setCompetencyOptions] = useState<any[]>([]);
  const [educationLevelOptions, setEducationLevelOptions] = useState<any[]>([]);
  const [industryOptions, setIndustryOptions] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      fetchResources();
      setSelectedRowKeys([]);
    }
  }, [visible, courseId]);


  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getCourseResourcePage(pagingSearch);
      setTableData(data || []);
    } catch {
      message.error('加载资源失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesDevelopmentType = filterDevelopmentType === 'all' || item.development_type === filterDevelopmentType;

    const matchesCompetencyLevel = filterCompetencyLevel.length === 0 ||
      filterCompetencyLevel.some(cascadePath => {
        const selectedId = cascadePath[cascadePath.length - 1];
        return item.competency_level && item.competency_level.includes(String(selectedId));
      });

    const matchesEducationLevel = filterEducationLevel.length === 0 ||
      (item.education_level && filterEducationLevel.some(level => item.education_level?.includes(level)));

    const matchesIndustryField = filterIndustryField.length === 0 ||
      filterIndustryField.some(cascadePath => {
        const selectedId = cascadePath[cascadePath.length - 1];
        return item.industry_field && item.industry_field.includes(String(selectedId));
      });

    return matchesSearch && matchesType && matchesDevelopmentType &&
      matchesCompetencyLevel && matchesEducationLevel && matchesIndustryField;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '教材':
        return <BookOutlined />;
      case '教学课件':
        return <FileTextOutlined />;
      case '视频':
        return <VideoCameraOutlined />;
      case '外链':
        return <LinkOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    const t = RESOURCE_TYPES.find(t => t.value === type);
    return <Tag color={t?.color || 'default'} style={{ borderRadius: 12 }}>{t?.label || type}</Tag>;
  };

  const getDevelopmentTypeColor = (type?: string) => {
    switch (type) {
      case '新建':
        return 'green';
      case '改造':
        return 'orange';
      case '升级':
        return 'blue';
      case '遴选':
        return 'purple';
      default:
        return 'default';
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
            <Tooltip title="预览资源">
              <EyeOutlined
                style={{ color: '#1890ff', cursor: 'pointer', fontSize: '14px' }}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const data = await postResourceGetBylds([record.resourceFile])
                    if (data && data.length > 0) {
                      setPreviewResource({ ...data[0], ...record });
                      setPreviewVisible(true);
                    }
                  }
                  catch (error: any) {
                    message.error(error.message);
                  }
                }}
              />
            </Tooltip>
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
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      if (multiple) {
        setSelectedRowKeys(keys as string[]);
      } else {
        setSelectedRowKeys(keys.slice(-1) as string[]);
      }
    },
    type: multiple ? 'checkbox' : 'radio' as 'checkbox' | 'radio',
  };

  const handleConfirm = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择资源');
      return;
    }

    const selectedResources = tableData.records.filter(r => selectedRowKeys.includes(r.id));
    onSelect(selectedResources);
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedRowKeys([]);
    setSearchText('');
    setFilterType('all');
    setFilterDevelopmentType('all');
    setFilterCompetencyLevel([]);
    setFilterEducationLevel([]);
    setFilterIndustryField([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: '16px', fontWeight: 600 }}>
          <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          从资源库中选择资源
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1400}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Text type="secondary">
              共 <Text strong style={{ color: '#1890ff' }}>{tableData.total}</Text> 个资源
            </Text>
            {selectedRowKeys.length > 0 && (
              <>
                <Text type="secondary">|</Text>
                <Text type="secondary">
                  已选择 <Text strong style={{ color: '#52c41a' }}>{selectedRowKeys.length}</Text> 个
                </Text>
              </>
            )}
          </Space>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={selectedRowKeys.length === 0}
            >
              确定选择{selectedRowKeys.length > 0 && ` (${selectedRowKeys.length})`}
            </Button>
          </Space>
        </div>
      }
      style={{ top: 20 }}
      styles={{
        body: { padding: '16px 24px' }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{
          background: '#fafafa',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f0f0f0'
        }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={12}>
              <Col span={8}>
                <Search
                  placeholder="搜索资源名称"
                  allowClear
                  value={pagingSearch.keyword}
                  onChange={e => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
                  size="middle"
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="全部类型"
                  size="middle"
                  value={pagingSearch.resourceType}
                  onChange={v => setPagingSearch((prev: any) => ({ ...prev, resourceType: v, current: 1 }))}
                  options={formatOptions('course_resource_type')}
                >
                </Select>
              </Col>

            </Row>
          </Space>
        </div>

        {selectedRowKeys.length > 0 && (
          <div style={{
            padding: '8px 12px',
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#0050b3' }}>
              已选择 <Text strong style={{ color: '#0050b3' }}>{selectedRowKeys.length}</Text> 个资源
            </Text>
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => setSelectedRowKeys([])}
              style={{ color: '#0050b3' }}
            >
              清空选择
            </Button>
          </div>
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableData.records || []}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            current: pagingSearch.current,
            showSizeChanger: true,
            showTotal: (total) => `共 ${tableData.total} 个资源`,
            style: { padding: '12px 20px' },
            defaultPageSize: 10,
            onChange: (page, pageSize) => {
              if (pageSize !== pagingSearch.size) {
                setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
              } else {
                setPagingSearch((prev: any) => ({ ...prev, current: page }))
              }
            }
          }}
          scroll={{ y: 450 }}
          rowClassName={(record) =>
            selectedRowKeys.includes(record.id) ? 'selected-row' : ''
          }
          style={{
            '--selected-row-bg': '#f0f5ff',
            '--selected-row-hover-bg': '#e6f0ff'
          } as React.CSSProperties}
        />
      </Space>

      <Modal
        title="资源预览"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewResource(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setPreviewVisible(false);
            setPreviewResource(null);
          }}>
            关闭
          </Button>,
          previewResource?.signUrl && (
            <Button
              key="open"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => {
                if (previewResource?.signUrl) {
                  window.open(previewResource.signUrl, '_blank');
                }
              }}
            >
              在新窗口打开
            </Button>
          )
        ]}
        width={800}
      >
        {previewResource && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" title="基本信息">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>资源名称：</Text>
                  <Text>{previewResource.resourceName}</Text>
                </div>
                <div>
                  <Text strong>资源类型：</Text>
                  {getTypeColor(previewResource.resourceType)}
                </div>
                {/* {previewResource.development_type && (
                  <div>
                    <Text strong>开发类型：</Text>
                    <Tag color={getDevelopmentTypeColor(previewResource.development_type)}>
                      {previewResource.development_type}
                    </Tag>
                  </div>
                )}
                {previewResource.format && (
                  <div>
                    <Text strong>文件格式：</Text>
                    <Tag>{previewResource.format}</Tag>
                  </div>
                )} */}
                {/* <div>
                  <Text strong>类别：</Text>
                  <Tag color={previewResource.is_general_education ? 'blue' : 'green'}>
                    {previewResource.is_general_education ? '通识' : '专业'}
                  </Tag>
                </div> */}
                {previewResource.remark && (
                  <div>
                    <Text strong>描述：</Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                      <Text>{previewResource.remark}</Text>
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            {previewResource.file_path && (
              <Card size="small" title="资源链接">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    wordBreak: 'break-all'
                  }}>
                    <Text copyable>{previewResource.signUrl}</Text>
                  </div>
                  {previewResource.type === '外链' && (
                    <div style={{ marginTop: 12 }}>
                      <iframe
                        src={previewResource.file_path}
                        style={{ width: '100%', height: 400, border: '1px solid #d9d9d9', borderRadius: 4 }}
                        title="资源预览"
                      />
                    </div>
                  )}
                </Space>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </Modal>
  );
};

export default ResourceLibraryModal;
