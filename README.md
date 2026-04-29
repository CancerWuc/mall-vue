# Mall Admin — Vue 前端

基于 **Vue 3 + Vite + Element Plus + Pinia + Vue Router + Axios** 构建的电商后台管理系统前端，对接 `mall-admin` 服务端（Spring Boot 3 + Spring Security + JWT）。

当前前端主要覆盖后台管理服务 `mall-admin` 的系统管理能力。商品、营销、会员、订单、仓储等后端服务已有基础模块，但对应管理页面还需要后续扩展。

## 功能模块

- 登录 / 登出 / 修改密码 / 个人中心
- 系统管理
  - 用户管理（增删改查、角色分配、状态管理）
  - 角色管理（增删改查、菜单授权）
  - 菜单管理（树形结构，目录 / 菜单 / 按钮三级，权限标识）
  - 字典管理（字典类型 + 字典数据）
  - 参数设置
  - 文件管理（OSS 上传、删除）
- 日志管理
  - 登录日志
  - 操作日志
- 仪表盘 + 404 页

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 构建 | Vite 5 |
| 框架 | Vue 3.5（`<script setup>`） |
| UI | Element Plus 2 + @element-plus/icons-vue |
| 状态 | Pinia |
| 路由 | Vue Router 4（History 模式） |
| 请求 | Axios + 全局拦截器 |
| 鉴权 | JWT，Token 通过 `token` Header 传递，Cookie 持久化 |
| 样式 | Sass + Element Plus 暗色变量 |
| 自动导入 | unplugin-auto-import + unplugin-vue-components |

## 目录结构

```
mall-vue/
├── public/                 静态资源
├── src/
│   ├── api/                按模块封装的后端接口
│   │   ├── auth.js         登录/登出/用户信息
│   │   ├── user.js         用户管理
│   │   ├── role.js         角色管理
│   │   ├── menu.js         菜单管理
│   │   ├── dict.js         字典类型 + 字典数据
│   │   ├── config.js       参数配置
│   │   ├── oss.js          文件上传
│   │   └── log.js          日志查询
│   ├── assets/styles/      全局样式 / SCSS 变量
│   ├── components/         通用组件（Pagination 分页等）
│   ├── directive/          自定义指令
│   │   └── permission.js   v-permission 按钮权限控制
│   ├── layout/             管理后台布局
│   │   ├── index.vue       整体框架（侧栏 + 顶栏 + 面包屑 + 主区域）
│   │   └── components/     Sidebar / Navbar / Breadcrumb / AppMain
│   ├── router/index.js     静态路由 + 动态业务路由定义
│   ├── store/              Pinia 状态管理
│   │   └── modules/
│   │       ├── user.js     登录态 / 用户信息 / 权限
│   │       └── app.js      侧栏折叠等 UI 状态
│   ├── utils/
│   │   ├── request.js      Axios 实例 + 请求/响应拦截器
│   │   ├── auth.js         Token 读写（js-cookie）
│   │   └── permission.js   权限判断函数
│   ├── views/              页面组件
│   │   ├── login/          登录页
│   │   ├── dashboard/      首页仪表盘
│   │   ├── profile/        个人中心
│   │   ├── system/         用户/角色/菜单/字典/参数/OSS
│   │   ├── log/            登录日志 / 操作日志
│   │   └── error/          404
│   ├── App.vue             根组件（Element Plus 国际化）
│   ├── main.js             入口：挂载 Pinia / Router / 全局图标 / 指令
│   └── permission.js       全局路由守卫（Token 校验 + 动态路由注入）
├── .env.development        开发环境变量
├── .env.production         生产环境变量
├── index.html              HTML 入口
├── package.json
└── vite.config.js          Vite 配置（代理、别名、自动导入）
```

## 环境要求

- Node.js >= 18
- npm / pnpm / yarn 任一
- 后端至少启动 `mall-admin`；如果通过网关访问，还需要启动 Nacos 和 `mall-gateway`

## 脚本命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器，默认 `http://localhost:5173` |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览生产构建产物 |

## 安装 & 启动

```bash
cd mall-vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

默认运行在 `http://localhost:5173`，自动打开浏览器。

## 后端接口配置

开发环境通过 Vite 代理将 `/api` 转发到后端：

```ini
# .env.development
VITE_APP_BASE_API=/api
VITE_API_TARGET=http://localhost:8090
```

- 直连 `mall-admin`：将 `VITE_API_TARGET` 设为 `http://localhost:8090`
- 通过网关访问：将 `VITE_API_TARGET` 设为 `http://localhost:88`

代理前缀规则：

| 场景 | 配置 | 行为 |
| --- | --- | --- |
| 默认直连 admin | `VITE_API_TARGET=http://localhost:8090` | `/api/admin/auth/login` 会被代理为 `/admin/auth/login` |
| 默认走网关 | `VITE_API_TARGET=http://localhost:88` | 保留 `/api`，交给网关匹配 `/api/admin/**` |
| 手动关闭重写 | `VITE_API_REWRITE=false` | 无论目标端口是什么，都保留 `/api` |

接口规约（与后端保持一致）：

- 统一前缀：`/admin/...`
- 鉴权 Header：`token: <jwt>`
- 标准响应：`{ code: 0, msg: "success", ...payload }`，`code !== 0` 视为失败
- 401 自动弹框提示并跳转登录页

## 本地联调步骤

1. 初始化后端数据库，确认 `mall_admin` 库和默认账号已导入。
2. 启动 `mall-admin`，直连模式下默认地址为 `http://localhost:8090`。
3. 如需走网关，额外启动 Nacos 和 `mall-gateway`，确认 Nacos 控制台能看到 `mall-admin`。
4. 启动前端：

```bash
npm run dev
```

5. 使用默认账号 `admin / admin` 登录。

## 默认账号

```
用户名：admin
密  码：admin
```

> 来自 `mall-admin/db/mysql.sql` 初始数据（BCrypt 加密）。

## 生产构建

```bash
npm run build
```

产物输出到 `dist/`，可由 Nginx 等静态服务托管。生产环境 API 地址在 `.env.production` 中配置：

```ini
VITE_APP_BASE_API=http://your-gateway-or-admin-host:port
```

Nginx 部署时需配置 SPA 回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 权限控制

本项目实现了完整的前端权限体系：

| 层级 | 机制 | 说明 |
| --- | --- | --- |
| 路由级 | `permission.js` 路由守卫 | Token 校验、动态路由注入 |
| 菜单级 | `router/index.js` 中 `asyncRoutes` | 侧栏根据路由配置自动渲染 |
| 按钮级 | `v-permission` 指令 | 模板中 `v-permission="'sys:user:save'"` 控制按钮显隐 |
| JS 级 | `utils/permission.js` | `hasPermission()` 函数用于逻辑判断 |

权限标识来自后端 `GET /admin/auth/info` 返回的 `permissions` 数组。

## 核心流程

```text
main.js
  └─ 注册 Pinia / Router / Element Plus 图标 / 自定义指令

permission.js
  └─ 检查 token
      ├─ 无 token：跳转登录
      └─ 有 token：fetchInfo() 获取用户、权限、菜单树，并注入 asyncRoutes

utils/request.js
  └─ axios 请求拦截器自动携带 token，响应拦截器统一处理 code 和 401

views/*
  └─ 调用 src/api/* 中的接口模块，使用 Element Plus 渲染页面
```

## 开发约定

- 新增后端接口时，在 `src/api/` 下按业务模块封装请求函数，页面不要直接散落 axios 配置。
- 新增页面时，优先放到 `src/views/<module>/`，再在 `src/router/index.js` 的 `asyncRoutes` 中补充路由。
- 路由 `meta.title` 用于菜单和面包屑，`meta.icon` 使用 Element Plus 图标名，`meta.perms` 与后端权限标识保持一致。
- 按钮权限使用 `v-permission="'sys:user:save'"` 这类权限标识控制。
- 公共 UI 组件放在 `src/components/`，业务页面内的弹窗/表单可先贴近页面维护，复用明显后再抽组件。
- 上传接口使用 `src/api/oss.js` 中的 `getUploadUrl()`，它会基于 `VITE_APP_BASE_API` 拼接上传地址。

## 已对接的接口清单

| 模块 | 路径 |
| --- | --- |
| 认证 | `POST /admin/auth/login`、`GET /admin/auth/info`、`POST /admin/auth/password`、`POST /admin/auth/logout` |
| 用户 | `/admin/sys/user/{list, info/{id}, save, update, delete}` |
| 角色 | `/admin/sys/role/{list, info/{id}, save, update, delete, select}` |
| 菜单 | `/admin/sys/menu/{list, info/{id}, save, update, delete/{id}, select}` |
| 字典类型 | `/admin/sys/dicttype/{list, info/{id}, save, update, delete, select}` |
| 字典数据 | `/admin/sys/dictdata/{list, info/{id}, save, update, delete, type/{dictType}}` |
| 参数 | `/admin/sys/config/{list, info/{id}, save, update, delete}` |
| 文件 | `/admin/sys/oss/{list, upload, delete}` |
| 登录日志 | `GET /admin/sys/loginlog/list` |
| 操作日志 | `GET /admin/sys/operationlog/list` |

## 常见问题

- **登录接口 401 / 跨域**：确认 `mall-admin` 是否启动、`/admin/auth/login` 在 SecurityConfig 已放行。开发环境通过 Vite 代理，无需 CORS 配置。
- **直连 admin 正常、走网关 404**：确认 `VITE_API_TARGET=http://localhost:88`，并检查网关是否配置 `/api/admin/**` 路由、`mall-admin` 是否已注册到 Nacos。
- **请求路径多了或少了 `/api`**：默认直连 `8090` 会去掉 `/api`，走 `88` 会保留 `/api`；特殊场景可用 `VITE_API_REWRITE=false` 强制保留。
- **图标不显示**：菜单的 `icon` 字段需填写 Element Plus 图标名（如 `User`、`Setting`、`Menu`），区分大小写。
- **菜单不显示**：检查后端 `sys_menu` 表数据，以及当前用户的 `sys_user_role` / `sys_role_menu` 关联是否完整。
- **路由 404**：确认 `permission.js` 中动态路由注入逻辑是否正常执行，可在浏览器控制台查看 Vue Router 警告。
- **生产刷新页面 404**：History 模式需要服务端做 SPA 回退，Nginx 参考上方 `try_files` 配置。

## 已知限制

- 当前页面主要面向 `mall-admin`，暂未提供商品、订单、会员、营销、仓储的完整后台页面。
- 暂未配置 ESLint、Prettier、单元测试和端到端测试，提交前建议至少执行 `npm run build`。
- 生产环境如果直接配置绝对 API 地址，需要确认后端 CORS 或同源反向代理策略。
