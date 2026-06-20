const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType } = require('docx');

// 读取解析好的书签分类
const categories = JSON.parse(fs.readFileSync('bookmarks_parsed.json', 'utf8'));

// 文档内容
const children = [];

// 标题
children.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '豆包浏览器书签汇总', bold: true, size: 36 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 }
  })
);

children.push(
  new Paragraph({
    children: [new TextRun({ text: '导出时间：' + new Date().toLocaleString('zh-CN'), size: 20, color: '666666' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 }
  })
);

// 统计总数
let total = 0;
for (const items of Object.values(categories)) total += items.length;
children.push(
  new Paragraph({
    children: [new TextRun({ text: '书签总数：' + total + ' 条', size: 22, bold: true })],
    spacing: { before: 200, after: 400 }
  })
);

// 按分类输出
const categoryOrder = [
  'AI 工具与平台',
  '教育平台与教学资源',
  '工作与学校相关',
  '开发与技术工具',
  '论文查重与学术',
  '比赛与活动',
  '内容创作与发布',
  '软件与工具',
  '其他常用网站'
];

for (const cat of categoryOrder) {
  const items = categories[cat];
  if (!items || items.length === 0) continue;

  // 分类标题
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: cat + '（' + items.length + '条）', bold: true, size: 28 })],
      spacing: { before: 300, after: 200 }
    })
  );

  // 每条书签
  for (const item of items) {
    const cleanUrl = item.url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    children.push(
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [new TextRun({ text: item.name, style: 'Hyperlink', size: 22 })],
            link: item.url
          }),
          new TextRun({ text: '  ' + item.url, size: 18, color: '555555' })
        ],
        spacing: { before: 80, after: 80 }
      })
    );
  }
}

// 生成文档
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  // 支持自定义输出路径（通过环境变量 DOC_OUTPUT_PATH）
  const outputPath = process.env.DOC_OUTPUT_PATH || '豆包浏览器书签汇总.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('Word 文档生成成功：' + outputPath);
  console.log('总条数：', total);
}).catch(err => {
  console.error('生成失败：', err.message);
});
