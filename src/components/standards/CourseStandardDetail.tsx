import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Spin,
  message,
  Row,
  Col,
  Tag,
  Result
} from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;

interface CourseStandardDetailProps {
  standardId: string;
  onBack?: () => void;
  onClose?: () => void;
}

interface StandardData {
  id: string;
  standard_code: string;
  standard_name: string;
  course_name: string;
  course_code: string;
  ivrl_level: string;
  credits: number;
  hours: number;
  theory_hours: number;
  practice_hours: number;
  version: string;
  status: string;
  course_target_audience: string;
  course_type?: string;
  applicable_majors?: string;
  prerequisite_courses?: string;
  course_nature_task: {
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
  responsible_person: string;
  responsible_department: string;
  development_team?: {
    creator?: string;
    reviewer?: string;
    approver?: string;
    date?: string;
  };
  created_at: string;
  updated_at: string;
}

const CourseStandardDetail: React.FC<CourseStandardDetailProps> = ({ standardId, onBack, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [standardData, setStandardData] = useState<StandardData | null>(null);
  const [notFound, setNotFound] = useState(false);

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
        setStandardData({
          ...standardData,
          course_type: teachingImpl.course_type || '',
          applicable_majors: teachingImpl.applicable_majors || '',
          prerequisite_courses: teachingImpl.prerequisite_courses || ''
        } as StandardData);
      } else {
        const { data: coreCourseData, error: coreCourseError } = await supabase
          .from('core_courses')
          .select(`
            *,
            industry_categories(name),
            education_levels(id, name, code)
          `)
          .eq('id', standardId)
          .maybeSingle();

        if (coreCourseError) throw coreCourseError;

        if (coreCourseData) {
          const educationLevel = coreCourseData.education_levels;
          const ivrlLevelDisplay = educationLevel ? educationLevel.name : '';
          const industryName = coreCourseData.industry_categories?.name || '';

          setStandardData({
            id: coreCourseData.id,
            standard_name: '',
            course_code: coreCourseData.code,
            course_name: coreCourseData.name,
            credits: 0,
            practical_hours: 0,
            ivrl_level: ivrlLevelDisplay,
            industry: industryName,
            course_type: '',
            applicable_majors: '',
            prerequisite_courses: '',
            course_nature_task: {
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
            responsible_person: '',
            responsible_department: '',
            created_at: coreCourseData.created_at || '',
            updated_at: coreCourseData.updated_at || ''
          } as StandardData);
        } else {
          const { data: domainCourseData, error: domainCourseError } = await supabase
            .from('domain_courses')
            .select('*')
            .eq('id', standardId)
            .maybeSingle();

          if (domainCourseError) throw domainCourseError;

          if (domainCourseData) {
            setStandardData({
              id: domainCourseData.id,
              standard_name: domainCourseData.standard_name || '',
              course_code: domainCourseData.standard_code || '',
              course_name: domainCourseData.course_names?.[0] || '',
              credits: domainCourseData.credits_per_course || 0,
              practical_hours: domainCourseData.hours_per_course || 0,
              ivrl_level: '',
              industry: domainCourseData.industry_category_name || '',
              course_type: '',
              applicable_majors: '',
              prerequisite_courses: '',
              course_nature_task: {
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
              responsible_person: domainCourseData.created_by || '',
              responsible_department: '',
              created_at: domainCourseData.created_at || '',
              updated_at: domainCourseData.updated_at || ''
            } as StandardData);
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

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      developing: { color: 'blue', text: '开发中' },
      review: { color: 'orange', text: '审核中' },
      approved: { color: 'green', text: '已批准' },
      published: { color: 'purple', text: '已发布' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
            onClick={() => {
              if (onClose) onClose();
              if (onBack) onBack();
            }}
          >
            返回
          </Button>
        </div>
        <Card>
          <Result
            icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
            title="暂无课程标准数据"
            subTitle="该课程尚未创建课程标准，您可以返回列表页面选择其他课程查看。"
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={() => {
                  if (onClose) onClose();
                  if (onBack) onBack();
                }}
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
                  onClick={onClose || onBack}
                >
                  返回
                </Button>
              </Space>
            </div>
          </Space>
        </Card>

        <Card>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '40px',
              fontFamily: '仿宋, SimSun, serif'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {standardData.course_name}
              </Title>
              <Title level={3} style={{ fontSize: '20px', fontWeight: 'normal', margin: 0 }}>
                {standardData.standard_name}
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
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.course_target_audience || '暂无内容'}
              </Text>
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
                      <Text>{standardData.course_name}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Text strong>课程代码：</Text>
                      <Text>{standardData.course_code}</Text>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Space>
                      <Text strong>学分：</Text>
                      <Text>{standardData.credits}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Text strong>学时：</Text>
                      <Text>{standardData.hours}</Text>
                    </Space>
                  </Col>
                </Row>

                <div>
                  <Text strong>课程类型：</Text>
                  <Text style={{ marginLeft: 8 }}>{standardData.course_type || '暂无'}</Text>
                </div>

                <div>
                  <Text strong>授课时间：</Text>
                  <Text style={{ marginLeft: 8 }}>{standardData.applicable_majors || '暂无'}</Text>
                </div>

                <div>
                  <Text strong>授课对象：</Text>
                  <Text style={{ marginLeft: 8 }}>{standardData.prerequisite_courses || '暂无'}</Text>
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
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.course_nature_task?.nature || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）课程任务
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.course_nature_task?.task || '暂无内容'}
              </Text>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                四、课程目标
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.course_objectives || '暂无内容'}
              </Text>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                五、课程内容
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.course_content || '暂无内容'}
              </Text>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                六、教学实施与保障
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （一）教学设计
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.teaching_implementation?.teaching_design || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）教学资源开发与应用
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.teaching_implementation?.resource_development || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （三）师资要求
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.teaching_implementation?.teacher_requirements || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （四）校企合作情况
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.teaching_implementation?.school_enterprise_cooperation || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （五）教材选用及辅助教学资料
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.teaching_implementation?.textbook_selection || '暂无内容'}
              </Text>
            </Card>

            <Card bordered={false} style={{ boxShadow: 'none' }}>
              <Title level={4} style={{ marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                七、课程考核与评价
              </Title>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （一）课程评价方法
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block', marginBottom: '16px' }}>
                {standardData.course_assessment?.evaluation_methods || '暂无内容'}
              </Text>

              <Title level={5} style={{ marginTop: '16px', marginBottom: '12px' }}>
                （二）评分标准
              </Title>
              <Text style={{ fontSize: '14px', whiteSpace: 'pre-wrap', display: 'block' }}>
                {standardData.course_assessment?.grading_criteria || '暂无内容'}
              </Text>
            </Card>

            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
              <Space direction="vertical" size="small" style={{ alignItems: 'flex-start' }}>
                <div>
                  <Text strong style={{ display: 'inline-block', width: '100px', textAlign: 'right' }}>制定人：</Text>
                  <Text>{standardData.development_team?.creator || standardData.responsible_person || '暂无'}</Text>
                </div>
                <div>
                  <Text strong style={{ display: 'inline-block', width: '100px', textAlign: 'right' }}>审核人：</Text>
                  <Text>{standardData.development_team?.reviewer || '暂无'}</Text>
                </div>
                <div>
                  <Text strong style={{ display: 'inline-block', width: '100px', textAlign: 'right' }}>批准人：</Text>
                  <Text>{standardData.development_team?.approver || '暂无'}</Text>
                </div>
                <div>
                  <Text strong style={{ display: 'inline-block', width: '100px', textAlign: 'right' }}>制定日期：</Text>
                  <Text>{standardData.development_team?.date || '暂无'}</Text>
                </div>
              </Space>
            </div>
          </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CourseStandardDetail;
