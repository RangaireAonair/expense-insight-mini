# Expense Insight Mini

微信小程序记账工具，基于 Taro + React + TypeScript 实现。项目围绕「快速记账、账单管理、统计分析、预算账户、数据管理」构建，视觉风格参考绿色系 Material Design 原型。

## 功能概览

### 首页仪表盘

- 本月收入、支出、预算余额概览
- 月度预算使用进度
- 今日账单快捷展示
- 快速入口：记账、账单、账户预算、统计分析
- 本地/云端同步入口，优先本地缓存，预留微信云开发能力

### 记账核心

- 支持收入和支出两种记账类型
- 自定义数字键盘，适合移动端快速录入
- 分类选择：餐饮、交通、购物、娱乐、居住、医疗、工资、奖金等
- 自定义分类
- 多标签支持
- 账户选择：微信钱包、银行卡、支付宝、现金等
- 记账日期选择，支持补记
- 备注说明
- 编辑已有账单

### 账单管理

- 账单列表按日期分组展示
- 支持按月/按年筛选
- 支持全部、收入、支出筛选
- 支持搜索备注、分类、账户、标签
- 支持账单编辑和删除
- 自动统计当前筛选结果的收入、支出和净额

### 统计分析

- 月度收支统计
- 年度收支统计
- 分类占比饼图
- 收支趋势折线图
- 高频分类排行
- 支出/收入维度切换

### 预算与账户

- 多账户余额统计
- 新增账户
- 账户间转账
- 月度总预算设置
- 预算使用进度展示
- 预算超额提醒能力预留

### 我的与设置

- 微信授权登录，展示头像和昵称
- 主题模式配置入口
- 货币单位切换：CNY / USD
- 记账提醒设置：每日/每周、时间选择
- 隐私金额隐藏开关
- CSV 数据导出
- 云端备份入口
- 恢复示例数据
- 数据清理
- 扩展入口：发票 OCR、AI 消费分析、语音记账、家庭共享账本

## 技术栈

- Taro 3.6.35
- React 18
- TypeScript
- Sass
- 微信小程序
- 本地缓存：`Taro.setStorageSync` / `Taro.getStorageSync`
- 可视化：小程序 Canvas 绘制饼图和折线图

## 环境要求

建议使用：

- Node.js 20 LTS
- npm 10+
- 微信开发者工具

项目依赖已固定在 Taro 3.6.35，避免 Taro 4.x 依赖解析过重或安装卡住。

## 安装与运行

```powershell
git clone https://github.com/RangaireAonair/expense-insight-mini.git
cd expense-insight-mini
npm install
npm run dev:weapp
```

构建生产包：

```powershell
npm run build:weapp
```

构建完成后，用微信开发者工具打开项目根目录，并在开发者工具中选择自己的小程序 AppID。

## 常用脚本

```powershell
npm run dev:weapp     # 开发模式，监听并编译微信小程序
npm run build:weapp   # 构建微信小程序 dist
npm run typecheck     # TypeScript 类型检查
npm run lint          # ESLint 检查
npm run lint:fix      # ESLint 自动修复
npm run format        # Prettier 格式化
npm run format:check  # Prettier 格式检查
npm run commit        # 调起 cz-git 交互式提交向导
npm run release       # 生成版本、CHANGELOG、tag，并推送到远端
```

## 提交规范与质量检查

项目使用 Husky + lint-staged + ESLint + Prettier + commitlint：

- `pre-commit`: 对暂存文件执行 ESLint 自动修复、Prettier 格式化，并执行 `npm run typecheck`
- `commit-msg`: 校验提交信息是否符合 Angular 风格 Conventional Commits
- `npm run commit`: 调起 `cz-git` 交互式提交向导，按提示选择 type、scope、填写 subject/body
- `typecheck`: 开启 `noUnusedLocals` 和 `noUnusedParameters`，用于检查已声明但未使用的变量和参数

推荐提交方式：

```powershell
git add .
npm run commit
```

提交信息格式：

```text
<type>(<scope>): <subject>
```

示例：

```text
feat(bill): add monthly filters
fix(add): prevent invalid amount submission
docs(readme): update setup guide
build(release): configure changelog workflow
```

允许的 `type`：

```text
feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

更多说明见 [`docs/commit-convention.md`](docs/commit-convention.md)。

## 版本升级与 CHANGELOG

项目使用 `standard-version` 基于 Conventional Commits 自动生成 `CHANGELOG.md`、升级 `package.json` / lockfile 版本、创建 release commit、创建 tag，并推送到远端。

release 提交信息固定为 Angular 风格：

```text
chore(release): vX.Y.Z
```

```powershell
npm run release        # 自动根据提交类型推断版本，并 push commit/tag
npm run release:patch  # 手动升级 patch，并 push commit/tag
npm run release:minor  # 手动升级 minor，并 push commit/tag
npm run release:major  # 手动升级 major，并 push commit/tag
```

## 目录结构

```text
expense-insight-mini
├─ config                  # Taro 构建配置
├─ src
│  ├─ components
│  │  └─ BottomNav          # 自定义底部导航
│  ├─ pages
│  │  ├─ index              # 首页仪表盘
│  │  ├─ bills              # 账单明细
│  │  ├─ add                # 记账录入
│  │  ├─ analytics          # 统计报表
│  │  ├─ accounts           # 账户与预算
│  │  └─ profile            # 我的与设置
│  ├─ store
│  │  └─ finance.ts         # 本地数据、账单、账户、预算、同步逻辑
│  ├─ utils
│  │  └─ format.ts          # 金额、日期、统计工具函数
│  ├─ app.config.ts
│  ├─ app.scss
│  ├─ app.tsx
│  ├─ global.d.ts
│  └─ types.ts
├─ project.config.json      # 微信开发者工具项目配置
├─ package.json
└─ README.md
```

## 数据说明

当前版本默认使用本地缓存保存数据，包含：

- 用户信息
- 分类
- 标签
- 账户
- 账单记录
- 预算
- 系统设置

`src/store/finance.ts` 中已经预留 `syncToCloud` 方法。如果启用微信云开发，可在该方法中接入云数据库集合，例如 `money_backups`、`records`、`accounts`、`budgets`。

## 后续规划

- 接入微信云开发，实现多端同步
- 增加分类预算的编辑页面
- 增加账单金额范围筛选
- 增加 Excel 文件导出
- 接入 OCR 识别发票和收据
- 接入语音记账
- 接入 AI 消费分析和月度建议
- 增加家庭共享账本和多人协作
