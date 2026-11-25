# 独立部署说明（mofatizi.blog）

本项目完全独立于此前三个博客，使用专属域名 `https://mofatizi.blog`，不覆盖任何既有仓库或静态产物。

## 1. 本地生产构建与验证

```bash
npm install
npm run check     # TypeScript 与 Astro 语法校验
npm run build     # 数据同步 + 中文搜索索引 + 静态输出 dist/ + 分拆 Sitemap
npm run verify    # 38 项上线前工程验收检查
```

## 2. Cloudflare Pages 独立项目配置建议

- **项目名称（独立）：** `mofatizi-blog`
- **框架预设：** Astro（或 Custom Static）
- **构建命令：** `npm run build`
- **构建输出目录：** `dist`
- **Node 版本环境变量：** `NODE_VERSION = 22`（要求 `>= 20.9.0`）
- **自定义域名与 HTTPS：**
  - 主域名绑定 `mofatizi.blog`，启用自动 HTTPS 与 Always Use HTTPS；
  - 已配置 `public/_redirects`，将 `www.mofatizi.blog` 与 `http://` 301 重定向至 `https://mofatizi.blog`。
  - 保留 Cloudflare 默认真实 `404.html` 响应（**禁止**配置把所有 404 路径重写跳转到首页 `/` 的 SPA fallback）。
- **缓存与安全响应头：** 已在 `public/_headers` 配置 `X-Content-Type-Options: nosniff`、`X-Frame-Options: SAMEORIGIN` 以及 `/_astro/*` 长期强缓存。

## 3. 上线后必做核验步骤（需在真实域名与账号后台完成）

由于本地开发环境不包含线上 DNS、Cloudflare 账号与 Bing 后台凭证，上线部署后请人工完成以下操作：
1. 在独立 GitHub 仓库推送本项目代码（与前三个博客仓库隔离）。
2. 在 Cloudflare Pages 绑定独立项目并完成 DNS 解析与 SSL 证书签发。
3. 浏览器确认以下路径均可直接访问与刷新：`https://mofatizi.blog/`、`https://mofatizi.blog/brands/lingdongyun/`、`https://mofatizi.blog/clients/clash-verge-rev/`、`https://mofatizi.blog/robots.txt`、`https://mofatizi.blog/sitemap.xml`、`https://mofatizi.blog/f4e9b2a1c8d7463e9b0a1d2c3e4f5a6b.txt`，以及不存在路径返回 HTTP 404。
4. 取得 Bing 专属验证文件后配置 `BingSiteAuth.xml` 或 `PUBLIC_BING_VERIFICATION` 重新部署，提交 Sitemap，再执行 `npm run indexnow:submit` 完成首次增量推送。
