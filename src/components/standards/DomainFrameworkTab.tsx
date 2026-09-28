import React, { useState, useEffect } from 'react';
import { Spin, Tabs, Select, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

interface IndustryCategory {
  id: string;
  name: string;
  code: string;
}

interface DomainFramework {
  id: string;
  level_name: string;
  level_order: number;
}

interface CoreCourse {
  name: string;
  competency_level1: string | null;
  competency_level2: string | null;
  development_priority: number | null;
}

interface CompetencyCategory {
  id: string;
  code: string;
  level: number;
}

interface StandardCourseRecord {
  id: string;
  category_name: string;
  course_names: string[] | null;
  education_level_codes: string[] | null;
}

const DIM_TO_CATEGORY: Record<string, string> = {
  '31 - 个人能力': '发展能力-个人能力',
  '32 - 人际能力': '发展能力-人际能力',
  '33 - 创新能力': '发展能力-创新能力',
};

interface LevelConfig {
  actionDimensions: string[];
  actionTotal: number;
  actionCreditsPerCourse: number;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { actionDimensions: ['21 - 工作准备', '22 - 工作执行'], actionTotal: 3, actionCreditsPerCourse: 3 },
  2: { actionDimensions: ['21 - 工作准备', '22 - 工作执行', '23 - 工作应变'], actionTotal: 4, actionCreditsPerCourse: 3 },
  3: { actionDimensions: ['21 - 工作准备', '22 - 工作执行', '23 - 工作应变'], actionTotal: 5, actionCreditsPerCourse: 3 },
  4: { actionDimensions: ['21 - 工作准备', '22 - 工作执行', '23 - 工作应变'], actionTotal: 6, actionCreditsPerCourse: 3 },
};

const DEVELOPMENT_ABILITY_DIMS: Record<number, { dim: string; count: number }[]> = {
  1: [{ dim: '31 - 个人能力', count: 2 }, { dim: '32 - 人际能力', count: 2 }],
  2: [{ dim: '31 - 个人能力', count: 2 }, { dim: '32 - 人际能力', count: 2 }],
  3: [{ dim: '31 - 个人能力', count: 2 }, { dim: '32 - 人际能力', count: 3 }, { dim: '33 - 创新能力', count: 3 }],
  4: [{ dim: '31 - 个人能力', count: 2 }, { dim: '32 - 人际能力', count: 3 }, { dim: '33 - 创新能力', count: 3 }],
};

const DomainFrameworkTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>();
  const [selectedDomainName, setSelectedDomainName] = useState<string | undefined>();
  const [domainFrameworks, setDomainFrameworks] = useState<DomainFramework[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [coreCourses, setCoreCourses] = useState<CoreCourse[]>([]);
  const [competencyMap, setCompetencyMap] = useState<Record<string, string>>({});
  const [competencyLevel1Map, setCompetencyLevel1Map] = useState<Record<string, string>>({});
  const [vocStandardCourses, setVocStandardCourses] = useState<StandardCourseRecord[]>([]);
  const [devStandardNames, setDevStandardNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIndustries();
    loadCompetencyMap();
  }, []);

  useEffect(() => {
    if (selectedDomainId) {
      loadDomainFrameworks();
    } else {
      setDomainFrameworks([]);
      setActiveTab('');
      setCoreCourses([]);
      setVocStandardCourses([]);
      setDevStandardNames({});
    }
  }, [selectedDomainId]);

  useEffect(() => {
    if (activeTab && selectedDomainId) {
      loadCoreCourses(activeTab);
      loadStandardCourses(activeTab);
    }
  }, [activeTab, selectedDomainId]);

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
      (data || []).forEach((c: CompetencyCategory) => {
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
        (e: { id: string; name: string }) => e.name.replace(/\s+/g, ' ').trim() === normalizedFwName
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

  const loadStandardCourses = async (frameworkId: string) => {
    try {
      const { data: fwData, error: fwError } = await supabase
        .from('course_system_framework')
        .select('level_order')
        .eq('id', frameworkId)
        .maybeSingle();
      if (fwError) throw fwError;
      const levelOrder = fwData?.level_order;
      if (!levelOrder) return;

      const levelCode = `L${levelOrder}`;
      const { data, error } = await supabase
        .from('standard_courses')
        .select('id, category_name, course_names, education_level_codes')
        .eq('status', 'published')
        .contains('education_level_codes', [levelCode]);
      if (error) throw error;

      const records = (data || []) as StandardCourseRecord[];

      const vocRecords = records
        .filter(r => r.category_name.startsWith('基础能力-职业素养'))
        .sort((a, b) => a.category_name.localeCompare(b.category_name));
      setVocStandardCourses(vocRecords);

      const devDims = DEVELOPMENT_ABILITY_DIMS[levelOrder] || [];
      const nameMap: Record<string, string> = {};
      devDims.forEach((dimObj) => {
        const categoryName = DIM_TO_CATEGORY[dimObj.dim];
        if (!categoryName) return;
        const dimRecords = records
          .filter(r => r.category_name === categoryName)
          .sort((a, b) => (a.course_names?.[0] ?? '').localeCompare(b.course_names?.[0] ?? ''));
        for (let i = 0; i < dimObj.count; i++) {
          const key = `dev-${dimObj.dim}-${i}`;
          const record = dimRecords[i];
          if (record?.course_names && record.course_names.length > 0) {
            nameMap[key] = record.course_names[0];
          }
        }
      });
      setDevStandardNames(nameMap);
    } catch (error) {
      console.error('Error loading standard courses:', error);
    }
  };

  const loadDomainFrameworks = async () => {
    const selected = industries.find(i => i.id === selectedDomainId);
    if (!selected) return;

    setLoading(true);
    try {
      const { data: dfData, error: dfError } = await supabase
        .from('domain_level_course_framework')
        .select('id, level_name, level_code, review_status')
        .eq('domain_code', selected.code)
        .eq('review_status', 'approved');

      if (dfError) throw dfError;
      if (!dfData || dfData.length === 0) {
        setDomainFrameworks([]);
        setActiveTab('');
        setLoading(false);
        return;
      }

      const { data: fwData, error: fwError } = await supabase
        .from('course_system_framework')
        .select('id, level_name, level_order')
        .eq('is_published', true)
        .order('level_order');

      if (fwError) throw fwError;

      const levelOrderMap: Record<string, number> = {};
      const levelIdMap: Record<string, string> = {};
      (fwData || []).forEach((fw: any) => {
        levelOrderMap[fw.level_name] = fw.level_order;
        levelIdMap[fw.level_name] = fw.id;
      });

      const frameworks: DomainFramework[] = dfData
        .map((d: any) => ({
          id: levelIdMap[d.level_name] || d.id,
          level_name: d.level_name,
          level_order: levelOrderMap[d.level_name] ?? 0,
        }))
        .filter((f: DomainFramework) => f.level_order > 0)
        .sort((a: DomainFramework, b: DomainFramework) => a.level_order - b.level_order);

      setDomainFrameworks(frameworks);
      if (frameworks.length > 0) {
        setActiveTab(frameworks[0].id);
      }
    } catch (error) {
      console.error('Error loading domain frameworks:', error);
      setDomainFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = (value: string) => {
    const selected = industries.find(i => i.id === value);
    setSelectedDomainId(value);
    setSelectedDomainName(selected?.name || '');
  };

  const activeFramework = domainFrameworks.find(f => f.id === activeTab);
  const levelOrder = activeFramework?.level_order ?? 0;
  const cfg = LEVEL_CONFIGS[levelOrder];

  const getCoursesByLevel2 = (dim2Code: string): CoreCourse[] => {
    const catId = competencyMap[dim2Code];
    if (!catId) return [];
    return coreCourses.filter(c => c.competency_level2 === catId);
  };

  const getActionCourses = (): CoreCourse[] => {
    const level1Id = competencyLevel1Map['2'];
    if (!level1Id) return [];
    return coreCourses.filter(c => c.competency_level1 === level1Id && !c.competency_level2);
  };

  const renderCourseBadges = (courses: CoreCourse[]) => {
    if (courses.length === 0) return <span className="text-gray-400">-</span>;
    return (
      <div className="flex flex-col gap-1">
        {courses.map((c, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-medium flex-shrink-0">
              {c.development_priority ?? idx + 1}
            </span>
            <span className="text-sm text-gray-700 border border-green-300 rounded px-2 py-0.5 bg-green-50">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      );
    }

    if (!selectedDomainId) return null;

    if (domainFrameworks.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <InfoCircleOutlined style={{ fontSize: 36, marginBottom: 12, color: '#d9d9d9', display: 'block' }} />
          <div style={{ fontSize: 15 }}>该职业领域暂无已审核通过的分级课程框架</div>
        </div>
      );
    }

    if (!cfg) return null;

    const actionTotal = cfg.actionTotal;
    const actionCredits = actionTotal * cfg.actionCreditsPerCourse;
    const actionHours = actionCredits * 16;
    const actionDimCount = cfg.actionDimensions.length;
    const devDims = DEVELOPMENT_ABILITY_DIMS[levelOrder] || [];

    const professionalCourses = getCoursesByLevel2('12');
    const actionCourses = getActionCourses();

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border" style={{ fontSize: 13 }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-3 text-center" style={{ minWidth: 160 }}>课程类别</th>
              <th className="border px-4 py-3 text-center" style={{ minWidth: 140 }}>目标维度</th>
              <th className="border px-4 py-3 text-center" style={{ minWidth: 240 }}>课程名称</th>
              <th className="border px-4 py-3 text-center" style={{ minWidth: 80 }}>数量</th>
              <th className="border px-4 py-3 text-center" style={{ minWidth: 90 }}>参考学分</th>
              <th className="border px-4 py-3 text-center" style={{ minWidth: 90 }}>参考学时</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const vocCount = vocStandardCourses.length;
              const vocRows = vocCount > 0 ? vocStandardCourses : [null];
              const totalVocRows = vocRows.length + 1;
              return vocRows.map((sc, idx) => (
                <tr key={`voc-${idx}`} className="border-b">
                  {idx === 0 && (
                    <td rowSpan={totalVocRows} className="border-r px-4 py-3 text-center align-middle bg-gray-50 font-medium" style={{ fontSize: 13 }}>
                      1 - 基础能力课程
                    </td>
                  )}
                  {idx === 0 && (
                    <td rowSpan={vocRows.length} className="border-r px-4 py-3 text-center align-middle bg-gray-50" style={{ fontSize: 13 }}>
                      11 - 职业素养
                    </td>
                  )}
                  <td className="border-r px-4 py-3 align-middle" style={{ fontSize: 13 }}>
                    {sc?.course_names && sc.course_names.length > 0
                      ? <span style={{ color: '#1a1a1a' }}>{sc.course_names[0]}</span>
                      : <span style={{ color: '#999' }}>-</span>
                    }
                  </td>
                  {idx === 0 && (
                    <>
                      <td rowSpan={vocRows.length} className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>2</td>
                      <td rowSpan={vocRows.length} className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>2</td>
                      <td rowSpan={vocRows.length} className="px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>32</td>
                    </>
                  )}
                </tr>
              ));
            })()}
            <tr className="border-b">
              <td className="border-r px-4 py-3 text-center align-middle bg-gray-50" style={{ fontSize: 13 }}>
                12 - 专业能力
              </td>
              <td className="border-r px-4 py-3 align-middle" style={{ fontSize: 13 }}>
                {renderCourseBadges(professionalCourses)}
              </td>
              <td className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>8</td>
              <td className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>16</td>
              <td className="px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>256</td>
            </tr>

            {cfg.actionDimensions.map((dim, idx) => (
              <tr key={`act-${idx}`} className="border-b">
                {idx === 0 && (
                  <td rowSpan={actionDimCount} className="border-r px-4 py-3 text-center align-middle bg-gray-50 font-medium" style={{ fontSize: 13 }}>
                    2 - 行动能力课程
                  </td>
                )}
                <td className="border-r px-4 py-3 text-center align-middle bg-gray-50" style={{ fontSize: 13 }}>{dim}</td>
                {idx === 0 && (
                  <td rowSpan={actionDimCount} className="border-r px-4 py-3 align-middle" style={{ fontSize: 13 }}>
                    {renderCourseBadges(actionCourses)}
                  </td>
                )}
                {idx === 0 && (
                  <>
                    <td rowSpan={actionDimCount} className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>{actionTotal}</td>
                    <td rowSpan={actionDimCount} className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>{actionCredits}</td>
                    <td rowSpan={actionDimCount} className="px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>{actionHours}</td>
                  </>
                )}
              </tr>
            ))}

            {(() => {
              const rows: JSX.Element[] = [];
              const totalDevRows = devDims.reduce((s, d) => s + d.count, 0);
              let isFirstDev = true;
              devDims.forEach((dimObj) => {
                for (let i = 0; i < dimObj.count; i++) {
                  const key = `dev-${dimObj.dim}-${i}`;
                  const stdName = devStandardNames[key];
                  rows.push(
                    <tr key={key} className="border-b">
                      {isFirstDev && (
                        <td rowSpan={totalDevRows} className="border-r px-4 py-3 text-center align-middle bg-gray-50 font-medium" style={{ fontSize: 13 }}>
                          3 - 发展能力课程
                        </td>
                      )}
                      {i === 0 && (
                        <td rowSpan={dimObj.count} className="border-r px-4 py-3 text-center align-middle bg-gray-50" style={{ fontSize: 13 }}>
                          {dimObj.dim}
                        </td>
                      )}
                      <td className="border-r px-4 py-3 align-middle" style={{ fontSize: 13 }}>
                        {stdName
                          ? <span style={{ color: '#1a1a1a' }}>{stdName}</span>
                          : <span style={{ color: '#999' }}>-</span>
                        }
                      </td>
                      <td className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>1</td>
                      <td className="border-r px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>1</td>
                      <td className="px-4 py-3 text-center align-middle" style={{ fontSize: 13 }}>16</td>
                    </tr>
                  );
                  isFirstDev = false;
                }
              });
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    );
  };

  const tabItems = domainFrameworks.map((fw) => ({
    key: fw.id,
    label: fw.level_name,
    children: null,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Space size="middle" align="center">
          <span style={{ fontWeight: 500, fontSize: 14 }}>目前职业领域：</span>
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

      {!selectedDomainId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200" style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <InfoCircleOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
          <div style={{ fontSize: 16 }}>请选择职业领域以查看课程框架</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedDomainName && (
            <div style={{ marginBottom: 8 }}>
              <span className="text-base font-semibold text-gray-800">{selectedDomainName} - 分级课程框架</span>
            </div>
          )}
          {!loading && domainFrameworks.length > 0 && (
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={(key) => { setActiveTab(key); }}
            />
          )}
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default DomainFrameworkTab;
