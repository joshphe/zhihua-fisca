/**
 * 账单类型定义 — 可扩展
 */

export const BILL_TYPES = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: 'alipay',
    extension: '.csv',
    description: '支付宝交易明细导出',
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: 'wechat',
    extension: '.xlsx',
    description: '微信支付账单流水',
  },
];

/**
 * 微信支付分类 → 统一分类映射
 * 微信分类粒度粗（"商户消费"、"转账"等），需要根据对方名称/商品说明细化
 */
export function mapWechatCategory(txType, counterparty, product) {
  const type = (txType || '').trim();
  const cp = (counterparty || '').trim();
  const desc = (product || '').trim();

  // 转账类
  if (type === '转账' || type === '扫二维码付款' || type === '群收款') {
    return '转账红包';
  }

  // 退款
  if (type === '退款' || type === '退款退货') {
    return '退款';
  }

  // 信用卡还款
  if (type === '信用卡还款') {
    return '信用借还';
  }

  // 充值/提现 — 不计收支
  if (type === '零钱充值' || type === '零钱提现' || type === '充值' || type === '提现') {
    return null; // will be filtered out
  }

  // 商户消费 — 根据对方名称猜测类别
  if (type === '商户消费') {
    const keywords = cp + desc;

    if (/餐饮|美食|饭|面|粉|粥|串|火锅|烧烤|炸鸡|咖啡|奶茶|茶|甜品|蛋糕|外卖|麦当劳|肯德基|汉堡|寿司|luckin|coffee|food|restaurant/i.test(keywords)) {
      return '餐饮美食';
    }
    if (/超市|便利店|全家|罗森|7-?11|百货|shop|mart/i.test(keywords)) {
      return '日用百货';
    }
    if (/加油站|加油|充电|停车|凯德|etc|高速|地铁|公交|滴滴|打车|出行/i.test(keywords)) {
      return '交通出行';
    }
    if (/药|医|诊所|医院|体检|health|medical/i.test(keywords)) {
      return '医疗健康';
    }
    if (/保险/i.test(keywords)) {
      return '保险';
    }
    if (/电影|KTV|ktv|娱乐|游戏|旅游|酒店|景点|门票|旅行/i.test(keywords)) {
      return '文化休闲';
    }
    if (/手机|数码|电器|电子/i.test(keywords)) {
      return '数码电器';
    }
    if (/衣服|服饰|鞋|包|美发|美容|理发|穿搭/i.test(keywords)) {
      return '服饰装扮';
    }
    if (/教育|培训|课程|学习|书/i.test(keywords)) {
      return '教育培训';
    }
    if (/水费|电费|燃气|物业|缴费|充值缴费/i.test(keywords)) {
      return '充值缴费';
    }
    if (/汽车|4S|维修|保养|洗车|车/i.test(keywords)) {
      return '爱车养车';
    }
    if (/运动|健身|户外|体育/i.test(keywords)) {
      return '运动户外';
    }
    if (/美容|护肤|化妆品|spa|按摩/i.test(keywords)) {
      return '美容美发';
    }

    // Default: 日用百货 (most common for 商户消费)
    return '日用百货';
  }

  return '其他';
}
