// 快递公司识别工具

const courierPatterns = [
  // 顺丰速运 - SF开头或纯数字15位
  { name: '顺丰速运', code: 'SF', pattern: /^(SF|sf)\d{12,13}$/i },
  { name: '顺丰速运', code: 'SF', pattern: /^\d{15}$/ },
  
  // 韵达快递 - YD开头或数字开头
  { name: '韵达快递', code: 'YD', pattern: /^(YD|yd)\d{13,15}$/i },
  { name: '韵达快递', code: 'YD', pattern: /^1\d{12}$/ },
  
  // 中通快递 - ZT开头或75/78开头
  { name: '中通快递', code: 'ZT', pattern: /^(ZT|zt)\d{12,15}$/i },
  { name: '中通快递', code: 'ZT', pattern: /^(75|78)\d{10,12}$/ },
  
  // 圆通速递 - YT开头或YC开头
  { name: '圆通速递', code: 'YT', pattern: /^(YT|yt|YC|yc)\d{12,18}$/i },
  
  // 申通快递 - ST开头或77开头
  { name: '申通快递', code: 'STO', pattern: /^(ST|st)\d{12,15}$/i },
  { name: '申通快递', code: 'STO', pattern: /^77\d{10,13}$/ },
  
  // 京东物流 - JD/JDV/JDVA开头
  { name: '京东物流', code: 'JD', pattern: /^(JD|jd|JDV|JDVA)\w{10,20}$/i },
  
  // EMS/邮政 - E开头或国际EMS
  { name: 'EMS/邮政', code: 'EMS', pattern: /^(E|EA|EE|EM|ES|EX|EY|EZ)[A-Z]?\d{9}[A-Z]{2}$/i },
  { name: 'EMS/邮政', code: 'EMS', pattern: /^(11|10)\d{11}$/ },
  
  // 极兔速递 - JT开头
  { name: '极兔速递', code: 'JT', pattern: /^(JT|jt)\d{12,15}$/i },
  
  // 德邦快递 - DPK/DB/601开头
  { name: '德邦快递', code: 'DB', pattern: /^(DPK|dpk|DB|db|601)\d{10,15}$/i },
  
  // 百世快递 - HT/BN开头
  { name: '百世快递', code: 'BS', pattern: /^(HT|ht|BN|bn)\d{12,15}$/i },
  
  // 天天快递 - 66开头
  { name: '天天快递', code: 'TT', pattern: /^66\d{10,12}$/ },
  
  // 丰巢快递 - FC开头
  { name: '丰巢快递', code: 'FC', pattern: /^(FC|fc)\d{10,15}$/i },
  
  // 菜鸟 - CAINIAO/CN开头
  { name: '菜鸟', code: 'CN', pattern: /^(CAINIAO|CN|LP)\w{10,20}$/i },
  
  // 数字开头的通用规则
  { name: '中通快递', code: 'ZT', pattern: /^43\d{10,12}$/ },
  { name: '圆通速递', code: 'YT', pattern: /^88\d{10,12}$/ },
];

/**
 * 识别快递公司
 * @param {string} orderNumber - 快递单号
 * @returns {{ name: string, code: string } | null} - 快递公司信息或null
 */
export const detectCourier = (orderNumber) => {
  if (!orderNumber || typeof orderNumber !== 'string') {
    return null;
  }
  
  const trimmedNumber = orderNumber.trim();
  
  for (const courier of courierPatterns) {
    if (courier.pattern.test(trimmedNumber)) {
      return { name: courier.name, code: courier.code };
    }
  }
  
  // 如果无法识别，尝试根据前缀简单判断
  const upperNumber = trimmedNumber.toUpperCase();
  if (upperNumber.startsWith('SF')) return { name: '顺丰速运', code: 'SF' };
  if (upperNumber.startsWith('YD')) return { name: '韵达快递', code: 'YD' };
  if (upperNumber.startsWith('ZT')) return { name: '中通快递', code: 'ZT' };
  if (upperNumber.startsWith('YT')) return { name: '圆通速递', code: 'YT' };
  if (upperNumber.startsWith('ST')) return { name: '申通快递', code: 'STO' };
  if (upperNumber.startsWith('JD')) return { name: '京东物流', code: 'JD' };
  if (upperNumber.startsWith('JT')) return { name: '极兔速递', code: 'JT' };
  
  return null;
};

/**
 * 批量识别快递公司
 * @param {string[]} orderNumbers - 快递单号数组
 * @returns {Array<{ number: string, courier: { name: string, code: string } | null }>}
 */
export const detectCouriers = (orderNumbers) => {
  return orderNumbers.map(number => ({
    number,
    courier: detectCourier(number),
  }));
};

/**
 * 获取快递公司统计
 * @param {string[]} orderNumbers - 快递单号数组
 * @returns {Object<string, number>} - 快递公司名称到数量的映射
 */
export const getCourierStats = (orderNumbers) => {
  const stats = {};
  
  orderNumbers.forEach(number => {
    const courier = detectCourier(number);
    const name = courier?.name || '未识别';
    stats[name] = (stats[name] || 0) + 1;
  });
  
  return stats;
};

export default detectCourier;
