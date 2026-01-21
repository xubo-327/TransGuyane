import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import OrderSearchBar from '../components/OrderSearchBar';

const { Header, Content } = Layout;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 页面顺序：录入页面 → 查看页面 → 消息页面 → 批次页面
  const menuItems = [
    ...(user ? [
      {
        key: '/user/input',
        icon: <PlusOutlined />,
        label: '录入页面',
      },
    ] : []),
    {
      key: '/user/info',
      icon: <EyeOutlined />,
      label: '查看页面',
    },
    ...(user ? [
      {
        key: '/user/messages',
        icon: <MessageOutlined />,
        label: '消息页面',
      },
    ] : []),
    {
      key: '/user/batches',
      icon: <AppstoreOutlined />,
      label: '批次页面',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/user/info');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-container">
          {/* Logo区域 */}
          <div className="logo-container" onClick={() => navigate('/user/info')}>
            <img 
              src={`${process.env.PUBLIC_URL || ''}/logo.jpg`} 
              alt="TransGuyane" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div className="logo-text">TransGuyane</div>
              <div className="logo-subtitle">中法跨境物流</div>
            </div>
          </div>

          {/* 桌面端导航菜单 */}
          <div className="desktop-menu">
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="nav-menu"
            />
          </div>

          {/* 用户信息区域 */}
          <div className="user-area">
            {user && (
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: '#6B7280', fontSize: 18 }}
              />
            )}
            
            {user ? (
              <div className="user-info">
                <span className="user-name">
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4F46E5',
                    fontSize: 14
                  }}>
                    <UserOutlined />
                  </div>
                  {user.nickname || user.username || '用户'}
                </span>
                <Button 
                  type="default"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  <span className="logout-text">退出</span>
                </Button>
              </div>
            ) : (
              <Button 
                type="primary" 
                onClick={handleLogin}
                className="login-btn"
                icon={<UserOutlined />}
              >
                登录
              </Button>
            )}
            
            {/* 移动端菜单按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="mobile-menu-btn"
            />
          </div>
        </div>
      </Header>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src={`${process.env.PUBLIC_URL || ''}/logo.jpg`} 
              alt="TransGuyane" 
              style={{ width: 36, height: 36, borderRadius: 8 }}
            />
            <span style={{ fontWeight: 600, color: '#1F2937' }}>TransGuyane</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="mobile-drawer"
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #E5E7EB', 
          marginTop: 20,
          background: '#F9FAFB'
        }}>
          {user ? (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                marginBottom: 16,
                padding: '12px',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5',
                  fontSize: 16
                }}>
                  <UserOutlined />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: '#1F2937' }}>
                    {user.nickname || user.username}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>普通用户</div>
                </div>
              </div>
              <Button 
                type="default" 
                danger 
                block 
                onClick={handleLogout}
                style={{ height: 40 }}
              >
                退出登录
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              block 
              onClick={handleLogin}
              style={{ height: 40 }}
            >
              登录 / 注册
            </Button>
          )}
        </div>
      </Drawer>

      <Content className="app-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </Content>

      {/* 全局单号搜索栏 */}
      <OrderSearchBar />
    </Layout>
  );
};

export default UserLayout;
