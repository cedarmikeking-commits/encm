import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Descriptions,
  Typography,
  Tooltip,
  Input,
  Popconfirm,
  Tabs,
  Select
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  FolderOutlined,
  AimOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import CourseStructureViewer from './CourseStructureViewer';
import CourseStructureEditor from './CourseStructureEditor';
import CourseStandardDetail from '../standards/CourseStandardDetail';
import CourseLearningObjectivesModal from './CourseLearningObjectivesModal';
import { CourseType } from '@/pages/course-standards/standard-course-development';
import { getStandardCoursePage } from '@/api/course-standards';
import { getSectionTree, publishCourseContent } from '@/api/course-develoment';
import { useDict } from '@/hooks/useDict';
const { Title, Text } = Typography;
const { Search } = Input;

interface StandardCourse {
  id: string;
  standard_name?: string;
  standard_code?: string;
  course_names: string[];
  target_objectives?: string;
  target_competency_level1_id?: string;
  target_competency_level1_code?: string;
  target_competency_level1_name?: string;
  target_competency_level2_id?: string;
  target_competency_level2_code?: string;
  target_competency_level2_name?: string;
  target_competency_level3_id?: string;
  target_competency_level3_code?: string;
  target_competency_level3_name?: string;
  credits_per_course: number;
  hours_per_course: number;
  status: string;
  created_at: string;
  course_content?: string;
  course_nature?: string;
  evaluation_method?: string | string[];
  education_level_codes?: string[];
  implementation_standards?: string[];
  published_at?: string;
  published_by?: string;
  remarks?: string;
}

interface CourseDevelopment {
  id: string;
  standard_course_id: string;
  development_status: 'draft' | 'published';
  structure_content?: any;
  learning_objectives?: any;
  resource_library?: any;
  created_at: string;
  updated_at: string;
  published_at?: string;
  published_by?: string;
}

interface CourseWithDevelopment extends StandardCourse {
  development_id?: string;
  development_status?: 'draft' | 'published';
  development_created_at?: string;
  development_published_at?: string;
}

interface EducationLevel {
  id: string;
  code: string;
  name: string;
}

interface PublishedCourseDevelopmentProps {
  courseType: CourseType;
  onBack?: () => void;
  title?: string;
}

const PublishedCourseDevelopment: React.FC<PublishedCourseDevelopmentProps> = ({ onBack, title, courseType }) => {
  const { getLabel, formatOptions } = useDict([
    'course_nature', 'course_study_way', 'course_evaluation_method', 'course_credit_hour', 'course_development_type',
  ]);
  const [pagingSearch, setPagingSearch] = useState<any>({ courseType: courseType, size: 10, current: 1, keyword: '', courseStatus: null, contentStatus: null });
  const [tableData, setTableData] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseWithDevelopment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithDevelopment[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [objectivesModalVisible, setObjectivesModalVisible] = useState(false);
  const [selectedCourseForObjectives, setSelectedCourseForObjectives] = useState<any>(null);

  useEffect(() => {
    // fetchPublishedCourses();
    // fetchEducationLevels();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [pagingSearch]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getStandardCoursePage(pagingSearch);
      setTableData(data);
    } catch (error: any) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleViewStandard = async (course: CourseWithDevelopment) => {
    setSelectedCourse(course);
    setDetailVisible(true);
    // if (!course.standard_code) {
    //   message.error('该课程没有关联的课程标准');
    //   return;
    // }

    // try {
    //   const { data, error } = await supabase
    //     .from('course_standards')
    //     .select('id')
    //     .eq('standard_code', course.standard_code)
    //     .maybeSingle();

    //   if (error) throw error;

    //   if (data) {
    //     setSelectedStandardId(data.id);
    //     setDetailVisible(true);
    //   } else {
    //     setSelectedCourse(course);
    //     setDetailVisible(true);
    //   }
    // } catch (error) {
    //   console.error('查询课程标准失败:', error);
    //   setSelectedCourse(course);
    //   setDetailVisible(true);
    // }
  };

  const handleSetStructure = async (course: any) => {
    setEditingCourse(course);
  };

  const handleSetObjectives = async (course: any) => {
    setSelectedCourseForObjectives(course);
    setObjectivesModalVisible(true);
  };


  const handlePublish = async (course: any) => {
    const missingItems: string[] = [];
    const data = await getSectionTree({ courseId: course.id });
    if (!data?.length) {
      missingItems.push('课程结构');
    }

    if (!course?.courseDescription) {
      missingItems.push('课程描述');
    }


    if (!course?.courseTarget) {
      missingItems.push('课程学习目标');
    }

    if (missingItems.length > 0) {
      message.warning(`请先完成以下内容的设置：${missingItems.join('、')}`);
      return;
    }
    try {
      await publishCourseContent({ courseId: course.id, status: 2 });
      message.success('发布成功，课程已完成备案');
      fetchCourses();

    } catch (error: any) {
      message.error('发布失败: ' + error.message);
    }
  };

  const handleUnpublish = async (course: any) => {
    try {
      await publishCourseContent({ courseId: course.id, status: 1 });
      message.success('已取消发布');
      fetchCourses();
    } catch (error: any) {
      message.error('取消发布失败: ' + error.message);
    }
  };
  const getStatusTag = (status: string, statusTitle: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      "0": { color: 'default', text: statusTitle, icon: <ClockCircleOutlined /> },
      "1": { color: 'cyan', text: statusTitle, icon: <CheckCircleOutlined /> },
      "2": { color: 'purple', text: statusTitle, icon: <CheckCircleOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    );
  };
  const columns: ColumnsType<any> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'course_names',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <Tooltip title={record.courseName}>
            <Text>{record.courseName}</Text>
          </Tooltip>
          {record.courseEname && (
            <div>
              <Tooltip title={record.courseEname}>
                <Text type="secondary" style={{ fontSize: 12 }}>{record.courseEname}</Text>
              </Tooltip>
            </div>
          )}
        </div>
      )
    },
    {
      title: '课程编码',
      dataIndex: 'courseCode',
      key: 'standard_code',
      width: 140,
      align: 'center',
      render: (text) => text ? <Tag color="cyan">{text}</Tag> : <Tag color="default">未生成</Tag>
    },
    {
      title: '能力目标',
      key: 'abilityName',
      dataIndex: 'abilityName',
      width: 300
    },
    {
      title: '执行标准',
      dataIndex: 'levelName',
      key: 'implementation_standards',
      width: 250,
    },
    {
      title: '学分/学时',
      key: 'credits_hours',
      width: 120,
      align: 'center',
      render: (_, record) => `${record.courseCredit}/${record.courseHour}`
    },
    {
      title: '状态',
      dataIndex: 'contentStatus',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => getStatusTag(status, record.contentStatusTitle)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'created_at',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="查看课程">
            <Button
              type="text"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewStandard(record)}
            />
          </Tooltip>
          {(record.contentStatus <= 1) && (
            <>
              <Tooltip title="设置课程结构">
                <Button
                  type="text"
                  size="small"
                  icon={<FolderOutlined />}
                  onClick={() => handleSetStructure(record)}
                />
              </Tooltip>
              <Tooltip title="设置课程目标">
                <Button
                  type="text"
                  size="small"
                  icon={<AimOutlined />}
                  onClick={() => handleSetObjectives(record)}
                />
              </Tooltip>
              <Popconfirm
                title="确认发布"
                description="确定要发布这门课程的开发内容吗？"
                onConfirm={() => handlePublish(record)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="发布">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.contentStatus == 2 && (
            <Popconfirm
              title="确认取消发布"
              description="确定要取消发布这门课程的开发内容吗？"
              onConfirm={() => handleUnpublish(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="取消发布">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  style={{ color: '#faad14' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  if (editingCourse) {
    return (
      <CourseStructureEditor
        courseId={editingCourse.id}
        courseName={editingCourse.courseName}
        standardCourseId={editingCourse.standardCourseId}
        onBack={() => {
          setEditingCourse(null);
          fetchCourses();
        }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onBack && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                style={{ marginRight: 4 }}
              >
                返回
              </Button>
            )}
            <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>{title || '标准课程开发'}</Title>
          </div>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Search
              placeholder="搜索课程名称、编码或课程标准"
              allowClear
              style={{ width: 300 }}
              value={pagingSearch.keyword}
              onChange={(e) => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
              onSearch={(value) => setPagingSearch((prev: any) => ({ ...prev, keyword: value, current: 1 }))}
              prefix={<SearchOutlined />}
            />
            <Select allowClear
              placeholder="状态"
              style={{ width: 150 }}
              value={pagingSearch.contentStatus}
              onChange={(value) => setPagingSearch((prev: any) => ({ ...prev, contentStatus: value, current: 1 }))}
              options={[
                { label: '未开发', value: '0' },
                { label: '草稿', value: '1' },
                { label: '已发布', value: '2' }
              ]}
            />
            <Button
              onClick={() => {
                setPagingSearch((prev: any) => ({ ...prev, keyword: '', courseStatus: null, current: 1 }))
              }}
            >
              重置筛选
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={tableData.records || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1600 }}
            pagination={{
              showSizeChanger: true,
              current: pagingSearch.current,
              showTotal: (total) => `共 ${tableData.total} 条记录`,
              total: tableData.total,
              defaultPageSize: 10,
              onChange: (page, pageSize) => {
                if (pageSize !== pagingSearch.size) {
                  setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
                } else {
                  setPagingSearch((prev: any) => ({ ...prev, current: page }))
                }
              }
            }}
          />
        </Space>
      </Card>

      {/* {
        detailVisible && selectedStandardId && (
          <Modal
            title={null}
            open={detailVisible}
            onCancel={() => {
              setDetailVisible(false);
              setSelectedStandardId(null);
            }}
            width="95%"
            style={{ top: 20 }}
            footer={null}
            destroyOnClose
          >
            <CourseStandardDetail
              standardId={selectedStandardId}
              onBack={() => {
                setDetailVisible(false);
                setSelectedStandardId(null);
              }}
              onClose={() => {
                setDetailVisible(false);
                setSelectedStandardId(null);
              }}
            />
          </Modal>
        )
      } */}

      <Modal
        title="课程信息"
        open={detailVisible && selectedCourse !== null}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedCourse(null);
        }}
        width={1200}
        footer={[
          <Button key="close" onClick={() => {
            setDetailVisible(false);
            setSelectedCourse(null);
          }}>
            关闭
          </Button>
        ]}
      >
        {selectedCourse && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '课程标准',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Card
                      title="基本信息"
                      size="small"
                      type="inner"
                    >
                      <Descriptions
                        bordered
                        column={2}
                        size="small"
                        labelStyle={{ whiteSpace: 'nowrap', width: '120px' }}
                      >
                        <Descriptions.Item label="课程标准名称" span={2}>
                          <Text strong>{selectedCourse.courseStandardName || '-'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="课程编码">
                          <Tag color="blue">{selectedCourse.courseCode || '未生成'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="标准状态">
                          <Tag color="cyan">{selectedCourse.courseStatusTitle}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="课程名称" span={2}>
                          {selectedCourse.courseName}
                        </Descriptions.Item>
                        <Descriptions.Item label="开发状态" span={2}>
                          {selectedCourse.contentStatusTitle}
                        </Descriptions.Item>
                        <Descriptions.Item label="对应目标" span={2}>
                          {selectedCourse.abilityName || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="执行标准" span={2}>
                          {selectedCourse.levelName || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="课程内容" span={2}>
                          {selectedCourse.courseContent || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="学习方式">
                          {getLabel('course_study_way', selectedCourse.courseStudyWay)}
                        </Descriptions.Item>
                        <Descriptions.Item label="评价方式">
                          {selectedCourse.courseEvaluationMethod ? (
                            <Space wrap>
                              {(selectedCourse.courseEvaluationMethod || '').split(/[、,，]/).map((m: any) => m.trim()).filter(Boolean).map((method: any, index: number) => (
                                <Tag key={index} color="purple">
                                  {getLabel('course_evaluation_method', method)}
                                </Tag>
                              ))}
                            </Space>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="课程学分">
                          {selectedCourse.courseCredit} 学分
                        </Descriptions.Item>
                        <Descriptions.Item label="参考学时">
                          {selectedCourse.courseHour} 学时
                        </Descriptions.Item>
                        {selectedCourse.remarks && (
                          <Descriptions.Item label="备注" span={2}>
                            {selectedCourse.remark}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>

                    {selectedCourse.contentStatus == 2 && (
                      <Card
                        title="课程开发发布信息"
                        size="small"
                        type="inner"
                      >
                        <Descriptions
                          bordered
                          column={2}
                          size="small"
                          labelStyle={{ whiteSpace: 'nowrap', width: '120px' }}
                        >
                          <Descriptions.Item label="发布时间">
                            {dayjs(selectedCourse.updateTime).format('YYYY-MM-DD HH:mm')}
                          </Descriptions.Item>
                          <Descriptions.Item label="发布人">
                            {selectedCourse.publishUserName || '-'}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    )}

                    {/* {selectedCourse.development_published_at && (
                      <Card
                        title="课程开发发布信息"
                        size="small"
                        type="inner"
                      >
                        <Descriptions
                          bordered
                          column={2}
                          size="small"
                          labelStyle={{ whiteSpace: 'nowrap', width: '120px' }}
                        >
                          <Descriptions.Item label="开发创建时间">
                            {dayjs(selectedCourse.development_created_at).format('YYYY-MM-DD HH:mm')}
                          </Descriptions.Item>
                          <Descriptions.Item label="开发发布时间">
                            {dayjs(selectedCourse.development_published_at).format('YYYY-MM-DD HH:mm')}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    )} */}
                  </Space>
                )
              },
              {
                key: '2',
                label: '课程结构',
                children: (
                  <div>
                    {selectedCourse ? (
                      <CourseStructureViewer
                        courseId={selectedCourse.id}
                        courseName={selectedCourse.courseNames}
                      />
                    ) : (
                      <Card>
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                          该课程暂无课程结构信息
                        </div>
                      </Card>
                    )}
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>

      {
        selectedCourseForObjectives && (
          <CourseLearningObjectivesModal
            visible={objectivesModalVisible}
            courseInfo={selectedCourseForObjectives}
            onCancel={() => {
              setObjectivesModalVisible(false);
              setSelectedCourseForObjectives(null);
            }}
            onSuccess={() => {
              setObjectivesModalVisible(false);
              setSelectedCourseForObjectives(null);
              fetchCourses();
            }}
          />
        )
      }
    </div >
  );
};

export default PublishedCourseDevelopment;
