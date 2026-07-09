/**
 * 新建文章脚本
 * 用法: node new-post.cjs "分类/文章标题" [tag1 tag2 ...]
 * 示例: node new-post.cjs "网安/SQL注入入门" sql 注入
 *       node new-post.cjs "编程/Python笔记"
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('用法: node new-post.cjs "分类/文章标题" [标签1 标签2 ...]');
  console.log('示例: node new-post.cjs "网安/SQL注入入门" sql 注入');
  process.exit(1);
}

const input = args[0];
const tags = args.slice(1);

const parts = input.split("/");
const title = parts.pop().trim();
const category = parts.length > 0 ? parts.join("/") : null;

let postDir = path.join(__dirname, "src", "posts");
if (category) postDir = path.join(postDir, category);
fs.mkdirSync(postDir, { recursive: true });

const fileName = title + ".md";
const postPath = path.join(postDir, fileName);

if (fs.existsSync(postPath)) {
  console.log("文件已存在: " + postPath);
  process.exit(1);
}

const date = new Date().toISOString().split("T")[0];
const tagsStr = tags.length > 0
  ? "\ntags: [" + tags.map(function(t) { return '"' + t + '"'; }).join(", ") + "]"
  : "";

const frontmatter = [
  "---",
  'title: "' + title + '"',
  "date: " + date,
  'categories: ["${folder}"]',
  'description: ""',
  tagsStr,
  "---",
  ""
].join("\n");

fs.writeFileSync(postPath, frontmatter);
console.log("已创建: " + path.relative(__dirname, postPath));
