function fileDownLoad(data) {
    let blob = null;
    // 创建blob对象，判断浏览器是否支持blob对象
    try {
        //该实例化的方式第一个参数必须是数组的格式
        blob = new Blob([data], {
            type: "application/pdf"
        });
    } catch (e) {
        //旧版本浏览器下的blob创建对象
        window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;

        if (e.name == 'TypeError' && window.BlobBuilder) {
            var blobbuilder = new BlobBuilder();
            BlobBuilder.append(data);
            blob = blobbuilder.getBlob("application/png");
        } else {
            alert("浏览器版本较低，暂不支持该文件类型下载");
        }
    }

    let url = window.URL.createObjectURL(blob);
    var linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('downLoad', 'download.pdf');
    linkElement.click();

    // 释放URL内存
    window.URL.revokeObjectURL(url);
}
async function fetchDownload(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const blob = await response.blob();
        fileDownLoad(blob);
    } catch (error) {
        console.error('下载失败:', error);
        alert(`下载失败: ${error.message}`);
    }
}

// 将这个方法移到一个对象或类的上下文中
const fileManager = {
    async downloadByfetchSimple(url, config) {
        let loading = false;
        try {
            loading = true;
            const rsp = await fetch(url, config);

            if (!rsp.ok) {
                throw new Error(`HTTP错误! 状态码: ${rsp.status}`);
            }
            
            const contentType = rsp.headers.get("Content-Type");
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }
            
            if (contentType.includes('application/json')) {
                const jsonData = await rsp.json();
                
                if (!jsonData) {
                    throw new Error('响应数据为空');
                }

                if (jsonData?.code === 404) {
                    alert('暂无下载文件');
                    return;
                } 
                
                if (!jsonData?.detail) {
                    throw new Error('响应格式错误');
                }
                
                alert(jsonData.detail);
                return;
            }

            const blob = await rsp.blob();
            fileDownLoad(blob);

        } catch (error) {
            console.error('下载失败:', error.message);
            alert(`下载失败: ${error.message}`);
        } finally {
            loading = false;
        }
    },

    async downloadByAxiosSimple(url, config) {
        let loading = false;
        try {
            loading = true;
            const rsp = await axios.get(url, {
                ...config,  
                responseType: 'blob',
            });
            
            if (!rsp || !rsp.data) {
                throw new Error('响应数据为空');
            }

            const contentType = rsp.headers['content-type'];
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }

            if (contentType.includes('application/json')) {
                // 当响应类型为JSON时,需要将blob转换回JSON
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
                    reader.readAsText(rsp.data);
                });

                if (!jsonData) {
                    throw new Error('响应数据为空');
                }

                if (jsonData?.code === 404) {
                    alert('暂无下载文件');
                    return; 
                }

                if (!jsonData?.detail) {
                    throw new Error('响应格式错误');
                }   

                alert(jsonData.detail);
                return;
            }

            fileDownLoad(rsp.data);
        } catch (error) {
            console.error('下载失败:', error.message);  
            alert(`下载失败: ${error.message}`);
        } finally {
            loading = false;
        }
    },

    async downloadByfetch(url, config) {
        let loading = false;
        try {
            loading = true;
            // 使用 Promise.race 实现超时控制
            const fetchWithTimeout = async () => {
                const controller = new AbortController();
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => {
                        controller.abort();
                        reject(new Error('请求超时'));
                    }, 30000)
                );

                const fetchPromise = fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                return Promise.race([fetchPromise, timeout]);
            };

            // 重试逻辑封装
            const fetchWithRetry = async (retries = 3, delay = 1000) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        return await fetchWithTimeout();
                    } catch (err) {
                        if (i === retries - 1) throw err;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        console.warn(`第${i + 1}次重试...`);
                    }
                }
            };

            const rsp = await fetchWithRetry();

            if (!rsp.ok) {
                throw new Error(`HTTP错误! 状态码: ${rsp.status}`);
            }
            
            const contentType = rsp.headers.get("Content-Type");
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }
            
            if (contentType.includes('application/json')) {
                const jsonData = await rsp.json().catch(() => {
                    throw new Error('JSON解析失败');
                });
                
                if (!jsonData) {
                    throw new Error('响应数据为空');
                }

                if (jsonData?.code === 404) {
                    alert('暂无下载文件');
                    return;
                } 
                
                if (!jsonData?.detail) {
                    throw new Error('响应格式错误');
                }
                
                alert(jsonData.detail);
                return;
            }

            const blob = await rsp.blob().catch(() => {
                throw new Error('Blob数据处理失败');
            });
            
            if (!(blob instanceof Blob)) {
                throw new Error('无效的Blob数据');
            }

            fileDownLoad(blob);

        } catch (error) {
            const errorMsg = error.name === 'AbortError' ? '请求超时' : error.message;
            console.error('下载失败:', errorMsg);
            alert(`下载失败: ${errorMsg}`);
        } finally {
            loading = false;
        }
    },

    async downloadByAxios(url, config) {
        let loading = false;
        try {
            loading = true;
            
            // 重试逻辑封装
            const axiosWithRetry = async (retries = 3, delay = 1000) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        return await axios.get(url, {
                            ...config,
                            responseType: 'blob',
                            timeout: 30000
                        });
                    } catch (err) {
                        if (i === retries - 1) throw err;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        console.warn(`第${i + 1}次重试...`);
                    }
                }
            };

            const rsp = await axiosWithRetry();
            
            if (!rsp || !rsp.data) {
                throw new Error('响应数据为空');
            }

            const contentType = rsp.headers['content-type'];
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }
            
            if (contentType === 'application/json') {
                const reader = new FileReader();
                
                // 将FileReader的回调转换为Promise
                const readResult = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('文件读取失败'));
                    reader.readAsText(rsp.data);
                });

                try {
                    const jsonData = JSON.parse(readResult);
                    if (jsonData?.code === 404) {
                        alert('暂无下载文件');
                    } else if (!jsonData?.detail) {
                        throw new Error('响应格式错误');
                    } else {
                        alert(jsonData.detail);
                    }
                } catch (e) {
                    throw new Error('JSON解析失败: ' + e.message);
                }
            } else {
                if (!(rsp.data instanceof Blob)) {
                    throw new Error('响应数据类型错误');
                }
                fileDownLoad(rsp.data);
            }
        } catch (error) {
            console.error('下载失败:', error);
            // 根据错误类型显示不同的错误信息，此处只是实例，需要根据业务需求进行修改
            if (error.code === 'ECONNABORTED') {
                alert('下载超时，请检查网络连接');
            } else if (error.response?.status === 404) {
                alert('文件不存在');
            } else if (error.response?.status === 403) {
                alert('没有下载权限');
            } else {
                alert('下载失败: ' + error.message);
            }
        } finally {
            loading = false;
        }
    },

    async downloadLargeFile(url, filename, progressCallback) {
        let loading = false;
        try {
            loading = true;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP 错误！状态码: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }

            if (contentType === 'application/json') {
                const jsonData = await response.json();
                if (jsonData?.code === 404) {
                    alert('暂无下载文件');
                    return;
                }
                if (!jsonData?.detail) {
                    throw new Error('响应格式错误');
                }
                alert(jsonData.detail);
                return;
            }
            
            const contentLength = response.headers.get("Content-Length");
            if (!contentLength) {
                console.warn("无法获取文件大小，进度可能不准确");
            }
            
            const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
            let receivedSize = 0;
            const reader = response.body.getReader();
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                receivedSize += value.length;
                
                // 计算并显示进度
                if (totalSize) {
                    const percent = Math.round((receivedSize / totalSize) * 100);
                    progressCallback?.(percent); // 进度回调,添加可选链
                } else {
                    progressCallback?.(receivedSize); // 仅显示已下载大小
                }
            }
            
            // 合并 Blob 并触发下载
            const blob = new Blob(chunks);
            fileDownLoad(blob, filename); // 使用已有的fileDownLoad函数
        } catch (error) {
            console.error('下载失败:', error);
            if (error.code === 'ECONNABORTED') {
                alert('下载超时，请检查网络连接');
            } else if (error.response?.status === 404) {
                alert('文件不存在');
            } else if (error.response?.status === 403) {
                alert('没有下载权限'); 
            } else {
                alert('下载失败: ' + error.message);
            }
        } finally {
            loading = false;
        }
    },
      
    async downloadLargeFileByAxios(url, filename, progressCallback) {
        let loading = false;
        try {
            loading = true;
            
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'blob', // 修改为blob类型
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        progressCallback?.(percent);
                    } else {
                        progressCallback?.(progressEvent.loaded); // 仅显示已下载大小
                    }
                }
            });

            if (!response || !response.data) {
                throw new Error('响应数据为空');
            }

            const contentType = response.headers['content-type'];
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }

            if (contentType.includes('application/json')) {
                // 当响应类型为JSON时,需要将blob转换回JSON
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

                if (jsonData?.code === 404) {
                    alert('暂无下载文件');
                    return;
                }
                if (!jsonData?.detail) {
                    throw new Error('响应格式错误');
                }
                alert(jsonData.detail);
                return;
            }

            // 直接使用response.data作为blob
            fileDownLoad(response.data, filename);

        } catch (error) {
            console.error('下载失败:', error);
            if (error.code === 'ECONNABORTED') {
                alert('下载超时，请检查网络连接');
            } else if (error.response?.status === 404) {
                alert('文件不存在');
            } else if (error.response?.status === 403) {
                alert('没有下载权限');
            } else {
                alert('下载失败: ' + error.message);
            }
        } finally {
            loading = false;
        }
    },
      
    async downloadByAxiosStream(url, config) {
        let loading = false;
        try {
            loading = true;
            
            // 获取文件总大小
            const headResponse = await axios.head(url);
            const totalSize = parseInt(headResponse.headers['content-length'], 10);
            let downloadedSize = 0;
            const chunks = [];

            // 分块下载
            for(let start = 0; start < totalSize; start += chunkSize) {
                const end = Math.min(start + chunkSize - 1, totalSize - 1);
                
                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'arraybuffer',
                    ...config,
                    headers: {
                        ...config?.headers,
                        Range: `bytes=${start}-${end}`
                    }
                });

            if (!response || !response.data) {
                throw new Error('响应数据为空');
            }

            const contentType = response.headers['content-type'];
            if (!contentType) {
                throw new Error('无法获取响应内容类型');
            }

                if (contentType.includes('application/json')) {
                    const jsonData = JSON.parse(new TextDecoder().decode(response.data));
                    if (jsonData?.code === 404) {
                        alert('暂无下载文件');
                        return;
                    }
                    if (!jsonData?.detail) {
                        throw new Error('响应格式错误');
                    }
                    alert(jsonData.detail);
                    return;
                }

                chunks.push(new Uint8Array(response.data));
                downloadedSize += response.data.byteLength;
                
                // 计算并显示下载进度
                const progress = Math.round((downloadedSize / totalSize) * 100);
                console.log(`下载进度: ${progress}%`);
            }

            // 合并所有分块
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const mergedArray = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                mergedArray.set(chunk, offset);
                offset += chunk.length;
            }

            // 创建blob并下载
            const blob = new Blob([mergedArray], { type: headResponse.headers['content-type'] });
            fileDownLoad(blob);

        } catch (error) {
            console.error('下载失败:', error);
            if (error.response?.status === 416) {
                alert('服务器不支持范围请求');
            } else {
                alert(`下载失败: ${error.message}`);
            }
        } finally {
            loading = false;
        }
    },

    async downloadByFetchChunks(url, config = {}) {
        let loading = false;
        try {
            loading = true;
            
            // 获取文件大小
            const headResponse = await fetch(url, { method: 'HEAD' });
            const totalSize = parseInt(headResponse.headers.get('content-length'));
            
            if (!totalSize) {
                throw new Error('无法获取文件大小');
            }

            // 设置分块大小为1MB
            const chunkSize = 1024 * 1024; 
            const chunks = [];
            let downloadedSize = 0;

            // 分块下载
            for (let start = 0; start < totalSize; start += chunkSize) {
                const end = Math.min(start + chunkSize - 1, totalSize - 1);
                
                const response = await fetch(url, {
                    ...config,
                    headers: {
                        ...config.headers,
                        Range: `bytes=${start}-${end}`
                    }
                });

                if (!response.ok && response.status !== 206) {
                    throw new Error(`HTTP错误! 状态码: ${response.status}`);
                }

                // 获取响应数据
                const buffer = await response.arrayBuffer();
                const chunk = new Uint8Array(buffer);
                chunks.push(chunk);
                
                // 更新下载进度
                downloadedSize += chunk.length;
                const progress = Math.round((downloadedSize / totalSize) * 100);
                console.log(`下载进度: ${progress}%`);
                
                // 每下载3个分块就合并一次并清空chunks数组，以优化内存使用
                if (chunks.length >= 3) {
                    const mergedLength = chunks.reduce((acc, c) => acc + c.length, 0);
                    const mergedChunk = new Uint8Array(mergedLength);
                    let offset = 0;
                    for (const c of chunks) {
                        mergedChunk.set(c, offset);
                        offset += c.length;
                    }
                    chunks.length = 0;
                    chunks.push(mergedChunk);
                }
            }

            // 最终合并
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const mergedArray = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                mergedArray.set(chunk, offset);
                offset += chunk.length;
            }

            const blob = new Blob([mergedArray], { type: headResponse.headers.get('content-type') });
            fileDownLoad(blob);

        } catch (error) {
            console.error('下载失败:', error);
            if (error.response?.status === 416) {
                alert('服务器不支持范围请求');
            } else {
                alert(`下载失败: ${error.message}`);
            }
        } finally {
            loading = false;
        }
    },

    async downloadByFetchRange(url, config, chunkSize) {
        let loading = false;
        try {
            loading = true;
            
            // 获取文件总大小
            const headResponse = await fetch(url, { method: 'HEAD' });
            const totalSize = parseInt(headResponse.headers.get('content-length'), 10);
            let downloadedSize = 0;
            const chunks = [];

            // 并发下载,每次最多5个请求
            const concurrentLimit = 5;
            const tasks = [];
            
            for(let start = 0; start < totalSize; start += chunkSize) {
                const end = Math.min(start + chunkSize - 1, totalSize - 1);
                
                const task = async () => {
                    const response = await fetch(url, {
                        ...config,
                        headers: {
                            ...config?.headers,
                            Range: `bytes=${start}-${end}`
                        }
                    });

                    if (!response.ok && response.status !== 206) {
                        throw new Error(`HTTP错误! 状态码: ${response.status}`);
                    }

                    const contentType = response.headers.get('content-type');
                    if (!contentType) {
                        throw new Error('无法获取响应内容类型');
                    }

                    if (contentType.includes('application/json')) {
                        const jsonData = await response.json();
                        if (jsonData?.code === 404) {
                            alert('暂无下载文件');
                            return null;
                        }
                        if (!jsonData?.detail) {
                            throw new Error('响应格式错误');
                        }
                        alert(jsonData.detail);
                        return null;
                    }

                    const buffer = await response.arrayBuffer();
                    const chunk = new Uint8Array(buffer);
                    return {
                        index: start / chunkSize,
                        data: chunk
                    };
                };

                tasks.push(task);

                if (tasks.length === concurrentLimit || start + chunkSize >= totalSize) {
                    // 并发执行当前批次的任务
                    const results = await Promise.all(tasks.map(t => t()));
                    
                    // 按顺序处理结果
                    for (const result of results) {
                        if (result) {
                            chunks[result.index] = result.data;
                            downloadedSize += result.data.length;
                            const progress = Math.round((downloadedSize / totalSize) * 100);
                            console.log(`下载进度: ${progress}%`);
                        }
                    }
                    
                    tasks.length = 0;
                }
            }

            // 合并所有分块
            const validChunks = chunks.filter(Boolean);
            const totalLength = validChunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const mergedArray = new Uint8Array(totalLength);
            let offset = 0;
            
            for (const chunk of validChunks) {
                mergedArray.set(chunk, offset);
                offset += chunk.length;
            }

            const blob = new Blob([mergedArray], { 
                type: headResponse.headers.get('content-type')
            });
            fileDownLoad(blob);

        } catch (error) {
            console.error('下载失败:', error);
            if (error.status === 416) {
                alert('服务器不支持范围请求');
            } else {
                alert(`下载失败: ${error.message}`);
            }
        } finally {
            loading = false;
        }
    },

    async downloadByFetchRange2(url, filename, chunkSize = 10 * 1024 * 1024, concurrentLimit = 5) {
        let loading = false;
        try {
            loading = true;
            
            // 🚀 1️⃣ 获取文件总大小
            const headResponse = await fetch(url, { method: 'HEAD' });
            const totalSize = parseInt(headResponse.headers.get('content-length'), 10);
            const contentType = headResponse.headers.get('content-type');
        
    
            if (!totalSize) {
                throw new Error('无法获取文件大小，服务器可能不支持断点续传');
            }
    
            let downloadedSize = 0; // 记录已下载字节数
            const numChunks = Math.ceil(totalSize / chunkSize);
            const mergedArray = new Uint8Array(totalSize); // 最终数据存储
    
            // 🚀 2️⃣ 创建一个并发池，控制最大并发数
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
    
            // 🚀 3️⃣ 生成所有 chunk 下载任务
            const tasks = Array.from({ length: numChunks }, (_, index) => {
                const start = index * chunkSize;
                const end = Math.min(start + chunkSize - 1, totalSize - 1);
    
                return async () => {
                    const response = await fetch(url, {
                        headers: { Range: `bytes=${start}-${end}` }
                    });
    
                    if (!response.ok && response.status !== 206) {
                        throw new Error(`HTTP错误! 状态码: ${response.status}`);
                    }
    
                    const buffer = await response.arrayBuffer();
                    const chunk = new Uint8Array(buffer);
                    
                    // 🚀 直接写入 `mergedArray`，避免数组排序
                    mergedArray.set(chunk, start);
    
                    downloadedSize += chunk.length;
                    const progress = Math.round((downloadedSize / totalSize) * 100);
                    console.log(`✅ 下载进度: ${progress}%`);
                };
            });
    
            // 🚀 4️⃣ 通过 asyncPool 并行下载
            await asyncPool(concurrentLimit, tasks, (task) => task());
    
            // 🚀 5️⃣ 合并所有分块并生成 `Blob`
            const blob = new Blob([mergedArray], { type: contentType });
            fileDownLoad(blob, filename);
    
        } catch (error) {
            console.error('下载失败:', error);
            if (error.status === 416) {
                alert('服务器不支持范围请求');
            } else {
                alert(`下载失败: ${error.message}`);
            }
        } finally {
            loading = false;
        }
    }
    
};
