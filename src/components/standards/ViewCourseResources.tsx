import React, { useState, useEffect } from 'react';
import { Modal, Table, Space, Tag, Button, message, Empty, Popconfirm, Tooltip } from 'antd';
import { FileTextOutlined, VideoCameraOutlined, BookOutlined, FolderOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../../lib/supabase';

interface CourseResource {
  id: string;
  title: string;
  type: string;
  format: string;
  file_path: string;
  file_size: number;
  description: string;
  tags: string[];
  download_count: number;
}

interface CourseStandardResource {
  id: string;
  resource_id: string;
  resource_category: string;
  is_required: boolean;
  notes: string;
  sort_order: number;
  added_at: string;
  course_resources: CourseResource;
}

interface ViewCourseResourcesProps {
  visible: boolean;
  onClose: () => void;
  courseStandard: {
    id: string;
    course_name: string;
    course_code: string;
  };
}

const ViewCourseResources: React.FC<ViewCourseResourcesProps> = ({
  visible,
  onClose,
  courseStandard,
}) => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<CourseStandardResource[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState<CourseResource | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (visible) {
      fetchResources();
    }
  }, [visible, courseStandard.id]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_standard_resources')
        .select(`
          id,
          resource_id,
          resource_category,
          is_required,
          notes,
          sort_order,
          added_at,
          course_resources (
            id,
            title,
            type,
            format,
            file_path,
            file_size,
            description,
            tags,
            download_count
          )
        `)
        .eq('course_standard_id', courseStandard.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('获取课程资源失败:', error);
      message.error('获取课程资源失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_standard_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      message.success('删除成功');
      fetchResources();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
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

  const handlePreview = async (resource: CourseResource) => {
    try {
      const { data, error } = await supabase.storage
        .from('course_files')
        .createSignedUrl(resource.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        setPreviewResource(resource);
        setPreviewUrl(data.signedUrl);
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error('获取预览链接失败:', error);
      message.error('无法预览该资源');
    }
  };

  const handleDownload = async (resource: CourseResource) => {
    try {
      const { data, error } = await supabase.storage
        .from('course_files')
        .createSignedUrl(resource.file_path, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await supabase
          .from('course_resources')
          .update({ download_count: (resource.download_count || 0) + 1 })
          .eq('id', resource.id);

        message.success('开始下载');
      }
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败，请重试');
    }
  };

  const canPreview = (format: string) => {
    const previewableFormats = ['PDF', 'JPG', 'JPEG', 'PNG', 'GIF', 'MP4', 'WEBM', 'TXT'];
    return previewableFormats.includes(format.toUpperCase());
  };

  const renderPreviewContent = () => {
    if (!previewResource || !previewUrl) return null;

    const format = previewResource.format.toUpperCase();

    if (format === 'PDF') {
      return (
        <iframe
          src={previewUrl}
          style={{ width: '100%', height: '70vh', border: 'none' }}
          title="PDF预览"
        />
      );
    }

    if (['JPG', 'JPEG', 'PNG', 'GIF'].includes(format)) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img
            src={previewUrl}
            alt={previewResource.title}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
      );
    }

    if (['MP4', 'WEBM'].includes(format)) {
      return (
        <video
          controls
          style={{ width: '100%', maxHeight: '70vh' }}
          src={previewUrl}
        >
          您的浏览器不支持视频播放
        </video>
      );
    }

    if (format === 'TXT') {
      return (
        <iframe
          src={previewUrl}
          style={{ width: '100%', height: '70vh', border: 'none' }}
          title="文本预览"
        />
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>该文件格式不支持在线预览</p>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(previewResource)}>
          下载文件
        </Button>
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '教材': 'red',
      '参考书': 'orange',
      '视频': 'blue',
      '课件': 'green',
      '案例': 'purple',
      '习题': 'cyan',
      '实验指导': 'geekblue',
      '其他': 'default',
    };
    return colorMap[category] || 'default';
  };

  const columns: ColumnsType<CourseStandardResource> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '资源信息',
      key: 'info',
      width: 180,
      render: (_, record) => {
        const resource = record.course_resources;
        return (
          <Space direction="vertical" size={4}>
            <Space>
              {getResourceIcon(resource.type)}
              <span
                className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handlePreview(resource)}
                style={{ cursor: 'pointer' }}
              >
                {resource.title}
              </span>
            </Space>
            {resource.description && (
              <div className="text-xs text-gray-500">
                {resource.description.length > 60
                  ? `${resource.description.slice(0, 60)}...`
                  : resource.description}
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: '资源类别',
      dataIndex: 'resource_category',
      key: 'resource_category',
      width: 100,
      align: 'center',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: '类型',
      key: 'type',
      width: 120,
      render: (_, record) => {
        const resource = record.course_resources;
        return (
          <Space direction="vertical" size={2}>
            <Tag color="blue">{resource.type}</Tag>
          </Space>
        );
      },
    },
    {
      title: '格式',
      key: 'type',
      width: 120,
      render: (_, record) => {
        const resource = record.course_resources;
        return (
          <Space direction="vertical" size={2}>
            <Tag>{resource.format}</Tag>
          </Space>
        );
      },
    },
    {
      title: '文件大小',
      key: 'file_size',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span className="text-gray-600">
          {formatFileSize(record.course_resources.file_size)}
        </span>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      width: 150,
      render: (_, record) => {
        const tags = record.course_resources.tags || [];
        return (
          <Space size={4} wrap>
            {tags.slice(0, 2).map((tag, index) => (
              <Tag key={index} color="purple" style={{ fontSize: '11px', margin: 0 }}>
                {tag}
              </Tag>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-400">+{tags.length - 2}</span>
            )}
          </Space>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (notes) => (
        <span className="text-gray-600 text-sm">
          {notes || '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const resource = record.course_resources;
        const previewable = canPreview(resource.format);

        return (
          <Space size="small">
            {previewable ? (
              <Tooltip title="预览">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(resource)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="该格式不支持预览">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  disabled
                />
              </Tooltip>
            )}
            <Tooltip title="下载">
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(resource)}
              />
            </Tooltip>
          </Space>
        );
      },
    }
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    resources.forEach(item => {
      counts[item.resource_category] = (counts[item.resource_category] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const requiredCount = resources.filter(r => r.is_required).length;
  const optionalCount = resources.length - requiredCount;

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold">课程资源列表</div>
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
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Table
          columns={columns}
          dataSource={resources}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                description="还没有添加任何资源"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </div>

      <Modal
        title={
          <div>
            <Space>
              <EyeOutlined />
              <span>资源预览</span>
            </Space>
            {previewResource && (
              <div className="text-sm text-gray-500 font-normal mt-1">
                {previewResource.title}
              </div>
            )}
          </div>
        }
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewResource(null);
          setPreviewUrl('');
        }}
        width="80%"
        style={{ top: 20 }}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => previewResource && handleDownload(previewResource)}
          >
            下载
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setPreviewVisible(false);
              setPreviewResource(null);
              setPreviewUrl('');
            }}
          >
            关闭
          </Button>,
        ]}
      >
        {renderPreviewContent()}
      </Modal>
    </Modal>
  );
};

export default ViewCourseResources;
