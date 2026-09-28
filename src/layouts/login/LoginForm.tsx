import React, { useMemo, useState } from 'react';

import { MailOutlined, LockOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Tabs,
  Select,
  Checkbox,
  Button,
  Space,
  Typography,
  Alert,
  message,
  Card,
} from 'antd';
import { md5 } from 'js-md5';
import { useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

import { loginByPassword } from '@/api/user';

type Category = 'personal' | 'management' | 'organization' | 'expert';
type UserRole =
  | 'learner'
  | 'teacher'
  | 'edu_admin'
  | 'hr_admin'
  | 'college'
  | 'enterprise'
  | 'expert';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

interface LoginValues {
  account: string;
  password: string;
  rememberMe: boolean;
  category: Category;
  role?: UserRole;
}

const ROLE_MAP: Record<Category, { label: string; value: UserRole }[]> = {
  personal: [
    { label: '学员', value: 'learner' },
    { label: '教师', value: 'teacher' },
  ],
  management: [
    { label: '教育主管部门', value: 'edu_admin' },
    { label: '人社主管部门', value: 'hr_admin' },
  ],
  organization: [
    { label: '高校', value: 'college' },
    { label: '企业', value: 'enterprise' },
  ],
  expert: [{ label: '专家', value: 'expert' }],
};

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [form] = Form.useForm<LoginValues>();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const category = Form.useWatch('category', form) as Category | undefined;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roleOptions = useMemo(() => ROLE_MAP[(category as Category) || 'personal'], [category]);

  const onFinish = (values: LoginValues) => {
    setGeneralError(null);

    const { account, password, role, category } = values;

    if (!account || !password) {
      setGeneralError('请填写完整的登录信息');
      return;
    }
    handleLogin(values);
    // // 跳转逻辑
    // if (category === 'management' && (role === 'edu_admin' || role === 'hr_admin')) {
    //   window.location.href = 'https://www.szacr.top';
    //   return;
    // }

    // if (role === 'college' || role === 'enterprise') {
    //   window.location.href = 'https://www.szacm.top';
    //   return;
    // }

    // message.warning('该角色暂未开放跳转');
  };
  const handleLogin = (values: LoginValues) => {
    // 登录逻辑
    console.log('登录信息:', values);
    loginByPassword({ username: values.account, password: md5(values.password) }).then((res) => {
      console.log('Login successful, response:', res);
      dispatch({
        type: 'user/logIn',
        payload: { token: res.access_token, refreshToken: res.refresh_token, name: res.real_name },
      });
      // 刷新页面或跳转到受保护的路由
      navigate('/');
    });
  };
  return (
    <div className="min-h-screen flex">
      {/* 左侧内容区域（保留原有样式） */}
      <div className="hidden lg:flex lg:flex-1 xl:flex-[3] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 items-center justify-center p-8">
        <div className="max-w-2xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  “深圳协议”统一身份认证
                </h1>
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  多角色统一登录平台，支持个人用户、管理机构、机构用户、专家组织等多种角色身份认证
                </p>
              </div>
            </div>
          </div>
          {/* 可按需添加更多左侧内容块 */}
        </div>
      </div>

      {/* 右侧登录表单（使用 antd） */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg login-form__card" variant="outlined">
          <Typography.Title level={3} className="text-center mb-6">
            登录
          </Typography.Title>

          {generalError && (
            <Alert
              className="mb-4"
              type="error"
              showIcon
              message={generalError}
              onClose={() => setGeneralError(null)}
              closable
            />
          )}

          <Form<LoginValues>
            form={form}
            layout="vertical"
            className="login-form__form"
            initialValues={{
              account: '',
              password: '',
              rememberMe: false,
              category: 'personal',
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="account"
              label="账号"
              className="login-form__email"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input
                size="large"
                type="account"
                placeholder="请输入账号"
                prefix={<MailOutlined />}
                className="login-form__email-input"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              className="login-form__password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 5, message: '密码至少需要5位字符' },
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                placeholder="请输入密码"
                prefix={<LockOutlined />}
                className="login-form__password-input"
              />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" className="login-form__remember">
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }} className="login-form__actions">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="login-form__submit"
              >
                登录
              </Button>
              {/* <Button
                type="link"
                size="small"
                className="login-form__switch-register"
                onClick={onSwitchToRegister}
              >
                没有账号？去注册
              </Button> */}
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
};
