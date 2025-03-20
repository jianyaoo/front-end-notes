<template>
  <div class="download-test">
    <h2>文件下载测试</h2>
    
    <div class="button-group">
      <button @click="handleFetchDownload" :disabled="loading">
        Fetch基础下载
      </button>
      
      <button @click="handleAxiosDownload" :disabled="loading">
        Axios基础下载
      </button>
      
      <button @click="handleFetchRetryDownload" :disabled="loading">
        Fetch重试下载
      </button>
      
      <button @click="handleAxiosRetryDownload" :disabled="loading">
        Axios重试下载
      </button>
      
      <button @click="handleLargeFileDownload" :disabled="loading">
        大文件分片下载
      </button>
    </div>

    <!-- 大文件下载进度条 -->
    <div v-if="downloadProgress > 0" class="progress-bar">
      <div class="progress" :style="{ width: `${downloadProgress}%` }">
        {{ downloadProgress }}%
      </div>
    </div>
  </div>
</template>

<script>
import DownloadFile from '../utils/downloadFile';

export default {
  name: 'FileDownloadTest',
  data() {
    return {
      loading: false,
      downloadProgress: 0
    }
  },
  methods: {
    // Fetch基础下载
    async handleFetchDownload() {
      const url = 'http://localhost:3131/000001.pdf';
      await DownloadFile.downloadByFetch(url);
    },

    // Axios基础下载
    async handleAxiosDownload() {
      const url = 'http://localhost:3131/000000.pdf';
      await DownloadFile.downloadByAxios(url);
    },

    // Fetch重试下载
    async handleFetchRetryDownload() {
      const url = 'http://localhost:3131/000000.pdf';
      const config = {};
      await DownloadFile.downloadByfetchWithRetry(url, config, 30000, 3, 1000);
    },

    // Axios重试下载
    async handleAxiosRetryDownload() {
      const url = 'http://localhost:3131/000001.pdf';
      const config = {};
      await DownloadFile.downloadByAxiosWithRetry(url, config, 30000, 3, 1000);
    },

    // 大文件分片下载
    async handleLargeFileDownload() {
      const url = 'http://localhost:3131/000001.pdf';
      const filename = 'large-file.pdf';
      
      // 进度回调函数
      const progressCallback = (progress) => {
        this.downloadProgress = progress;
      };
      
      await DownloadFile.downloadLargeFile(
        url,
        filename,
        progressCallback,
        1024 * 1024, // 1MB chunks
        5 // 5个并发请求
      );
      
      // 下载完成后重置进度
      setTimeout(() => {
        this.downloadProgress = 0;
      }, 1000);
    }
  }
}
</script>

<style scoped>
.download-test {
  padding: 20px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  text-align: center;
  line-height: 20px;
  color: white;
  transition: width 0.3s ease;
}
</style> 