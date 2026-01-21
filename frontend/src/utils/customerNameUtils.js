/**
 * 客户姓名显示工具函数
 * 根据用户登录状态和角色决定是否显示客户姓名
 * 
 * @param {string} customerName - 客户姓名
 * @param {object} user - 当前登录用户（null表示未登录）
 * @param {object} order - 订单对象（可选，用于判断订单是否属于当前用户）
 * @returns {string} 显示的名称（密文或真实姓名）
 */
export const formatCustomerName = (customerName, user, order = null) => {
  // 如果没有客户姓名，返回空字符串
  if (!customerName) {
    return '';
  }

  // 未登录：显示密文
  if (!user) {
    // 将姓名转换为密文，保留第一个字符，其他用*替代
    if (customerName.length === 1) {
      return '*';
    }
    return customerName.charAt(0) + '*'.repeat(customerName.length - 1);
  }

  // 管理员：显示所有客户姓名（真实姓名）
  if (user.role === 'admin' || user.role === 'superadmin') {
    return customerName;
  }

  // 登录普通用户：显示真实姓名
  // 因为后端已经过滤，只返回当前用户的订单，所以这里直接显示
  // 如果传入order对象，可以进一步验证订单是否属于当前用户
  if (order && order.userId) {
    const orderUserId = typeof order.userId === 'object' ? order.userId._id : order.userId;
    const currentUserId = user.id || user._id;
    
    // 如果订单属于当前用户，显示真实姓名
    if (orderUserId && currentUserId && orderUserId.toString() === currentUserId.toString()) {
      return customerName;
    }
    
    // 订单不属于当前用户，显示密文
    if (customerName.length === 1) {
      return '*';
    }
    return customerName.charAt(0) + '*'.repeat(customerName.length - 1);
  }

  // 默认情况（用户已登录但没有order信息）：显示真实姓名
  // 因为后端应该已经过滤了数据，只返回当前用户的订单
  return customerName;
};
