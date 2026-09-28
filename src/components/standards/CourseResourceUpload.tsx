import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Radio,
  Cascader,
  Input,
  Select,
  Upload,
  Button,
  Space,
  Typography,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  message
} from 'antd';
import {
  FileTextOutlined,
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface CourseResourceUploadProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StepData {
  isGeneralEducation?: boolean;
  standardCourseId?: string;
  coreCourseId?: string;
  industryField?: string[];
  competencyLevel?: string[];
  educationLevel?: string[];
  resourceInfo?: {
    title: string;
    developmentType?: string;
    type: string;
    format?: string;
    description?: string;
    externalUrl?: string;
  };
  fileList?: any[];
}

const CourseResourceUpload: React.FC<CourseResourceUploadProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<StepData>({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCourseType, setSelectedCourseType] = useState<boolean | undefined>(undefined);
  const [selectedResourceType, setSelectedResourceType] = useState<string | undefined>(undefined);

  const [industryOptions, setIndustryOptions] = useState<any[]>([]);
  const [competencyOptions, setCompetencyOptions] = useState<any[]>([]);
  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [standardCourses, setStandardCourses] = useState<any[]>([]);
  const [coreCourses, setCoreCourses] = useState<any[]>([]);
  const [allCoreCourses, setAllCoreCourses] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadIndustryData();
      loadCompetencyData();
      loadEducationLevels();
      loadStandardCourses();
      loadCoreCourses();
      if (stepData.isGeneralEducation !== undefined) {
        setSelectedCourseType(stepData.isGeneralEducation);
      }
      if (stepData.resourceInfo?.type) {
        setSelectedResourceType(stepData.resourceInfo.type);
      }
    } else {
      setSelectedCourseType(undefined);
      setSelectedResourceType(undefined);
    }
  }, [visible]);

  useEffect(() => {
    if (stepData.industryField && stepData.industryField.length > 0) {
      const selectedIndustryId = stepData.industryField[stepData.industryField.length - 1];
      const filteredCourses = allCoreCourses.filter(
        course => course.industry_id === selectedIndustryId
      );
      const options = filteredCourses.map(course => ({
        value: course.id,
        label: `${course.code ? course.code + ' - ' : ''}${course.name}`,
        category: course.category
      }));
      setCoreCourses(options);
    } else {
      setCoreCourses([]);
    }
  }, [stepData.industryField, allCoreCourses]);

  const loadIndustryData = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_categories')
        .select('id, parent_id, name, code, level')
        .eq('is_deleted', false)
        .eq('status', 'active')
        .order('code');

      if (error) throw error;

      if (!data || data.length === 0) return;

      const level1Items = data.filter(item => item.level === 1);
      const level2Items = data.filter(item => item.level === 2);
      const level3Items = data.filter(item => item.level === 3);

      const buildTree = () => {
        return level1Items.map(l1 => {
          const l2Children = level2Items
            .filter(l2 => l2.parent_id === l1.id)
            .map(l2 => {
              const l3Children = level3Items
                .filter(l3 => l3.parent_id === l2.id)
                .map(l3 => ({
                  value: l3.id,
                  label: `${l3.code} ${l3.name}`,
                  code: l3.code
                }));

              return {
                value: l2.id,
                label: `${l2.code} ${l2.name}`,
                code: l2.code,
                children: l3Children.length > 0 ? l3Children : undefined
              };
            });

          return {
            value: l1.id,
            label: `${l1.code} ${l1.name}`,
            code: l1.code,
            children: l2Children.length > 0 ? l2Children : undefined
          };
        });
      };

      const treeData = buildTree();
      setIndustryOptions(treeData);
    } catch (error) {
      console.error('加载职业领域数据失败:', error);
    }
  };

  const loadCompetencyData = async () => {
    try {
      const { data, error } = await supabase
        .from('competency_categories')
        .select('id, code, name, level, parent_id')
        .eq('is_deleted', false)
        .eq('status', 'published')
        .order('sort_order')
        .order('code');

      if (error) throw error;

      if (!data || data.length === 0) return;

      const level1Items = data.filter(item => item.level === 1);
      const level2Items = data.filter(item => item.level === 2);
      const level3Items = data.filter(item => item.level === 3);

      const buildTree = () => {
        return level1Items.map(l1 => {
          const l2Children = level2Items
            .filter(l2 => l2.parent_id === l1.id)
            .map(l2 => {
              const l3Children = level3Items
                .filter(l3 => l3.parent_id === l2.id)
                .map(l3 => ({
                  value: l3.id,
                  label: `${l3.code} ${l3.name}`,
                  code: l3.code
                }));

              return {
                value: l2.id,
                label: `${l2.code} ${l2.name}`,
                code: l2.code,
                children: l3Children.length > 0 ? l3Children : undefined
              };
            });

          return {
            value: l1.id,
            label: `${l1.code} ${l1.name}`,
            code: l1.code,
            children: l2Children.length > 0 ? l2Children : undefined
          };
        });
      };

      const treeData = buildTree();
      setCompetencyOptions(treeData);
    } catch (error) {
      console.error('加载能力等级数据失败:', error);
    }
  };

  const loadEducationLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('education_levels')
        .select('id, code, name')
        .eq('is_deleted', false)
        .eq('status', 'published')
        .order('code');

      if (error) throw error;

      if (data && data.length > 0) {
        const options = data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setEducationLevels(options);
      }
    } catch (error) {
      console.error('加载对应目标数据失败:', error);
    }
  };

  const loadStandardCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('standard_courses')
        .select('id, category_name, course_names')
        .eq('status', 'published')
        .order('category_code');

      if (error) throw error;

      if (data && data.length > 0) {
        const options: any[] = [];
        data.forEach(item => {
          if (item.course_names && Array.isArray(item.course_names)) {
            item.course_names.forEach(courseName => {
              options.push({
                value: `${item.id}|${courseName}`,
                label: courseName,
                categoryName: item.category_name
              });
            });
          }
        });
        setStandardCourses(options);
      }
    } catch (error) {
      console.error('加载标准课程数据失败:', error);
    }
  };

  const loadCoreCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('core_courses')
        .select('id, name, code, industry_id, category')
        .eq('status', 'active')
        .order('code');

      if (error) throw error;

      if (data && data.length > 0) {
        setAllCoreCourses(data);
      }
    } catch (error) {
      console.error('加载核心课程数据失败:', error);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setStepData(prev => ({ ...prev, ...values }));

      if (currentStep === 2 && values.resourceInfo?.type === '外链') {
        await handleSubmit();
        return;
      }

      setCurrentStep(prev => prev + 1);
      form.resetFields();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const finalData = { ...stepData, ...values };

      setLoading(true);

      const isExternalLink = finalData.resourceInfo?.type === '外链';

      const industryField = finalData.isGeneralEducation === false && finalData.industryField
        ? (Array.isArray(finalData.industryField) ? finalData.industryField : [finalData.industryField])
        : null;

      const competencyLevel = finalData.competencyLevel
        ? (Array.isArray(finalData.competencyLevel) ? finalData.competencyLevel : [finalData.competencyLevel])
        : null;

      const educationLevel = finalData.educationLevel
        ? (Array.isArray(finalData.educationLevel) ? finalData.educationLevel : [finalData.educationLevel])
        : null;

      // Extract UUID and course name from standardCourseId (format: "UUID|CourseName")
      let standardCourseId = null;
      let courseName = '';

      if (finalData.standardCourseId) {
        const parts = finalData.standardCourseId.split('|');
        standardCourseId = parts[0];
        courseName = parts[1] || '';
      } else if (finalData.coreCourseId) {
        const coreCourse = allCoreCourses.find(c => c.id === finalData.coreCourseId);
        if (coreCourse) {
          courseName = coreCourse.code ? `${coreCourse.code} - ${coreCourse.name}` : coreCourse.name;
        }
      }

      const coreCourseId = finalData.coreCourseId || null;

      if (isExternalLink) {
        const resourceData = {
          title: finalData.resourceInfo?.title || '外部资源',
          development_type: finalData.resourceInfo?.developmentType || null,
          type: '外链',
          format: 'URL',
          file_path: finalData.resourceInfo?.externalUrl || '',
          file_size: 0,
          description: finalData.resourceInfo?.description || null,
          tags: [],
          is_general_education: finalData.isGeneralEducation === true,
          industry_field: industryField,
          competency_level: competencyLevel,
          education_level: educationLevel,
          standard_course_id: standardCourseId,
          core_course_id: coreCourseId,
          course_name: courseName || null,
          download_count: 0,
          uploader: 'Anonymous',
          status: 'draft',
          is_deleted: false
        };

        const { data, error: dbError } = await supabase
          .from('course_resources')
          .insert([resourceData])
          .select();

        if (dbError) {
          throw new Error(`数据库保存失败: ${dbError.message}`);
        }

        message.success('外链资源添加成功！');
        handleClose();
        onSuccess();
        return;
      }

      const fileList = finalData.fileList || [];
      if (fileList.length === 0) {
        message.error('请上传至少一个文件');
        setLoading(false);
        return;
      }

      for (const fileWrapper of fileList) {
        const file = fileWrapper.originFileObj || fileWrapper;

        const fileExtension = file.name.split('.').pop() || '';
        const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const filePath = `resources/${sanitizedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`文件上传失败: ${uploadError.message}`);
        }

        const resourceData = {
          title: finalData.resourceInfo?.title || file.name,
          development_type: finalData.resourceInfo?.developmentType || null,
          type: finalData.resourceInfo?.type || '文档',
          format: finalData.resourceInfo?.format || file.name.split('.').pop()?.toUpperCase() || '未知',
          file_path: filePath,
          file_size: file.size,
          description: finalData.resourceInfo?.description || null,
          tags: [],
          is_general_education: finalData.isGeneralEducation === true,
          industry_field: industryField,
          competency_level: competencyLevel,
          education_level: educationLevel,
          standard_course_id: standardCourseId,
          core_course_id: coreCourseId,
          course_name: courseName || null,
          download_count: 0,
          uploader: 'Anonymous',
          status: 'draft',
          is_deleted: false
        };

        console.log('Inserting resource data:', resourceData);

        const { data, error: dbError } = await supabase
          .from('course_resources')
          .insert([resourceData])
          .select();

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw new Error(`数据库保存失败: ${dbError.message}`);
        }

        console.log('Resource inserted successfully:', data);
      }

      message.success(`成功上传 ${fileList.length} 个资源！`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('上传失败:', error);
      message.error(error.message || '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setStepData({});
    setSelectedCourseType(undefined);
    setSelectedResourceType(undefined);
    setCoreCourses([]);
    form.resetFields();
    onClose();
  };

  const steps = [
    {
      title: '选择课程类型',
    },
    {
      title: '选择能力等级',
    },
    {
      title: '填写资源信息',
    },
    {
      title: '上传资源文件',
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ padding: '40px 0' }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
              请选择课程类型
            </Title>

            <Form form={form} layout="vertical">
              <Form.Item
                name="isGeneralEducation"
                rules={[{ required: true, message: '请选择课程类型' }]}
                initialValue={stepData.isGeneralEducation}
              >
                <Radio.Group
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCourseType(value);
                    form.setFieldsValue({ isGeneralEducation: value });
                    if (value === true) {
                      form.setFieldsValue({ industryField: undefined, coreCourseId: undefined });
                    } else {
                      form.setFieldsValue({ standardCourseId: undefined });
                    }
                  }}
                  value={selectedCourseType}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        hoverable
                        style={{
                          textAlign: 'center',
                          border: selectedCourseType === true ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                        onClick={() => {
                          setSelectedCourseType(true);
                          form.setFieldsValue({ isGeneralEducation: true, industryField: undefined, standardCourseId: undefined, coreCourseId: undefined });
                        }}
                      >
                        <Radio value={true} style={{ marginBottom: 16 }}>
                          <Text strong style={{ fontSize: 16 }}>统一课程</Text>
                        </Radio>
                        <Paragraph type="secondary" style={{ margin: 0 }}>
                          适用于所有专业的基础课程
                        </Paragraph>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        hoverable
                        style={{
                          textAlign: 'center',
                          border: selectedCourseType === false ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                        onClick={() => {
                          setSelectedCourseType(false);
                          form.setFieldsValue({ isGeneralEducation: false, standardCourseId: undefined });
                        }}
                      >
                        <Radio value={false} style={{ marginBottom: 16 }}>
                          <Text strong style={{ fontSize: 16 }}>职业领域课程</Text>
                        </Radio>
                        <Paragraph type="secondary" style={{ margin: 0 }}>
                          特定职业领域的专业课程
                        </Paragraph>
                      </Card>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>

              {selectedCourseType === true && (
                <Form.Item
                  label="课程名称"
                  name="standardCourseId"
                  rules={[{ required: true, message: '请选择课程名称' }]}
                  initialValue={stepData.standardCourseId}
                >
                  <Select
                    placeholder="请选择课程名称"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={standardCourses}
                  />
                </Form.Item>
              )}

              {selectedCourseType === false && (
                <>
                  <Form.Item
                    label="职业领域"
                    name="industryField"
                    rules={[{ required: true, message: '请选择职业领域' }]}
                    initialValue={stepData.industryField}
                  >
                    <Cascader
                      options={industryOptions}
                      placeholder="请选择职业领域（三级）"
                      size="large"
                      showSearch
                      changeOnSelect={false}
                      onChange={(value) => {
                        form.setFieldsValue({ industryField: value, coreCourseId: undefined });
                        setStepData(prev => ({ ...prev, industryField: value as string[] }));
                      }}
                    />
                  </Form.Item>

                  {stepData.industryField && stepData.industryField.length > 0 && (
                    <Form.Item
                      label="课程名称"
                      name="coreCourseId"
                      rules={[{ required: true, message: '请选择课程名称' }]}
                      initialValue={stepData.coreCourseId}
                    >
                      <Select
                        placeholder="请选择课程名称"
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={coreCourses}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Form>
          </div>
        );

      case 1:
        return (
          <div style={{ padding: '40px 0' }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
              选择能力等级
            </Title>

            <Alert
              message="提示"
              description="请选择该资源对应的能力等级（必须选择到三级）"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form form={form} layout="vertical">
              <Form.Item
                label="能力等级"
                name="competencyLevel"
                rules={[{ required: true, message: '请选择能力等级' }]}
                initialValue={stepData.competencyLevel}
              >
                <Cascader
                  options={competencyOptions}
                  placeholder="请选择能力等级（三级）"
                  size="large"
                  showSearch
                  changeOnSelect={false}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="对应目标"
                name="educationLevel"
                rules={[{ required: true, message: '请选择对应目标' }]}
                initialValue={stepData.educationLevel}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择对应目标"
                  size="large"
                  options={educationLevels}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Form>
          </div>
        );

      case 2:
        return (
          <div style={{ padding: '40px 0' }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
              填写资源信息
            </Title>

            <Form form={form} layout="vertical">
              <Form.Item
                label="资源标题"
                name={['resourceInfo', 'title']}
                rules={[{ required: true, message: '请输入资源标题' }]}
                initialValue={stepData.resourceInfo?.title}
              >
                <Input
                  placeholder="请输入资源标题"
                  size="large"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="开发类型"
                name={['resourceInfo', 'developmentType']}
                initialValue={stepData.resourceInfo?.developmentType}
              >
                <Select
                  placeholder="请选择开发类型"
                  size="large"
                  allowClear
                  options={[
                    { label: '新建', value: '新建' },
                    { label: '改造', value: '改造' },
                    { label: '升级', value: '升级' },
                    { label: '遴选', value: '遴选' }
                  ]}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="资源类型"
                    name={['resourceInfo', 'type']}
                    rules={[{ required: true, message: '请选择资源类型' }]}
                    initialValue={stepData.resourceInfo?.type}
                  >
                    <Select
                      placeholder="请选择资源类型"
                      size="large"
                      onChange={(value) => setSelectedResourceType(value)}
                      options={[
                        { label: '教学课件（文档）', value: '教学课件（文档）' },
                        { label: '教学课件（视频）', value: '教学课件（视频）' },
                        { label: '外链', value: '外链' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="文件格式"
                    name={['resourceInfo', 'format']}
                    initialValue={stepData.resourceInfo?.format}
                  >
                    <Select
                      placeholder="请选择文件格式"
                      size="large"
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
                </Col>
              </Row>

              {selectedResourceType === '外链' && (
                <Form.Item
                  label="外部资源URL地址"
                  name={['resourceInfo', 'externalUrl']}
                  rules={[
                    { required: true, message: '请输入外部资源URL地址' },
                    { type: 'url', message: '请输入有效的URL地址' }
                  ]}
                  initialValue={stepData.resourceInfo?.externalUrl}
                >
                  <TextArea
                    placeholder="请输入外部资源的完整URL地址，例如：https://example.com/resource"
                    rows={3}
                    size="large"
                  />
                </Form.Item>
              )}

              <Form.Item
                label="资源描述"
                name={['resourceInfo', 'description']}
                initialValue={stepData.resourceInfo?.description}
              >
                <TextArea
                  placeholder="请输入资源描述（选填）"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </div>
        );

      case 3:
        return (
          <div style={{ padding: '40px 0' }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
              上传资源文件
            </Title>

            <Alert
              message="上传提示"
              description="支持上传 PDF、Word、PPT、Excel、视频等格式，单个文件最大 500MB"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form form={form} layout="vertical">
              <Form.Item
                name="fileList"
                rules={[{ required: true, message: '请上传文件' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持单个或批量上传，最多可上传 5 个文件
                  </p>
                </Dragger>
              </Form.Item>
            </Form>

            <Card style={{ marginTop: 24, background: '#f5f5f5' }}>
              <Title level={5} style={{ marginBottom: 16 }}>已选择的配置信息：</Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">课程类型：</Text>
                  <Tag color="blue">
                    {stepData.isGeneralEducation ? '通识课程' : '专业课程'}
                  </Tag>
                </div>
                {stepData.resourceInfo?.title && (
                  <div>
                    <Text type="secondary">资源标题：</Text>
                    <Text strong>{stepData.resourceInfo.title}</Text>
                  </div>
                )}
                {stepData.resourceInfo?.type && (
                  <div>
                    <Text type="secondary">资源类型：</Text>
                    <Tag>{stepData.resourceInfo.type}</Tag>
                  </div>
                )}
              </Space>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    return (
      <div style={{ marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={handleClose}>取消</Button>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>上一步</Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext} icon={<RightOutlined />}>
                下一步
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                完成上传
              </Button>
            )}
          </Space>
        </Space>
      </div>
    );
  };

  return (
    <Modal
      title="上传课程资源"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Steps
        current={currentStep}
        items={steps}
        style={{ marginBottom: 32 }}
      />

      {renderStepContent()}
      {renderFooter()}
    </Modal>
  );
};

export default CourseResourceUpload;
