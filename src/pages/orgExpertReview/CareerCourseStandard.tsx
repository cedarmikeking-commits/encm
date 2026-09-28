import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Rate,
  Select,
  Space,
  Table,
  Tag,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Award, BookOpen, ChevronRight, Target, TrendingUp } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { CareerCourseStandardQueryParams, CourseAuditDetail, CourseStandard, } from '@/types';
import type { Career } from '@/api/standards';
import { getCareerList, getLevelList } from '@/api/standards';
import {
  auditCareerCourseStandard,
  getCareerCourseStandardList,
  getCareerCourseStandardReviewRecordDetail,
  getCareerCourseStandardReviewRecords
} from '@/api/careerCourseStandard';
import { Level } from "@/api/standards/type";

const { Option } = Select;

const CareerCourseStandard: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<CourseStandard[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [levelList, setLevelList] = useState<Level[]>([]);
  const [careerList, setCareerList] = useState<Career[]>([]);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [reviewRecordModalVisible, setReviewRecordModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CourseStandard | null>(null);

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

  const fetchData = async (params?: CareerCourseStandardQueryParams) => {
    setLoading(true);
    try {
      const result = await getCareerCourseStandardList({
        careerId: params?.careerId,
        levelId: params?.levelId,
        abilityId: params?.abilityId,
        auditStatus: params?.auditStatus,
        courseType: '2',
        current: pagination.current,
        size: pagination.pageSize,
        type: 1
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

  const handleViewDetail = (record: CourseStandard) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleAudit = (record: CourseStandard) => {
    setSelectedRecord(record);
    setAuditModalVisible(true);
  };

  const handleViewReviewRecords = (record: CourseStandard) => {
    setSelectedRecord(record);
    setReviewRecordModalVisible(true);
  };

  const getAuditStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: { color: 'gray', text: '草稿' },
      1: { color: 'orange', text: '待审核' },
      2: { color: 'green', text: '审核通过' },
      3: { color: 'red', text: '审核未通过' }
    };
    const config = statusMap[status != null ? status : 1] || statusMap[1];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getLevelTag = (levelName?: string) => {
    if (!levelName) return null;
    return <Tag color="blue">{levelName}</Tag>;
  };

  const columns: ColumnsType<CourseStandard> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      align: 'left',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium" style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{record.courseName}</div>
          <div className="text-xs text-gray-500">{record.courseCode || '-'}</div>
        </div>
      ),
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      align: 'left',
      width: 150,
    },
    {
      title: '执行标准',
      dataIndex: 'levelName',
      key: 'levelName',
      align: 'left',
      width: 120,
      render: (levelName) => getLevelTag(levelName),
    },
    {
      title: '能力目标',
      dataIndex: 'abilityName',
      key: 'abilityName',
      align: 'left',
      width: 180,
      ellipsis: true,
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
      title: '提交时间',
      dataIndex: 'submitDate',
      key: 'submitDate',
      align: 'left',
      width: 150,
    },
    {
      title: '评审时间',
      dataIndex: 'auditDate',
      key: 'auditDate',
      align: 'left',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      width: 120,
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
          {(record.auditStatus === 1 || record.auditStatus === 3) && (
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
          <Tooltip title="评审记录">
            <Button
              type="text"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewReviewRecords(record)}
            />
          </Tooltip>
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
            className="hover:text-blue-600 cursor-pointer transition-colors">职业领域课程标准</span>
        </div>
      </div>
      <Card bordered={false} className="shadow-sm">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="careerId">
            <Select placeholder="职业领域" style={{ width: 180 }} size="large" allowClear>
              {careerList.map(career => (
                <Option key={career.id} value={career.id}>{career.careerName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="levelId">
            <Select placeholder="执行标准" style={{ width: 150 }} allowClear size="large">
              {levelList.map(level => (
                <Option key={level.id} value={level.id}>{level.levelName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="abilityId">
            <Select placeholder="能力目标" style={{ width: 150 }} allowClear size="large">
              <Option value="1435109660033434135">专业能力</Option>
              <Option value="1435109626478919684">行动能力</Option>
            </Select>
          </Form.Item>
          <Form.Item name="auditStatus">
            <Select placeholder="审核状态" style={{ width: 150 }} allowClear size="large">
              <Option value={1}>待审核</Option>
              <Option value={2}>审核通过</Option>
              <Option value={3}>审核未通过</Option>
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {selectedRecord && (
        <>
          <CareerCourseStandardDetail
            visible={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            record={selectedRecord}
          />
          <CareerCourseStandardAudit
            visible={auditModalVisible}
            onCancel={() => setAuditModalVisible(false)}
            record={selectedRecord}
            onSuccess={() => {
              setAuditModalVisible(false);
              fetchData();
            }}
            mode="audit"
          />
          <CareerCourseStandardReviewRecord
            visible={reviewRecordModalVisible}
            onCancel={() => setReviewRecordModalVisible(false)}
            record={selectedRecord}
          />
        </>
      )}
    </div>
  );
};

const CareerCourseStandardDetail: React.FC<{
  visible: boolean;
  onCancel: () => void;
  record: CourseStandard;
}> = ({ visible, onCancel, record }) => {
  const isActionAbility = record.abilityName === '行动能力';

  return (
    <Modal
      title={`${record.courseName} — 在线预览`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>关闭</Button>
      ]}
      width={900}
    >
      {isActionAbility ? (
        <div className="border border-gray-200 rounded" style={{ background: '#fff' }}>
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-2"
            style={{ fontSize: '13px', lineHeight: '1.2', color: '#333' }}>
            <h1 className="text-2xl font-bold mb-4">[课程名称]</h1>
            <h2 className="text-xl font-bold mb-4">课程标准</h2>
            <h2 className="text-lg font-semibold mb-4">目 录</h2>
            <div className="ml-4 space-y-2">
              <p>一、课程适应对象</p>
              <p>二、课程基本信息</p>
              <p>三、课程性质与任务</p>
              <p className="ml-8">（一）课程性质</p>
              <p className="ml-8">（二）课程任务</p>
              <p>四、课程目标</p>
              <p>五、课程内容</p>
              <p>六、教学实施与保障</p>
              <p className="ml-8">（一）教学设计</p>
              <p className="ml-8">（二）教学资源开发与应用</p>
              <p className="ml-8">（三）师资要求</p>
              <p className="ml-8">（四）校企合作情况</p>
              <p className="ml-8">（五）教材选用及辅助教学资料</p>
              <p>七、课程考核与评价</p>
              <p className="ml-8">（一）课程评价方法</p>
              <p className="ml-8">（二）评分标准</p>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">一、课程适应对象</h2>
              <p className="ml-8">[请描述课程适应对象...]</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">二、课程基本信息</h2>
              <table className="border-collapse w-full">
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-2 w-1/4">课程名称：</td>
                    <td className="border border-gray-200 p-2 w-1/4"></td>
                    <td className="border border-gray-200 p-2 w-1/4">课程代码：</td>
                    <td className="border border-gray-200 p-2 w-1/4"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">学分：</td>
                    <td className="border border-gray-200 p-2"></td>
                    <td className="border border-gray-200 p-2">学时：</td>
                    <td className="border border-gray-200 p-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">课程类型：</td>
                    <td className="border border-gray-200 p-2"></td>
                    <td className="border border-gray-200 p-2">授课时间：</td>
                    <td className="border border-gray-200 p-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">授课对象：</td>
                    <td className="border border-gray-200 p-2" colSpan={3}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">三、课程性质与任务</h2>
              <h3 className="text-base font-medium mb-2 ml-4">（一）课程性质</h3>
              <p className="ml-8">[课程性质描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（二）课程任务</h3>
              <p className="ml-8">[课程任务描述...]</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">四、课程目标</h2>
              <p className="ml-8">[课程目标描述...]</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">五、课程内容</h2>
              <p className="ml-8">[课程内容描述...]</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">六、教学实施与保障</h2>
              <h3 className="text-base font-medium mb-2 ml-4">（一）教学设计</h3>
              <p className="ml-8">[教学设计描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（二）教学资源开发与应用</h3>
              <p className="ml-8">[教学资源开发与应用描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（三）师资要求</h3>
              <p className="ml-8">[师资要求描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（四）校企合作情况</h3>
              <p className="ml-8">[校企合作情况描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（五）教材选用及辅助教学资料</h3>
              <p className="ml-8">[教材选用及辅助教学资料描述...]</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">七、课程考核与评价</h2>
              <h3 className="text-base font-medium mb-2 ml-4">（一）课程评价方法</h3>
              <p className="ml-8">[课程评价方法描述...]</p>
              <h3 className="text-base font-medium mb-2 ml-4 mt-4">（二）评分标准</h3>
              <p className="ml-8">[评分标准描述...]</p>
            </div>

            <div className="border-t pt-4 mt-8">
              <p>制定人：___________</p>
              <p>审核人：___________</p>
              <p>批准人：___________</p>
              <p>制定日期：____年__月__日</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded" style={{ background: '#fff' }}>
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-2"
            style={{ fontSize: '13px', lineHeight: '1.2', color: '#333' }}>
            <p>2026.03.27 张斌提</p>

            <p>1.课程框架构建：</p>
            <p>1.1国际职业教育课程框架概览（包括学分、门数、等级等）直观呈现 ，一目了然。</p>
            <p>1.2职业领域课程框架构建</p>
            <p>审核流程：
              {/*<s>职业领域课程框架构建—职业领域专业委员会组织专家审定（内容审核：审核课程名称和等级设定是否恰当）—专家委员会审定（形式审核）：备注：目前职业领域委员会暂未成立，所以由专家委员会审定，后续等职业领域委员会成熟以后，可能只有职业领域委员会审定或者两个都审定，</s>*/}
              所以课程框架发布以后，职业领域专业委员会和专家委员会暂时都开通审定权限。
            </p>
            <p>
              <div className="space-y-6">
                {/* 课程开发指导原则 */}
                <div className="bg-white rounded-xl shadow-sm  p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="mr-2 text-blue-600" size={20} />
                    职业领域课程框架构建任务分工
                  </h3>
                  <div className="space-y-6">
                    {/* 基础能力课程 */}
                    <div className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
                      <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                        <Award className="mr-2" size={20} />
                        基础能力课程：职业素养课程
                      </h4>
                      <p className="text-blue-800 leading-relaxed">
                        由深圳协议专家委员会统一组织开发，各职业领域专委会重点负责开发体现本领域特点的专业能力课程
                        <span className="font-semibold">（包括理论知识课程和技能应用课程）</span>
                      </p>
                    </div>

                    {/* 行动能力课程 */}
                    <div className="border-l-4 border-green-500 pl-6 py-4 bg-green-50 rounded-r-lg">
                      <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                        <Target className="mr-2" size={20} />
                        行动能力课程
                      </h4>
                      <p className="text-green-800 leading-relaxed">
                        由各职业领域专委会根据本领域职业标准和工作任务完全自主规划和开发。
                      </p>
                    </div>

                    {/* 发展能力课程 */}
                    <div
                      className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-lg">
                      <h4 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                        <TrendingUp className="mr-2" size={20} />
                        发展能力课程
                      </h4>
                      <p className="text-purple-800 leading-relaxed">
                        由深圳协议专家委员会统一开发，各职业领域提供课程资源。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </p>
            <p>
              {/*<s>这个不叫指导原则，它是一个课程体系构建的分工。如果各个职业领域进去以后直接对应的专业能力和行动能力课程就不用写这个分工，可以删除；如果各个职业领域进去以后，是一个整体的课程框架，目的是让他明确他要做的哪两类课程。这样的话要修改一下标题和内容，</s>*/}
              应该是职业领域课程框架构建任务分工。
            </p>

            <p>2.课程标准设计</p>
            <p>2.1课程标准模版</p>
            <p>2.1.1基础能力课程标准模版</p>
            <p>2.1.1.1职业素养课程标准模版</p>
            <p>2.2.1.2专业能力课程标准模版</p>
            <p>2.2.2行动能力课程标准模版</p>
            <p>2.2.3发展能力课程标准模版</p>
            <p>2.2研制课程标准（这样呈现比较清，跟方案一致，也没有其他名字，取其他名字容易导致误解。）</p>
            <p>2.2.1基础能力课程标准</p>
            <p>2.2.1.1职业素养课程标准</p>
            <p>2.2.1.2专业能力课程标准</p>
            <p>2.2.2行动能力课程标准</p>
            <p>2.2.3发展能力课程标准 </p>
            <p>审核流程：职业领域课程标准—职业领域专业委员会组织专家审定（内容审核）—专家委员会审定（形式审核）：</p>

            <p>3.标准课程开发</p>
            <p>3.1.标准课程开发</p>
            <p>3.1.1基础能力标准课程开发</p>
            <p>3.1.1.1职业素养标准课程开发</p>
            <p>3.1.1.2专业能力标准课程开发（暂定线下）</p>
            <p>3.1.2行动能力标准课程开发（暂定线下）</p>
            <p>3.1.3发展能力标准课程开发</p>
            <p>3.2课程学习资源</p>
            <p>备注：
              {/*<s>如果专业能力和行动能力课程不在平台上发布的话，</s>*/}
              这里的学习资源应该是职业素养标准课程和发展能力标准课程的学习资源。
            </p>
            <p>3.3课程考核评价</p>
            <p>备注：
              {/*<s>如果专业能力和行动能力课程不在平台上发布的话，这里的</s>*/}
              课程考核应该是职业素养标准课程和发展能力标准课程的考核。
            </p>

            <p>
              {/*<s>4（原系统中）认可课程认定建议这一部分内容放到学分转化系统当中去，如果课程系统确实要保留的话，只呈现简要的介绍和概述。比如说</s>*/}
            </p>
            <p>
              {/*<s> 4.1概述（内容包括：认可课程定义、认定标准、认定流程）</s>*/}
            </p>
            <p>
              {/*<s>4.2认可课程结果查询</s>*/}
            </p>
            <p>
              {/*<s>或者是将课程系统的这一部分与转换系统的这一部分打通。</s>*/}
            </p>

            <p>5.（原系统中）
              {/*<s>领域课程目录和课程目录管理这两个可以合并为一个，应该属于后面的学分转换系统当中的内容，建议放到学分转换系统当中去，如果这边确实要保留的话，只呈现简要的介绍和概述，以及</s>*/}
              <strong>简要的一个全部课程的目录</strong>。
              {/*<s>或者是将课程系统的这一部分与转换系统的这一部分打通。</s>*/}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

interface CareerCourseStandardAuditProps {
  visible: boolean;
  onCancel: () => void;
  record: CourseStandard | CourseAuditDetail;
  onSuccess?: () => void;
  mode: 'audit' | 'view';
  courseName?: string;
}

const CareerCourseStandardAudit: React.FC<CareerCourseStandardAuditProps> = ({
  visible,
  onCancel,
  record,
  onSuccess,
  mode,
  courseName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 每次打开弹窗重置表单
  useEffect(() => {
    if (visible) {
      if (mode === 'view' && 'auditUserName' in record) {
        // 详情模式下填充数据
        form.setFieldsValue({
          expertName: record.auditUserName,
          expertTitle: record.auditUserTitle,
          expertInstitution: record.auditUserInstitution,
          reviewDate: record.auditDate ? record.auditDate.split(' ')[0] : undefined,
          overallReview: record.auditReason,
          advantage: record.advantage,
          disadvantage: record.disadvantage,
          improvementSuggestion: record.suggestion,
          auditStatus: record.auditStatus
        });
        // 解析评分 JSON 结构
        if (record.auditScoe) {
          try {
            const scoreObj = JSON.parse(record.auditScoe);
            form.setFieldsValue({
              contentQuality: (scoreObj.contentQuality || 0) / 20,
              structure: (scoreObj.structure || 0) / 20,
              practicality: (scoreObj.practicality || 0) / 20,
              innovation: (scoreObj.innovation || 0) / 20,
              overallScore: (scoreObj.overallScore || 0) / 20
            });
          } catch (e) {
            // 如果解析失败，设置为0
            form.setFieldsValue({
              contentQuality: 0,
              structure: 0,
              practicality: 0,
              innovation: 0,
              overallScore: 0
            });
          }
        }
      } else {
        form.resetFields();
        // 设置评审日期默认值为今天，评审结论默认选中通过
        form.setFieldsValue({
          reviewDate: new Date().toISOString().split('T')[0],
          auditStatus: 2
        });
      }
    }
  }, [visible, form, mode, record]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 构建评分 JSON 结构
      const scoreJson = JSON.stringify({
        contentQuality: values.contentQuality * 20,
        structure: values.structure * 20,
        practicality: values.practicality * 20,
        innovation: values.innovation * 20,
        overallScore: values.overallScore * 20
      });

      // 处理评审日期，添加时分秒
      const reviewDate = values.reviewDate;
      const auditDate = reviewDate ? `${reviewDate} ${new Date().toTimeString().split(' ')[0]}` : undefined;

      await auditCareerCourseStandard({
        id: record.id,
        courseId: record.courseId,
        auditStatus: values.auditStatus,
        auditUserName: values.expertName,
        auditUserTitle: values.expertTitle,
        auditUserInstitution: values.expertInstitution,
        auditDate: auditDate,
        auditReason: values.overallReview,
        advantage: values.advantage,
        disadvantage: values.disadvantage,
        suggestion: values.improvementSuggestion,
        auditScoe: scoreJson, // 评分 JSON 结构
        finalAuditFlag: 1
      });
      message.success('审核成功');
      onSuccess?.();
    } catch (error) {
      message.error('审核失败');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';
  const displayRecord = 'courseName' in record ? record : { ...record, courseName: courseName };

  return (
    <Modal
      title={isViewMode ? "查看评审详情" : "填写评审意见"}
      open={visible}
      onCancel={onCancel}
      onOk={() => !isViewMode && form.submit()}
      confirmLoading={loading}
      width="90%"
      okText={isViewMode ? "关闭" : "提交评审"}
      cancelText={isViewMode ? "" : "取消"}
      footer={isViewMode ? [
        <Button key="close" onClick={onCancel}>关闭</Button>
      ] : undefined}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isViewMode}>
        {/* 课程信息区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">课程标准：</span>
              <span className="text-gray-900">{displayRecord.courseName}课程标准</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">课程名称：</span>
              <span className="text-gray-900">{displayRecord.courseName}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">课程编码：</span>
              <span className="text-gray-900">{displayRecord.courseCode}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">版本：</span>
              <span className="text-gray-900">1.0</span>
            </div>
          </div>
        </div>

        {/* 专家信息区域 */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">专家信息</span>
            <div className="flex-grow ml-3 border-b border-gray-200"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <Form.Item
              name="expertName"
              label="专家姓名"
              rules={!isViewMode ? [{ required: true, message: '请输入专家姓名' }] : []}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              name="expertTitle"
              label="职称"
            >
              <Input placeholder="如：教授、高级工程师" />
            </Form.Item>
            <Form.Item
              name="expertInstitution"
              label="所在单位"
            >
              <Input placeholder="请输入单位名称" />
            </Form.Item>
          </div>
          <Form.Item
            name="reviewDate"
            label="评审日期"
            rules={!isViewMode ? [{ required: true, message: '请选择评审日期' }] : []}
          >
            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </Form.Item>
        </div>

        {/* 评分项目区域 */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">评分项目</span>
            <div className="flex-grow ml-3 border-b border-gray-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="contentQuality"
              label="内容质量"
              rules={!isViewMode ? [{ required: true, message: '请评分' }] : []}
            >
              <Rate defaultValue={0} />
            </Form.Item>
            <Form.Item
              name="structure"
              label="结构合理性"
              rules={!isViewMode ? [{ required: true, message: '请评分' }] : []}
            >
              <Rate defaultValue={0} />
            </Form.Item>
            <Form.Item
              name="practicality"
              label="实用性"
              rules={!isViewMode ? [{ required: true, message: '请评分' }] : []}
            >
              <Rate defaultValue={0} />
            </Form.Item>
            <Form.Item
              name="innovation"
              label="创新性"
              rules={!isViewMode ? [{ required: true, message: '请评分' }] : []}
            >
              <Rate defaultValue={0} />
            </Form.Item>
          </div>
          <Form.Item
            name="overallScore"
            label="总体评分"
            rules={!isViewMode ? [{ required: true, message: '请评分' }] : []}
            className="mt-4"
          >
            <Rate defaultValue={0} />
          </Form.Item>
        </div>

        {/* 评审意见区域 */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">评审意见</span>
            <div className="flex-grow ml-3 border-b border-gray-200"></div>
          </div>
          <Form.Item
            name="overallReview"
            label="总体评审意见"
            rules={!isViewMode ? [{ required: true, message: '请输入总体评审意见' }] : []}
          >
            <Input.TextArea rows={3} placeholder="请输入对该课程标准的总体评价。" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Form.Item
              name="advantage"
              label="优点"
            >
              <Input.TextArea rows={3} placeholder="请列出该标准的优点..." />
            </Form.Item>
            <Form.Item
              name="disadvantage"
              label="不足之处"
            >
              <Input.TextArea rows={3} placeholder="请指出需要改进的地方。" />
            </Form.Item>
          </div>
          <Form.Item
            name="improvementSuggestion"
            label="改进建议"
          >
            <Input.TextArea rows={3} placeholder="请提供具体的改进建议。" />
          </Form.Item>
        </div>

        {/* 评审结果区域 */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">评审结果</span>
            <div className="flex-grow ml-3 border-b border-gray-200"></div>
          </div>
          <Form.Item
            name="auditStatus"
            label="评审结论"
            rules={!isViewMode ? [{ required: true, message: '请选择评审结论' }] : []}
          >
            <Radio.Group defaultValue={2}>
              <Radio value={2}><CheckCircleOutlined className="mr-1" style={{ color: '#52c41a' }} />通过</Radio>
              <Radio value={3}><CloseCircleOutlined className="mr-1" style={{ color: '#ff4d4f' }} />不通过</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

const CareerCourseStandardReviewRecord: React.FC<{
  visible: boolean;
  onCancel: () => void;
  record: CourseStandard;
}> = ({ visible, onCancel, record }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReviewRecord, setSelectedReviewRecord] = useState<CourseAuditDetail | null>(null);

  const [reviewData, setReviewData] = useState<CourseAuditDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    if (visible) {
      fetchReviewRecords();
    }
  }, [visible, pagination.current, pagination.pageSize]);

  const fetchReviewRecords = async () => {
    setLoading(true);
    try {
      const result = await getCareerCourseStandardReviewRecords({
        courseId: record.id,
        current: pagination.current,
        size: pagination.pageSize
      });
      setReviewData(result.records || []);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      message.error('获取评审记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (reviewRecord: CourseAuditDetail) => {
    setLoading(true);
    try {
      const detailData = await getCareerCourseStandardReviewRecordDetail(reviewRecord.id);
      setSelectedReviewRecord(detailData);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取评审详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getAuditStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      2: { color: 'green', text: '通过' },
      3: { color: 'red', text: '未通过' }
    };
    const config = statusMap[status || 0] || { color: 'gray', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<CourseAuditDetail> = [
    {
      title: '专家姓名',
      dataIndex: 'auditUserName',
      key: 'auditUserName',
      align: 'center',
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      align: 'center',
      render: () => record.courseName,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      align: 'center',
      render: () => record.careerName,
    },
    {
      title: '职称',
      dataIndex: 'auditUserTitle',
      key: 'auditUserTitle',
      align: 'center',
    },
    {
      title: '所在单位',
      dataIndex: 'auditUserInstitution',
      key: 'auditUserInstitution',
      align: 'center',
    },
    {
      title: '评审日期',
      dataIndex: 'auditDate',
      key: 'auditDate',
      align: 'center',
      render: (date) => date ? date.split(' ')[0] : '-',
    },
    {
      title: '总体评分',
      dataIndex: 'auditScoe',
      key: 'auditScoe',
      align: 'center',
      render: (score) => {
        let scoreNum = 0;
        if (score) {
          try {
            const scoreObj = JSON.parse(score);
            scoreNum = scoreObj.overallScore || 0;
          } catch (e) {
            scoreNum = 0;
          }
        }
        const starCount = Math.floor(scoreNum / 20);
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((index) => (
              <span key={index} style={{ color: index <= starCount ? '#ffd700' : '#d9d9d9' }}>
                ★
              </span>
            ))}
            <span className="ml-2">{scoreNum}分</span>
          </div>
        );
      },
    },
    {
      title: '评审结果',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      align: 'center',
      render: (status) => getAuditStatusTag(status),
    },
    {
      title: '终审',
      dataIndex: 'finalAuditFlag',
      key: 'finalAuditFlag',
      align: 'center',
      render: (flag) => (flag === 1 ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, reviewRecord) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(reviewRecord)}
        />
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`评审记录 - ${record.courseName}`}
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>关闭</Button>
        ]}
        width={1000}
      >
        <Table
          columns={columns}
          dataSource={reviewData}
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
          bordered
        />
      </Modal>

      {selectedReviewRecord && (
        <CareerCourseStandardAudit
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          record={selectedReviewRecord}
          mode="view"
          courseName={record.courseName}
        />
      )}
    </>
  );
};


export default CareerCourseStandard;
