import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Descriptions,
  Typography,
  Tag,
  Space,
  Empty,
  Spin,
  List,
  Button,
  message
} from 'antd';
import {
  FolderOpenOutlined,
  BulbOutlined,
  FileTextOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileOutlined,
  EyeOutlined,
  CheckCircleFilled,
  FileImageOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Title, Text, Paragraph } = Typography;

interface ResourceItem {
  id: string;
  type: 'video' | 'file' | 'link';
  name: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  resourceType: '1' | '2';
  resourceDetailInfo: any;
}
interface ChapterNode {
  id: string;
  sectionName: string;
  nodeType: '1' | '2';
  children?: ChapterNode[];
  status?: 'completed' | 'pending';
  difficulty?: string;
  objectives?: string[];
  content?: string;
  resources?: ResourceItem[];
  knowledgePointDifficulty?: string;
  studyTarget?: string;
  subtitleContent?: string;
  remark?: string;
}

interface CourseStructureViewerProps {
  courseId: string;
  courseName: string;
}

import { getSectionTree } from '@/api/course-develoment';
import { postResourceGetBylds } from '@/api/course-standards';
import { useDict } from '@/hooks/useDict';
const CourseStructureViewer: React.FC<CourseStructureViewerProps> = ({
  courseId,
  courseName
}) => {
  const { getLabel, formatOptions } = useDict([
    'knowledge_point_difficulty', 'course_resource_type'
  ]);
  const [treeData, setTreeData] = useState<ChapterNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ChapterNode | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceFileList, setResourceFileList] = useState<any[]>([]);

  useEffect(() => {
    loadStructure();
  }, [courseId]);
  const loadStructure = async () => {
    try {
      const data = await getSectionTree({ courseId });
      setTreeData(data);
      const allKeys = data.map((a: any) => a.id);
      setExpandedKeys(allKeys);
    } catch (error: any) {
      message.error('加载课程结构失败: ' + error.message);
      console.error('Load structure error:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const findNode = (nodes: ChapterNode[], key: string): ChapterNode | null => {
    for (const node of nodes) {
      if (node.id === key) return node;
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const convertToTreeData = (nodes: ChapterNode[]): DataNode[] => {
    return nodes.map(node => ({
      key: node.id,
      title: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '4px 8px'
          }}
        >
          <Space>
            {node.nodeType == "1" ? (
              <FolderOpenOutlined style={{ color: '#1890ff' }} />
            ) : (
              <BulbOutlined style={{ color: '#52c41a' }} />
            )}
            <Text>{node.sectionName}</Text>
          </Space>
        </div>
      ),
      children: node.children ? convertToTreeData(node.children) : undefined
    }));
  };

  const fetchAttachFiles = async (selectedNode: any) => {
    if (selectedNode && selectedNode.resourceList.length > 0) {
      postResourceGetBylds(
        selectedNode.resourceList.map((a: any) => a.resourceFile)
      ).then(data => {
        const _resourceList = selectedNode.resourceList.map((a: any) => {
          return {
            ...a,
            resourceDetailInfo: data.find((b: any) => b.id == a.resourceFile) || {}
          }
        })
        setResourceFileList(_resourceList);
      }).catch((error: any) => {
        message.error(error.message);
      })
    }
  };
  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const node = findNode(treeData, selectedKeys[0] as string);
      setSelectedNode(node);
      setResourceFileList([]);
      if (node?.nodeType == '2') {
        fetchAttachFiles(node);
      }
    }
  };
  const getFileIcon = (resource: ResourceItem) => {
    if (resource.resourceType === '1') {
      return <PlayCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
    }

    const ext = (resource.resourceDetailInfo.originalName || resource.resourceDetailInfo.name).split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImageOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={{ fontSize: 24, color: '#fa8c16' }} />;
      default:
        return <FileOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    }
  };
  const getResourceIcon = (type: string, name: string) => {
    if (type === 'video') return <PlayCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (type === 'link') return <LinkOutlined style={{ color: '#1890ff' }} />;

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx': return <FilePptOutlined style={{ color: '#ff7a45' }} />;
      default: return <FileOutlined />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <Card>
        <Empty description="该课程暂无课程结构信息" />
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: '600px' }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>章节与知识点</span>
          </Space>
        }
        style={{ flex: '0 0 400px', overflow: 'auto' }}
        bodyStyle={{ padding: '12px' }}
      >
        <Tree
          showLine
          showIcon
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys as string[])}
          onSelect={handleSelect}
          treeData={convertToTreeData(treeData)}
        />
      </Card>

      <Card
        title="详细信息"
        style={{ flex: 1, overflow: 'auto' }}
      >
        {selectedNode ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>
                {selectedNode.nodeType == '1' ? '章节' : '知识点'}: {selectedNode.sectionName}
              </Title>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="类型">
                <Tag color={selectedNode.nodeType == '1' ? 'blue' : 'green'}>
                  {selectedNode.nodeType == '1' ? '章节' : '知识点'}
                </Tag>
              </Descriptions.Item>

              {/* <Descriptions.Item label="状态">
                {selectedNode.status === 'completed' ? (
                  <Tag color="success" icon={<CheckCircleFilled />}>已完成</Tag>
                ) : (
                  <Tag color="default">待完成</Tag>
                )}
              </Descriptions.Item> */}

              {/* {selectedNode.duration && (
                <Descriptions.Item label="建议学时">
                  {selectedNode.duration}
                </Descriptions.Item>
              )} */}

              {selectedNode.knowledgePointDifficulty && (
                <Descriptions.Item label="难度">
                  <Tag color={
                    selectedNode.knowledgePointDifficulty === '1' ? 'green' :
                      selectedNode.knowledgePointDifficulty === '2' ? 'orange' : 'red'
                  }>
                    {getLabel('knowledge_point_difficulty', selectedNode.knowledgePointDifficulty)}
                  </Tag>
                </Descriptions.Item>
              )}

              {/* {selectedNode.contentType && (
                <Descriptions.Item label="内容类型" span={2}>
                  {selectedNode.contentType}
                </Descriptions.Item>
              )} */}
            </Descriptions>

            {selectedNode.studyTarget && (
              <div>
                <Title level={5}>课程目标</Title>
                <List
                  size="small"
                  bordered
                  dataSource={(selectedNode?.studyTarget || '').split(',').filter((a: any) => a)}
                  renderItem={(item: any, index) => (
                    <List.Item>
                      <Text>{index + 1}. {item}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {selectedNode.content && (
              <div>
                <Title level={5}>内容描述</Title>
                <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedNode?.remark}
                  </Paragraph>
                </Card>
              </div>
            )}

            {resourceFileList && resourceFileList.length > 0 && (
              <div>
                <Title level={5}>学习资源</Title>
                <List
                  size="small"
                  bordered
                  dataSource={resourceFileList}
                  renderItem={(resource) => (
                    <List.Item
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => window.open((resource.resourceDetailInfo.signUrl || resource.resourceDetailInfo.url), '_blank')}
                        >
                          查看
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={getFileIcon(resource)}
                        title={resource.name}
                        description={
                          <Space size="small">
                            <Tag>{resource.type === 'video' ? '视频' : resource.type === 'link' ? '链接' : '文件'}</Tag>
                            {resource.size && <Text type="secondary">{formatFileSize(resource.size)}</Text>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Space>
        ) : (
          <Empty description="请在左侧选择一个章节或知识点进行查看" />
        )}
      </Card>
    </div>
  );
};

export default CourseStructureViewer;
