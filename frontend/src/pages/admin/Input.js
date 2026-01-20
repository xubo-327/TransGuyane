import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Card, List, Tag, Space, Empty } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  SendOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { ordersAPI, batchesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { detectCourier } from '../../utils/courierDetector';

const { TextArea } = Input;
const { Option } = Select;

const AdminInput = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [orderNumbers, setOrderNumbers] = useState([]);
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const result = await batchesAPI.list({ page: 1, pageSize: 100 });
      setBatches(result?.batches || []);
    } catch (error) {
      console.error('加载批次失败:', error);
    }
  };

  // 解析输入的单号
  const parseOrderNumbers = (text) => {
    if (!text.trim()) return [];
    
    // 支持多种分隔符：换行、逗号、分号、空格
    const numbers = text
      .split(/[\n,;，；\s]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    // 去重
    return [...new Set(numbers)];
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setOrderNumbers(parseOrderNumbers(text));
  };

  const handleRemoveOrder = (orderNumber) => {
    const newNumbers = orderNumbers.filter(num => num !== orderNumber);
    setOrderNumbers(newNumbers);
    setInputText(newNumbers.join('\n'));
  };

  const handleSubmit = async (values) => {
    if (orderNumbers.length === 0) {
      message.warning('请输入至少一个单号');
      return;
    }

    setLoading(true);
    try {
      const result = await ordersAPI.adminImport({
        batchId: values.batchId,
        customerName: values.customerName,
        orderNumbers: orderNumbers
      });
      
      message.success(result.message || `成功导入 ${orderNumbers.length} 个订单`);
      form.resetFields();
      setInputText('');
      setOrderNumbers([]);
    } catch (error) {
      message.error(error.error || '导入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getCourierBadge = (orderNumber) => {
    const courier = detectCourier(orderNumber);
    const code = courier?.code || 'default';
    const name = courier?.name || '未识别';
    const initial = name.charAt(0);
    
    return (
      <span className={`courier-badge courier-${code.toLowerCase()}`}>
        <span className="courier-icon">{initial}</span>
        {name}
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
        <span className="page-title">管理员录入</span>
        <Tag 
          icon={<InboxOutlined />} 
          color="orange" 
          style={{ marginLeft: 16, borderRadius: 6 }}
        >
          批量导入
        </Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 录入表单 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusOutlined style={{ color: '#4F46E5' }} />
              <span>批量录入单号</span>
            </div>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="batchId"
              label="选择批次"
              rules={[{ required: true, message: '请选择批次' }]}
            >
              <Select 
                placeholder="选择要导入的批次" 
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {batches.map(batch => (
                  <Option key={batch._id} value={batch._id}>
                    {batch.name} ({batch.orderCount || 0}个订单)
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="customerName"
              label="客户姓名"
              rules={[{ required: true, message: '请输入客户姓名' }]}
            >
              <Input 
                placeholder="请输入客户姓名" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={`单号列表 (已识别 ${orderNumbers.length} 个)`}
              required
            >
              <TextArea
                value={inputText}
                onChange={handleInputChange}
                placeholder="请输入单号，支持以下格式：&#10;1. 每行一个单号&#10;2. 用逗号、分号或空格分隔"
                rows={8}
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                size="large"
                block
                disabled={orderNumbers.length === 0}
              >
                批量导入 ({orderNumbers.length} 个单号)
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 预览列表 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InboxOutlined style={{ color: '#10B981' }} />
                <span>单号预览</span>
              </div>
              <Tag color="blue">{orderNumbers.length} 个单号</Tag>
            </div>
          }
          bodyStyle={{ 
            maxHeight: 500, 
            overflow: 'auto',
            padding: orderNumbers.length === 0 ? 40 : 16
          }}
        >
          {orderNumbers.length > 0 ? (
            <List
              className="preview-list"
              dataSource={orderNumbers}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveOrder(item)}
                      size="small"
                    >
                      删除
                    </Button>
                  ]}
                >
                  <Space>
                    <span style={{ 
                      color: '#9CA3AF', 
                      minWidth: 30, 
                      textAlign: 'right' 
                    }}>
                      {index + 1}.
                    </span>
                    <span className="order-number">{item}</span>
                    {getCourierBadge(item)}
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description={
                <span style={{ color: '#9CA3AF' }}>
                  请在左侧输入单号
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminInput;
