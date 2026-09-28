import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Tag, Space, Button, message, Row, Col, Card, Typography, Tooltip, Cascader } from 'antd';
import { SearchOutlined, FileTextOutlined, BookOutlined, VideoCameraOutlined, LinkOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CascaderProps } from 'antd';
import { supabase } from '../../lib/supabase';

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

const ResourceLibraryModal: React.FC<ResourceLibraryModalProps> = ({
  visible,
  onCancel,
  onSelect,
  selectedResourceIds = [],
  multiple = false,
  courseId
}) => {
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
      loadResources();
      loadCompetencyCategories();
      loadEducationLevels();
      loadIndustryCategories();
      setSelectedRowKeys([]);
    }
  }, [visible, courseId]);

  const loadResources = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('course_resources')
        .select('*')
        .eq('is_deleted', false);

      if (courseId) {
        query = query.eq('standard_course_id', courseId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setResources(data || []);
    } catch (error) {
      console.error('加载资源失败:', error);
      message.error('加载资源失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCompetencyCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('competency_categories')
        .select('*')
        .eq('status', 'published')
        .eq('is_deleted', false)
        .order('sort_order');

      if (error) throw error;

      if (data) {
        const buildTree = (parentId: string | null = null): any[] => {
          return data
            .filter(item => item.parent_id === parentId)
            .map(item => ({
              label: item.name,
              value: item.id,
              children: buildTree(item.id)
            }))
            .filter(item => item.children.length > 0 || item.value);
        };

        setCompetencyOptions(buildTree(null));
      }
    } catch (error) {
      console.error('加载能力等级失败:', error);
    }
  };

  const loadEducationLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('education_levels')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at');

      if (error) throw error;

      if (data) {
        const options = data.map(item => ({
          label: item.name,
          value: item.id
        }));
        setEducationLevelOptions(options);
      }
    } catch (error) {
      console.error('加载对应目标失败:', error);
    }
  };

  const loadIndustryCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_categories')
        .select('*')
        .eq('is_deleted', false)
        .order('sort_order');

      if (error) throw error;

      if (data) {
        const buildTree = (parentId: string | null = null): any[] => {
          return data
            .filter(item => item.parent_id === parentId)
            .map(item => ({
              label: item.name,
              value: item.id,
              children: buildTree(item.id)
            }))
            .filter(item => item.children.length > 0 || item.value);
        };

        setIndustryOptions(buildTree(null));
      }
    } catch (error) {
      console.error('加载职业领域失败:', error);
    }
  };

  const getCompetencyName = (id: string): string => {
    const findInTree = (options: any[]): string | null => {
      for (const option of options) {
        if (option.value === id) return option.label;
        if (option.children) {
          const found = findInTree(option.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(competencyOptions) || id;
  };

  const getEducationLevelName = (id: string): string => {
    const option = educationLevelOptions.find(opt => opt.value === id);
    return option ? option.label : id;
  };

  const getIndustryName = (id: string): string => {
    const findInTree = (options: any[]): string | null => {
      for (const option of options) {
        if (option.value === id) return option.label;
        if (option.children) {
          const found = findInTree(option.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(industryOptions) || id;
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
    switch (type) {
      case '教材':
        return 'blue';
      case '教学课件':
        return 'green';
      case '实训指导书':
        return 'orange';
      case '典型案例库':
        return 'purple';
      case '在线学习模块':
        return 'cyan';
      case '虚拟仿真软件':
        return 'magenta';
      case '外链':
        return 'geekblue';
      default:
        return 'default';
    }
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

  const columns: ColumnsType<ResourceItem> = [
    {
      title: '资源名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      fixed: 'left',
      render: (text: string, record: ResourceItem) => (
        <Space size={4}>
          {getTypeIcon(record.type)}
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
          <Tooltip title="预览资源">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer', fontSize: '14px' }}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewResource(record);
                setPreviewVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '资源类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => (
        <Tag color={getTypeColor(type)} style={{ fontSize: '12px' }}>{type}</Tag>
      ),
    },
    {
      title: '文件格式',
      dataIndex: 'format',
      key: 'format',
      width: 85,
      render: (format?: string) => (
        format ? <Tag>{format}</Tag> : <Text type="secondary">-</Text>
      ),
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

    const selectedResources = resources.filter(r => selectedRowKeys.includes(r.id));
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
              共 <Text strong style={{ color: '#1890ff' }}>{filteredResources.length}</Text> 个资源
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="middle"
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="全部类型"
                  size="middle"
                >
                  <Option value="all">全部类型</Option>
                  <Option value="教材">教材（纸质或数字）</Option>
                  <Option value="教学课件">教学课件（PPT、视频）</Option>
                  <Option value="实训指导书">实训指导书</Option>
                  <Option value="典型案例库">典型案例库</Option>
                  <Option value="在线学习模块">在线学习模块</Option>
                  <Option value="虚拟仿真软件">虚拟仿真软件</Option>
                  <Option value="外链">外链</Option>
                  <Option value="其他">其他资源</Option>
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
          dataSource={filteredResources}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
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
          previewResource?.file_path && (
            <Button
              key="open"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => {
                if (previewResource?.file_path) {
                  window.open(previewResource.file_path, '_blank');
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
                  <Text>{previewResource.title}</Text>
                </div>
                <div>
                  <Text strong>资源类型：</Text>
                  <Tag color={getTypeColor(previewResource.type)}>{previewResource.type}</Tag>
                </div>
                {previewResource.development_type && (
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
                )}
                <div>
                  <Text strong>类别：</Text>
                  <Tag color={previewResource.is_general_education ? 'blue' : 'green'}>
                    {previewResource.is_general_education ? '通识' : '专业'}
                  </Tag>
                </div>
                {previewResource.description && (
                  <div>
                    <Text strong>描述：</Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                      <Text>{previewResource.description}</Text>
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
                    <Text copyable>{previewResource.file_path}</Text>
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
