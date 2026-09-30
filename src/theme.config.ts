// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "神楽的博客",
  locale: "zh-CN",

  brand: {
    title: "",
    subtitle: ".",
    logo: "",
  },

  cover: {
    enable: true,
    fixedCover: {
      enable: true,
      url: "cover-7",
    },
  },

  layout: {
    mode: "two-column",
  },

  widgets: {
    randomPosts: false,
  },

  // 备案号：关闭，避免显示主题默认的、不属于本站的 ICP 号
  footer: {
    icp: {
      enable: false,
    },
  },

  sidebar: {
    author: "神楽",
    description: "编程 | 网安 | 系统运维",
  },

  home: {
    title: {
      behavior: "custom",
      customTitle: "神楽的博客",
    },
    // 首页分类卡片：显式留空以关闭该区域（IndexContent 在 categories 为空时整块不渲染）
    selectedCategories: [],
  },

  nav: [
    { href: "/categories/", text: "分类",  icon: "i-ri-book-shelf-fill" },
    { href: "/tags/",       text: "标签",  icon: "i-ri-price-tag-3-fill" },
    { href: "/archives/",   text: "归档",  icon: "i-ri-archive-line" },
    { href: "/moments/",    text: "动态",  icon: "i-ri-chat-quote-line" },
    { href: "/statistics/", text: "统计",  icon: "i-ri-bar-chart-box-line" },
  ],
});
