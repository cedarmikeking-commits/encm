import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Space, Button, Card, Tag, Checkbox, message, Tabs, Tooltip, Badge, Empty } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, DeleteOutlined, FileTextOutlined, VideoCameraOutlined, BookOutlined, FolderOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../../lib/supabase';

const { Search } = Input;
const { Option } = Select;

interface CourseResource {
  id: string;
  title: string;
  type: string;
  format: string;
  file_path: string;
  file_size: number;
  description: string;
  tags: string[];
  is_general_education: boolean;
  industry_field: any;
  competency_level: any;
  education_level: any;
  download_count: number;
  uploader: string;
  status: string;
  created_at: string;
}

interface SelectedResource extends CourseResource {
  resource_category: string;
  is_required: boolean;
  notes: string;
}

interface CourseStandardResourceSelectionProps {
  visible: boolean;
  onClose: () => void;
  courseStandard: {
    id: string;
    course_name: string;
    course_code: string;
    industry_field?: any;
  };
}

const CourseStandardResourceSelection: React.FC<CourseStandardResourceSelectionProps> = ({
  visible,
  onClose,
  courseStandard,
}) => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [existingResources, setExistingResources] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    if (visible) {
      fetchResources();
      fetchExistingResources();
    }
  }, [visible, courseStandard.id]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_resources')
        .select('*')
        .eq('status', 'published')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('获取资源失败:', error);
      message.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingResources = async () => {
    try {
      const { data, error } = await supabase
        .from('course_standard_resources')
        .select('resource_id')
        .eq('course_standard_id', courseStandard.id);

      if (error) throw error;
      setExistingResources(data?.map(item => item.resource_id) || []);
    } catch (error) {
      console.error('获取已添加资源失败:', error);
    }
  };

  const handleAddResource = (resource: CourseResource, category: string = '其他') => {
    if (selectedResources.find(r => r.id === resource.id)) {
      message.warning('该资源已添加到选择列表');
      return;
    }

    if (existingResources.includes(resource.id)) {
      message.warning('该资源已添加到课程标准中');
      return;
    }

    const newResource: SelectedResource = {
      ...resource,
      resource_category: category,
      is_required: false,
      notes: '',
    };

    setSelectedResources([...selectedResources, newResource]);
    message.success('已添加到选择列表');
  };

  const handleRemoveResource = (resourceId: string) => {
    setSelectedResources(selectedResources.filter(r => r.id !== resourceId));
  };

  const handleUpdateResourceConfig = (resourceId: string, field: string, value: any) => {
    setSelectedResources(selectedResources.map(r =>
      r.id === resourceId ? { ...r, [field]: value } : r
    ));
  };

  const handleSave = async () => {
    if (selectedResources.length === 0) {
      message.warning('请至少选择一个资源');
      return;
    }

    setLoading(true);
    try {
      const insertData = selectedResources.map((resource, index) => ({
        course_standard_id: courseStandard.id,
        resource_id: resource.id,
        resource_category: resource.resource_category,
        is_required: resource.is_required,
        notes: resource.notes,
        sort_order: index,
        added_by: 'System',
      }));

      const { error } = await supabase
        .from('course_standard_resources')
        .insert(insertData);

      if (error) throw error;

      message.success(`成功添加 ${selectedResources.length} 个资源`);
      setSelectedResources([]);
      onClose();
    } catch (error) {
      console.error('保存资源关联失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case '视频': return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
      case '文档': return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case '教材': return <BookOutlined style={{ color: '#fa8c16' }} />;
      default: return <FolderOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredResources = resources.filter(resource => {
    const matchSearch = !searchText ||
      resource.title.toLowerCase().includes(searchText.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchType = filterType === 'all' || resource.type === filterType;

    return matchSearch && matchType;
  });

  const resourceColumns: ColumnsType<CourseResource> = [
    {
      title: '资源信息',
      key: 'info',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space>
            {getResourceIcon(record.type)}
            <span className="font-medium">{record.title}</span>
          </Space>
          <div className="text-xs text-gray-500">
            {record.description && record.description.length > 50
              ? `${record.description.slice(0, 50)}...`
              : record.description}
          </div>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80,
      render: (format) => <Tag>{format}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 90,
      render: (size) => <span className="text-gray-600">{formatFileSize(size)}</span>,
    },
    {
      title: '下载量',
      dataIndex: 'download_count',
      key: 'download_count',
      width: 80,
      align: 'center',
      render: (count) => <Badge count={count} showZero color="green" />,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags && tags.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="purple" style={{ fontSize: '11px', margin: 0 }}>
              {tag}
            </Tag>
          ))}
          {tags && tags.length > 2 && <span className="text-xs text-gray-400">+{tags.length - 2}</span>}
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {existingResources.includes(record.id) ? (
            <Tag icon={<CheckCircleOutlined />} color="success">已添加</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">未添加</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isSelected = selectedResources.find(r => r.id === record.id);
        const isExisting = existingResources.includes(record.id);

        return (
          <Select
            placeholder="添加为"
            style={{ width: 150 }}
            disabled={isExisting || !!isSelected}
            onChange={(value) => handleAddResource(record, value)}
          >
            <Option value="教材">教材</Option>
            <Option value="参考书">参考书</Option>
            <Option value="视频">视频</Option>
            <Option value="课件">课件</Option>
            <Option value="案例">案例</Option>
            <Option value="习题">习题</Option>
            <Option value="实验指导">实验指导</Option>
            <Option value="其他">其他</Option>
          </Select>
        );
      },
    },
  ];

  const selectedColumns: ColumnsType<SelectedResource> = [
    {
      title: '资源名称',
      key: 'title',
      width: 250,
      render: (_, record) => (
        <Space>
          {getResourceIcon(record.type)}
          <span>{record.title}</span>
        </Space>
      ),
    },
    {
      title: '资源类别',
      dataIndex: 'resource_category',
      key: 'resource_category',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.resource_category}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateResourceConfig(record.id, 'resource_category', value)}
        >
          <Option value="教材">教材</Option>
          <Option value="参考书">参考书</Option>
          <Option value="视频">视频</Option>
          <Option value="课件">课件</Option>
          <Option value="案例">案例</Option>
          <Option value="习题">习题</Option>
          <Option value="实验指导">实验指导</Option>
          <Option value="其他">其他</Option>
        </Select>
      ),
    },
    {
      title: '是否必选',
      dataIndex: 'is_required',
      key: 'is_required',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Checkbox
          checked={record.is_required}
          onChange={(e) => handleUpdateResourceConfig(record.id, 'is_required', e.target.checked)}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      render: (_, record) => (
        <Input.TextArea
          value={record.notes}
          placeholder="输入备注..."
          autoSize={{ minRows: 1, maxRows: 2 }}
          onChange={(e) => handleUpdateResourceConfig(record.id, 'notes', e.target.value)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveResource(record.id)}
        >
          移除
        </Button>
      ),
    },
  ];

  const BrowseTab = (
    <div className="space-y-4">
      <Card size="small">
        <Space wrap>
          <Search
            placeholder="搜索资源名称或描述..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="资源类型"
            style={{ width: 150 }}
            value={filterType}
            onChange={setFilterType}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">全部类型</Option>
            <Option value="视频">视频</Option>
            <Option value="文档">文档</Option>
            <Option value="教材">教材</Option>
            <Option value="课件">课件</Option>
          </Select>
          <div className="text-gray-500">
            共 {filteredResources.length} 个资源
          </div>
        </Space>
      </Card>

      <Table
        columns={resourceColumns}
        dataSource={filteredResources}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <Empty
              description="暂无可用资源"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    </div>
  );

  const SelectedTab = (
    <div className="space-y-4">
      <Card size="small">
        <Space>
          <Badge count={selectedResources.length} showZero>
            <span className="text-gray-700">已选择资源</span>
          </Badge>
          {selectedResources.length > 0 && (
            <Button
              size="small"
              danger
              onClick={() => setSelectedResources([])}
            >
              清空选择
            </Button>
          )}
        </Space>
      </Card>

      {selectedResources.length === 0 ? (
        <Empty
          description="还没有选择任何资源"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={selectedColumns}
          dataSource={selectedResources}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
        />
      )}
    </div>
  );

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold">为课程标准添加资源</div>
          <div className="text-sm text-gray-500 font-normal mt-1">
            {courseStandard.course_name} ({courseStandard.course_code})
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1400}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSave}
          disabled={selectedResources.length === 0}
        >
          确定添加 {selectedResources.length > 0 && `(${selectedResources.length})`}
        </Button>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'browse',
            label: (
              <span>
                <SearchOutlined />
                浏览资源库
              </span>
            ),
            children: BrowseTab,
          },
          {
            key: 'selected',
            label: (
              <Badge count={selectedResources.length} offset={[10, 0]}>
                <span>
                  <CheckCircleOutlined />
                  已选资源
                </span>
              </Badge>
            ),
            children: SelectedTab,
          },
        ]}
      />
    </Modal>
  );
};

export default CourseStandardResourceSelection;
