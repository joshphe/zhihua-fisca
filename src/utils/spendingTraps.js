/**
 * 消费陷阱规则库
 * 每条规则：关键词匹配 + 频率阈值 + 省钱估算公式
 *
 * 返回格式：
 * {
 *   id, name, icon, description,
 *   detect(tx): boolean,           // 单笔交易是否命中
 *   estimate(matches, allTxs): {   // 根据命中笔数估算可节省金额
 *     annualWaste,                  // 年浪费金额
 *     suggestion,                   // 建议
 *     severity                      // 'high' | 'medium' | 'low'
 *   }
 * }
 */

export const TRAP_CATEGORIES = [
  // ====== 1. 咖啡/奶茶/饮料 ======
  {
    id: 'coffee-tea',
    name: '咖啡/奶茶/饮料',
    icon: 'food',
    description: '每天一杯看似不多，一年累计惊人',
    detect(tx) {
      if (tx.category !== '餐饮美食') return false;
      const text = (tx.product + tx.counterparty).toLowerCase();
      return /咖啡|奶茶|茶饮|星巴克|瑞幸|luckin|starbucks|costa|manner|mstand|喜茶|奈雪|蜜雪冰城|茶颜悦色|coco|一点点|书亦|古茗|茶百道|沪上阿姨|霸王茶姬|饮料|拿铁|美式|抹茶|cappuccino|latte|mocha|bubble tea/i.test(text);
    },
    estimate(matches, allTxs) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      const days = [...new Set(allTxs.map((t) => t.time.substring(0, 10)))].length || 1;
      const freqPerWeek = matches.length / (days / 7);
      if (freqPerWeek <= 2) return { annualWaste: 0, suggestion: '频率正常，无需调整', severity: 'low' };
      const targetPerWeek = 3;
      const excessRatio = Math.max(0, (freqPerWeek - targetPerWeek) / Math.max(freqPerWeek, 1));
      const annualWaste = Math.round(total * excessRatio);
      return {
        annualWaste,
        suggestion: `每周 ${freqPerWeek.toFixed(1)} 次，建议减至 ${targetPerWeek} 次以内。可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: freqPerWeek > 5 ? 'high' : 'medium',
      };
    },
  },

  // ====== 2. 便利店零食/外卖 ======
  {
    id: 'snacks-fastfood',
    name: '零食/快餐/外卖加购',
    icon: 'food',
    description: '便利店随手买、外卖凑单加小食',
    detect(tx) {
      if (tx.category !== '餐饮美食') return false;
      const text = (tx.product + tx.counterparty).toLowerCase();
      const isSmall = tx.amount < 25;
      const isSnack = /零食|小吃|薯片|饼干|面包|蛋糕|冰淇淋|雪糕|烤肠|关东煮|酸奶|牛奶|快餐|外卖|便利店|全家|罗森|7-?11|麦当劳|肯德基|汉堡王|subway|沙县|麻辣烫/i.test(text);
      return isSmall && isSnack;
    },
    estimate(matches, allTxs) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      const days = [...new Set(allTxs.map((t) => t.time.substring(0, 10)))].length || 1;
      const dailyAvg = matches.length / days;
      if (dailyAvg < 0.5) return { annualWaste: 0, suggestion: '偶尔消费，问题不大', severity: 'low' };
      const reductionRate = 0.4; // 建议减少 40%
      const annualWaste = Math.round(total * reductionRate);
      return {
        annualWaste,
        suggestion: `小额零食/快餐 ${matches.length} 笔共 ¥${total.toLocaleString()}。如减少 40%，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: dailyAvg > 1 ? 'high' : 'medium',
      };
    },
  },

  // ====== 3. 打车/网约车 ======
  {
    id: 'ride-hailing',
    name: '打车/网约车',
    icon: 'spike',
    description: '用打车替代公交地铁的便利税',
    detect(tx) {
      if (tx.category !== '交通出行') return false;
      const text = (tx.product + tx.counterparty).toLowerCase();
      return /滴滴|打车|网约车|专车|快车|顺风车|出租车|曹操|t3|首汽|花小猪|享道|高德打车/i.test(text);
    },
    estimate(matches, allTxs) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      const avgPerRide = matches.length > 0 ? total / matches.length : 0;
      const transitCost = 4; // 公交/地铁平均单次
      if (matches.length <= 5) return { annualWaste: 0, suggestion: '偶尔打车，问题不大', severity: 'low' };
      const excess = matches.length - 5;
      const annualWaste = Math.round(excess * (avgPerRide - transitCost) * 2); // 往返
      return {
        annualWaste,
        suggestion: `${matches.length} 次打车共 ¥${total.toLocaleString()}，笔均 ¥${Math.round(avgPerRide)}。公交地铁单次约 ¥${transitCost}，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: matches.length > 15 ? 'high' : 'medium',
      };
    },
  },

  // ====== 4. 停车费累积 ======
  {
    id: 'parking',
    name: '停车费累积',
    icon: 'search',
    description: '零散的停车费不知不觉累积',
    detect(tx) {
      if (tx.category !== '交通出行' && tx.category !== '爱车养车') return false;
      const text = (tx.product + tx.counterparty).toLowerCase();
      return /停车|凯德|万达|停车场|泊车|车位/i.test(text) && tx.amount < 40;
    },
    estimate(matches) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      if (matches.length <= 10) return { annualWaste: 0, suggestion: '停车次数较少，影响不大', severity: 'low' };
      const annualWaste = Math.round(total * 0.3);
      return {
        annualWaste,
        suggestion: `${matches.length} 次停车共 ¥${total.toLocaleString()}。提前规划免费停车点或公共交通，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: matches.length > 30 ? 'high' : 'medium',
      };
    },
  },

  // ====== 5. 娱乐/社交聚餐 ======
  {
    id: 'entertainment-dining',
    name: '娱乐/聚餐/社交',
    icon: 'entertainment',
    description: 'AA 制聚餐、KTV、电影等社交消费',
    detect(tx) {
      const text = (tx.product + tx.counterparty).toLowerCase();
      if (tx.category === '文化休闲') return true;
      if (tx.category === '餐饮美食' && tx.amount > 50) {
        return /聚餐|火锅|烧烤|日料|刺身|牛排|自助|烤肉|烤鱼|酸菜鱼|小龙虾|海鲜|寿司|tuna|居酒屋/i.test(text);
      }
      return false;
    },
    estimate(matches) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      if (matches.length <= 3) return { annualWaste: 0, suggestion: '社交消费很少，继续保持', severity: 'low' };
      const reductionRate = 0.25;
      const annualWaste = Math.round(total * reductionRate);
      return {
        annualWaste,
        suggestion: `${matches.length} 次社交/娱乐共 ¥${total.toLocaleString()}。减少 25% 频次或选择更经济的聚会方式，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: matches.length > 8 ? 'high' : 'medium',
      };
    },
  },

  // ====== 6. 购物/冲动消费 ======
  {
    id: 'impulse-shopping',
    name: '购物/冲动消费',
    icon: 'search',
    description: '淘宝/拼多多随手买、凑单凑满减',
    detect(tx) {
      const cats = ['日用百货', '数码电器', '服饰装扮', '美容美发', '运动户外'];
      if (!cats.includes(tx.category)) return false;
      return tx.amount < 200; // 小额更可能是冲动消费
    },
    estimate(matches) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      if (matches.length <= 5) return { annualWaste: 0, suggestion: '购物频次较低，控制在合理范围', severity: 'low' };
      const annualWaste = Math.round(total * 0.5); // 一半可能是非必要
      return {
        annualWaste,
        suggestion: `${matches.length} 笔小额购物共 ¥${total.toLocaleString()}。采用"48 小时冷静期"法则，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: matches.length > 12 ? 'high' : 'medium',
      };
    },
  },

  // ====== 7. 大额单笔 ======
  {
    id: 'big-spending',
    name: '大额非必需消费',
    icon: 'credit',
    description: '单笔大额支出需要特别审视',
    detect(tx) {
      const nonEssential = ['文化休闲', '数码电器', '服饰装扮', '运动户外', '酒店旅游', '美容美发'];
      return nonEssential.includes(tx.category) && tx.amount >= 500;
    },
    estimate(matches) {
      const total = matches.reduce((s, t) => s + t.amount, 0);
      if (matches.length === 0) return { annualWaste: 0, suggestion: '无大额非必需消费', severity: 'low' };
      return {
        annualWaste: total,
        suggestion: `${matches.length} 笔大额非必需消费共 ¥${total.toLocaleString()}。建议对每笔 ¥500+ 的非必需消费预留 48 小时冷静期。`,
        severity: total > 5000 ? 'high' : 'medium',
      };
    },
  },

  // ====== 8. 高频小额支付 ======
  {
    id: 'micro-payments',
    name: '高频小额支付',
    icon: 'bulb',
    description: '每天多笔小额支出，不知不觉掏空钱包',
    detect() { return false; }, // 不逐笔检测，按天聚合
    estimate(matches, allTxs) {
      // 按天统计小额支出（<20元）的天数
      const dailySmallPayments = {};
      allTxs.forEach((tx) => {
        if (tx.amount < 20 && tx.category === '餐饮美食') {
          const day = tx.time.substring(0, 10);
          if (!dailySmallPayments[day]) dailySmallPayments[day] = [];
          dailySmallPayments[day].push(tx);
        }
      });
      const totalSmall = Object.values(dailySmallPayments).flat().reduce((s, t) => s + t.amount, 0);
      const daysWithMulti = Object.keys(dailySmallPayments).filter((d) => dailySmallPayments[d].length >= 2).length;
      if (daysWithMulti < 10) return { annualWaste: 0, suggestion: '小额支出控制得当', severity: 'low' };
      const annualWaste = Math.round(totalSmall * 0.35);
      return {
        annualWaste,
        suggestion: `有 ${daysWithMulti} 天每天 2 笔以上小额餐饮支出（<¥20）。合并消费或自备，可年省约 ¥${annualWaste.toLocaleString()}`,
        severity: daysWithMulti > 30 ? 'high' : 'medium',
      };
    },
  },
];
