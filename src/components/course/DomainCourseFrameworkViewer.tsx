import React, { useState, useEffect } from 'react';
import { Modal, Spin, Tabs, Alert, Select, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';


interface DomainCourseFrameworkViewerProps {
  visible: boolean;
  onClose: () => void;
  domainId?: string;
  domainName?: string;
  initialFrameworkId?: string;
  readOnly?: boolean;
}

interface IndustryCategory {
  id: string;
  name: string;
  code: string;
}

interface CourseLevelDetail {
  id: string;
  dimension_1_code: string;
  dimension_1_name: string;
  dimension_2_code: string;
  dimension_2_name: string;
  dimension_3_code: string | null;
  dimension_3_name: string | null;
  course_name: string | null;
  quantity: number;
  credits: number;
  reference_hours: number;
  sort_order: number;
}

interface CoreCourse {
  name: string;
  competency_level1: string | null;
  competency_level2: string | null;
  development_priority: number | null;
}

interface CourseLevelFramework {
  id: string;
  level_name: string;
  level_order: number;
}

const DomainCourseFrameworkViewer: React.FC<DomainCourseFrameworkViewerProps> = ({
  visible,
  onClose,
  domainId: initialDomainId,
  domainName: initialDomainName,
  initialFrameworkId,
  readOnly,
}) => {
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState<CourseLevelDetail[]>([]);
  const [coreCourses, setCoreCourses] = useState<CoreCourse[]>([]);
  const [competencyMap, setCompetencyMap] = useState<Record<string, string>>({});
  const [competencyLevel1Map, setCompetencyLevel1Map] = useState<Record<string, string>>({});
  const [frameworks, setFrameworks] = useState<CourseLevelFramework[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>(initialDomainId);
  const [selectedDomainName, setSelectedDomainName] = useState<string | undefined>(initialDomainName);

  useEffect(() => {
    // if (visible) {
    //   loadIndustries();
    //   if (initialDomainId) {
    //     setSelectedDomainId(initialDomainId);
    //     setSelectedDomainName(initialDomainName);
    //   } else {
    //     setSelectedDomainId(undefined);
    //     setSelectedDomainName(undefined);
    //     setFrameworks([]);
    //     setCourseDetails([]);
    //     setActiveTab('');
    //   }
    // }
  }, [visible, initialDomainId, initialDomainName, initialFrameworkId]);

  useEffect(() => {
    // if (visible && selectedDomainId) {
    //   loadFrameworks();
    //   loadCompetencyMap();
    // } else if (visible && !selectedDomainId) {
    //   setFrameworks([]);
    //   setCourseDetails([]);
    //   setCoreCourses([]);
    //   setActiveTab('');
    // }
  }, [visible, selectedDomainId]);

  const loadIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_categories')
        .select('id, name, code')
        .eq('level', 3)
        .order('code');
      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error loading industries:', error);
    }
  };

  const loadCompetencyMap = async () => {
    try {
      const { data, error } = await supabase
        .from('competency_categories')
        .select('id, code, level');
      if (error) throw error;
      const map: Record<string, string> = {};
      const level1Map: Record<string, string> = {};
      (data || []).forEach(c => {
        if (c.level === 2) map[c.code] = c.id;
        if (c.level === 1) level1Map[c.code] = c.id;
      });
      setCompetencyMap(map);
      setCompetencyLevel1Map(level1Map);
    } catch (error) {
      console.error('Error loading competency map:', error);
    }
  };

  const loadCoreCourses = async (frameworkId: string) => {
    if (!selectedDomainId) return;
    try {
      const { data: fwData, error: fwError } = await supabase
        .from('course_system_framework')
        .select('level_name')
        .eq('id', frameworkId)
        .maybeSingle();
      if (fwError) throw fwError;

      const normalizedFwName = (fwData?.level_name || '').replace(/\s+/g, ' ').trim();

      const { data: edLevels, error: edError } = await supabase
        .from('education_levels')
        .select('id, name');
      if (edError) throw edError;

      const matched = (edLevels || []).find(
        e => e.name.replace(/\s+/g, ' ').trim() === normalizedFwName
      );

      if (!matched) {
        setCoreCourses([]);
        return;
      }

      const { data, error } = await supabase
        .from('core_courses')
        .select('name, competency_level1, competency_level2, development_priority')
        .eq('industry_id', selectedDomainId)
        .eq('ivrl_level', matched.id)
        .eq('status', 'active')
        .not('name', 'is', null)
        .order('development_priority', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setCoreCourses(data || []);
    } catch (error) {
      console.error('Error loading core courses:', error);
      setCoreCourses([]);
    }
  };

  const loadFrameworks = async () => {
    if (!selectedDomainId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_system_framework')
        .select('id, level_name, level_order')
        .eq('is_published', true)
        .order('level_order');
      if (error) throw error;
      setFrameworks(data || []);
      if (data && data.length > 0) {
        const targetId = initialFrameworkId && data.find(f => f.id === initialFrameworkId)
          ? initialFrameworkId
          : data[0].id;
        setActiveTab(targetId);
        loadDetailsForFramework(targetId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      setLoading(false);
    }
  };

  const loadDetailsForFramework = async (frameworkId: string) => {
    setLoading(true);
    try {
      const [detailsResult] = await Promise.all([
        supabase
          .from('course_level_details')
          .select('*')
          .eq('framework_id', frameworkId)
          .eq('is_deleted', false)
          .order('sort_order', { ascending: true }),
        loadCoreCourses(frameworkId),
      ]);
      if (detailsResult.error) throw detailsResult.error;
      const valid = (detailsResult.data || []).filter(d => d.dimension_1_code && d.dimension_2_code);
      setCourseDetails(valid);
    } catch (error) {
      console.error('Error loading course details:', error);
      setCourseDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    loadDetailsForFramework(key);
  };

  const handleDomainChange = (value: string) => {
    const selected = industries.find(i => i.id === value);
    setSelectedDomainId(value);
    setSelectedDomainName(selected?.name || '');
  };

  const renderDetailTable = () => {
    if (loading) {
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

    const groupedData: { [key: string]: { [key: string]: CourseLevelDetail[] } } = {};

    courseDetails.forEach((detail) => {
      if (!groupedData[detail.dimension_1_code]) {
        groupedData[detail.dimension_1_code] = {};
      }
      if (!groupedData[detail.dimension_1_code][detail.dimension_2_code]) {
        groupedData[detail.dimension_1_code][detail.dimension_2_code] = [];
      }
      groupedData[detail.dimension_1_code][detail.dimension_2_code].push(detail);
    });

    const rows: JSX.Element[] = [];

    Object.keys(groupedData).sort().forEach((dim1Code) => {
      const dim2Groups = groupedData[dim1Code];
      const dim2Keys = Object.keys(dim2Groups).sort();
      const dim1RowSpan = dim2Keys.reduce((sum, k) => sum + dim2Groups[k].length, 0);

      const allDim1Items = dim2Keys.flatMap(k => dim2Groups[k]);
      const firstItem = allDim1Items[0];
      const isActionAbility = firstItem?.dimension_1_name === '行动能力';

      const dim1TotalQuantity = isActionAbility
        ? allDim1Items.reduce((s, i) => s + (i.quantity || 0), 0) : 0;
      const dim1TotalCredits = isActionAbility
        ? allDim1Items.reduce((s, i) => s + (i.credits || 0), 0) : 0;
      const dim1TotalHours = isActionAbility
        ? allDim1Items.reduce((s, i) => s + (i.reference_hours || 0), 0) : 0;

      const allCoursesEmpty = allDim1Items.every(i => !i.course_name || i.course_name.trim() === '');

      let isFirstRowInDim1 = true;

      dim2Keys.forEach((dim2Code, dim2Index) => {
        const dim3Items = dim2Groups[dim2Code].sort((a, b) => {
          return (a.dimension_3_code || '').localeCompare(b.dimension_3_code || '');
        });
        const dim2RowSpan = dim3Items.length;

        const getActionAbilityCourses = (): CoreCourse[] => {
          const level1Id = competencyLevel1Map[firstItem?.dimension_1_code || ''];
          if (!level1Id) return [];
          return coreCourses
            .filter(c => c.competency_level1 === level1Id && !c.competency_level2);
        };

        dim3Items.forEach((item, dim3Index) => {
          const isProfessional = item.dimension_1_name === '基础能力' && item.dimension_2_name === '专业能力';
          const quantity = item.quantity || 0;
          const credits = isProfessional ? quantity * 2 : (item.credits || 0);
          const hours = isProfessional ? quantity * 32 : (item.reference_hours || 0);

          const getCoursesForDim2 = (dim2Code: string): CoreCourse[] => {
            const catId = competencyMap[dim2Code];
            if (!catId) return [];
            return coreCourses
              .filter(c => c.competency_level2 === catId);
          };

          const shouldMergeCourseNameForDim1 = !isProfessional && !isActionAbility && allCoursesEmpty && isFirstRowInDim1;
          const isSkippedByDim1Merge = !isProfessional && !isActionAbility && allCoursesEmpty && !isFirstRowInDim1;
          const courseNameRowSpan = isSkippedByDim1Merge ? 0
            : (shouldMergeCourseNameForDim1 ? dim1RowSpan : 1);

          const renderCourseNameCell = () => {
            if (isActionAbility) {
              if (!isFirstRowInDim1 || dim3Index !== 0) return null;
              const courses = getActionAbilityCourses();
              return (
                <td rowSpan={dim1RowSpan} className="border-r px-4 py-3 text-center align-middle">
                  {courses.length === 0 ? '' : courses.map((c, idx) => (
                    <div key={idx} className="py-0.5">
                      {c.development_priority != null ? `（${c.development_priority}）` : ''}{c.name}
                    </div>
                  ))}
                </td>
              );
            }
            if (isProfessional) {
              if (dim3Index !== 0) return null;
              const courses = getCoursesForDim2(item.dimension_2_code);
              return (
                <td rowSpan={dim2RowSpan} className="border-r px-4 py-3 text-center align-middle">
                  {courses.length === 0 ? '' : courses.map((c, idx) => (
                    <div key={idx} className="py-0.5">
                      {c.development_priority != null ? `（${c.development_priority}）` : ''}{c.name}
                    </div>
                  ))}
                </td>
              );
            }
            if (courseNameRowSpan === 0) return null;
            return (
              <td rowSpan={courseNameRowSpan} className="border-r px-4 py-3 text-center">
                {item.course_name && item.course_name !== '-' ? item.course_name : '-'}
              </td>
            );
          };

          rows.push(
            <tr key={item.id} className="border-b">
              {dim2Index === 0 && dim3Index === 0 && (
                <td
                  rowSpan={dim1RowSpan}
                  className="border-r px-4 py-3 text-center align-middle bg-gray-50"
                >
                  {item.dimension_1_code} - {item.dimension_1_name}课程
                </td>
              )}
              {dim3Index === 0 && (
                <td
                  rowSpan={dim2RowSpan}
                  className="border-r px-4 py-3 text-center align-middle bg-gray-50"
                >
                  {item.dimension_2_code} - {item.dimension_2_name}
                </td>
              )}
              {renderCourseNameCell()}
              {isActionAbility ? (
                isFirstRowInDim1 ? (
                  <>
                    <td rowSpan={dim1RowSpan} className="border-r px-4 py-3 text-center align-middle">
                      {dim1TotalQuantity || '-'}
                    </td>
                    <td rowSpan={dim1RowSpan} className="border-r px-4 py-3 text-center align-middle">
                      {dim1TotalCredits || '-'}
                    </td>
                    <td rowSpan={dim1RowSpan} className="px-4 py-3 text-center align-middle">
                      {dim1TotalHours || '-'}
                    </td>
                  </>
                ) : null
              ) : (
                <>
                  <td className="border-r px-4 py-3 text-center">
                    {quantity || '-'}
                  </td>
                  <td className="border-r px-4 py-3 text-center">
                    {credits || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {hours || '-'}
                  </td>
                </>
              )}
            </tr>
          );

          isFirstRowInDim1 = false;
        });
      });
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-3 text-center">课程类别</th>
              <th className="border px-4 py-3 text-center">目标维度</th>
              <th className="border px-4 py-3 text-center">课程名称</th>
              <th className="border px-4 py-3 text-center">数量</th>
              <th className="border px-4 py-3 text-center">参考学分</th>
              <th className="border px-4 py-3 text-center">参考学时</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  const tabItems = frameworks.map((fw) => ({
    key: fw.id,
    label: fw.level_name,
    children: null,
  }));

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{selectedDomainName ? `${selectedDomainName} - 课程框架` : '查看课程框架'}</span>
          {readOnly && (
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 20,
              background: '#f6ffed',
              color: '#52c41a',
              border: '1px solid #b7eb8f',
            }}>
              只读
            </span>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
    >
      <div className="space-y-4">
        <Alert
          message={readOnly ? '当前为只读模式，展示已发布的职业领域分级课程框架内容' : '查看本职业领域分级课程框架'}
          type={readOnly ? 'success' : 'info'}
          icon={<InfoCircleOutlined />}
          showIcon
        />

        {!readOnly && (
          <div style={{ marginTop: 16 }}>
            <Space>
              <span style={{ fontWeight: 500 }}>选择职业领域：</span>
              <Select
                style={{ width: 300 }}
                placeholder="请选择职业领域"
                value={selectedDomainId}
                onChange={handleDomainChange}
                showSearch
                optionFilterProp="children"
              >
                {industries.map(industry => (
                  <Select.Option key={industry.id} value={industry.id}>
                    {industry.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>
        )}

        {!selectedDomainId ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <InfoCircleOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
            <div style={{ fontSize: 16 }}>请选择职业领域以查看课程框架</div>
          </div>
        ) : (
          <>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={handleTabChange}
            />
            {renderDetailTable()}
          </>
        )}
      </div>
    </Modal>
  );
};

export default DomainCourseFrameworkViewer;
