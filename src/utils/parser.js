import Papa from 'papaparse';

/**
 * 一次读取文件，返回 expenses 列表 + all records summary
 * 编码处理：支付宝导出 CSV 通常是 GBK，尝试 GBK → UTF-8 回退
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target.result);

        // 先尝试 GBK（支付宝导出的默认编码），失败则回退 UTF-8
        let text;
        try {
          text = new TextDecoder('gbk').decode(buffer);
        } catch {
          text = new TextDecoder('utf-8').decode(buffer);
        }

        // 验证解码结果是否包含预期中文
        if (!text.includes('交易时间') && !text.includes('收/支')) {
          // GBK 失败，尝试 UTF-8
          text = new TextDecoder('utf-8').decode(buffer);
        }

        // 找到 CSV 表头行
        const lines = text.split(/\r?\n/);
        const headerIndex = lines.findIndex((line) => line.startsWith('交易时间'));
        if (headerIndex === -1) {
          reject(new Error('未找到有效表头，请确认是支付宝交易明细 CSV 文件'));
          return;
        }

        const csvText = lines.slice(headerIndex).join('\n');

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const all = results.data
              .filter((row) => {
                const amount = parseFloat(row['金额']);
                return !isNaN(amount) && amount > 0;
              })
              .map((row) => ({
                time: (row['交易时间'] || '').trim(),
                category: (row['交易分类'] || '其他').trim(),
                counterparty: (row['交易对方'] || '').trim(),
                product: (row['商品说明'] || '').trim(),
                type: (row['收/支'] || '').trim(),
                amount: parseFloat(row['金额']) || 0,
                paymentMethod: (row['收/付款方式'] || '').trim(),
                status: (row['交易状态'] || '').trim(),
              }));

            const expenses = all.filter((r) => r.type === '支出');

            if (expenses.length === 0) {
              reject(new Error('未找到有效支出记录，请确认文件格式正确'));
              return;
            }

            resolve({
              expenses,
              summary: {
                income: all.filter((r) => r.type === '收入'),
                expense: expenses,
                neutral: all.filter((r) => r.type === '不计收支'),
              },
            });
          },
          error: (err) => reject(new Error(`CSV 解析失败：${err.message}`)),
        });
      } catch (err) {
        reject(new Error(`文件处理失败：${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}
