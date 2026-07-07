---
title: "linux配置开机自启动"
date: 2024-05-14
categories: ["系统", "linux"]
description: "打开 rc-local.service 脚本内容，内容如下"
tags: []
---

# rc.local配置自启动

打开 `rc-local.service` 脚本内容，内容如下

```
vim /lib/systemd/system/rc-local.service
```

![alt text](/assets/images/posts/系统/linux/linux配置开机自启动/image.png)

一般正常的启动文件主要分成三部分

 - [Unit] 段: 启动顺序与依赖关系

 - [Service] 段: 启动行为,如何启动，启动类型

 - [Install] 段: 定义如何安装这个配置文件，即怎样做到开机启动

可以看出，`/etc/rc.local` 的启动顺序是在网络后面，一般默认是没有 `Install` 段，也就没有定义如何做到开机启动，所以显然这样配置是无效的。 因此我们就需要在后面帮他加上 `[Install]` 段:

```
[Install]
WantedBy=multi-user.target
Alias=rc-local.service
```

>PS：添加了`[Install]`内容后，下面两行的`WantedBy`和`Alias`两个英文跟上面的都是绿色的，要是绿色才有用。

一般需要先修改`rc-local.service`的权限才可以进行编辑。我是直接root没有这个限制

系统中新建`/etc/rc.local`这个文件，默认是没有的

```
touch /etc/rc.local
```

给`rc.local`加上权限

```
sudo chmod +x /etc/rc.local
```

做完这一步，还需要最后一步 前面我们说 `systemd` 默认读取 `/etc/systemd/system` 下的配置文件, 所以还需要在 `/etc/systemd/system` 目录下创建软链接

```
ln -s /lib/systemd/system/rc-local.service /etc/systemd/system/
```

最后，打开`rc.local`，在第一行添加`#!/bin/sh`，最后一行添加`exit 0`。然后要执行的命令就写在中间。

>如果在 `/etc/rc.local` 中添加的是 `./test.sh` 这种脚本类型的，要在末尾加上`&`， 不然重启的时候会卡在启动界面进不去系统


# 将程序注册为服务并配置自启动

新建配置文件

```
vim /etc/systemd/system/frpc.service
```

键入以下配置
```
[Unit]
# 服务描述
Description=frpc

# 确保网络就绪后启动（可添加其他依赖如 mysql.target）
After=network-online.target syslog.target
Wants=network-online.target

[Service]
# 服务进程类型（simple/forking/oneshot等，simple为默认值）
Type=simple

# 工作目录（可选，影响相对路径解析）
WorkingDirectory=/opt/frp/

# 核心执行命令：必须使用绝对路径
ExecStart=/opt/frp/frpc -c /opt/frp/frpc.toml

# 重启策略：on-failure（非正常退出时重启）或always（任何退出都重启）
Restart=on-failure

# 重启间隔时间（避免频繁重启）
RestartSec=5s

[Install]
# 随系统多用户级别启动
WantedBy=multi-user.target
```

赋予权限
```
sudo chmod 644 /etc/systemd/system/frpc.service
```
重新加载配置文件
```
sudo systemctl daemon-reload
```
配置开机自启动
```
sudo systemctl enable frpc.service
```


# 在/etc/init.d目录下添加自启动脚本

直接写一个sh脚本，丢到`/etc/init.d`目录下

添加软链接

```
sudo ln -s /etc/init.d/script /etc/rc2.d/S99script
```

>/etc/rc.d/rc0.d/～/etc/rc.d/rc6.d/文件夹的含义不同，S开头代表是开启时处理的脚本，按照后面紧跟的数字进行按顺序启动，S99则是最后进行启动。

`rc#.d`的不同目录代表的运行级定义如下:

```
0：系统停机状态，系统默认运行级别不能设为0，否则不能正常启动
1：单用户工作状态，root权限，用于系统维护，禁止远程登陆
2：多用户状态(没有NFS)
3：完全的多用户状态(有NFS)，登陆后进入控制台命令行模式
4：系统未使用，保留
5：X11控制台，登陆后进入图形GUI模式
6：系统正常关闭并重启，默认运行级别不能设为6，否则不能正常启动
```

在这些目录之下，包含了许多对进程进行控制的脚本。这些脚本要么以 `K##` 开头，要么以 `S##` 开头：

```
K：kill，系统将终止对应的服务
S：start，系统将启动对应的服务
##：同一运行级别下脚本执行的顺序，数值小的先执行，数值大的后执行。很多时候这些执行顺序是很重要的，比如要启动Apache服务，就必须先配置网络接口。
```
