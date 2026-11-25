---
title: "FlClash使用教程：基于Flutter与Mihomo的跨桌面及Android客户端指南"
description: "详述 chen08209/FlClash 官方开源项目特点、Windows/macOS/Linux/Android 四端安装及 WebDAV 同步配置方法，并明确说明其不包含 iOS 版本的平台边界。"
slug: "flclash"
category: "客户端百科"
client: "flclash"
platform: "Windows / macOS / Android / Linux"
primaryKeyword: "FlClash使用教程"
secondaryKeywords: ["FlClash下载", "FlClash客户端", "Flutter Mihomo客户端"]
searchIntent: "了解 FlClash 的官方发布平台（Win/macOS/Linux/Android）、Mihomo 核心能力与 WebDAV 同步特性"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["FlClash", "Mihomo", "Android", "Windows", "macOS", "Flutter"]
relatedBrands: ["u1s1", "breezenet", "quanqiuyun", "lingdongyun"]
relatedClients: ["mihomo", "clash-verge-rev", "hiddify"]
relatedArticles: ["/clash/client-comparison/", "/knowledge/android-clients-guide/", "/clash/tun/"]
sources:
  - "https://github.com/chen08209/FlClash"
  - "https://github.com/chen08209/FlClash/releases"
documentedVersion: "github.com/chen08209/FlClash 官方发布版本"
draft: false
indexable: true
faqs:
  - question: "FlClash 支持 iPhone 或 iPad（iOS）吗？"
    answer: "不支持。FlClash 官方仓库发布页仅覆盖 Android（含 Android TV）、Windows 10+、macOS 12+ 以及 Linux，没有提供 iOS 版本。苹果手机用户应选用 Shadowrocket 或 Hiddify。"
  - question: "FlClash 和 Clash Verge Rev 在功能上有什么主要不同？"
    answer: "两者都采用 Mihomo 内核。Clash Verge Rev 专注于桌面三端，主打 Tauri 轻量化与桌面 Merge/Script 覆写；FlClash 使用 Flutter 编写，额外原生支持 Android 手机与 Android TV，并提供基于 WebDAV 的跨设备配置同步功能。"
  - question: "Android 上使用 FlClash 怎么防止国内应用走代理？"
    answer: "可在 FlClash 移动端设置中启用「访问控制 / 分应用代理」，通过白名单或黑名单模式排除国内常用软件，配合 Mihomo 内核本身的规则模式精准分流。"
---

**核心结论：** **FlClash**（官方仓库 `github.com/chen08209/FlClash`）是一款采用 **Flutter** 构建界面、底层搭载 **Mihomo（Clash.Meta）** 内核的开源客户端。它最大的优势在于同时覆盖 **Windows、macOS、Linux** 三大桌面平台与 **Android（含 Android TV）** 移动端，提供高度一致的 Material You 现代视觉与 **WebDAV 跨端同步** 能力——但需注意它**不提供 iOS 版本**。

## 1. 官方平台范围与包格式

安装时请前往官方仓库 `https://github.com/chen08209/FlClash/releases` 核对包名：

- **Android：** 提供 `arm64-v8a`（主流手机首选）、`armeabi-v7a`、`x86_64` APK，并已上架 F-Droid，支持快捷设置磁贴（Quick Settings Tile）、分应用代理及 Android TV 适配。
- **Windows（10 及以上）：** 提供 `.exe` 安装包与 `.zip` 便携版，支持 `x64` 与 `arm64`。
- **macOS（12 及以上）：** 提供 `.dmg` 镜像（兼容 Apple Silicon 与 Intel），亦支持 Homebrew 安装（`brew install --cask flclash`）。
- **Linux：** 提供 `.deb`、`.rpm` 与 `.AppImage`（支持 x64 和 arm64）。

## 2. 核心功能亮点

1. **原汁原味的 Mihomo 内核：** 对机场下发的标准 Clash / Mihomo YAML 订阅支持度极高，兼容策略组手动选优、延迟测速、Rule-Providers、TUN 虚拟网卡以及内置脚本覆写。
2. **跨端界面高度统一：** 桌面窗口缩小后会自动响应为移动端布局，无论是电脑还是安卓手机都能在几分钟内上手，无需同时记忆两套完全不同的 Clash 工具。
3. **WebDAV 配置备份与同步：** 在电脑端调好订阅列表、规则偏好与覆写脚本后，可以通过 WebDAV 一键备份并同步到安卓手机端（同步前务必启用 HTTPS 并保管好 WebDAV 账号密钥，避免将个人订阅链接暴露于不安全的公开网盘）。
4. **实时流量与连接监控：** 支持实时查看当前请求的域名、命中规则、DNS 解析路径与运行日志，方便排查分流是否正确。

## 3. 新手上手四步流程

1. **确认机场支持 Clash 订阅：** 先核实已购机场套餐允许复制 Clash/Mihomo 格式的订阅链接（例如 [U1S1](/brands/u1s1/) 或经客服申请获得权限的高阶 [灵动云](/brands/lingdongyun/) 订单）。
2. **导入配置：** 打开 FlClash「配置（Profiles）」页签，点击右下角添加，选择「通过 URL 获取」，粘贴订阅地址下载配置文件。
3. **核对模式与节点：** 在「代理（Proxies）」页签确认运行模式为「规则（Rule）」并选择目标地区节点。
4. **开启连接：**
   - **桌面端：** 点击主界面开关启动代理（可在设置中按需切换系统代理或 TUN 虚拟网卡）。
   - **Android 端：** 点击主界面开关后授权系统 VPN 连接请求即可。

## 4. 使用前的客观注意

- **苹果移动用户注意：** 如果你的手机是 iPhone，不能用 FlClash 实现「全设备同一款软件」，建议桌面用 Clash Verge Rev / FlClash，手机搭配 [Shadowrocket](/clients/shadowrocket/) 或 [Hiddify](/clients/hiddify/)。
- **WebDAV 安全原则：** 配置文件中明文包含机场订阅 URL（相当于账号凭证），切勿绑定无加密 HTTP 或公共共享 WebDAV 服务。

想对比更多桌面和移动端 Clash 生态工具，请查阅 [Clash 客户端对比专栏](/clash/client-comparison/)。
