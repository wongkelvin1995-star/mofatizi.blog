# 魔法梯子（Magic Ladder）· https://mofatizi.blog

基于 **Astro 5 + TypeScript + Tailwind CSS v4 + Markdown** 构建的「Magic Ladder ULTIMATE MAX · 极境魔法知识商业旗舰」独立博客，专注梯子推荐、网络工具百科、Clash/Mihomo/sing-box 客户端教程与 18 家机场品牌可追溯档案。

## 核心目录结构

- `source-materials/`：原始 `00_18家品牌资料总索引.md` 与 18 家品牌深度档案原文（不含未收录品牌）。
- `src/data/`：统一品牌数据库 `brands.json`、套餐数据库 `plans.json`、10 款客户端数据库 `clients.json`、兼容性数据库 `brand-client-compatibility.json`、展示顺序 `brand-order.json`、40 词 SEO 注册表 `seo-keywords.json` 与中文搜索同义词 `search-synonyms.json`。
- `src/content/`：`clients/`（11 篇客户端百科）、`guides/`（13 篇核心指南）、`knowledge/`（15 篇三阶段知识库）、`articles/`（20 篇品牌深度专题）。
- `src/pages/`：完整静态路由（首页、`/recommend/`、`/clash/`、`/clients/`、`/brands/`、`/knowledge/`、`/guides/`、`/tools/`、`/vpn/`、`/articles/`、`/search/`、治理页与 `404`）。
- `public/illustrations/`：原创二次元魔法少女视觉插画（已优化为轻量 WebP）与 `og-cover.jpg`。
- `scripts/`：`build-data.mjs`、`build-search-index.mjs`、`postbuild.mjs`（生成 Sitemap）、`verify-site.mjs`（上线前验收）与 `indexnow.mjs`。

## 常用指令

```bash
npm run check     # Astro / TypeScript 类型检查
npm run build     # 校验数据、构建中文搜索索引、生成静态站点及分拆 Sitemap
npm run verify    # 运行全站 38 项工程质量与 SEO 合规检查
npm run preview   # 本地预览构建产物
npm run indexnow  # 生成 IndexNow 增量变化清单（reports/indexnow-payload.json）
```

## 相关文档

- [081–120 关键词归属表](./docs/seo-keyword-map.md)
- [SEO 关键词冲突审计报告](./docs/seo-cannibalization-report.md)
- [四站跨站关键词协同策略](./docs/cross-site-keyword-strategy.md)
- [Bing Webmaster Tools 与长期收录维护指南](./docs/BING-SEO-GUIDE.md)
- [Markdown 与品牌资料维护说明](./docs/CONTENT-MAINTENANCE.md)
- [独立部署与 IndexNow 配置说明](./docs/DEPLOYMENT.md)
- [已发布页面 URL 清单](./docs/PUBLISHED-URLS.md)
- [上线前工程验收报告](./docs/ACCEPTANCE-REPORT.md)
