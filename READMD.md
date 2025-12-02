# SimpleExam Frontend

## 项目介绍

SimpleExam 是一个现代化的在线考试系统前端项目，基于 Vue 3 构建。提供课程学习、练习题库、在线考试、订单支付等完整的在线教育功能。

## 主要特性

- 🎯 **课程管理** - 浏览课程、查看详情、参与练习和考试
- 📚 **题库练习** - 支持分类练习、错题复习等功能
- 📝 **在线考试** - 完整的考试流程，包含计时、提交、成绩查看
- 💰 **订单支付** - 支持微信支付和兑换码购买课程
- 👤 **用户中心** - 个人信息管理、成绩查询、学习进度
- 🔐 **多种登录方式** - 支持账号密码登录、微信扫码登录、微信授权登录
- 🎨 **现代化 UI** - 基于 Tailwind CSS 和 Radix Vue 构建的美观界面
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🌓 **主题切换** - 支持明暗主题切换

## 技术栈

### 核心框架
- **Vue 3.3+** - 渐进式 JavaScript 框架
- **Vite 4.3+** - 新一代前端构建工具
- **Vue Router 4.2+** - 官方路由管理器
- **Pinia 3.0+** - 新一代状态管理库

### UI 框架
- **Tailwind CSS 3.4+** - 实用优先的 CSS 框架
- **Radix Vue 1.2+** - 无样式、可访问的 Vue 组件
- **Lucide Vue Next** - 精美的图标库
- **VueUse** - Vue Composition API 工具集

### 工具库
- **class-variance-authority** - 组件变体管理
- **clsx** - 条件类名工具
- **tailwind-merge** - Tailwind 类名合并工具
- **lodash-es** - JavaScript 实用工具库
- **qrcode** - 二维码生成库

## 项目结构

```
SimpleExam-Frontend/
├── src/                    # 源代码目录
│   ├── api/               # API 接口封装
│   │   ├── course.js      # 课程相关接口
│   │   ├── exam.js        # 考试相关接口
│   │   ├── order.js       # 订单相关接口
│   │   ├── payment.js     # 支付相关接口
│   │   ├── practice.js    # 练习相关接口
│   │   ├── question.js    # 题目相关接口
│   │   └── user.js        # 用户相关接口
│   ├── components/        # 公共组件
│   │   ├── ConfirmDialog.vue
│   │   ├── ErrorMessage.vue
│   │   ├── Header.vue
│   │   ├── TabBar.vue
│   │   └── ThemeToggle.vue
│   ├── composables/       # 组合式函数
│   │   └── useTheme.js
│   ├── config/           # 配置文件
│   │   └── index.js      # API 配置、路由配置等
│   ├── pages/            # 页面组件
│   │   ├── HomePage.vue          # 首页
│   │   ├── LoginPage.vue         # 登录页
│   │   ├── CoursePage.vue        # 课程详情页
│   │   ├── CoursePracticePage.vue # 课程练习页
│   │   ├── CourseExamPage.vue    # 课程考试页
│   │   ├── ExamResultPage.vue    # 考试结果页
│   │   ├── PracticePage.vue      # 练习页
│   │   ├── ProfilePage.vue       # 个人中心
│   │   ├── OrderPage.vue         # 订单页
│   │   ├── PaymentPage.vue       # 支付页
│   │   └── ...
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # 状态管理
│   │   ├── user.js       # 用户状态
│   │   └── settings.js   # 设置状态
│   ├── utils/            # 工具函数
│   │   ├── auth.js       # 认证相关
│   │   ├── date.js       # 日期处理
│   │   ├── message.js    # 消息提示
│   │   └── request.js    # HTTP 请求封装
│   ├── App.vue          # 根组件
│   ├── main.js          # 应用入口
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
├── package.json         # 项目依赖
└── READMD.md            # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

或

```bash
yarn install
```

### 开发模式

```bash
npm run dev
```

或

```bash
yarn dev
```

项目将在 `http://localhost:5173` 启动（端口可能会有所不同）。

### 构建生产版本

```bash
npm run build
```

或

```bash
yarn build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

或

```bash
yarn preview
```

## 环境配置

项目使用环境变量进行配置，需要在项目根目录创建 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=https://your-api-domain.com

# 微信 App ID
VITE_WECHAT_APP_ID=your_wechat_app_id

# 微信回调地址
VITE_WECHAT_CALLBACK_URL=https://your-domain.com/wechat/callback
```

更多环境变量配置请参考 `src/config/index.js`。

## 主要功能说明

### 用户认证
- **账号登录** - 支持用户名密码登录
- **微信登录** - 支持微信内自动授权登录
- **扫码登录** - 支持微信扫码登录（PC 端）

### 课程功能
- **课程列表** - 浏览所有可用课程
- **课程详情** - 查看课程信息、章节内容
- **课程练习** - 按章节和题型进行练习
- **课程考试** - 参与课程的正式考试

### 练习系统
- **分类练习** - 按题目类型进行练习
- **错题复习** - 查看和复习错题
- **练习历史** - 查看历史练习记录

### 考试功能
- **开始考试** - 创建考试并开始答题
- **计时功能** - 显示考试剩余时间
- **提交考试** - 提交答案并查看成绩
- **成绩查看** - 查看详细考试结果和错题分析

### 订单支付
- **创建订单** - 为课程创建购买订单
- **微信支付** - 支持微信支付
- **兑换码** - 支持使用兑换码购买课程
- **订单管理** - 查看订单列表和详情

## 构建优化

项目配置了以下构建优化：

- **代码分割** - 自动分割 vendor、UI 组件和页面代码
- **资源压缩** - 使用 Terser 进行代码压缩和混淆
- **路由预加载** - 在空闲时预加载路由组件，提升用户体验
- **Tree Shaking** - 自动移除未使用的代码

具体配置请参考 `vite.config.js`。

## 开发规范

### 代码风格
- 使用 Vue 3 Composition API
- 组件使用 `<script setup>` 语法
- 样式使用 Tailwind CSS 类名
- 遵循 Vue 官方风格指南

### 目录规范
- `pages/` - 页面组件，每个页面一个文件
- `components/` - 可复用的公共组件
- `api/` - API 接口封装，按功能模块划分
- `utils/` - 工具函数，按功能分类
- `stores/` - Pinia 状态管理，按模块划分

## 路由说明

主要路由包括：
- `/` - 首页
- `/login` - 登录页
- `/course/:id` - 课程详情
- `/course/:id/practice` - 课程练习
- `/course/:id/exam` - 课程考试
- `/practice` - 练习中心
- `/profile` - 个人中心
- `/order` - 订单页面
- `/payment/:courseId` - 支付页面

完整路由配置请参考 `src/router/index.js`。

## API 文档

详细的 API 接口文档请参考：
- `API.md` - 主要 API 接口文档
- `Feedback-API.md` - 反馈相关 API 文档

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- 微信内置浏览器

## 许可证

请查看 `LICENSE` 文件了解项目许可证信息。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

---

**SimpleExam Frontend** - 让在线考试更简单 ✨