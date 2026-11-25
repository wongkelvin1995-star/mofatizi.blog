---
title: "DNS与网络连接有什么关系？Fake-IP、Redir-Host与防泄漏基础"
description: "通俗解释 DNS 域名解析在网络代理中的核心作用、为什么传统本地解析会导致慢或分流失败，以及 Mihomo/OpenClash 中 Fake-IP 与 Redir-Host 模式的工作原理。"
slug: "dns-and-fake-ip-basics"
category: "配置知识"
primaryKeyword: "DNS与网络连接有什么关系"
secondaryKeywords: ["Fake-IP原理", "Redir-Host模式", "DNS污染与分流"]
searchIntent: "理解代理客户端里 DNS 区块的作用，学会区分 Fake-IP 与 Redir-Host 机制"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["DNS", "Fake-IP", "Redir-Host", "网络原理"]
relatedBrands: ["u1s1", "lingdongyun", "breezenet"]
relatedClients: ["mihomo", "openclash", "clash-verge-rev", "sing-box"]
relatedArticles: ["/clash/tun/", "/clients/openclash/", "/knowledge/system-proxy-vs-tun/"]
sources:
  - "MetaCubeX/mihomo DNS 与 Fake-IP 官方文档"
draft: false
indexable: true
stage: "stage3"
faqs:
  - question: "什么是 Fake-IP？它为什么会返回一个 198.18 开头的内网 IP？"
    answer: "Fake-IP 是 Mihomo 等现代内核的高效解析模式。当系统向客户端询问域名对应的 IP 时，客户端先立即返回一个保留测试网段的虚拟 IP（198.18.0.0/16）并在内存记下映射关系，真正连接建立时再直接把原始域名送去远端节点解析，省去了本地等待境外 DNS 响应的延迟。"
  - question: "什么情况下 Fake-IP 容易引发小问题？"
    answer: "当某些局域网软件、BT 工具、内网穿透或银行控件要求拿到目标网站的「真实 IP」才会正常握手时，拿到 198.18.x.x 虚拟地址可能会判断异常，此时需要将该域名加入 `fake-ip-filter` 过滤列表返回真实 IP。"
---

**核心结论：** 每次访问网站时，设备都要先通过 **DNS（域名系统）** 把人类可读的域名（如 `example.com`）翻译成数字 IP 地址。如果在只开了 TUN 或透明代理的情况下，本地依然向错误的公共 DNS 查询真实 IP，就会导致**域名分流命中失败、CDN 分配到遥远机房节点甚至直接无法解析**。因此，配合代理分流进行分域 DNS 解析或启用 **Fake-IP** 是保证连接精准流畅的基石。

## 1. 为什么开系统代理时很少需要手动折腾 DNS？

因为当浏览器走 **HTTP/SOCKS 系统代理** 时，浏览器根本不在本地解析境外域名——它直接把「域名字符串本身」交给本地 `7890` 端口，代理客户端拿到域名直接查规则表；若决定走代理，则将域名交给海外节点由节点就近解析。

而一旦开启 **[TUN 虚拟网卡模式](/clash/tun/)** 或 **[OpenClash 路由器透明代理](/clients/openclash/)**，应用发往网卡的只有「DNS 询问报文 + 目标 IP 包」，这就要求客户端内部必须承担起正确解析 DNS 的职责。

## 2. Redir-Host 与 Fake-IP 两种 DNS 处理路径对比

| 机制维度 | Redir-Host 模式 | Fake-IP 模式 |
| --- | --- | --- |
| **返回给本机的 IP** | 向国内/加密上游 DNS 查到的真实公网 IP | 本地瞬间分配的保留虚拟 IP（如 `198.18.0.x`） |
| **国内域名处理** | 由境内低延迟上游 DNS（如 `223.5.5.5`）直接解析本地最近 CDN | 可配置 `fake-ip-filter` 让国内域名依然走常规查询拿真实 IP |
| **海外域名响应** | 需先完成加密 DoH/DoT 查询才能发起实际连接，多一次握手等待 | 零等待直接建连，实际解析动作推迟到远端节点出口执行 |
| **常见排查重点** | 防止海外 DNS 请求被本地错误拦截导致查不到 IP | 确认没有把 Fake-IP 缓存写入本地 hosts 或遗留给未接管软件 |

## 3. 安全 DNS（DoH / DoT）与防泄漏基础

现代客户端配置通常建议在 `dns:` 段为 `nameserver`（境内直连域名解析）配置境内主流加密或低延迟 DNS，同时为 `fallback` 或 `proxy-server-nameserver`（解析节点域名自身、防死循环）配置合理加密服务器。切勿胡乱把所有 DNS 全部指向境外未知服务器，否则访问国内电商或视频网站时会被引导到海外绕行服务器，拖慢网速。
