
## 描述

NestJs 学习 demo, 一个提供了 文件上传/下载 路由的服务.  
demo 重点关注于 单元测试 | e2e 测试 | 中间件 | 拦截器 | 文件上传 | 配置文件 等等  
单元测试相关理解: https://zhuanlan.zhihu.com/p/428558792

## 配置文件
.local.env  本地开发时的配置文件  
.test.env   进行 e2e 测试时的配置文件(e2e 测试时, 环境变量=test)

## 安装

```bash
$ npm install
```

## 启动服务

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 测试

```bash
# 单元测试
$ npm run test

# e2e 测试
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


