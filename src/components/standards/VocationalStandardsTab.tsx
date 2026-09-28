import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, CheckCircle, Shield, FileText, Layers, Calendar, Target, BookOpen, Plus, Settings, LayoutGrid } from 'lucide-react';
import { Table, Tag, Button, Space, Input, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../../lib/supabase';
import DomainCourseFrameworkSettings from './DomainCourseFrameworkSettings';
import MappingDocumentViewer from './MappingDocumentViewer';
import DomainCourseFrameworkViewer from '../course/DomainCourseFrameworkViewer';

const VocationalStandardsTab: React.FC = () => {
  const [standards, setStandards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [showMappingViewer, setShowMappingViewer] = useState(false);
  const [mappingDomainId, setMappingDomainId] = useState<string>('');
  const [showFrameworkViewer, setShowFrameworkViewer] = useState(false);
  const [viewerDomainId, setViewerDomainId] = useState<string>('');
  const [viewerDomainName, setViewerDomainName] = useState<string>('');

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('standard_documents')
        .select(`
          *,
          industry_categories (
            id,
            name,
            code,
            description
          )
        `)
        .in('status', ['finalized'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStandards(data || []);
    } catch (error) {
      console.error('Error loading standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStandards = standards.filter(standard =>
    standard.standard_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    standard.version.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (standard.industry_categories?.name && standard.industry_categories.name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
    (standard.introduction && standard.introduction.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  const handleSetupFramework = (record: any) => {
    setSelectedDomain(record);
    setShowFrameworkModal(true);
  };

  const handleFrameworkSuccess = () => {
    loadStandards();
  };

  const standardColumns: ColumnsType<any> = [
    {
      title: '序号',
      key: 'index',
      width: 26,
      render: (_, __, index) => index + 1,
    },
    {
      title: '职业领域标准名称',
      dataIndex: 'standard_name',
      key: 'standard_name',
      width: 130,
      render: (name) => (
        <span className="font-semibold text-gray-900">{name}</span>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 40,
      render: (version) => (
        <Tag color="blue">{version}</Tag>
      ),
    },
    {
      title: '职业领域名称',
      dataIndex: ['industry_categories', 'name'],
      key: 'domain',
      width: 100,
      render: (_, record) => (
        <span className="text-gray-700">
          {record.industry_categories?.name || '未关联'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 40,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看标准">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => setSelectedStandard(record)}
            />
          </Tooltip>
          <Tooltip title="设置课程框架">
            <Button
              type="text"
              icon={<Settings size={16} />}
              onClick={() => handleSetupFramework(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4">
          <Input
            placeholder="搜索标准名称、版本、职业领域或简介..."
            prefix={<Search size={16} className="text-gray-400" />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="large"
            allowClear
            className="flex-1"
          />
          <Button
            type="primary"
            size="large"
            icon={<Filter size={16} />}
          >
            筛选
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">领域标准列表</h3>
            </div>
          </div>
        </div>

        <Table
          columns={standardColumns}
          dataSource={filteredStandards}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个领域标准`,
          }}
        />
      </div>

      {selectedStandard && (
        <div className="fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300 p-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">领域标准详情</h3>
              <Button
                type="text"
                icon={<Plus size={20} className="rotate-45" />}
                onClick={() => setSelectedStandard(null)}
              />
            </div>
          </div>

          <div className="p-6 space-y-5">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Shield className="text-gray-700 mr-2" size={18} />
                  <h4 className="font-semibold text-gray-900">基本信息</h4>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">标准名称</label>
                  <div className="mt-1.5 text-base font-semibold text-gray-900">
                    {selectedStandard.standard_name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">版本</label>
                    <div className="mt-1.5">
                      <Tag color="blue" className="text-sm">{selectedStandard.version}</Tag>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">状态</label>
                    <div className="mt-1.5">
                      <Tag color="green" icon={<CheckCircle size={12} />} className="text-sm">
                        已定稿
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {selectedStandard.industry_categories && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Layers className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">所属职业领域</h4>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">领域名称</label>
                      <div className="mt-1.5 text-sm font-medium text-gray-900">
                        {selectedStandard.industry_categories.name}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">领域代码</label>
                      <div className="mt-1.5 text-sm font-mono font-medium text-gray-900">
                        {selectedStandard.industry_categories.code}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {selectedStandard.introduction && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <BookOpen className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">总述</h4>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedStandard.introduction}
                  </p>
                </div>
              </section>
            )}

            {selectedStandard.terms_definitions && selectedStandard.terms_definitions.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <BookOpen className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">术语和定义</h4>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    {selectedStandard.terms_definitions.map((term: any, index: number) => (
                      <div key={index} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="font-medium text-gray-900 text-sm">{term.term}</div>
                        <div className="mt-1 text-sm text-gray-600">{term.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {selectedStandard.standard_content && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <FileText className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">标准正文</h4>
                  </div>
                </div>
                <div className="p-5">
                  {selectedStandard.standard_content.description && (
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">描述</label>
                      <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
                        {selectedStandard.standard_content.description}
                      </p>
                    </div>
                  )}
                  {selectedStandard.standard_content.ability_requirements &&
                   selectedStandard.standard_content.ability_requirements.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">能力要求</label>
                      <div className="mt-2 space-y-2">
                        {selectedStandard.standard_content.ability_requirements.map((req: any, index: number) => (
                          <div key={index} className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                            {req.primary_ability && (
                              <div className="font-medium text-gray-900">{req.primary_ability}</div>
                            )}
                            {req.description && (
                              <div className="mt-1 text-gray-600">{req.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {selectedStandard.basic_info && (selectedStandard.basic_info.scope || selectedStandard.basic_info.purpose) && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Target className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">适用范围与目的</h4>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {selectedStandard.basic_info.scope && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">适用范围</label>
                      <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
                        {selectedStandard.basic_info.scope}
                      </p>
                    </div>
                  )}
                  {selectedStandard.basic_info.purpose && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">标准目的</label>
                      <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
                        {selectedStandard.basic_info.purpose}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {selectedStandard.appendix_files && selectedStandard.appendix_files.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <FileText className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">附录文件</h4>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {selectedStandard.appendix_files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                        <span className="text-sm text-gray-700">{file.name || `附录 ${index + 1}`}</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<Download size={14} />}
                        >
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {selectedStandard.domain_id && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Layers className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">映射文档</h4>
                  </div>
                </div>
                <div className="p-5">
                  <Button
                    type="default"
                    block
                    icon={<Eye size={16} />}
                    onClick={() => {
                      setMappingDomainId(selectedStandard.domain_id);
                      setShowMappingViewer(true);
                    }}
                  >
                    查看映射文档
                  </Button>
                </div>
              </section>
            )}

            {(selectedStandard.created_at || selectedStandard.updated_at) && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Calendar className="text-gray-700 mr-2" size={18} />
                    <h4 className="font-semibold text-gray-900">时间信息</h4>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStandard.created_at && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">创建时间</label>
                        <div className="mt-1.5 text-sm text-gray-900">
                          {new Date(selectedStandard.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    )}
                    {selectedStandard.updated_at && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">更新时间</label>
                        <div className="mt-1.5 text-sm text-gray-900">
                          {new Date(selectedStandard.updated_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      <DomainCourseFrameworkSettings
        visible={showFrameworkModal}
        onCancel={() => setShowFrameworkModal(false)}
        domainRecord={selectedDomain}
        onSuccess={handleFrameworkSuccess}
      />

      <MappingDocumentViewer
        visible={showMappingViewer}
        onClose={() => setShowMappingViewer(false)}
        domainId={mappingDomainId}
        standardName={selectedStandard?.standard_name}
      />

      <DomainCourseFrameworkViewer
        visible={showFrameworkViewer}
        onClose={() => {
          setShowFrameworkViewer(false);
          setViewerDomainId('');
          setViewerDomainName('');
        }}
        domainId={viewerDomainId}
        domainName={viewerDomainName}
      />
    </div>
  );
};

export default VocationalStandardsTab;
