/*
project
├── public
│   ├── index.html
│   └── style.css
├── src
│   ├── index.js
├── package.json
├── README.md
├── .gitignore
└── .eslintrc.js
*/  

const fs = require('fs');
const path = require('path');

class CreateProject {
    constructor(projectName) {
        this.projectName = projectName;
        this.projectPath = path.join(process.cwd(), projectName);
    }

    makeDir(dirname) {
        if(!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
            console.log(`项目目录 ${this.projectName} 创建成功`);
        }
    }

    makeFile(filename, content) {
        fs.writeFileSync(filename, content);
        console.log(`文件 ${filename} 创建成功`);
    }

    create(){
        const baseDirs = ['', 'public', 'src', 'test'];
        const files = {
            'public/index.html': '<html><head><title>My App</title></head><body><h1>Hello, World!</h1></body></html>',
            'public/style.css': 'body { background-color: #f0f0f0; }',
            'src/index.js': 'console.log("Hello, World!");',
            'package.json': '{"name": "my-project", "version": "1.0.0"}',
            'README.md': '# My Project',
            '.gitignore': 'node_modules\n.DS_Store',
            '.eslintrc.js': 'module.exports = { extends: "eslint:recommended" };'
        }

        baseDirs.forEach(dir => {
            const dirPath = path.join(this.projectPath, dir);
            this.makeDir(dirPath);
        })

        Object.entries(files).forEach(([filename, content]) => {
            const filePath = path.join(this.projectPath, filename);
            this.makeFile(filePath, content);
        })
    }
}

const projectName = process.argv[2] || 'my-project';
const project = new CreateProject(projectName);
project.create();