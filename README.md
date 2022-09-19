# Loki 
一款轻量级性能测试平台前端框架。

## 概述
Loki采用了umi-react框架创建，和后端交互采用了`GraphQL`接口。

## 如何使用
可以利用Loki框架改造成适合自己的性能测试平台，这里不直接提供后端，你可以独立开发`GraphQL`接口的后端。当然也可以直接使用`GMeter`作为标准后端。

## 部署`GMeter`服务
`GMeter`由四部分组成：
* 主控服务（Host）
* 代理服务（Agent）
* 收集器（Collector）
* API服务（API）

### 主控服务
主控服务负责账户、脚本、执行、报告这些服务的具体实现。可以拉取docker（jimmyseraph/gmeter_host:latest）来运行主控服务，使用方式参考[gmeter-host]

[gmeter-host]: https://hub.docker.com/r/jimmyseraph/gmeter_host

### 代理服务
代理服务主要是运行性能测试脚本，产生负载，并将负载日志发送到指定的`kafka`消息服务上。代理服务可以部署多个实例，需要给不同的名称以区分，每一个代理服务都会向主控服务发送心跳和当前状态，以确保主控服务知道当前有哪些代理服务实例可用。当收到运行测试的请求时，主控服务会将根据请求启动代理服务运行压测脚本，实现分布式压测。

代理服务可以设置线程上限（Volume），这个值根据代理服务所在的机器配置来决定。

可以拉取docker（jimmyseraph/gmeter_agent:latest）来运行代理服务，具体使用方法参考[gmeter-agent]

[gmeter-agent]: https://hub.docker.com/r/jimmyseraph/gmeter_agent

### 收集器
收集器主要用于收集kafka服务上的性能压测日志，并根据不同的压测报告归属，将压测日志收集后存入`MongoDB`中。可以拉取docker（jimmyseraph/gmeter_collector:latest）来运行收集器，使用方法参考[gmeter-collector]

[gmeter-collector]: https://hub.docker.com/r/jimmyseraph/gmeter_collector

### API服务
API服务类似于整个服务的网关系统，将主控服务的各接口转换为对外提供的`GraphQL`标准接口，以供前端页面调用。可以拉取docker（jimmyseraph/gmeter_api:latest）来运行API服务，使用方法参考[gmeter-api]

[gmeter-api]: https://hub.docker.com/r/jimmyseraph/gmeter_api

### 创建登录帐户
Loki前端没有提供注册用户的页面，所以如果你使用`GMeter`作为后端服务，可以通过直接请求注册接口加入你想使用的账号：
```Shell
$ curl --location --request POST 'http://127.0.0.1:8080/apiv4' \
    --header 'Content-Type: application/json' \
    --data '{"query":"query SignIn(\n    $name: String, \n    $email: String, \n    $mobile: String, \n    $password: String,\n){\n    SignIn(\n        name: $name, \n        email: $email, \n        mobile: $mobile, \n        password: $password,\n    ){\n        code\n        message\n        data {\n            id\n            name\n            email\n            mobile\n            token\n        }\n    }\n}","variables":{"name":"liudao","email":"liudao@testops.vip","mobile":"13512345678","password":"a12345678"}}'
```
> 将`{"name":"liudao","email":"liudao@testops.vip","mobile":"13512345678","password":"a12345678"}}'`中的账户信息替换成你想要的即可。

## Loki本地开发环境
安装依赖：
```Shell
$ yarn install
```
启动本地开发环境：
```Shell
$ yarn start
```

## 部署生产环境
打包：
```Shell
$ yarn build
```