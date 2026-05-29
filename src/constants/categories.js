/**
 * 分类常量定义：颜色映射、必要度标签、中文名称
 */

export const CATEGORY_MAP = {
  '餐饮美食': { color: '#f97316', essential: 'non-essential' },
  '交通出行': { color: '#3b82f6', essential: 'essential' },
  '充值缴费': { color: '#10b981', essential: 'essential' },
  '医疗健康': { color: '#ef4444', essential: 'essential' },
  '文化休闲': { color: '#8b5cf6', essential: 'non-essential' },
  '日用百货': { color: '#06b6d4', essential: 'essential' },
  '保险': { color: '#6366f1', essential: 'essential' },
  '信用借还': { color: '#ec4899', essential: 'debt' },
  '爱车养车': { color: '#64748b', essential: 'essential' },
  '商业服务': { color: '#78716c', essential: 'other' },
  '转账红包': { color: '#f43f5e', essential: 'other' },
  '生活服务': { color: '#14b8a6', essential: 'essential' },
  '教育培训': { color: '#0ea5e9', essential: 'essential' },
  '美容美发': { color: '#d946ef', essential: 'non-essential' },
  '数码电器': { color: '#1e293b', essential: 'non-essential' },
  '服饰装扮': { color: '#e11d48', essential: 'non-essential' },
  '运动户外': { color: '#16a34a', essential: 'non-essential' },
  '酒店旅游': { color: '#d97706', essential: 'non-essential' },
  '母婴亲子': { color: '#f472b6', essential: 'essential' },
  '退款': { color: '#22c55e', essential: 'income' },
  '收入': { color: '#16a34a', essential: 'income' },
  '其他': { color: '#9ca3af', essential: 'other' },
};

export const ESSENTIAL_LABELS = {
  'essential': '必需开支',
  'non-essential': '非必需开支',
  'debt': '负债/还款',
  'other': '其他',
  'income': '收入/退款',
};

export const ESSENTIAL_COLORS = {
  'essential': '#8CB896',
  'non-essential': '#E8988A',
  'debt': '#D4726A',
  'other': '#C8B6A0',
  'income': '#87A7C7',
};
