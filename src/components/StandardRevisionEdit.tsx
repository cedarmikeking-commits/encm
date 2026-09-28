import React, { useState, useEffect } from 'react';
import {
  Layout,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Divider,
  Alert,
  Select,
  Card,
  Tooltip,
  Breadcrumb,
  Menu,
  List,
  Modal,
  Table
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  CloseOutlined,
  EyeOutlined,
  HomeOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

import {
  getCareerStandardMapList,
} from '@/api/careerStandardMap/index';
import {
  getCareerStandardRevise,
  saveOrUpdateCareerStandardRevise,
  submitCareerStandardRevise
} from '@/api/careerstandard/index';

import { postResourceGetBylds } from '@/api/standards/index2';
import { useCareerTree } from '@/hooks/useCareerTree';

import UploadDraggerFile from '@/components/UploadDraggerFile';

import { UploadData } from '@/hooks/useOssUpload';
import StandardMap from '@/components/careerStandardMap/index'
interface StandardDocument {
  id: string;
  standard_name: string;
  version: string;
  domain_id: string;
  introduction: string;
  basic_info: any;
  terms_definitions: any[];
  standard_content: any;
  appendix_files: any[];
  status: string;
  created_at: string;
  revision_source?: string;
  mapping_document_id?: string;
}

interface StandardRevisionEditProps {
  id: string;
  onBack: () => void;
}

const StandardRevisionEdit: React.FC<StandardRevisionEditProps> = ({ id, onBack }) => {

  const [formValues, setFormValues] = useState<any>({});
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [uploadResIDs, setUploadResIDs] = useState<string>('');
  const { getCareerTree, getParent } = useCareerTree();
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [selectedSection, setSelectedSection] = useState('basic');
  const [revision, setRevision] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [termsDefinitions, setTermsDefinitions] = useState<Array<{ term: string; definition: string }>>([]);
  const [abilityRequirements, setAbilityRequirements] = useState<Array<any>>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [mappingDocuments, setMappingDocuments] = useState<any[]>([]);
  const [selectedMappingDocId, setSelectedMappingDocId] = useState<string>('');
  const [selectedMappingDocName, setSelectedMappingDocName] = useState<string>('');
  const [selectMappingModalVisible, setSelectMappingModalVisible] = useState(false);
  const [viewMappingModalVisible, setViewMappingModalVisible] = useState<string>('');
  const [currentMappingDocument, setCurrentMappingDocument] = useState<any>(null);
  const [mappingRows, setMappingRows] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [professionalDomains] = useState<any[]>(() => {
    let domains: any[] = [];
    getCareerTree().map(firstNote => {
      firstNote.children?.map(secondNote => {
        secondNote.children?.map(thirdNote => domains.push(thirdNote));
      })
    });
    return domains;
  });
  useEffect(() => {
    clearTimeout(window._standardsRevisionEdit || 0);
    window._standardsRevisionEdit = setTimeout(() => {
      loadData();
    }, 200);
  }, [id]);
  const loadMappingDocuments = async () => {
    try {
      getCareerStandardMapList({ status: 1 }).then((data: any) => {
        setMappingDocuments(data);
      });
    } catch (error) {
      console.error('获取已保存的文档数据时错误:', error);
      message.error('获取已保存的文档数据时发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };
  const loadData = async () => {
    try {
      setLoading(true);

      getCareerStandardRevise({ careerStandardId: id }).then((data: any) => {
        setRevision(data);
        setSelectedDomainId(data.careerId);
        setSelectedMappingDocId(data.careerStandardMapId);
        setSelectedMappingDocName(data.careerStandardMapName);
        // 设置术语定义
        if (data.careerStandardTermList && Array.isArray(data.careerStandardTermList)) {
          setTermsDefinitions(data.careerStandardTermList.map((term: any) => ({ id: term.id, term: term.termName, definition: term.termDefinition })));
        }

        // 填充表单
        form.setFieldsValue({
          domain_id: data.careerId,
          standard_name: data.careerStandardFileName,
          version: data.standardVersion,
          introduction: data.preface || '',
          purpose: data.corePurpose || '',
          scope: data.scope || '',
          standard_description: data.overview || '',
          revision_description: data.remark || ''
        });
        // 加载该领域的映射表文档
        loadMappingDocuments();

        //加载附件列表
        if (data.appendixAttach) {
          postResourceGetBylds(data.appendixAttach.split(',')).then(data => {
            setFileList(data.map((item: any) => ({
              id: item.id, name: item.originalName, url: item.signUrl, type: item.type, size: item.resourceSize
            })));
          }).catch((error: any) => {
            message.error(error.response.data.msg);
          }).finally(() => {

          });
        }
      });

    } catch (error: any) {
      console.error('加载标准修订数据时错误:', error);
      message.error('加载标准修订数据发生错误');
    } finally {
      setLoading(false);
    }
  };

  const addAbilityRequirement = () => {
    if (!selectedDomainId) {
      message.warning('请先选择职业领域');
      setSelectedSection('basic');
      return;
    }
    if (mappingDocuments.length === 0) {
      message.warning('该职业领域暂无可用的映射表文档');
      return;
    }
    setSelectMappingModalVisible(true);
  };

  const handleSelectMappingDocument = (docId: string, docTitle: string) => {
    setSelectedMappingDocId(docId);
    setSelectedMappingDocName(docTitle);
    setSelectMappingModalVisible(false);
    message.success(`已选择映射表文档: ${docTitle}`);
  };

  const handleViewMappingDocument = async (docId: string) => {
    setViewMappingModalVisible(docId);
  };

  const handleSave = async () => {

    // 显式获取所有表单字段的值
    const values = form.getFieldsValue([
      'version',
      'introduction',
      'purpose',
      'scope',
      'standard_description',
      'revision_description'
    ]);
    // 使用组件状态进行验证
    if (!selectedDomainId) {
      message.error('请选择职业领域');
      setSelectedSection('basic');
      return;
    }

    if (!values.purpose || values.purpose.trim() === '') {
      message.error('制定目的（必填项）');
      setSelectedSection('basic');
      return;
    }

    if (!values.scope || values.scope.trim() === '') {
      message.error('请填写适用范围（必填项）');
      setSelectedSection('basic');
      return;
    }
    if (!values.introduction || values.introduction.trim() === '') {
      message.error('请填概述（必填项）');
      setSelectedSection('introduction');
      return;
    }

    if (!values.standard_description || values.standard_description.trim() === '') {
      message.error('请填总述（必填项）');
      setSelectedSection('content');
      return;
    }

    if (!values.revision_description || values.revision_description.trim() === '') {
      message.error('请填修订说明（必填项）');
      setSelectedSection('revision_notes');
      return;
    }

    if (!selectedMappingDocId) {
      message.error('请先选择映射表文档');
      setSelectedSection('content');
      return;
    }
    try {
      setSaving(true);

      let apiData: any = {
        ...revision,
        "careerStandardMapId": selectedMappingDocId,
        "preface": values.introduction,
        "corePurpose": values.purpose,
        "scope": values.scope,
        "overview": values.standard_description,
        "remark": values.revision_description,
        "appendixAttach": uploadResIDs,
        "careerStandardTermList": termsDefinitions.map((item: any) => ({ id: item.id, termName: item.term, termDefinition: item.definition }))
      };

      saveOrUpdateCareerStandardRevise(apiData).then((data) => {
        message.success('修订保存成功');
        setRevision(data);
      });
    } catch (error: any) {
      message.error('修订保存失败：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      submitCareerStandardRevise({ reviseId: revision.reviseId }).then(() => {
        message.success('提交成功');
        revision.status = 1;
        setRevision(revision);

        message.success('提交成功');
        setTimeout(() => {
          onBack();
        }, 1000);
      });
    } catch (error: any) {
      message.error('提交失败：' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addTermDefinition = () => {
    setTermsDefinitions([...termsDefinitions, { term: '', definition: '' }]);
  };

  const updateTermDefinition = (index: number, field: 'term' | 'definition', value: string) => {
    const newTerms = [...termsDefinitions];
    newTerms[index][field] = value;
    setTermsDefinitions(newTerms);
  };

  const removeTermDefinition = (index: number) => {
    setTermsDefinitions(termsDefinitions.filter((_, i) => i !== index));
  };

  const menuItems = [
    {
      key: 'basic',
      icon: <FileTextOutlined />,
      label: '基本信息'
    },
    {
      key: 'introduction',
      icon: <BookOutlined />,
      label: '引言'
    },
    {
      key: 'terms',
      icon: <SettingOutlined />,
      label: '术语定义'
    },
    {
      key: 'content',
      icon: <AlignLeftOutlined />,
      label: '标准正文'
    },
    {
      key: 'appendix',
      icon: <PlusOutlined />,
      label: '附录'
    },
    {
      key: 'revision_notes',
      icon: <EditOutlined />,
      label: '修订说明'
    }
  ];

  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 PDF、JPG、PNG 格式的文件');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 10MB');
    }
    return isAllowedType && isLt10M;
  };
  const handleUploaded_BusinessLicense = (data: UploadData[]) => {
    console.log('上传完成，返回：', data);
    setFileList(data.map((item: any) => ({ id: item.resourceId, url: item.Location, name: item.file.name, type: item.file.type, size: item.file.size })));
    setUploadResIDs(data.map(item => item.resourceId).join(','));
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'basic':
        return (
          <div className="space-y-6">
            <Title level={3}>基本信息</Title>
            <Form.Item
              name="standard_name"
              label="标准名称"
              rules={[{ required: true, message: '请输入标准名称' }]}
            >
              <Input readOnly size="large" style={{ cursor: 'text', backgroundColor: '#f5f5f5' }} />
            </Form.Item>

            <Form.Item
              name="version"
              label="版本号"
              rules={[{ required: true, message: '请输入版本号' }]}
            >
              <Input placeholder="如：V1.0" size="large" readOnly />
            </Form.Item>

            <Form.Item
              name="domain_id"
              label="职业领域"
              rules={[{ required: true, message: '请选择职业领域' }]}
            >
              <Select disabled size="large" placeholder="请选择职业领域"
              >
                {professionalDomains.map(domain => (
                  <Select.Option key={domain.id} value={domain.id}>
                    {domain.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="purpose"
              label="制定目的"
              rules={[{ required: true, message: '请输入制定目的' }]}
            >
              <TextArea rows={4} size="large" />
            </Form.Item>

            <Form.Item
              name="scope"
              label="适用范围"
              rules={[{ required: true, message: '请输入适用范围' }]}
            >
              <TextArea rows={4} size="large" />
            </Form.Item>
          </div>
        );

      case 'introduction':
        return (
          <div className="space-y-6">
            <Title level={3}>概述</Title>
            <Alert
              message="概述应简要说明标准的背景、目的和主要内容"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="introduction"
              rules={[{ required: true, message: '请输入概述内容' }]}
            >
              <TextArea
                rows={16}
                placeholder="请输入概述内容..."
                size="large"
              />
            </Form.Item>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Title level={3}>术语定义</Title>
              <Button type="dashed" onClick={addTermDefinition}>
                添加术语
              </Button>
            </div>
            <Alert
              message="请定义标准中使用的专业术语"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div className="space-y-4">
              {termsDefinitions.map((item, index) => (
                <Card key={index} size="small">
                  <div className="space-y-3">
                    <Input
                      placeholder="术语"
                      value={item.term}
                      onChange={(e) => updateTermDefinition(index, 'term', e.target.value)}
                      size="large"
                    />
                    <TextArea
                      placeholder="定义"
                      value={item.definition}
                      onChange={(e) => updateTermDefinition(index, 'definition', e.target.value)}
                      rows={3}
                      size="large"
                    />
                    <Button danger size="small" onClick={() => removeTermDefinition(index)}>
                      删除
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'content':
        return (
          <Card
            title="标准正文"
            bordered={false}
            extra={
              <Tooltip title="选择该职业领域对应的映射表文档，作为能力要求的参考依据">
                <Button type="primary" icon={<PlusOutlined />} onClick={addAbilityRequirement}>
                </Button>
              </Tooltip>
            }
          >
            <div className="mb-6">
              <Title level={5}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>总述</Title>
              <Paragraph type="secondary">
                对本职业领域在选定等级下的总体能力要求、核心特征进行描述。
              </Paragraph>
              <Form.Item
                name="standard_description"
                rules={[{ required: true, message: '请输入标准内容描述' }]}
              >
                <TextArea
                  rows={8}
                  placeholder="请输入总体描述..."
                  size="large"
                />
              </Form.Item>
            </div>

            <Divider />

            <div>
              <Title level={5}>分项能力要求</Title>
              <Paragraph type="secondary">
                点击上方"添加能力要求"按钮，选择该职业领域对应的映射表文档。映射表文档包含按照《深圳协议方案》组织的基础能力、行动能力、发展能力三个一级维度的详细能力描述。
              </Paragraph>

              {selectedMappingDocName ? (
                <Card className="mt-4" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>已选择映射表文档: </Text>
                      <Button
                        type="link"
                        onClick={() => handleViewMappingDocument(selectedMappingDocId)}
                        style={{ fontSize: '16px', padding: 0, height: 'auto' }}
                      >
                        {selectedMappingDocName}
                      </Button>
                    </div>
                    <Button
                      danger
                      onClick={() => {
                        setSelectedMappingDocId('');
                        setSelectedMappingDocName('');
                        message.info('已清除映射表文档选择');
                      }}
                    >
                      清除选择
                    </Button>
                  </div>
                </Card>
              ) : (
                <Alert
                  message="尚未选择映射表文档"
                  description='请点击上方"添加能力要求"按钮，从列表中选择一个映射表文档'
                  type="info"
                  showIcon
                  className="mt-4"
                />
              )}
            </div>
          </Card>
        );

      case 'appendix':
        return (
          <div className="space-y-6">
            <Title level={3}>附录（可选）</Title>
            <Alert
              message="如相关的法律法规、参考文件等，可上传多个附件文档"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <UploadDraggerFile
              name="file"
              multiple={true}
              beforeUpload={beforeUpload}
              onUploaded={handleUploaded_BusinessLicense}
              uploadResIDs={uploadResIDs}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: '16px', marginTop: '16px' }}>
                点击或拖拽文件到此区域上传
              </p>
              <p className="ant-upload-hint" style={{ fontSize: '14px', color: '#999' }}>
                支持单个或批量上传。支持的文件格式：PDF、Word、Excel、图片等，单个文件不超过10MB
              </p>
            </UploadDraggerFile>
          </div>
        );

      case 'revision_notes':
        return (
          <div className="space-y-6">
            <Title level={3}>修订说明</Title>
            <Alert
              message="请说明本次修订的原因、主要变更内容和影响"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="revision_description"
              rules={[{ required: true, message: '请输入修订说明' }]}
            >
              <TextArea
                rows={12}
                placeholder="请详细说明修订内容和原因..."
                size="large"
              />
            </Form.Item>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    const values = { ...formValues, ...form.getFieldsValue() };//form.getFieldsValue();

    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#fff',
        padding: '60px 80px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        minHeight: '1000px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={2} style={{ marginBottom: '16px' }}>{values.standard_name}</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>{values.version}</Text>
        </div>

        <Divider />

        <div style={{ marginBottom: '32px' }}>
          <Title level={4}>一、基本信息</Title>
          <div style={{ marginLeft: '24px' }}>
            <Paragraph><Text strong>制定目的：</Text>{values.purpose}</Paragraph>
            <Paragraph><Text strong>适用范围：</Text>{values.scope}</Paragraph>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <Title level={4}>二、概述</Title>
          <Paragraph style={{ marginLeft: '24px', whiteSpace: 'pre-wrap' }}>
            {values.introduction}
          </Paragraph>
        </div>

        {termsDefinitions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <Title level={4}>三、术语定义</Title>
            <div style={{ marginLeft: '24px' }}>
              {termsDefinitions.map((item, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <Paragraph style={{ marginBottom: '4px' }}>
                    <Text strong>{index + 1}. {item.term}</Text>
                  </Paragraph>
                  <Paragraph style={{ marginLeft: '24px' }}>{item.definition}</Paragraph>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <Title level={4}>四、标准内容</Title>
          <Paragraph style={{ marginLeft: '24px', whiteSpace: 'pre-wrap' }}>
            {values.standard_description}
          </Paragraph>
        </div>

        {selectedMappingDocId != '' ? (
          <div style={{ marginBottom: '32px' }}>
            <Title level={5} style={{ marginLeft: '24px' }}>分项能力要求</Title>
            <div style={{ marginLeft: '48px' }}>
              <div style={{ maxWidth: 1150, overflow: 'auto' }}>
                <StandardMap mapId={selectedMappingDocId} />
              </div>
            </div>
          </div>
        ) : (
          <Paragraph type="secondary" italic className="mt-4">暂无分项能力要求</Paragraph>
        )}
        {fileList.length > 0 && (
          <div>
            <Title level={4}>附录</Title>
            <div className="space-y-2">
              {fileList.map((file, index) => (
                <div key={index}>
                  <Text>{file.name}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: '48px', borderTop: '2px solid #f0f0f0', paddingTop: '24px' }}>
          <Title level={4}>修订说明</Title>
          <Paragraph style={{ marginLeft: '24px', whiteSpace: 'pre-wrap', background: '#fffbe6', padding: '16px', borderRadius: '4px' }}>
            {values.revision_description}
          </Paragraph>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-3 border-b">
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> 首页</> },
            { title: '标准审查' },
            { title: '标准修订' },
            { title: '修订编辑' }
          ]}
        />
      </div>

      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>返回</Button>
            {revision && (
              <Space>
                <Text type="secondary">{revision.careerStandardFileName}</Text>
                <span className={`text-sm px-3 py-1 rounded-full ${revision.status === 0 ? 'bg-blue-50 text-blue-600' :
                  revision.status === 1 ? 'bg-yellow-50 text-yellow-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                  {revision.status === 0 ? '草稿' :
                    revision.status === 1 ? '已提交' :
                      '草稿'}
                </span>
              </Space>
            )}
          </div>
        </div>
      </div>

      <Layout style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, overflow: 'auto' }}>
            <div className="p-3">
              <Title level={5} className="mb-3" style={{ fontSize: '16px' }}>标准文件结构</Title>
              <Menu
                mode="inline"
                selectedKeys={[selectedSection]}
                items={menuItems}
                onClick={({ key }) => {
                  setFormValues({ ...formValues, ...form.getFieldsValue() });
                  setSelectedSection(key)
                }}
                style={{ borderRight: 0 }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px', background: '#fff' }}>
            <div className="space-y-2">
              <div className="mb-3">
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  文档操作
                </Text>
                <Space direction="vertical" style={{ width: '100%', display: 'flex', alignItems: 'center' }} size="small">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewVisible(!previewVisible)}
                    style={{ width: '180px' }}
                    size="middle"
                  >
                    {(previewVisible && revision.status === 0) ? '编辑模式' : '预览文档'}
                  </Button>
                </Space>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  文档提交
                </Text>
                <Space direction="vertical" style={{ width: '100%', display: 'flex', alignItems: 'center' }} size="small">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{ width: '180px' }}
                    size="middle"
                    loading={saving}
                    disabled={revision?.status > 0}
                  >
                    保存修订
                  </Button>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    style={{ width: '180px' }}
                    size="middle"
                    loading={submitting}
                    disabled={!revision?.reviseId || revision?.status === 1}
                  >
                    提交审查
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </Sider>

        <Content style={{
          padding: '24px',
          overflow: 'auto',
          height: '100%',
          display: previewVisible ? 'none' : 'block'
        }}>
          <div className="max-w-5xl mx-auto">
            {!loading && revision && (
              <Form
                form={form}
                layout="vertical"
                size="large"
                key={id}
                preserve={true}
              >
                {renderContent()}
              </Form>
            )}
          </div>
        </Content>

        {previewVisible && (
          <Content
            style={{
              background: '#f5f5f5',
              height: '100%',
              overflow: 'auto',
              padding: '24px'
            }}
          >
            {renderPreview()}
          </Content>
        )}
      </Layout>

      <Modal
        title="选择映射表文档"
        open={selectMappingModalVisible}
        onCancel={() => setSelectMappingModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Text type="secondary">
            请选择一个映射表文档作为标准正文的能力要求参考。选择后可点击文档名称查看完整内容。
          </Text>
        </div>
        <List
          dataSource={mappingDocuments.filter(doc => doc.careerId === selectedDomainId)}
          renderItem={(doc: any) => (
            <List.Item
              key={doc.id}
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleSelectMappingDocument(doc.id, doc.careerStandardMapName)}
                  disabled={selectedMappingDocId === doc.id}
                >
                  {selectedMappingDocId === doc.id ? '已选择' : '选择'}
                </Button>,
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewMappingDocument(doc.id)}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Button
                    type="link"
                    onClick={() => handleViewMappingDocument(doc.id)}
                    style={{ padding: 0, height: 'auto', fontSize: '16px' }}
                  >
                    {doc.careerStandardMapName}
                  </Button>
                }
                description={
                  <div>
                    <div>版本: {doc.standardVersion}</div>
                    {doc.description && <div className="mt-1">{doc.remark}</div>}
                    <div className="mt-1 text-gray-400">
                      创建时间: {doc.createTime}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {mappingDocuments.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            该职业领域暂无可用的映射表文档
          </div>
        )}
      </Modal>

      {viewMappingModalVisible != '' && <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
            <span>{currentMappingDocument ? `${currentMappingDocument.title} - 详情` : '映射表详情'}</span>
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ marginLeft: 'auto' }}
            />
          </div>
        }
        open={viewMappingModalVisible != ''}
        onCancel={() => {
          setViewMappingModalVisible('');
          setIsFullscreen(false);
        }}
        footer={null}
        style={isFullscreen ? { top: 0, maxWidth: '100vw', paddingBottom: 0 } : { top: 20 }}
        bodyStyle={isFullscreen ? { height: 'calc(100vh - 110px)', overflow: 'auto' } : {}}
        centered={!isFullscreen}
        width={isFullscreen ? '100vw' : 1150}
      >
        <div style={{ maxWidth: 1200, overflow: 'auto' }}>
          <StandardMap mapId={viewMappingModalVisible} />
        </div>
      </Modal>
      }
    </div >
  );
};

export default StandardRevisionEdit;
