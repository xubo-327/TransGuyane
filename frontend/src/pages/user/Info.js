import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, message, Tooltip, Empty, Select, Row, Col } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ordersAPI } from '../../services/api';
import { detectCourier } from '../../utils/courierDetector';
import { useAuth } from '../../contexts/AuthContext';
import { formatCustomerName } from '../../utils/customerNameUtils';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const UserInfo = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({
    batchName: undefined,
    customerName: undefined,
    status: undefined
  });
  const navigate = useNavigate();

  const loadBatches = useCallback(async () => {
    try {
      const result = await ordersAPI.list({ page: 1, pageSize: 1000 });
      // Extract unique batch names from orders
      const uniqueBatches = [...new Set(result?.orders?.map(o => o.batchName).filter(Boolean))];
      setBatches(uniqueBatches.sort());
    } catch (error) {
      console.error('Loading batches failed:', error);
    }
  }, []);

  const loadOrders = useCallback(async (searchValue = searchText) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 100,
        search: searchValue || undefined // Pass search param for name/orderNumber/batch
      };

      // Add advanced filters
      if (filters.batchName) params.batchName = filters.batchName;
      if (filters.customerName) params.customerName = filters.customerName;
      if (filters.status) params.status = filters.status;

      // Add status filter from quick filter buttons (only if no advanced status filter)
      if (activeFilter !== 'all' && !filters.status) {
        const statusMap = {
          'onWay': '在路上',
          'signed': '已签收',
          'sent': '已发出',
        };
        params.status = statusMap[activeFilter];
      }

      const result = await ordersAPI.list(params);
      setOrders(result?.orders || []);
    } catch (error) {
      console.error('Loading orders failed:', error);
      message.error('加载数据失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, activeFilter, filters]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = () => {
    loadOrders(searchText);
  };

  const handleReset = () => {
    setSearchText('');
    setActiveFilter('all');
    setFilters({
      batchName: undefined,
      customerName: undefined,
      status: undefined
    });
    // loadOrders() will be triggered by the filters/activeFilter change
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // 统计数据 (Statistics based on current view might be partial if paginated,
  // but for unlogged page usually we might want total stats.
  // For proper rigorous stats, we should ask backend for stats,
  // but here we calculate from the list as per original design.
  // Note: If pageSize is 100, this stats is for the top 100 results.)
  const stats = useMemo(() => {
    const total = orders.length;
    const signed = orders.filter(o => o.status === '已签收').length;
    const onWay = orders.filter(o => o.status === '在路上').length;
    const sent = orders.filter(o => o.status === '已发出').length;

    return {
      total,
      signed,
      onWay,
      sent,
      signedRate: total > 0 ? Math.round((signed / total) * 100) : 0,
      onWayRate: total > 0 ? Math.round((onWay / total) * 100) : 0,
      sentRate: total > 0 ? Math.round((sent / total) * 100) : 0,
    };
  }, [orders]);

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
      width: 180,
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      render: (text) => <span className="order-number">{text}</span>,
    },
    {
      title: '快递公司',
      dataIndex: 'orderNumber',
      key: 'courier',
      width: 130,
      render: (orderNumber) => getCourierBadge(orderNumber),
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100,
      render: (customerName, record) => formatCustomerName(customerName, user, record),
    },
    {
      title: '批次',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 140,
      className: 'hide-on-mobile',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '物流信息',
      dataIndex: 'logisticsInfo',
      key: 'logisticsInfo',
      ellipsis: true,
      className: 'hide-on-mobile',
      render: (text) => (
        <Tooltip title={text || '暂无信息'}>
          <span style={{ color: text ? '#1F2937' : '#9CA3AF' }}>
            {text || '暂无信息'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'logisticsUpdateTime',
      key: 'logisticsUpdateTime',
      width: 160,
      className: 'hide-on-mobile',
      sorter: (a, b) => new Date(a.logisticsUpdateTime) - new Date(b.logisticsUpdateTime),
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'}
        </span>
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
        <span className="page-title">信息页面</span>
      </div>

      {/* 统计卡片 (Note: shows stats for CURRENT filtered/searched result set) */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-label">总订单数</div>
            <div className="stat-value">{stats.total.toLocaleString()}</div>
            <div className="stat-change up">↑ 12% 较上周</div>
          </div>
          <div className="stat-icon primary">
            <InboxOutlined />
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-label">已签收</div>
            <div className="stat-value">{stats.signed.toLocaleString()}</div>
            <div className="stat-change">{stats.signedRate}% 签收率</div>
          </div>
          <div className="stat-icon success">
            <CheckCircleOutlined />
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-label">运输中</div>
            <div className="stat-value">{stats.onWay.toLocaleString()}</div>
            <div className="stat-change">{stats.onWayRate}% 运输中</div>
          </div>
          <div className="stat-icon info">
            <CarOutlined />
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-label">待处理</div>
            <div className="stat-value">{stats.sent.toLocaleString()}</div>
            <div className="stat-change">{stats.sentRate}% 待处理</div>
          </div>
          <div className="stat-icon warning">
            <ClockCircleOutlined />
          </div>
        </div>
      </div>

      {/* 高级筛选区域 */}
      <div className="filter-section" style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#374151' }}>批次筛选</div>
            <Select
              placeholder="选择批次"
              value={filters.batchName}
              onChange={(value) => handleFilterChange('batchName', value)}
              allowClear
              style={{ width: '100%' }}
              size="large"
            >
              {batches.map(batch => (
                <Select.Option key={batch} value={batch}>{batch}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#374151' }}>客户姓名</div>
            <Input
              placeholder="输入客户姓名"
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#374151' }}>订单状态</div>
            <Select
              placeholder="选择状态"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
              size="large"
            >
              <Select.Option value="在路上">在途中</Select.Option>
              <Select.Option value="已签收">已签收</Select.Option>
              <Select.Option value="已发出">已发出</Select.Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Input
              placeholder="搜索单号或客户姓名..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              allowClear
              size="large"
            />
          </div>
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

        {/* 快速筛选 */}
        <div className="filter-tags">
          <span className="filter-label">快速筛选:</span>
          <span
            className={`filter-tag ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            全部
          </span>
          <span
            className={`filter-tag ${activeFilter === 'onWay' ? 'active' : ''}`}
            onClick={() => setActiveFilter('onWay')}
          >
            在途中
          </span>
          <span
            className={`filter-tag success ${activeFilter === 'signed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('signed')}
          >
            已签收
          </span>
          <span
            className={`filter-tag warning ${activeFilter === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveFilter('sent')}
          >
            已发出
          </span>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="page-container" style={{ marginTop: 0, border: 'none', padding: 0, background: 'transparent', boxShadow: 'none' }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') {
                return <span style={{ padding: '0 8px', cursor: 'pointer' }}>← 上一页</span>;
              }
              if (type === 'next') {
                return <span style={{ padding: '0 8px', cursor: 'pointer' }}>下一页 →</span>;
              }
              return originalElement;
            },
          }}
          locale={{
            emptyText: (
              <Empty
                description="暂无数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>
    </div>
  );
};

export default UserInfo;
