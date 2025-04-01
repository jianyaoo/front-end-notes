// 大日志文件分析
// 场景：需要分析单个200MB+的nginx日志文件，统计每小时请求量。请用流式处理方案避免内存溢出，并处理不同操作系统换行符差异。
const fs = require('fs');
const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');
const path = require('path');

// 读取一个200MB的日志文件，从每一行中获取时间戳，并按小时分组统计请求次数。
// 1-读取一个文件，按行读取
// 2-解析每一行，提取时间戳
// 3-按小时分组统计请求次数
// 4-输出结果
class LogAnalyzer {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.hourlyStats = new Map();
    this.decoder = new StringDecoder('utf8');
  }

  parseLine(line) {
    // 使用高效正则匹配Nginx默认日志格式
    const logPattern = /^.*?\[(\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2}).*?\].*$/;
    const match = line.match(logPattern);
    
    if (!match || !match[1]) {
      return { error: 'Invalid log format' };
    }

    try {
      const dateStr = match[1].replace(/\//g, ' ');
      const date = new Date(dateStr);
      return date.isValid() ? date : null;
    } catch (e) {
      return { error: e.message };
    }
  }

  analyze() {
    return new Promise((resolve, reject) => {
      const statsStream = new Transform({
        transform: (chunk, encoding, callback) => {
          // 处理可能的Buffer残留数据
          const data = this.decoder.write(chunk);
          
          data.split(/\r?\n/) // 处理所有换行符
            .forEach(line => {
              if (!line.trim()) return;
              
              const result = this.parseLine(line);
              if (result instanceof Date) {
                const hourKey = result.toISOString().slice(0, 13); // 按UTC小时分组
                this.hourlyStats.set(hourKey, (this.hourlyStats.get(hourKey) || 0) + 1);
              }
            });

          callback();
        },
        flush: (callback) => {
          this.decoder.end();
          callback();
        }
      });

      fs.createReadStream(this.filePath, {
        highWaterMark: 1024 * 1024 // 1MB缓冲区
      })
      .on('error', reject)
      .pipe(statsStream)
      .on('finish', () => resolve(this.getFormattedStats()))
      .on('error', reject);
    });
  }

  getFormattedStats() {
    return Array.from(this.hourlyStats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, count]) => ({
        hour: hour.replace('T', ' '),
        requests: count
      }));
  }
}

// 使用示例
(async () => {
  try {
    const analyzer = new LogAnalyzer('./access.log');
    const result = await analyzer.analyze();
    
    // 输出CSV格式结果
    console.log('Hour,Requests');
    result.forEach(row => {
      console.log(`${row.hour},${row.requests}`);
    });
    
    // 可选：写入文件
    // fs.writeFileSync('./report.csv', 
    //   'Hour,Requests\n' + 
    //   result.map(r => `${r.hour},${r.requests}`).join('\n')
    // );
  } catch (err) {
    console.error('分析失败:', err);
    process.exit(1);
  }
})();