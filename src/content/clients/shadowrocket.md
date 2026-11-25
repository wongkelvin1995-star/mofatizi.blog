---
title: "Shadowrocket使用教程：小火箭Apple生态功能定位、获取渠道与配置百科"
description: "全面介绍 Shadowrocket（小火箭）的官方开发商 Shadow Launch Technology Limited、iOS/iPadOS/Apple Silicon Mac 平台支持、功能特性及订阅兼容注意事项。"
slug: "shadowrocket"
category: "客户端百科"
client: "shadowrocket"
platform: "iOS / macOS (Apple Silicon)"
primaryKeyword: "Shadowrocket使用教程"
secondaryKeywords: ["小火箭教程", "Shadowrocket下载", "Shadowrocket规则分流"]
searchIntent: "了解 Shadowrocket（小火箭）的正版获取方法、Apple 设备兼容范围、核心规则功能与机场订阅政策限制"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["Shadowrocket", "小火箭", "iOS", "macOS", "Apple"]
relatedBrands: ["u1s1", "breezenet", "quanqiuyun", "lingdongyun"]
relatedClients: ["shadowrocket-subscription", "hiddify", "sing-box"]
relatedArticles: ["/clients/shadowrocket/subscription/", "/knowledge/ios-clients-guide/", "/knowledge/official-vs-third-party-clients/"]
sources:
  - "https://apps.apple.com/app/shadowrocket/id932747118"
documentedVersion: "App Store 官方发行版（Shadow Launch Technology Limited）"
draft: false
indexable: true
faqs:
  - question: "Shadowrocket 为什么在中国大陆区 App Store 搜不到？"
    answer: "Shadowrocket 仅在非中国大陆区 App Store 上架（如美区、港区、台区等），由 Shadow Launch Technology Limited 官方发行并一次性买断付费。需使用外区 Apple ID 登录 App Store 下载，不建议在设备系统 iCloud 设置中长期登录来路不明的共享账号。"
  - question: "Shadowrocket 有 Windows 或 Android 版本吗？"
    answer: "没有。Shadowrocket 仅支持 iOS、iPadOS、Apple TV (tvOS) 以及搭载 Apple M1 及以上芯片的 macOS 设备。网上任何标榜「小火箭安卓版」「小火箭 Windows 版」的安装包均非官方软件，存在安全风险。"
  - question: "买了机场后一定能用 Shadowrocket 吗？"
    answer: "不一定。部分机场（如飞猫云、唯兔云、灵猫、无忧链接、Firefly、闪跃新订单、光速云等）主推官方专属客户端或 iOS Nextin，已暂停或未开放第三方通用订阅链接。下单前务必确认机场提供标准订阅格式。"
---

**核心结论：** **Shadowrocket**（中文社区常称「小火箭」）是由 **Shadow Launch Technology Limited** 开发的 Apple 生态专属规则代理客户端，通过官方 App Store 发行（`id932747118`）。它支持 iPhone、iPad、Apple TV 以及搭载 **Apple M1 及以上芯片（macOS 11.0+）** 的 Mac 设备，但**不存在 Windows 或 Android 官方版本**。具体添加节点与导入订阅的操作，可衔接阅读专门的 [Shadowrocket 订阅导入与添加节点教程](/clients/shadowrocket/subscription/)。

## 1. 官方身份与平台边界核查

由于小火箭在国内知名度极高，网络上充斥着大量仿冒名称的恶意安装包与山寨应用。使用前请先认准以下官方边界：

- **开发主体：** Shadow Launch Technology Limited
- **唯一正版获取渠道：** 非中国大陆区 Apple App Store（一次性付费买断，具体定价以对应地区商店显示为准）
- **兼容设备：**
  - iPhone / iPad / iPod touch（iOS / iPadOS）
  - Apple TV（tvOS）
  - Mac（仅限配备 Apple Silicon M 系列芯片、运行 macOS 11.0 及以上系统的机型，不支持旧款 Intel Mac）
- **安全警告：** Android 与 Windows 平台没有任何官方 Shadowrocket 客户端，安卓用户应选用 [v2rayNG](/clients/v2rayng/)、[FlClash](/clients/flclash/) 或 [Hiddify](/clients/hiddify/)。

关于外区 Apple ID 的账号隔离原则与防锁机注意事项，请参阅 [iOS 客户端安全获取与 Nextin 方案指南](/knowledge/ios-clients-guide/)。

## 2. 核心功能与技术优势

Shadowrocket 之所以长期作为 iOS 生态最主流的第三方工具之一，得益于其对苹果系统 **Network Extension** 框架的原生利用：

1. **多协议广泛兼容：** 原生支持 Shadowsocks、VMess、VLESS（含 Vision / Reality）、Trojan、Hysteria2、TUIC、WireGuard 等常见协议，能兼容大多数开放通用订阅的机场与自建服务。
2. **精细化规则分流（Conf 模块）：** 可配置默认直连与代理分流规则（如常见境内域名直连 `FINAL` / `GEOIP,CN`，特定国际服务走代理），减少不必要的绕行流量消耗。
3. **本地 DNS 与系统级接管：** 支持配置 DoH / DoT 加密 DNS 映射规则，降低本地解析延迟并改善规则触发精度。
4. **低功耗后台保活：** 相较跨平台框架封装应用，原生 Swift/Objective-C 架构在 iPhone 后台挂机时内存开销较低，配合系统 VPN 状态栏图标可直观识别连接是否生效。

## 3. 全局路由模式选择

在 Shadowrocket 首页的「全局路由（Global Routing）」选项中，常见的四类模式含义如下：

- **配置（Config）：** 最常用的日常模式。严格按照当前激活的 `.conf` 配置文件中的域名、IP 规则分流，境内直连、境外走代理。
- **代理（Proxy）：** 相当于全局模式。所有受接管流量全部通过当前选中的节点转发，适合排查分流规则漏判问题，但国内网站访问可能变慢且消耗套餐流量。
- **直连（Direct）：** 仅保留基础网络框架接管或统计，所有流量直接本地出站，不经过代理节点。
- **场景（Scene）：** 根据连接不同的 Wi-Fi 名称（SSID）或蜂窝网络状态自动切换配置与路由模式。

## 4. 与 18 家机场品牌的兼容现实

很多新手在下载 Shadowrocket 后才发现购买的机场并没有「小火箭一键导入」入口。根据本站整理的可追溯档案（记录日期 2026-10 至 2026-11）：

- **记录支持或可申请第三方订阅的品牌：** [U1S1（有一说一）](/brands/u1s1/) 公开后台教程推荐 iOS 使用 Shadowrocket；[微风网络](/brands/breezenet/)、[全球云](/brands/quanqiuyun/)、[跨界](/brands/kuajie/) 的 2026-11 档案也列有 Shadowrocket 说明（但需注意版本/后台规则差异）；[灵动云](/brands/lingdongyun/) 需满足高阶/≥¥200 门槛联系客服申请特殊订阅。
- **主推官方方案或 Nextin 替代方案的品牌：** 例如 [灵动云](/brands/lingdongyun/)（默认路径 `LDY`）、[浪网](/brands/wavenet/)、[灵猫](/brands/lingmao/)（`lmwl`）、[闪跃](/brands/flashleap/)（`sywl`）在 iOS 端主推 **Nextin**；而 [飞猫云](/brands/feimaoyun/)、[唯兔云](/brands/v2yun/)、[无忧链接](/brands/wuyou/)、[Firefly](/brands/firefly/) 等新订单均以官方或统一客户端为主。

**实用建议：** 如果你坚持要在 iPhone 上只使用 Shadowrocket 管理多条订阅，购买任何套餐前请先登录用户中心或咨询客服，确认该档位是否提供可复制的通用订阅链接。下一步实操请阅读 [Shadowrocket 订阅导入与添加节点全流程](/clients/shadowrocket/subscription/)。
