import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Switch } from 'antd';
import { UserOutlined, LockOutlined, WechatOutlined, ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login, wechatLogin } = useAuth();
  const navigate = useNavigate();

  // 账号密码登录
  const handleAccountLogin = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.username, values.password);
      message.success('登录成功！');
      
      // 根据用户角色跳转到对应页面
      if (response.user.role === 'admin' || response.user.role === 'superadmin') {
        navigate('/admin/info');
      } else {
        navigate('/user/info');
      }
    } catch (error) {
      message.error(error.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 微信登录处理
  const handleWechatLogin = async () => {
    setWechatLoading(true);
    try {
      const mockCode = `mock_code_${Date.now()}`;
      
      try {
        const response = await wechatLogin(mockCode, {
          nickname: '微信测试用户',
          avatar: ''
        });
        message.success('登录成功');
        
        // 根据用户角色跳转到对应页面
        if (response.user.role === 'admin' || response.user.role === 'superadmin') {
          navigate('/admin/info');
        } else {
          navigate('/user/info');
        }
      } catch (error) {
        message.error(error.error || '登录失败');
      } finally {
        setWechatLoading(false);
      }
    } catch (error) {
      message.error('登录失败，请重试');
      setWechatLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'account',
      label: '账号登录',
      children: (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAccountLogin}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="用户名/邮箱/手机号"
              rules={[{ required: true, message: '请输入用户名、邮箱或手机号' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入用户名、邮箱或手机号"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="请输入密码"
                size="large"
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
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <span>还没有账户？</span>
            <Link to="/register">立即注册</Link>
          </div>
        </>
      ),
    },
    {
      key: 'wechat',
      label: '微信登录',
      children: (
        <div className="wechat-login-section">
          <div className="wechat-icon-wrapper">
            <WechatOutlined style={{ fontSize: 48, color: '#07C160' }} />
          </div>
          <Button
            type="default"
            size="large"
            icon={<WechatOutlined />}
            onClick={handleWechatLogin}
            loading={wechatLoading}
            className="wechat-button"
            block
          >
            微信一键登录
          </Button>
          <p className="login-note">
            使用微信扫码或授权登录
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="login-container">
      {/* 背景装饰 */}
      <div className="login-bg-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
      
      <Card className="login-card">
        {/* 返回按钮 */}
        <div className="login-back" onClick={() => navigate('/user/info')}>
          <ArrowLeftOutlined /> 返回首页
        </div>

        <div className="login-content">
          {/* Logo区域 */}
          <div className="login-logo">
            <img 
              src={`${process.env.PUBLIC_URL || ''}/logo.jpg`} 
              alt="TransGuyane" 
              className="login-logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="logo-title">TransGuyane</h1>
            <p className="logo-subtitle">中国——法属圭亚那跨境物流</p>
          </div>
          
          <p className="login-welcome">欢迎回来，请登录您的账户</p>
          
          {/* 管理员登录切换 */}
          <div className="admin-mode-switch">
            <div className="switch-label">
              <SafetyOutlined style={{ marginRight: 8, color: isAdminMode ? '#4F46E5' : '#9CA3AF' }} />
              <span style={{ color: isAdminMode ? '#4F46E5' : '#6B7280', fontWeight: isAdminMode ? 600 : 400 }}>
                管理员登录模式
              </span>
            </div>
            <Switch
              checked={isAdminMode}
              onChange={setIsAdminMode}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </div>
          
          {isAdminMode && (
            <div className="admin-mode-tip">
              <SafetyOutlined style={{ marginRight: 6 }} />
              已启用管理员登录模式，请使用管理员账号登录
            </div>
          )}
          
          <Tabs 
            defaultActiveKey="account" 
            centered 
            items={tabItems}
            className="login-tabs"
          />
        </div>
      </Card>

      {/* 底部版权 */}
      <div className="login-copyright">
        © 2026 TransGuyane · 保留所有权利
      </div>
    </div>
  );
};

export default Login;
