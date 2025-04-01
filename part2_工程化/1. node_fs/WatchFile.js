// 01. 配置文件热加载
// 场景：实现一个实时读取应用配置的功能，当项目根目录的config.json文件内容变化时，自动重新加载配置。需要考虑文件监听、异常处理以及如何避免重复触发事件。
const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

// 需求分解：需要对一个文件进行监听，并在它发生改变时做出一些事情
class WatchFile extends EventEmitter {
  constructor(filePath) {
    super();
    this.filePath = path.resolve(filePath);
    this.config = null;
    this.timer = null;
    this.watcher = null;

    this.init();
  }

  async init() {
    try {
      await this.loadFile();
      await this.startWatch();
    } catch (error) {
      console.error(`初始化失败: ${error.message}`);
    }
  }

  async loadFile() {
    try {
      const config = await fs.promises.readFile(this.filePath, "utf-8");
      this.config = JSON.parse(config);
      this.emit("change", this.config);
    } catch (error) {
      console.error(`读取文件失败: ${error.message}`);
    }
  }

  async startWatch() {
    try {
      this.watcher = fs.watch(this.filePath, async (eventType, filename) => {
        if (eventType === "change") {
          console.log(`文件 ${filename} 已更改`);

          if (this.timer) {
            clearTimeout(this.timer);
          }

          this.timer = setTimeout(async () => {
            await this.loadFile();
          }, 300);
        }
      });
    } catch (error) {
      console.error(`监听文件失败: ${error.message}`);
    }
  }

  async close() {
    if (this.timer) {
      clearTimeout(this.timer);
      console.log("定时器已清除");
    }
    if (this.watcher) {
      this.watcher.close();
      console.log("文件监听已关闭");
    }
  }
}

// 测试
const watcher = new WatchFile("./test/config.json");
watcher.on("change", (config) => {
  console.log("配置已更新:", config);
});

watcher.on("error", (error) => {
  console.error("配置加载失败:", error);
});

// 优雅退出时关闭监听
process.on("SIGINT", () => {
  watcher.close();
  process.exit();
});
