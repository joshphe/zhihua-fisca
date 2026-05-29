import { mapWechatCategory } from '../constants/billTypes';

const XLSX = window.XLSX;

/**
 * 将 Excel 日期序列号转为 ISO 日期字符串
 * Excel 序列号：1900-01-01 = 1（含 1900 年闰年 bug）
 */
function excelDateToISO(serial) {
  if (typeof serial === 'string') {
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return serial;
    return '';
  }
  if (typeof serial !== 'number' || isNaN(serial)) return '';

  const utcDays = Math.floor(serial) - 25569;
  const utcMs = utcDays * 86400000;
  const fractionalDay = serial - Math.floor(serial);
  const timeMs = Math.round(fractionalDay * 86400000);
  const date = new Date(utcMs + timeMs);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 解析微信支付 .xlsx 账单文件
 * 微信 xlsx 是多列结构：交易时间 | 交易类型 | 交易对方 | 商品 | 收/支 | 金额(元) | 支付方式 | 当前状态 | 交易单号 | 商户单号 | 备注
 */
export function parseWechatFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 每一行是一个数组，每个单元格是数组的一个元素
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // 找到表头行：第0列含"交易时间"且第1列含"交易类型"
        let headerRow = -1;
        for (let i = 0; i < rows.length; i++) {
          const c0 = String(rows[i][0] || '').trim();
          const c1 = String(rows[i][1] || '').trim();
          if (c0.includes('交易时间') && c1.includes('交易类型')) {
            headerRow = i;
            break;
          }
        }

        if (headerRow === -1) {
          reject(new Error('未找到有效表头，请确认是微信支付账单文件'));
          return;
        }

        const all = [];

        for (let i = headerRow + 1; i < rows.length; i++) {
          const rawTime = rows[i][0];
          const txType = String(rows[i][1] || '').trim();
          const counterparty = String(rows[i][2] || '').trim();
          const product = String(rows[i][3] || '').trim();
          const direction = String(rows[i][4] || '').trim();
          const amountStr = String(rows[i][5] || '').trim();
          const paymentMethod = String(rows[i][6] || '').trim();
          const status = String(rows[i][7] || '').trim();
          const orderId = String(rows[i][8] || '').trim();

          // 跳过空行、分隔行、说明行
          if (!txType && !rawTime) continue;
          if (direction === '/' || direction === '') continue;

          // 跳过不计收支的交易
          if (direction !== '支出' && direction !== '收入') continue;

          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount <= 0) continue;

          // 转换日期（Excel 序列号 → ISO 字符串）
          const serialNum = typeof rawTime === 'number' ? rawTime : parseFloat(rawTime);
          const timeStr = (!isNaN(serialNum) && serialNum > 40000)
            ? excelDateToISO(serialNum)
            : String(rawTime || '').trim();

          // 分类映射
          const category = mapWechatCategory(txType, counterparty, product);
          if (category === null) continue;

          all.push({
            time: timeStr,
            category,
            counterparty,
            product: product || counterparty,
            type: direction,
            amount,
            paymentMethod,
            status,
          });
        }

        const expenses = all.filter((r) => r.type === '支出');
        const income = all.filter((r) => r.type === '收入');

        if (expenses.length === 0) {
          reject(new Error('未找到有效支出记录，请确认文件格式正确'));
          return;
        }

        resolve({
          expenses,
          summary: { income, expense: expenses, neutral: [] },
        });
      } catch (err) {
        reject(new Error(`微信账单解析失败：${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}
