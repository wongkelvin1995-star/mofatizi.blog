---
title: "系统代理是什么？System Proxy与TUN虚拟网卡底层机制对比"
description: "科普操作系统「系统代理（System Proxy）」的工作原理、适用范围、为什么命令行工具经常不走系统代理，以及何时需要改用 TUN 虚拟网卡。"
slug: "system-proxy-vs-tun"
category: "配置知识"
primaryKeyword: "系统代理是什么"
secondaryKeywords: ["系统代理和TUN区别", "为什么终端不走代理", "HTTPS代理端口"]
searchIntent: "理解系统代理在 Windows/macOS 中的工作机制，判断日常该开系统代理还是 TUN"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["系统代理", "TUN模式", "网络原理", "配置基础"]
relatedBrands: ["u1s1", "lingdongyun", "breezenet"]
relatedClients: ["clash-verge-rev", "v2rayn", "clash-party"]
relatedArticles: ["/clash/tun/", "/clash/modes/", "/knowledge/dns-and-fake-ip-basics/"]
sources:
  - "桌面操作系统代理接口与虚拟网卡原理整理（2026-11-25）"
draft: false
indexable: true
stage: "stage3"
faqs:
  - question: "开了系统代理之后，浏览器能上外网，为什么命令行 git clone 或 npm install 还是卡住？"
    answer: "因为系统代理只是向操作系统注册表或网络偏好写入一个「建议地址」（如 127.0.0.1:7890）。浏览器会乖乖读取这个地址，但命令行工具（Git、Curl、Docker、Python pip）以及很多游戏默认无视系统代理配置，此时需在终端配置环境变量或改开 Clash TUN 模式。"
  - question: "关闭电脑之前忘了退出客户端，第二天断网打不开网页怎么办？"
    answer: "系统非正常关机或客户端崩溃可能导致 Windows/macOS 系统代理开关遗留「开启状态」但本地 7890 端口并无程序监听。重新打开客户端切换一次系统代理开关（开再关），或在系统网络设置手动关闭代理服务器即可秒恢复。"
---

**核心结论：** **系统代理（System Proxy）** 相当于操作系统贴在公告栏里的一张便签：「凡是愿意遵守的软件，请把网络请求发给本地的 `127.0.0.1:7890`」。它具有**零内核侵入、极省资源、无需管理员提权**的优点，适合 90% 的日常浏览器场景；但对那些「不看公告栏」的独立应用和终端工具无效，后者需要依赖网络层的 **[TUN 模式](/clash/tun/)**。

## 1. 系统代理的工作方式

当你点击 Clash Verge Rev 或 v2rayN 的「系统代理」开关时，客户端会在本地回环网卡（`127.0.0.1`）打开一个混合监听端口（如 Clash 默认 `7890`，v2rayN 常见 `10808` / `10809`），同时向系统写入如下配置：
- **Windows：** 在 Internet 选项（注册表 `Internet Settings`）开启代理服务器并填入 `127.0.0.1:7890`，同时附带绕过列表（`localhost`、`192.168.*` 等局域网网段）。
- **macOS：** 在当前活跃网卡（Wi-Fi 或以太网）配置 `Web Proxy (HTTP)`、`Secure Web Proxy (HTTPS)` 与 `SOCKS Proxy`。

随后，Edge、Chrome、Safari 等浏览器在发出任何请求前，都会主动询问系统代理设置，于是请求就顺理成章地进入了代理客户端的分流引擎。

## 2. 什么时候必须改用 TUN 模式或终端配置？

在以下场景中，你会明显感到「只开系统代理不管用」：
1. **开发者命令行工具：** `git`、`curl`、`ssh`、`npm`、`pip`、`go get` 等默认直连网卡。
2. **部分桌面独立程序：** 某些跨平台桌面软件、UWP 应用（Windows 商店应用受本地回环隔离限制）或独立客户端忽略系统代理变量。
3. **UDP 协议需求：** 标准 HTTP 系统代理主要承载 TCP 请求，若需要让基于 UDP 的应用或系统 DNS 请求一并进入代理，必须采用 TUN 虚拟网卡。

掌握两者的切换逻辑后，推荐阅读 [Clash TUN 模式设置指南](/clash/tun/) 完成正确的桌面端服务模式配置。
