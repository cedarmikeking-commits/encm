import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { ChevronRight } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { CareerCourseFrameworkQueryParams, CourseCareerSystemLevel } from '@/types';
import type { Career } from '@/api/standards';
import { getCareerList, getLevelList } from '@/api/standards';
import {
  auditCareerCourseFramework,
  getCareerCourseFrameworkDetail,
  getCareerCourseFrameworkList
} from '@/api/careerCourseFramework';
import { CourseSystemAbility } from "@/types/framework";
import { getCareerSystemLevelList } from "@/api/courseSystemLevel";
import util from "@/utils";
import { Course } from "@/types/course";
import { useDict } from "@/hooks/useDict.ts";
import { Level } from "@/api/standards/type";

const { Text } = Typography;

const { Option } = Select;

const getAuditStatusTag = (status?: number) => {
  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'orange', text: '待审核' },
    1: { color: 'green', text: '审核通过' },
    2: { color: 'red', text: '审核不通过' }
  };
  const config = statusMap[status || 0];
  return <Tag color={config.color}>{config.text}</Tag>;
};

const getFrameworkStatusTag = (status?: number) => {
  const statusMap: Record<number, string> = {
    0: '未配置',
    1: '配置中',
    2: '已发布'
  };
  const statusText = statusMap[status || 0] || '-';
  return <Tag color="cyan">{statusText}</Tag>;
};

const CareerCourseFramework: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<CourseCareerSystemLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [levelList, setLevelList] = useState<Level[]>([]);
  const [careerList, setCareerList] = useState<Career[]>([]);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CourseCareerSystemLevel | null>(null);

  useEffect(() => {
    fetchLevelData();
    fetchCareerData();
    fetchData();
  }, [pagination.current, pagination.pageSize]);


  const fetchLevelData = async () => {
    try {
      const result = await getLevelList();
      setLevelList(result);
    } catch (error) {
      message.error('获取等级数据失败');
    }
  };

  const fetchCareerData = async () => {
    try {
      const result = await getCareerList();
      setCareerList(result);
    } catch (error) {
      message.error('获取职业领域数据失败');
    }
  };

  const fetchData = async (params?: CareerCourseFrameworkQueryParams) => {
    setLoading(true);
    try {
      const result = await getCareerCourseFrameworkList({
        careerId: params?.careerId,
        levelId: params?.levelId,
        auditStatus: params?.auditStatus,
        current: pagination.current,
        size: pagination.pageSize
      });
      setData(result.records);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(values);
  };

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData();
  };

  const handleViewDetail = (record: CourseCareerSystemLevel) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleAudit = (record: CourseCareerSystemLevel) => {
    setSelectedRecord(record);
    setAuditModalVisible(true);
  };


  const getLevelTag = (levelName?: string) => {
    return <Tag color="blue">{levelName}</Tag>;
  };

  const columns: ColumnsType<CourseCareerSystemLevel> = [
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      align: 'left',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.careerName}</div>
          <div className="text-xs text-gray-500">{record.careerCode}</div>
        </div>
      ),
    },
    {
      title: '执行标准',
      dataIndex: 'levelName',
      key: 'levelName',
      align: 'left',
      width: 150,
      render: (levelName) => getLevelTag(levelName),
    },
    {
      title: '框架状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 120,
      render: (status) => getFrameworkStatusTag(status),
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      align: 'left',
      width: 120,
      render: (status) => getAuditStatusTag(status),
    },
    {
      title: '审核时间',
      dataIndex: 'auditDate',
      key: 'auditDate',
      align: 'left',
      width: 180,
    },
    {
      title: '最近更新',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align: 'left',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          {(record.auditStatus === 0 || record.auditStatus === 2) && (
            <Tooltip title="审核">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAudit(record)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="px-6">
      <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">组织专家审定</span>
          <ChevronRight className="w-4 h-4" />
          <span
            className="hover:text-blue-600 cursor-pointer transition-colors">职业领域课程框架</span>
        </div>
      </div>
      <Card bordered={false} className="shadow-sm">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="careerId">
            <Select placeholder="职业领域" style={{ width: 200 }} allowClear size="large">
              {careerList.map(career => (
                <Option key={career.id} value={career.id}>{career.careerName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="levelId">
            <Select placeholder="选择LEVEL等级" style={{ width: 150 }} allowClear size="large">
              {levelList.map(level => (
                <Option key={level.id} value={level.id}>{level.levelName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="auditStatus">
            <Select placeholder="审核状态" style={{ width: 160 }} allowClear size="large">
              <Option value={0}>待审核</Option>
              <Option value={1}>审核通过</Option>
              <Option value={2}>审核不通过</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large">搜索</Button>
              <Button onClick={handleReset} size="large">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      <Card bordered={false} className="shadow-sm mt-4">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            }
          }}
          bordered={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {selectedRecord && (
        <>
          <CareerCourseFrameworkDetail
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            record={selectedRecord}
          />
          <CareerCourseFrameworkAudit
            visible={auditModalVisible}
            onCancel={() => setAuditModalVisible(false)}
            record={selectedRecord}
            onSuccess={() => {
              setAuditModalVisible(false);
              fetchData();
            }}
          />
        </>
      )}
    </div>
  );
};

const CareerCourseFrameworkDetail: React.FC<{
  visible: boolean;
  onCancel: () => void;
  record: CourseCareerSystemLevel;
}> = ({ visible, onCancel, record }) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [abilityList, setAbilityList] = useState<CourseSystemAbility[]>([]);
  const courseNatureColor: Record<string, string> = { 1: '#1677ff', 2: '#52c41a', 3: '#fa8c16' };
  const courseNatureBg: Record<string, string> = { 1: '#e6f4ff', 2: '#f6ffed', 3: '#fff7e6' };
  const courseNatureBorder: Record<string, string> = { 1: '#91caff', 2: '#b7eb8f', 3: '#ffd591' };
  const { getLabel } = useDict(['course_development_type', 'course_nature']);

  useEffect(() => {
    if (visible && record?.id) {
      getCareerCourseFrameworkDetail({ id: record.id }).then((res) => {
        setDetailData(res);
      }).catch((err) => {
        message.error('获取详情失败:' + err.response?.data?.message || err.message || '未知错误');
      });
      getCareerSystemLevelList({
        careerId: record.careerId!,
        levelId: record.levelId
      }).then((res) => {
        if (res.length > 0) {
          setAbilityList(util.calculateRowSpan(res[0].abilityList));
        }
      }).catch((err) => {
        message.error('获取职业领域数据失败:' + err.response?.data?.message || err.message || '未知错误');
      });
    }
  }, [visible, record]);

  const renderCourseList = (courses: Course[]) => {
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
              background: '#f8fffe',
              border: `1px solid #d9f7be`,
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 12,
              color: '#389e0d',
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
                background: '#52c41a',
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
            <span style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              color: '#222'
            }}>{c.courseName}</span>
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
          </div>
        ))}
      </div>
    );
  };


  const abilityColumns: ColumnsType<CourseSystemAbility> = [
    {
      title: '课程类别',
      dataIndex: 'abilityOneName',
      key: 'abilityOneName',
      align: 'center',
      width: 140,
      onCell: (record) => ({
        rowSpan: record.rowSpan_1,
        style: {
          backgroundColor: '#f9fafbf7', // 你想要的背景色
        },

      }),
      render: (text, record) => <span>{record.abilityOneCode} - {text}课程</span>,
    },
    {
      title: '目标维度',
      dataIndex: 'abilityTwoName',
      key: 'abilityTwoName',
      align: 'center',
      width: 140,
      onCell: (record) => ({
        rowSpan: record.rowSpan_2,
        style: {
          backgroundColor: '#f9fafbf7', // 你想要的背景色
        },
      }),
      render: (text, record) => <span>{record.abilityTwoCode} - {text}</span>,
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
          return (
            <div style={{ textAlign: 'left', padding: '4px 0' }}>
              {renderCourseList(courses)}
            </div>
          );
        } else {
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
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 110,
      onCell: (record) => {
        return { rowSpan: record.rowSpan_3 };
      },
      render: (_, record) => {
        return <div className="text-center">{record.courseNum}</div>;
      },
    },
    {
      title: '参考学分',
      dataIndex: 'credits',
      key: 'credits',
      align: 'center',
      width: 110,
      onCell: (record) => {
        return { rowSpan: record.rowSpan_3 };
      },
      render: (_, record) => {
        return <div className="text-center">{record.courseCredit}</div>;
      },
    },
    {
      title: '参考学时',
      dataIndex: 'reference_hours',
      key: 'reference_hours',
      align: 'center',
      width: 110,
      onCell: (record) => {
        return { rowSpan: record.rowSpan_3 };
      },
      render: (_, record) => {
        return <div className="text-center">{record.courseHour}</div>;
      },
    },
  ];

  return (
    <Modal
      title="职业领域课程框架详情"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>关闭</Button>
      ]}
      width='90%'
      bodyStyle={{ overflow: 'auto' }}
    >
      {record && detailData && (
        <div className="space-y-6">
          <Descriptions column={2} bordered size="small" labelStyle={{
            width: '120px',
            whiteSpace: 'nowrap'
          }}>
            <Descriptions.Item label="职业领域" span={1}>
              <Text strong>{detailData.careerName || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="领域编码" span={1}>
              {detailData.careerCode || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="执行标准" span={1}>
              <Tag color="blue">{detailData.levelName || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="框架状态" span={1}>
              {getFrameworkStatusTag(detailData.status)}
            </Descriptions.Item>
            <Descriptions.Item label="审核状态" span={1}>
              {getAuditStatusTag(detailData.auditStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="审核意见" span={2}>
              {detailData.auditReason || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审核人" span={1}>
              {detailData.auditUserName || detailData.auditUserId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审核时间" span={1}>
              {detailData.auditDate || '-'}
            </Descriptions.Item>
          </Descriptions>
          <div className="mt-6">
            <Text strong className="block mb-2">课程框架详情</Text>
            <div className="border border-gray-200 rounded p-4 bg-gray-50">
              <div className="overflow-x-auto">
                <Table
                  columns={abilityColumns}
                  dataSource={abilityList}
                  rowKey="key"
                  pagination={false}
                  bordered
                  rowHoverable={false}
                  className="custom-header-table-ability" // 唯一类名
                />
                <style>
                  {`
              .custom-header-table-ability .ant-table-thead > tr > th {
                background-color: #f3f4f6 !important;
                font-weight: 600;
              }
            `}
                </style>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const CareerCourseFrameworkAudit: React.FC<{
  visible: boolean;
  onCancel: () => void;
  record: CourseCareerSystemLevel;
  onSuccess: () => void;
}> = ({ visible, onCancel, record, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await auditCareerCourseFramework({
        id: record.id!,
        auditStatus: values.auditStatus,
        auditUserName: values.auditUserName,
        auditReason: values.auditReason
      });
      message.success('审核成功');
      onSuccess();
    } catch (error) {
      message.error('审核失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="审核职业领域课程框架"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="提交审核"
      confirmLoading={loading}
      width='60%'
      bodyStyle={{ overflow: 'auto' }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="mb-6">
          <Descriptions column={2} bordered size="small" labelStyle={{
            width: '120px',
            whiteSpace: 'nowrap'
          }}>
            <Descriptions.Item label="职业领域" span={2}>
              <Text strong>{record.careerName || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="执行标准" span={1}>
              <Tag color="blue">{record.levelName || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="框架状态" span={1}>
              {getFrameworkStatusTag(record.status)}
            </Descriptions.Item>
            <Descriptions.Item label="当前审核状态" span={1}>
              {getAuditStatusTag(record.auditStatus)}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <Form.Item
          name="auditStatus"
          label="审核结论"
          rules={[{ required: true, message: '请选择审核结论' }]}
        >
          <Select placeholder="请选择审核结论">
            <Option value={1}>
              <span className="flex items-center">
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                审核通过
              </span>
            </Option>
            <Option value={2}>
              <span className="flex items-center">
                <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                审核不通过
              </span>
            </Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="auditUserName"
          label="审核人"
        >
          <Input placeholder="请输入审核人名称" allowClear />
        </Form.Item>
        <Form.Item
          name="auditReason"
          label="审核意见"
        >
          <Input.TextArea rows={4} placeholder="请输入审核意见" allowClear maxLength={500}
            showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CareerCourseFramework;
