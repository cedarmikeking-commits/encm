import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Input, message, Modal, Collapse, List } from 'antd';
import { EditOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface CourseStandardTemplateData {
  id?: string;
  template_name: string;
  template_code: string;
  template_type: string;
  status: string;

  course_target_audience: string;

  course_info: {
    courseName: string;
    courseCode: string;
    credits: string;
    hours: string;
    courseType: string;
    applicableMajors: string;
    prerequisiteCourses: string;
  };

  course_nature: {
    nature: string;
    task: string;
  };

  course_objectives: string;

  course_content: string;

  teaching_implementation: {
    teaching_design: string;
    resource_development: string;
    teacher_requirements: string;
    school_enterprise_cooperation: string;
    textbook_selection: string;
  };

  course_assessment: {
    evaluation_methods: string;
    grading_criteria: string;
  };

  approval_info: {
    creator: string;
    reviewer: string;
    approver: string;
    date: string;
  };

  additional_sections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

const CourseStandardTemplate: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<CourseStandardTemplateData[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<CourseStandardTemplateData>({
    template_name: '课程标准模板',
    template_code: '',
    template_type: 'standard',
    status: 'draft',
    course_target_audience: '',
    course_info: {
      courseName: '',
      courseCode: '',
      credits: '',
      hours: '',
      courseType: '',
      applicableMajors: '',
      prerequisiteCourses: ''
    },
    course_nature: {
      nature: '',
      task: ''
    },
    course_objectives: '',
    course_content: '',
    teaching_implementation: {
      teaching_design: '',
      resource_development: '',
      teacher_requirements: '',
      school_enterprise_cooperation: '',
      textbook_selection: ''
    },
    course_assessment: {
      evaluation_methods: '',
      grading_criteria: ''
    },
    approval_info: {
      creator: '',
      reviewer: '',
      approver: '',
      date: ''
    },
    additional_sections: []
  });

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  useEffect(() => {
    //loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('course_standard_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTemplates(data as CourseStandardTemplateData[]);
        setCurrentTemplate(data[0] as CourseStandardTemplateData);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate.template_name || currentTemplate.template_name.trim() === '') {
      message.warning('请填写模板名称');
      return;
    }

    setLoading(true);
    try {
      if (currentTemplate.id) {
        const { id, created_at, created_by, published_at, ...updateData } = currentTemplate as any;

        const { error } = await supabase
          .from('course_standard_templates')
          .update(updateData)
          .eq('id', currentTemplate.id);

        if (error) throw error;
        message.success('模板保存成功');
      } else {
        const { id, created_at, created_by, updated_at, published_at, ...insertData } = currentTemplate as any;

        const { data, error } = await supabase
          .from('course_standard_templates')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        setCurrentTemplate({ ...currentTemplate, id: data.id });
        message.success('模板创建成功');
      }

      await loadTemplates();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving template:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!currentTemplate.id) {
      message.warning('请先保存模板');
      return;
    }

    if (!currentTemplate.template_name || currentTemplate.template_name.trim() === '') {
      message.warning('请先填写模板名称');
      return;
    }

    Modal.confirm({
      title: '确认发布',
      content: '发布后模板将对所有用户可见，确认要发布吗？',
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('course_standard_templates')
            .update({
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', currentTemplate.id);

          if (error) throw error;

          setCurrentTemplate({ ...currentTemplate, status: 'published' });
          message.success('模板发布成功');
          await loadTemplates();
        } catch (error) {
          console.error('Error publishing template:', error);
          message.error('发布失败，请重试');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const extractSectionNumber = (title: string): number => {
    const chineseNumbers: { [key: string]: number } = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    };

    const match = title.match(/^([一二三四五六七八九十]+)、/);
    if (match && chineseNumbers[match[1]]) {
      return chineseNumbers[match[1]];
    }

    const arabicMatch = title.match(/^(\d+)、/);
    if (arabicMatch) {
      return parseInt(arabicMatch[1], 10);
    }

    return 999;
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      message.warning('请输入章节标题');
      return;
    }

    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle.trim(),
      content: newSectionContent.trim()
    };

    const currentSections = currentTemplate.additional_sections || [];
    const updatedSections = [...currentSections, newSection].sort((a, b) => {
      return extractSectionNumber(a.title) - extractSectionNumber(b.title);
    });

    setCurrentTemplate({
      ...currentTemplate,
      additional_sections: updatedSections
    });

    setNewSectionTitle('');
    setNewSectionContent('');
    setShowAddSectionModal(false);
    message.success('章节添加成功');
  };

  const handleDeleteSection = (sectionId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个章节吗？',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setCurrentTemplate({
          ...currentTemplate,
          additional_sections: (currentTemplate.additional_sections || []).filter(s => s.id !== sectionId)
        });
        message.success('章节已删除');
      }
    });
  };

  const handleUpdateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setCurrentTemplate({
      ...currentTemplate,
      additional_sections: (currentTemplate.additional_sections || []).map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    });
  };

  const handleUnpublish = async () => {
    if (!currentTemplate.id) {
      message.warning('模板不存在');
      return;
    }

    Modal.confirm({
      title: '确认取消发布',
      content: '取消发布后，模板将变为草稿状态，其他用户将无法查看，确认要取消发布吗？',
      okText: '确认取消',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('course_standard_templates')
            .update({
              status: 'draft',
              published_at: null
            })
            .eq('id', currentTemplate.id);

          if (error) throw error;

          setCurrentTemplate({ ...currentTemplate, status: 'draft' });
          message.success('已取消发布');
          await loadTemplates();
        } catch (error) {
          console.error('Error unpublishing template:', error);
          message.error('取消发布失败，请重试');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Title level={4} style={{ margin: 0 }}>课程标准模板</Title>
                {currentTemplate.status === 'published' && (
                  <Text type="success">
                    <CheckCircleOutlined /> 已发布
                  </Text>
                )}
              </Space>
              <Space>
                {!isEditing ? (
                  <>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                    >
                      编辑模板
                    </Button>
                    {currentTemplate.status !== 'published' ? (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handlePublish}
                        loading={loading}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      >
                        发布模板
                      </Button>
                    ) : (
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={handleUnpublish}
                        loading={loading}
                      >
                        取消发布
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => setShowAddSectionModal(true)}
                    >
                      添加项
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>取消</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      保存模板
                    </Button>
                  </>
                )}
              </Space>
            </div>

            <div>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>模板名称 <Text type="danger">*</Text></Text>
                {isEditing ? (
                  <Input
                    value={currentTemplate.template_name}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, template_name: e.target.value })}
                    placeholder="请输入模板名称（必填）"
                    size="large"
                    status={!currentTemplate.template_name || currentTemplate.template_name.trim() === '' ? 'error' : ''}
                  />
                ) : (
                  <Text style={{ fontSize: '16px' }}>{currentTemplate.template_name || '未设置'}</Text>
                )}
              </Space>
            </div>
          </Space>
        </Card>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            fontFamily: '仿宋, SimSun, serif'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              {isEditing ? (
                <Input
                  value={currentTemplate.course_info.courseName}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      course_info: { ...currentTemplate.course_info, courseName: e.target.value }
                    })
                  }
                  placeholder="课程名称"
                  style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}
                />
              ) : (
                <Title level={2} style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                  {currentTemplate.course_info.courseName || '[课程名称]'}
                </Title>
              )}
              <Title level={3} style={{ marginBottom: '0', fontWeight: 'normal', color: '#666' }}>
                课程标准
              </Title>
            </div>

            <div style={{
              marginBottom: '48px',
              padding: '24px',
              border: '1px solid #d9d9d9',
              pageBreakAfter: 'always'
            }}>
              <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', fontSize: '22px', letterSpacing: '8px' }}>
                目    录
              </Title>

              <div style={{ fontSize: '16px', lineHeight: '2.2' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-1" style={{ color: '#000', textDecoration: 'none' }}>
                    一、课程适应对象
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-2" style={{ color: '#000', textDecoration: 'none' }}>
                    二、课程基本信息
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-3" style={{ color: '#000', textDecoration: 'none' }}>
                    三、课程性质与任务
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-3-1" style={{ color: '#000', textDecoration: 'none' }}>
                    （一）课程性质
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-3-2" style={{ color: '#000', textDecoration: 'none' }}>
                    （二）课程任务
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-4" style={{ color: '#000', textDecoration: 'none' }}>
                    四、课程目标
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>................................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-5" style={{ color: '#000', textDecoration: 'none' }}>
                    五、课程内容
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>................................................................................................................................................................4</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6" style={{ color: '#000', textDecoration: 'none' }}>
                    六、教学实施与保障
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................8</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6-1" style={{ color: '#000', textDecoration: 'none' }}>
                    （一）教学设计
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................8</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6-2" style={{ color: '#000', textDecoration: 'none' }}>
                    （二）教学资源开发与应用
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................8</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6-3" style={{ color: '#000', textDecoration: 'none' }}>
                    （三）师资要求
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>.....................................................................................................................................................8</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6-4" style={{ color: '#000', textDecoration: 'none' }}>
                    （四）校企合作情况
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>............................................................................................................................................8</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-6-5" style={{ color: '#000', textDecoration: 'none' }}>
                    （五）教材选用及辅助教学资料
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>.............................................................................................................................9</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <a href="#section-7" style={{ color: '#000', textDecoration: 'none' }}>
                    七、课程考核与评价
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>......................................................................................................................................................9</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <a href="#section-7-1" style={{ color: '#000', textDecoration: 'none' }}>
                    （一）课程评价方法
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>................................................................................................................................................9</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px'
                }}>
                  <a href="#section-7-2" style={{ color: '#000', textDecoration: 'none' }}>
                    （二）评分标准
                  </a>
                  <span style={{ fontFamily: 'Arial' }}>......................................................................................................................................................9</span>
                </div>

                {currentTemplate.additional_sections && currentTemplate.additional_sections.length > 0 && (
                  currentTemplate.additional_sections.map((section, index) => (
                    <div key={section.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      marginBottom: '2px'
                    }}>
                      <a href={`#section-additional-${section.id}`} style={{ color: '#000', textDecoration: 'none' }}>
                        {section.title}
                      </a>
                      <span style={{ fontFamily: 'Arial' }}>{'.'.repeat(150)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-1">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                一、课程适应对象
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_target_audience}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, course_target_audience: e.target.value })}
                  placeholder="请描述课程适应对象..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.course_target_audience || '[课程适应对象描述...]'}
                </Paragraph>
              )}
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-2">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                二、课程基本信息
              </Title>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <Text strong>课程名称：</Text>
                    {isEditing ? (
                      <Input
                        value={currentTemplate.course_info.courseName}
                        onChange={e =>
                          setCurrentTemplate({
                            ...currentTemplate,
                            course_info: { ...currentTemplate.course_info, courseName: e.target.value }
                          })
                        }
                        placeholder="课程名称"
                      />
                    ) : (
                      <Text>{currentTemplate.course_info.courseName || '-'}</Text>
                    )}
                  </div>
                  <div>
                    <Text strong>课程代码：</Text>
                    {isEditing ? (
                      <Input
                        value={currentTemplate.course_info.courseCode}
                        onChange={e =>
                          setCurrentTemplate({
                            ...currentTemplate,
                            course_info: { ...currentTemplate.course_info, courseCode: e.target.value }
                          })
                        }
                        placeholder="课程代码"
                      />
                    ) : (
                      <Text>{currentTemplate.course_info.courseCode || '-'}</Text>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <Text strong>学分：</Text>
                    {isEditing ? (
                      <Input
                        value={currentTemplate.course_info.credits}
                        onChange={e =>
                          setCurrentTemplate({
                            ...currentTemplate,
                            course_info: { ...currentTemplate.course_info, credits: e.target.value }
                          })
                        }
                        placeholder="学分"
                      />
                    ) : (
                      <Text>{currentTemplate.course_info.credits || '-'}</Text>
                    )}
                  </div>
                  <div>
                    <Text strong>学时：</Text>
                    {isEditing ? (
                      <Input
                        value={currentTemplate.course_info.hours}
                        onChange={e =>
                          setCurrentTemplate({
                            ...currentTemplate,
                            course_info: { ...currentTemplate.course_info, hours: e.target.value }
                          })
                        }
                        placeholder="学时"
                      />
                    ) : (
                      <Text>{currentTemplate.course_info.hours || '-'}</Text>
                    )}
                  </div>
                </div>

                <div>
                  <Text strong>课程类型：</Text>
                  {isEditing ? (
                    <Input
                      value={currentTemplate.course_info.courseType}
                      onChange={e =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          course_info: { ...currentTemplate.course_info, courseType: e.target.value }
                        })
                      }
                      placeholder="课程类型"
                    />
                  ) : (
                    <Text>{currentTemplate.course_info.courseType || '-'}</Text>
                  )}
                </div>

                <div>
                  <Text strong>授课时间：</Text>
                  {isEditing ? (
                    <Input
                      value={currentTemplate.course_info.applicableMajors}
                      onChange={e =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          course_info: { ...currentTemplate.course_info, applicableMajors: e.target.value }
                        })
                      }
                      placeholder="授课时间"
                    />
                  ) : (
                    <Text>{currentTemplate.course_info.applicableMajors || '-'}</Text>
                  )}
                </div>

                <div>
                  <Text strong>授课对象：</Text>
                  {isEditing ? (
                    <Input
                      value={currentTemplate.course_info.prerequisiteCourses}
                      onChange={e =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          course_info: { ...currentTemplate.course_info, prerequisiteCourses: e.target.value }
                        })
                      }
                      placeholder="授课对象"
                    />
                  ) : (
                    <Text>{currentTemplate.course_info.prerequisiteCourses || '-'}</Text>
                  )}
                </div>
              </Space>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-3">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                三、课程性质与任务
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-3-1">
                （一）课程性质
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_nature.nature}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      course_nature: {
                        ...currentTemplate.course_nature,
                        nature: e.target.value
                      }
                    })
                  }
                  placeholder="课程性质描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.course_nature.nature || '[课程性质描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-3-2">
                （二）课程任务
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_nature.task}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      course_nature: {
                        ...currentTemplate.course_nature,
                        task: e.target.value
                      }
                    })
                  }
                  placeholder="课程任务描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.course_nature.task || '[课程任务描述...]'}
                </Paragraph>
              )}
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-4">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                四、课程目标
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_objectives}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, course_objectives: e.target.value })}
                  placeholder="课程目标描述..."
                  autoSize={{ minRows: 6 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {currentTemplate.course_objectives || '[课程目标描述...]'}
                </Paragraph>
              )}
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-5">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                五、课程内容
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_content}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, course_content: e.target.value })}
                  placeholder="课程内容描述..."
                  autoSize={{ minRows: 8 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {currentTemplate.course_content || '[课程内容描述...]'}
                </Paragraph>
              )}
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-6">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                六、教学实施与保障
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-6-1">
                （一）教学设计
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.teaching_implementation.teaching_design}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      teaching_implementation: {
                        ...currentTemplate.teaching_implementation,
                        teaching_design: e.target.value
                      }
                    })
                  }
                  placeholder="教学设计描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.teaching_implementation.teaching_design || '[教学设计描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-6-2">
                （二）教学资源开发与应用
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.teaching_implementation.resource_development}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      teaching_implementation: {
                        ...currentTemplate.teaching_implementation,
                        resource_development: e.target.value
                      }
                    })
                  }
                  placeholder="教学资源开发与应用描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.teaching_implementation.resource_development || '[教学资源开发与应用描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-6-3">
                （三）师资要求
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.teaching_implementation.teacher_requirements}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      teaching_implementation: {
                        ...currentTemplate.teaching_implementation,
                        teacher_requirements: e.target.value
                      }
                    })
                  }
                  placeholder="师资要求描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.teaching_implementation.teacher_requirements || '[师资要求描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-6-4">
                （四）校企合作情况
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.teaching_implementation.school_enterprise_cooperation}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      teaching_implementation: {
                        ...currentTemplate.teaching_implementation,
                        school_enterprise_cooperation: e.target.value
                      }
                    })
                  }
                  placeholder="校企合作情况描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.teaching_implementation.school_enterprise_cooperation || '[校企合作情况描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-6-5">
                （五）教材选用及辅助教学资料
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.teaching_implementation.textbook_selection}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      teaching_implementation: {
                        ...currentTemplate.teaching_implementation,
                        textbook_selection: e.target.value
                      }
                    })
                  }
                  placeholder="教材选用及辅助教学资料描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.teaching_implementation.textbook_selection || '[教材选用及辅助教学资料描述...]'}
                </Paragraph>
              )}
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }} id="section-7">
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                七、课程考核与评价
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-7-1">
                （一）课程评价方法
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_assessment.evaluation_methods}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      course_assessment: {
                        ...currentTemplate.course_assessment,
                        evaluation_methods: e.target.value
                      }
                    })
                  }
                  placeholder="课程评价方法描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px', marginBottom: '16px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.course_assessment.evaluation_methods || '[课程评价方法描述...]'}
                </Paragraph>
              )}

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }} id="section-7-2">
                （二）评分标准
              </Title>
              {isEditing ? (
                <TextArea
                  value={currentTemplate.course_assessment.grading_criteria}
                  onChange={e =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      course_assessment: {
                        ...currentTemplate.course_assessment,
                        grading_criteria: e.target.value
                      }
                    })
                  }
                  placeholder="评分标准描述..."
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px' }}>
                  {currentTemplate.course_assessment.grading_criteria || '[评分标准描述...]'}
                </Paragraph>
              )}
            </Card>

            {currentTemplate.additional_sections && currentTemplate.additional_sections.length > 0 && (
              currentTemplate.additional_sections.map((section, index) => (
                <Card key={section.id} bordered={false} style={{ boxShadow: 'none', marginTop: '24px' }} id={`section-additional-${section.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    {isEditing ? (
                      <Input
                        value={section.title}
                        onChange={e => handleUpdateSection(section.id, 'title', e.target.value)}
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderBottom: '2px solid #000',
                          borderRadius: 0,
                          paddingLeft: 0
                        }}
                      />
                    ) : (
                      <Title level={4} style={{ marginBottom: 0, borderBottom: '2px solid #000', paddingBottom: '8px', flex: 1 }}>
                        {section.title}
                      </Title>
                    )}
                    {isEditing && (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSection(section.id)}
                        style={{ marginLeft: '16px' }}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <TextArea
                      value={section.content}
                      onChange={e => handleUpdateSection(section.id, 'content', e.target.value)}
                      placeholder="请输入内容..."
                      autoSize={{ minRows: 3 }}
                      style={{ fontSize: '14px' }}
                    />
                  ) : (
                    <Paragraph style={{ textIndent: '2em', lineHeight: '2', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                      {section.content || '[内容...]'}
                    </Paragraph>
                  )}
                </Card>
              ))
            )}

            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '350px' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {isEditing ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ minWidth: '85px', fontSize: '14px' }}>制定人：</Text>
                        <Input
                          value={currentTemplate.approval_info.creator}
                          onChange={e =>
                            setCurrentTemplate({
                              ...currentTemplate,
                              approval_info: { ...currentTemplate.approval_info, creator: e.target.value }
                            })
                          }
                          placeholder="________"
                          bordered={false}
                          style={{
                            borderBottom: '1px solid #000',
                            borderRadius: 0,
                            padding: '0 4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ minWidth: '85px', fontSize: '14px' }}>审核人：</Text>
                        <Input
                          value={currentTemplate.approval_info.reviewer}
                          onChange={e =>
                            setCurrentTemplate({
                              ...currentTemplate,
                              approval_info: { ...currentTemplate.approval_info, reviewer: e.target.value }
                            })
                          }
                          placeholder="________"
                          bordered={false}
                          style={{
                            borderBottom: '1px solid #000',
                            borderRadius: 0,
                            padding: '0 4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ minWidth: '85px', fontSize: '14px' }}>批准人：</Text>
                        <Input
                          value={currentTemplate.approval_info.approver}
                          onChange={e =>
                            setCurrentTemplate({
                              ...currentTemplate,
                              approval_info: { ...currentTemplate.approval_info, approver: e.target.value }
                            })
                          }
                          placeholder="________"
                          bordered={false}
                          style={{
                            borderBottom: '1px solid #000',
                            borderRadius: 0,
                            padding: '0 4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ minWidth: '85px', fontSize: '14px' }}>制定日期：</Text>
                        <Input
                          value={currentTemplate.approval_info.date}
                          onChange={e =>
                            setCurrentTemplate({
                              ...currentTemplate,
                              approval_info: { ...currentTemplate.approval_info, date: e.target.value }
                            })
                          }
                          placeholder="________"
                          bordered={false}
                          style={{
                            borderBottom: '1px solid #000',
                            borderRadius: 0,
                            padding: '0 4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: '14px' }}>制定人：{currentTemplate.approval_info.creator || '___________'}</Text>
                      <Text style={{ fontSize: '14px' }}>审核人：{currentTemplate.approval_info.reviewer || '___________'}</Text>
                      <Text style={{ fontSize: '14px' }}>批准人：{currentTemplate.approval_info.approver || '___________'}</Text>
                      <Text style={{ fontSize: '14px' }}>制定日期：{currentTemplate.approval_info.date || '____年__月__日'}</Text>
                    </>
                  )}
                </Space>
              </div>
            </div>
          </Space>
        </div>
      </div>

      <Modal
        title="添加新章节"
        open={showAddSectionModal}
        onOk={handleAddSection}
        onCancel={() => {
          setShowAddSectionModal(false);
          setNewSectionTitle('');
          setNewSectionContent('');
        }}
        okText="添加"
        cancelText="取消"
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>章节标题：</Text>
            <Input
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              placeholder="例如：八、附录"
              maxLength={50}
            />
          </div>
          <div>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>章节内容：</Text>
            <TextArea
              value={newSectionContent}
              onChange={e => setNewSectionContent(e.target.value)}
              placeholder="请输入章节内容..."
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default CourseStandardTemplate;
