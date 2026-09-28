import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  message,
  Spin,
  Form,
  Row,
  Col,
  Result
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TemplateData {
  id: string;
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
}

interface EditCourseStandardProps {
  standardId: string;
  onBack?: () => void;
  onSaveSuccess?: () => void;
}

const EditCourseStandard: React.FC<EditCourseStandardProps> = ({ standardId, onBack, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [standardData, setStandardData] = useState<TemplateData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    //loadStandardData();
  }, [standardId]);

  const loadStandardData = async () => {
    setLoading(true);
    try {
      const { data: standardData, error: standardError } = await supabase
        .from('course_standards')
        .select('*')
        .eq('id', standardId)
        .maybeSingle();

      if (standardError) throw standardError;

      if (standardData) {
        const teachingImpl = standardData.teaching_implementation || {};
        const formattedData: TemplateData = {
          id: standardData.id,
          template_name: standardData.standard_name || '课程标准',
          template_code: standardData.standard_code || '',
          template_type: teachingImpl.course_type || '',
          status: standardData.status,
          course_target_audience: standardData.course_target_audience || '',
          course_info: {
            courseName: standardData.course_name || '',
            courseCode: standardData.course_code || '',
            credits: standardData.credits?.toString() || '',
            hours: standardData.hours?.toString() || '',
            courseType: teachingImpl.course_type || '',
            applicableMajors: teachingImpl.applicable_majors || '',
            prerequisiteCourses: teachingImpl.prerequisite_courses || ''
          },
          course_nature: standardData.course_nature_task || {
            nature: '',
            task: ''
          },
          course_objectives: standardData.course_objectives || '',
          course_content: standardData.course_content || '',
          teaching_implementation: {
            teaching_design: teachingImpl.teaching_design || '',
            resource_development: teachingImpl.resource_development || '',
            teacher_requirements: teachingImpl.teacher_requirements || '',
            school_enterprise_cooperation: teachingImpl.school_enterprise_cooperation || '',
            textbook_selection: teachingImpl.textbook_selection || ''
          },
          course_assessment: standardData.course_assessment || {
            evaluation_methods: '',
            grading_criteria: ''
          },
          approval_info: {
            creator: standardData.development_team?.creator || standardData.responsible_person || '',
            reviewer: standardData.development_team?.reviewer || '',
            approver: standardData.development_team?.approver || '',
            date: standardData.development_team?.date || ''
          }
        };

        setStandardData(formattedData);
      } else {
        const { data: coreCourseData, error: coreCourseError } = await supabase
          .from('core_courses')
          .select('*')
          .eq('id', standardId)
          .maybeSingle();

        if (coreCourseError) throw coreCourseError;

        if (coreCourseData) {
          const formattedData: TemplateData = {
            id: coreCourseData.id,
            template_name: '课程标准',
            template_code: '',
            template_type: '',
            status: 'draft',
            course_target_audience: '',
            course_info: {
              courseName: coreCourseData.name || '',
              courseCode: coreCourseData.code || '',
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
            }
          };

          setStandardData(formattedData);
        } else {
          const { data: domainCourseData, error: domainCourseError } = await supabase
            .from('domain_courses')
            .select('*')
            .eq('id', standardId)
            .maybeSingle();

          if (domainCourseError) throw domainCourseError;

          if (domainCourseData) {
            const formattedData: TemplateData = {
              id: domainCourseData.id,
              template_name: domainCourseData.standard_name || '课程标准',
              template_code: domainCourseData.standard_code || '',
              template_type: '',
              status: domainCourseData.status || 'draft',
              course_target_audience: '',
              course_info: {
                courseName: domainCourseData.course_names?.[0] || '',
                courseCode: domainCourseData.standard_code || '',
                credits: domainCourseData.credits_per_course?.toString() || '',
                hours: domainCourseData.hours_per_course?.toString() || '',
                courseType: '',
                applicableMajors: '',
                prerequisiteCourses: ''
              },
              course_nature: {
                nature: domainCourseData.course_nature || '',
                task: ''
              },
              course_objectives: domainCourseData.target_objectives || '',
              course_content: domainCourseData.course_content || '',
              teaching_implementation: {
                teaching_design: '',
                resource_development: '',
                teacher_requirements: '',
                school_enterprise_cooperation: '',
                textbook_selection: ''
              },
              course_assessment: {
                evaluation_methods: domainCourseData.evaluation_method || '',
                grading_criteria: ''
              },
              approval_info: {
                creator: domainCourseData.created_by || '',
                reviewer: '',
                approver: '',
                date: ''
              }
            };

            setStandardData(formattedData);
          } else {
            setNotFound(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading standard:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!standardData) {
      message.error('数据未加载');
      return;
    }
    if (loading) {
      message.warning('正在保存中，请稍候...');
      return;
    }

    if (!standardData.course_info.courseName || standardData.course_info.courseName.trim() === '') {
      message.warning('请填写课程名称');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        standard_name: standardData.template_name || '课程标准',
        course_name: standardData.course_info.courseName,
        course_code: standardData.course_info.courseCode || '',
        credits: parseFloat(standardData.course_info.credits) || null,
        hours: parseInt(standardData.course_info.hours) || null,
        practice_hours: parseInt(standardData.course_info.hours) || null,
        status: publish ? 'pending_review' : (standardData.status || 'draft'),
        course_target_audience: standardData.course_target_audience || '',
        course_nature_task: standardData.course_nature || {},
        course_objectives: standardData.course_objectives || '',
        course_content: standardData.course_content || '',
        teaching_implementation: {
          ...(standardData.teaching_implementation || {}),
          course_type: standardData.course_info.courseType || '',
          applicable_majors: standardData.course_info.applicableMajors || '',
          prerequisite_courses: standardData.course_info.prerequisiteCourses || ''
        },
        course_assessment: standardData.course_assessment || {},
        responsible_person: standardData.approval_info?.creator || '',
        development_team: {
          creator: standardData.approval_info?.creator || '',
          reviewer: standardData.approval_info?.reviewer || '',
          approver: standardData.approval_info?.approver || '',
          date: standardData.approval_info?.date || ''
        },
        updated_at: new Date().toISOString()
      };

      console.log('Saving data:', updateData);

      const { data, error } = await supabase
        .from('course_standards')
        .update(updateData)
        .eq('id', standardId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Save result:', data);
      message.success(publish ? '课程标准已提交审核' : '课程标准保存成功');

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      console.error('Error saving standard:', error);
      message.error(`保存失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStandardData = (path: string[], value: any) => {
    if (!standardData) return;

    const newData = { ...standardData };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = { ...current[path[i]] };
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setStandardData(newData);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="正在加载课程标准..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
          >
            返回
          </Button>
        </div>
        <Card>
          <Result
            icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
            title="暂无课程标准数据"
            subTitle="该课程尚未创建课程标准，您可以返回列表页面选择其他课程编辑。"
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={onBack}
              >
                返回列表
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  if (!standardData) {
    return null;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={onBack}
                >
                  返回
                </Button>
              </Space>

              <Space>
                <Button
                  onClick={() => {
                    if (loading) {
                      console.log('Already saving, ignoring click');
                      return;
                    }
                    handleSave(false);
                  }}
                  loading={loading}
                  disabled={loading}
                  icon={<SaveOutlined />}
                >
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    if (loading) {
                      console.log('Already saving, ignoring click');
                      return;
                    }
                    handleSave(true);
                  }}
                  loading={loading}
                  disabled={loading || standardData.status === 'published' || standardData.status === 'pending_review'}
                  icon={<CheckCircleOutlined />}
                >
                  {standardData.status === 'pending_review' ? '待专家审核' :
                   standardData.status === 'published' ? '已发布' : '提交审核'}
                </Button>
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
              <Input
                value={standardData.course_info.courseName}
                onChange={e => updateStandardData(['course_info', 'courseName'], e.target.value)}
                placeholder="请输入课程名称"
                style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}
              />
              <Input
                value={standardData.template_name}
                onChange={e => updateStandardData(['template_name'], e.target.value)}
                placeholder="课程标准"
                style={{ fontSize: '20px', textAlign: 'center' }}
              />
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
                  <span style={{ color: '#000' }}>一、课程适应对象</span>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>二、课程基本信息</span>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>三、课程性质与任务</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（一）课程性质</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（二）课程任务</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................1</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>四、课程目标</span>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................2</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>五、课程内容</span>
                  <span style={{ fontFamily: 'Arial' }}>........................................................................................................................................................2</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>六、教学实施与保障</span>
                  <span style={{ fontFamily: 'Arial' }}>............................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（一）教学设计</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（二）教学资源开发与应用</span>
                  <span style={{ fontFamily: 'Arial' }}>..................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（三）师资要求</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（四）校企合作情况</span>
                  <span style={{ fontFamily: 'Arial' }}>............................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（五）教材选用及辅助教学资料</span>
                  <span style={{ fontFamily: 'Arial' }}>..................................................................................................................................3</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>七、课程考核与评价</span>
                  <span style={{ fontFamily: 'Arial' }}>............................................................................................................................................4</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（一）课程评价方法</span>
                  <span style={{ fontFamily: 'Arial' }}>............................................................................................................................................4</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 8px 32px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#000' }}>（二）评分标准</span>
                  <span style={{ fontFamily: 'Arial' }}>....................................................................................................................................................4</span>
                </div>
              </div>
            </div>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                一、课程适应对象
              </Title>
              <TextArea
                value={standardData.course_target_audience}
                onChange={e => updateStandardData(['course_target_audience'], e.target.value)}
                placeholder="请描述课程适应对象..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                二、课程基本信息
              </Title>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Space>
                      <Text strong>课程名称：</Text>
                      <Input
                        value={standardData.course_info.courseName}
                        onChange={e => updateStandardData(['course_info', 'courseName'], e.target.value)}
                        placeholder="课程名称"
                      />
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Text strong>课程代码：</Text>
                      <Input
                        value={standardData.course_info.courseCode}
                        onChange={e => updateStandardData(['course_info', 'courseCode'], e.target.value)}
                        placeholder="课程代码"
                      />
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Space>
                      <Text strong>学分：</Text>
                      <Input
                        value={standardData.course_info.credits}
                        onChange={e => updateStandardData(['course_info', 'credits'], e.target.value)}
                        placeholder="学分"
                      />
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Text strong>学时：</Text>
                      <Input
                        value={standardData.course_info.hours}
                        onChange={e => updateStandardData(['course_info', 'hours'], e.target.value)}
                        placeholder="学时"
                      />
                    </Space>
                  </Col>
                </Row>

                <div>
                  <Text strong>课程类型：</Text>
                  <Input
                    value={standardData.course_info.courseType}
                    onChange={e => updateStandardData(['course_info', 'courseType'], e.target.value)}
                    placeholder="课程类型"
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>

                <div>
                  <Text strong>授课时间：</Text>
                  <Input
                    value={standardData.course_info.applicableMajors}
                    onChange={e => updateStandardData(['course_info', 'applicableMajors'], e.target.value)}
                    placeholder="授课时间"
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>

                <div>
                  <Text strong>授课对象：</Text>
                  <Input
                    value={standardData.course_info.prerequisiteCourses}
                    onChange={e => updateStandardData(['course_info', 'prerequisiteCourses'], e.target.value)}
                    placeholder="授课对象"
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
              </Space>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                三、课程性质与任务
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （一）课程性质
              </Title>
              <TextArea
                value={standardData.course_nature.nature}
                onChange={e => updateStandardData(['course_nature', 'nature'], e.target.value)}
                placeholder="课程性质描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）课程任务
              </Title>
              <TextArea
                value={standardData.course_nature.task}
                onChange={e => updateStandardData(['course_nature', 'task'], e.target.value)}
                placeholder="课程任务描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                四、课程目标
              </Title>
              <TextArea
                value={standardData.course_objectives}
                onChange={e => updateStandardData(['course_objectives'], e.target.value)}
                placeholder="课程目标描述..."
                autoSize={{ minRows: 6 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                五、课程内容
              </Title>
              <TextArea
                value={standardData.course_content}
                onChange={e => updateStandardData(['course_content'], e.target.value)}
                placeholder="课程内容描述..."
                autoSize={{ minRows: 8 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                六、教学实施与保障
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （一）教学设计
              </Title>
              <TextArea
                value={standardData.teaching_implementation.teaching_design}
                onChange={e => updateStandardData(['teaching_implementation', 'teaching_design'], e.target.value)}
                placeholder="教学设计描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）教学资源开发与应用
              </Title>
              <TextArea
                value={standardData.teaching_implementation.resource_development}
                onChange={e => updateStandardData(['teaching_implementation', 'resource_development'], e.target.value)}
                placeholder="教学资源开发与应用描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （三）师资要求
              </Title>
              <TextArea
                value={standardData.teaching_implementation.teacher_requirements}
                onChange={e => updateStandardData(['teaching_implementation', 'teacher_requirements'], e.target.value)}
                placeholder="师资要求描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （四）校企合作情况
              </Title>
              <TextArea
                value={standardData.teaching_implementation.school_enterprise_cooperation}
                onChange={e => updateStandardData(['teaching_implementation', 'school_enterprise_cooperation'], e.target.value)}
                placeholder="校企合作情况描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （五）教材选用及辅助教学资料
              </Title>
              <TextArea
                value={standardData.teaching_implementation.textbook_selection}
                onChange={e => updateStandardData(['teaching_implementation', 'textbook_selection'], e.target.value)}
                placeholder="教材选用及辅助教学资料描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                七、课程考核与评价
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （一）课程评价方法
              </Title>
              <TextArea
                value={standardData.course_assessment.evaluation_methods}
                onChange={e => updateStandardData(['course_assessment', 'evaluation_methods'], e.target.value)}
                placeholder="课程评价方法描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px', marginBottom: '16px' }}
              />

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）评分标准
              </Title>
              <TextArea
                value={standardData.course_assessment.grading_criteria}
                onChange={e => updateStandardData(['course_assessment', 'grading_criteria'], e.target.value)}
                placeholder="评分标准描述..."
                autoSize={{ minRows: 3 }}
                style={{ fontSize: '14px' }}
              />
            </Card>

            <div style={{ marginTop: '48px', textAlign: 'right' }}>
              <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
                <Input
                  value={standardData.approval_info.creator}
                  onChange={e => updateStandardData(['approval_info', 'creator'], e.target.value)}
                  placeholder="制定人"
                  prefix="制定人："
                  style={{ width: '200px' }}
                />
                <Input
                  value={standardData.approval_info.reviewer}
                  onChange={e => updateStandardData(['approval_info', 'reviewer'], e.target.value)}
                  placeholder="审核人"
                  prefix="审核人："
                  style={{ width: '200px' }}
                />
                <Input
                  value={standardData.approval_info.approver}
                  onChange={e => updateStandardData(['approval_info', 'approver'], e.target.value)}
                  placeholder="批准人"
                  prefix="批准人："
                  style={{ width: '200px' }}
                />
                <Input
                  value={standardData.approval_info.date}
                  onChange={e => updateStandardData(['approval_info', 'date'], e.target.value)}
                  placeholder="制定日期"
                  prefix="制定日期："
                  style={{ width: '200px' }}
                />
              </Space>
            </div>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default EditCourseStandard;
