import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Popconfirm, Empty, Modal, Form, Input, Select, DatePicker, Space, Tag, Tooltip, InputNumber, Progress } from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  CalendarOutlined,
  InboxOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import { batchesAPI, exportAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  
  // 弹窗状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 导出状态
  const [exportLoading, setExportLoading] = useState(false);
  
  const navigate = useNavigate();

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText
      };
      const result = await batchesAPI.list(params);
      setBatches(result?.batches || []);
      setPagination(prev => ({ ...prev, total: result?.total || 0 }));
    } catch (error) {
      message.error(error.error || '加载批次失败');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadBatches();
  };

  const handleReset = () => {
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 }));
    loadBatches();
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  // 创建批次
  const handleCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      year: dayjs().year(),
      month: dayjs().month() + 1,
      period: '上'
    });
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        dispatchTime: values.dispatchTime ? values.dispatchTime.toISOString() : null
      };
      await batchesAPI.create(submitData);
      message.success('创建批次成功');
      setCreateModalVisible(false);
      loadBatches();
    } catch (error) {
      message.error(error.error || '创建批次失败');
    }
  };

  // 编辑批次
  const handleEdit = (record) => {
    setCurrentBatch(record);
    editForm.setFieldsValue({
      name: record.name,
      period: record.period,
      month: record.month,
      year: record.year,
      dispatchTime: record.dispatchTime ? dayjs(record.dispatchTime) : null
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        dispatchTime: values.dispatchTime ? values.dispatchTime.toISOString() : null
      };
      await batchesAPI.update(currentBatch._id, submitData);
      message.success('更新批次成功');
      setEditModalVisible(false);
      loadBatches();
    } catch (error) {
      message.error(error.error || '更新批次失败');
    }
  };

  // 删除批次
  const handleDelete = async (id) => {
    try {
      await batchesAPI.delete(id);
      message.success('删除批次成功');
      loadBatches();
    } catch (error) {
      message.error(error.error || '删除批次失败，可能还有关联订单');
    }
  };

  // 导出功能
  const handleExportSingle = async (batchId) => {
    setExportLoading(true);
    try {
      const response = await exportAPI.exportBatches([batchId]);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportSelected = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要导出的批次');
      return;
    }
    
    setExportLoading(true);
    try {
      const response = await exportAPI.exportBatches(selectedRows);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(`导出 ${selectedRows.length} 个批次成功`);
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportAll = async () => {
    setExportLoading(true);
    try {
      const response = await exportAPI.exportAllBatches();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_batches_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('导出全部批次成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 计算统计数据
  const stats = {
    total: batches.length,
    totalOrders: batches.reduce((sum, b) => sum + (b.orderCount || 0), 0),
    dispatched: batches.filter(b => b.dispatchTime).length,
    pending: batches.filter(b => !b.dispatchTime).length
  };

  const columns = [
    {
      title: '批次名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text) => (
        <span style={{ fontWeight: 600, color: '#1F2937' }}>{text}</span>
      ),
    },
    {
      title: '时期',
      dataIndex: 'period',
      key: 'period',
      width: 80,
      render: (period) => {
        const colorMap = { '上': 'blue', '中': 'green', '下': 'orange' };
        return <Tag color={colorMap[period]}>{period}</Tag>;
      },
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      className: 'hide-on-mobile',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
      render: (month) => `${month}月`,
    },
    {
      title: '订单数量',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (count = 0) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count} 单</Tag>
      ),
    },
    {
      title: '签收进度',
      key: 'progress',
      width: 180,
      className: 'hide-on-mobile',
      render: (_, record) => {
        const total = record.orderCount || 0;
        const signed = record.signedCount || 0;
        const percent = total > 0 ? Math.round((signed / total) * 100) : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress 
              percent={percent} 
              size="small" 
              strokeColor="#10B981"
              style={{ flex: 1, marginBottom: 0 }} 
            />
            <span style={{ fontSize: 12, color: '#6B7280' }}>{signed}/{total}</span>
          </div>
        );
      },
    },
    {
      title: '发货时间',
      dataIndex: 'dispatchTime',
      key: 'dispatchTime',
      width: 140,
      className: 'hide-on-mobile',
      render: (time) => (
        time ? (
          <span style={{ color: '#10B981' }}>
            <CalendarOutlined /> {dayjs(time).format('YYYY-MM-DD')}
          </span>
        ) : (
          <span style={{ color: '#9CA3AF' }}>待发货</span>
        )
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      className: 'hide-on-mobile',
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {dayjs(time).format('MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="导出">
            <Button
              type="link"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => handleExportSingle(record._id)}
              loading={exportLoading}
            />
          </Tooltip>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此批次？"
            description="删除后无法恢复，且需要确保批次内没有订单"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => {
      setSelectedRows(selectedRowKeys);
    },
  };

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="page-breadcrumb" style={{ marginBottom: 20 }}>
        <span className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> 返回
        </span>
        <span style={{ margin: '0 8px', color: '#D1D5DB' }}>/</span>
        <span className="page-title">批次管理</span>
        <Tag color="orange" style={{ marginLeft: 16, borderRadius: 6 }}>管理员</Tag>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-label">批次总数</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon primary"><FolderOpenOutlined /></div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-label">订单总数</div>
            <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
          </div>
          <div className="stat-icon info"><InboxOutlined /></div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-label">已发货</div>
            <div className="stat-value">{stats.dispatched}</div>
          </div>
          <div className="stat-icon success"><CheckCircleOutlined /></div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-label">待发货</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-icon warning"><CarOutlined /></div>
        </div>
      </div>

      {/* 搜索和操作区域 */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Input
              placeholder="搜索批次名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              allowClear
              size="large"
            />
          </div>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} className="search-btn primary">搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset} className="search-btn default">刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="search-btn">新增批次</Button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          <div style={{ color: '#6B7280', fontSize: 14 }}>
            {selectedRows.length > 0 ? `已选择 ${selectedRows.length} 个批次` : `共 ${pagination.total} 个批次`}
          </div>
          
          <Space>
            {selectedRows.length > 0 && (
              <Button icon={<ExportOutlined />} onClick={handleExportSelected} loading={exportLoading}>
                导出选中 ({selectedRows.length})
              </Button>
            )}
            <Button icon={<ExportOutlined />} onClick={handleExportAll} loading={exportLoading}>
              导出全部
            </Button>
          </Space>
        </div>
      </div>

      {/* 数据表格 */}
      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={batches}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: <Empty description="暂无批次数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </div>

      {/* 创建批次弹窗 */}
      <Modal title="新增批次" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null} width={500}>
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item name="name" label="批次名称" rules={[{ required: true, message: '请输入批次名称' }]}>
            <Input placeholder="例如：2024年1月上" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="year" label="年份" rules={[{ required: true, message: '请选择年份' }]} style={{ flex: 1 }}>
              <InputNumber min={2020} max={2030} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]} style={{ flex: 1 }}>
              <Select>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <Option key={m} value={m}>{m}月</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="period" label="时期" rules={[{ required: true, message: '请选择时期' }]} style={{ flex: 1 }}>
              <Select>
                <Option value="上">上</Option>
                <Option value="中">中</Option>
                <Option value="下">下</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="dispatchTime" label="发货时间">
            <DatePicker style={{ width: '100%' }} placeholder="选择发货时间" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑批次弹窗 */}
      <Modal title="编辑批次" open={editModalVisible} onCancel={() => setEditModalVisible(false)} footer={null} width={500}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="name" label="批次名称" rules={[{ required: true, message: '请输入批次名称' }]}>
            <Input placeholder="例如：2024年1月上" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="year" label="年份" rules={[{ required: true, message: '请选择年份' }]} style={{ flex: 1 }}>
              <InputNumber min={2020} max={2030} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]} style={{ flex: 1 }}>
              <Select>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <Option key={m} value={m}>{m}月</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="period" label="时期" rules={[{ required: true, message: '请选择时期' }]} style={{ flex: 1 }}>
              <Select>
                <Option value="上">上</Option>
                <Option value="中">中</Option>
                <Option value="下">下</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="dispatchTime" label="发货时间">
            <DatePicker style={{ width: '100%' }} placeholder="选择发货时间" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBatches;
