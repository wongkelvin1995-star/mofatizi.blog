export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
}

export const SITE_CONFIG = {
  siteName: '魔法梯子',
  englishName: 'Magic Ladder',
  tagline: '极境魔法知识与客户端百科',
  domain: 'https://mofatizi.blog',
  language: 'zh-CN',
  year: 2026,
  author: {
    name: '魔法梯子编辑部',
    role: '网络工具文档整理与独立知识编辑团队',
    bio: '专注整理 2026 年中文网络工具知识、Clash/Mihomo/sing-box 客户端开源文档、订阅安全规范及 18 家机场品牌可追溯公开档案。',
  },
  contactEmail: 'editorial@mofatizi.blog',
  homeSeo: {
    title: '2026梯子推荐大全｜魔法梯子、科学上网工具与使用指南',
    h1: '2026 魔法梯子推荐大全',
    subtitle:
      '开启你的魔法网络知识之旅，探索机场品牌、网络连接工具、Clash客户端、订阅知识及新手使用指南，帮助不同设备与使用需求的用户选择适合自己的网络服务。',
    description:
      '魔法梯子提供2026梯子推荐、魔法机场介绍、Clash客户端知识、订阅教程及科学上网入门指南，汇集网络工具选择、品牌套餐分析和常见问题解决知识。',
  },
  defaultOgImage: '/illustrations/og-cover.jpg',
  indexNowKey: 'f4e9b2a1c8d7463e9b0a1d2c3e4f5a6b',
} as const;

export const MAIN_NAV: NavItem[] = [
  { label: '首页', href: '/' },
  {
    label: '梯子推荐',
    href: '/recommend/',
    children: [
      { label: '魔法梯子推荐', href: '/', desc: '2026 总览与核心入口' },
      { label: '魔法机场推荐', href: '/recommend/airports/', desc: '18 家品牌筛选与选型' },
      { label: '稳定梯子选择', href: '/recommend/reliable/', desc: '线路架构与连续性原理' },
      { label: '低预算梯子选择', href: '/recommend/budget/', desc: '月付与轻量年付成本逻辑' },
      { label: '高速连接知识', href: '/recommend/high-speed/', desc: '影响传输吞吐的技术因素' },
      { label: 'VPN选择指南', href: '/vpn/', desc: 'VPN 协议与机场服务边界' },
    ],
  },
  {
    label: 'Clash专区',
    href: '/clash/',
    children: [
      { label: 'Clash机场推荐', href: '/clash/airports/', desc: '核验兼容订阅的品牌名录' },
      { label: 'Clash订阅教程', href: '/clash/subscription/', desc: 'YAML 配置与订阅安全管理' },
      { label: 'Clash节点导入', href: '/clash/import/', desc: '一键唤起与手动导入步骤' },
      { label: 'Clash模式知识', href: '/clash/modes/', desc: 'Rule / Global / Direct 详解' },
      { label: 'Clash TUN模式', href: '/clash/tun/', desc: '虚拟网卡与 DNS 接管机制' },
      { label: 'Clash常见问题', href: '/clash/subscription-errors/', desc: '订阅更新失败排查指南' },
      { label: 'Clash客户端对比', href: '/clash/client-comparison/', desc: '主流桌面与移动前端横评' },
    ],
  },
  {
    label: '客户端大全',
    href: '/clients/',
    children: [
      { label: 'Clash Verge Rev', href: '/clients/clash-verge-rev/', desc: 'Tauri + Mihomo 桌面端' },
      { label: 'Clash Party', href: '/clients/clash-party/', desc: 'Electron + Mihomo 桌面端' },
      { label: 'Mihomo', href: '/clients/mihomo/', desc: 'MetaCubeX 开源核心引擎' },
      { label: 'Shadowrocket', href: '/clients/shadowrocket/', desc: 'iOS / Apple Silicon 端' },
      { label: 'v2rayN', href: '/clients/v2rayn/', desc: 'Win/macOS/Linux 多内核' },
      { label: 'v2rayNG', href: '/clients/v2rayng/', desc: 'Android 经典开源客户端' },
      { label: 'sing-box', href: '/clients/sing-box/', desc: 'SagerNet 通用代理平台' },
      { label: 'Hiddify', href: '/clients/hiddify/', desc: '五端统一 sing-box 前端' },
      { label: 'FlClash', href: '/clients/flclash/', desc: 'Flutter + Mihomo 跨端工具' },
      { label: 'OpenClash', href: '/clients/openclash/', desc: 'OpenWrt 路由器透明代理' },
    ],
  },
  {
    label: '魔法教程',
    href: '/guides/',
    children: [
      { label: '新手入门', href: '/guides/getting-started/', desc: '零基础三阶段魔法上网教程' },
      { label: 'VPN与机场区别', href: '/guides/vpn-vs-airport/', desc: '原理、分流与计费模式对比' },
      { label: '网络工具选择', href: '/tools/', desc: '按平台与场景匹配工具' },
      { label: '订阅购买', href: '/guides/buy-subscription/', desc: '下单核查与防骗注意事项' },
      { label: '节点管理', href: '/guides/switch-nodes/', desc: '节点切换与策略组逻辑' },
      { label: '常见问题', href: '/knowledge/#faq', desc: '账户、DNS 与权限高频疑问' },
    ],
  },
  { label: '机场品牌', href: '/brands/' },
  { label: '知识百科', href: '/knowledge/' },
  { label: '搜索', href: '/search/' },
];

export const PLATFORM_DEFINITIONS = [
  { id: 'Windows', label: 'Windows', desc: '桌面 PC 与 ARM 设备', icon: '🪟' },
  { id: 'macOS', label: 'macOS', desc: 'Apple Silicon 与 Intel Mac', icon: '🍎' },
  { id: 'iOS', label: 'iOS', desc: 'iPhone 与 iPadOS 生态', icon: '📱' },
  { id: 'Android', label: 'Android', desc: '安卓手机与平板', icon: '🤖' },
  { id: 'Linux', label: 'Linux', desc: '桌面发行版与终端环境', icon: '🐧' },
  { id: 'OpenWrt', label: 'OpenWrt', desc: '软路由与网关透明代理', icon: '📡' },
] as const;
