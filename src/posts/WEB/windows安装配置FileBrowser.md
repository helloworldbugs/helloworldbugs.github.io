---
title: "windows安装配置FileBrowser"
date: 2024-05-13
categories: ["${folder}"]
description: ""
tags: []
---

项目地址：<https://github.com/filebrowser/filebrowser>


# 基本配置


创建数据库/初始化

```
filebrowser.exe -d filebrowser.db config init
```

设置访问地址IP，写内网的实际IP地址（默认127.0.0.1）

```
filebrowser.exe -d filebrowser.db config set --address 0.0.0.0
```

设置监听端口(默认8080)

```
filebrowser.exe -d filebrowser.db config set --port 8000
```

设置中文语言环境

```
filebrowser.exe -d filebrowser.db config set --locale zh-cn
```

设置日志文件位置

```
filebrowser.exe -d filebrowser.db config set --log filebrowser.log
```

设置网盘的根目录

```
filebrowser.exe -d filebrowser.db config set --root  D:\
```

添加用户/首先添加管理员用户

```
filebrowser.exe -d filebrowser.db users add admin password --perm.admin
```

# 进阶配置

## 配置SSL证书开启https

配置证书

```
filebrowser.exe -d filebrowser.db config set --cert D:\Server\SSL\nginx\xxx.pem
```

配置密钥

```
filebrowser.exe -d filebrowser.db config set --key D:\Server\SSL\nginx\xxx.key
```


## 注册成服务开机自启动


项目地址：<https://github.com/winsw/winsw>

配置文件：
```
<service>
    <id>filebrowser</id>
    <name>filebrowser</name>
    <description>filebrowser</description>
    <executable>filebrowser</executable>
    <onfailure action="restart" delay="60 sec"/>
    <logmode>reset</logmode>
</service>
```

打开cmd，安装服务

```
winsw.exe install
```

win+r 键入 `services.msc`

找到filebrowser服务启动即可
