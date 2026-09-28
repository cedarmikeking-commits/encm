import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Tag, Tooltip, Spin } from 'antd';
import { Search, Eye, X } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../../lib/supabase';

interface MappingDocumentViewerProps {
  visible: boolean;
  onClose: () => void;
  domainId: string;
  standardName?: string;
}

interface MappingRow {
  id: string;
  first_dimension: string;
  second_dimension: string;
  third_dimension: string;
  concept_definition: string;
  ivrl1_description: string;
  ivrl2_description: string;
  ivrl3_description: string;
  ivrl4_description?: string;
  sort_order: number;
}

interface MappingDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  status: string;
}

const MappingDocumentViewer: React.FC<MappingDocumentViewerProps> = ({
  visible,
  onClose,
  domainId,
  standardName,
}) => {
  const [loading, setLoading] = useState(false);
  const [mappingDocument, setMappingDocument] = useState<MappingDocument | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCell, setSelectedCell] = useState<{
    content: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (visible && domainId) {
      loadMappingData();
    }
  }, [visible, domainId]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const { data: docData, error: docError } = await supabase
        .from('mapping_documents')
        .select('*')
        .eq('domain_id', domainId)
        .maybeSingle();

      if (docError) throw docError;

      if (docData) {
        setMappingDocument(docData);

        const { data: rowsData, error: rowsError } = await supabase
          .from('mapping_rows')
          .select('*')
          .eq('document_id', docData.id)
          .order('sort_order', { ascending: true });

        if (rowsError) throw rowsError;
        setMappingRows(rowsData || []);
      } else {
        setMappingDocument(null);
        setMappingRows([]);
      }
    } catch (error) {
      console.error('Error loading mapping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (content: string, title: string) => {
    if (content && content.length > 20) {
      setSelectedCell({ content, title });
    }
  };

  const filteredData = mappingRows.filter((row) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      row.first_dimension?.toLowerCase().includes(searchLower) ||
      row.second_dimension?.toLowerCase().includes(searchLower) ||
      row.third_dimension?.toLowerCase().includes(searchLower) ||
      row.concept_definition?.toLowerCase().includes(searchLower) ||
      row.ivrl1_description?.toLowerCase().includes(searchLower) ||
      row.ivrl2_description?.toLowerCase().includes(searchLower) ||
      row.ivrl3_description?.toLowerCase().includes(searchLower)
    );
  });

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const CellWithTooltip: React.FC<{ content: string; columnName: string }> = ({
    content,
    columnName,
  }) => {
    if (!content) return <span className="text-gray-400">-</span>;

    const truncated = truncateText(content);
    const isTruncated = content.length > 30;

    return (
      <div className="flex items-center justify-between group">
        <span className="flex-1">{truncated}</span>
        {isTruncated && (
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCellClick(content, columnName)}
          />
        )}
      </div>
    );
  };

  const columns: ColumnsType<MappingRow> = [
    {
      title: '一级维度',
      dataIndex: 'first_dimension',
      key: 'first_dimension',
      width: 100,
      fixed: 'left',
      render: (text) => <span className="font-medium text-gray-900">{text || '-'}</span>,
    },
    {
      title: '二级维度',
      dataIndex: 'second_dimension',
      key: 'second_dimension',
      width: 120,
      render: (text) => <span className="text-gray-800">{text || '-'}</span>,
    },
    {
      title: '三级维度',
      dataIndex: 'third_dimension',
      key: 'third_dimension',
      width: 120,
      render: (text) => <span className="text-gray-800">{text || '-'}</span>,
    },
    {
      title: '概念释义',
      dataIndex: 'concept_definition',
      key: 'concept_definition',
      width: 200,
      render: (text) => <CellWithTooltip content={text} columnName="概念释义" />,
    },
    {
      title: 'IVRL1',
      dataIndex: 'ivrl1_description',
      key: 'ivrl1_description',
      width: 220,
      render: (text) => <CellWithTooltip content={text} columnName="IVRL1" />,
    },
    {
      title: 'IVRL2',
      dataIndex: 'ivrl2_description',
      key: 'ivrl2_description',
      width: 220,
      render: (text) => <CellWithTooltip content={text} columnName="IVRL2" />,
    },
    {
      title: 'IVRL3',
      dataIndex: 'ivrl3_description',
      key: 'ivrl3_description',
      width: 220,
      render: (text) => <CellWithTooltip content={text} columnName="IVRL3" />,
    },
  ];

  if (!mappingDocument && !loading) {
    return (
      <Modal
        title="映射文档"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        centered
      >
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">暂无映射文档</div>
          <div className="text-sm text-gray-500">该领域标准尚未关联映射文档</div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold text-gray-900">映射文档查看</div>
            {mappingDocument && (
              <div className="mt-2 space-y-1">
                <div className="text-sm text-gray-600">{mappingDocument.title}</div>
                <Space size="small">
                  <Tag color="blue">{mappingDocument.version}</Tag>
                </Space>
              </div>
            )}
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width="95vw"
        style={{ top: 20, maxWidth: 1600 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div className="space-y-4">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              scroll={{ x: 1400, y: 'calc(100vh - 340px)' }}
              pagination={false}
              size="small"
              bordered
              className="mapping-table"
            />
          </Spin>
        </div>
      </Modal>

      <Modal
        title={selectedCell?.title}
        open={!!selectedCell}
        onCancel={() => setSelectedCell(null)}
        footer={
          <Button onClick={() => setSelectedCell(null)}>关闭</Button>
        }
        width={700}
        centered
      >
        <div className="py-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedCell?.content}
          </p>
        </div>
      </Modal>

      <style>{`
        .mapping-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          font-weight: 600;
          font-size: 13px;
          color: #1f2937;
          padding: 12px 8px;
        }
        .mapping-table .ant-table-tbody > tr > td {
          padding: 10px 8px;
          font-size: 13px;
        }
        .mapping-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb;
        }
      `}</style>
    </>
  );
};

export default MappingDocumentViewer;
