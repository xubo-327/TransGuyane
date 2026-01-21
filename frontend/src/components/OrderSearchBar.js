import React, { useState } from 'react';
import { Input, Button, Modal, Table, message, Empty, Spin, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ordersAPI } from '../services/api';
import { detectCourier } from '../utils/courierDetector';
import dayjs from 'dayjs';

/**
 * 全局单号搜索状态栏组件
 * 显示在每个页面底部，提供快速搜索功能
 */
const OrderSearchBar = () => {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      message.warning('请输入单号');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    try {
      const data = await ordersAPI.search(searchText.trim());
      setResults(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        message.info('未找到相关订单');
      }
    } catch (error) {
      message.error(error.error || '搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setVisible(true);
    setSearchText('');
    setResults([]);
    setSearched(false);
  };

  const handleClose = () => {
    setVisible(false);
    setSearchText('');
    setResults([]);
    setSearched(false);
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
      width: 180,
      render: (text) => <span className="order-number">{text}</span>,
    },
    {
      title: '快递公司',
      dataIndex: 'orderNumber',
      key: 'courier',
      width: 120,
      render: (orderNumber) => getCourierBadge(orderNumber),
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100,
    },
    {
      title: '批次',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 140,
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
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* 底部搜索栏 */}
      <div className="global-search-bar">
        <div className="search-bar-inner">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="快速搜索单号..."
            className="search-input"
            onClick={handleOpen}
            readOnly
          />
          <span className="search-hint">点击搜索</span>
        </div>
      </div>

      {/* 搜索弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchOutlined style={{ color: '#4F46E5' }} />
            <span>单号搜索</span>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={900}
        className="search-modal"
        destroyOnClose
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Input
              placeholder="输入单号进行搜索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              size="large"
              allowClear
              autoFocus
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              size="large"
              loading={loading}
            >
              搜索
            </Button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
            提示：支持模糊搜索，输入单号的部分内容即可
          </div>
        </div>

        <Spin spinning={loading}>
          {searched && (
            results.length > 0 ? (
              <Table
                columns={columns}
                dataSource={results}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 条结果`,
                }}
                scroll={{ x: 800 }}
                size="small"
              />
            ) : (
              <Empty
                description="未找到相关订单"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default OrderSearchBar;
