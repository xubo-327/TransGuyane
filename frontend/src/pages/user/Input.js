import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, message, Card, List, Tag, Empty, Tooltip } from 'antd';
import { 
  ArrowLeftOutlined, 
  SendOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { detectCourier } from '../../utils/courierDetector';

const { TextArea } = Input;

const UserInput = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderNumbersText, setOrderNumbersText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      message.warning('请先登录后再申报数据');
      navigate('/login');
    }
  }, [user, navigate]);

  // 解析并识别单号
  const parsedOrders = useMemo(() => {
    if (!orderNumbersText.trim()) return [];
    
    const numbers = orderNumbersText
      .split(/[\n,，;；\s]+/)
      .map(num => num.trim())
      .filter(num => num.length >= 8);
    
    const uniqueNumbers = [...new Set(numbers)];
    
    return uniqueNumbers.map(number => ({
      number,
      courier: detectCourier(number),
    }));
  }, [orderNumbersText]);

  // 统计快递公司
  const courierStats = useMemo(() => {
    const stats = {};
    parsedOrders.forEach(order => {
      const name = order.courier?.name || '未识别';
      stats[name] = (stats[name] || 0) + 1;
    });
    return stats;
  }, [parsedOrders]);

  const handleSubmit = async (values) => {
    if (parsedOrders.length === 0) {
      message.warning('请输入至少一个有效单号');
      return;
    }

    setLoading(true);
    try {
      const orderNumbers = parsedOrders.map(o => o.number);
      
      const result = await ordersAPI.create({
        customerName: values.customerName,
        orderNumbers,
      });

      message.success(result.message || `成功提交 ${orderNumbers.length} 个单号`);
      form.resetFields();
      setOrderNumbersText('');
      
      setTimeout(() => {
        navigate('/user/info');
      }, 1500);
    } catch (error) {
      message.error(error.error || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOrder = (numberToRemove) => {
    const numbers = orderNumbersText
      .split(/[\n,，;；\s]+/)
      .filter(num => num.trim() && num.trim() !== numberToRemove);
    setOrderNumbersText(numbers.join('\n'));
  };

  const getCourierBadge = (courier) => {
    if (!courier) {
      return (
        <Tooltip title="无法识别快递公司，请检查单号是否正确">
          <span className="courier-badge courier-default">
            <span className="courier-icon">?</span>
            未识别
          </span>
        </Tooltip>
      );
    }
    const initial = courier.name.charAt(0);
    return (
      <span className={`courier-badge courier-${courier.code.toLowerCase()}`}>
        <span className="courier-icon">{initial}</span>
        {courier.name}
      </span>
    );
  };

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="page-breadcrumb" style={{ marginBottom: 20 }}>
        <span className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> 返回
        </span>
        <span style={{ margin: '0 8px', color: '#D1D5DB' }}>/</span>
        <span className="page-title">录入页面</span>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* 左侧表单 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: '#4F46E5' }} />
              <span>订单信息录入</span>
            </div>
          }
          style={{ flex: '1 1 450px', minWidth: 300 }}
          extra={
            <Tag color="blue" style={{ margin: 0 }}>
              已输入 {parsedOrders.length} 个单号
            </Tag>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="客户姓名"
              name="customerName"
              rules={[{ required: true, message: '请输入客户姓名' }]}
            >
              <Input 
                placeholder="请输入客户姓名" 
                size="large"
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  快递单号 
                  <Tooltip title="支持自动识别：顺丰、韵达、中通、圆通、申通、京东、EMS等主流快递">
                    <QuestionCircleOutlined style={{ color: '#9CA3AF', cursor: 'help' }} />
                  </Tooltip>
                </span>
              }
              required
              extra={
                <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                  支持换行、逗号、分号分隔多个单号，系统会自动识别快递公司
                </span>
              }
            >
              <TextArea
                rows={8}
                placeholder={`请输入或粘贴快递单号，每行一个或用逗号分隔\n\n例如：\nSF1234567890123\nYT1234567890123456\n773012345678901`}
                value={orderNumbersText}
                onChange={(e) => setOrderNumbersText(e.target.value)}
                style={{ fontFamily: 'monospace', borderRadius: 8 }}
              />
            </Form.Item>

            {/* 快递公司统计 */}
            {Object.keys(courierStats).length > 0 && (
              <div style={{ 
                marginBottom: 20, 
                padding: 16, 
                background: '#F9FAFB', 
                borderRadius: 8,
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ marginBottom: 10, fontWeight: 500, fontSize: 13, color: '#6B7280' }}>
                  📊 快递公司统计
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.entries(courierStats).map(([name, count]) => (
                    <Tag 
                      key={name} 
                      color={name === '未识别' ? 'default' : 'blue'}
                      style={{ borderRadius: 6, padding: '2px 10px' }}
                    >
                      {name}: {count}个
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                size="large" 
                block
                icon={<SendOutlined />}
                disabled={parsedOrders.length === 0}
                style={{ 
                  height: 48, 
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: 15
                }}
              >
                提交 {parsedOrders.length > 0 ? `(${parsedOrders.length}个单号)` : ''}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 右侧预览 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#10B981' }} />
              <span>单号预览与识别</span>
            </div>
          }
          style={{ flex: '1 1 400px', minWidth: 300, maxHeight: 650, overflow: 'auto' }}
          extra={
            parsedOrders.length > 0 && (
              <Button 
                type="link" 
                danger 
                size="small"
                onClick={() => setOrderNumbersText('')}
              >
                清空全部
              </Button>
            )
          }
        >
          {parsedOrders.length === 0 ? (
            <Empty 
              description={
                <span style={{ color: '#9CA3AF' }}>请在左侧输入快递单号</span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              className="preview-list"
              size="small"
              dataSource={parsedOrders}
              renderItem={(item, index) => (
                <List.Item
                  style={{
                    padding: '12px',
                    marginBottom: 8,
                    background: item.courier ? '#F0FDF4' : '#FFFBEB',
                    borderRadius: 8,
                    border: `1px solid ${item.courier ? '#BBF7D0' : '#FDE68A'}`
                  }}
                  actions={[
                    <Tooltip title="移除此单号" key="delete">
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveOrder(item.number)}
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: 6, 
                        background: item.courier ? '#10B981' : '#F59E0B',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {item.courier ? <CheckCircleOutlined /> : index + 1}
                      </div>
                    }
                    title={
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500 }}>
                        {item.number}
                      </span>
                    }
                    description={getCourierBadge(item.courier)}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserInput;
