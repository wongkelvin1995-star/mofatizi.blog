---
title: "常见代理协议有哪些？SS、VMess、VLESS、Trojan与Hysteria2原理对比"
description: "科普当前机场与开源客户端常用的代理传输协议（Shadowsocks、VMess、VLESS、Trojan、Hysteria2、WireGuard），解析协议与客户端兼容性的对应关系。"
slug: "proxy-protocols-explained"
category: "魔法知识百科"
primaryKeyword: "常见代理协议有哪些"
secondaryKeywords: ["VLESS与SS区别", "Trojan协议", "Hysteria2协议科普"]
searchIntent: "理解 Shadowsocks、VLESS、VMess、Trojan 和 Hysteria2 等协议的特点及客户端选择要求"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["代理协议", "VLESS", "Shadowsocks", "Hysteria2"]
relatedBrands: ["lingdongyun", "u1s1", "breezenet", "wuyou"]
relatedClients: ["mihomo", "sing-box", "v2rayn", "shadowrocket"]
relatedArticles: ["/clients/mihomo/", "/clients/sing-box/", "/knowledge/empty-node-list-troubleshooting/"]
sources:
  - "Mihomo / sing-box / Xray 开源协议文档整理（2026-11-25）"
  - "18 家品牌协议标注记录统计"
draft: false
indexable: true
stage: "stage1"
faqs:
  - question: "机场简介写支持 SS 或 VLESS，是不是表示一定能直接导入 Clash？"
    answer: "不是。终端软件本身支持某协议，不等于服务商必然向用户开放第三方订阅链接。例如飞猫云、唯兔云、灵猫档案均有 VLESS 记录，但当前暂停或收紧了第三方通用订阅，需使用官方客户端。"
  - question: "为什么早年老版本 Clash 认不出某些机场下发的 VLESS 节点？"
    answer: "早期停更的原版 Clash 内核并不包含 VLESS（尤其是 XTLS-Vision/Reality 等扩展字段）解析代码，必须使用更新后的 Mihomo（原 Clash.Meta）或 sing-box 生态客户端。"
---

**核心结论：** 当前机场与自建代理服务最常见的协议集中在 **Shadowsocks (SS)**、**VLESS**、**VMess**、**Trojan** 与基于 QUIC 的 **Hysteria2**。在 2026 年的公开品牌档案中，**Shadowsocks** 与 **VLESS** 是出现频率最高的两类协议；选择第三方客户端时，确保其底层核心（如 **Mihomo** 或 **sing-box**）完整支持对应协议字段至关重要。

## 1. 主流代理协议技术特点对比

| 协议名称 | 底层传输 | 技术演进定位 | 客户端核心要求 |
| --- | --- | --- | --- |
| **Shadowsocks (SS)** | TCP / UDP | 轻量经典加密代理协议，CPU 开销低，移动端省电 | 几乎全系桌面/移动客户端均原生支持 |
| **VMess** | TCP / WS / gRPC | V2Ray 早期核心加密协议，依赖系统时间同步（容差通常 90 秒内） | Xray / V2Ray / Mihomo / sing-box |
| **VLESS** | TCP / TLS / Reality | 剥离冗余加密的现代轻量协议，广泛搭配 TLS 或 Reality | **需 Mihomo (Clash.Meta)、Xray、sing-box 或新版小火箭** |
| **Trojan** | TLS (443 端口) | 将代理流量伪装在标准 HTTPS TLS 握手中，对抗深度检测能力强 | Mihomo / sing-box / Xray / Shadowrocket |
| **Hysteria2 / TUIC** | UDP (QUIC) | 针对弱网高丢包链路优化拥塞控制，握手往返少 | 需新版 Mihomo、sing-box、Hiddify 或新版小火箭 |

## 2. 品牌档案中常见协议标注差异说明

查看本站 18 家品牌详情页时，你可能会注意到类似现象：部分品牌套餐宣传页面写着 `Shadowsocks (SS)`，而第三方后台节点记录却显示 `VLESS`（例如 [灵动云](/brands/lingdongyun/)、[全球云](/brands/quanqiuyun/)、[U1S1](/brands/u1s1/) 档案均如实注明了这一差异）。造成这种现象的原因通常有两点：
1. 品牌后台随时间推移升级了服务器后端协议，但老旧营销静态页未同步修改文本；
2. 官方客户端内部封装了特定协议通信，而面向开放订阅的后端下发了另一套兼容配置。

因此，**切勿单纯根据宣传文案写着某种协议，就倒推自己手上的第三方软件一定可用**，最终均应以购买后用户中心实际下发的配置和客户端要求为准。

## 3. 协议与本地网络环境的适配建议

- **遇到高丢包或校园网 UDP 阻断：** 如果使用 Hysteria2 等基于 UDP 的节点在某场所频频断流，往往是本地路由器或防火墙限制了高并发 UDP 转发；切回基于 TCP/TLS 的 VLESS 或 SS 节点通常会立刻恢复稳定。
- **使用 VMess / TLS 时注意校准时间：** TLS 握手与 VMess 认证高度依赖本地系统时钟准确性，电脑或路由器系统时间偏差超过一两分钟就会出现全部节点连不上的情况。
