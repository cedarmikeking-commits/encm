import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { CourseSystemAbility, CourseSystemLevel } from '@/types/framework';
import util from '@/utils/index';
import { useDict } from '@/hooks/useDict';

interface CourseLevelDetailProps {
  frameworkId: number;
  selectCourseSystemLevel: CourseSystemLevel;
  onUpdate?: (newData: CourseSystemLevel) => void;
}

interface courseCreditHour {
  //标准课程
  standard: {
    creditMultiplier: number,
    hoursMultiplier: number
  };
  //专业能力
  standard_1: {
    creditMultiplier: number,
    hoursMultiplier: number
  };
  //1级行动能力
  standard_2: {
    creditMultiplier: number,
    hoursMultiplier: number
  };
}

const CourseLevelDetail: React.FC<CourseLevelDetailProps> = ({ frameworkId, selectCourseSystemLevel, onUpdate }) => {
  const [data, setData] = useState<CourseSystemAbility[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const { getDict } = useDict('course_credit_hour');
  const [courseCreditHour, setCourseCreditHour] = useState<courseCreditHour>();
  useEffect(() => {
    fetchCourseCreditHour();
    setIsPublished(selectCourseSystemLevel.status === 1);
    setData(util.calculateRowSpan(selectCourseSystemLevel.abilityList));

  }, [frameworkId]);

  const fetchCourseCreditHour = () => {
    const valueObj = {} as courseCreditHour;
    const dict = getDict("course_credit_hour");
    dict.forEach(item => {
      if (item.label === "standard") {
        valueObj.standard = {
          creditMultiplier: Number(item.key.toString().split(',')[0]),
          hoursMultiplier: Number(item.key.toString().split(',')[1])
        }
      }
      else if (item.label === "standard-1") {
        valueObj.standard_1 = {
          creditMultiplier: Number(item.key.toString().split(',')[0]),
          hoursMultiplier: Number(item.key.toString().split(',')[1])
        }
      }
      else if (item.label === "standard-2") {
        valueObj.standard_2 = {
          creditMultiplier: Number(item.key.toString().split(',')[0]),
          hoursMultiplier: Number(item.key.toString().split(',')[1])
        }
      }
    })
    setCourseCreditHour(valueObj);
  }

  const calculateCreditsAndHours = (record: CourseSystemAbility, courseNum: number) => {
    if (record.oneMergeFlag) {
      return {
        credits: courseCreditHour?.standard_2.creditMultiplier! * courseNum,
        reference_hours: courseCreditHour?.standard_2.hoursMultiplier! * courseNum
      };
    } else if (record.twoCareerCourseFlag) {
      return {
        credits: courseCreditHour?.standard_1.creditMultiplier! * courseNum,
        reference_hours: courseCreditHour?.standard_1.hoursMultiplier! * courseNum
      };
    } else {
      return {
        credits: courseCreditHour?.standard.creditMultiplier! * courseNum,
        reference_hours: courseCreditHour?.standard.hoursMultiplier! * courseNum,
      };
    }
  };

  const handleQuantityChange = (record: any, newValue: number | null) => {
    if (isPublished) {
      message.warning('课程等级已发布，无法修改');
      return;
    }

    if (newValue === null || newValue < 0) {
      return;
    }

    // setEditedData(prev => ({
    //   ...prev,
    //   [record.id]: newValue
    // }));
    record.courseNum = newValue;
    const { credits, reference_hours } = calculateCreditsAndHours(record, newValue);
    record.courseCredit = credits;
    record.courseHour = reference_hours;

    setData([...data]);

    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      message.info('没有修改内容');
      return;
    }

    try {
      setLoading(true);
      //处理保存逻辑：1.相同id加和 2.过滤掉数量为0的记录
      let saveData = data.filter(item => item.courseNum > 0).reduce((acc: any, item) => {
        const existing = acc.find((i: any) => i.id === item.id);
        if (existing && !item.twoCareerCourseFlag) {
          existing.courseNum += item.courseNum;
          existing.courseCredit += item.courseCredit;
          existing.courseHour += item.courseHour;
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      let totalCourseNum=0;
      let totalCourseCredit=0;
      let totalCourseHour=0;
      saveData.forEach((item: any) => {
        totalCourseNum += item.courseNum;
        totalCourseCredit += item.courseCredit;
        totalCourseHour += item.courseHour;
      });
      selectCourseSystemLevel.courseNum = totalCourseNum;
      selectCourseSystemLevel.totalCourseCredit = totalCourseCredit;
      selectCourseSystemLevel.totalCourseHour = totalCourseHour;
      selectCourseSystemLevel.abilityList = saveData;
      onUpdate?.(selectCourseSystemLevel);
    } catch (error) {
      console.error('Error saving changes:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };


  const calculateTotals = () => {
    const totals = {
      totalCourseNum: 0,
      totalCourseHours: 0,
      totalCourseCredit: 0,
    };
    data.forEach((item) => {
      totals.totalCourseNum += item.courseNum || 0;
      totals.totalCourseHours += item.courseHour || 0;
      totals.totalCourseCredit += item.courseCredit || 0;
    });

    return totals;
  };

  const columns: ColumnsType<CourseSystemAbility> = [
    {
      title: '课程类别',
      dataIndex: 'abilityOneName',
      key: 'abilityOneName',
      align: 'center',
      width: 140,
      onCell: (record) => ({
        rowSpan: record.rowSpan_1,
      }),
      render: (text, record) => <span className="font-semibold">{record.abilityOneCode} - {text}课程</span>,
    },
    {
      title: '目标维度',
      dataIndex: 'abilityTwoName',
      key: 'abilityTwoName',
      align: 'center',
      onCell: (record) => ({
        rowSpan: record.rowSpan_2,
      }),
      render: (text, record) => <span className="font-semibold">{record.abilityTwoCode} - {text}</span>,
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
        return (
          <InputNumber
            min={0}
            defaultValue={record.courseNum}
            onChange={(value) => handleQuantityChange(record, value)}
            disabled={isPublished}
            style={{ width: '100%', textAlign: 'center' }}
            size="small"
            controls={false}
          />
        );
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

  const totals = calculateTotals();

  return (
    <div className="mt-6 bg-gray-50 rounded-lg">
      <div className="mb-6 px-6 pt-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">{selectCourseSystemLevel.levelName}</h3>
        {hasChanges && !isPublished && (
          <Button
            type="primary"
            onClick={handleSaveChanges}
            loading={loading}
          >
            保存修改
          </Button>
        )}
      </div>

      <div className="px-6 pb-6">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="key"
          pagination={false}
          bordered
          summary={() => {
            const editedTotals = { ...totals };
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2} align="center">
                    <span className="font-bold">总计</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <span className="font-bold text-blue-600">{editedTotals.totalCourseNum}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <span className="font-bold text-green-600">{editedTotals.totalCourseCredit}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center">
                    <span className="font-bold text-orange-600">{editedTotals.totalCourseHours}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CourseLevelDetail;
