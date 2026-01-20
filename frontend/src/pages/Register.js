import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('注册成功！');
      navigate('/user/info');
    } catch (error) {
      message.error(error.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 背景装饰 */}
      <div className="login-bg-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
      
      <Card className="login-card" style={{ maxWidth: '450px' }}>
        {/* 返回按钮 */}
        <div className="login-back" onClick={() => navigate('/login')}>
          <ArrowLeftOutlined /> 返回登录
        </div>

        <div className="login-content">
          {/* Logo区域 */}
          <div className="login-logo">
            <img 
              src="/logo.jpg" 
              alt="TransGuyane" 
              className="login-logo-image"
            />
            <h1 className="logo-title">用户注册</h1>
            <p className="logo-subtitle">创建您的TransGuyane账户</p>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="真实姓名"
              rules={[
                { required: true, message: '请输入真实姓名' },
                { min: 2, max: 20, message: '姓名长度在2-20个字符之间' },
                { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '请输入真实的中文或英文姓名' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入您的真实姓名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入密码（至少6个字符）"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请再次输入密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵称（可选）"
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入昵称"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱（可选）"
              rules={[
                { type: 'email', message: '邮箱格式不正确' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入邮箱"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号（可选）"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入手机号"
                size="large"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="login-button"
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <span>已有账户？</span>
            <Link to="/login">立即登录</Link>
          </div>
        </div>
      </Card>

      {/* 底部版权 */}
      <div className="login-copyright">
        © 2026 TransGuyane · 保留所有权利
      </div>
    </div>
  );
};

export default Register;
