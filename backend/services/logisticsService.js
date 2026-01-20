/**
 * 物流查询服务
 * 支持快递100 API和模拟数据（开发环境）
 */

const axios = require('axios');

// 快递公司编码映射
const COURIER_CODES = {
  'SF': { code: 'shunfeng', name: '顺丰速运', pattern: /^SF\d{12,15}$/i },
  'YD': { code: 'yunda', name: '韵达快递', pattern: /^1\d{12,13}$|^46\d{10}$/ },
  'ZT': { code: 'zhongtong', name: '中通快递', pattern: /^7[3-5]\d{11,13}$/ },
  'YT': { code: 'yuantong', name: '圆通速递', pattern: /^YT\d{13,15}$/i },
  'STO': { code: 'shentong', name: '申通快递', pattern: /^7[7-9]\d{11}$|^268\d{9}$|^58\d{11}$/ },
  'JD': { code: 'jd', name: '京东物流', pattern: /^JD[0-9A-Z]{11,13}$/i },
  'EMS': { code: 'ems', name: 'EMS', pattern: /^E[A-Z]\d{9}[A-Z]{2}$/i },
  'HTKY': { code: 'huitongkuaidi', name: '百世快递', pattern: /^7\d{13}$/ },
  'YZPY': { code: 'youzhengguonei', name: '邮政快递包裹', pattern: /^\d{13}$/ },
  'DB': { code: 'debangkuaidi', name: '德邦快递', pattern: /^\d{8,10}$/ },
};

/**
 * 根据单号自动识别快递公司
 */
function detectCourier(orderNumber) {
  if (!orderNumber) return null;
  
  const num = orderNumber.trim().toUpperCase();
  
  // 按规则匹配
  for (const [key, courier] of Object.entries(COURIER_CODES)) {
    if (courier.pattern.test(num)) {
      return { code: courier.code, name: courier.name, key };
    }
  }
  
  // 特殊前缀匹配
  if (num.startsWith('SF')) return { code: 'shunfeng', name: '顺丰速运', key: 'SF' };
  if (num.startsWith('YT')) return { code: 'yuantong', name: '圆通速递', key: 'YT' };
  if (num.startsWith('JD')) return { code: 'jd', name: '京东物流', key: 'JD' };
  if (num.startsWith('77') || num.startsWith('78') || num.startsWith('79')) return { code: 'shentong', name: '申通快递', key: 'STO' };
  if (num.startsWith('73') || num.startsWith('74') || num.startsWith('75')) return { code: 'zhongtong', name: '中通快递', key: 'ZT' };
  if (num.startsWith('1') && num.length >= 13) return { code: 'yunda', name: '韵达快递', key: 'YD' };
  
  return { code: 'auto', name: '未识别', key: 'OTHER' };
}

/**
 * 查询物流信息 - 快递100 API
 * 需要配置环境变量: KUAIDI100_KEY, KUAIDI100_CUSTOMER
 */
async function queryFromKuaidi100(orderNumber, courierCode) {
  const key = process.env.KUAIDI100_KEY;
  const customer = process.env.KUAIDI100_CUSTOMER;
  
  if (!key || !customer) {
    console.log('快递100 API未配置，使用模拟数据');
    return null;
  }
  
  try {
    const crypto = require('crypto');
    const param = JSON.stringify({
      com: courierCode,
      num: orderNumber,
      resultv2: '4'
    });
    
    const sign = crypto.createHash('md5')
      .update(param + key + customer)
      .digest('hex')
      .toUpperCase();
    
    const response = await axios.post('https://poll.kuaidi100.com/poll/query.do', 
      `customer=${customer}&sign=${sign}&param=${encodeURIComponent(param)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );
    
    if (response.data && response.data.data) {
      return {
        success: true,
        state: response.data.state, // 0在途,1揽收,2疑难,3签收,4退签,5派件,6退回,7转投
        data: response.data.data.map(item => ({
          time: new Date(item.time || item.ftime),
          status: mapState(response.data.state),
          location: item.location || '',
          description: item.context
        }))
      };
    }
    
    return null;
  } catch (error) {
    console.error('快递100 API查询失败:', error.message);
    return null;
  }
}

/**
 * 映射物流状态
 */
function mapState(state) {
  const stateMap = {
    '0': '在途中',
    '1': '已揽收',
    '2': '疑难件',
    '3': '已签收',
    '4': '退签',
    '5': '派送中',
    '6': '退回中',
    '7': '转投'
  };
  return stateMap[String(state)] || '在途中';
}

/**
 * 生成模拟物流数据（开发/演示环境）
 */
function generateMockLogistics(orderNumber, courierName) {
  const now = new Date();
  const mockData = [];
  
  // 随机决定物流状态（70%在途，20%已签收，10%已发出）
  const random = Math.random();
  let finalStatus = '在路上';
  let steps = 3;
  
  if (random > 0.9) {
    finalStatus = '已发出';
    steps = 1;
  } else if (random > 0.7) {
    finalStatus = '已签收';
    steps = 5;
  }
  
  const locations = ['广州转运中心', '深圳分拨中心', '东莞中转站', '香港仓库', '法属圭亚那海关', '卡宴配送站'];
  const statusTexts = ['已揽收', '运输中', '到达转运中心', '清关中', '派送中', '已签收'];
  
  for (let i = 0; i < steps; i++) {
    const time = new Date(now.getTime() - (steps - i) * 24 * 60 * 60 * 1000 + Math.random() * 8 * 60 * 60 * 1000);
    mockData.push({
      time,
      status: i === steps - 1 && finalStatus === '已签收' ? '已签收' : '在途中',
      location: locations[i % locations.length],
      description: `【${locations[i % locations.length]}】${statusTexts[Math.min(i, statusTexts.length - 1)]}，${courierName}快递员正在处理您的包裹`
    });
  }
  
  return {
    success: true,
    isMock: true,
    state: finalStatus === '已签收' ? '3' : '0',
    data: mockData.reverse(), // 最新的在前面
    latestInfo: mockData[0]?.description || '暂无物流信息'
  };
}

/**
 * 查询物流信息（主函数）
 */
async function queryLogistics(orderNumber) {
  if (!orderNumber) {
    return { success: false, error: '单号不能为空' };
  }
  
  // 识别快递公司
  const courier = detectCourier(orderNumber);
  
  // 尝试使用真实API
  let result = await queryFromKuaidi100(orderNumber, courier.code);
  
  // 如果API未配置或失败，使用模拟数据
  if (!result) {
    result = generateMockLogistics(orderNumber, courier.name);
  }
  
  return {
    ...result,
    courierCode: courier.code,
    courierName: courier.name
  };
}

/**
 * 批量查询物流信息
 */
async function batchQueryLogistics(orders, maxConcurrent = 5) {
  const results = [];
  
  for (let i = 0; i < orders.length; i += maxConcurrent) {
    const batch = orders.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(order => queryLogistics(order.orderNumber))
    );
    results.push(...batchResults.map((result, index) => ({
      orderId: batch[index]._id,
      ...result
    })));
    
    // 避免API限流
    if (i + maxConcurrent < orders.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

module.exports = {
  detectCourier,
  queryLogistics,
  batchQueryLogistics,
  COURIER_CODES
};
