---
title: "Clash TUN模式设置：虚拟网卡原理、服务模式权限与DNS配合详解"
description: "深入讲解 Clash / Mihomo TUN 虚拟网卡模式的工作原理、与系统代理的本质区别、Windows/macOS 服务模式提权、Fake-IP DNS 配合及常见冲突排查。"
slug: "clash-tun"
category: "Clash知识"
primaryKeyword: "Clash TUN模式设置"
secondaryKeywords: ["TUN模式是什么", "Clash虚拟网卡", "Clash服务模式安装"]
searchIntent: "理解何时需要开启 Clash TUN 模式、如何正确提权与配置服务模式，并避免开启 TUN 后断网或与系统 VPN 冲突"
publishDate: "2026-11-25"
updatedDate: "2026-11-25"
tags: ["TUN模式", "虚拟网卡", "系统代理", "DNS", "Mihomo"]
relatedBrands: ["u1s1", "lingdongyun", "breezenet"]
relatedClients: ["clash-verge-rev", "clash-party", "mihomo", "flclash"]
relatedArticles: ["/clash/modes/", "/knowledge/system-proxy-vs-tun/", "/knowledge/dns-and-fake-ip-basics/"]
sources:
  - "MetaCubeX/mihomo TUN 与 DNS 官方架构文档"
  - "Clash Verge Rev / Clash Party 服务模式文档"
draft: false
indexable: true
faqs:
  - question: "平时只开「系统代理」和开启「TUN 模式」有什么区别？"
    answer: "系统代理（System Proxy）仅在系统环境变量中登记一个本地代理端口，只对主动读取该设置的应用（如 Chrome/Edge 等）生效；TUN 模式则是在操作系统底层创建一张虚拟网卡并修改路由表，所有软件发出的 TCP/UDP/ICMP 流量都会被透明接管。"
  - question: "点击 TUN 模式开关后自动弹回关闭状态怎么办？"
    answer: "绝大多数情况下是因为没有安装「服务模式（Service Mode）」或未以管理员权限启动客户端。操作虚拟网卡需要操作系统特权，在 Clash Verge Rev 或 Clash Party 的设置中先完成服务模式授权，再打开 TUN 即可。"
  - question: "开启 TUN 模式后国内网页打不开了怎么办？"
    answer: "通常是 DNS 配置与 TUN 栈不匹配（例如 YAML 里没有开启内置 `dns.enable: true` 或缺少 `tun.dns-hijack`），导致虚拟网卡拦截了流量却无法完成域名解析。开启客户端自带的 DNS 覆写或关闭不必要的复杂拦截即可修复。"
---

**核心结论：** **TUN 模式**（虚拟网卡模式）能让 Clash/Mihomo 在操作系统网络层建立虚拟网络接口，接管那些**不遵守系统代理设置的应用程序**（如终端 CLI、Git、Python/Node 包管理器、部分游戏或桌面客户端）。在 Windows 和 macOS 上开启 TUN 前，务必先授权安装**服务模式（Service Mode）**并确保配置中启用了有效的 **DNS 接管**，同时在退出或使用公司内网 VPN 时关闭 TUN 以防网卡冲突。

## 1. 为什么系统代理够用时不要盲目常开 TUN？

对比两种本地流量接管方式，可以清晰看出各自边界：

| 对比维度 | 系统代理（System Proxy） | TUN 模式（虚拟网卡） |
| --- | --- | --- |
| 工作层 | 应用层 HTTP / SOCKS 环境变量 | 网络层（L3）虚拟网卡接口 |
| 覆盖软件范围 | 浏览器及遵循系统代理的常规客户端 | 几乎全系统应用（含命令行、UDP 流量与忽略系统代理的程序） |
| 权限要求 | 普通用户权限即可开关 | Windows 需服务模式/管理员权限；macOS/Linux 需提权授权 |
| 对本地网络侵入性 | 极低，关闭即恢复 | 会插入系统默认路由与接管 DNS 查询，与其他 VPN 并存易冲突 |

因此，如果日常只是浏览器查资料、看视频和使用常见办公客户端，只开启系统代理足够轻量稳健；仅当你需要让**终端工具、开发编译环境或特殊 UDP 桌面应用**走分流通道时，再打开 TUN 模式。进一步原理对比请参阅 [系统代理与 TUN 模式差异解析](/knowledge/system-proxy-vs-tun/)。

## 2. Windows 与 macOS 开启 TUN 模式标准步骤

以主流的 [Clash Verge Rev](/clients/clash-verge-rev/) 和 [Clash Party](/clients/clash-party/) 为例：

1. **安装并激活服务模式（Service Mode）：**
   - 桌面普通权限进程无权在系统内核创建虚拟网卡。进入客户端 **「设置（Settings）」**，找到 **「服务模式（Service Mode）」** 选项，点击安装/授权（Windows 会弹出 UAC 管理员确认框，macOS 会要求输入开机密码安装后台助手）。
   - 服务模式显示状态为 **已安装 / Active** 后，以后重启电脑打开客户端无需每次右键「以管理员身份运行」。
2. **开启核心 DNS 与域名嗅探（极关键）：**
   - 如果机场下发的 YAML 配置文件中没有包含 `dns:` 区块，直接拉起 TUN 后往往会出现域名解析超时。建议确认客户端的 Mihomo DNS 功能已开启（或采用内置默认 Fake-IP / Redir-Host 模板，且启用了 `dns-hijack: [any:53]`）。
3. **打开 TUN 开关并关闭多余系统代理（可选）：**
   - 在设置或首页打开 **「TUN 模式」** 开关。此时系统网络连接列表里会出现一张名为 `Meta` 或 `Mihomo` 的虚拟适配器。
   - 开启 TUN 后，一般可以关闭「系统代理（System Proxy）」，减少浏览器和软件先走系统代理端口再重复转发的冗余（部分特殊应用需保留系统代理兼容时才双开）。

## 3. 协议栈（Stack）选择：system、gvisor 与 mixed

在高级 TUN 设置中，经常能看到栈模式选择：
- **`mixed`（混合栈，多数桌面端默认推荐）：** TCP 流量走系统原生协议栈以保证高吞吐和低延迟，UDP 流量由用户态 `gVisor` 处理以提升稳定性与兼容性。
- **`system`（系统栈）：** 性能开销较低，但在部分严格防火墙或老旧系统环境下的 UDP 转发兼容度略弱。
- **`gvisor`：** 完全在用户态模拟 TCP/IP 协议栈，隔离性强但高并发下 CPU 占用略高，常见于特定容器或权限受限环境。

## 4. 开启 TUN 后的常见问题与安全防冲突习惯

- **与企业内网 VPN / 校园网客户端冲突：** 若公司要求连接 Cisco AnyConnect、OpenVPN、WireGuard 或学校认证客户端，请务必**提前关闭 TUN 模式**。两张虚拟网卡同时抢夺系统默认路由表（`0.0.0.0/0`）会立刻导致双方全部掉线。
- **非正常关机或强杀进程导致断网：** 若客户端异常崩溃未能移除虚拟路由，可重新打开客户端正常关闭一次 TUN 开关，或在 Windows 网络适配器设置中检查系统代理和虚拟网卡状态。
- **Linux 桌面权限设置：** Linux 下使用 `.AppImage` 或 `.deb` 运行 Clash 客户端时，同样需要按官方文档给内核可执行文件赋予 `cap_net_admin`、`cap_net_bind_service` 权限或通过 systemd 服务拉起 TUN。
