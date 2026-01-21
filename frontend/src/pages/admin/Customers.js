import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  message, 
  Tag, 
  Space, 
  Card, 
  Modal,
  Avatar,
  Empty,
  Tooltip,
  Select,
  Drawer,
  List,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  ArrowLeftOutlined, 
  ReloadOutlined,
  UserOutlined,
  MessageOutlined,
  SendOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { usersAPI, messagesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const navigate = useNavigate();
  const { user } = useAuth();

  // 消息相关状态
  const [messageDrawerVisible, setMessageDrawerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (searchText) params.search = searchText;
      if (roleFilter) params.role = roleFilter;

      const result = await usersAPI.list(params);
      setCustomers(result.users || []);
      setPagination(prev => ({ ...prev, total: result.total || 0 }));
    } catch (error) {
      message.error(error.error || '加载客户列表失败');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, roleFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (selectedCustomer) {
      loadMessages(selectedCustomer._id);
      const interval = setInterval(() => {
        loadMessages(selectedCustomer._id, false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadMessages = async (userId, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const result = await messagesAPI.getMessages(userId);
      setMessages(result || []);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadCustomers();
  };

  const handleReset = () => {
    setSearchText('');
    setRoleFilter('');
    setPagination(prev => ({ ...prev, current: 1 }));
    loadCustomers();
  };

  const handleTableChange = (pag) => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const openMessageDrawer = (customer) => {
    setSelectedCustomer(customer);
    setMessageDrawerVisible(true);
    setMessages([]);
  };

  const closeMessageDrawer = () => {
    setMessageDrawerVisible(false);
    setSelectedCustomer(null);
    setMessages([]);
    setMessageContent('');
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    setSendingMessage(true);
    try {
      await messagesAPI.send({
        to: selectedCustomer._id,
        content: messageContent.trim(),
      });
      setMessageContent('');
      loadMessages(selectedCustomer._id, false);
      message.success('消息发送成功');
    } catch (error) {
      message.error(error.error || '发送失败');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      message.success('角色更新成功');
      loadCustomers();
    } catch (error) {
      message.error(error.error || '更新角色失败');
    }
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: record.role === 'admin' ? '#faad14' : '#4F46E5' }}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500, color: '#1F2937' }}>
              {record.nickname || record.username || '未命名用户'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
              ID: {record._id?.slice(-8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      className: 'hide-on-mobile',
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      className: 'hide-on-mobile',
      render: (_, record) => (
        <div>
          {record.email && <div style={{ fontSize: 13 }}>📧 {record.email}</div>}
          {record.phone && <div style={{ fontSize: 13 }}>📱 {record.phone}</div>}
          {!record.email && !record.phone && <span style={{ color: '#9CA3AF' }}>暂无</span>}
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role, record) => (
        <Select
          value={role}
          size="small"
          style={{ width: 110 }}
          onChange={(value) => handleChangeRole(record._id, value)}
          disabled={record._id === user?.id}
        >
          <Option value="user">普通用户</Option>
          <Option value="admin">管理员</Option>
        </Select>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      className: 'hide-on-mobile',
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {dayjs(time).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Tooltip title="发送消息">
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => openMessageDrawer(record)}
            style={{ borderRadius: 6 }}
          >
            消息
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="page-breadcrumb" style={{ marginBottom: 20 }}>
        <span className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> 返回
        </span>
        <span style={{ margin: '0 8px', color: '#D1D5DB' }}>/</span>
        <span className="page-title">客户管理</span>
        <Tag 
          icon={<TeamOutlined />} 
          color="blue" 
          style={{ marginLeft: 16, borderRadius: 6 }}
        >
          共 {pagination.total} 个客户
        </Tag>
      </div>

      {/* 搜索区域 */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Input
              placeholder="搜索用户名、昵称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              allowClear
              size="large"
            />
          </div>
          <Select
            placeholder="角色筛选"
            value={roleFilter || undefined}
            onChange={(value) => setRoleFilter(value)}
            allowClear
            style={{ width: 140 }}
            size="large"
          >
            <Option value="user">普通用户</Option>
            <Option value="admin">管理员</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleSearch}
            className="search-btn primary"
          >
            搜索
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            className="search-btn default"
          >
            重置
          </Button>
        </div>
      </div>

      {/* 客户列表 */}
      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') return <span style={{ padding: '0 8px', cursor: 'pointer' }}>← 上一页</span>;
              if (type === 'next') return <span style={{ padding: '0 8px', cursor: 'pointer' }}>下一页 →</span>;
              return originalElement;
            },
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty 
                description={<span style={{ color: '#9CA3AF' }}>暂无客户数据</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>

      {/* 消息抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#4F46E5' }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>
                {selectedCustomer?.nickname || selectedCustomer?.username || '用户'}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' }}>
                发送消息
              </div>
            </div>
          </div>
        }
        placement="right"
        width={420}
        onClose={closeMessageDrawer}
        open={messageDrawerVisible}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100% - 55px)' }}
      >
        {/* 消息列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#F9FAFB' }}>
          <Spin spinning={loadingMessages}>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: msg.from._id === user?.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: msg.from._id === user?.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: msg.from._id === user?.id ? '#4F46E5' : '#fff',
                      color: msg.from._id === user?.id ? '#fff' : '#1F2937',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ wordBreak: 'break-word', lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7, textAlign: 'right' }}>
                      {dayjs(msg.createdAt).format('MM-DD HH:mm:ss')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                暂无消息记录，发送第一条消息开始对话
              </div>
            )}
            <div ref={messagesEndRef} />
          </Spin>
        </div>

        {/* 输入区域 */}
        <div style={{ padding: 16, borderTop: '1px solid #E5E7EB', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Input.TextArea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="输入消息... (Enter发送, Shift+Enter换行)"
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ flex: 1, borderRadius: 8 }}
              disabled={sendingMessage}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage}
              loading={sendingMessage}
              style={{ borderRadius: 8, height: 'auto', minHeight: 56 }}
            >
              发送
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AdminCustomers;
