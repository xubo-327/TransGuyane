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
  TeamOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import OrderSearchBar from '../components/OrderSearchBar';

const { Header, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 页面顺序：录入页面 → 查看页面 → 消息页面 → 批次管理 → 客户管理
  const menuItems = [
    {
      key: '/admin/input',
      icon: <PlusOutlined />,
      label: '录入页面',
    },
    {
      key: '/admin/info',
      icon: <EyeOutlined />,
      label: '查看页面',
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: '消息页面',
    },
    {
      key: '/admin/batches',
      icon: <AppstoreOutlined />,
      label: '批次管理',
    },
    {
      key: '/admin/customers',
      icon: <TeamOutlined />,
      label: '客户管理',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-container">
          {/* Logo区域 */}
          <div className="logo-container" onClick={() => navigate('/admin/info')}>
            <img 
              src="/logo.jpg" 
              alt="TransGuyane" 
              className="logo-image"
            />
            <div>
              <div className="logo-text">TransGuyane</div>
              <div className="logo-subtitle">管理端 · Admin</div>
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
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: '#6B7280', fontSize: 18 }}
            />
            
            <div className="user-info">
              <span className="user-name">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706',
                  fontSize: 14
                }}>
                  <UserOutlined />
                </div>
                {user?.nickname || '管理员'}
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
              src="/logo.jpg" 
              alt="TransGuyane" 
              style={{ width: 36, height: 36, borderRadius: 8 }}
            />
            <div>
              <span style={{ fontWeight: 600, color: '#1F2937' }}>TransGuyane</span>
              <div style={{ fontSize: 12, color: '#D97706' }}>管理端</div>
            </div>
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
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
              fontSize: 16
            }}>
              <UserOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#1F2937' }}>
                {user?.nickname || '管理员'}
              </div>
              <div style={{ fontSize: 12, color: '#D97706' }}>系统管理员</div>
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

export default AdminLayout;
