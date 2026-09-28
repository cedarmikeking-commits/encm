import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Tree,
  Button,
  Input,
  Space,
  Card,
  Form,
  Select,

  Tag,
  Modal,
  message,
  Tooltip,
  Typography,
  Divider,
  Empty,
  Upload,
  List,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  MenuOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  BulbOutlined,
  UploadOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  ImportOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { UploadFile } from 'antd/es/upload/interface';
import ResourceLibraryModal from './ResourceLibraryModal';
import { postResourceGetBylds } from '@/api/course-standards';
import { UploadData } from '@/hooks/useOssUpload';
import UploadDraggerFile from '@/components/UploadDraggerFile';
import { getSectionTree, addSection, updateSection, contentRemove, resourceInStorage, removeSectionResource, contentCopy } from '@/api/course-develoment';
import { add } from 'lodash-es';
import { useDict } from '@/hooks/useDict';
import { title } from 'process';
import { set } from 'nprogress';
import Item from 'antd/es/list/Item';
import { getResourceFormatByType, getResourceTypeByFile } from '@/utils';
const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ResourceItem {
  id: string;
  type: 'video' | 'file' | 'link';
  name: string;
  url: string;
  size?: number;
  uploadProgress?: number;
  uploadedAt?: string;
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
  studyTarget?: string[];
  subtitleContent?: string;
}

interface CourseStructureEditorProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
  standardCourseId?: string;
}

const CourseStructureEditor: React.FC<CourseStructureEditorProps> = ({
  courseId,
  courseName,
  onBack,
  standardCourseId
}) => {
  const { getLabel, formatOptions } = useDict([
    'knowledge_point_difficulty', 'course_resource_type'
  ]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [addChapterModalVisible, setAddChapterModalVisible] = useState(false);
  const [addKnowledgeModalVisible, setAddKnowledgeModalVisible] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<string>('');
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [addResourceModalVisible, setAddResourceModalVisible] = useState(false);
  const [localUploadModalVisible, setLocalUploadModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [isConfirmUploading, setIsConfirmUploading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [knowledgeViewMode, setKnowledgeViewMode] = useState<'Create' | 'Edit'>('Create');
  const [chapterViewMode, setChapterViewMode] = useState<'Create' | 'Edit'>('Create');
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadResIDs, setUploadResIDs] = useState<string>('');
  const [resourceFileList, setResourceFileList] = useState<any[]>([]);
  const [uploadResourceType, setUploadResourceType] = useState<string>('1');
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
  };
  const handleAddChapter = () => {
    setChapterViewMode('Create');
    setAddChapterModalVisible(true);
    form.resetFields();
  };
  const handleEditChapter = (node: any) => {
    setSelectedNode(node);
    setChapterViewMode('Edit');
    form.setFieldsValue({ "title": node.sectionName });
    setAddChapterModalVisible(true);
  };
  const handleAddKnowledge = (node: any) => {
    setSelectedNode(node);
    form.resetFields();
    setKnowledgeViewMode('Create');
    setAddKnowledgeModalVisible(true);
  };
  const handleEditKnowledge = (node: any) => {
    setSelectedNode(node);
    setKnowledgeViewMode('Edit');
    form.setFieldsValue({ "title": node.sectionName, knowledgePointDifficulty: node.knowledgePointDifficulty });
    setAddKnowledgeModalVisible(true);
  };

  const confirmAddChapter = async () => {
    try {
      const values = await form.validateFields();
      if (chapterViewMode == 'Create') {
        await addSection({
          courseId,
          nodeType: 1,//章节
          parentSectionId: 0,
          sectionName: values.title,
          status: 1,
        });
      }
      else {
        await updateSection({
          id: selectedNode.id,
          sectionName: values.title,
        });
      }
      setAddChapterModalVisible(false);
      loadStructure();
      message.success(`章节${knowledgeViewMode == 'Create' ? '添加' : '修改'}成功`);
    } catch (error: any) {
      console.error('验证失败:', error);
      message.error(`章节${knowledgeViewMode == 'Create' ? '添加' : '修改'}失败` + error.message);
    }
  };

  const confirmAddKnowledge = async () => {
    try {
      const values = await form.validateFields();
      if (knowledgeViewMode == 'Create') {
        await addSection({
          courseId,
          nodeType: 2,//章节
          parentSectionId: selectedNode.id,
          sectionName: values.title,
          knowledgePointDifficulty: values.knowledgePointDifficulty,
          status: 1,
        });
      }
      else {
        await updateSection({
          id: selectedNode.id,
          sectionName: values.title,
          knowledgePointDifficulty: values.knowledgePointDifficulty,
        });
      }
      setAddKnowledgeModalVisible(false);
      loadStructure();
      message.success(`知识点${knowledgeViewMode == 'Create' ? '添加' : '修改'}成功`);
    } catch (error: any) {
      console.error('验证失败:', error);
      message.error(`知识点${knowledgeViewMode == 'Create' ? '添加' : '修改'}失败` + error.message);
    }
  };

  const handleDeleteNode = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个节点吗？删除后不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await contentRemove({ id });
          setSelectedNode(null);
          loadStructure();
          message.success('删除成功');
        }
        catch (error: any) {
          message.error('删除失败: ' + error.message);
        }
      }
    });
  };

  const handleCopyNode = async (node: ChapterNode) => {
    await contentCopy({ id: node.id });
    loadStructure();
    message.success('复制成功');
  };

  const handleAddResource = () => {
    setAddResourceModalVisible(true);
  };

  const handleLocalUpload = () => {
    setUploadFileList([]);
    setUploadingFiles({});
    setUploadTitle('');
    setUploadDescription('');
    setPendingUploadFile(null);
    setIsConfirmUploading(false);
    setFileList([]);
    setUploadResIDs('');
    setLocalUploadModalVisible(true);
  };

  const autoDetectResourceType = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];
    const audioExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExts = ['pdf'];
    const wordExts = ['doc', 'docx'];
    const pptExts = ['ppt', 'pptx'];
    const excelExts = ['xls', 'xlsx'];
    if (videoExts.includes(ext)) return '视频';
    if (audioExts.includes(ext)) return '音频';
    if (imageExts.includes(ext)) return '图片';
    if (pdfExts.includes(ext)) return 'PDF';
    if (wordExts.includes(ext)) return 'Word文档';
    if (pptExts.includes(ext)) return 'PPT';
    if (excelExts.includes(ext)) return 'Excel';
    return '文档';
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

  const handleConfirmUpload = async () => {
    if (!uploadTitle.trim()) {
      message.error('请输入资源标题');
      return;
    }
    if (!uploadResourceType) {
      message.error('请选择资源类型');
      return;
    }
    if (!uploadResIDs) {
      message.error('请选择要上传的文件');
      return;
    }
    setIsConfirmUploading(true);

    try {
      //将本地上传的文件追加到resourceFileList中（id为null）
      setResourceFileList([
        ...resourceFileList,
        {
          id: null,
          resourceName: uploadTitle,//fileList[0].name,
          resourceType: uploadResourceType,//fileList[0].type,
          resourceSize: fileList[0].size,
          resourceFile: uploadResIDs,// fileList[0].id,
          remark: uploadDescription,
          resourceDetailInfo: { ...fileList[0] }
        }
      ])
      setLocalUploadModalVisible(false);
    } catch (err: any) {
      message.error('上传失败: ' + err.message);
    } finally {
      setIsConfirmUploading(false);
    }
  };

  const handleUploadFile = async (file: File): Promise<void> => {
    const uid = `upload-${Date.now()}-${Math.random()}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];
    const isVideo = videoExts.includes(ext);
    const filePath = `course-resources/${courseId}/${Date.now()}-${file.name}`;

    setUploadingFiles(prev => ({ ...prev, [uid]: 0 }));

    try {
      const { data, error } = await supabase.storage
        .from('course-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('course-files')
        .getPublicUrl(filePath);

      const newResource: ResourceItem = {
        id: uid,
        type: isVideo ? 'video' : 'file',
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setUploadingFiles(prev => ({ ...prev, [uid]: 100 }));

      setResources(prev => {
        const updated = [...prev, newResource];
        if (selectedNode) {
          const updateNodeResources = (nodes: ChapterNode[]): ChapterNode[] =>
            nodes.map(node => {
              if (node.key === selectedNode.key) return { ...node, resources: updated };
              if (node.children) return { ...node, children: updateNodeResources(node.children) };
              return node;
            });
          setTreeData(prev => updateNodeResources(prev));
          setHasUnsavedChanges(true);
        }
        return updated;
      });

      setUploadFileList(prev =>
        prev.map(f => f.uid === uid ? { ...f, status: 'done', percent: 100 } : f)
      );

      message.success(`${file.name} 上传成功`);
    } catch (err: any) {
      setUploadFileList(prev =>
        prev.map(f => f.uid === uid ? { ...f, status: 'error' } : f)
      );
      message.error(`${file.name} 上传失败: ${err.message}`);
    } finally {
      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }
  };

  const handleDeleteResource = (item: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个资源吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        //console.log(item);
        if (item.id) {
          const updatedResources = resourceFileList.filter(r => r.id !== item.id);
          setResourceFileList(updatedResources);
          try {
            await removeSectionResource({ courseId: item.courseId, sectionId: item.sectionId, resourceId: item.id });
            message.success('资源删除成功');
          }
          catch (error: any) {
            message.error('资源删除失败: ' + error.message);
          }
        }
        else {
          const updatedResources = resourceFileList.filter(r => !r.id && r.resourceFile !== item.resourceFile);
          setResourceFileList(updatedResources);
        }
      }
    });
  };

  const handleSaveToLibrary = (item: ResourceItem) => {
    Modal.confirm({
      title: '存入学习资源库',
      icon: <ImportOutlined style={{ color: '#1677ff' }} />,
      content: (
        <div style={{ paddingTop: 8 }}>
          <p style={{ margin: '0 0 4px', color: '#4b5563' }}>
            是否将以下资源存入学习资源库？
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: '#1a2540' }}>{item.name}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8c9ab7' }}>
            存入后可在资源库中供该课程使用
          </p>
        </div>
      ),
      okText: '确认入库',
      cancelText: '取消',
      okButtonProps: { style: { borderRadius: 6 } },
      cancelButtonProps: { style: { borderRadius: 6 } },
      onOk: async () => {
        if (!item.id) {
          message.error("请点击“保存知识点”操作后继续！")
          return;
        }
        try {
          await resourceInStorage({ courseId, resourceId: item.id });
          message.success('资源已成功存入学习资源库');
        }
        catch (error: any) {
          console.log("入库失败：" + error.message);
          message.error(error.message);
        }
      }
    });
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSaveNodeDetail = async () => {
    try {
      await detailForm.validateFields();

      // if (resources.length === 0) {
      //   message.error('请至少添加一个课程资源');
      //   return;
      // }

      const allValues = detailForm.getFieldsValue(true);
      //整理resourceList
      const resourceList = resourceFileList.map(resource => {
        return {
          id: resource.id,
          resourceName: resource.resourceName,
          resourceType: resource.resourceType,
          resourceFile: resource.resourceFile,
          resourceSize: resource.resourceSize,
          remark: resource.remark,
        }
      })
      await updateSection({
        id: selectedNode?.id,
        courseId: courseId,
        sectionName: allValues.title,
        knowledgePointDifficulty: allValues.knowledgePointDifficulty,
        studyTarget: allValues.objectives.join(','),
        subtitleContent: allValues.content || '',
        resourceList,
      });
      setSelectedNode(null);
      setResourceFileList([]);
      setUploadResIDs('');
      setFileList([]);
      await loadStructure();
      message.success('已更新，请点击右上角"保存结构"按钮');
    } catch (error: any) {
      console.error('Save failed:', error);
      message.error('验证失败');
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
            {node.status === 'completed' && (
              <Tooltip title="已完成">
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />
              </Tooltip>
            )}
          </Space>
          <Space size={4} onClick={(e) => e.stopPropagation()}>
            {node.nodeType == "1" && (
              <Tooltip title="添加知识点">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddKnowledge(node);
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  node.nodeType == "1" ? handleEditChapter(node) : handleEditKnowledge(node);
                }}
              />
            </Tooltip>
            <Tooltip title="复制">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyNode(node);
                }}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
      children: node.children ? convertToTreeData(node.children) : undefined
    }));
  };

  const onSelect = (selectedKeys: React.Key[], node: any) => {
    if (selectedKeys.length > 0) {
      const node = findNode(treeData, selectedKeys[0] as string);
      setSelectedNode(node);
      setResourceFileList([]);
      if (node?.nodeType == '2') {
        detailForm.setFieldsValue({
          title: node?.sectionName,
          knowledgePointDifficulty: node?.knowledgePointDifficulty,
          objectives: (node?.studyTarget || '').split(",").filter((a: any) => a) || [],
          content: node?.subtitleContent || ''
        });
        //加载资源列表
        fetchAttachFiles(node);
      }
    }
  };

  const renderKnowledgeDetail = () => {
    if (!selectedNode || selectedNode.type == 2) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="请选择一个知识点进行编辑"
        />
      );
    }

    return (
      <Form
        form={detailForm}
        layout="vertical"
      >
        <Card
          title={(
            <Space>
              <FileTextOutlined />
              <Text strong>知识点标题</Text>
            </Space>
          )}
          extra={(
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  detailForm.resetFields();
                  setSelectedNode(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveNodeDetail}
              >
                保存知识点
              </Button>
            </Space>
          )}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: '请输入知识点标题' }]}
          >
            <Input placeholder="输入知识点标题" size="large" />
          </Form.Item>
        </Card>

        <Card title="基本设置" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="难度级别"
            name="knowledgePointDifficulty"
            rules={[{ required: true, message: '请选择难度级别' }]}
          >
            <Select placeholder="选择难度" style={{ width: '100%' }} options={formatOptions('knowledge_point_difficulty')}>
            </Select>
          </Form.Item>
        </Card>

        <Card
          title="课程目标"
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="link"
              size="small"
              onClick={() => {
                const objectives = detailForm.getFieldValue('objectives') || [];
                detailForm.setFieldsValue({
                  objectives: [...objectives, '']
                });
              }}
            >
              添加目标
            </Button>
          }
        >
          <Form.List name="objectives">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} align="baseline" style={{ width: '100%', marginBottom: 8 }}>
                    <Text type="secondary">{index + 1}</Text>
                    <Form.Item
                      {...field}
                      style={{ flex: 1, marginBottom: 0 }}
                      rules={[{ required: true, message: '请输入学习目标' }]}
                    >
                      <Input placeholder="输入学习目标" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </Space>
                ))}
                {fields.length === 0 && (
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加学习目标
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title={<span>课程资源<span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span></span>}
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Space size={8}>
              <Button
                size="small"
                icon={<CloudUploadOutlined />}
                disabled={resourceFileList.length > 0}
                onClick={handleLocalUpload}
              >
                本地上传资源
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                disabled={resourceFileList.length > 0}
                onClick={handleAddResource}
              >
                从资源库中添加
              </Button>
            </Space>
          }
        >
          {resourceFileList.length > 0 ? (
            <List
              dataSource={resourceFileList}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tooltip title="预览">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => window.open((item.resourceDetailInfo.signUrl || item.resourceDetailInfo.url), '_blank')}
                      />
                    </Tooltip>,
                    <Tooltip title="入库">
                      <Button
                        type="text"
                        size="small"
                        icon={<ImportOutlined style={{ color: '#1677ff' }} />}
                        onClick={() => handleSaveToLibrary(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteResource(item)}
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(item)}
                    title={
                      <Space>
                        <Text>{item.resourceName}</Text>
                        {item.resourceType === '1' && <Tag color="red">视频</Tag>}
                        {item.resourceType === 'link' && <Tag color="blue">外链</Tag>}
                      </Space>
                    }
                    description={
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">{formatFileSize(item.resourceDetailInfo.size || item.resourceDetailInfo.resourceSize)}</Text>
                        {(item.resourceDetailInfo.signUrl || item.resourceDetailInfo.url).startsWith('http') && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {(item.resourceDetailInfo.signUrl || item.resourceDetailInfo.url).length > 50 ? (item.resourceDetailInfo.signUrl || item.resourceDetailInfo.url).substring(0, 50) + '...' : (item.resourceDetailInfo.signUrl || item.resourceDetailInfo.url)}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无资源"
            />
          )}
        </Card>

        <Card title="字幕内容" size="small" style={{ marginBottom: 16 }}>
          <Form.Item name="content">
            <TextArea
              rows={12}
              placeholder="输入字幕内容的详细内容，支持Markdown格式..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Card>
      </Form>
    );
  };

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
    <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
      <Layout style={{ padding: '16px', background: '#f0f2f5' }}>
        <Card
          bordered={false}
          bodyStyle={{ padding: '12px 24px' }}
          style={{ marginBottom: 16 }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button onClick={onBack}>返回</Button>
              <Divider type="vertical" />
              <Title level={4} style={{ margin: 0 }}>
                {courseName} - 课程结构设置
              </Title>
            </Space>
            <Space size="middle">
              {false && hasUnsavedChanges && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: '#fff7e6',
                  border: '1px solid #ffa940',
                  borderRadius: '6px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                  <Text strong style={{ color: '#d46b08' }}>
                    有未保存的结构变更
                  </Text>
                </div>
              )}
              {false && <Badge dot={hasUnsavedChanges} offset={[-4, 4]}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => { message.success('保存成功') }}
                  disabled={!hasUnsavedChanges}
                  size="large"
                >
                  保存课程结构
                </Button>
              </Badge>
              }
            </Space>
          </Space>
        </Card>

        <Layout style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <Sider
            width={350}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              padding: '16px',
              overflowY: 'auto',
              height: 'calc(100vh - 150px)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <MenuOutlined />
                  <Text strong>章节与知识点</Text>
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddChapter}
                >
                  添加章节
                </Button>
              </div>

              {treeData.length > 0 ? (
                <Tree
                  treeData={convertToTreeData(treeData)}
                  expandedKeys={expandedKeys}
                  onExpand={setExpandedKeys}
                  onSelect={onSelect}
                  selectedKeys={selectedNode ? [selectedNode.id] : []}
                  showLine
                  blockNode
                />
              ) : (
                <Empty
                  description="暂无章节，点击上方按钮添加"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Space>
          </Sider>

          <Content
            style={{
              padding: '24px',
              background: '#fff',
              overflowY: 'auto',
              height: 'calc(100vh - 150px)'
            }}
          >
            {selectedNode?.nodeType === 1 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>章节节点，请选择下方的知识点进行编辑</Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddKnowledge(selectedNode)}
                    >
                      为该章节添加知识点
                    </Button>
                  </Space>
                }
              />
            ) : (
              renderKnowledgeDetail()
            )}
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={`${chapterViewMode == 'Create' ? '添加' : '编辑'}章节`}
        open={addChapterModalVisible}
        onOk={confirmAddChapter}
        onCancel={() => setAddChapterModalVisible(false)}
        okText="确定"
        cancelText="取消"
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="章节名称"
            name="title"
            rules={[{ required: true, message: '请输入章节名称' }]}
          >
            <Input placeholder="例如：第1章：UI/UX设计基础" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${chapterViewMode == 'Create' ? '添加' : '编辑'}知识点`}
        open={addKnowledgeModalVisible}
        onOk={confirmAddKnowledge}
        onCancel={() => setAddKnowledgeModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="知识点名称"
            name="title"
            rules={[{ required: true, message: '请输入知识点名称' }]}
          >
            <Input placeholder="例如：1.1 UI与UX设计的概念与区别" />
          </Form.Item>
          <Form.Item
            label="难度级别"
            name="knowledgePointDifficulty"
            initialValue="初级"
            rules={[{ required: true, message: '请选择难度级别' }]}
          >
            <Select placeholder="选择难度" style={{ width: '100%' }} options={formatOptions('knowledge_point_difficulty')}>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="上传本地资源"
        destroyOnHidden={true}
        open={localUploadModalVisible}
        onCancel={() => {
          if (isConfirmUploading) return;
          setLocalUploadModalVisible(false);
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              onClick={() => {
                setFileList([]);
                setUploadResIDs('');
                setLocalUploadModalVisible(false);
              }}
              disabled={isConfirmUploading}
              style={{ borderRadius: 8, padding: '0 24px' }}
            >
              取 消
            </Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={isConfirmUploading}
              onClick={handleConfirmUpload}
              style={{ borderRadius: 8, padding: '0 24px' }}
            >
              确认上传
            </Button>
          </div>
        }
        width={580}
      >
        <div style={{ padding: '8px 0 0' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#1a2540' }}>资源标题</span>
            </div>
            <input
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="请输入资源标题"
              style={{
                width: '100%',
                height: 40,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                padding: '0 12px',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1a2540',
              }}
              onFocus={e => { e.target.style.borderColor = '#1677ff'; e.target.style.boxShadow = '0 0 0 2px rgba(22,119,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#d9d9d9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6, fontWeight: 500, color: '#1a2540' }}>资源类型</div>
            <Select placeholder="自动识别，也可手动指定"
              style={{ width: '100%', borderRadius: 8 }}
              value={uploadResourceType}
              onChange={val => setUploadResourceType(val)}
              options={formatOptions('course_resource_type')}
            ></Select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6, fontWeight: 500, color: '#1a2540' }}>资源描述</div>
            <textarea
              value={uploadDescription}
              onChange={e => setUploadDescription(e.target.value)}
              placeholder="简要描述资源内容..."
              rows={4}
              style={{
                width: '100%',
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                color: '#1a2540',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = '#1677ff'; e.target.style.boxShadow = '0 0 0 2px rgba(22,119,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#d9d9d9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#1a2540' }}>上传文件</span>
            </div>
            <UploadDraggerFile
              accept={getResourceFormatByType(uploadResourceType).join(',')}
              name="file"
              maxCount={1}
              multiple={false}
              beforeUpload={beforeUpload}
              onUploaded={handleUploaded_BusinessLicense}
              uploadResIDs={uploadResIDs}
            >
              <div style={{ padding: '28px 0' }}>
                <InboxOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1a2540', margin: '10px 0 6px' }}>
                  点击或拖拽文件到此区域
                </p>
                <p style={{ fontSize: 13, color: '#8c9ab7', margin: 0 }}>
                  支持 {getResourceFormatByType(uploadResourceType).map(a => a.toUpperCase()).join('、')} 格式，单文件不超过 200MB
                </p>
              </div>
            </UploadDraggerFile>
          </div>
        </div>
      </Modal>

      <ResourceLibraryModal
        visible={addResourceModalVisible}
        courseId={standardCourseId || courseId}
        onCancel={() => setAddResourceModalVisible(false)}
        onSelect={(selectedResources) => {
          if (!selectedNode) return;
          //将多选的id加入到ResourceFileList中
          //将selectedRsources中的id剔除，重新建立关系
          const addResourceList = [...selectedResources].map((item: any) => ({ ...item, id: null }));
          selectedNode.resourceList = [...selectedNode.resourceList, ...addResourceList];
          fetchAttachFiles(selectedNode);
          setAddResourceModalVisible(false);
        }}
        selectedResourceIds={selectedNode?.resources?.map(r => r.id) || []}
        multiple={false}
      />
    </Layout >
  );
};

export default CourseStructureEditor;
