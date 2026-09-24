# SYCOPHONE · 项目交接笔记

> 本文件是聊天会话的总结交接稿，供换机/换 AI 时快速恢复上下文。
> 写于 2026-09-23。远程仓库：https://github.com/ZhuZiliang99/sycophone.git

## 一、项目是什么

从零搭建的**全栈练手项目**：自动识别和弦、调性、BPM 和节奏的音乐分析网站，附带音乐项目管理功能（用户登录、查询历史、自定义可视化特效、VIP 权限等）。目标是练习前端 + 后端 + 数据库 + 自动部署 + 测试环境的完整流程。

- 前端：React（本项目不用 Vue）
- 需求来源：参考了另一个 Vue 项目的技术栈，但代码全部自己从零写
- 首页已按"极简艺术"方向完成：无滚动、线稿风格、以 John Coltrane《Giant Steps》和弦进行做装饰/按钮、五线谱元素

## 二、技术栈现状

```
pnpm workspace（monorepo）
└── apps/web          # 前端
    React 19 + Vite 8 + TypeScript ~6.0
    react-router-dom 7 + Tailwind CSS 4 + shadcn/radix 组件
    oxlint
```

已完成：
- 首页（`apps/web/src/pages/home/`）+ 登录对话框（`apps/web/src/components/auth/LoginDialog.tsx`）
- 路由骨架（`apps/web/src/routers/`）：home / workshop / dashboard / NotFound
- 后端、数据库、部署：**还没开始**（下一步规划见第七节）

## 三、设计语言（全站统一）

| 变量 | 值 | 用途 |
|---|---|---|
| `--bg` | `#0d0f0e` | 背景（近黑，微绿） |
| `--ink` | `#eee9dc` | 主文字（暖白） |
| `--line` | `#55605a` | 发丝线 / 次要元素 |
| `--acid` | `#dfff61` | 酸绿强调色（激活态、播放头、针尖） |
| `--gold` | `#d4a878` | 金色（衬线斜体、次强调） |

- 字体：**Georgia 衬线**做展示标题（大号、斜体、收紧字距），Arial 做微标签（大写、`letter-spacing: .2em+`）
- 风格关键词：线稿、无填充、发丝边框、艺术极简、Giant Steps 三 tonic（B / E♭ / G♭）母题

## 四、布局方案评审结论（本次会话）

讨论了 4 个布局方案：

- **A · 谱面工作台**：全屏五线谱背景 + 左侧琴弦音符导航 + 播放头扫谱（最稳，扩展性最好）
- **B · 调性星盘**：五度圈轮盘 + 卫星轨道导航 + 引线连接内容面板（适合调性/和弦可视化详情页）
- **C · Coltrane 矩阵**：三 tonic 三栏网格导航，悬停浮现和弦注记（适合曲库/列表页）
- **D · 留声机导航**：超大黑胶唱片 + 菜单沿沟槽弧线排布 + 唱针（阻尼弹簧）转向选中项 ← **已选定**

### 最终决策

- **导航栏放页面底部**，就是 3D 黑胶留声机（`TurntableNav`）
- 3D 用 React 生态：**react-three-fiber（R3F）+ drei**，不用裸 three
- 菜单标签用 HTML overlay（drei `<Html>`），**不随唱片旋转**；只有沟槽纹理旋转
- 用户自己动手实现（有 THREE.js 基础），AI 只提供方案与调试

## 五、留声机 3D 导航 · 实施方案

### 依赖（待安装）

```powershell
pnpm --filter web add three @react-three/fiber @react-three/drei
```

### 坐标映射（2D demo → 3D 场景）

| 2D demo | 3D 场景 | 说明 |
|---|---|---|
| 圆心 (300,240) | 世界原点 (0,0,0) | 唱片平放 XZ 平面 |
| r = 170 | r = 3.2 | 世界单位 |
| 绕屏幕 z 轴旋转 | 绕世界 **y 轴**（`rotation.y`） | 唱片平放后 |
| 唱针角度 `atan2(dy,dx)` | 同款 atan2（轴符号调试一次定） | 数学复用 |
| 菜单 θ/r | θ 不变，r 压缩到 1.9–2.6 | 沿弧/螺线排布 |

### 组件结构

```
components/turntable/
├── TurntableNav.tsx    # <Canvas> 容器（底部导航，高约 300px），dpr={[1,2]}
├── VinylDisc.tsx       # 唱片：cylinderGeometry + CanvasTexture 沟槽 + useFrame 自转
├── Tonearm.tsx         # 唱臂：pivot group（约 [3.3, 1.1, -1.5]）+ primitive 组装
└── (弹簧逻辑可直接写进 Tonearm)
```

### 核心数学（已在 2D demo 验证过，直接抄）

```
菜单极坐标:     x = cx + r·cos(θ),  y = cy + r·sin(θ)
唱臂目标角:     rot = atan2(y - pivotY, x - pivotX) - base   # base = 唱臂初始朝向
阻尼弹簧(连续):  vel += (target - a)·k·dt - vel·c·dt;  a += vel·dt   # k≈10, c≈4
```

useFrame 版弹簧（帧率无关）：

```tsx
const vel = useRef(0)
const target = ANGLES[activeIndex]
useFrame((_, dt) => {
  const a = arm.current.rotation.y
  vel.current += (target - a) * 10 * dt - vel.current * 4 * dt
  arm.current.rotation.y += vel.current * dt
})
```

### 分阶段（每步可独立运行验证）

1. **能转的黑胶**：`<Canvas>` + 平放圆柱（h≈0.06）+ CanvasTexture 画同心圆沟槽挂 `roughnessMap`/`bumpMap` + `useFrame` 慢速自转（~0.15 rad/s）
2. **唱臂 + 弹簧**：pivot group + 底座/臂管/配重/唱头四个 primitive + 上面弹簧代码
3. **菜单按钮 + 路由**：drei `<Html transform={false}>` 渲染 DOM 按钮钉在 3D 坐标；点击 → `setActive(i)` + `navigate(paths[i])`
4. **打磨**：ambient + 暖 spotlight（金属反射可选 `<Environment preset="city">`）；选中项针尖 `emissive` 酸绿；`prefers-reduced-motion` 时停转+直接 snap；主体内容区留 padding-bottom

### 关键警告

- **别用 3D 文字**（troika 等），一律 drei `<Html>` / 手动投影 → 排版、可点击、无障碍全白送
- **别做写实金属材质**，和首页线稿美学打架。推荐三选一：EdgesGeometry 线框蓝图风 / MeshToonMaterial 平涂 / 深色哑光 + 针尖唯一发光点
- 唱臂**定长**，菜单项半径不同 → 针尖对齐**角度**而非精确落点（真实唱臂也有 tracking angle error）
- 性能：`dpr={[1,2]}`，<50k 三角形，tab 隐藏时可 `frameloop="never"`

## 六、2D 参考实现（已导出）

**`demos/gramophone-2d.html`** —— 单文件、双击即开、含逐段注释：
纯 SVG + CSS 旋转 + rAF 阻尼弹簧 + HTML 百分比定位按钮。菜单角度/弹簧/坐标计算全部可抄进 3D 版。

## 七、下一步 Roadmap（原始规划）

1. **当前**：3D 留声机底部导航（按第五节执行）
2. **音频分析核心**：chord / key / BPM / 节奏识别（可调研 aubio、librosa 后端方案，或 essentia；Web 端可先 mock 数据）
3. **后端**：Node（或自选）+ 数据库；用户系统（登录已有前端对话框）、分析历史 CRUD
4. **VIP 权限**、自定义可视化特效（3D 和弦色彩/调性/曲风可视化——留声机之外的第二个视觉重点）
5. **自动部署 + 测试环境**（CI/CD、GitHub Actions）

## 八、环境备注（重要）

- **git push 失败原因**：机器开着系统代理（Clash 系，`127.0.0.1:7897`），但 git 不读 Windows 系统代理 → 443 直连超时
- 临时解法：`$env:HTTPS_PROXY="http://127.0.0.1:7897"; $env:HTTP_PROXY="http://127.0.0.1:7897"; git push`
- 永久解法：`git config --global http.https://github.com.proxy http://127.0.0.1:7897`（代理关了记得 unset）
- 包管理器：pnpm（workspace 在仓库根）
- Node：24.x（volta 钉过版本）
