import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, message, Tooltip, Empty, Modal, Form, Select, Space, Popconfirm, Tag, Timeline, Spin, Drawer } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EnvironmentOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ordersAPI, batchesAPI, logisticsAPI } from '../../services/api';
import { detectCourier } from '../../utils/courierDetector';
import { useAuth } from '../../contexts/AuthContext';
import { formatCustomerName } from '../../utils/customerNameUtils';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AdminInfo = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [batches, setBatches] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // 物流信息抽屉
  const [logisticsDrawerVisible, setLogisticsDrawerVisible] = useState(false);
  const [logisticsData, setLogisticsData] = useState(null);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);

  const navigate = useNavigate();

  const loadBatches = useCallback(async () => {
    try {
      const result = await batchesAPI.list({ page: 1, pageSize: 100 });
      setBatches(result?.batches || []);
    } catch (error) {
      console.error('加载批次失败:', error);
    }
  }, []);

  const loadOrders = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        search: search || searchText
      };

      if (activeFilter !== 'all') {
        const statusMap = { 'onWay': '在路上', 'signed': '已签收', 'sent': '已发出' };
        params.status = statusMap[activeFilter];
      }

      const result = await ordersAPI.adminList(params);
      setOrders(result?.orders || []);
      setTotal(result?.total || 0);
    } catch (error) {
      message.error(error.error || '加载数据失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeFilter, searchText]);

  useEffect(() => {
    loadOrders();
    loadBatches();
  }, [loadOrders, loadBatches]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText('');
    setActiveFilter('all');
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleTableChange = (newPagination) => {
    setCurrentPage(newPagination.current);
    setPageSize(newPagination.pageSize);
  };

  // 统计数据
  const stats = useMemo(() => {
    const totalOrders = total;
    const signed = orders.filter(o => o.status === '已签收').length;
    const onWay = orders.filter(o => o.status === '在路上').length;
    const sent = orders.filter(o => o.status === '已发出').length;
    return { total: totalOrders, signed, onWay, sent };
  }, [orders, total]);

  // 创建订单
  const handleCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      await ordersAPI.adminCreate(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      loadOrders();
    } catch (error) {
      message.error(error.error || '创建失败');
    }
  };

  // 编辑订单
  const handleEdit = (record) => {
    setCurrentOrder(record);
    editForm.setFieldsValue({
      orderNumber: record.orderNumber,
      customerName: record.customerName,
      batchId: record.batch?._id || record.batch,
      status: record.status,
      logisticsInfo: record.logisticsInfo,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await ordersAPI.adminUpdate(currentOrder._id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      loadOrders();
    } catch (error) {
      message.error(error.error || '更新失败');
    }
  };

  // 删除订单
  const handleDelete = async (id) => {
    try {
      await ordersAPI.adminDelete(id);
      message.success('删除成功');
      loadOrders();
    } catch (error) {
      message.error(error.error || '删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的订单');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRows.length} 个订单吗？`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await ordersAPI.adminBatchDelete(selectedRows);
          message.success(`成功删除 ${selectedRows.length} 个订单`);
          setSelectedRows([]);
          loadOrders();
        } catch (error) {
          message.error(error.error || '批量删除失败');
        }
      },
    });
  };

  // 查看物流信息
  const handleViewLogistics = async (record) => {
    setLogisticsDrawerVisible(true);
    setLogisticsLoading(true);
    setLogisticsData(null);

    try {
      const result = await logisticsAPI.query(record.orderNumber);
      setLogisticsData({
        ...result,
        orderNumber: record.orderNumber,
        customerName: record.customerName,
        batchName: record.batchName
      });
    } catch (error) {
      message.error('查询物流信息失败');
      setLogisticsData({
        orderNumber: record.orderNumber,
        error: true,
        latestInfo: record.logisticsInfo || '暂无物流信息'
      });
    } finally {
      setLogisticsLoading(false);
    }
  };

  // 刷新单个订单物流
  const handleRefreshLogistics = async (record) => {
    setRefreshingId(record._id);
    try {
      const result = await logisticsAPI.refresh(record._id);
      message.success('物流信息已更新');

      // 更新表格中的数据
      setOrders(prev => prev.map(o =>
        o._id === record._id
          ? { ...o, logisticsInfo: result.order.logisticsInfo, status: result.order.status }
          : o
      ));
    } catch (error) {
      message.error(error.error || '刷新失败');
    } finally {
      setRefreshingId(null);
    }
  };

  // 批量刷新物流
  const handleBatchRefresh = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要刷新的订单');
      return;
    }

    setLoading(true);
    try {
      const result = await logisticsAPI.batchQuery(selectedRows);
      message.success(`成功刷新 ${result.successCount} 个订单的物流信息`);
      loadOrders();
    } catch (error) {
      message.error(error.error || '批量刷新失败');
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

  const getStatusTag = (status) => {
    const config = {
      '在路上': { className: 'processing', text: '在途中' },
      '已签收': { className: 'success', text: '已签收' },
      '已发出': { className: 'warning', text: '已发出' },
    };
    const { className, text } = config[status] || { className: 'processing', text: status };

    return (
      <span className={`status-tag ${className}`}>
        <span className="status-dot"></span>
        {text}
      </span>
    );
  };

  const columns = [
    {
      title: '单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      render: (text) => <span className="order-number">{text}</span>,
    },
    {
      title: '快递公司',
      dataIndex: 'orderNumber',
      key: 'courier',
      width: 110,
      responsive: ['sm'],
      render: (orderNumber) => getCourierBadge(orderNumber),
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 80,
      render: (customerName, record) => formatCustomerName(customerName, user, record),
    },
    {
      title: '批次',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 100,
      responsive: ['md'],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => getStatusTag(status),
    },
    {
      title: '物流',
      dataIndex: 'logisticsInfo',
      key: 'logisticsInfo',
      ellipsis: true,
      responsive: ['lg'],
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title={text || '暂无信息'}>
            <span
              style={{
                color: text ? '#1F2937' : '#9CA3AF',
                cursor: 'pointer',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              onClick={() => handleViewLogistics(record)}
            >
              {text || '点击查询'}
            </span>
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<SyncOutlined spin={refreshingId === record._id} />}
            onClick={() => handleRefreshLogistics(record)}
            style={{ color: '#4F46E5' }}
          />
        </div>
      ),
    },
    {
      title: '更新',
      dataIndex: 'logisticsUpdateTime',
      key: 'logisticsUpdateTime',
      width: 110,
      responsive: ['md'],
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {time ? dayjs(time).format('MM-DD HH:mm') : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            <span className="hide-on-mobile">编辑</span>
          </Button>
          <Popconfirm
            title="确定删除此订单？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              <span className="hide-on-mobile">删除</span>
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
        <span className="page-title">订单管理</span>
        <Tag color="orange" style={{ marginLeft: 16, borderRadius: 6 }}>管理员</Tag>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-label">总订单数</div>
            <div className="stat-value">{stats.total.toLocaleString()}</div>
          </div>
          <div className="stat-icon primary"><InboxOutlined /></div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-label">已签收</div>
            <div className="stat-value">{stats.signed.toLocaleString()}</div>
          </div>
          <div className="stat-icon success"><CheckCircleOutlined /></div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-label">运输中</div>
            <div className="stat-value">{stats.onWay.toLocaleString()}</div>
          </div>
          <div className="stat-icon info"><CarOutlined /></div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-label">已发出</div>
            <div className="stat-value">{stats.sent.toLocaleString()}</div>
          </div>
          <div className="stat-icon warning"><ClockCircleOutlined /></div>
        </div>
      </div>

      {/* 搜索和操作区域 */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Input
              placeholder="搜索单号、客户姓名、批次..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              allowClear
              size="large"
            />
          </div>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} className="search-btn primary">搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset} className="search-btn default">重置</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="search-btn">新增</Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          {/* 快速筛选 */}
          <div className="filter-tags" style={{ margin: 0, padding: 0, border: 'none' }}>
            <span className="filter-label">筛选:</span>
            <span className={`filter-tag ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>全部</span>
            <span className={`filter-tag ${activeFilter === 'onWay' ? 'active' : ''}`} onClick={() => handleFilterChange('onWay')}>在途中</span>
            <span className={`filter-tag success ${activeFilter === 'signed' ? 'active' : ''}`} onClick={() => handleFilterChange('signed')}>已签收</span>
            <span className={`filter-tag warning ${activeFilter === 'sent' ? 'active' : ''}`} onClick={() => handleFilterChange('sent')}>已发出</span>
          </div>

          {/* 批量操作 */}
          {selectedRows.length > 0 && (
            <Space>
              <Button icon={<SyncOutlined />} onClick={handleBatchRefresh}>刷新物流 ({selectedRows.length})</Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>删除 ({selectedRows.length})</Button>
            </Space>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          scroll={{ x: 850 }}
          size="middle"
        />
      </div>

      {/* 创建订单弹窗 */}
      <Modal title="新增订单" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null} width={500}>
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item name="orderNumber" label="单号" rules={[{ required: true, message: '请输入单号' }]}>
            <Input placeholder="请输入单号" />
          </Form.Item>
          <Form.Item name="customerName" label="客户姓名">
            <Input placeholder="请输入客户姓名" />
          </Form.Item>
          <Form.Item name="batchId" label="批次">
            <Select placeholder="选择批次" allowClear showSearch optionFilterProp="children">
              {batches.map(batch => <Option key={batch._id} value={batch._id}>{batch.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="在路上">
            <Select>
              <Option value="在路上">在路上</Option>
              <Option value="已签收">已签收</Option>
              <Option value="已发出">已发出</Option>
            </Select>
          </Form.Item>
          <Form.Item name="logisticsInfo" label="物流信息">
            <TextArea rows={3} placeholder="请输入物流信息" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑订单弹窗 */}
      <Modal title="编辑订单" open={editModalVisible} onCancel={() => setEditModalVisible(false)} footer={null} width={500}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="orderNumber" label="单号" rules={[{ required: true, message: '请输入单号' }]}>
            <Input placeholder="请输入单号" />
          </Form.Item>
          <Form.Item name="customerName" label="客户姓名">
            <Input placeholder="请输入客户姓名" />
          </Form.Item>
          <Form.Item name="batchId" label="批次">
            <Select placeholder="选择批次" allowClear showSearch optionFilterProp="children">
              {batches.map(batch => <Option key={batch._id} value={batch._id}>{batch.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="在路上">在路上</Option>
              <Option value="已签收">已签收</Option>
              <Option value="已发出">已发出</Option>
            </Select>
          </Form.Item>
          <Form.Item name="logisticsInfo" label="物流信息">
            <TextArea rows={3} placeholder="请输入物流信息" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 物流信息抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined style={{ color: '#4F46E5' }} />
            <span>物流详情</span>
          </div>
        }
        placement="right"
        width={450}
        onClose={() => setLogisticsDrawerVisible(false)}
        open={logisticsDrawerVisible}
      >
        <Spin spinning={logisticsLoading}>
          {logisticsData && (
            <div>
              {/* 订单信息 */}
              <div style={{ marginBottom: 24, padding: 16, background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6B7280' }}>单号：</span>
                  <span className="order-number">{logisticsData.orderNumber}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6B7280' }}>快递：</span>
                  <Tag color="blue">{logisticsData.courierName || '未识别'}</Tag>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>状态：</span>
                  {getStatusTag(logisticsData.status)}
                </div>
              </div>

              {/* 最新物流 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#1F2937' }}>最新物流</div>
                <div style={{ padding: 12, background: '#EEF2FF', borderRadius: 8, color: '#4F46E5' }}>
                  {logisticsData.latestInfo || '暂无物流信息'}
                </div>
                {logisticsData.updateTime && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                    更新时间：{dayjs(logisticsData.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                    {logisticsData.isMock && <Tag color="orange" style={{ marginLeft: 8 }}>模拟数据</Tag>}
                  </div>
                )}
              </div>

              {/* 物流轨迹 */}
              {logisticsData.history && logisticsData.history.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#1F2937' }}>物流轨迹</div>
                  <Timeline
                    items={logisticsData.history.map((item, index) => ({
                      color: index === 0 ? '#4F46E5' : '#D1D5DB',
                      dot: index === 0 ? <EnvironmentOutlined style={{ fontSize: 16 }} /> : undefined,
                      children: (
                        <div>
                          <div style={{ color: index === 0 ? '#1F2937' : '#6B7280', marginBottom: 4 }}>
                            {item.description}
                          </div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                            {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}
                            {item.location && ` · ${item.location}`}
                          </div>
                        </div>
                      )
                    }))}
                  />
                </div>
              )}
            </div>
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default AdminInfo;
