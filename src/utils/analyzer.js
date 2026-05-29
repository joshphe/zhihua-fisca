/**
 * 多维度聚合分析
 * - 月度趋势
 * - 类别排行（金额/笔数/笔均）
 * - 月度 x 类别交叉分析
 * - 异常大额交易识别
 * - 高频消费分析
 */

export function monthlyTrend(transactions) {
  const months = {};
  transactions.forEach((tx) => {
    const month = tx.time.substring(0, 7); // "2025-06"
    if (!months[month]) months[month] = { month, total: 0, count: 0, categories: {} };
    months[month].total += tx.amount;
    months[month].count += 1;
    if (!months[month].categories[tx.category]) {
      months[month].categories[tx.category] = 0;
    }
    months[month].categories[tx.category] += tx.amount;
  });

  const sorted = Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  const avgMonthly = sorted.length > 0
    ? sorted.reduce((s, m) => s + m.total, 0) / sorted.length
    : 0;

  return {
    months: sorted,
    avgMonthly,
    maxMonth: sorted.reduce((max, m) => (m.total > max.total ? m : max), { total: 0 }),
    minMonth: sorted.reduce((min, m) => (m.total < min.total ? m : min), { total: Infinity }),
  };
}

export function categoryBreakdown(transactions) {
  const cats = {};
  transactions.forEach((tx) => {
    if (!cats[tx.category]) cats[tx.category] = { name: tx.category, total: 0, count: 0 };
    cats[tx.category].total += tx.amount;
    cats[tx.category].count += 1;
  });

  const list = Object.values(cats).map((c) => ({
    ...c,
    avg: c.count > 0 ? c.total / c.count : 0,
    pct: 0, // will compute below
  }));

  const grandTotal = list.reduce((s, c) => s + c.total, 0);
  list.forEach((c) => {
    c.pct = grandTotal > 0 ? (c.total / grandTotal * 100) : 0;
  });

  list.sort((a, b) => b.total - a.total);

  return { categories: list, grandTotal };
}

export function findAnomalies(transactions, threshold = 5000) {
  return transactions
    .filter((tx) => tx.amount >= threshold)
    .sort((a, b) => b.amount - a.amount);
}

export function highFrequencyAnalysis(transactions) {
  const food = transactions.filter((tx) => tx.category === '餐饮美食');
  const transport = transactions.filter((tx) => tx.category === '交通出行');

  const days = (txs) => {
    if (txs.length === 0) return { avgPerDay: 0, avgAmount: 0 };
    const dates = [...new Set(txs.map((t) => t.time.substring(0, 10)))];
    return {
      totalDays: dates.length,
      avgPerDay: dates.length > 0 ? txs.length / dates.length : 0,
      avgAmount: txs.length > 0 ? txs.reduce((s, t) => s + t.amount, 0) / txs.length : 0,
      totalAmount: txs.reduce((s, t) => s + t.amount, 0),
      count: txs.length,
    };
  };

  return {
    food: days(food),
    transport: days(transport),
    totalDays: [...new Set(transactions.map((t) => t.time.substring(0, 10)))].length,
  };
}

export function generateRecommendations(transactions, classification, allRecordsSummary) {
  const recs = [];
  const catBreakdown = categoryBreakdown(transactions);
  const trend = monthlyTrend(transactions);
  const anomalies = findAnomalies(transactions);
  const highFreq = highFrequencyAnalysis(transactions);
  const { totals, ratios } = classification;

  // 1. 娱乐支出过高
  const entertainment = catBreakdown.categories.find((c) => c.name === '文化休闲');
  if (entertainment && entertainment.pct > 20) {
    recs.push({
      icon: 'entertainment',
      title: '文化休闲支出占比过高',
      level: 'warning',
      detail: `文化休闲年支出 ¥${entertainment.total.toLocaleString()}，占总支出 ${entertainment.pct.toFixed(1)}%，为最大消费类别。建议设定每季度娱乐预算上限，大额消费前预留 48 小时冷静期。`,
    });
  }

  // 2. 外卖频率
  if (highFreq.food.avgPerDay > 1.5) {
    const annualFood = highFreq.food.totalAmount;
    const potentialSave = Math.round(annualFood * 0.3);
    recs.push({
      icon: 'food',
      title: '外卖/快餐消费频率较高',
      level: 'info',
      detail: `餐饮年支出 ¥${annualFood.toLocaleString()}，日均 ${highFreq.food.avgPerDay.toFixed(1)} 笔，笔均 ¥${highFreq.food.avgAmount.toFixed(1)}。如减少 30% 外卖改为自炊，预估年省约 ¥${potentialSave.toLocaleString()}。`,
    });
  }

  // 3. 月度异常
  if (trend.maxMonth.total > trend.avgMonthly * 3) {
    recs.push({
      icon: 'spike',
      title: `${trend.maxMonth.month} 月支出异常激增`,
      level: 'danger',
      detail: `${trend.maxMonth.month} 月支出 ¥${trend.maxMonth.total.toLocaleString()}，是月均（¥${Math.round(trend.avgMonthly).toLocaleString()}）的 ${(trend.maxMonth.total / trend.avgMonthly).toFixed(1)} 倍。请回顾该月大额消费，评估是否可避免。`,
    });
  }

  // 4. 非必需占比过高
  const nonEssentialPct = parseFloat(ratios.nonEssential);
  if (nonEssentialPct > 30) {
    recs.push({
      icon: 'bulb',
      title: '非必需开支占比偏高',
      level: 'warning',
      detail: `非必需支出占总支出的 ${ratios.nonEssential}%（¥${totals.nonEssential.toLocaleString()}）。建议采用"50-30-20"法则：50% 必需、30% 享受、20% 储蓄。`,
    });
  }

  // 5. 信用卡还款提醒
  if (allRecordsSummary) {
    const neutralTotal = allRecordsSummary.neutral.reduce((s, r) => s + r.amount, 0);
    if (neutralTotal > 50000) {
      recs.push({
        icon: 'credit',
        title: '信用卡循环还款需关注',
        level: 'warning',
        detail: `不计收支类（含信用卡还款、转账等）总额 ¥${neutralTotal.toLocaleString()}。请确认是否产生循环利息，尽早制定还款计划，避免利息滚雪球。`,
      });
    }
  }

  // 6. 大额单笔消费
  if (anomalies.length > 0) {
    const topAnomaly = anomalies[0];
    recs.push({
      icon: 'search',
      title: '存在大额单笔消费',
      level: anomalies.length > 3 ? 'danger' : 'info',
      detail: `检测到 ${anomalies.length} 笔超 ¥5,000 的大额消费，最大单笔 ¥${topAnomaly.amount.toLocaleString()}（${topAnomaly.product || topAnomaly.category}）。建议对大额支出提前做预算规划，避免冲动消费。`,
    });
  }

  // 7. 储蓄建议
  recs.push({
    icon: 'target',
    title: '建立储蓄习惯',
    level: 'info',
    detail: `建议每月发薪日自动转存月收入的 20% 到独立储蓄账户。根据月均支出 ¥${Math.round(trend.avgMonthly).toLocaleString()}，建议保留 3-6 个月生活费（¥${(Math.round(trend.avgMonthly) * 3).toLocaleString()} - ¥${(Math.round(trend.avgMonthly) * 6).toLocaleString()}）作为紧急备用金。`,
  });

  return recs;
}
