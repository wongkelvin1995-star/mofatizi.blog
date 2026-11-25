# Markdown 内容与品牌资料维护说明

## 1. 目录与 Frontmatter 规范

全站内容分为四大集合（定义于 `src/content.config.ts`）：
- `src/content/clients/`：十大官方与开源客户端百科。
- `src/content/guides/`：核心入门、对比、Clash 专题与购买实操指南。
- `src/content/knowledge/`：三阶段魔法知识图书馆（`stage: "stage1" | "stage2" | "stage3"`）。
- `src/content/articles/`：品牌配套深度专题文章。

所有文档统一包含 `title`、`description`、`category`、`primaryKeyword`、`secondaryKeywords`、`searchIntent`、`publishDate`、`updatedDate`、`author`、`sources`、`draft`、`indexable` 与可选 `faqs`。将 `draft: true` 即可阻止文章进入静态构建、搜索索引及 Sitemap。

## 2. 品牌资料更新与新增流程

1. **保存原始档案：** 将新增或更新的品牌 Markdown 档案放入 `source-materials/dossiers/`，并在 `source-materials/00_18家品牌资料总索引.md` 核对推广链接与记录日期。
2. **更新结构化数据：**
   - 在 `src/data/brands.json` 新增或修改对应品牌节点、套餐、优惠码及来源说明（绝不擅自修改原始 AFF 参数，无实据的字段不虚构）。
   - 在 `src/data/brand-client-compatibility.json` 同步记录客户端兼容证据与平台矩阵。
   - 在 `src/data/brand-order.json` 调整编辑精选展示顺序。
3. **重编校验与上线：**
   - 运行 `npm run build`（自动串联 `build-data.mjs`、`build-search-index.mjs`、`astro build` 与 `postbuild.mjs` 更新 `dist/` 与 `sitemap*.xml`）。
   - 运行 `npm run verify` 验证链接、Canonical、AFF 与禁用占位词检查通过后再发布。
