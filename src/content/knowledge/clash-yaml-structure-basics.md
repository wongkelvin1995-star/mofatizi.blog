---
title: "Clash配置文件基础知识：YAML缩进、proxies、proxy-groups与rules结构读解"
description: "面向新手的 Clash/Mihomo YAML 配置文件结构教程：认识端口配置、proxies 节点定义、proxy-groups 策略组与 rules 匹配顺序，附带理论结构示例。"
slug: "clash-yaml-structure-basics"
category: "配置知识"
primaryKeyword: "Clash配置文件基础知识"
secondaryKeywords: ["Clash YAML格式", "Clash规则顺序", "proxy-groups写法"]
searchIntent: "看懂 Clash YAML 配置文件的基本结构和核心区块，学会排查缩进错误与调整简单规则"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["YAML", "配置文件", "Mihomo", "规则结构"]
relatedBrands: ["u1s1", "lingdongyun", "breezenet"]
relatedClients: ["clash-verge-rev", "clash-party", "mihomo"]
relatedArticles: ["/clash/subscription/", "/clash/modes/", "/knowledge/empty-node-list-troubleshooting/"]
sources:
  - "MetaCubeX/mihomo YAML 配置文件结构文档（2026-11-25）"
draft: false
indexable: true
stage: "stage3"
faqs:
  - question: "手动修改 YAML 配置文件后，客户端提示无法加载是怎么回事？"
    answer: "YAML 对空格缩进和冒号后的空格非常敏感！不能使用 Tab 制表符缩进，冒号后面（如 `type: select`）必须留一个英文空格；任意一行的空格数错位都会导致整个配置解析失败。"
  - question: "为什么我在 `rules` 末尾加了一条直连规则，却没有生效？"
    answer: "因为 Clash 规则是「自上而下逐条匹配，命中即止」的。你在规则最底下写了 `MATCH,节点选择` 之后，放在 `MATCH` 下面的任何规则永远不会被执行到。自定义规则必须插在最上方，或通过 Merge 覆写的 `prepend-rules` 写入。"
---

**核心结论：** Clash / Mihomo 配置文件全部采用 **YAML** 文本格式。看懂一份配置文件并不需要成为程序员，只需记住它的四大核心积木：**全局端口基础段**、**`proxies`（节点清单）**、**`proxy-groups`（策略分组）** 以及 **自上而下执行的 `rules`（分流规则）**。

## 1. 一份理论教学用的精简 YAML 结构示意

> 声明：以下为纯概念演示配置，不包含任何真实可用服务器地址或品牌数据，仅用于帮助读者认识语法结构。

```yaml
mixed-port: 7890
allow-lan: false
mode: rule

proxies:
  - name: "示例-新加坡节点"
    type: ss
    server: example-node.invalid
    port: 443
    cipher: aes-128-gcm
    password: "example-password"

proxy-groups:
  - name: "节点选择"
    type: select
    proxies:
      - "自动优选"
      - "示例-新加坡节点"
      - DIRECT

  - name: "自动优选"
    type: url-test
    proxies:
      - "示例-新加坡节点"
    url: "http://www.gstatic.com/generate_204"
    interval: 300

rules:
  - DOMAIN-SUFFIX,local,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,节点选择
```

## 2. 四个核心段落的含义拆解

1. **基础控制区（`mixed-port`、`mode`）：** `mixed-port: 7890` 让同一端口同时处理 HTTP 与 SOCKS5 代理请求；`mode: rule` 规定默认启动时处于规则分流模式。
2. **`proxies`（节点清单）：** 每个 `- name:` 对应一个远端代理服务器条目，包含协议 `type`、地址 `server` 与认证凭证。
3. **`proxy-groups`（策略组）：** 将分散节点组织成可切换面板。常见类型包括：
   - `select`：手动点击选择节点或子策略组；
   - `url-test`：按固定时间向测试 URL 发请求，自动挑最低握手延迟节点；
   - `fallback`：主节点超时时自动按顺序切往下一条备用节点。
4. **`rules`（分流规则）：** **从第一行往下依次比对，先命中哪条就执行哪条！** 末尾必须由 `MATCH,策略组` 兜底，负责捕获前面所有规则都没列出的其他域名。

## 3. 修改本地规则的正确方式

由于机场远程订阅每次自动更新都会覆盖原文件，推荐在 [Clash Verge Rev](/clients/clash-verge-rev/) 中使用 **Merge 覆写（`prepend-rules`）** 把自己想单独直连或走特定节点的域名插入到规则最顶部，既不破坏原始结构，也能在更新订阅后永久保留。
