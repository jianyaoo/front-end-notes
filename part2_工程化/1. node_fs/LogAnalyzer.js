// 大日志文件分析
// 场景：需要分析单个200MB+的nginx日志文件，统计每小时请求量。请用流式处理方案避免内存溢出，并处理不同操作系统换行符差异。
const fs = require('fs');
const path = require('path');
const {Transform} = require('stream');

// 实现思路：对文件边读边进行处理，最后输出处理后的结果
class LogAnalyzer {
    constructor(logFilePath){
        this.logFilePath = path.resolve(logFilePath);
        this.hourlyStats = new Map();
    }

     analyze(){
    
        const stateStream = new Transform({
            transform: (chunk, encoding, callback)=>{
                const lines = chunk.toString().split(/\r\n|\n|\r/);
                for (const line of lines){
                    if (line.trim()){
                        const hourKey = line.split(' ')[1];
                        this.hourlyStats.set(hourKey, (this.hourlyStats.get(hourKey) || 0) + 1);
                    }
                }
                callback();
            }
        })

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.logFilePath, {
                highWaterMark: 1024 * 1024
            })
            .on('error', reject)
            .pipe(stateStream)
            .on('finish', () => {
                resolve(this.hourlyStats);
            })
        })
    }
}

const logAnalyzer = new LogAnalyzer('./test/log.txt');
logAnalyzer.analyze().then((stats) => {
    console.table(stats);
})