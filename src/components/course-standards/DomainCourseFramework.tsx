import React, { useState, useEffect } from 'react';
import { Table, message, Spin, Modal, Alert, Typography } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { CourseSystemAbility, CourseSystemLevel } from '@/types/framework';
import { Course } from '@/types/course';
import { useDict } from '@/hooks/useDict';

const PublishedCourseLevels: React.FC<{ data: any }> = ({ data }) => {
  const { getLabel } = useDict(['course_development_type', 'course_nature']);

  const courseNatureColor: Record<string, string> = { 1: '#1677ff', 2: '#52c41a', 3: '#fa8c16' };
  const courseNatureBg: Record<string, string> = { 1: '#e6f4ff', 2: '#f6ffed', 3: '#fff7e6' };
  const courseNatureBorder: Record<string, string> = { 1: '#91caff', 2: '#b7eb8f', 3: '#ffd591' };
  const { Text } = Typography;

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
            }  else {
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
    <div className="mt-6">
      <div className="overflow-x-auto">
        <Table
          columns={abilityColumns}
          dataSource={data}
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
  );
};

export default PublishedCourseLevels;
