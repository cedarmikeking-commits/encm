import React, { useState, useEffect } from 'react';
import { Spin, Tabs, Select, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { getUserInfoAndMenu } from '@/api/user';
import { getOneAbilityCareerCoursePage, getTwoAbilityCareerCoursePage } from '@/api/course-standards';
import { getCareerSystemLevelList } from "@/api/courseSystemLevel";
import { websiteConfig } from '@/config';
import DomainCourseFramework from './DomainCourseFramework';
import util from "@/utils";
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
  const [activeTab, setActiveTab] = useState<string>('');
  const [careerSystemLevelList, setCareerSystemLevelList] = useState<any>([]);
  const [activeTabcareerSystemLevelList, setActiveTabCareerSystemLevelList] = useState<any>([]);

  useEffect(() => {
    fetchUserInfoAndMenu();
  }, []);
  const fetchUserInfoAndMenu = async () => {
    setLoading(true);
    try {
      const data: any = await getUserInfoAndMenu({ clientId: websiteConfig.clientId, });
      let industryScopeList: any = [];
      data.industryScopeList.map((firstNode: any) => {
        firstNode.children.map((secondNode: any) => {
          industryScopeList = [...industryScopeList, ...(secondNode.children || [secondNode])];
        });
      });
      setIndustries(industryScopeList);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab && selectedDomainId) {
      fetchActiveTabCareerSystemLevelList(selectedDomainId, activeTab);
    }
  }, [activeTab, selectedDomainId]);



  const fetchCareerSystemLevelList = async (careerId: any) => {
    try {
      const data = await getCareerSystemLevelList({ careerId })
      setCareerSystemLevelList(data);
      if (data.length > 0) {
        setActiveTab(data[0].levelId)
      }
    } catch (error) {
      console.error('Error loading competency map:', error);
    }
  };


  const fetchActiveTabCareerSystemLevelList = async (careerId: any, levelId: any) => {
    try {
      setLoading(true);
      setActiveTabCareerSystemLevelList([])
      const data = await getCareerSystemLevelList({ careerId, levelId })
      if (data.length > 0) {
        setActiveTabCareerSystemLevelList(util.calculateRowSpan(data[0].abilityList));
      }
    } catch (error) {
      console.error('Error loading competency map:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDomainChange = (value: string) => {
    const selected = industries.find(i => i.id === value);
    setSelectedDomainId(value);
    setSelectedDomainName(selected?.name || '');
    setActiveTab('');
    fetchCareerSystemLevelList(value);
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

    if (getCareerSystemLevelList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <InfoCircleOutlined style={{ fontSize: 36, marginBottom: 12, color: '#d9d9d9', display: 'block' }} />
          <div style={{ fontSize: 15 }}>该职业领域暂无已审核通过的分级课程框架</div>
        </div>
      );
    }

    return (<DomainCourseFramework key={`${selectedDomainId}_${activeTab}`} data={activeTabcareerSystemLevelList} />)
  };

  const tabItems = careerSystemLevelList.map((fw: any) => ({
    key: fw.id,
    label: fw.levelName,
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
          {!loading && careerSystemLevelList.length > 0 && (
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
