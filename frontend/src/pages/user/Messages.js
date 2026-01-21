import React, { useState, useEffect, useRef, useCallback } from 'react';
import { List, Input, Button, Card, Avatar, message, Tag, Empty, Spin, Modal, AutoComplete } from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  ArrowLeftOutlined,
  MessageOutlined,
  CommentOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { messagesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const UserMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 新建对话状态
  const [newConversationVisible, setNewConversationVisible] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const result = await messagesAPI.getConversations();
      setConversations(result);
      if (result.length > 0 && !selectedUserId) {
        setSelectedUserId(result[0].userId);
      }
    } catch (error) {
      console.error('加载对话列表失败:', error);
    }
  }, [selectedUserId]);

  const loadMessages = useCallback(async (userId, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await messagesAPI.getMessages(userId);
      setMessages(result);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      const interval = setInterval(() => {
        loadMessages(selectedUserId, false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!content.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    setSending(true);
    try {
      await messagesAPI.send({
        to: selectedUserId,
        content: content.trim(),
      });
      setContent('');
      loadMessages(selectedUserId, false);
      loadConversations();
    } catch (error) {
      message.error(error.error || '发送失败');
    } finally {
      setSending(false);
    }
  };

  // 搜索用户
  const handleUserSearch = async (value) => {
    if (!value.trim()) {
      setSearchUsers([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const result = await usersAPI.search(value);
      setSearchUsers(result.map(u => ({
        value: u._id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} src={u.avatar} />
            <span>{u.nickname || u.username}</span>
            {u.role === 'admin' && <Tag color="gold" size="small">管理员</Tag>}
          </div>
        ),
        user: u
      })));
    } catch (error) {
      console.error('搜索用户失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 选择用户
  const handleSelectUser = (value, option) => {
    setSelectedUser(option.user);
  };

  // 创建新对话
  const handleCreateConversation = async () => {
    if (!selectedUser) {
      message.warning('请选择要对话的用户');
      return;
    }

    try {
      const result = await messagesAPI.createConversation(selectedUser._id);
      
      // 检查是否已存在对话
      const existingConversation = conversations.find(c => c.userId === selectedUser._id);
      
      if (!existingConversation) {
        // 添加新对话到列表
        setConversations(prev => [{
          userId: selectedUser._id,
          user: result.user,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0
        }, ...prev]);
      }
      
      setSelectedUserId(selectedUser._id);
      setNewConversationVisible(false);
      setSelectedUser(null);
      setSearchUsers([]);
      
      message.success(result.isNew ? '已创建新对话' : '已切换到该对话');
    } catch (error) {
      message.error(error.error || '创建对话失败');
    }
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="page-breadcrumb" style={{ marginBottom: 20 }}>
        <span className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> 返回
        </span>
        <span style={{ margin: '0 8px', color: '#D1D5DB' }}>/</span>
        <span className="page-title">消息页面</span>
        <Tag 
          icon={<MessageOutlined />} 
          color="blue" 
          style={{ marginLeft: 16, borderRadius: 6 }}
        >
          {conversations.length} 个对话
        </Tag>
      </div>

      <div className="message-container" style={{ display: 'flex', gap: 20, height: 600 }}>
        {/* 对话列表 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CommentOutlined style={{ color: '#4F46E5' }} />
                <span>对话列表</span>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setNewConversationVisible(true)}
              >
                新建
              </Button>
            </div>
          }
          className="conversation-list"
          style={{ width: 300, height: '100%', overflow: 'hidden' }}
          bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
        >
          {conversations.length > 0 ? (
            <List
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === conversation.userId ? '#EEF2FF' : '#fff',
                    padding: '14px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    borderLeft: selectedUserId === conversation.userId ? '3px solid #4F46E5' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedUserId(conversation.userId)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={conversation.user?.avatar}
                        style={{ backgroundColor: '#4F46E5' }}
                        size={40}
                      />
                    }
                    title={
                      <span style={{ fontWeight: 500, color: '#1F2937' }}>
                        {conversation.user?.nickname || conversation.user?.username || '管理员'}
                      </span>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                          {dayjs(conversation.lastMessageTime).format('MM-DD HH:mm')}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Tag 
                            color="red" 
                            style={{ 
                              marginLeft: 4, 
                              fontSize: 11, 
                              borderRadius: 10,
                              minWidth: 20,
                              textAlign: 'center'
                            }}
                          >
                            {conversation.unreadCount}
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Empty 
                description={<span style={{ color: '#9CA3AF' }}>暂无对话</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setNewConversationVisible(true)}
                style={{ marginTop: 16 }}
              >
                创建新对话
              </Button>
            </div>
          )}
        </Card>

        {/* 聊天区域 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageOutlined style={{ color: '#10B981' }} />
              <span>
                {selectedConversation 
                  ? `与 ${selectedConversation.user?.nickname || selectedConversation.user?.username || '管理员'} 的对话` 
                  : '选择对话'}
              </span>
            </div>
          }
          className="chat-area"
          style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            padding: 0,
            height: 'calc(100% - 57px)',
            overflow: 'hidden'
          }}
        >
          {selectedUserId ? (
            <>
              {/* 消息列表 */}
              <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#F9FAFB' }}>
                <Spin spinning={loading}>
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
                            maxWidth: '70%',
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
                          <div
                            style={{
                              fontSize: 11,
                              marginTop: 6,
                              opacity: 0.7,
                              textAlign: 'right',
                            }}
                          >
                            {dayjs(msg.createdAt).format('HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                      暂无消息，发送第一条消息开始对话吧
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </Spin>
              </div>

              {/* 输入区域 */}
              <div style={{ 
                padding: 16, 
                borderTop: '1px solid #E5E7EB',
                background: '#fff'
              }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPressEnter={handleSend}
                    placeholder="输入消息..."
                    style={{ flex: 1, borderRadius: 8 }}
                    disabled={sending}
                    size="large"
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={handleSend}
                    loading={sending}
                    size="large"
                    style={{ borderRadius: 8, paddingLeft: 20, paddingRight: 20 }}
                  >
                    发送
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#F9FAFB'
            }}>
              <Empty 
                description={<span style={{ color: '#9CA3AF' }}>请选择一个对话</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Card>
      </div>

      {/* 新建对话弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined style={{ color: '#4F46E5' }} />
            <span>新建对话</span>
          </div>
        }
        open={newConversationVisible}
        onCancel={() => {
          setNewConversationVisible(false);
          setSelectedUser(null);
          setSearchUsers([]);
        }}
        onOk={handleCreateConversation}
        okText="创建对话"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>搜索用户</div>
          <AutoComplete
            style={{ width: '100%' }}
            options={searchUsers}
            onSearch={handleUserSearch}
            onSelect={handleSelectUser}
            placeholder="输入用户名或昵称搜索..."
            notFoundContent={searchLoading ? <Spin size="small" /> : '未找到用户'}
          />
        </div>
        
        {selectedUser && (
          <div style={{ 
            padding: 16, 
            background: '#F9FAFB', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <Avatar icon={<UserOutlined />} src={selectedUser.avatar} size={48} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>
                {selectedUser.nickname || selectedUser.username}
              </div>
              {selectedUser.role === 'admin' && (
                <Tag color="gold">管理员</Tag>
              )}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: 16, fontSize: 13, color: '#9CA3AF' }}>
          提示：普通用户只能与管理员创建对话
        </div>
      </Modal>
    </div>
  );
};

export default UserMessages;
