import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, message, Button, Space } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
const { TextArea } = Input;
import { UploadData } from '@/hooks/useOssUpload';
import UploadDraggerFile from '@/components/UploadDraggerFile';
import { setCourseTarget } from '@/api/course-develoment';
interface CourseLearningObjectivesModalProps {
  visible: boolean;
  courseInfo: any;
  onCancel: () => void;
  onSuccess: () => void;
}

interface CourseData {
  course_cover_url?: string;
  course_description?: string;
  course_learning_objectives?: string;
}

const CourseLearningObjectivesModal: React.FC<CourseLearningObjectivesModalProps> = ({
  visible,
  courseInfo,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadResIDs, setUploadResIDs] = useState<string>(courseInfo.courseCover || '');

  useEffect(() => {
    if (visible && courseInfo) {
      form.setFieldsValue({
        course_description: courseInfo.courseDescription,
        course_learning_objectives: courseInfo.courseTarget
      });
    }
  }, [visible, courseInfo]);

  const handleUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}_cover_${Date.now()}.${fileExt}`;
    const filePath = `course_covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('course_files')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue();
      let coverUrl = fileList[0]?.url || '';

      if (fileList.length > 0 && fileList[0].originFileObj) {
        setUploading(true);
        try {
          coverUrl = await handleUpload(fileList[0].originFileObj as File);
          message.success('封面上传成功');
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          message.error('封面上传失败: ' + (uploadError.message || JSON.stringify(uploadError)));
          setUploading(false);
          setLoading(false);
          return;
        }
        setUploading(false);
      }

      const apiData: any = {
        courseCover: uploadResIDs,
        courseDescription: values.course_description,
        courseTarget: values.course_learning_objectives,
        courseStatus: 0,
      };

      await setCourseTarget({
        id: courseInfo.id,
        ...apiData
      });
      message.success('课程学习目标设置成功，课程状态已更新为草稿');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写完整的表单信息');
      } else {
        message.error('保存失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType = [
      'image/jpg',
      'image/jpeg',
      'image/png'].includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 jpg、png 格式的文件');
    }
    const isLt10M = file.size / 1024 / 1024 < 5;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 5MB');
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
  return (
    <Modal
      title={`设计学习目标 - ${courseInfo.courseName}`}
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            loading={loading || uploading}
            onClick={handleSubmit}
          >
            保存
          </Button>
        </Space>
      }
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="课程封面"
          name="course_cover"
          extra="支持jpg、png等图片格式，大小不超过5MB"
        >
          <UploadDraggerFile
            accept=".jpg,.png"
            name="file"
            maxCount={1}
            multiple={false}
            beforeUpload={beforeUpload}
            onUploaded={handleUploaded_BusinessLicense}
            uploadResIDs={uploadResIDs}
            onRemove={() => { setFileList([]); setUploadResIDs(''); }}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传封面</div>
            </div>
          </UploadDraggerFile>
        </Form.Item>

        <Form.Item
          label="课程描述"
          name="course_description"
          rules={[
            { required: true, message: '请输入课程描述' },
            { max: 1000, message: '课程描述不能超过1000字' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="请输入课程的简介描述，帮助学习者了解课程的主要内容和特点"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          label="课程学习目标"
          name="course_learning_objectives"
          rules={[
            { required: true, message: '请输入课程学习目标' },
            { max: 2000, message: '课程学习目标不能超过2000字' }
          ]}
          extra="描述学习者完成整个课程后应该达到的总体目标和能力"
        >
          <TextArea
            rows={8}
            placeholder="请输入课程的总体学习目标，例如：&#10;1. 掌握xxx基本概念和原理&#10;2. 能够独立完成xxx任务&#10;3. 具备xxx能力..."
            showCount
            maxLength={2000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseLearningObjectivesModal;
