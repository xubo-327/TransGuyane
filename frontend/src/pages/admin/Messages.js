import React, { useState, useEffect, useRef, useCallback } from 'react';
import { List, Input, Button, Card, Avatar, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const AdminMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

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

  const loadMessages = useCallback(async (userId) => {
    try {
      const result = await messagesAPI.getMessages(userId);
      setMessages(result);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      const interval = setInterval(() => {
        loadMessages(selectedUserId);
      }, 3000);
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

    try {
      await messagesAPI.send({
        to: selectedUserId,
        content: content.trim(),
      });
      setContent('');
      loadMessages(selectedUserId);
      loadConversations();
    } catch (error) {
      message.error(error.error || '发送失败');
    }
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
      <Card
        title="对话列表"
        style={{ width: '300px', height: '100%', overflow: 'auto' }}
      >
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: selectedUserId === conversation.userId ? '#e6f7ff' : '#fff',
              }}
              onClick={() => setSelectedUserId(conversation.userId)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={conversation.user?.nickname || '用户'}
                description={
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {dayjs(conversation.lastMessageTime).format('MM-DD HH:mm')}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={selectedConversation ? `与 ${selectedConversation.user?.nickname || '用户'} 的对话` : '选择对话'}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {selectedUserId ? (
          <>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: msg.from._id === user?.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      backgroundColor: msg.from._id === user?.id ? '#1890ff' : '#f0f0f0',
                      color: msg.from._id === user?.id ? '#fff' : '#333',
                    }}
                  >
                    <div>{msg.content}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        marginTop: '5px',
                        opacity: 0.7,
                      }}
                    >
                      {dayjs(msg.createdAt).format('HH:mm:ss')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #f0f0f0' }}>
              <Input.Group compact>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPressEnter={handleSend}
                  placeholder="输入消息..."
                  style={{ width: 'calc(100% - 80px)' }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                  发送
                </Button>
              </Input.Group>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            请选择一个对话
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminMessages;
