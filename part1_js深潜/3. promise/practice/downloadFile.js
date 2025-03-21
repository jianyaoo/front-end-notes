import axios from 'axios';

// 实现一个支持多种下载方式的文件下载类
class DownloadFile {
    // Blob 处理相关方法
    static createBlob(data, type = 'application/pdf') {
        try {
            // Notes1：该实例化的方式第一个参数必须是数组的格式
            return new Blob([data], { type });
        } catch (e) {
            // 兼容旧版本浏览器
            window.BlobBuilder = window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder ||
                window.MSBlobBuilder;

            if (e.name === 'TypeError' && window.BlobBuilder) {
                const blobBuilder = new BlobBuilder();
                blobBuilder.append(data);
                return blobBuilder.getBlob(type);
            }
            throw new Error('浏览器版本较低，暂不支持该文件类型下载');
        }
    }

    static downloadBlob(blob, filename = 'download.pdf') {
        let url = window.URL.createObjectURL(blob);
        var linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('downLoad', filename);
        linkElement.click();
        window.URL.revokeObjectURL(url);
    }

    // 响应内容类型检查
    static async checkContentType(response) {
        const isAxios = this.adapter === 'axios';

        const contentType = isAxios ?
            response.headers['content-type'] :
            response.headers.get('content-type');

        if (!contentType) {
            throw new Error('无法获取响应内容类型');
        }

        if (contentType.includes('application/json')) {
            let jsonData;
            if (isAxios) {
                // Axios blob转JSON
                const reader = new FileReader();
                jsonData = await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        try {
                            resolve(JSON.parse(reader.result));
                        } catch (e) {
                            reject(new Error('JSON解析失败'));
                        }
                    };
                    reader.onerror = () => reject(new Error('读取响应数据失败'));
                    reader.readAsText(response.data);
                });
            } else {
                jsonData = await response.json();
            }

            if (!jsonData) {
                throw new Error('响应数据为空');
            }

            if (jsonData?.code === 404) {
                throw new Error('暂无下载文件');
            }

            if (!jsonData?.detail) {
                throw new Error('响应格式错误');
            }

            throw new Error(jsonData.detail);
        }

        return contentType;
    }

    // 业务状态码判断阶段，需要根据具体的业务场景补充
    static handleCodeError(jsonData) {
        if (jsonData?.code === 404) {
            throw new Error('暂无下载文件');
        }

        throw new Error(jsonData.detail);
    }

    // 辅助方法: fetch 超时和重试
    static async fetchWithRetry(url, config, timeout = 30000, retries = 3, delay = 1000) {
        // 通过在catch中设置异步延时来控制下一次for循环，从而达到多次重试之间的间隔处理
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                // 设置超时时间
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => {
                        controller.abort();
                        reject(new Error('请求超时'));
                    }, timeout)
                );

                const fetchPromise = fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                const response = await Promise.race([fetchPromise, timeoutPromise]);

                // 检查HTTP状态码
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态码: ${response.status}`);
                }

                // 检查响应是否为JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const jsonData = await response.clone().json();
                    // 业务状态码判断阶段，需要根据具体的业务场景补充
                    // 这里不使用 checkContentType通用方法，因为一般报错重试都是用户无感知的，而普通下载报错是用户可感知的
                    this.handleCodeError(jsonData);
                }

                return response;
            } catch (err) {
                if (i === retries - 1) throw err;
                // 在上一次报错后，等待一定的延时间隔，再重新开启下一次的循环
                await new Promise(resolve => setTimeout(resolve, delay));
                // 打印重试次数
                console.warn(`第${i + 1}次重试...`);
            }
        }
    }

    // 辅助方法: axios 重试
    static async axiosWithRetry(url, config, timeout = 30000, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(url, {
                    ...config,
                    responseType: 'blob',
                    timeout: timeout
                });

                // 检查响应是否为JSON
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    // 需要将blob转换为json来检查业务状态码
                    const reader = new FileReader();
                    const jsonData = await new Promise((resolve, reject) => {
                        reader.onload = () => {
                            try {
                                resolve(JSON.parse(reader.result));
                            } catch (e) {
                                reject(new Error('JSON解析失败'));
                            }
                        };
                        reader.onerror = () => reject(new Error('读取响应数据失败'));
                        reader.readAsText(response.data);
                    });

                    // 业务状态码判断阶段，需要根据具体的业务场景补充
                    this.handleCodeError(jsonData);
                }

                return response;
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`第${i + 1}次重试...`);
            }
        }
    }

    // 统一错误处理
    static handleError(error) {
        console.error('下载失败:', error);
        console.log(error);
        let message = error.message;

        if (error.code === 'ECONNABORTED') {
            message = '下载超时，请检查网络连接';
        } else if (error.response?.status === 404) {
            message = '文件不存在';
        } else if (error.response?.status === 403) {
            message = '没有下载权限';
        } else if (error.response?.status === 416) {
            message = '服务器不支持范围请求';
        }

        alert(`下载失败: ${message}`);
    }

    // Fetch基础下载
    static async downloadByFetch(url, config = {}) {
        let loading = false;
        try {
            loading = true;
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            await this.checkContentType(response);

            const blob = await response.blob();
            this.downloadBlob(blob);

        } catch (error) {
            this.handleError(error);
        } finally {
            loading = false;
        }
    }

    // Axios基础下载
    static async downloadByAxios(url, config = {}) {
        let loading = false;
        try {
            loading = true;
            const response = await axios.get(url, {
                ...config,
                responseType: 'blob'
            });

            if (!response?.data) {
                throw new Error('响应数据为空');
            }

            await this.checkContentType(response, true);

            this.downloadBlob(response.data);
        } catch (error) {
            this.handleError(error);
        } finally {
            loading = false;
        }
    }

    // Fetch 超时重试下载
    static async downloadByfetchWithRetry(url, config, timeout = 30000, retries = 3, delay = 1000) {
        let loading = false;
        try {
            loading = true;
            const response = await this.fetchWithRetry(url, config, timeout, retries, delay);
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            const blob = await response.blob();
            this.downloadBlob(blob);
        } catch (error) {
            console.log(error);
            const errorMsg = error.name === 'AbortError' ? '请求超时' : error.message;
            this.handleError(new Error(errorMsg));
        } finally {
            loading = false;
        }
    }

    // Axios 超时重试下载
    static async downloadByAxiosWithRetry(url, config, timeout = 30000, retries = 3, delay = 1000) {
        let loading = false;
        try {
            loading = true;
            const response = await this.axiosWithRetry(url, config, timeout, retries, delay);
            
            // 合并数据校验逻辑
            if (!response?.data || !(response.data instanceof Blob)) {
                throw new Error('响应数据无效');
            }
            
            this.downloadBlob(response.data);
        } catch (error) {
            this.handleError(new Error(error.message || '下载失败'));
        } finally {
            loading = false;
        }
    }

    // 大文件分片下载
    static async downloadLargeFile(url, filename, progressCallback, chunkSize = 1024 * 1024, concurrentLimit = 5) {
        let loading = false;
        try {
            loading = true;
            
            // 获取文件信息
            const headResponse = await fetch(url, { method: 'HEAD' });
            const totalSize = parseInt(headResponse.headers.get('content-length'), 10);
            const contentType = headResponse.headers.get('content-type');

            if (!totalSize) {
                throw new Error('无法获取文件大小');
            }

            // 初始化下载状态
            let downloadedSize = 0;
            const mergedArray = new Uint8Array(totalSize);

            // 并发控制池
            const asyncPool = async (poolLimit, array, iteratorFn) => {
                const ret = [];
                const executing = new Set();
                for (const item of array) {
                    const p = iteratorFn(item);
                    ret.push(p);
                    executing.add(p);
                    p.then(() => executing.delete(p));
                    if (executing.size >= poolLimit) {
                        await Promise.race(executing);
                    }
                }
                return Promise.all(ret);
            };

            // 生成分片下载任务
            const numChunks = Math.ceil(totalSize / chunkSize);
            const tasks = Array.from({ length: numChunks }, (_, index) => {
                const start = index * chunkSize;
                const end = Math.min(start + chunkSize - 1, totalSize - 1);

                console.log(start, end);

                return async () => {
                    const response = await fetch(url, {
                        headers: { Range: `bytes=${start}-${end}` }
                    });

                    if (!response.ok && response.status !== 206) {
                        throw new Error(`HTTP错误! 状态码: ${response.status}`);
                    }

                    const buffer = await response.arrayBuffer();
                    const chunk = new Uint8Array(buffer);
                    mergedArray.set(chunk, start);

                    // 更新进度
                    downloadedSize += chunk.length;
                    const progress = Math.round((downloadedSize / totalSize) * 100);
                    progressCallback?.(progress);
                };
            });

            // 执行并发下载
            await asyncPool(concurrentLimit, tasks, (task) => task());

            // 合并下载结果并触发下载
            const blob = new Blob([mergedArray], { type: contentType });
            this.downloadBlob(blob, filename);

        } catch (error) {
            this.handleError(error);
        } finally {
            loading = false;
        }
    }

}

export default DownloadFile;