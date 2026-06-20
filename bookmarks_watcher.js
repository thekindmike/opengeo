const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const BOOKMARKS_PATH = 'C:/Users/Administrator/AppData/Local/Doubao/User Data/Default/Bookmarks';
const PROJECT_DIR = 'C:/Users/Administrator/WorkBuddy/20260423220849';
const DOC_OUTPUT_PATH = 'E:/豆包浏览器书签汇总.docx';
const GIT_DIR = 'C:/Users/Administrator/WorkBuddy/20260423220849/opengeo-pages';
const GIT_EXE = 'C:/Users/Administrator/.workbuddy/vendor/PortableGit/mingw64/bin/git.exe';

let isProcessing = false;
let debounceTimer = null;

console.log('🔍 豆包浏览器书签监控已启动...');
console.log('📂 监控文件：', BOOKMARKS_PATH);
console.log('📄 Word 文档输出：', DOC_OUTPUT_PATH);
console.log('🔄 按 Ctrl+C 停止监控\n');

// 创建必要的输出目录
const docDir = path.dirname(DOC_OUTPUT_PATH);
if (!fs.existsSync(docDir)) {
  fs.mkdirSync(docDir, { recursive: true });
}

// 更新书签的函数
function updateBookmarks() {
  if (isProcessing) {
    console.log('⏳ 正在处理上一次更新，跳过...');
    return;
  }
  
  isProcessing = true;
  console.log('\n[' + new Date().toLocaleTimeString() + '] 🔔 检测到书签变化，开始更新...');
  
  try {
    // 1. 等待文件写入完成（浏览器可能还在写）
    console.log('  等待文件写入完成...');
    // 使用 Node.js 原生等待，避免跨平台问题
    execSync('node -e "setTimeout(() => process.exit(0), 2000)"', { cwd: PROJECT_DIR });
    
    // 2. 解析书签
    console.log('  解析书签文件...');
    execSync('node parse_bookmarks.js', { 
      cwd: PROJECT_DIR, 
      stdio: 'inherit' 
    });
    
    // 3. 生成 Word 文档
    console.log('  生成 Word 文档...');
    execSync('node generate_bookmarks_doc.js', { 
      cwd: PROJECT_DIR, 
      stdio: 'inherit',
      env: { ...process.env, DOC_OUTPUT_PATH }
    });
    
    // 4. 移动到指定位置
    console.log('  移动 Word 文档到Documents文件夹...');
    const srcPath = path.join(PROJECT_DIR, '豆包浏览器书签汇总.docx');
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, DOC_OUTPUT_PATH);
      console.log('  ✅ Word 文档已保存到：', DOC_OUTPUT_PATH);
    }
    
    // 5. 备份到 GitHub
    console.log('  备份到 GitHub...');
    try {
      process.chdir(GIT_DIR);
      execSync(`"${GIT_EXE}" add bookmarks_backup.json`, { cwd: GIT_DIR, stdio: 'inherit' });
      execSync(`"${GIT_EXE}" commit -m "自动备份书签 - ${new Date().toLocaleString('zh-CN')}"`, { 
        cwd: GIT_DIR, 
        stdio: 'inherit',
        allowFail: true 
      });
      execSync(`"${GIT_EXE}" push origin main`, { cwd: GIT_DIR, stdio: 'inherit' });
      console.log('  ✅ 已备份到 GitHub');
    } catch (gitError) {
      console.log('  ⚠️  Git 备份失败（可能是网络问题）：', gitError.message);
    }
    
    console.log('[' + new Date().toLocaleTimeString() + '] ✅ 更新完成！\n');
    
  } catch (error) {
    console.error('❌ 更新失败：', error.message);
  } finally {
    isProcessing = false;
  }
}

// 监听书签文件变化
const watcher = chokidar.watch(BOOKMARKS_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher
  .on('change', () => {
    console.log('📡 书签文件已变更，等待2秒防抖...');
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateBookmarks, 2000);
  })
  .on('error', error => {
    console.error('❌ 监控错误：', error);
  });

// 首次运行（启动时就更新一次）
console.log('🚀 执行首次更新...');
setTimeout(updateBookmarks, 1000);

// 保持进程运行
process.on('SIGINT', () => {
  console.log('\n👋 停止监控...');
  watcher.close();
  process.exit(0);
});
