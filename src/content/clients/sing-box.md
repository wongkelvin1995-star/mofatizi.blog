---
title: "sing-box配置教程：SagerNet通用代理平台与JSON规则引擎详解"
description: "介绍 SagerNet/sing-box 官方项目定位、全平台客户端生态（SFI/SFM/SFA 与 CLI）、JSON 配置文件基本结构、Rule-Set 规则集与 TUN 透明代理要点。"
slug: "sing-box"
category: "客户端百科"
client: "sing-box"
platform: "Windows / macOS / iOS / Android / Linux / OpenWrt"
primaryKeyword: "sing-box配置教程"
secondaryKeywords: ["sing-box客户端", "SagerNet sing-box", "sing-box规则配置"]
searchIntent: "理解 sing-box 通用代理平台的官方客户端体系、JSON 配置结构与规则集运作逻辑"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["sing-box", "SagerNet", "JSON配置", "TUN", "跨平台"]
relatedBrands: ["u1s1", "breezenet", "quanqiuyun"]
relatedClients: ["hiddify", "v2rayn", "mihomo"]
relatedArticles: ["/clients/hiddify/", "/clash/tun/", "/knowledge/proxy-protocols-explained/"]
sources:
  - "https://github.com/SagerNet/sing-box"
  - "https://sing-box.sagernet.org/"
documentedVersion: "SagerNet/sing-box 官方文档与客户端生态"
draft: false
indexable: true
faqs:
  - question: "sing-box 是单个 App 还是一个平台内核？"
    answer: "sing-box 首先是由 SagerNet 开发的跨平台通用代理内核，同时也推出了 Apple (SFI/SFM) 与 Android (SFA) 官方图形客户端，并被 Hiddify、v2rayN、OpenWrt HomeProxy 等大量第三方工具选作底层核心。"
  - question: "为什么很多机场的订阅链接不能直接放进原生 sing-box？"
    answer: "因为多数机场默认下发 Clash YAML 或 Base64 节点列表，而原生 sing-box 只读取符合其规范的 JSON 配置文件。若服务商未直接下发 sing-box JSON 订阅，新手可改用基于 sing-box 且支持自动转换的 Hiddify，或在确认兼容后转换配置。"
  - question: "sing-box 的 .srs 规则集是什么？"
    answer: "`.srs` 是 sing-box 引入的二进制规则集格式，用于替代早期庞大的明文规则文件与 GeoSite 库，在路由器与手机等内存受限设备上大幅缩短启动时间并减少内存占用。"
---

**核心结论：** **sing-box**（官方仓库 `github.com/SagerNet/sing-box`，文档站 `sing-box.sagernet.org`）是 SagerNet 团队打造的现代通用代理平台。它采用高度统一的 **JSON 配置架构** 与高性能 `.srs` 二进制规则集，既提供 iOS/macOS/Android 官方原生图形客户端，也是 [Hiddify](/clients/hiddify/)、[v2rayN](/clients/v2rayn/) 等客户端赖以运行的底层引擎。

## 1. sing-box 全平台生态图谱

不同于早年各类核心各自为战的局面，sing-box 将入站（Inbound）、出站（Outbound）、路由（Route）与 DNS 彻底抽象为统一模型，形成了一整套全平台体系：

- **Apple 官方图形端：**
  - **SFI（sing-box for iOS）** 与 **SFM（sing-box for macOS）**，通过 App Store（非大陆区）官方分发，原生对接 Apple Network Extension。
- **Android 官方图形端：**
  - **SFA（sing-box for Android）**，支持直接导入远程配置 URL 或本地 JSON 配置文件并开启 TUN 透明代理。
- **Linux / Windows / OpenWrt：**
  - 官网文档提供 `APT`、`DNF`、`Homebrew`、`AUR`、`NixOS`、Docker 以及 OpenWrt 固件安装路径；桌面新手若不想手写 JSON，更常见的是直接安装搭载 sing-box 内核的 **Hiddify** 或 **v2rayN**。

## 2. sing-box JSON 配置核心区块结构

如果你使用的是官方 SFI/SFM/SFA 或在 Linux 上用命令行运行 sing-box，理解一份标准配置的五大核心区块至关重要（以下为教学概念示意，非具体机场实盘配置）：

```json
{
  "log": { "level": "info" },
  "dns": {
    "servers": [],
    "rules": []
  },
  "inbounds": [
    { "type": "tun", "auto_route": true }
  ],
  "outbounds": [
    { "type": "selector", "tag": "proxy", "outbounds": [] },
    { "type": "direct", "tag": "direct" }
  ],
  "route": {
    "rules": [],
    "rule_set": []
  }
}
```

- **`inbounds`（入站）：** 决定如何接管本机流量，例如开启 `tun` 虚拟网卡或 `mixed` 混合代理端口。
- **`outbounds`（出站）：** 定义实际节点与策略组（如 `selector` 手动选节点、`urltest` 自动选优、`direct` 直连）。
- **`dns`（域名解析）：** 控制境内/境外域名分别由哪个 DNS 解析，以及是否启用 FakeIP。
- **`route`（路由规则）：** 按 `rule_set`（`.srs` 二进制规则集）、域名后缀、IP CIDR 决定流量分流走向。

> **版本演进提醒：** sing-box 近年来在主版本迭代中对 `dns`、`outbound` 写法及 `legacy` 字段做过多次规范化调整。从网上复制旧博客的 JSON 模板时，往往会因语法弃用而启动报错，务必对照 `sing-box.sagernet.org` 当前版本的官方 Schema 校验。

## 3. 与机场服务的实际搭配注意事项

在实际使用机场服务时，需要注意三点客观边界：

1. **订阅格式匹配：** 在国内中文机场市场，多数开放第三方订阅的品牌优先提供 Clash YAML 或通用 URI 订阅，未必直接提供原生 sing-box JSON 链接。若直接将 Clash 链接填入原生 SFA/SFI，会提示 JSON 解析失败。
2. **新手替代方案：** 如果看中 sing-box 内核的流畅与省电，但机场只提供普通订阅，可优先选择内置 sing-box 且具备基础格式转换能力的 [Hiddify](/clients/hiddify/)，或在 [v2rayN](/clients/v2rayn/) 中将其设为后端内核。
3. **官方客户端专属品牌：** 若购买的机场属于仅限官方客户端或暂停第三方订阅的运营模式（如 [光速云](/brands/lightspeed/)、[飞猫云](/brands/feimaoyun/)、[无忧链接](/brands/wuyou/) 等），无法获取第三方配置，自然也不能导入 sing-box。

想直观比较 sing-box 与 Mihomo 两大内核体系的客户端产品，可阅读 [Clash 与主流客户端对比](/clash/client-comparison/)。
