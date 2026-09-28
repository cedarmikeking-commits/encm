import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Descriptions,
  Typography,
  Tooltip,
  Popconfirm,
  Input,
  Select,
  Form,
  InputNumber,
  Row,
  Col,
  Radio,
  Upload,
  Spin,
  Empty,
  Pagination,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  SaveOutlined,
  UploadOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  UserOutlined,
  TeamOutlined,
  CheckOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import mammoth from 'mammoth';
import { getStandardCoursePage, postResourceGetBylds, getLevelList, getAbilityTree, saveOrUpdate, postRemove, publishCourse, setCourseManageUser, getCourseManageUserPage, getCourseManageUser, checkCourseManageUser, removeCourseUser } from '@/api/course-standards';
import { UploadData } from '@/hooks/useOssUpload';
import UploadDraggerFile from '@/components/UploadDraggerFile';
import { CourseType } from '@/pages/course-standards/standard-course-development';
import { useDict } from '@/hooks/useDict';
import { format } from 'path';
import { current } from '@reduxjs/toolkit';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Dragger } = Upload;

interface CompetencyCategory {
  id: string;
  code: string;
  name: string;
  level: number;
  parent_id: string | null;
}

interface EducationLevel {
  id: string;
  code: string;
  name: string;
}

interface StandardCourse {
  id: string;
  standard_name?: string;
  standard_code?: string;
  category_code: string;
  category_name: string;
  course_count: number;
  course_names: string[];
  course_names_en?: string[];
  target_objectives?: string;
  implementation_standards?: string;
  education_level_codes?: string[];
  course_content?: string;
  course_nature?: string;
  evaluation_method?: string | string[];
  credits_per_course: number;
  hours_per_course: number;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  competency_level1_id?: string;
  competency_level1_code?: string;
  competency_level1_name?: string;
  competency_level2_id?: string;
  competency_level2_code?: string;
  competency_level2_name?: string;
  competency_level3_id?: string;
  competency_level3_code?: string;
  competency_level3_name?: string;
  target_competency_level1_id?: string;
  target_competency_level1_code?: string;
  target_competency_level1_name?: string;
  target_competency_level2_id?: string;
  target_competency_level2_code?: string;
  target_competency_level2_name?: string;
  target_competency_level3_ids?: string[];
  target_competency_level3_codes?: string[];
  target_competency_level3_names?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  submitted_by?: string;
  approved_at?: string;
  approved_by?: string;
  published_at?: string;
  published_by?: string;
  remarks?: string;
  standard_file_path?: string;
}

interface StandardCourseLibraryProps {
  courseType: CourseType;
  onBack?: () => void;
}

const StandardCourseLibrary: React.FC<StandardCourseLibraryProps> = ({ onBack, courseType }) => {
  const { getLabel, formatOptions } = useDict([
    'course_nature', 'course_study_way', 'course_evaluation_method', 'course_credit_hour', 'course_development_type',
  ]);
  const [pagingSearch, setPagingSearch] = useState<any>({ courseType: courseType, size: 10, current: 1, keyword: '', courseStatus: null, contentStatus: null });
  const [tableData, setTableData] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<StandardCourse[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [form] = Form.useForm();
  const [courseNamesInput, setCourseNamesInput] = useState('');
  const [courseNamesEnInput, setCourseNamesEnInput] = useState('');
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [level1Categories, setLevel1Categories] = useState<CompetencyCategory[]>([]);
  const [level2Categories, setLevel2Categories] = useState<CompetencyCategory[]>([]);
  const [level3Categories, setLevel3Categories] = useState<CompetencyCategory[]>([]);
  const [targetLevel1Id, setTargetLevel1Id] = useState<string | undefined>();
  const [targetLevel2Id, setTargetLevel2Id] = useState<string | undefined>();
  const [targetLevel3Ids, setTargetLevel3Ids] = useState<string[]>([]);
  const [wordHtml, setWordHtml] = useState<string>('');
  const [wordLoading, setWordLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [attachFiles, setAttachFiles] = useState<any[]>([]);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [abilityTree, setAbilityTree] = useState<any[]>([]);
  const [secondTreeList, setSecondList] = useState<any>({});
  const [ThreeTreeList, setThreeTreeList] = useState<any>({});
  const [uploadResIDs, setUploadResIDs] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);

  // 课程负责人
  const [managerVisible, setManagerVisible] = useState(false);
  const [managerCourse, setManagerCourse] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [existingManager, setExistingManager] = useState<any | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | undefined>();
  const [managerSaving, setManagerSaving] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [courseManageList, setCourseManageList] = useState<any[]>([]);


  useEffect(() => {
    fetchCourses();
    fetchLevelList();
    fetchAbilityTree();
    // fetchEducationLevels();
  }, [pagingSearch]);


  useEffect(() => {
    // if (!previewFile) {
    //   setWordHtml('');
    //   return;
    // }
    // setWordLoading(true);
    // const reader = new FileReader();
    // reader.onload = async (e) => {
    //   try {
    //     const arrayBuffer = e.target?.result as ArrayBuffer;
    //     const result = await mammoth.convertToHtml({ arrayBuffer });
    //     setWordHtml(result.value);
    //   } catch {
    //     setWordHtml('<p style="color:red">文件解析失败，请检查文件格式。</p>');
    //   } finally {
    //     setWordLoading(false);
    //   }
    // };
    // reader.readAsArrayBuffer(previewFile);
  }, [previewFile]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getStandardCoursePage(pagingSearch);
      setTableData(data);
    } catch (error: any) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
    //清除
    setUploadResIDs('');
  };

  const fetchLevelList = async () => {
    try {
      const data = await getLevelList();
      setLevelList(data);
    } catch (error: any) {
      message.error('加载数据失败: ' + error.message);
    } finally {
    }
  };

  const fetchAttachFiles = async (data: any) => {
    if (data.courseStandardAttach && data.courseStandardAttach.split(',').length > 0) {
      postResourceGetBylds(
        [...data.courseStandardAttach.split(',')]
      ).then(data => {
        setAttachFiles(data);
      }).catch((error: any) => {
        message.error(error.message);
      }).finally(() => {
      });

    }
  };

  const fetchAbilityTree = async () => {
    try {
      const data = await getAbilityTree();
      setAbilityTree(data);
    } catch (error: any) {
      message.error('加载能力分类失败: ' + error.message);
    }
  };


  const getFilteredLevel2Options = () => {
    if (!targetLevel1Id) return [];
    return abilityTree.find(c => c.id === targetLevel1Id)?.children || [];
  };

  const getFilteredLevel3Options = () => {
    if (!targetLevel2Id) return [];
    return getFilteredLevel2Options().find((c: any) => c.id === targetLevel2Id)?.children || [];
  };

  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType = [ // Word文档
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',].includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 doc、docx 格式的文件');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 10MB');
    }
    if (uploadResIDs) {
      message.error('只能上传一个文件');
      return false;
    }
    return isAllowedType && isLt10M;
  };
  const handleUploaded_BusinessLicense = (data: UploadData[]) => {
    console.log('上传完成，返回：', data);
    setFileList(data.map((item: any) => ({ id: item.resourceId, url: item.Location, name: item.file.name, type: item.file.type, size: item.file.size })));
    setUploadResIDs(data.map(item => item.resourceId).join(','));
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    form.resetFields();
    setCourseNamesInput('');
    setCourseNamesEnInput('');
    setTargetLevel1Id(undefined);
    setTargetLevel2Id(undefined);
    setTargetLevel3Ids([]);
    setFileList([]);
    setPreviewFile(null);
    setWordHtml('');
    setEditVisible(true);
    setUploadResIDs('');
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    //course.abilityId的规则说明
    //如果有值，是","分割的id串，第一个id是目标能力一级id，第二个id是目标能力二级id，往后第三个id起是多个目标能力三级id串
    let target_competency_level1_id = '';
    let target_competency_level2_id = '';
    let target_competency_level3_ids: any[] = [];
    let abilityIds: string[] = [];
    if (course.abilityId) {
      abilityIds.push(...course.abilityId.split(',').filter((id: any) => id));
      if (abilityIds.length > 0) {
        target_competency_level1_id = abilityIds[0];
      }
      if (abilityIds.length > 1) {
        target_competency_level2_id = abilityIds[1];
      }
      if (abilityIds.length > 2) {
        target_competency_level3_ids = abilityIds.filter((id: any, index: number) => index >= 2);
      }
    }
    setTargetLevel1Id(target_competency_level1_id);
    setTargetLevel2Id(target_competency_level2_id);
    setTargetLevel3Ids(target_competency_level3_ids || []);

    form.setFieldsValue({
      standard_name: course.courseStandardName || '',
      standard_code: course.courseCode || '',
      education_level_codes: (course.levelId || '').split(',').filter((a: any) => a) || [],
      course_nature: course.courseNature,
      course_study_way: course.courseStudyWay,
      evaluation_method: (course.courseEvaluationMethod || '').split(',').filter((a: any) => a) || [],
      target_competency_level1: target_competency_level1_id,
      target_competency_level2: target_competency_level2_id,
      target_competency_level3: target_competency_level3_ids,
      course_content: course.courseContent,
      remarks: course.courseTeacher,
    });
    setCourseNamesInput(course.courseName);
    setCourseNamesEnInput(course.courseEname || '');
    setUploadResIDs(course.courseStandardAttach);
    setFileList([]);
    setPreviewFile(null);
    setWordHtml('');
    setEditVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const courseNames = courseNamesInput.split(/[、,，]/).map(name => name.trim()).filter(Boolean);

      if (courseNames.length === 0) {
        message.error('请输入课程名称');
        setLoading(false);
        return;
      }

      if (!selectedCourse && !uploadResIDs) {
        message.error('请上传课程标准文件');
        setLoading(false);
        return;
      }

      const courseNamesEn = (courseNamesEnInput || '').split(/[,，]/).map(name => name.trim()).filter(Boolean);

      let targetCompetencyData: any = {};

      if (targetLevel1Id) {
        const targetLevel1 = level1Categories.find(c => c.id === targetLevel1Id);
        if (targetLevel1) {
          targetCompetencyData.target_competency_level1_id = targetLevel1.id;
          targetCompetencyData.target_competency_level1_code = targetLevel1.code;
          targetCompetencyData.target_competency_level1_name = targetLevel1.name;
        }
      }

      if (targetLevel2Id) {
        const targetLevel2 = level2Categories.find(c => c.id === targetLevel2Id);
        if (targetLevel2) {
          targetCompetencyData.target_competency_level2_id = targetLevel2.id;
          targetCompetencyData.target_competency_level2_code = targetLevel2.code;
          targetCompetencyData.target_competency_level2_name = targetLevel2.name;
        }
      }

      if (targetLevel3Ids.length > 0) {
        const targetLevel3Items = targetLevel3Ids.map(id => level3Categories.find(c => c.id === id)).filter(Boolean) as CompetencyCategory[];
        targetCompetencyData.target_competency_level3_ids = targetLevel3Items.map(item => item.id);
        targetCompetencyData.target_competency_level3_codes = targetLevel3Items.map(item => item.code);
        targetCompetencyData.target_competency_level3_names = targetLevel3Items.map(item => item.name);
      }

      const targetObjectivesText = [
        targetCompetencyData.target_competency_level1_name,
        targetCompetencyData.target_competency_level2_name,
        ...(targetCompetencyData.target_competency_level3_names || [])
      ].filter(Boolean).join(' - ');

      const evaluationMethodString = Array.isArray(values.evaluation_method)
        ? values.evaluation_method.join(',')
        : values.evaluation_method || '';

      const categoryCode = [
        targetCompetencyData.target_competency_level1_code,
        targetCompetencyData.target_competency_level2_code,
        ...(targetCompetencyData.target_competency_level3_codes || [])
      ].filter(Boolean).join('.');

      const categoryName = [
        targetCompetencyData.target_competency_level1_name,
        targetCompetencyData.target_competency_level2_name,
        ...(targetCompetencyData.target_competency_level3_names || [])
      ].filter(Boolean).join('-');

      const educationLevelCodesArray = Array.isArray(values.education_level_codes)
        ? values.education_level_codes
        : [];

      const saveData = {
        standard_name: values.standard_name || '',
        standard_code: values.standard_code || null,
        category_code: categoryCode || values.category_code || '',
        category_name: categoryName || values.category_name || '',
        target_objectives: targetObjectivesText || values.target_objectives || '',
        course_names: courseNames.join(','),
        course_names_en: courseNamesEn.join(','),
        course_count: courseNames.length,
        education_level_codes: educationLevelCodesArray,
        implementation_standards: educationLevelCodesArray,
        evaluation_method: evaluationMethodString,
        course_content: values.course_content || '',
        course_nature: values.course_nature || '',
        course_study_way: values.course_study_way || '',
        credits_per_course: values.credits_per_course || 2,
        hours_per_course: values.hours_per_course || 32,
        remarks: values.remarks || '',
        status: values.status || 'draft',
        created_by: values.created_by || '系统用户',
        ...targetCompetencyData
      };

      const apiData = {
        id: selectedCourse?.id,
        "courseCode": saveData.standard_code,
        "courseName": saveData.course_names,
        "courseEname": saveData.course_names_en,
        "courseType": courseType,//1统一课程(标准课程);2领域课程
        "abilityId": `${values.target_competency_level1},${values.target_competency_level2},${values.target_competency_level3.join(',')}`,
        "levelId": saveData.education_level_codes.join(','),
        "courseCredit": 1,//数据字典：course_credit_hour：standard的值
        "courseHour": 16,//数据字典：course_credit_hour：standard的值
        "courseContent": saveData.course_content,// "课程内容111",
        "courseNature": saveData.course_nature,
        "courseStudyWay": saveData.course_study_way,//数据字典：课程学习方式course_study_way
        "courseEvaluationMethod": saveData.evaluation_method,//评价方式;数据字典course_evaluation_method
        "courseTeacher": saveData.remarks,
        "courseStandardAttach": uploadResIDs,//附件Ids
        "courseStandardName": saveData.standard_name,
      };
      await saveOrUpdate(apiData);
      message.success(selectedCourse ? '更新成功' : '创建成功');
      setEditVisible(false);
      setUploadResIDs('');
      setFileList([]);
      form.resetFields();
      fetchCourses();
    } catch (error: any) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postRemove({ id });
      message.success('删除成功');
      fetchCourses();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handlePublish = async (course: StandardCourse) => {
    try {
      await publishCourse({ id: course.id, status: 1 });

      message.success('发布成功');
      fetchCourses();
    } catch (error: any) {
      message.error('发布失败: ' + error.message);
    }
  };

  const handleUnpublish = async (course: StandardCourse) => {
    try {
      await publishCourse({ id: course.id, status: 0 });

      message.success('已取消发布');
      fetchCourses();
    } catch (error: any) {
      message.error('取消发布失败: ' + error.message);
    }
  };

  const getStatusTag = (status: string, statusTitle: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      "0": { color: 'default', text: statusTitle, icon: <ClockCircleOutlined /> },
      "1": { color: 'cyan', text: statusTitle, icon: <CheckCircleOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const openManagerModal = async (course: StandardCourse) => {
    setManagerCourse(course);
    setManagerSearch('');
    setSelectedManagerId(undefined);
    setExistingManager(null);
    setManagerVisible(true);

    fetchCourseManageUserPage('');
    fetchCourseManageUser(course.id);
    // const [rolesResult, managerResult] = await Promise.all([
    //   supabase
    //     .from('user_roles')
    //     .select('id, user_name, user_email, department, role_name')
    //     .eq('role_name', '课程负责人')
    //     .eq('is_deleted', false)
    //     .order('user_name'),
    //   supabase
    //     .from('course_managers')
    //     .select('*')
    //     .eq('standard_course_id', course.id)
    //     .maybeSingle()
    // ]);

    // if (rolesResult.data) setUserRoles(rolesResult.data);
    // if (managerResult.data) {
    //   setExistingManager(managerResult.data);
    //   const matched = rolesResult.data?.find((u: UserRole) => u.user_name === managerResult.data.manager_name);
    //   if (matched) setSelectedManagerId(matched.id);
    // }
  };
  const fetchCourseManageUser = async (courseId: string) => {
    getCourseManageUser({ id: courseId }).then(res => {
      setExistingManager(res);
    }).catch(err => {
      message.error('获取数据失败：' + err?.response?.data?.msg || err.message || '未知错误');
    })
  }
  const fetchCourseManageUserPage = async (keyword: string) => {
    getCourseManageUserPage({ current: 1, size: 99, keyword }).then(res => {
      setCourseManageList(res.records);
    }).catch(err => {
      message.error('获取数据失败：' + err?.response?.data?.msg || err.message || '未知错误');
    });
  }
  const handleSearchManager = (e: any) => {

    setManagerSearch(e.target.value);
    fetchCourseManageUserPage(e.target.value);
  }

  const handleSaveManager = async () => {
    if (!selectedManagerId || !managerCourse) return;
    const user = courseManageList.find(u => u.id === selectedManagerId);
    if (!user) return;

    // 校验：该负责人是否已负责其他课程
    const courseName = await checkCourseManageUser({ id: managerCourse.id, userId: user.id });

    if (courseName && courseName != null) {
      Modal.confirm({
        title: '负责人已存在绑定关系',
        content: (
          <div style={{ fontSize: 14, color: '#595959', lineHeight: 1.8 }}>
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{user.name}</span>
            {' 已是课程 '}
            <span style={{ fontWeight: 600, color: '#1677ff' }}>「{courseName}」</span>
            {' 的负责人。'}
            <br />
            确定仍要将其设置为当前课程的负责人吗？
          </div>
        ),
        okText: '仍然设置',
        cancelText: '取消',
        okButtonProps: { danger: false },
        onOk: () => doSaveManager(user),
      });
      return;
    }

    doSaveManager(user);
  };

  const doSaveManager = async (user: any) => {
    if (!managerCourse) return;
    setManagerSaving(true);
    setCourseManageUser({ id: managerCourse.id, userId: user.id }).then(() => {
      message.success('课程负责人设置成功');
      setManagerVisible(false);
    }).catch(err => {
      message.error('保存失败：' + err?.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setManagerSaving(false);
    })

  };

  const handleRemoveManager = async () => {
    if (!existingManager) return;
    setManagerSaving(true);
    removeCourseUser({ id: managerCourse.id, userId: Object.keys(existingManager)[0] }).then(() => {
      message.success('已移除课程负责人');
      setExistingManager(null);
      setSelectedManagerId(undefined);
    }).catch(err => {
      message.error('移除失败：' + err?.response?.data?.msg || err.message || '未知错误');
    }).finally(() => {
      setManagerSaving(false);
    })
    // try {
    //   const { error } = await supabase
    //     .from('course_managers')
    //     .delete()
    //     .eq('id', existingManager.id);
    //   if (error) throw error;
    //   message.success('已移除课程负责人');
    //   setExistingManager(null);
    //   setSelectedManagerId(undefined);
    // } catch (e: any) {
    //   message.error('移除失败：' + e.message);
    // } finally {
    //   setManagerSaving(false);
    // }
  };

  const columns: ColumnsType<any> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '课程中文名称',
      key: 'course_names',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <Tooltip title={record.courseName}>
            <Text>{record.courseName}</Text>
          </Tooltip>
          {record.courseEname && (
            <div>
              <Tooltip title={record.courseEname}>
                <Text type="secondary" style={{ fontSize: 12 }}>{record.courseEname}</Text>
              </Tooltip>
            </div>
          )}
        </div>
      )
    },

    {
      title: '课程编码',
      dataIndex: 'courseCode',
      key: 'standard_code',
      width: 140,
      align: 'center',
      render: (text) => text ? <Tag color="cyan">{text}</Tag> : <Tag color="default">未生成</Tag>
    },

    {
      title: '能力目标',
      key: 'abilityName',
      dataIndex: 'abilityName',
      width: 300
    },
    {
      title: '执行标准',
      dataIndex: 'levelName',
      key: 'implementation_standards',
      width: 250,
    },
    {
      title: '学分/学时',
      key: 'credits_hours',
      width: 120,
      align: 'center',
      render: (_, record) => `${record.courseCredit}/${record.courseHour}`
    },
    // {
    //   title: '课程性质',
    //   dataIndex: 'courseNature',
    //   key: 'course_nature',
    //   width: 100,
    //   align: 'center',
    //   render: (text) => text ? <Tag color="blue">{getLabel('courseNature', text)}</Tag> : '-'
    // },
    {
      title: '课程标准名称',
      dataIndex: 'courseStandardName',
      key: 'standard_name',
      width: 200,

      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text strong>{text || '-'}</Text>
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'courseStatus',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => getStatusTag(status, record.courseStatusTitle)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'created_at',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCourse(record);
                setWordHtml('');
                setWordLoading(false);
                setPreviewFile(null);
                fetchAttachFiles(record);
                setDetailVisible(true);
                //loadFileList
              }}
            />
          </Tooltip>
          <Tooltip title="设置课程负责人">
            <Button
              type="text"
              size="small"
              icon={<UserOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => openManagerModal(record)}
            />
          </Tooltip>
          {record.courseStatus === 0 && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Popconfirm
                title="确认发布"
                description="确定要发布这门课程吗？发布后将对所有用户可见。"
                onConfirm={() => handlePublish(record)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="发布">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="确认删除"
                description="确定要删除这条标准课程记录吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="删除">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.courseStatus === 1 && (
            <Popconfirm
              title="确认取消发布"
              description="确定要取消发布这门课程吗？取消后将不再对用户可见。"
              onConfirm={() => handleUnpublish(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="取消发布">
                <Button
                  type="text"
                  size="small"
                  icon={<ClockCircleOutlined />}
                  style={{ color: '#faad14' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onBack && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                size="small"
                style={{ flexShrink: 0 }}
              >
                返回
              </Button>
            )}

            <Title level={4} style={{ margin: 0 }}></Title>
          </div>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建课程
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Search
              placeholder="搜索类别名称、代码或课程名称"
              allowClear
              value={pagingSearch.keyword}
              style={{ width: 300 }}
              onChange={(e) => setPagingSearch((prev: any) => ({ ...prev, keyword: e.target.value, current: 1 }))}
              onSearch={(value) => setPagingSearch((prev: any) => ({ ...prev, keyword: value, current: 1 }))}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 150 }}
              value={pagingSearch.courseStatus}
              onChange={(value) => setPagingSearch((prev: any) => ({ ...prev, courseStatus: value, current: 1 }))}
              options={[
                { label: '草稿', value: '0' },
                { label: '已发布', value: '1' }
              ]}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={tableData.records || []}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={{
              current: pagingSearch.current,
              showSizeChanger: true,
              showTotal: (total) => `共 ${tableData.total} 条记录`,
              total: tableData.total,
              defaultPageSize: 10,
              onChange: (page, pageSize) => {
                if (pageSize !== pagingSearch.size) {
                  setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
                } else {
                  setPagingSearch((prev: any) => ({ ...prev, current: page }))
                }
              }
            }}
          />
        </Space>
      </Card>

      {/* 查看详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>课程详情</span>
            {selectedCourse && getStatusTag(selectedCourse.status, selectedCourse.courseStatusTitle)} {/* 状态标签 */}
          </div>
        }
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedCourse(null);
          setWordHtml('');
        }}
        width={760}
        styles={{ body: { padding: '0 24px 20px', maxHeight: '78vh', overflowY: 'auto' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setDetailVisible(false); setSelectedCourse(null); setWordHtml(''); }}>
              关闭
            </Button>
          </div>
        }
      >
        {selectedCourse && detailVisible && (
          <Space direction="vertical" size={14} style={{ width: '100%' }}>

            {/* 课程名称 */}
            <div style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%)', borderRadius: 10, padding: '16px 18px', border: '1px solid #d0e8ff', marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#5b8db8', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>课程名称</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0d2d5e', lineHeight: 1.5 }}>
                {selectedCourse.courseName}
              </div>
              {selectedCourse.courseEname && (
                <div style={{ fontSize: 12, color: '#5b8db8', marginTop: 5, fontStyle: 'italic' }}>
                  {selectedCourse.courseEname}
                </div>
              )}
            </div>

            {/* 课程标准名称 + 编码 */}
            <Row gutter={12}>
              <Col span={15}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>课程标准名称</div>
                  <Text style={{ fontSize: 13, color: '#262626' }}>{selectedCourse.courseStandardName || <span style={{ color: '#bfbfbf' }}>-</span>}</Text>
                </div>
              </Col>
              <Col span={9}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>课程编码</div>
                  {selectedCourse.courseCode
                    ? <Text style={{ fontSize: 13, color: '#0958d9', fontWeight: 600, fontFamily: 'monospace' }}>{selectedCourse.courseCode}</Text>
                    : <Text style={{ fontSize: 12, color: '#bfbfbf' }}>未生成</Text>}
                </div>
              </Col>
            </Row>

            {/* 能力目标 */}
            <div style={{ borderRadius: 8, border: '1px solid #efefef', overflow: 'hidden' }}>
              <div style={{ background: '#fafafa', padding: '8px 14px', fontSize: 11, color: '#8c8c8c', fontWeight: 500, borderBottom: '1px solid #efefef' }}>能力目标</div>
              <div style={{ padding: '12px 14px' }}>
                {selectedCourse.abilityName}
              </div>
            </div>

            {/* 执行标准 */}
            <div style={{ borderRadius: 8, border: '1px solid #efefef', overflow: 'hidden' }}>
              <div style={{ background: '#fafafa', padding: '8px 14px', fontSize: 11, color: '#8c8c8c', fontWeight: 500, borderBottom: '1px solid #efefef' }}>执行标准</div>
              <div style={{ padding: '12px 14px' }}>
                {selectedCourse.levelName}
              </div>
            </div>

            {/* 属性行：课程性质 / 学分学时 / 评价方式 */}
            <Row gutter={12}>
              <Col span={8}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>学习方式</div>
                  {selectedCourse.courseStudyWay
                    ? <span style={{ background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{getLabel('course_study_way', selectedCourse.courseStudyWay)}</span>
                    : <Text type="secondary">-</Text>}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>学分 / 学时</div>
                  <Text strong style={{ fontSize: 14, color: '#262626' }}>
                    {selectedCourse.courseCredit} <span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 12 }}>分</span>
                    {' / '}
                    {selectedCourse.courseHour} <span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 12 }}>时</span>
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #efefef', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>评价方式</div>
                  {selectedCourse.courseEvaluationMethod ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                      {selectedCourse.courseEvaluationMethod.split(',')
                        .map((method: any, i: any) => (
                          <span key={i} style={{ background: '#f9f0ff', color: '#531dab', border: '1px solid #d3adf7', borderRadius: 4, padding: '1px 8px', fontSize: 11 }}>{getLabel('course_evaluation_method', method)}</span>
                        ))}
                    </div>
                  ) : <Text type="secondary">-</Text>}
                </div>
              </Col>
            </Row>

            {/* 课程内容 */}
            {selectedCourse.courseContent && (
              <div style={{ borderRadius: 8, border: '1px solid #efefef', overflow: 'hidden' }}>
                <div style={{ background: '#fafafa', padding: '8px 14px', fontSize: 11, color: '#8c8c8c', fontWeight: 500, borderBottom: '1px solid #efefef' }}>课程内容</div>
                <div style={{ padding: '12px 14px', fontSize: 13, color: '#434343', lineHeight: 1.8 }}>
                  {selectedCourse.courseContent}
                </div>
              </div>
            )}

            {/* 备注 */}
            {selectedCourse.courseDescription && (
              <div style={{ background: '#fffbe6', borderRadius: 8, padding: '10px 14px', border: '1px solid #ffe58f', fontSize: 13, color: '#614700' }}>
                <span style={{ fontWeight: 600, marginRight: 6 }}>备注：</span>{selectedCourse.courseDescription}
              </div>
            )}

            {/* 审批信息 */}
            {selectedCourse.courseStatus == 1 && (
              <div style={{ borderRadius: 8, border: '1px solid #efefef', overflow: 'hidden' }}>
                <div style={{ background: '#fafafa', padding: '8px 14px', fontSize: 11, color: '#8c8c8c', fontWeight: 500, borderBottom: '1px solid #efefef' }}>发布信息</div>
                <div style={{ padding: '10px 14px' }}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Text style={{ fontSize: 12 }}>
                        <span style={{ color: '#8c8c8c', marginRight: 6 }}>发布时间</span>
                        {dayjs(selectedCourse.updateTime).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text style={{ fontSize: 12 }}>
                        <span style={{ color: '#8c8c8c', marginRight: 6 }}>发布人</span>
                        {selectedCourse.publishUserName || '-'}
                      </Text>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* 课程标准文件 */}
            <div style={{ borderRadius: 8, border: '1px solid #efefef', overflow: 'hidden' }}>
              <div style={{ background: '#fafafa', padding: '8px 14px', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 500 }}>课程标准文件</span>
                {selectedCourse.courseStandardAttach && attachFiles.length > 0 && (
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={attachFiles[0]?.signUrl}
                    target="_blank"
                    style={{ fontSize: 12 }}
                  >
                    预览文件
                  </Button>
                )}
                {wordHtml && (
                  <Button
                    size="small"
                    onClick={() => setWordHtml('')}
                    style={{ fontSize: 12 }}
                  >
                    收起预览
                  </Button>
                )}
              </div>
              <div style={{ padding: '14px' }}>
                {wordLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                    <Spin tip="文件解析中..." size="large" />
                  </div>
                ) : wordHtml ? (
                  <div
                    style={{
                      maxHeight: 480,
                      overflowY: 'auto',
                      border: '1px solid #f0f0f0',
                      borderRadius: 6,
                      padding: '16px 20px',
                      background: '#fff',
                      fontSize: 13,
                      lineHeight: 1.9,
                      color: '#333'
                    }}
                    dangerouslySetInnerHTML={{ __html: wordHtml }}
                  />
                ) : selectedCourse.courseStandardAttach ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                    <FileTextOutlined style={{ fontSize: 28, color: '#1677ff' }} />
                    <div>
                      <div style={{ fontSize: 13, color: '#262626', fontWeight: 500 }}>课程标准文件已上传</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>点击右上角"预览文件"按钮在线查看内容</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 0', gap: 8 }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                          暂无课程标准文件
                          <br />
                          <span style={{ fontSize: 12 }}>编辑课程时可上传 Word 文档</span>
                        </span>
                      }
                    />
                  </div>
                )}
              </div>
            </div>

          </Space>
        )}
      </Modal>

      {/* 设置课程负责人弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TeamOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>设置课程负责人</div>
              {managerCourse && (
                <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400, marginTop: 1 }}>
                  {managerCourse.courseName}
                </div>
              )}
            </div>
          </div>
        }
        open={managerVisible}
        onCancel={() => { setManagerVisible(false); setManagerCourse(null); setSelectedManagerId(undefined); }}
        width={520}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setManagerVisible(false); setManagerCourse(null); setSelectedManagerId(undefined); }}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={managerSaving}
              disabled={
                !selectedManagerId ||
                (!!existingManager && courseManageList.find(u => u.id === selectedManagerId)?.name == Object.values(existingManager)[0])
              }
              onClick={handleSaveManager}
            >
              确认设置
            </Button>
          </div>
        }
      >
        <div style={{ padding: '4px 0 8px' }}>
          {/* 当前负责人提示 */}
          {existingManager&& managerCourse && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#f0f8ff', border: '1px solid #bae0ff',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            }}>
              <Avatar size={36} style={{ background: '#1677ff', flexShrink: 0, fontWeight: 600, fontSize: 15 }}>
                {String(Object.values(existingManager)[0] ?? '').charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{String(Object.values(existingManager)[0] ?? '')}</div>
                <div style={{ fontSize: 12, color: '#1677ff', marginTop: 1 }}>当前课程负责人</div>
              </div>
              <Popconfirm
                title="移除课程负责人"
                description={`确定移除「${String((existingManager as any)[managerCourse.id] ?? '')}」的课程负责人身份吗？`}
                okText="确认移除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={handleRemoveManager}
              >
                <Button
                  size="small"
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  loading={managerSaving}
                  style={{ flexShrink: 0 }}
                >
                  移除
                </Button>
              </Popconfirm>
            </div>
          )}

          {/* 搜索 */}
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="搜索姓名或部门"
            value={managerSearch}
            onChange={handleSearchManager}
            style={{ marginBottom: 12 }}
            allowClear
          />

          {/* 人员列表 */}
          <div style={{ maxHeight: 340, overflowY: 'auto', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            {courseManageList.length === 0 ? (
              <Empty description="暂无课程负责人角色用户" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '32px 0' }} />
            ) : (
              courseManageList
                .map((user, idx, arr) => {
                  const isSelected = selectedManagerId === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedManagerId(isSelected ? undefined : user.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        cursor: 'pointer',
                        borderBottom: idx < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                        background: isSelected ? '#e6f4ff' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Avatar
                        size={36}
                        style={{
                          background: isSelected ? '#1677ff' : '#e8e8e8',
                          color: isSelected ? '#fff' : '#595959',
                          flexShrink: 0, fontWeight: 600, fontSize: 14,
                          transition: 'background 0.15s',
                        }}
                      >
                        {user.name.slice(-1)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: isSelected ? '#1677ff' : '#1a1a1a' }}>
                          {user.name}
                        </div>
                        {user.deptName && (
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 1 }}>{user.deptName}</div>
                        )}
                      </div>
                      {isSelected && (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          {selectedManagerId && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, fontSize: 13, color: '#389e0d' }}>
              已选择：<strong>{courseManageList.find(u => u.id === selectedManagerId)?.name}</strong>
            </div>
          )}
        </div>
      </Modal>


      {/* 新建/编辑弹窗 */}
      <Modal
        title={selectedCourse ? '编辑标准课程' : '新建标准课程'}
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          setUploadResIDs('');
          setFileList([]);
          form.resetFields();
        }}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditVisible(false);
            setUploadResIDs('');
            setFileList([]);
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            保存
          </Button>
        ]}
        destroyOnHidden={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'draft',
            credits_per_course: 1,
            hours_per_course: 16,
            course_nature: '在线课程'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="课程名称" required>
                <Input
                  placeholder="例如：职业指导Ⅰ、职业指导Ⅱ（多个用、分隔）"
                  value={courseNamesInput}
                  onChange={(e) => setCourseNamesInput(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="课程英文名称">
                <Input
                  placeholder="例如：Career Guidance I, Career Guidance II（多个用逗号分隔）"
                  value={courseNamesEnInput}
                  onChange={(e) => setCourseNamesEnInput(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="standard_name"
                label="课程标准名称"
                rules={[{ required: true, message: '请输入课程标准名称' }]}
              >
                <Input placeholder="例如：职业指导课程标准" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="standard_code"
                label="课程编码"
                rules={[{ required: true, message: '请输入课程编码' }]}
              >
                <Input placeholder="例如：ST-20251104001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="target_competency_level1"
                label="能力一级"
                rules={[{ required: true, message: '请选择能力一级' }]}
              >
                <Select
                  placeholder="请选择能力一级"
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  value={targetLevel1Id}
                  onChange={(value) => {
                    setTargetLevel1Id(value);
                    setTargetLevel2Id(undefined);
                    setTargetLevel3Ids([]);
                    form.setFieldsValue({
                      target_competency_level2: undefined,
                      target_competency_level3: []
                    });
                  }}
                  options={abilityTree.map(c => ({
                    label: `${c.abilityName}`,
                    value: c.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="target_competency_level2"
                label="能力二级"
                rules={[{ required: true, message: '请选择能力二级' }]}
              >
                <Select
                  placeholder="请选择能力二级"
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!targetLevel1Id}
                  value={targetLevel2Id}
                  onChange={(value) => {
                    setTargetLevel2Id(value);
                    setTargetLevel3Ids([]);
                    form.setFieldsValue({
                      target_competency_level3: []
                    });
                  }}
                  options={getFilteredLevel2Options().map((c: any) => ({
                    label: `${c.abilityName}`,
                    value: c.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="target_competency_level3"
                label="能力三级（可多选）"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择能力三级"
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!targetLevel2Id}
                  value={targetLevel3Ids}
                  onChange={(value) => setTargetLevel3Ids(value)}
                  options={getFilteredLevel3Options().map((c: any) => ({
                    label: `${c.abilityName}`,
                    value: c.id
                  }))}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="执行标准"
            name="education_level_codes"
            rules={[{ required: true, message: '请选择执行标准' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择执行标准（可多选）"
              style={{ width: '100%' }}
              options={levelList.map(level => ({
                label: level.levelName,
                value: level.id
              }))}
            />
          </Form.Item>

          <Form.Item
            label="课程内容"
            name="course_content"
          >
            <TextArea
              rows={4}
              placeholder="例如：学习者从事一定的职业活动时需要具备的基本素养，如职业理想、职业认知、职业态度、职业纪律、职业伦理、职业形象、礼仪礼节、自律与专注力等。"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="学习方式"
                name="course_study_way"
                rules={[{ required: true, message: '请选择学习方式' }]}
              >
                <Radio.Group>
                  {formatOptions('course_study_way').map((a: any) => <Radio value={a.value}>{a.label}</Radio>)}
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="评价方式"
                name="evaluation_method"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择评价方式（可多选）"
                  style={{ width: '100%' }}
                  options={formatOptions('course_evaluation_method')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="课程学分"
                name="credits_per_course"
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="学分"
                  readOnly
                  variant="filled"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="参考学时"
                name="hours_per_course"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="学时"
                  readOnly
                  variant="filled"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="上传课程标准文件"
            extra="仅支持 Word 文档（.doc, .docx），拖拽或点击上传"
            required
          >
            <UploadDraggerFile
              name="file"
              maxCount={1}
              multiple={false}
              beforeUpload={beforeUpload}
              onUploaded={handleUploaded_BusinessLicense}
              uploadResIDs={uploadResIDs}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: '16px', marginTop: '16px' }}>
                点击或拖拽文件到此区域上传
              </p>
              <p className="ant-upload-hint" style={{ fontSize: '14px', color: '#999' }}>
                支持 Word 文档格式（.doc, .docx），单个文件不超过10MB
              </p>
            </UploadDraggerFile>
          </Form.Item>

          <Form.Item
            label="授课教师"
            name="remarks"
          >
            <TextArea rows={2} placeholder="其他补充说明" />
          </Form.Item>

          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StandardCourseLibrary;
