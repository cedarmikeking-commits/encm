import React, { useState, useEffect } from 'react';
import { Table, message, Spin, Modal, Alert } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { list, getAbilityLevelList } from '@/api/courseSystemLevel';
import { CourseSystemAbility, CourseSystemLevel } from '@/types/framework';
import util from '@/utils/index';

const PublishedCourseLevels: React.FC = () => {
  const [data, setData] = useState<CourseSystemLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [courseDetails, setCourseDetails] = useState<CourseSystemAbility[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchPublishedLevels();
  }, []);

  const fetchPublishedLevels = async () => {
    setLoading(true);
    setLoading(true);
    list().then((data) => {
      setData(data);
    }).catch((err) => {
      message.error('获取数据失败:' + err.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setLoading(false);
    });

  };

  const fetchCourseDetails = async (frameworkId: number, levelName: string) => {
    setDetailsLoading(true);
    setSelectedLevel(levelName);
    setModalVisible(true);

    getAbilityLevelList({ levelId: frameworkId }).then((data) => {
      //string转number
      data.forEach((ability: CourseSystemAbility) => {
        ability.courseCredit = Number(ability.courseCredit);
      });
      setCourseDetails(util.calculateRowSpan(data));
    }).catch((err) => {
      message.error('获取能力维度数据失败:' + err.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setDetailsLoading(false);
    });


  };

  const handleRowClick = (record: CourseSystemLevel) => {
    fetchCourseDetails(record.levelId, record.levelName);
  };

  const columns: ColumnsType<CourseSystemLevel> = [
    {
      title: '课程等级',
      dataIndex: 'levelName',
      key: 'levelName',
      align: 'center',
      width: 300,
    },
    {
      title: '课程数量',
      dataIndex: 'courseNum',
      key: 'courseNum',
      align: 'center',
      width: 300,
      render: (value) => (
        <span className=" font-bold text-blue-600">{value}</span>
      ),
    },
    {
      title: '总学分',
      dataIndex: 'totalCourseCredit',
      key: 'totalCourseCredit',
      align: 'center',
      width: 300,
      render: (value) => (
        <span className=" font-bold text-green-600">{value}</span>
      ),
    },
    {
      title: '总学时',
      dataIndex: 'totalCourseHour',
      key: 'totalCourseHour',
      align: 'center',
      width: 300,
      render: (value) => (
        <span className="font-bold text-orange-600">{value}</span>
      ),
    },
  ];

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
      render: (text, record) => <span >{record.abilityOneCode} - {text}课程</span>,
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
      render: (text, record) => <span >{record.abilityTwoCode} - {text}</span>,
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


  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-32 text-gray-500">
        <p className="text-lg">暂无已发布的课程体系</p>
      </div>
    );
  }

  const renderDetailTable = () => {
    if (detailsLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      );
    }

    if (courseDetails.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          暂无课程详情
        </div>
      );
    }

    try {
      return (
        <div className="overflow-x-auto">
          <Table
            size="small"
            loading={loading}
            columns={abilityColumns}
            dataSource={courseDetails}
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
      );
    } catch (error) {
      console.error('Error rendering detail table:', error);
      return (
        <div className="text-center py-16 text-red-500">
          <p>渲染数据时出错</p>
          <p className="text-sm mt-2">{error instanceof Error ? error.message : '未知错误'}</p>
        </div>
      );
    }
  };

  return (
    <>
      <div className="p-8 bg-gray-50">
        <Alert
          message="操作提示"
          description={
            <div className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              <span className="text-base">点击任意行可查看该课程等级的详细信息</span>
            </div>
          }
          type="info"
          showIcon={false}
          className="mb-4 border-blue-300 bg-blue-50"
        />
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          size="middle"
          className="shadow-sm"
          rowClassName="hover:bg-blue-50 transition-colors cursor-pointer"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>

      <Modal
        title={`${selectedLevel} - 课程详情`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        centered
      >
        {renderDetailTable()}
      </Modal>
    </>
  );
};

export default PublishedCourseLevels;
