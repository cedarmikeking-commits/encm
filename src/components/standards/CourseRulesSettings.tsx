import React, { useState, useEffect } from 'react';
import { Modal, Form, Table, InputNumber, Radio, Button, Space, message, Typography, Divider, Spin, Checkbox } from 'antd';
import { SaveOutlined, InfoCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface CourseRulesSettingsProps {
  visible: boolean;
  onCancel: () => void;
  record: CourseFrameworkType | null;
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

const CourseRulesSettings: React.FC<CourseRulesSettingsProps> = ({
  visible,
  onCancel,
  record,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [categories, setCategories] = useState<CompetencyCategory[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [isCommon, setIsCommon] = useState(false);

  useEffect(() => {
    // if (visible) {
    //   loadCategories();
    // } else {
    //   form.resetFields();
    //   setIsCommon(false);
    // }
  }, [visible, record]);

  const loadCategories = async () => {
    setDataLoading(true);
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

      if (record) {
        await loadExistingRules(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      message.error('加载能力分类失败');
    } finally {
      setDataLoading(false);
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

  const loadExistingRules = async (cats: CompetencyCategory[]) => {
    if (!record?.id) return;

    try {
      console.log('Loading rules for framework:', record.id, record.level_name);

      const { data, error } = await supabase
        .from('course_level_rules')
        .select('*')
        .eq('framework_id', record.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('Loaded rules data:', data);

      if (data) {
        const rules = data.rules;
        const formValues: Record<string, any> = {};

        // 加载是否通用标识
        setIsCommon(data.is_common || false);

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

        console.log('Setting form values:', formValues);
        form.setFieldsValue(formValues);
      } else {
        console.log('No existing rules found, form will be empty');
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue();
      console.log('Form values before save:', values);
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

      tableData.forEach(row => {
        if (row.isSubDimension) {
          const typeValue = values[`${row.fieldPrefix}Type`];
          if (typeValue) {
            newRules[row.fieldPrefix] = {
              type: typeValue,
              courseCount: values[`${row.fieldPrefix}CourseCount`] || 0,
              totalCredits: values[`${row.fieldPrefix}TotalCredits`] || 0,
              referenceHours: values[`${row.fieldPrefix}ReferenceHours`] || 0,
            };
          }
        }
      });

      const { data: existing } = await supabase
        .from('course_level_rules')
        .select('id, rules')
        .eq('framework_id', record?.id)
        .maybeSingle();

      let finalRules: CourseRules;

      if (existing) {
        // 从现有规则开始，保留所有旧规则
        finalRules = { ...existing.rules };

        // 更新表单中有类型值的规则（覆盖或添加）
        Object.keys(newRules).forEach(key => {
          finalRules[key] = newRules[key];
        });

        console.log('Saving rules:', {
          existing: existing.rules,
          new: newRules,
          final: finalRules
        });

        const { error } = await supabase
          .from('course_level_rules')
          .update({
            rules: finalRules,
            is_common: isCommon
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        finalRules = newRules;
        const { error } = await supabase
          .from('course_level_rules')
          .insert({
            framework_id: record?.id,
            rules: finalRules,
            is_common: isCommon,
          });

        if (error) throw error;
      }

      console.log('Rules saved successfully for framework:', record?.id);
      message.success('规则设置保存成功');
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

                const handleClick = (value: string) => {
                  if (currentValue === value) {
                    form.setFieldValue(fieldName, undefined);
                  } else {
                    form.setFieldValue(fieldName, value);
                  }
                };

                return (
                  <Button.Group size="small">
                    <Button
                      type={currentValue === 'standard' ? 'primary' : 'default'}
                      onClick={() => handleClick('standard')}
                      disabled={disabled}
                    >
                      标准课程
                    </Button>
                    <Button
                      type={currentValue === 'domain' ? 'primary' : 'default'}
                      onClick={() => handleClick('domain')}
                      disabled={disabled}
                    >
                      领域课程
                    </Button>
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
              const disabled = !typeValue || parentDisabled;

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
              const disabled = !typeValue || parentDisabled;

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
              const disabled = !typeValue || parentDisabled;

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
      title={`课程规则设置 - ${record?.level_name || ''}`}
      open={visible}
      onCancel={onCancel}
      width={950}
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
          保存规则
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary">
              配置三大能力维度的课程规则，基础能力课程支持二级和三级维度配置
            </Text>
          </Space>
          <Checkbox
            checked={isCommon}
            onChange={(e) => setIsCommon(e.target.checked)}
          >
            <Text strong>规则是否通用</Text>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
              （通用规则适用于所有职业领域，非通用规则仅适用于当前课程等级）
            </Text>
          </Checkbox>
        </Space>
      </div>

      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载能力分类数据..." />
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
      )}

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
        </Space>
      </div>
    </Modal>
  );
};

export default CourseRulesSettings;
