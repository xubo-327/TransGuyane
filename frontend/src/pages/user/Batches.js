import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Collapse, Space, Empty, Spin, Tag, Checkbox, Dropdown, message } from 'antd';
import { 
  SearchOutlined, 
  ArrowLeftOutlined, 
  ReloadOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import { batchesAPI, exportAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { detectCourier } from '../../utils/courierDetector';
import dayjs from 'dayjs';

const { Panel } = Collapse;

const UserBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeKeys, setActiveKeys] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async (search = '') => {
    setLoading(true);
    try {
      const params = { page: 1, pageSize: 50 };
      if (search) {
        params.search = search;
      }
      const result = await batchesAPI.list(params);
      setBatches(Array.isArray(result?.batches) ? result.batches : []);
    } catch (error) {
      console.error('加载批次失败:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadBatches(searchText);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedBatches([]);
    loadBatches();
  };

  // 导出单个批次
  const handleExportSingle = async (batchId, batchName) => {
    setExportLoading(true);
    try {
      const response = await exportAPI.exportBatches([batchId]);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${batchName}_订单数据.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 导出选中批次
  const handleExportSelected = async () => {
    if (selectedBatches.length === 0) {
      message.warning('请先选择要导出的批次');
      return;
    }
    
    setExportLoading(true);
    try {
      const response = await exportAPI.exportBatches(selectedBatches);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `批次订单_${dayjs().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(`成功导出 ${selectedBatches.length} 个批次`);
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 导出全部批次
  const handleExportAll = async () => {
    if (batches.length === 0) {
      message.warning('暂无批次数据可导出');
      return;
    }
    
    setExportLoading(true);
    try {
      const response = await exportAPI.exportAllBatches();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `全部批次数据_${dayjs().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('导出全部批次成功');
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 切换批次选中状态
  const handleBatchSelect = (batchId, checked) => {
    if (checked) {
      setSelectedBatches([...selectedBatches, batchId]);
    } else {
      setSelectedBatches(selectedBatches.filter(id => id !== batchId));
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedBatches.length === batches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(batches.map(b => b._id));
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      className: 'hide-on-mobile',
      render: (time) => (
        <span style={{ color: '#6B7280', fontSize: 13 }}>
          {dayjs(time).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
  ];

  const toggleExpandAll = () => {
    if (activeKeys.length === batches.length) {
      setActiveKeys([]);
    } else {
      setActiveKeys(batches.map(b => b._id));
    }
  };

  // 导出下拉菜单
  const exportMenuItems = [
    {
      key: 'selected',
      label: (
        <span>
          <CheckSquareOutlined style={{ marginRight: 8 }} />
          导出选中批次 {selectedBatches.length > 0 && `(${selectedBatches.length})`}
        </span>
      ),
      disabled: selectedBatches.length === 0,
      onClick: handleExportSelected,
    },
    {
      key: 'all',
      label: (
        <span>
          <FileExcelOutlined style={{ marginRight: 8 }} />
          导出全部批次
        </span>
      ),
      onClick: handleExportAll,
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
        <span className="page-title">批次页面</span>
        <Tag 
          icon={<AppstoreOutlined />} 
          color="blue" 
          style={{ marginLeft: 16, borderRadius: 6 }}
        >
          共 {batches.length} 个批次
        </Tag>
      </div>

      {/* 搜索区域 */}
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
            刷新
          </Button>
          {batches.length > 0 && (
            <Button 
              onClick={toggleExpandAll}
              className="search-btn default"
            >
              {activeKeys.length === batches.length ? '收起全部' : '展开全部'}
            </Button>
          )}
        </div>
      </div>

      {/* 导出操作栏 */}
      {batches.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: '#F9FAFB', 
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Checkbox
              checked={selectedBatches.length === batches.length && batches.length > 0}
              indeterminate={selectedBatches.length > 0 && selectedBatches.length < batches.length}
              onChange={handleSelectAll}
            >
              全选
            </Checkbox>
            {selectedBatches.length > 0 && (
              <span style={{ color: '#4F46E5', fontWeight: 500 }}>
                已选择 {selectedBatches.length} 个批次
              </span>
            )}
          </div>
          
          <Space>
            <Dropdown 
              menu={{ items: exportMenuItems }} 
              placement="bottomRight"
            >
              <Button 
                icon={<ExportOutlined />} 
                loading={exportLoading}
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 500
                }}
              >
                导出批次 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </div>
      )}

      {/* 批次列表 */}
      <div style={{ marginTop: 20 }}>
        <Spin spinning={loading}>
          {batches.length > 0 ? (
            <Collapse 
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys)}
            >
              {batches.map((batch) => (
                <Panel
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Checkbox
                        checked={selectedBatches.includes(batch._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleBatchSelect(batch._id, e.target.checked)}
                      />
                      <FolderOpenOutlined style={{ color: '#4F46E5', fontSize: 16 }} />
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#1F2937' }}>
                        {batch.name}
                      </span>
                      <Tag color="blue" style={{ borderRadius: 6 }}>{batch.period}</Tag>
                      <span style={{ color: '#6B7280', fontSize: 13 }}>
                        共 {batch.orderCount || batch.orders?.length || 0} 个订单
                      </span>
                      <Button
                        type="link"
                        size="small"
                        icon={<ExportOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(batch._id, batch.name);
                        }}
                        loading={exportLoading}
                        style={{ marginLeft: 'auto', color: '#10B981' }}
                      >
                        导出
                      </Button>
                    </div>
                  }
                  key={batch._id}
                >
                  {batch.orders && batch.orders.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={batch.orders}
                      rowKey="_id"
                      pagination={false}
                      size="small"
                      scroll={{ x: 600 }}
                    />
                  ) : (
                    <Empty 
                      description={
                        <span style={{ color: '#9CA3AF' }}>该批次暂无订单</span>
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Panel>
              ))}
            </Collapse>
          ) : (
            <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
              <Empty 
                description={
                  <span style={{ color: '#9CA3AF' }}>暂无批次数据</span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default UserBatches;
