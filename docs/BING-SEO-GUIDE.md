# Bing Webmaster Tools 配置与长期收录维护指南（mofatizi.blog）

## 1. Bing 站长平台初期配置步骤

1. 登录 [Bing Webmaster Tools](https://www.bing.com/webmasters) 添加站点 `https://mofatizi.blog`。
2. **完成站点所有权验证（二选一）：**
   - **XML 文件验证：** 下载 Bing 专属 `BingSiteAuth.xml`（切勿使用其他站点的验证文件），放入 `public/BingSiteAuth.xml` 后重新执行 `npm run build` 并部署，确认 `https://mofatizi.blog/BingSiteAuth.xml` 可公开访问。
   - **Meta 标签验证：** 获取 `msvalidate.01` 验证码并在托管平台（如 Cloudflare Pages）设置环境变量 `PUBLIC_BING_VERIFICATION=<验证码>` 重新构建。
3. **提交 Sitemap：**
   - 在 Bing 后台 Sitemaps 面板提交主索引 `https://mofatizi.blog/sitemap-index.xml` 或完整清单 `https://mofatizi.blog/sitemap.xml`。
4. **启用 IndexNow 增量提交：**
   - 确认线上已能正常访问 `https://mofatizi.blog/f4e9b2a1c8d7463e9b0a1d2c3e4f5a6b.txt`。
   - 每次部署更新完成后，运行 `npm run indexnow:submit`（或在 GitHub Actions 触发 `.github/workflows/indexnow.yml`），脚本会自动对比 `.indexnow-manifest.json` 仅推送真正新增或修改的 URL。

## 2. 长期收录与 081–120 核心词追踪维稳清单

每周或双周登录 Bing Webmaster Tools 检查以下指标：

- **索引覆盖与抓取健康度：** 核对「已收录页面 / 未收录页面 / 抓取错误（4xx/5xx）」，确保 `/search/` 按预期因 `noindex` 保持不收录而非报错。
- **关键词曝光与点击分析：** 重点追踪 `081–120` 核心词（如「梯子推荐」「Clash机场推荐」「Clash Verge Rev教程」「Shadowrocket使用教程」「Mihomo内核教程」等）的曝光量（Impressions）、点击量（Clicks）、CTR 与平均排名。
- **高曝光低点击优化：** 对已经进入第 4–15 位且曝光较高的教程或客户端页面，结合实际用户搜索疑问微调 Title 开头、摘要首段直接回答度及 FAQ 问答精度。
- **软件版本与品牌资料保鲜：** 当 Mihomo、Clash Verge Rev、Clash Party、FlClash、Hiddify 或 18 家品牌出现官方订阅政策变更时，如实更新对应档案与 `updatedDate`（切勿无内容修改仅刷日期制造虚假新鲜度）。
- **死链与重定向巡检：** 定期执行 `npm run verify` 保证全站零断链、零违禁占位词。
