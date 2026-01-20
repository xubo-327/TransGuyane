import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// 用户端路由
import UserInput from './pages/user/Input';
import UserInfo from './pages/user/Info';
import UserBatches from './pages/user/Batches';
import UserMessages from './pages/user/Messages';
import Register from './pages/Register';

// 管理端路由
import AdminInput from './pages/admin/Input';
import AdminInfo from './pages/admin/Info';
import AdminBatches from './pages/admin/Batches';
import AdminMessages from './pages/admin/Messages';
import AdminCustomers from './pages/admin/Customers';

// 路由保护组件（需要登录）
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: 40,
            height: 40,
            border: '3px solid #e8e8e8',
            borderTop: '3px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ color: '#666' }}>加载中...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/user/info" replace />;
  }

  return children;
};

// 可选登录路由（允许未登录访问，但部分功能需要登录）
const OptionalAuthRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e8e8e8',
            borderTop: '3px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ color: '#666' }}>加载中...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={(user.role === 'admin' || user.role === 'superadmin') ? '/admin/info' : '/user/info'} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={(user.role === 'admin' || user.role === 'superadmin') ? '/admin/info' : '/user/info'} replace />} />

      {/* 用户端路由 - 页面顺序：录入 → 查看 → 消息 → 批次 */}
      <Route path="/user" element={<OptionalAuthRoute><UserLayout /></OptionalAuthRoute>}>
        <Route path="input" element={<ProtectedRoute><UserInput /></ProtectedRoute>} />
        <Route path="info" element={<UserInfo />} />
        <Route path="messages" element={<ProtectedRoute><UserMessages /></ProtectedRoute>} />
        <Route path="batches" element={<UserBatches />} />
        {/* 默认跳转到查看页面（未登录可访问） */}
        <Route index element={<Navigate to="info" replace />} />
      </Route>

      {/* 管理端路由 - 页面顺序：录入 → 查看 → 消息 → 批次管理 → 客户管理 */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route path="input" element={<AdminInput />} />
        <Route path="info" element={<AdminInfo />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="batches" element={<AdminBatches />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route index element={<Navigate to="info" replace />} />
      </Route>

      {/* 根路径重定向 */}
      <Route path="/" element={<Navigate to="/user/info" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4F46E5',
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
