import { CATEGORY_MAP } from '../constants/categories';

/**
 * 为每笔交易打上 必须/非必须 标签
 */
export function classifyTransaction(tx) {
  const info = CATEGORY_MAP[tx.category] || { essential: 'other' };
  return { ...tx, essential: info.essential };
}

/**
 * 批量分类，并返回聚合统计
 */
export function classifyAll(transactions) {
  const classified = transactions.map(classifyTransaction);

  const result = {
    essential: [],
    'non-essential': [],
    debt: [],
    other: [],
    income: [],
  };

  let totalEssential = 0;
  let totalNonEssential = 0;
  let totalDebt = 0;
  let totalOther = 0;

  classified.forEach((tx) => {
    const tag = tx.essential || 'other';
    if (result[tag]) result[tag].push(tx);

    if (tag === 'essential') totalEssential += tx.amount;
    else if (tag === 'non-essential') totalNonEssential += tx.amount;
    else if (tag === 'debt') totalDebt += tx.amount;
    else totalOther += tx.amount;
  });

  const grandTotal = totalEssential + totalNonEssential + totalDebt + totalOther;

  return {
    transactions: classified,
    categorized: result,
    totals: {
      essential: totalEssential,
      nonEssential: totalNonEssential,
      debt: totalDebt,
      other: totalOther,
      grandTotal,
    },
    ratios: {
      essential: grandTotal > 0 ? (totalEssential / grandTotal * 100).toFixed(1) : '0',
      nonEssential: grandTotal > 0 ? (totalNonEssential / grandTotal * 100).toFixed(1) : '0',
      debt: grandTotal > 0 ? (totalDebt / grandTotal * 100).toFixed(1) : '0',
      other: grandTotal > 0 ? (totalOther / grandTotal * 100).toFixed(1) : '0',
    },
  };
}
