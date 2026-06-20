const fs = require('fs');

// 读取书签文件
const data = JSON.parse(fs.readFileSync(
  'C:/Users/Administrator/AppData/Local/Doubao/User Data/Default/Bookmarks',
  'utf8'
));

// 提取书签栏中的所有书签
const bookmarks = data.roots.bookmark_bar.children.filter(b => b.type === 'url');

// 分类规则
const categories = {
  'AI 工具与平台': [],
  '教育平台与教学资源': [],
  '工作与学校相关': [],
  '开发与技术工具': [],
  '论文查重与学术': [],
  '比赛与活动': [],
  '内容创作与发布': [],
  '软件与工具': [],
  '其他常用网站': []
};

for (const b of bookmarks) {
  const name = b.name;
  const url = b.url;
  
  if (url.includes('deepseek') || url.includes('doubao') || url.includes('zhipu') || 
      url.includes('siliconflow') || url.includes('openrouter') || url.includes('ernie') || 
      url.includes('yiyan') || url.includes('spark.changyan') || url.includes('openclaw') ||
      url.includes('bailian') || url.includes('dashscope')) {
    categories['AI 工具与平台'].push({ name, url });
  } else if (url.includes('smartedu') || url.includes('chaoxing') || url.includes('xmedu') || 
             url.includes('fjjyx') || url.includes('dongni') || url.includes('ai.eduyun') ||
             url.includes('nicezhuanye') || url.includes('renjiaoshe') || url.includes('21atcloud') ||
             url.includes('ai910')) {
    categories['教育平台与教学资源'].push({ name, url });
  } else if (url.includes('wuhuan') || url.includes('xmwsjd') || url.includes('wuxian') ||
             url.includes('xiumi') || url.includes('weixin') || (url.includes('qq.com') && !url.includes('mail'))) {
    categories['工作与学校相关'].push({ name, url });
  } else if (url.includes('github') || url.includes('netlify') || url.includes('vercel') ||
             url.includes('codebuddy') || url.includes('workbuddy')) {
    categories['开发与技术工具'].push({ name, url });
  } else if (url.includes('paper') || url.includes('查重') || url.includes('论文') || 
             url.includes('aigc') || url.includes('降重')) {
    categories['论文查重与学术'].push({ name, url });
  } else if (url.includes('eic.caet') || url.includes('huodong.ncet') || 
             url.includes('edu.10086') || url.includes('tongan')) {
    categories['比赛与活动'].push({ name, url });
  } else if (url.includes('zhihu') || url.includes('douyin') || url.includes('bilibili') ||
             url.includes('xiaohongshu')) {
    categories['内容创作与发布'].push({ name, url });
  } else if (url.includes('vlc') || url.includes('microsoft.com/download') || 
             url.includes('csv2excel')) {
    categories['软件与工具'].push({ name, url });
  } else {
    categories['其他常用网站'].push({ name, url });
  }
}

// 输出整理结果
let output = '# 豆包浏览器书签汇总\n\n';
output += '> 导出时间：' + new Date().toLocaleString('zh-CN') + '\n';
output += '> 书签总数：' + bookmarks.length + ' 条\n\n---\n\n';

for (const [cat, items] of Object.entries(categories)) {
  if (items.length === 0) continue;
  output += '## ' + cat + '（' + items.length + '条）\n\n';
  for (const item of items) {
    output += '- **' + item.name + '**\n  ' + item.url + '\n';
  }
  output += '\n';
}

fs.writeFileSync('bookmarks_parsed.md', output, 'utf8');
fs.writeFileSync('bookmarks_parsed.json', JSON.stringify(categories, null, 2), 'utf8');

console.log('解析完成，共', bookmarks.length, '条书签');
console.log('分类结果：');
for (const [cat, items] of Object.entries(categories)) {
  if (items.length > 0) console.log('  ' + cat + ': ' + items.length + '条');
}
