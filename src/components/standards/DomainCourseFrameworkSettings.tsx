import React, { useState, useEffect } from 'react';
import { Modal, Form, Table, InputNumber, Button, Space, message, Typography, Divider, Spin, Tabs, Tooltip } from 'antd';
import { SaveOutlined, InfoCircleOutlined, DownOutlined, RightOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface DomainCourseFrameworkSettingsProps {
  visible: boolean;
  onCancel: () => void;
  domainRecord: any;
  onSuccess: () => void;
}

interface DimensionRule {
  type: 'standard' | 'domain';
  courseCount: number;
  totalCredits: number;
  referenceHours: number;
}

interface CourseRules {
  basicAbility: DimensionRule;
  actionAbility: DimensionRule;
  developmentAbility: DimensionRule;
  [key: string]: DimensionRule;
}

interface CompetencyCategory {
  id: string;
  code: string;
  name: string;
  level: number;
  parent_id: string | null;
}

interface TableDataType {
  key: string;
  dimension: string;
  fieldPrefix: string;
  level: number;
  categoryId: string;
  isSubDimension?: boolean;
}

interface CourseLevelFramework {
  id: string;
  level_name: string;
  level_order: number;
}

const DomainCourseFrameworkSettings: React.FC<DomainCourseFrameworkSettingsProps> = ({
  visible,
  onCancel,
  domainRecord,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [categories, setCategories] = useState<CompetencyCategory[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [frameworks, setFrameworks] = useState<CourseLevelFramework[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [frameworkStatus, setFrameworkStatus] = useState<Record<string, boolean>>({});
  const [frameworkCommonStatus, setFrameworkCommonStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      loadFrameworks();
    } else {
      form.resetFields();
      setActiveTab('');
      setInitialValues({});
    }
  }, [visible]);

  const loadFrameworks = async () => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_system_framework')
        .select('id, level_name, level_order')
        .eq('is_published', true)
        .order('level_order');

      if (error) throw error;

      setFrameworks(data || []);
      if (data && data.length > 0) {
        if (domainRecord?.domain_id) {
          await checkFrameworkStatus(data, domainRecord.domain_id);
        }
        setActiveTab(data[0].id);
        loadCategoriesAndRules(data[0].id);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      message.error('加载课程等级失败');
      setDataLoading(false);
    }
  };

  const checkFrameworkStatus = async (frameworks: CourseLevelFramework[], domainId: string) => {
    if (!domainId) {
      setFrameworkStatus({});
      setFrameworkCommonStatus({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('domain_course_framework_rules')
        .select('framework_id')
        .eq('domain_id', domainId);

      if (error) throw error;

      const statusMap: Record<string, boolean> = {};
      frameworks.forEach(fw => {
        statusMap[fw.id] = data?.some(d => d.framework_id === fw.id) || false;
      });

      setFrameworkStatus(statusMap);

      // 查询每个 framework 的 is_common 状态
      const { data: commonData, error: commonError } = await supabase
        .from('course_level_rules')
        .select('framework_id, is_common')
        .in('framework_id', frameworks.map(fw => fw.id));

      if (commonError) throw commonError;

      const commonStatusMap: Record<string, boolean> = {};
      frameworks.forEach(fw => {
        const rule = commonData?.find(d => d.framework_id === fw.id);
        commonStatusMap[fw.id] = rule?.is_common || false;
      });

      setFrameworkCommonStatus(commonStatusMap);
    } catch (error) {
      console.error('Error checking framework status:', error);
      setFrameworkStatus({});
      setFrameworkCommonStatus({});
    }
  };

  const loadCategoriesAndRules = async (frameworkId: string, isTabChange = false) => {
    if (isTabChange) {
      setTabLoading(true);
    } else {
      setDataLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('competency_categories')
        .select('id, code, name, level, parent_id')
        .eq('status', 'published')
        .eq('is_deleted', false)
        .in('level', [1, 2, 3])
        .order('level')
        .order('sort_order');

      if (error) throw error;

      setCategories(data || []);
      buildTableData(data || []);

      await loadExistingRules(frameworkId, data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      message.error('加载能力分类失败');
    } finally {
      if (isTabChange) {
        setTabLoading(false);
      } else {
        setDataLoading(false);
      }
    }
  };

  const buildTableData = (cats: CompetencyCategory[]) => {
    const level1 = cats.filter(c => c.level === 1);
    const level2 = cats.filter(c => c.level === 2);
    const level3 = cats.filter(c => c.level === 3);

    const basicAbilityId = level1.find(c => c.name === '基础能力')?.id;
    const actionAbilityId = level1.find(c => c.name === '行动能力')?.id;
    const developmentAbilityId = level1.find(c => c.name === '发展能力')?.id;

    const tableRows: TableDataType[] = [];

    if (basicAbilityId) {
      tableRows.push({
        key: basicAbilityId,
        dimension: '基础能力课程',
        fieldPrefix: 'basicAbility',
        level: 1,
        categoryId: basicAbilityId,
      });

      const basicLevel2 = level2.filter(c => c.parent_id === basicAbilityId);
      basicLevel2.forEach((l2, l2idx) => {
        const isLastL2 = l2idx === basicLevel2.length - 1;
        const fieldPrefix = `basic_l2_${l2.id}`;
        tableRows.push({
          key: l2.id,
          dimension: `  ${isLastL2 ? '└─' : '├─'} ${l2.name}`,
          fieldPrefix,
          level: 2,
          categoryId: l2.id,
          isSubDimension: true,
        });

        const basicLevel3 = level3.filter(c => c.parent_id === l2.id);
        basicLevel3.forEach((l3, l3idx) => {
          const isLastL3 = l3idx === basicLevel3.length - 1;
          const fieldPrefix = `basic_l3_${l3.id}`;
          const branch = isLastL3 ? '└─' : '├─';
          tableRows.push({
            key: l3.id,
            dimension: `  │  ${branch} ${l3.name}`,
            fieldPrefix,
            level: 3,
            categoryId: l3.id,
            isSubDimension: true,
          });
        });
      });
    }

    if (actionAbilityId) {
      tableRows.push({
        key: actionAbilityId,
        dimension: '行动能力课程',
        fieldPrefix: 'actionAbility',
        level: 1,
        categoryId: actionAbilityId,
      });

      const actionLevel2 = level2.filter(c => c.parent_id === actionAbilityId);
      actionLevel2.forEach((l2, l2idx) => {
        const isLastL2 = l2idx === actionLevel2.length - 1;
        const fieldPrefix = `action_l2_${l2.id}`;
        tableRows.push({
          key: l2.id,
          dimension: `  ${isLastL2 ? '└─' : '├─'} ${l2.name}`,
          fieldPrefix,
          level: 2,
          categoryId: l2.id,
          isSubDimension: true,
        });

        const actionLevel3 = level3.filter(c => c.parent_id === l2.id);
        actionLevel3.forEach((l3, l3idx) => {
          const isLastL3 = l3idx === actionLevel3.length - 1;
          const fieldPrefix = `action_l3_${l3.id}`;
          const branch = isLastL3 ? '└─' : '├─';
          tableRows.push({
            key: l3.id,
            dimension: `  │  ${branch} ${l3.name}`,
            fieldPrefix,
            level: 3,
            categoryId: l3.id,
            isSubDimension: true,
          });
        });
      });
    }

    if (developmentAbilityId) {
      tableRows.push({
        key: developmentAbilityId,
        dimension: '发展能力课程',
        fieldPrefix: 'developmentAbility',
        level: 1,
        categoryId: developmentAbilityId,
      });

      const developmentLevel2 = level2.filter(c => c.parent_id === developmentAbilityId);
      developmentLevel2.forEach((l2, l2idx) => {
        const isLastL2 = l2idx === developmentLevel2.length - 1;
        const fieldPrefix = `development_l2_${l2.id}`;
        tableRows.push({
          key: l2.id,
          dimension: `  ${isLastL2 ? '└─' : '├─'} ${l2.name}`,
          fieldPrefix,
          level: 2,
          categoryId: l2.id,
          isSubDimension: true,
        });

        const developmentLevel3 = level3.filter(c => c.parent_id === l2.id);
        developmentLevel3.forEach((l3, l3idx) => {
          const isLastL3 = l3idx === developmentLevel3.length - 1;
          const fieldPrefix = `development_l3_${l3.id}`;
          const branch = isLastL3 ? '└─' : '├─';
          tableRows.push({
            key: l3.id,
            dimension: `  │  ${branch} ${l3.name}`,
            fieldPrefix,
            level: 3,
            categoryId: l3.id,
            isSubDimension: true,
          });
        });
      });
    }

    setTableData(tableRows);
  };

  const loadExistingRules = async (frameworkId: string, cats: CompetencyCategory[]) => {
    if (!frameworkId || !domainRecord?.domain_id) return;

    console.log('=== LOAD EXISTING RULES ===');
    console.log('Framework ID:', frameworkId);
    console.log('Domain ID:', domainRecord.domain_id);

    try {
      const { data: domainRules, error: domainError } = await supabase
        .from('domain_course_framework_rules')
        .select('*')
        .eq('domain_id', domainRecord.domain_id)
        .eq('framework_id', frameworkId)
        .maybeSingle();

      if (domainError && domainError.code !== 'PGRST116') {
        throw domainError;
      }

      console.log('Domain rules found:', !!domainRules);

      let rules: any = null;

      if (domainRules) {
        rules = domainRules.rules;
        console.log('Using domain rules, keys count:', Object.keys(rules).length);
      } else {
        console.log('No domain rules, loading default rules from course_level_rules');
        const { data: defaultRules, error: defaultError } = await supabase
          .from('course_level_rules')
          .select('*')
          .eq('framework_id', frameworkId)
          .maybeSingle();

        if (defaultError && defaultError.code !== 'PGRST116') {
          throw defaultError;
        }

        if (defaultRules) {
          rules = defaultRules.rules;
          console.log('Using default rules, keys count:', Object.keys(rules).length);
        } else {
          console.log('No default rules found either');
        }
      }

      if (rules) {
        console.log('All rule keys:', Object.keys(rules));
        const formValues: Record<string, any> = {};

        if (rules.basicAbility?.type) {
          formValues.basicAbilityType = rules.basicAbility.type;
          formValues.basicAbilityCourseCount = rules.basicAbility.courseCount;
          formValues.basicAbilityTotalCredits = rules.basicAbility.totalCredits;
          formValues.basicAbilityReferenceHours = rules.basicAbility.referenceHours;
        }

        if (rules.actionAbility?.type) {
          formValues.actionAbilityType = rules.actionAbility.type;
          formValues.actionAbilityCourseCount = rules.actionAbility.courseCount;
          formValues.actionAbilityTotalCredits = rules.actionAbility.totalCredits;
          formValues.actionAbilityReferenceHours = rules.actionAbility.referenceHours;
        }

        if (rules.developmentAbility?.type) {
          formValues.developmentAbilityType = rules.developmentAbility.type;
          formValues.developmentAbilityCourseCount = rules.developmentAbility.courseCount;
          formValues.developmentAbilityTotalCredits = rules.developmentAbility.totalCredits;
          formValues.developmentAbilityReferenceHours = rules.developmentAbility.referenceHours;
        }


        Object.keys(rules).forEach(key => {
          if (key.startsWith('basic_l2_') || key.startsWith('basic_l3_') ||
              key.startsWith('action_l2_') || key.startsWith('action_l3_') ||
              key.startsWith('development_l2_') || key.startsWith('development_l3_')) {
            const rule = rules[key];
            if (rule?.type) {
              formValues[`${key}Type`] = rule.type;
              formValues[`${key}CourseCount`] = rule.courseCount;
              formValues[`${key}TotalCredits`] = rule.totalCredits;
              formValues[`${key}ReferenceHours`] = rule.referenceHours;
            }
          }
        });

        console.log('Form values to set:', Object.keys(formValues).length, 'fields');
        console.log('Development fields:', Object.keys(formValues).filter(k => k.includes('development')));
        form.setFieldsValue(formValues);
        setInitialValues(formValues);
        console.log('Form values set complete');
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    form.resetFields();
    setInitialValues({});
    setExpandedKeys(new Set());
    loadCategoriesAndRules(key, true);
  };

  const getDimensionName = (fieldPrefix: string): string => {
    const row = tableData.find(r => r.fieldPrefix === fieldPrefix);
    if (row) {
      return row.dimension.replace(/[│├└─\s]/g, '').trim();
    }
    return fieldPrefix;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (!domainRecord?.domain_id) {
        message.error('职业领域信息缺失');
        return;
      }

      const values = form.getFieldsValue();

      interface ValidationError {
        dimension: string;
        courseCount?: { current: number; initial: number };
        totalCredits?: { current: number; initial: number };
        referenceHours?: { current: number; initial: number };
      }

      const errorsByDimension = new Map<string, ValidationError>();

      Object.keys(values).forEach(key => {
        if (key.endsWith('CourseCount') || key.endsWith('TotalCredits') || key.endsWith('ReferenceHours')) {
          const currentValue = values[key];
          const initialValue = initialValues[key];

          if (initialValue !== undefined && currentValue !== undefined && currentValue < initialValue) {
            const fieldPrefix = key.replace(/(CourseCount|TotalCredits|ReferenceHours)$/, '');
            const dimensionName = getDimensionName(fieldPrefix);

            if (!errorsByDimension.has(dimensionName)) {
              errorsByDimension.set(dimensionName, { dimension: dimensionName });
            }

            const errorObj = errorsByDimension.get(dimensionName)!;
            if (key.endsWith('CourseCount')) {
              errorObj.courseCount = { current: currentValue, initial: initialValue };
            } else if (key.endsWith('TotalCredits')) {
              errorObj.totalCredits = { current: currentValue, initial: initialValue };
            } else if (key.endsWith('ReferenceHours')) {
              errorObj.referenceHours = { current: currentValue, initial: initialValue };
            }
          }
        }
      });

      if (errorsByDimension.size > 0) {
        Modal.warning({
          title: '以下字段值不能减少',
          width: 600,
          content: (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Array.from(errorsByDimension.values()).map((error, index) => (
                <div key={index} style={{ marginBottom: 16, padding: 12, background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#d46b08' }}>
                    {error.dimension}
                  </div>
                  <div style={{ paddingLeft: 12 }}>
                    {error.courseCount && (
                      <div style={{ marginBottom: 4 }}>• 课程数量不能小于原值 {error.courseCount.initial} 门</div>
                    )}
                    {error.totalCredits && (
                      <div style={{ marginBottom: 4 }}>• 学分总数不能小于原值 {error.totalCredits.initial} 学分</div>
                    )}
                    {error.referenceHours && (
                      <div style={{ marginBottom: 4 }}>• 参考学时不能小于原值 {error.referenceHours.initial} 学时</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ),
          okText: '我知道了',
        });
        return;
      }

      setLoading(true);
      console.log('=== SUBMIT DEBUG ===');
      console.log('All form values:', JSON.stringify(values, null, 2));

      const newRules: CourseRules = {};

      if (values.basicAbilityType) {
        newRules.basicAbility = {
          type: values.basicAbilityType,
          courseCount: values.basicAbilityCourseCount || 0,
          totalCredits: values.basicAbilityTotalCredits || 0,
          referenceHours: values.basicAbilityReferenceHours || 0,
        };
      }

      if (values.actionAbilityType) {
        newRules.actionAbility = {
          type: values.actionAbilityType,
          courseCount: values.actionAbilityCourseCount || 0,
          totalCredits: values.actionAbilityTotalCredits || 0,
          referenceHours: values.actionAbilityReferenceHours || 0,
        };
      }

      if (values.developmentAbilityType) {
        newRules.developmentAbility = {
          type: values.developmentAbilityType,
          courseCount: values.developmentAbilityCourseCount || 0,
          totalCredits: values.developmentAbilityTotalCredits || 0,
          referenceHours: values.developmentAbilityReferenceHours || 0,
        };
      }

      console.log('tableData subdimensions count:', tableData.filter(r => r.isSubDimension).length);

      tableData.forEach(row => {
        if (row.isSubDimension) {
          const typeValue = values[`${row.fieldPrefix}Type`];
          const courseCount = values[`${row.fieldPrefix}CourseCount`];
          const totalCredits = values[`${row.fieldPrefix}TotalCredits`];
          const referenceHours = values[`${row.fieldPrefix}ReferenceHours`];

          console.log(`Field ${row.fieldPrefix}:`, {
            type: typeValue,
            courseCount,
            totalCredits,
            referenceHours,
            hasType: !!typeValue
          });

          if (typeValue) {
            newRules[row.fieldPrefix] = {
              type: typeValue,
              courseCount: courseCount || 0,
              totalCredits: totalCredits || 0,
              referenceHours: referenceHours || 0,
            };
          }
        }
      });

      console.log('newRules keys count:', Object.keys(newRules).length);
      console.log('newRules:', JSON.stringify(newRules, null, 2));

      const { data: existing } = await supabase
        .from('domain_course_framework_rules')
        .select('id, rules')
        .eq('domain_id', domainRecord.domain_id)
        .eq('framework_id', activeTab)
        .maybeSingle();

      console.log('Existing data:', existing);
      console.log('Existing rules keys:', existing ? Object.keys(existing.rules).length : 0);

      let baseRules: CourseRules = {};

      if (existing) {
        baseRules = { ...existing.rules };
        console.log('Starting from existing rules with', Object.keys(baseRules).length, 'keys');
      } else {
        console.log('No existing rules, loading default rules from course_level_rules');
        const { data: defaultRules } = await supabase
          .from('course_level_rules')
          .select('rules')
          .eq('framework_id', activeTab)
          .maybeSingle();

        if (defaultRules?.rules) {
          baseRules = { ...defaultRules.rules };
          console.log('Starting from default rules with', Object.keys(baseRules).length, 'keys');
        }
      }

      const finalRules = { ...baseRules };
      Object.keys(newRules).forEach(key => {
        finalRules[key] = newRules[key];
      });
      console.log('After merge, finalRules has', Object.keys(finalRules).length, 'keys');

      if (existing) {
        const { error } = await supabase
          .from('domain_course_framework_rules')
          .update({ rules: finalRules })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('domain_course_framework_rules')
          .insert({
            domain_id: domainRecord.domain_id,
            framework_id: activeTab,
            rules: finalRules,
          });

        if (error) throw error;
      }

      message.success('职业领域课程框架规则保存成功');

      setFrameworkStatus(prev => ({
        ...prev,
        [activeTab]: true
      }));

      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error saving rules:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) => {
    if (expandedKeys.has(key)) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set([key]));
    }
  };

  const getVisibleData = () => {
    return tableData.filter(row => {
      if (!row.isSubDimension) return true;

      const parentKey = row.fieldPrefix.startsWith('basic_') ? 'basicAbility' :
                        row.fieldPrefix.startsWith('action_') ? 'actionAbility' :
                        row.fieldPrefix.startsWith('development_') ? 'developmentAbility' : '';

      return expandedKeys.has(parentKey);
    });
  };

  const getParentPrefix = (fieldPrefix: string): string | null => {
    if (fieldPrefix.startsWith('basic_')) return 'basicAbility';
    if (fieldPrefix.startsWith('action_')) return 'actionAbility';
    if (fieldPrefix.startsWith('development_')) return 'developmentAbility';
    return null;
  };

  const getChildrenPrefixes = (parentPrefix: string): string[] => {
    return tableData
      .filter(row => row.isSubDimension && getParentPrefix(row.fieldPrefix) === parentPrefix)
      .map(row => row.fieldPrefix);
  };

  const isFieldDisabled = (record: TableDataType): boolean => {
    const allValues = form.getFieldsValue();

    if (!record.isSubDimension) {
      const childPrefixes = getChildrenPrefixes(record.fieldPrefix);
      const hasChildSelected = childPrefixes.some(prefix => allValues[`${prefix}Type`]);
      return hasChildSelected;
    } else {
      const parentPrefix = getParentPrefix(record.fieldPrefix);
      if (parentPrefix) {
        const parentSelected = allValues[`${parentPrefix}Type`];
        return !!parentSelected;
      }
      return false;
    }
  };

  const columns: ColumnsType<TableDataType> = [
    {
      title: '能力维度',
      dataIndex: 'dimension',
      key: 'dimension',
      width: 200,
      render: (text, record) => {
        const hasChildren = tableData.some(row =>
          row.isSubDimension &&
          (row.fieldPrefix.startsWith('basic_') && record.fieldPrefix === 'basicAbility' ||
           row.fieldPrefix.startsWith('action_') && record.fieldPrefix === 'actionAbility' ||
           row.fieldPrefix.startsWith('development_') && record.fieldPrefix === 'developmentAbility')
        );

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              strong={!record.isSubDimension}
              style={{
                color: record.isSubDimension ? '#666' : '#000',
                fontFamily: 'monospace'
              }}
            >
              {text}
            </Text>
            {!record.isSubDimension && hasChildren && (
              <Button
                type="text"
                size="small"
                icon={expandedKeys.has(record.fieldPrefix) ? <DownOutlined /> : <RightOutlined />}
                onClick={() => toggleExpand(record.fieldPrefix)}
                style={{ marginLeft: 8, padding: '0 4px' }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: '课程类型',
      key: 'type',
      width: 220,
      align: 'center',
      render: (_, record) => {
        const fieldName = `${record.fieldPrefix}Type`;

        return (
          <Form.Item
            name={fieldName}
            rules={[{ required: false }]}
            style={{ marginBottom: 0 }}
          >
            <Form.Item noStyle shouldUpdate>
              {() => {
                const currentValue = form.getFieldValue(fieldName);
                const disabled = isFieldDisabled(record);

                const isCommon = activeTab && frameworkCommonStatus[activeTab];
                const isButtonReadonly = isCommon !== undefined;

                const handleClick = (value: string) => {
                  if (isButtonReadonly) {
                    let tooltipTitle = '';
                    if (isCommon === true) {
                      message.warning('不可修改课程类型，只可修改对应的课程数量、学分、学时');
                    } else if (isCommon === false) {
                      message.warning('不可修改课程类型，只可修改对应的课程数量、学分、学时');
                    }
                    return;
                  }
                  if (currentValue === value) {
                    form.setFieldValue(fieldName, undefined);
                  } else {
                    form.setFieldValue(fieldName, value);
                  }
                };

                const renderButton = (value: 'standard' | 'domain', label: string) => {
                  const isSelected = currentValue === value;

                  return (
                    <Button
                      type={isSelected ? 'primary' : 'default'}
                      onClick={() => handleClick(value)}
                      disabled={disabled}
                    >
                      {label}
                    </Button>
                  );
                };

                return (
                  <Button.Group size="small">
                    {renderButton('standard', '标准课程')}
                    {renderButton('domain', '领域课程')}
                  </Button.Group>
                );
              }}
            </Form.Item>
          </Form.Item>
        );
      },
    },
    {
      title: '课程数量（门）',
      key: 'courseCount',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const typeFieldName = `${record.fieldPrefix}Type`;
        const fieldName = `${record.fieldPrefix}CourseCount`;

        return (
          <Form.Item noStyle shouldUpdate={(prev, curr) =>
            prev[typeFieldName] !== curr[typeFieldName]
          }>
            {() => {
              const typeValue = form.getFieldValue(typeFieldName);
              const parentDisabled = isFieldDisabled(record);
              const isCommon = activeTab && frameworkCommonStatus[activeTab];
              const disabled = !typeValue || parentDisabled || isCommon;

              return (
                <Form.Item
                  name={fieldName}
                  dependencies={[typeFieldName]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const typeValue = getFieldValue(typeFieldName);
                        if (typeValue && (value === undefined || value === null || value === '')) {
                          return Promise.reject(new Error('必填'));
                        }
                        if (value !== undefined && value !== null && value !== '' && value < 0) {
                          return Promise.reject(new Error('不能为负'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" size="small" disabled={disabled} />
                </Form.Item>
              );
            }}
          </Form.Item>
        );
      },
    },
    {
      title: '学分总数（学分）',
      key: 'totalCredits',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const typeFieldName = `${record.fieldPrefix}Type`;
        const fieldName = `${record.fieldPrefix}TotalCredits`;

        return (
          <Form.Item noStyle shouldUpdate={(prev, curr) =>
            prev[typeFieldName] !== curr[typeFieldName]
          }>
            {() => {
              const typeValue = form.getFieldValue(typeFieldName);
              const parentDisabled = isFieldDisabled(record);
              const isCommon = activeTab && frameworkCommonStatus[activeTab];
              const disabled = !typeValue || parentDisabled || isCommon;

              return (
                <Form.Item
                  name={fieldName}
                  dependencies={[typeFieldName]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const typeValue = getFieldValue(typeFieldName);
                        if (typeValue && (value === undefined || value === null || value === '')) {
                          return Promise.reject(new Error('必填'));
                        }
                        if (value !== undefined && value !== null && value !== '' && value < 0) {
                          return Promise.reject(new Error('不能为负'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="0" size="small" disabled={disabled} />
                </Form.Item>
              );
            }}
          </Form.Item>
        );
      },
    },
    {
      title: '参考学时（学时）',
      key: 'referenceHours',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const typeFieldName = `${record.fieldPrefix}Type`;
        const fieldName = `${record.fieldPrefix}ReferenceHours`;

        return (
          <Form.Item noStyle shouldUpdate={(prev, curr) =>
            prev[typeFieldName] !== curr[typeFieldName]
          }>
            {() => {
              const typeValue = form.getFieldValue(typeFieldName);
              const parentDisabled = isFieldDisabled(record);
              const isCommon = activeTab && frameworkCommonStatus[activeTab];
              const disabled = !typeValue || parentDisabled || isCommon;

              return (
                <Form.Item
                  name={fieldName}
                  dependencies={[typeFieldName]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const typeValue = getFieldValue(typeFieldName);
                        if (typeValue && (value === undefined || value === null || value === '')) {
                          return Promise.reject(new Error('必填'));
                        }
                        if (value !== undefined && value !== null && value !== '' && value < 0) {
                          return Promise.reject(new Error('不能为负'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" size="small" disabled={disabled} />
                </Form.Item>
              );
            }}
          </Form.Item>
        );
      },
    },
  ];

  return (
    <Modal
      title={`设置职业领域课程框架 - ${domainRecord?.industry_categories?.name || domainRecord?.standard_name || ''}`}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          提交生成课程框架
        </Button>,
      ]}
    >
      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载数据..." />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text type="secondary">
                配置本职业领域各课程等级的三大能力维度课程规则
              </Text>
            </Space>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={frameworks.map(fw => ({
              key: fw.id,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{fw.level_name}</span>
                  {domainRecord?.id && (
                    frameworkStatus[fw.id] === true ? (
                      <Tooltip title="已设置课程框架">
                        <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="未设置课程框架">
                        <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: '16px' }} />
                      </Tooltip>
                    )
                  )}
                </div>
              ),
              children: tabLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', minHeight: '300px' }}>
                  <Spin tip="加载课程规则..." />
                </div>
              ) : (
                <Form form={form} component={false}>
                  <Table
                    dataSource={getVisibleData()}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                    rowClassName={(record) => record.isSubDimension ? 'bg-gray-50' : ''}
                  />
                </Form>
              ),
            }))}
          />

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ background: '#fafafa', padding: '12px 16px', borderRadius: 4 }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '13px' }}>说明</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • 标准课程：通用性课程，适用于所有职业领域
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • 领域课程：针对本职业领域的课程
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • 基础能力课程的二级、三级维度来源于能力分类体系
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • 参考学时通常为学分的16倍（1学分 = 16学时）
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • 首次加载国际课程体系框架的默认规则，修改后保存到职业领域课程框架表
              </Text>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DomainCourseFrameworkSettings;
