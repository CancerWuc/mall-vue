# Mall Admin - Vue 前端

基于 **Vue 3 + Vite + Element Plus + Pinia + Vue Router + Axios** 构建的 `mall-admin` 后台管理系统前端，对接 `mall-admin` 服务端（Spring Boot 3 + Spring Security + JWT）。

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
| 框架 | Vue 3 (`<script setup>`) |
| UI | Element Plus 2 + 图标 |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 请求 | Axios + 全局拦截器 |
| 鉴权 | JWT，token 通过 `token` header 传递 |

## 目录结构

```
mall-vue/
├── public/                 静态资源
├── src/
│   ├── api/                业务接口
│   ├── assets/styles/      全局样式 / 变量
│   ├── components/         通用组件（分页等）
│   ├── directive/          自定义指令（v-permission）
│   ├── layout/             整体布局（侧边栏/顶栏/面包屑/主区）
│   ├── router/             路由
│   ├── store/              Pinia 状态
│   ├── utils/              工具（request/auth/permission）
│   ├── views/              页面
│   ├── App.vue
│   ├── main.js
│   └── permission.js       全局路由守卫
├── .env.development
├── .env.production
├── index.html
├── package.json
└── vite.config.js
```

## 环境要求

- Node.js >= 18
- 包管理器 npm / pnpm / yarn 任一

## 安装依赖

```bash
cd D:\code\java\mall-vue

# npm
npm install

# 或者 pnpm
pnpm install
```

## 启动开发

```bash
npm run dev
```

默认运行在 `http://localhost:5173`。

## 后端接口配置

**默认配置**：开发环境通过 Vite 代理 `/api -> http://localhost:8090`（即 `mall-admin` 默认端口）。

如需修改，编辑 `.env.development`：

```ini
VITE_APP_BASE_API=/api
VITE_API_TARGET=http://localhost:8090
```

如果你通过 `mall-gateway` 网关访问，将 `VITE_API_TARGET` 改为网关地址即可。

接口规约（与 `mall-admin` 保持一致）：

- 统一前缀：`/admin/...`
- 鉴权 header：`token: <jwt>`
- 标准响应：`{ code: 0, msg: "success", ...payload }`，`code !== 0` 视为失败
- 401 自动跳转登录页

## 默认账号

```
用户名：admin
密  码：admin
```

> 来自 `mall-admin\db\mysql.sql` 初始数据（BCrypt 加密）。如果你已自行修改 `sys_user` 表中的密码，请使用最新密码登录。

## 生产构建

```bash
npm run build
```

产物输出到 `dist/`，可直接由 Nginx 等静态服务托管。生产环境的 `VITE_APP_BASE_API` 在 `.env.production` 中可配置为：

```ini
VITE_APP_BASE_API=http://your-gateway-host:port
```

## 权限控制

- 路由 meta 中可配置 `perms` 标识所需权限
- 模板中通过 `v-permission="'sys:user:save'"` 控制按钮显隐
- 用户权限点来自 `/admin/auth/info` 返回的 `permissions`

## 已对接的接口清单

| 模块 | 路径 |
| --- | --- |
| 认证 | `POST /admin/auth/login`、`GET /admin/auth/info`、`POST /admin/auth/password`、`POST /admin/auth/logout` |
| 用户 | `/admin/sys/user/{list,info/{id},save,update,delete}` |
| 角色 | `/admin/sys/role/{list,info/{id},save,update,delete,select}` |
| 菜单 | `/admin/sys/menu/{list,info/{id},save,update,delete/{id},select}` |
| 字典类型 | `/admin/sys/dicttype/{list,info/{id},save,update,delete,select}` |
| 字典数据 | `/admin/sys/dictdata/{list,info/{id},save,update,delete,type/{dictType}}` |
| 参数 | `/admin/sys/config/{list,info/{id},save,update,delete}` |
| 文件 | `/admin/sys/oss/{list,upload,delete}` |
| 登录日志 | `/admin/sys/loginlog/list` |
| 操作日志 | `/admin/sys/operationlog/list` |

## 常见问题

- **登录接口 401 / 跨域**：确认 `mall-admin` 是否启动、`/admin/auth/login` 在 SecurityConfig 已放行。开发环境通过 Vite 代理，无需 CORS 配置；如直接连后端，请在后端配置 CORS。
- **图标不显示**：菜单的 `icon` 字段需填写 Element Plus 图标名（如 `User`、`Setting`、`Menu`），区分大小写。
- **菜单不显示**：检查后端 `sys_menu` 表数据，以及当前用户的 `sys_user_role / sys_role_menu` 关联。
