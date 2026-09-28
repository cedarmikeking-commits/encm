import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Drawer, Form, Select, InputNumber, Row, Col, Modal, Space, Popconfirm, Tag, Descriptions, Tooltip, Spin } from 'antd';
import { ArrowLeft, Lightbulb, Eye, Pencil, Trash2 } from 'lucide-react';
import { PlusOutlined } from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';
import { CourseSystemAbility, CourseSystemLevel } from '@/types/framework';
import util from '@/utils/index';
import { Course } from '@/types/course';
import { useDict } from '@/hooks/useDict';
import { careerSystemLevelPublish, careerSystemLevelSave, careerSystemLevelUnPublish, deleteCourse } from '@/api/courseSystemLevel';
const { TextArea } = Input;

interface Props {
  industryCode?: string;
  industryName: string;
  industryId?: number;
  frameworkId: number;
  setupFramework?: CourseSystemLevel;
  onBack: () => void;
}

const DomainFrameworkSetupPage: React.FC<Props> = ({ industryName, setupFramework, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [selectAbilityRecord, setSelectAbilityRecord] = useState<CourseSystemAbility>(null!);
  const [abilityList, setAbilityList] = useState<CourseSystemAbility[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [submitting, setSubmitting] = useState(false);

  const [viewCourse, setViewCourse] = useState<Course | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editForm] = Form.useForm();
  const { getLabel, formatOptions } = useDict(['course_development_type', 'course_nature','course_study_way']);

  useEffect(() => {
    setAbilityList(util.calculateRowSpan(setupFramework?.abilityList || []));
  }, []);

  const handleOpenAdd = async (record: CourseSystemAbility) => {
    form.resetFields();
    setModalVisible(true);
    setSelectAbilityRecord(record);
  };

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      setSubmitting(true);
      if (selectAbilityRecord.courseList == null) {
        selectAbilityRecord.courseList = [];
      }
      //新增课程时，课程名称不能重复
      if (selectAbilityRecord.courseList.some(item => item.courseName === formValues.courseName)) {
        message.error('课程名称不能重复');
        setSubmitting(false);
        return
      }
      let newCourse: Course = {
        courseName: formValues.courseName,
        orderNo: formValues.orderNo,
        courseDevelopmentType: formValues.courseDevelopmentType,
        courseNature: formValues.courseNature,
        courseStudyWay: formValues.courseStudyWay,
        courseDescription: formValues.courseDescription,
        courseCredit: selectAbilityRecord.courseCredit / selectAbilityRecord.courseNum,
        courseHour: selectAbilityRecord.courseHour / selectAbilityRecord.courseNum,
      };
      selectAbilityRecord.courseList.push(newCourse);
      setSelectAbilityRecord(selectAbilityRecord);
      abilityList.forEach(item => {
        if (item.key === selectAbilityRecord.key) {
          item.courseList = selectAbilityRecord.courseList
        }
      })
      setAbilityList(abilityList);
      message.success('添加成功');
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      const errorMessage = error?.message || error?.hint || '保存失败';
      message.error(`保存失败: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewCourse = (course: Course, ablilty: CourseSystemAbility) => {
    setViewCourse(course);
    setSelectAbilityRecord(ablilty);
    setViewVisible(true);
  };

  const handleEditCourse = (course: Course, ablilty: CourseSystemAbility) => {

    setEditCourse(course);
    setSelectAbilityRecord(ablilty);
    editForm.setFieldsValue({
      courseName: course.courseName,
      orderNo: course.orderNo,
      courseDevelopmentType: course.courseDevelopmentType,
      courseNature: course.courseNature,
      courseStudyWay: course.courseStudyWay,
      courseDescription: course.courseDescription,
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      // 编辑时，课程名称不能与其他课程重复
      if(selectAbilityRecord.courseList.some(item => item.courseName === values.courseName && item.id !== values.id)) {
        message.error('课程名称不能重复');
        return;
      }
      setSubmitting(true);

      selectAbilityRecord.courseList[selectAbilityRecord.courseList.indexOf(editCourse!)] = {
        ...editCourse,
        ...values
      };
      setSelectAbilityRecord(selectAbilityRecord);
      abilityList.forEach(item => {
        if (item.key === selectAbilityRecord.key) {
          item.courseList = selectAbilityRecord.courseList
        }
      })
      setAbilityList(abilityList);
      message.success('保存成功');
      setEditCourse(null);
    } catch (error: any) {
      message.error(`保存失败: ${error?.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course: Course, ablilty: CourseSystemAbility) => {
    setLoading(true);
    setSelectAbilityRecord(ablilty);
    if (course.id) {
      deleteCourse({ courseId: course.id! }).then(() => {
        message.success('删除成功');

        ablilty.courseList.splice(ablilty.courseList.indexOf(course), 1);
        setSelectAbilityRecord(ablilty);
        abilityList.forEach(item => {
          if (item.key === ablilty.key) {
            item.courseList = ablilty.courseList
          }
        })
        setAbilityList(abilityList);

      }).catch((err) => {
        message.error('删除失败:' + err.response?.data?.msg || err.message || '未知错误');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setTimeout(() => {
        ablilty.courseList.splice(ablilty.courseList.indexOf(course), 1);
        setSelectAbilityRecord(ablilty);
        abilityList.forEach(item => {
          if (item.key === ablilty.key) {
            item.courseList = ablilty.courseList
          }
        })
        setAbilityList(abilityList);
        setLoading(false);
      }, 100)
    }

  };
  //整体保存
  const handleSave = async () => {
    if (!setupFramework) return;
    setSaving(true);
    setLoading(true);
    setupFramework.abilityList = [...abilityList.filter(item => item.courseNum > 0)];
    careerSystemLevelSave(setupFramework).then(() => {
      message.success('保存成功');
    }).catch((err) => {
      message.error('保存失败:' + err.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setLoading(false);
      setSaving(false);
    });
  };

  const handlePublish = async () => {
    if (!setupFramework) return;
    setPublishing(true);
    //过滤掉课程数量为0的数据
    setupFramework.abilityList = [...abilityList.filter(item => item.courseNum > 0)];
    //验证，领域课必须满足课程数量足够
    for (const item of setupFramework.abilityList) {
      if (item.oneMergeFlag) {
        if (item.courseList ==null || item.courseList.length < item.courseNum) {
          message.error(`${item.abilityOneName}课程需添加 ${item.courseNum} 门，当前已添加 ${item.courseList?.length || 0} 门`);
          setPublishing(false);
          return;
        }
      } else if (item.twoCareerCourseFlag) {
        if (item.courseList ==null || item.courseList.length < item.courseNum) {
          message.error(`${item.abilityTwoName}课程需添加 ${item.courseNum} 门，当前已添加 ${item.courseList?.length || 0} 门`);
          setPublishing(false);
          return;
        }
      }
    }
    //发布
    careerSystemLevelPublish(setupFramework).then(() => {
      message.success('发布成功');
      setupFramework.status = 2;
    }).catch((err) => {
      message.error('发布失败:' + err.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setPublishing(false);
    });
  };

  const handleUnpublish = async () => {
    if (!setupFramework) return;
    setPublishing(true);
    careerSystemLevelUnPublish({ careerSystemLevelId: setupFramework.careerSystemLevelId! }).then(() => {
      message.success('取消发布成功');
      setupFramework.status = 1;
    }).catch((err) => {
      message.error('取消发布失败:' + err.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setPublishing(false);
    })
  };


  const courseNatureColor: Record<string, string> = { 1: '#1677ff', 2: '#52c41a', 3: '#fa8c16' };
  const courseNatureBg: Record<string, string> = { 1: '#e6f4ff', 2: '#f6ffed', 3: '#fff7e6' };
  const courseNatureBorder: Record<string, string> = { 1: '#91caff', 2: '#b7eb8f', 3: '#ffd591' };

  const isRejected = setupFramework?.auditStatus === 2;
  const isReadOnly = setupFramework?.status === 2;

  const renderCourseList = (courses: Course[], ablilty: CourseSystemAbility) => {
    if (courses.length === 0) return null;
    return (
      <div style={{ marginBottom: 6 }}>
        {courses.map(c => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isReadOnly ? '#f8fffe' : '#f0f7ff',
              border: `1px solid ${isReadOnly ? '#d9f7be' : '#bae0ff'}`,
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 12,
              color: isReadOnly ? '#389e0d' : '#1677ff',
              marginBottom: 4,
              minHeight: 34,
            }}
          >
            {c.orderNo != null && c.orderNo && (
              <span style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: isReadOnly ? '#52c41a' : '#1677ff',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}>
                {c.orderNo}
              </span>
            )}
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: '#222' }}>{c.courseName}</span>
            {(
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: courseNatureBg[c.courseNature!] || '#f5f5f5',
                color: courseNatureColor[c.courseNature!] || '#595959',
                border: `1px solid ${courseNatureBorder[c.courseNature!] || '#d9d9d9'}`,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                {getLabel('course_nature', c.courseNature!)}
              </span>
            )}
            {!isReadOnly && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, marginLeft: 2 }}>
                <Button
                  type="text"
                  size="small"
                  icon={<Eye size={12} />}
                  style={{ color: '#1677ff', padding: '0 3px', height: 20, minWidth: 20 }}
                  onClick={() => handleViewCourse(c, ablilty)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<Pencil size={12} />}
                  style={{ color: '#52c41a', padding: '0 3px', height: 20, minWidth: 20 }}
                  onClick={() => handleEditCourse(c, ablilty)}
                />
                <Popconfirm
                  title="确认删除该课程？"
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDeleteCourse(c, ablilty)}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={12} />}
                    style={{ color: '#ff4d4f', padding: '0 3px', height: 20, minWidth: 20 }}
                  />
                </Popconfirm>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    if (!setupFramework) return null;
    const columns: ColumnsType<CourseSystemAbility> = [
      {
        title: '课程类别',
        dataIndex: 'abilityOneName',
        key: 'abilityOneName',
        width: 160,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_1 }),
        render: (text) => (
          <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{text}</span>
        ),
      },
      {
        title: '目标维度',
        dataIndex: 'abilityTwoName',
        key: 'abilityTwoName',
        width: 160,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_2 }),
        render: (text) => (
          <span style={{ color: '#333' }}>{text}</span>
        ),
      },
      {
        title: '课程名称',
        dataIndex: 'courseName',
        key: 'courseName',
        width: 280,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_3 }),
        render: (_, record) => {
          if (record.oneMergeFlag || record.twoCareerCourseFlag) {
            //领域课
            const courses = record.courseList || [];
            const limit = record.courseNum;
            const count = record.courseList?.length || 0;
            const isFull = limit > 0 && count >= limit;
            return (
              <div style={{ textAlign: 'left', padding: '4px 0' }}>
                {renderCourseList(courses, record)}
                {!isReadOnly && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      size="small"
                      disabled={isFull}
                      onClick={() => handleOpenAdd(record)}
                    >
                      新增
                    </Button>
                    <span style={{
                      fontSize: 11,
                      color: isFull ? '#ff4d4f' : count > 0 ? '#fa8c16' : '#8c8c8c',
                      fontWeight: isFull ? 600 : 400,
                    }}>
                      {count}/{limit}{isFull ? ' 已满' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          else {
            if (record.courseList && record.courseList.length > 0 && record.courseList[record.inKey]) {
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 10px',
                    background: '#f8fffe',
                    border: '1px solid #d9f7be',
                    borderRadius: 6,
                    minHeight: 34,
                  }}>
                    <span style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#52c41a',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {record.inKey + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: '#222', fontWeight: 500 }}>{record.courseList[record.inKey]?.courseName}</span>
                  </div>
                );
            } else {
              return <span style={{ color: '#bbb', fontSize: 12, fontStyle: 'italic' }}>-</span>;
            }
          }
        },
      },
      {
        title: '数量',
        dataIndex: 'courseNum',
        key: 'courseNum',
        width: 80,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_3 }),
        render: (val) => (
          <span style={{ color: '#1a1a1a' }}>{val !== '' ? val : ''}</span>
        ),
      },
      {
        title: '参考学分',
        dataIndex: 'courseCredit',
        key: 'courseCredit',
        width: 100,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_3 }),
        render: (val) => (
          <span style={{ color: '#1a1a1a' }}>{val !== '' ? val : ''}</span>
        ),
      },
      {
        title: '参考学时',
        dataIndex: 'courseHour',
        key: 'courseHour',
        width: 100,
        align: 'center',
        onCell: (record) => ({ rowSpan: record.rowSpan_3 }),
        render: (val) => (
          <span style={{ color: '#1a1a1a' }}>{val !== '' ? val : ''}</span>
        ),
      },
    ];

    return (
      <div>
        <Table<CourseSystemAbility>
          dataSource={abilityList}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          style={{ marginBottom: 16 }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 8,
            border: '1px solid #d9d9d9',
            background: '#fafafa',
            color: '#595959',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#1677ff';
            e.currentTarget.style.color = '#1677ff';
            e.currentTarget.style.background = '#f0f7ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.color = '#595959';
            e.currentTarget.style.background = '#fafafa';
          }}
        >
          <ArrowLeft size={15} />
          返回
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
                {isReadOnly ? '框架详情' : isRejected ? '修改框架' : '设置框架'} — {industryName}
              </span>
              {setupFramework && (
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1677ff' }}>
                  {setupFramework.levelName}
                </span>
              )}
              {isReadOnly && (
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '2px 10px',
                  borderRadius: 20,
                  background: '#f6ffed',
                  color: '#52c41a',
                  border: '1px solid #b7eb8f',
                }}>
                  已发布
                </span>
              )}
              {isRejected && (
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '2px 10px',
                  borderRadius: 20,
                  background: '#fff1f0',
                  color: '#ff4d4f',
                  border: '1px solid #ffa39e',
                }}>
                  审核不通过
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
              {isReadOnly
                ? `${industryName} ${setupFramework?.levelName ?? ''} 课程框架`
                : isRejected
                  ? `审核不通过，请修改后重新发布`
                  : `为该职业领域配置${setupFramework?.levelName ?? ''}课程框架`
              }
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }}
      >
        {renderTable()}
      </div>

      <Drawer
        title="新增课程"
        placement="right"
        width={700}
        open={modalVisible}
        onClose={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        extra={
          <Space>
            <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>保存</Button>
          </Space>
        }
      >
        <div style={{
          background: '#fefcf3',
          padding: '14px 18px',
          borderRadius: '6px',
          marginBottom: '24px',
          border: '1px solid #f0e6d2',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <Lightbulb size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#78716c', lineHeight: '1.7' }}>
              填写前请先了解当前职业领域的框架规则和标准要求
            </div>
          </div>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="competency_level1" hidden><Input /></Form.Item>
          <Form.Item name="competency_level2" hidden><Input /></Form.Item>
          <Form.Item name="competency_level3" hidden><Input /></Form.Item>
          <Form.Item name="ivrl_level" hidden><Input /></Form.Item>
          <Form.Item name="industry_id" hidden><Input /></Form.Item>
          <Form.Item name="credits" hidden><InputNumber /></Form.Item>
          <Form.Item name="hours" hidden><InputNumber /></Form.Item>
          <Form.Item name="code" hidden><Input /></Form.Item>

          <Form.Item name="courseName" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="orderNo" label="开课顺序" rules={[{ required: true, message: '请输入开课顺序' }]}>
                <InputNumber min={1} precision={0} placeholder="请输入开课顺序" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="courseDevelopmentType" label="开发类型">
                <Select placeholder="请选择开发类型" options={formatOptions('course_development_type')} >
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="courseNature" label="课程性质" rules={[{ required: true, message: '请选择课程性质' }]}>
                <Select placeholder="请选择课程性质" options={formatOptions('course_nature')} >
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item name="courseStudyWay" label="学习方式" rules={[{ required: true, message: '请选择学习方式' }]}>
                <Select placeholder="请选择学习方式" options={formatOptions('course_study_way')} >
                </Select>
              </Form.Item>
            </Col>
          </Row>


          <Form.Item name="courseDescription" label="课程描述">
            <TextArea rows={6} placeholder="请输入课程描述" showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="课程详情"
        open={viewVisible}
        onCancel={() => { setViewVisible(false); setViewCourse(null); }}
        footer={<Button onClick={() => { setViewVisible(false); setViewCourse(null); }}>关闭</Button>}
        width={620}
      >
        {viewCourse && (() => {
          return (
            <Descriptions column={2} bordered size="small" labelStyle={{ width: 110, background: '#fafafa', fontWeight: 500 }}>
              <Descriptions.Item label="课程名称" span={2}>{viewCourse.courseName || '-'}</Descriptions.Item>
              <Descriptions.Item label="开课顺序">{viewCourse.orderNo ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="开发类型">{getLabel('course_development_type', viewCourse.courseDevelopmentType!) || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={viewCourse.courseStatus === 1 ? 'green' : 'default'}>{viewCourse.courseStatus === 1 ? '已发布' : '未发布'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="学习方式">
                {getLabel('course_study_way', viewCourse.courseStudyWay!) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="课程性质" span={2}>
                {viewCourse.courseNature ? (
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 10,
                    fontSize: 12,
                    background: courseNatureBg[viewCourse.courseNature] || '#f5f5f5',
                    color: courseNatureColor[viewCourse.courseNature] || '#595959',
                    border: `1px solid ${courseNatureBorder[viewCourse.courseNature] || '#d9d9d9'}`,
                  }}>
                    {getLabel('course_nature', viewCourse.courseNature)}
                  </span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="能力目标（一级）" span={2}>{selectAbilityRecord?.abilityOneName || '-'}</Descriptions.Item>
              <Descriptions.Item label="二级维度" span={2}>{selectAbilityRecord?.abilityTwoName || '-'}</Descriptions.Item>
              <Descriptions.Item label="执行标准">{setupFramework?.levelName || '-'}</Descriptions.Item>
              <Descriptions.Item label="职业领域">{industryName || '-'}</Descriptions.Item>
              <Descriptions.Item label="学分">{viewCourse.courseCredit ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="学时">{viewCourse.courseHour ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="课程描述" span={2}>{viewCourse.courseDescription || '-'}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>

      <Drawer
        title="编辑课程"
        placement="right"
        width={520}
        open={!!editCourse}
        onClose={() => { setEditCourse(null); editForm.resetFields(); }}
        extra={
          <Space>
            <Button onClick={() => { setEditCourse(null); editForm.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={handleEditSubmit} loading={submitting}>保存</Button>
          </Space>
        }
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="courseName" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="orderNo" label="开课顺序" rules={[{ required: true, message: '请输入开课顺序' }]}>
                <InputNumber min={1} precision={0} placeholder="请输入开课顺序" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="courseDevelopmentType" label="开发类型">
                <Select placeholder="请选择开发类型" allowClear options={formatOptions('course_development_type')}>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item name="courseNature" label="课程性质" rules={[{ required: true, message: '请选择课程性质' }]}>
                <Select placeholder="请选择课程性质" options={formatOptions('course_nature')} >
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item name="courseStudyWay" label="学习方式" rules={[{ required: true, message: '请选择学习方式' }]}>
                <Select placeholder="请选择学习方式" options={formatOptions('course_study_way')} >
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="courseDescription" label="课程描述">
            <TextArea rows={6} placeholder="请输入课程描述" showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default DomainFrameworkSetupPage;
