import React, { useState } from 'react';

import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Select, Tabs, Checkbox, Button, Typography, Space, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Category = 'personal' | 'organization';
type UserRole = 'learner' | 'teacher' | 'admin' | 'staff';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  category: Category;
  role?: UserRole;
  orgRole?: UserRole;
  agree: boolean;
}

export const RegisterForm: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    const role = values.category === 'personal' ? values.role : values.orgRole;
    const payload = {
      email: values.email,
      password: values.password,
      role,
      category: values.category,
    };

    setSubmitting(true);
    try {
      await axios.post('/api/register', payload);
      message.success('注册成功');
      navigate('/login');
    } catch (err: any) {
      message.error(err?.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-form">
      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        className="register-form__form"
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          category: 'personal',
          agree: false,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          label="邮箱"
          className="register-form__email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input
            size="large"
            type="email"
            placeholder="请输入邮箱地址"
            prefix={<MailOutlined />}
            className="register-form__email-input"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          className="register-form__password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少 8 位' },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
              message: '需包含字母和数字',
            },
          ]}
          hasFeedback
        >
          <Input.Password
            size="large"
            placeholder="请输入密码"
            prefix={<LockOutlined />}
            className="register-form__password-input"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          className="register-form__confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            placeholder="请再次输入密码"
            prefix={<LockOutlined />}
            className="register-form__confirm-input"
          />
        </Form.Item>

        <div className="register-form__role-block">
          <Typography.Text className="register-form__role-title">
            选择用户类别与角色
          </Typography.Text>
          <div className="register-form__category">
            <Form.Item name="category" noStyle initialValue="personal">
              <Tabs
                className="register-form__category-tabs"
                activeKey={Form.useWatch('category', form) || 'personal'}
                onChange={(key) => form.setFieldValue('category', key as Category)}
                items={[
                  {
                    key: 'personal',
                    label: '个人',
                    children: (
                      <Form.Item
                        name="role"
                        className="register-form__role"
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const category = getFieldValue('category');
                              if (category !== 'personal') return Promise.resolve();
                              if (!value) return Promise.reject(new Error('请选择角色'));
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Select
                          size="large"
                          placeholder="请选择角色"
                          className="register-form__role-select"
                          options={[
                            { label: '学员', value: 'learner' as UserRole },
                            { label: '教师', value: 'teacher' as UserRole },
                          ]}
                          allowClear
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    key: 'organization',
                    label: '机构',
                    children: (
                      <Form.Item
                        name="orgRole"
                        className="register-form__role"
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const category = getFieldValue('category');
                              if (category !== 'organization') return Promise.resolve();
                              if (!value) return Promise.reject(new Error('请选择角色'));
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Select
                          size="large"
                          placeholder="请选择角色"
                          className="register-form__role-select"
                          options={[
                            { label: '管理员', value: 'admin' as UserRole },
                            { label: '教务', value: 'staff' as UserRole },
                          ]}
                          allowClear
                        />
                      </Form.Item>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="agree"
          valuePropName="checked"
          className="register-form__agree"
          rules={[
            {
              validator: (_, v) =>
                v ? Promise.resolve() : Promise.reject(new Error('请勾选同意条款')),
            },
          ]}
        >
          <Checkbox>
            我已阅读并同意
            <a className="register-form__agree-link" href="/terms" target="_blank" rel="noreferrer">
              用户协议
            </a>
            与
            <a
              className="register-form__agree-link"
              href="/privacy"
              target="_blank"
              rel="noreferrer"
            >
              隐私政策
            </a>
          </Checkbox>
        </Form.Item>

        <Space direction="vertical" className="register-form__actions" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            loading={submitting}
            className="register-form__submit"
          >
            注册
          </Button>
          <Button
            type="link"
            size="small"
            className="register-form__to-login"
            onClick={() => onSwitchToLogin()}
          >
            已有账号？去登录
          </Button>
        </Space>
      </Form>
    </div>
  );
};
