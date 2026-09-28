import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Steps,
  Form,
  Row,
  Col,
  Upload,
  Divider,
  Badge,
  Progress
} from 'antd';
import {
  SaveOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  FormOutlined,
  ArrowRightOutlined,
  UploadOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CloudUploadOutlined,
  EditOutlined,
  FileDoneOutlined,
  InboxOutlined,
  LoadingOutlined
} from '@ant-design/icons';

import { saveOrUpdate } from '@/api/course-standards';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

interface TemplateData {
  id: string;
  template_name: string;
  template_code: string;
  template_type: string;
  status: string;
  course_target_audience: string;
  course_info: {
    courseName: string;
    courseCode: string;
    credits: string;
    hours: string;
    courseType: string;
    applicableMajors: string;
    prerequisiteCourses: string;
  };
  course_nature: {
    nature: string;
    task: string;
  };
  course_objectives: string;
  course_content: string;
  teaching_implementation: {
    teaching_design: string;
    resource_development: string;
    teacher_requirements: string;
    school_enterprise_cooperation: string;
    textbook_selection: string;
  };
  course_assessment: {
    evaluation_methods: string;
    grading_criteria: string;
  };
  approval_info: {
    creator: string;
    reviewer: string;
    approver: string;
    date: string;
  };
}

interface CreateCourseStandardProps {
  onBack?: () => void;
  onSaveSuccess?: () => void;
  preSelectedCourse?: {
    id: any,
    abilityModule?: string;
    courseName?: string;
    courseCode?: string;
    course_name?: string;
    course_code?: string;
    ability_module?: string;
    courseType?: string;
    course_type?: string;
    level1Name?: string;
    ivrlLevel?: string;
    level1?: { id: string; name: string } | null;
    level2?: { id: string; name: string } | null;
    basicInfo?: {
      ivrlLevel?: string;
      [key: string]: any;
    };
    [key: string]: any;
    courseStandardAttach?: string;
  } | null;
}

interface IndustryCategory {
  id: string;
  name: string;
  code: string;
  description: string;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1d1d1d',
  borderLeft: '3px solid #1677ff',
  paddingLeft: 10,
  marginBottom: 16,
  lineHeight: '1.4',
};

const subSectionStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#444',
  marginBottom: 8,
  marginTop: 16,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#595959',
  marginBottom: 4,
  display: 'block',
};

type EntryMode = 'template' | 'import' | null;

import UploadDraggerFile from '@/components/UploadDraggerFile';
import { UploadData } from '@/hooks/useOssUpload';
const CreateCourseStandard: React.FC<CreateCourseStandardProps> = ({ onBack, onSaveSuccess, preSelectedCourse }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [selectedIndustryName, setSelectedIndustryName] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [standardData, setStandardData] = useState<TemplateData | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedStandardId, setSavedStandardId] = useState<string>('');
  const [savedStandardCode, setSavedStandardCode] = useState<string>('');
  const [savedCourseCode, setSavedCourseCode] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string>('');
  const [importProgress, setImportProgress] = useState(0);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importSubmitted, setImportSubmitted] = useState(false);

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadResIDs, setUploadResIDs] = useState<string>(preSelectedCourse.courseStandardAttach || '');
  const [timer, setTimer] = useState<any>(null);
  useEffect(() => {
    // loadPublishedTemplates();
    // if (preSelectedCourse) {
    //   const abilityModule = preSelectedCourse.abilityModule || preSelectedCourse.ability_module || '';
    //   setSelectedIndustryId('pre-selected');
    //   setSelectedIndustryName(abilityModule);
    // }
  }, []);

  const getCourseTemplateType = (): string => {
    if (!preSelectedCourse) return 'professional_ability';
    const level1Name = preSelectedCourse.level1Name || '';
    if (level1Name === '行动能力') return 'action_ability';
    const courseType = preSelectedCourse.courseType || preSelectedCourse.course_type || '';
    if (courseType === '行动能力课程') return 'action_ability';
    return 'professional_ability';
  };

  const loadPublishedTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_standard_templates')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const loaded = data as TemplateData[] || [];
      setTemplates(loaded);

      if (preSelectedCourse && loaded.length > 0) {
        const targetType = getCourseTemplateType();
        const match = loaded.find(t => t.template_type === targetType);
        if (match) {
          handleSelectTemplate(match.id, loaded);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('加载课标模板失败');
    } finally {
      setLoading(false);
    }
  };

  const sanitizeCourseNameStr = (val: any): string => {
    if (!val) return '';
    const s = typeof val === 'string' ? val.trim() : String(val).trim();
    if (s === '[]' || s === '{}' || s.startsWith('[object') || s === 'null' || s === 'undefined') return '';
    return s;
  };

  const handleSelectTemplate = async (templateId: string, templateList?: TemplateData[]) => {
    const list = templateList || templates;
    const template = list.find(t => t.id === templateId);
    if (!template) return;

    const courseName = sanitizeCourseNameStr(preSelectedCourse?.courseName) || sanitizeCourseNameStr(preSelectedCourse?.course_name) || '';
    const courseCode = sanitizeCourseNameStr(preSelectedCourse?.courseCode) || sanitizeCourseNameStr(preSelectedCourse?.course_code) || '';

    if (courseCode) {
      try {
        const { data: existingRecord, error } = await supabase
          .from('course_standards')
          .select('*')
          .eq('course_code', courseCode)
          .maybeSingle();

        if (error) console.error('Error checking existing record:', error);

        if (existingRecord) {
          const courseNature = existingRecord.course_nature_task || { nature: '', task: '' };
          if (!courseNature.nature) courseNature.nature = '';
          if (!courseNature.task) courseNature.task = '';
          const teachingImpl = existingRecord.teaching_implementation || {};
          const courseAssessment = existingRecord.course_assessment || {};
          const getCurrentDate = () => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          };

          setStandardData({
            ...template,
            id: existingRecord.id,
            template_name: existingRecord.standard_name || template.template_name,
            status: existingRecord.status || 'draft',
            course_info: {
              ...template.course_info,
              courseName: sanitizeCourseNameStr(existingRecord.course_name) || courseName,
              courseCode: sanitizeCourseNameStr(existingRecord.course_code) || courseCode,
              credits: existingRecord.credits?.toString() || '',
              hours: existingRecord.hours?.toString() || '',
              courseType: teachingImpl.course_type || '',
              applicableMajors: teachingImpl.applicable_majors || '',
              prerequisiteCourses: teachingImpl.prerequisite_courses || ''
            },
            course_nature: courseNature,
            course_objectives: existingRecord.course_objectives || '',
            course_content: existingRecord.course_content || '',
            teaching_implementation: {
              ...template.teaching_implementation,
              teaching_design: teachingImpl.teaching_design || '',
              resource_development: teachingImpl.resource_development || '',
              teacher_requirements: teachingImpl.teacher_requirements || '',
              school_enterprise_cooperation: teachingImpl.school_enterprise_cooperation || '',
              textbook_selection: teachingImpl.textbook_selection || ''
            },
            course_assessment: {
              ...template.course_assessment,
              evaluation_methods: courseAssessment.evaluation_methods || '',
              grading_criteria: courseAssessment.grading_criteria || ''
            },
            course_target_audience: existingRecord.course_target_audience || '',
            approval_info: {
              creator: existingRecord.development_team?.creator || '',
              reviewer: existingRecord.development_team?.reviewer || '',
              approver: existingRecord.development_team?.approver || '',
              date: existingRecord.development_team?.date || getCurrentDate()
            }
          });

          setSavedStandardId(existingRecord.id);
          setSavedStandardCode(existingRecord.standard_code);
          setSavedCourseCode(existingRecord.course_code);
          setHasSavedDraft(true);
          setSelectedTemplateId(templateId);
          message.success('已加载保存的课程标准数据');
          return;
        }
      } catch (error) {
        console.error('Error loading existing record:', error);
      }
    }

    const getCurrentDate = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    setStandardData({
      ...template,
      id: '',
      template_name: template.template_name,
      status: 'draft',
      course_info: {
        ...template.course_info,
        courseName,
        courseCode
      },
      approval_info: {
        ...template.approval_info,
        date: getCurrentDate()
      }
    });
    setSelectedTemplateId(templateId);
  };

  const handleNextStep = () => {
    if (!selectedTemplateId) {
      message.warning('请选择课标模板');
      return;
    }
    setCurrentStep(1);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!standardData) {
      message.error('数据未加载');
      return;
    }
    if (loading || savingDraft) return;
    if (publish && !hasSavedDraft) {
      message.warning('请先保存草稿，再提交课程标准');
      return;
    }
    if (!standardData.course_info.courseName?.trim()) {
      message.warning('请填写课程名称');
      return;
    }

    setLoading(true);
    if (!publish) setSavingDraft(true);

    try {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const courseCode = standardData.course_info.courseCode || `CS${timestamp}_${randomSuffix}`;
      const standardCode = courseCode;

      const { data: existingRecord, error: checkError } = await supabase
        .from('course_standards')
        .select('id, standard_code, course_code')
        .eq('course_code', courseCode)
        .maybeSingle();

      if (checkError) throw checkError;

      const ivrlLevel = preSelectedCourse?.basicInfo?.ivrlLevel || preSelectedCourse?.ivrlLevel || '';
      const competencyLevel1Id = preSelectedCourse?.level1?.id || null;
      const competencyLevel2Id = preSelectedCourse?.level2?.id || null;
      const resolvedCourseName = sanitizeCourseNameStr(standardData.course_info.courseName);

      const saveData = {
        standard_code: standardCode,
        standard_name: resolvedCourseName ? `${resolvedCourseName} 课程标准` : '课程标准',
        course_name: resolvedCourseName,
        course_code: courseCode,
        industry_id: selectedIndustryId || null,
        industry_field: selectedIndustryName || '',
        ivrl_level: ivrlLevel,
        competency_level1: competencyLevel1Id,
        competency_level2: competencyLevel2Id,
        credits: parseFloat(standardData.course_info.credits) || null,
        hours: parseInt(standardData.course_info.hours) || null,
        theory_hours: null,
        practice_hours: parseInt(standardData.course_info.hours) || null,
        version: '1.0',
        status: publish ? 'pending_review' : 'draft',
        template_id: selectedTemplateId || null,
        course_target_audience: standardData.course_target_audience || '',
        course_nature_task: standardData.course_nature || {},
        course_objectives: standardData.course_objectives || '',
        course_content: standardData.course_content || '',
        teaching_implementation: {
          ...(standardData.teaching_implementation || {}),
          course_type: standardData.course_info.courseType || '',
          applicable_majors: standardData.course_info.applicableMajors || '',
          prerequisite_courses: standardData.course_info.prerequisiteCourses || ''
        },
        course_assessment: standardData.course_assessment || {},
        responsible_person: standardData.approval_info?.creator || '',
        responsible_department: '',
        development_team: {
          creator: standardData.approval_info?.creator || '',
          reviewer: standardData.approval_info?.reviewer || '',
          approver: standardData.approval_info?.approver || '',
          date: standardData.approval_info?.date || ''
        },
        remarks: ''
      };

      if (existingRecord) {
        const { data, error } = await supabase
          .from('course_standards')
          .update(saveData)
          .eq('id', existingRecord.id)
          .select();

        if (error) throw error;
        message.success(publish ? '课程标准提交成功' : '课程标准更新成功');
        if (data && data.length > 0) {
          setSavedStandardId(data[0].id);
          setSavedStandardCode(data[0].standard_code);
          setSavedCourseCode(data[0].course_code);
          setHasSavedDraft(true);
        }
      } else {
        const { data, error } = await supabase
          .from('course_standards')
          .insert([saveData])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          setSavedStandardId(data[0].id);
          setSavedStandardCode(data[0].standard_code);
          setSavedCourseCode(data[0].course_code);
          setHasSavedDraft(true);
        }
        message.success('课程标准草稿保存成功');
      }

      if (publish && onSaveSuccess) onSaveSuccess();
    } catch (error: any) {
      console.error('Error saving standard:', error);
      message.error(`保存失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  const updateStandardData = (path: string[], value: any) => {
    if (!standardData) return;
    const newData = { ...standardData };
    let current: any = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = { ...current[path[i]] };
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setStandardData(newData);
  };

  const extractSectionText = (fullText: string, startKeywords: string[], endKeywords: string[]): string => {
    const lines = fullText.split('\n');
    let collecting = false;
    const collected: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!collecting) {
        const matchStart = startKeywords.some(kw => line.includes(kw));
        if (matchStart) { collecting = true; continue; }
      } else {
        const matchEnd = endKeywords.some(kw => line.includes(kw));
        if (matchEnd) break;
        if (line) collected.push(line);
      }
    }
    return collected.join('\n').trim();
  };

  const parseDocxContent = (rawText: string): Partial<TemplateData> => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    const findValue = (keywords: string[]): string => {
      for (const line of lines) {
        for (const kw of keywords) {
          if (line.includes(kw)) {
            const after = line.replace(kw, '').replace(/[：:]/g, '').trim();
            if (after) return after;
          }
        }
      }
      return '';
    };

    const courseName = findValue(['课程名称']) || sanitizeCourseNameStr(preSelectedCourse?.courseName) || sanitizeCourseNameStr(preSelectedCourse?.course_name) || '';
    const courseCode = findValue(['课程代码', '课程编号']) || sanitizeCourseNameStr(preSelectedCourse?.courseCode) || sanitizeCourseNameStr(preSelectedCourse?.course_code) || '';
    const credits = findValue(['学分']);
    const hours = findValue(['学时', '总学时']);
    const courseType = findValue(['课程类型', '课程性质']);

    const targetAudience = extractSectionText(rawText,
      ['适应对象', '适用对象', '课程适应对象'],
      ['课程基本信息', '课程性质', '课程目标', '二、', 'II', '第二节']
    );

    const nature = extractSectionText(rawText,
      ['课程性质'],
      ['课程任务', '（二）', '(二)', '课程目标', '课程内容']
    );

    const task = extractSectionText(rawText,
      ['课程任务'],
      ['课程目标', '三、', 'III', '（三）', '第三节']
    );

    const objectives = extractSectionText(rawText,
      ['课程目标', '教学目标', '学习目标'],
      ['课程内容', '教学内容', '四、', 'IV', '第四节']
    );

    const content = extractSectionText(rawText,
      ['课程内容', '教学内容', '主要内容'],
      ['教学实施', '实施建议', '五、', 'V', '第五节']
    );

    const teachingDesign = extractSectionText(rawText,
      ['教学设计', '教学方法'],
      ['教学资源', '资源开发', '（二）', '(二)']
    );

    const resourceDev = extractSectionText(rawText,
      ['教学资源', '资源开发'],
      ['师资', '教师要求', '（三）', '(三)']
    );

    const teacherReq = extractSectionText(rawText,
      ['师资要求', '教师要求', '师资条件'],
      ['校企合作', '（四）', '(四)']
    );

    const cooperation = extractSectionText(rawText,
      ['校企合作'],
      ['教材', '（五）', '(五)']
    );

    const textbook = extractSectionText(rawText,
      ['教材', '教辅', '参考资料'],
      ['考核', '评价', '六、', 'VI', '第六节']
    );

    const evalMethods = extractSectionText(rawText,
      ['评价方法', '考核方式', '考核评价', '课程评价'],
      ['评分标准', '评分方式', '（二）', '(二)']
    );

    const gradingCriteria = extractSectionText(rawText,
      ['评分标准', '成绩评定'],
      ['制定', '审核', '附录', '结束', '七、']
    );

    const creator = findValue(['制定人', '编制人', '起草人']);
    const reviewer = findValue(['审核人', '审查人']);
    const approver = findValue(['批准人', '审定人']);

    const getCurrentDate = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    return {
      course_info: {
        courseName,
        courseCode,
        credits,
        hours,
        courseType,
        applicableMajors: findValue(['授课时间', '开课时间', '开设学期']),
        prerequisiteCourses: findValue(['授课对象', '前修课程', '先修课'])
      },
      course_target_audience: targetAudience,
      course_nature: { nature, task },
      course_objectives: objectives,
      course_content: content,
      teaching_implementation: {
        teaching_design: teachingDesign,
        resource_development: resourceDev,
        teacher_requirements: teacherReq,
        school_enterprise_cooperation: cooperation,
        textbook_selection: textbook
      },
      course_assessment: {
        evaluation_methods: evalMethods,
        grading_criteria: gradingCriteria
      },
      approval_info: {
        creator,
        reviewer,
        approver,
        date: getCurrentDate()
      }
    };
  };

  const handleImportFile = async (file: File): Promise<boolean> => {
    const allowedExtensions = ['.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      message.error('仅支持 Word (.doc, .docx) 格式');
      return false;
    }
    setImporting(true);
    setImportProgress(10);
    setImportedFileName(file.name);
    setImportedFile(file);

    try {
      const mammoth = await import('mammoth');
      setImportProgress(35);

      const arrayBuffer = await file.arrayBuffer();
      setImportProgress(55);

      const result = await mammoth.extractRawText({ arrayBuffer });
      setImportProgress(75);

      const rawText = result.value || '';
      if (!rawText.trim()) {
        message.error('文件内容为空或无法解析，请检查文件格式');
        setImporting(false);
        setImportProgress(0);
        setImportedFileName('');
        setImportedFile(null);
        return false;
      }

      const parsed = parseDocxContent(rawText);
      setImportProgress(90);

      const targetType = getCourseTemplateType();
      const fallbackTemplate = templates.find(t => t.template_type === targetType) || templates[0];

      if (!fallbackTemplate) {
        message.error('暂无可用模板，请先在系统中发布课标模板');
        setImporting(false);
        setImportProgress(0);
        return false;
      }

      setStandardData({
        ...fallbackTemplate,
        id: '',
        template_name: parsed.course_info?.courseName
          ? `${parsed.course_info.courseName} 课程标准`
          : fallbackTemplate.template_name,
        status: 'draft',
        course_info: {
          ...fallbackTemplate.course_info,
          ...(parsed.course_info || {}),
          courseName: sanitizeCourseNameStr(parsed.course_info?.courseName) || sanitizeCourseNameStr(preSelectedCourse?.courseName) || sanitizeCourseNameStr(preSelectedCourse?.course_name) || '',
          courseCode: sanitizeCourseNameStr(parsed.course_info?.courseCode) || sanitizeCourseNameStr(preSelectedCourse?.courseCode) || sanitizeCourseNameStr(preSelectedCourse?.course_code) || '',
        },
        course_target_audience: parsed.course_target_audience || fallbackTemplate.course_target_audience || '',
        course_nature: {
          nature: parsed.course_nature?.nature || fallbackTemplate.course_nature?.nature || '',
          task: parsed.course_nature?.task || fallbackTemplate.course_nature?.task || '',
        },
        course_objectives: parsed.course_objectives || fallbackTemplate.course_objectives || '',
        course_content: parsed.course_content || fallbackTemplate.course_content || '',
        teaching_implementation: {
          ...fallbackTemplate.teaching_implementation,
          ...parsed.teaching_implementation,
        },
        course_assessment: {
          ...fallbackTemplate.course_assessment,
          ...parsed.course_assessment,
        },
        approval_info: {
          ...fallbackTemplate.approval_info,
          ...parsed.approval_info,
        }
      });

      setSelectedTemplateId(fallbackTemplate.id);
      setImportProgress(100);

      setTimeout(() => {
        setImporting(false);
        setImportProgress(0);
        message.success('文件解析完成，请点击下方按钮提交');
      }, 600);

    } catch (err: any) {
      console.error('Import error:', err);
      message.error('文件解析失败，请确认文件格式正确');
      setImporting(false);
      setImportProgress(0);
      setImportedFileName('');
      setImportedFile(null);
    }
    return false;
  };

  const handleImportSubmit = async () => {
    if (!uploadResIDs) {
      message.error('数据不完整，请重新上传文件');
      return;
    }
    setSubmitting(true);
    try {
      await saveOrUpdate({
        id: preSelectedCourse?.id,
        courseStandardAttach: uploadResIDs
      })
      setImportSubmitted(true);
      message.success('课标文件提交成功');
    } catch (err: any) {
      console.error('Submit error:', err);
      message.error(`提交失败: ${err.message || '请重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const templateMeta: Record<string, { icon: React.ReactNode; color: string; bg: string; selectedBg: string; border: string; selectedBorder: string; desc: string }> = {
    action_ability: {
      icon: <ThunderboltOutlined style={{ fontSize: 28 }} />,
      color: '#1677ff',
      bg: '#f0f7ff',
      selectedBg: '#e6f4ff',
      border: '#bae0ff',
      selectedBorder: '#1677ff',
      desc: '以职业行动能力为导向，围绕典型工作任务设计课程内容，强调理实一体化教学',
    },
    professional_ability: {
      icon: <StarOutlined style={{ fontSize: 28 }} />,
      color: '#389e0d',
      bg: '#f6ffed',
      selectedBg: '#d9f7be',
      border: '#b7eb8f',
      selectedBorder: '#52c41a',
      desc: '以专业核心能力为主线，系统构建知识与技能体系，适用于专业主干课程',
    },
  };
  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType = [
      // Word文档
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',].includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 doc、docx 格式的文件');
    }
    const isLt10M = file.size / 1024 / 1024 < 200;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 200MB');
    }
    return isAllowedType && isLt10M;
  };
  const handleUploaded_BusinessLicense = (data: UploadData[]) => {
    console.log('上传完成，返回：', data);
    let resourceId = '';
    if (data.length > 0) {
      const item = data[data.length - 1];
      setFileList([{ id: item.resourceId, url: item.Location, name: item.file.name, type: item.file.type, size: item.file.size }]);
      resourceId = data[data.length - 1].resourceId
      setUploadResIDs(resourceId);

    }
  };

  const renderTemplateCard = (template: TemplateData) => {
    const isSelected = selectedTemplateId === template.id;
    const isLocked = !!preSelectedCourse;
    const meta = templateMeta[template.template_type];

    if (meta) {
      return (
        <div
          key={template.id}
          onClick={() => { if (!isLocked) handleSelectTemplate(template.id); }}
          style={{
            position: 'relative',
            padding: '20px 20px 18px',
            borderRadius: 10,
            border: `2px solid ${isSelected ? meta.selectedBorder : meta.border}`,
            background: isSelected ? meta.selectedBg : meta.bg,
            cursor: isLocked ? 'default' : 'pointer',
            transition: 'all 0.2s',
            flex: 1,
            opacity: isLocked && !isSelected ? 0.45 : 1,
          }}
        >
          {isSelected && (
            <div style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
            </div>
          )}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: isSelected ? meta.color : '#fff',
            border: `1.5px solid ${meta.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            color: isSelected ? '#fff' : meta.color,
            transition: 'all 0.2s',
          }}>
            {meta.icon}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: isSelected ? meta.color : '#1d1d1d', marginBottom: 6 }}>
            {template.template_name}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: 1.6 }}>
            {meta.desc}
          </div>
        </div>
      );
    }

    return (
      <div
        key={template.id}
        onClick={() => handleSelectTemplate(template.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '11px 14px',
          borderRadius: 8,
          border: isSelected ? '1.5px solid #1677ff' : '1.5px solid #f0f0f0',
          background: isSelected ? '#f0f7ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: isSelected ? '#1677ff' : '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.2s'
        }}>
          <FileTextOutlined style={{ fontSize: 15, color: isSelected ? '#fff' : '#8c8c8c' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            color: isSelected ? '#0958d9' : '#262626',
            marginBottom: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {template.template_name}
          </div>
          <div style={{ fontSize: 12, color: '#bfbfbf' }}>{template.template_code}</div>
        </div>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: isSelected ? '#52c41a' : 'transparent',
          border: isSelected ? 'none' : '1.5px solid #d9d9d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}>
          {isSelected && <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />}
        </div>
      </div>
    );
  };

  const renderStep0 = () => (
    <div style={{ width: '100%' }}>
      {(preSelectedCourse?.courseName || preSelectedCourse?.course_name || selectedIndustryName) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          padding: '10px 16px',
          background: '#f0f7ff',
          borderRadius: 8,
          border: '1px solid #bae0ff'
        }}>
          <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 14, flexShrink: 0 }} />
          {(preSelectedCourse?.courseName || preSelectedCourse?.course_name) && (
            <Text style={{ fontSize: 13, color: '#1677ff' }}>
              当前课程：<Text strong style={{ color: '#0958d9' }}>{preSelectedCourse?.courseName || preSelectedCourse?.course_name}</Text>
            </Text>
          )}
          {selectedIndustryName && (
            <Text style={{ fontSize: 13, color: '#1677ff' }}>
              当前职业领域：<Text strong style={{ color: '#0958d9' }}>{selectedIndustryName}</Text>
            </Text>
          )}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1d', marginBottom: 4 }}>选择撰写方式</div>
        <div style={{ fontSize: 13, color: '#8c8c8c' }}>请选择本次课标的撰写方式，可在线基于模板撰写，或直接导入已有课标文件</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: '2px solid #e8e8e8',
            background: '#fafafa',
            cursor: 'not-allowed',
            transition: 'all 0.2s',
            position: 'relative',
            opacity: 0.6,
          }}
        >
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: '#faad14', color: '#fff',
            fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 20,
            letterSpacing: 0.5,
          }}>
            暂未开放
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <EditOutlined style={{ fontSize: 26, color: '#bfbfbf' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#8c8c8c', marginBottom: 6 }}>
            在线撰写
          </div>
          <div style={{ fontSize: 13, color: '#bfbfbf', lineHeight: 1.7 }}>
            选择已发布的课标模板，在线填写各章节内容，系统自动保存草稿并支持提交审核
          </div>
          <div style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#bfbfbf', fontWeight: 500
          }}>
            <FileTextOutlined />
            <span>选择模板 → 填写内容 → 提交审核</span>
          </div>
        </div>

        <div
          onClick={() => {
            if (entryMode !== 'import') {
              setEntryMode('import');
              setSelectedTemplateId('');
              setStandardData(null);
              setHasSavedDraft(false);
              setSavedStandardId('');
              setSavedStandardCode('');
              setSavedCourseCode('');
            }
          }}
          style={{
            padding: 24,
            borderRadius: 12,
            border: `2px solid ${entryMode === 'import' ? '#52c41a' : '#e8e8e8'}`,
            background: entryMode === 'import' ? '#f6ffed' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
          }}
        >
          {entryMode === 'import' && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              width: 22, height: 22, borderRadius: '50%',
              background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
            </div>
          )}
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: entryMode === 'import' ? '#52c41a' : '#f6ffed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, transition: 'all 0.2s'
          }}>
            <CloudUploadOutlined style={{ fontSize: 26, color: entryMode === 'import' ? '#fff' : '#52c41a' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: entryMode === 'import' ? '#389e0d' : '#1d1d1d', marginBottom: 6 }}>
            导入课标文件
          </div>
          <div style={{ fontSize: 13, color: '#8c8c8c', lineHeight: 1.7 }}>
            上传已有的课标 Word 文档，系统自动解析并填充各章节内容，导入后可继续在线编辑
          </div>
          <div style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#52c41a', fontWeight: 500
          }}>
            <CloudUploadOutlined />
            <span>上传 Word 文件 → 自动解析 → 提交审核</span>
          </div>
        </div>
      </div>

      {entryMode === 'template' && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          padding: '24px 24px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#595959', marginBottom: 4 }}>选择课标模板</div>
          <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 16 }}>
            {preSelectedCourse ? '根据课程能力目标，系统已为您匹配对应模板' : '请选择适合本课程的课标模板'}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 13 }}>加载中...</div>
            </div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <FileTextOutlined style={{ fontSize: 36, color: '#d9d9d9', display: 'block', marginBottom: 10 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>暂无已发布的课标模板</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16 }}>
              {templates.map(t => renderTemplateCard(t))}
            </div>
          )}
        </div>
      )}

      {entryMode === 'import' && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          padding: '24px 24px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#595959', marginBottom: 4 }}>上传课标文件</div>
          <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 16 }}>
            支持 Word 文档 (.doc, .docx)，系统将自动识别各章节内容
          </div>

          {importing ? (
            <div style={{
              padding: '32px 24px',
              borderRadius: 8,
              background: '#fafafa',
              border: '1px dashed #d9d9d9',
              textAlign: 'center'
            }}>
              <LoadingOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 16 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 8 }}>
                正在解析文件
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 16 }}>
                {importedFileName}
              </div>
              <Progress
                percent={importProgress}
                strokeColor={{ from: '#1677ff', to: '#52c41a' }}
                style={{ maxWidth: 320, margin: '0 auto' }}
                size="small"
              />
              <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 10 }}>
                {importProgress < 40 ? '正在读取文档内容...' : importProgress < 70 ? '正在提取文本...' : importProgress < 90 ? '正在解析章节...' : '即将完成...'}
              </div>
            </div>
          ) : importedFileName ? (
            <div style={{
              padding: '20px 24px',
              borderRadius: 8,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <FileDoneOutlined style={{ fontSize: 28, color: '#52c41a', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#389e0d' }}>文件已解析完成</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{importedFileName}</div>
              </div>
              <Button
                size="small"
                onClick={() => { setImportedFileName(''); setSelectedTemplateId(''); setStandardData(null); }}
                style={{ borderRadius: 6 }}
              >
                重新上传
              </Button>
            </div>
          ) : (
            <UploadDraggerFile
              accept=".doc,.docx"
              name="file"
              maxCount={1}
              multiple={false}
              beforeUpload={beforeUpload}
              onUploaded={handleUploaded_BusinessLicense}
              uploadResIDs={uploadResIDs}
              onRemove={() => { setFileList([]); setUploadResIDs(''); }}
            >
              <div style={{ padding: '28px 20px' }}>
                <InboxOutlined style={{ fontSize: 36, color: '#1677ff', marginBottom: 14, display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 6 }}>
                  点击或将文件拖拽到此处上传
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                  支持 Word 文档（.doc、.docx）
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: 12,
                  padding: '4px 14px',
                  borderRadius: 20,
                  background: '#f0f7ff',
                  border: '1px solid #bae0ff',
                  fontSize: 12,
                  color: '#1677ff'
                }}>
                  系统将自动识别：课程信息、课程目标、课程内容、教学实施等章节
                </div>
              </div>
            </UploadDraggerFile>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {entryMode === 'template' && (
          <>
            <Button
              type="primary"
              size="large"
              onClick={handleNextStep}
              disabled={!selectedTemplateId}
              icon={<ArrowRightOutlined />}
              style={{
                height: 44,
                paddingLeft: 28,
                paddingRight: 28,
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 8,
              }}
            >
              下一步：撰写课程标准
            </Button>
            {!selectedTemplateId && (
              <Text type="secondary" style={{ fontSize: 13 }}>请先选择课标模板</Text>
            )}
          </>
        )}

        {entryMode === 'import' && uploadResIDs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="primary"
              size="large"
              onClick={handleImportSubmit}
              loading={submitting}
              icon={<CheckCircleOutlined />}
              style={{
                height: 44,
                paddingLeft: 32,
                paddingRight: 32,
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 8,
                background: '#52c41a',
                borderColor: '#52c41a'
              }}
            >
              提交课标文件
            </Button>
            {false && <Text type="secondary" style={{ fontSize: 12 }}>
              提交后进入审核流程，原始文件和解析数据同时保存
            </Text>
            }
          </div>
        )}

        {entryMode === 'import' && importSubmitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <Text style={{ fontSize: 14, color: '#52c41a', fontWeight: 500 }}>
              提交成功
            </Text>
            <Button
              size="small"
              onClick={onSaveSuccess || onBack}
              style={{ borderRadius: 6, marginLeft: 8 }}
            >
              返回列表
            </Button>
          </div>
        )}

        {!entryMode && (
          <Text type="secondary" style={{ fontSize: 13 }}>请先选择上方的撰写方式</Text>
        )}
      </div>
    </div>
  );

  const renderImportConfirm = () => {
    if (!standardData) return null;

    if (importSubmitted) {
      return (
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#f6ffed', border: '2px solid #b7eb8f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1d', marginBottom: 8 }}>
            提交成功
          </div>
          <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>
            课标文件已上传，解析数据已保存
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: '#f0f7ff', border: '1px solid #bae0ff',
            fontSize: 13, color: '#1677ff', marginBottom: 32
          }}>
            <FileDoneOutlined />
            <span>已进入审核流程，等待审核人员审核</span>
          </div>
          <div>
            <Button type="primary" onClick={onSaveSuccess || onBack} style={{ borderRadius: 8, height: 40, paddingLeft: 24, paddingRight: 24 }}>
              返回列表
            </Button>
          </div>
        </div>
      );
    }

    const info = standardData.course_info;
    const infoItems = [
      { label: '课程名称', value: info.courseName },
      { label: '课程代码', value: info.courseCode },
      { label: '学分', value: info.credits },
      { label: '学时', value: info.hours },
      { label: '课程类型', value: info.courseType },
      { label: '授课时间', value: info.applicableMajors },
      { label: '授课对象', value: info.prerequisiteCourses },
    ].filter(i => i.value);

    const sections = [
      { label: '适应对象', value: standardData.course_target_audience },
      { label: '课程性质', value: standardData.course_nature?.nature },
      { label: '课程任务', value: standardData.course_nature?.task },
      { label: '课程目标', value: standardData.course_objectives },
      { label: '课程内容', value: standardData.course_content },
      { label: '教学设计', value: standardData.teaching_implementation?.teaching_design },
      { label: '评价方法', value: standardData.course_assessment?.evaluation_methods },
    ].filter(s => s.value);

    return (
      <div style={{ width: '100%' }}>
        <div style={{
          background: '#fff5e6',
          border: '1px solid #ffd591',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10
        }}>
          <InfoCircleOutlined style={{ color: '#fa8c16', fontSize: 15, marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#d46b08', marginBottom: 2 }}>请确认解析结果后提交</div>
            <div style={{ fontSize: 12, color: '#ad6800', lineHeight: 1.6 }}>
              系统已从文件中自动提取以下信息。提交后，原始文件和解析数据将同时保存，并进入审核流程。如信息有误可返回重新上传。
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          overflow: 'hidden',
          marginBottom: 16
        }}>
          <div style={{
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FileDoneOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1d' }}>
                {standardData.course_info.courseName || '（未识别课程名称）'}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                来源文件：{importedFileName}
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {infoItems.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={sectionHeaderStyle}>基本信息</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px 20px',
                  background: '#fafafa',
                  borderRadius: 8,
                  padding: '16px 20px',
                  border: '1px solid #f0f0f0'
                }}>
                  {infoItems.map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: '#bfbfbf', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: '#262626', fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sections.length > 0 && (
              <div>
                <div style={sectionHeaderStyle}>解析内容预览</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sections.map(sec => (
                    <div key={sec.label} style={{
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#f5f5f5',
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#595959',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        {sec.label}
                      </div>
                      <div style={{
                        padding: '10px 14px',
                        fontSize: 12,
                        color: '#595959',
                        lineHeight: 1.7,
                        maxHeight: 80,
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {(sec.value || '').substring(0, 200)}{(sec.value || '').length > 200 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {sections.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '32px 0',
                    color: '#bfbfbf', fontSize: 13
                  }}>
                    未能从文件中识别到章节内容
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          padding: '16px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <CloudUploadOutlined style={{ fontSize: 20, color: '#1677ff', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>原始文件将同时上传</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{importedFileName}</div>
          </div>
          <div style={{
            fontSize: 12, color: '#52c41a', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <CheckOutlined />
            <span>已准备好</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleImportSubmit}
            loading={submitting}
            icon={<CheckCircleOutlined />}
            style={{
              height: 44,
              paddingLeft: 32,
              paddingRight: 32,
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 8,
              background: '#52c41a',
              borderColor: '#52c41a'
            }}
          >
            确认提交课标文件
          </Button>
          {false && <Text type="secondary" style={{ fontSize: 12 }}>提交后进入审核流程，原始文件和解析数据同时保存</Text>}
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    if (entryMode === 'import') return renderImportConfirm();
    if (!standardData) return null;
    const isPreSelected = !!preSelectedCourse;

    return (
      <div style={{ width: '100%' }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
            padding: '20px 32px',
            textAlign: 'center'
          }}>
            {isPreSelected ? (
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1d', marginBottom: 4 }}>
                {standardData.course_info.courseName}
              </div>
            ) : (
              <Input
                value={standardData.course_info.courseName}
                onChange={e => updateStandardData(['course_info', 'courseName'], e.target.value)}
                placeholder="请输入课程名称"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  textAlign: 'center',
                  border: 'none',
                  borderBottom: '2px dashed #d9d9d9',
                  borderRadius: 0,
                  background: 'transparent',
                  boxShadow: 'none',
                  marginBottom: 4,
                  color: '#1d1d1d'
                }}
              />
            )}
            <Input
              value={standardData.template_name}
              onChange={e => updateStandardData(['template_name'], e.target.value)}
              placeholder="课程标准文件名"
              style={{
                fontSize: 14,
                textAlign: 'center',
                border: 'none',
                borderBottom: '1px dashed #d9d9d9',
                borderRadius: 0,
                background: 'transparent',
                boxShadow: 'none',
                color: '#595959',
                maxWidth: 320,
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>

          <div style={{ padding: '28px 32px' }}>

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>一、课程适应对象</div>
              <TextArea
                value={standardData.course_target_audience}
                onChange={e => updateStandardData(['course_target_audience'], e.target.value)}
                placeholder="请描述本课程适应的学习对象、学员类型等..."
                autoSize={{ minRows: 3, maxRows: 8 }}
                style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
              />
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>二、课程基本信息</div>
              <div style={{
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                padding: '20px 20px 8px'
              }}>
                <Row gutter={[20, 16]}>
                  <Col xs={24} sm={12}>
                    <label style={fieldLabelStyle}>课程名称</label>
                    <Input
                      value={standardData.course_info.courseName}
                      onChange={e => updateStandardData(['course_info', 'courseName'], e.target.value)}
                      placeholder="请输入课程名称"
                      disabled={isPreSelected}
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={fieldLabelStyle}>课程代码</label>
                    <Input
                      value={standardData.course_info.courseCode}
                      onChange={e => updateStandardData(['course_info', 'courseCode'], e.target.value)}
                      placeholder="请输入课程代码"
                      disabled={isPreSelected}
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={fieldLabelStyle}>学分</label>
                    <Input
                      value={standardData.course_info.credits}
                      onChange={e => updateStandardData(['course_info', 'credits'], e.target.value)}
                      placeholder="如：3"
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={fieldLabelStyle}>学时</label>
                    <Input
                      value={standardData.course_info.hours}
                      onChange={e => updateStandardData(['course_info', 'hours'], e.target.value)}
                      placeholder="如：48"
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <label style={fieldLabelStyle}>课程类型</label>
                    <Input
                      value={standardData.course_info.courseType}
                      onChange={e => updateStandardData(['course_info', 'courseType'], e.target.value)}
                      placeholder="如：专业核心课"
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={fieldLabelStyle}>授课时间</label>
                    <Input
                      value={standardData.course_info.applicableMajors}
                      onChange={e => updateStandardData(['course_info', 'applicableMajors'], e.target.value)}
                      placeholder="如：第二学期"
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <label style={fieldLabelStyle}>授课对象</label>
                    <Input
                      value={standardData.course_info.prerequisiteCourses}
                      onChange={e => updateStandardData(['course_info', 'prerequisiteCourses'], e.target.value)}
                      placeholder="如：大专一年级学员"
                      style={{ borderRadius: 6, fontSize: 13 }}
                    />
                  </Col>
                </Row>
              </div>
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>三、课程性质与任务</div>
              <div style={{ marginBottom: 16 }}>
                <div style={subSectionStyle}>（一）课程性质</div>
                <TextArea
                  value={standardData.course_nature.nature}
                  onChange={e => updateStandardData(['course_nature', 'nature'], e.target.value)}
                  placeholder="请描述课程性质..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
                />
              </div>
              <div>
                <div style={subSectionStyle}>（二）课程任务</div>
                <TextArea
                  value={standardData.course_nature.task}
                  onChange={e => updateStandardData(['course_nature', 'task'], e.target.value)}
                  placeholder="请描述课程任务..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
                />
              </div>
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>四、课程目标</div>
              <TextArea
                value={standardData.course_objectives}
                onChange={e => updateStandardData(['course_objectives'], e.target.value)}
                placeholder="请描述课程目标，包括知识目标、能力目标、素质目标等..."
                autoSize={{ minRows: 5, maxRows: 14 }}
                style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
              />
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>五、课程内容</div>
              <TextArea
                value={standardData.course_content}
                onChange={e => updateStandardData(['course_content'], e.target.value)}
                placeholder="请描述课程内容，包括各单元、模块的主要内容和要求..."
                autoSize={{ minRows: 7, maxRows: 20 }}
                style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
              />
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>六、教学实施与保障</div>
              {[
                { key: 'teaching_design', label: '（一）教学设计', placeholder: '请描述教学设计思路、方法...' },
                { key: 'resource_development', label: '（二）教学资源开发与应用', placeholder: '请描述教学资源的开发与应用...' },
                { key: 'teacher_requirements', label: '（三）师资要求', placeholder: '请描述教师资质、能力要求...' },
                { key: 'school_enterprise_cooperation', label: '（四）校企合作情况', placeholder: '请描述校企合作的形式、内容...' },
                { key: 'textbook_selection', label: '（五）教材选用及辅助教学资料', placeholder: '请描述教材选用标准及辅助资料...' },
              ].map((item, idx) => (
                <div key={item.key} style={{ marginBottom: idx < 4 ? 16 : 0 }}>
                  <div style={subSectionStyle}>{item.label}</div>
                  <TextArea
                    value={(standardData.teaching_implementation as any)[item.key]}
                    onChange={e => updateStandardData(['teaching_implementation', item.key], e.target.value)}
                    placeholder={item.placeholder}
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
                  />
                </div>
              ))}
            </div>

            <Divider style={{ margin: '0 0 28px' }} />

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>七、课程考核与评价</div>
              <div style={{ marginBottom: 16 }}>
                <div style={subSectionStyle}>（一）课程评价方法</div>
                <TextArea
                  value={standardData.course_assessment.evaluation_methods}
                  onChange={e => updateStandardData(['course_assessment', 'evaluation_methods'], e.target.value)}
                  placeholder="请描述课程评价的方法与方式..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
                />
              </div>
              <div>
                <div style={subSectionStyle}>（二）评分标准</div>
                <TextArea
                  value={standardData.course_assessment.grading_criteria}
                  onChange={e => updateStandardData(['course_assessment', 'grading_criteria'], e.target.value)}
                  placeholder="请描述评分标准与比例..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  style={{ fontSize: 13, borderRadius: 6, lineHeight: 1.7 }}
                />
              </div>
            </div>

            <Divider style={{ margin: '0 0 24px' }} />

            <div style={{
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              padding: '20px 20px 8px'
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#595959', marginBottom: 14 }}>审批信息</div>
              <Row gutter={[20, 16]}>
                <Col xs={24} sm={8}>
                  <label style={fieldLabelStyle}>制定人</label>
                  <Input
                    value={standardData.approval_info.creator}
                    onChange={e => updateStandardData(['approval_info', 'creator'], e.target.value)}
                    placeholder="请输入制定人姓名"
                    style={{ borderRadius: 6, fontSize: 13 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={fieldLabelStyle}>审核人</label>
                  <Input
                    value={standardData.approval_info.reviewer}
                    onChange={e => updateStandardData(['approval_info', 'reviewer'], e.target.value)}
                    placeholder="请输入审核人姓名"
                    style={{ borderRadius: 6, fontSize: 13 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={fieldLabelStyle}>批准人</label>
                  <Input
                    value={standardData.approval_info.approver}
                    onChange={e => updateStandardData(['approval_info', 'approver'], e.target.value)}
                    placeholder="请输入批准人姓名"
                    style={{ borderRadius: 6, fontSize: 13 }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <label style={fieldLabelStyle}>制定日期</label>
                  <Input
                    value={standardData.approval_info.date}
                    readOnly
                    style={{ borderRadius: 6, fontSize: 13, background: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </Col>
              </Row>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '20px 32px' }}>
      <div>

        <div style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e8e8e8',
          padding: '16px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={
                importSubmitted ? (onSaveSuccess || onBack) :
                  currentStep === 1 ? () => setCurrentStep(0) :
                    onBack
              }
              style={{ borderRadius: 6, fontSize: 13 }}
            >
              {importSubmitted ? '返回列表' : currentStep === 1 ? '上一步' : '返回'}
            </Button>
            <Steps
              current={currentStep}
              size="small"
              style={{ minWidth: entryMode === 'import' ? 380 : 300 }}
              items={entryMode === 'import' ? [
                { title: '选择方式', icon: <FileTextOutlined />, description: '导入文件' },
                { title: '确认提交', icon: <CheckCircleOutlined /> },
              ] : [
                {
                  title: '选择方式',
                  icon: <FileTextOutlined />,
                  description: entryMode === 'template' ? '在线撰写' : undefined
                },
                { title: '撰写课标', icon: <FormOutlined /> },
              ]}
            />
          </div>

          {currentStep === 1 && entryMode === 'template' && (
            <Space size={8}>
              {hasSavedDraft && (
                <Badge
                  status="success"
                  text={<span style={{ fontSize: 12, color: '#52c41a' }}>已保存草稿</span>}
                />
              )}
              <Button
                onClick={() => { if (!loading && !savingDraft) handleSave(false); }}
                loading={savingDraft}
                disabled={loading || savingDraft}
                icon={<SaveOutlined />}
                style={{ borderRadius: 6, fontSize: 13 }}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (loading || savingDraft) return;
                  if (!hasSavedDraft) {
                    message.warning('请先保存草稿，再提交课程标准');
                    return;
                  }
                  Modal.confirm({
                    title: '确认提交',
                    content: '提交后课程标准将进入审核流程，确定要提交吗？',
                    okText: '确定提交',
                    cancelText: '取消',
                    onOk: async () => { await handleSave(true); },
                  });
                }}
                loading={loading && !savingDraft}
                disabled={loading || savingDraft || !hasSavedDraft}
                icon={<CheckCircleOutlined />}
                style={{ borderRadius: 6, fontSize: 13 }}
              >
                提交审核
              </Button>
            </Space>
          )}
        </div>

        {currentStep === 0 ? renderStep0() : renderStep1()}

      </div>
    </div>
  );
};

export default CreateCourseStandard;
