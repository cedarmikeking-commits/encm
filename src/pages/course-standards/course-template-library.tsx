import React, { useState } from 'react';
import { Card, Typography, Tag, Button, Row, Col, message } from 'antd';
import { ChevronRight } from 'lucide-react';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  StarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  TrophyOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import CourseStandardTemplate from '../../components/course-standards/CourseStandardTemplate';

const { Title, Text, Paragraph: AntParagraph } = Typography;

interface TemplateCategory {
  key: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  tag: string;
  tagColor: string;
  count: string;
  available: boolean;
  canEnter: boolean;
}

const templateCategories: TemplateCategory[] = [
  {
    key: 'vocational',
    title: '职业素养课程标准模版',
    titleEn: 'Vocational Quality Course Template',
    description: '培养学习者从事职业活动所需的基本素养，涵盖职业理想、职业认知、职业态度、职业纪律、职业伦理等核心内容。',
    icon: <StarOutlined style={{ fontSize: 24 }} />,
    color: '#2563eb',
    bgGradient: '#ffffff',
    borderColor: '#e2e8f0',
    tag: '基础能力',
    tagColor: 'blue',
    count: '1 个模版',
    available: true,
    canEnter: false
  },
  {
    key: 'professional',
    title: '专业能力课程标准模版',
    titleEn: 'Professional Competency Course Template',
    description: '针对特定职业领域的专业知识与技能，构建系统化的专业能力培养体系，满足行业岗位核心能力要求。',
    icon: <ThunderboltOutlined style={{ fontSize: 24 }} />,
    color: '#0891b2',
    bgGradient: '#ffffff',
    borderColor: '#e2e8f0',
    tag: '基础能力',
    tagColor: 'cyan',
    count: '1 个模版',
    available: true,
    canEnter: false
  },
  {
    key: 'action',
    title: '行动能力课程标准模版',
    titleEn: 'Action Competency Course Template',
    description: '以工作任务为导向，强化学习者在真实或仿真职业情境中的行动能力，注重实践操作与问题解决能力的培养。',
    icon: <RocketOutlined style={{ fontSize: 24 }} />,
    color: '#059669',
    bgGradient: '#ffffff',
    borderColor: '#e2e8f0',
    tag: '行动能力',
    tagColor: 'green',
    count: '1 个模版',
    available: true,
    canEnter: false
  },
  {
    key: 'development',
    title: '发展能力课程标准模版',
    titleEn: 'Development Competency Course Template',
    description: '聚焦学习者的持续成长与职业发展潜力，培养创新思维、学习迁移、跨领域协作等高阶发展能力。',
    icon: <TrophyOutlined style={{ fontSize: 24 }} />,
    color: '#7c3aed',
    bgGradient: '#ffffff',
    borderColor: '#e2e8f0',
    tag: '发展能力',
    tagColor: 'purple',
    count: '1 个模版',
    available: true,
    canEnter: false
  }
];

const generateTemplateDoc = (title: string): Document => {
  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: '[课程名称]',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: '课程标准',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new Paragraph({
            text: '目    录',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Paragraph({ text: '一、课程适应对象', spacing: { after: 100 } }),
          new Paragraph({ text: '二、课程基本信息', spacing: { after: 100 } }),
          new Paragraph({ text: '三、课程性质与任务', spacing: { after: 100 } }),
          new Paragraph({ text: '    （一）课程性质', spacing: { after: 100 } }),
          new Paragraph({ text: '    （二）课程任务', spacing: { after: 100 } }),
          new Paragraph({ text: '四、课程目标', spacing: { after: 100 } }),
          new Paragraph({ text: '五、课程内容', spacing: { after: 100 } }),
          new Paragraph({ text: '六、教学实施与保障', spacing: { after: 100 } }),
          new Paragraph({ text: '    （一）教学设计', spacing: { after: 100 } }),
          new Paragraph({ text: '    （二）教学资源开发与应用', spacing: { after: 100 } }),
          new Paragraph({ text: '    （三）师资要求', spacing: { after: 100 } }),
          new Paragraph({ text: '    （四）校企合作情况', spacing: { after: 100 } }),
          new Paragraph({ text: '    （五）教材选用及辅助教学资料', spacing: { after: 100 } }),
          new Paragraph({ text: '七、课程考核与评价', spacing: { after: 100 } }),
          new Paragraph({ text: '    （一）课程评价方法', spacing: { after: 100 } }),
          new Paragraph({ text: '    （二）评分标准', spacing: { after: 600 } }),
          new Paragraph({
            text: '一、课程适应对象',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [请描述课程适应对象...]' })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '二、课程基本信息',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '课程名称：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: '课程代码：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '学分：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: '学时：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '课程类型：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: '授课时间：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '授课对象：' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: '' })] })
                ]
              })
            ]
          }),
          new Paragraph({
            text: '三、课程性质与任务',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '（一）课程性质',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [课程性质描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（二）课程任务',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [课程任务描述...]' })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '四、课程目标',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [课程目标描述...]' })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '五、课程内容',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [课程内容描述...]' })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '六、教学实施与保障',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '（一）教学设计',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [教学设计描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（二）教学资源开发与应用',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [教学资源开发与应用描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（三）师资要求',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [师资要求描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（四）校企合作情况',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [校企合作情况描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（五）教材选用及辅助教学资料',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [教材选用及辅助教学资料描述...]' })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '七、课程考核与评价',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '（一）课程评价方法',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [课程评价方法描述...]' })],
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '（二）评分标准',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: '        [评分标准描述...]' })],
            spacing: { after: 600 }
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: '制定人：___________' })],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: '审核人：___________' })],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: '批准人：___________' })],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: '制定日期：____年__月__日' })],
            spacing: { after: 200 }
          })
        ]
      }
    ]
  });
};

const handleDownloadTemplate = async (category: TemplateCategory) => {
  try {
    const doc = generateTemplateDoc(category.title);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${category.title}.docx`);
    message.success('模板下载成功');
  } catch {
    message.error('下载失败，请重试');
  }
};

const CourseTemplateLibrary: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (activeKey === 'professional') {
    return (
      <div>
        <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setActiveKey(null)}
            type="text"
            style={{ fontWeight: 500, color: '#1677ff' }}
          >
            返回模板库
          </Button>
          <Text type="secondary" style={{ fontSize: 13 }}>课程标准模板库 / 专业能力课程标准模版</Text>
        </div>
        <CourseStandardTemplate />
      </div>
    );
  }

  return (
    <div style={{ padding: '0px 32px 48px',minHeight: '100vh' }}>
      <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程标准设计</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">课程标准模板</span>
        </div>
      </div>
      <div className='mt-10'>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileTextOutlined style={{ fontSize: 22, color: '#fff' }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#0a0a0a', fontWeight: 700 }}>
                课程标准模板库
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Course Standard Template Library</Text>
            </div>
          </div>
           <div style={{ marginTop: 48, padding: '20px 28px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 4, height: 16, background: '#1677ff', borderRadius: 2 }} />
            <Text strong style={{ fontSize: 14 }}>使用说明</Text>
          </div>
          <Row gutter={48}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
                <Text strong style={{ color: '#374151' }}>模板选择：</Text>根据课程所属能力类别，选择对应的课程标准模板类型。
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
                <Text strong style={{ color: '#374151' }}>内容填写：</Text>下载模板后按照各章节要求填写完整的课程标准内容。
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
                <Text strong style={{ color: '#374151' }}>审核发布：</Text>完成填写后提交审核，通过后方可发布并在系统中使用。
              </Text>
            </Col>
          </Row>
        </div>
        </div>

        <Row gutter={[20, 20]}>
          {templateCategories.map((category) => (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={category.key}>
              <Card
                style={{
                  borderRadius: 12,
                  border: '1px solid #e8edf2',
                  background: '#ffffff',
                  cursor: 'default',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  height: '100%'
                }}
                bodyStyle={{ padding: 0 }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = category.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e8edf2';
                }}
              >
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{
                    width: 4,
                    flexShrink: 0,
                    background: category.color,
                    borderRadius: '0 0 0 0'
                  }} />
                  <div style={{ flex: 1, padding: '24px 24px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${category.color}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: category.color,
                          flexShrink: 0
                        }}>
                          {category.icon}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <Title
                              level={5}
                              style={{
                                margin: 0,
                                color: '#1a1a2e',
                                fontWeight: 600,
                                fontSize: 15,
                                lineHeight: 1.3
                              }}
                            >
                              {category.title}
                            </Title>
                          </div>
                          <Text style={{ fontSize: 11, color: '#a0aec0', letterSpacing: 0.2 }}>{category.titleEn}</Text>
                        </div>
                      </div>
                      <Tag
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          fontSize: 11,
                          borderRadius: 6,
                          padding: '0 8px',
                          background: `${category.color}12`,
                          borderColor: `${category.color}30`,
                          color: category.color,
                          flexShrink: 0
                        }}
                      >
                        {category.tag}
                      </Tag>
                    </div>

                    <AntParagraph
                      style={{
                        margin: '0 0 20px',
                        fontSize: 13,
                        lineHeight: 1.75,
                        color: '#64748b',
                        minHeight: 60
                      }}
                    >
                      {category.description}
                    </AntParagraph>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 16,
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {category.canEnter && (
                          <Button
                            type="primary"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            iconPosition="end"
                            style={{
                              background: category.color,
                              borderColor: category.color,
                              borderRadius: 6,
                              fontWeight: 500,
                              fontSize: 13,
                              height: 32,
                              padding: '0 14px'
                            }}
                            onClick={() => setActiveKey(category.key)}
                          >
                            在线模板
                          </Button>
                        )}
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          style={{
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 13,
                            height: 32,
                            padding: '0 14px',
                            borderColor: '#d1d9e0',
                            color: '#475569',
                            background: '#f8fafc'
                          }}
                          onClick={() => handleDownloadTemplate(category)}
                        >
                          下载模板
                        </Button>
                      </div>
                      <Text style={{ fontSize: 12, color: '#94a3b8' }}>{category.count}</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

       
      </div>
    </div>
  );
};

export default CourseTemplateLibrary;
