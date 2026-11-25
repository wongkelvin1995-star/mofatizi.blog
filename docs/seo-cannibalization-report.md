# SEO 关键词冲突审计报告（mofatizi.blog）

审计日期：2026-11-25

## 1. 同义词与近似意图合并处理清单

在构建初期，严格针对 081–120 关键词执行了搜索意图去重审计，避免创建同义词重复页面：

1. **首页 vs 推荐栏目边界：**
   - 首页 `/` 专注核心总览（081 梯子推荐、082 2026梯子推荐、086 科学上网梯子、087 魔法梯子推荐、091 翻墙梯子推荐）；
   - `/recommend/` 仅作二级索引导航页；`/recommend/airports/` 承接具体的「机场品牌推荐（088/090/092）」与交互筛选。
2. **入门指导合并（089 + 096）：**
   - 将「魔法上网教程」与「科学上网入门指南」合并至 `/guides/getting-started/`，防止拆出两篇结构雷同的新手指南。
3. **VPN 专题去重（093 + 100 vs 094 + 095）：**
   - `/vpn/` 专注 VPN 协议选型、加速器边界与安全核查标准（093/100）；
   - `/guides/vpn-vs-airport/` 专注 VPN 与机场在协议与费用上的对比计算（094/095）。
4. **Clash 订阅与节点导入明确边界（102 vs 103）：**
   - `/clash/subscription/` 专攻订阅规范、YAML 格式结构、`Subscription-Userinfo` 响应头、自动更新周期与 Token 安全；
   - `/clash/import/` 专攻一键唤起、URL 复制粘贴与本地 YAML 导入的三步实操流程，内容互补无重复段落。
5. **Clash 模式合并（107 + 108）：**
   - 将 Rule 规则模式、Global 全局模式与 Direct 直连模式合并在同一专题 `/clash/modes/` 中对照讲解。
6. **Shadowrocket 百科与添加节点分离（111 vs 112 + 113）：**
   - `/clients/shadowrocket/` 定位软件本身介绍、Apple 平台范围、官方主体核验与全局路由；
   - `/clients/shadowrocket/subscription/` 合并 112/113，专注 URL/二维码/URI 节点添加、自动更新与空列表排查。
7. **Guides Markdown 集合与独立 URL 去重：**
   - 在 `src/pages/guides/[slug].astro` 中明确过滤掉已独立映射至 `/recommend/*` 和 `/clash/*` 的 9 篇指南（`reliable-ladder-guide`、`clash-tun` 等），杜绝同一 Markdown 文件同时在两个 URL 下发布造成站内内容重复。
8. **品牌核心页与品牌专题去重（Section 17）：**
   - 每个品牌的 `/brands/[slug]/` 作为该品牌总览档案；`src/content/articles/` 下的品牌配套文章均聚焦特定的「客户端政策差异 / Nextin 识别码 / Clash 申请条件 / 套餐边界」，且严格不替仅限官方客户端的品牌虚构 Clash 教程。

## 2. 技术规范检查结果

- `/search/` 搜索结果页已设置 `noindex, follow`，并已从 `sitemap.xml` 与拆分 Sitemap 中排除，同时允许 `robots.txt` 正常读取 `noindex`。
- `verify-site.mjs` 自动检测所有索引页是否出现重复 `<title>`、重复 `<meta name="description">`、多个 `<h1>`、错误的 Canonical 域名或 `href="#"`。
