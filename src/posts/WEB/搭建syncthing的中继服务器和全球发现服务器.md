---
title: "搭建syncthing的中继服务器和全球发现服务器"
date: 2024-05-14
description: "1. 下载：https://github.com/syncthing/discosrv/releases"
tags: []
---

# 搭建发现服务器

1. 下载：https://github.com/syncthing/discosrv/releases

2. 将压缩包上传到服务器解压

3. 进入文件夹内，后台运行

```
nohup ./stdiscosrv > /var/log/stdiscosrv.log 2>&1 &
```
        
默认`8443`端口，若需要更改端口，添加参数`--listen=":8443"`


## 防火墙配置

```
iptables -I INPUT -p udp --dport 8443 -j ACCEPT
iptables -I INPUT -p tcp --dport 8443 -j ACCEPT
```

>备注：若要关闭防火墙，把ACCEPT改为DROP

为了确保发现服务器能够正常工作，建议开放TCP和UDP两个协议的端口。

# 搭建中继服务器

1. 下载：https://github.com/syncthing/relaysrv/releases

2. 上传到服务器解压

3. 进入文件夹内，后台运行

```
nohup ./strelaysrv --pools="" > /var/log/strelaysrv.log 2>&1 &
```

可选择参数:`--pools=""` 表示将中继服务器设为私有。也可以选择不加这个参数，就会将您的中继服务器共享出去作为公共服务器做贡献，让其他使用syncthing的人也可以通过您的服务器中转流量进行文件同步


## 防火墙配置

```
iptables -I INPUT -p tcp --dport 22067 -j ACCEPT
iptables -I INPUT -p tcp --dport 22070 -j ACCEPT
```

>备注：若要关闭防火墙，把ACCEPT改为DROP


 - 22067/TCP端口：作用：用于客户端和中继服务器之间的通信。这是客户端连接到中继服务器的默认端口，使用的是 TCP 协议。必须开启的端口： 因为这是客户端连接中继服务的必要端口。

 - 22070/TCP端口：作用：用于中继服务器之间的状态报告和管理通信（例如统计数据收集）。使用的 TCP 协议。可选开启的端口：如果你希望中继服务器能够上报状态或被外部管理，则需要开启此端口。



# 配置到客户端

## 发现服务器

1. 进入stdiscosrv文件夹

2. 查看日志，获取服务器id

```
cat /var/log/stdiscosrv.log
```

![alt text](/assets/images/posts/WEB/搭建syncthing的中继服务器和全球发现服务器/image-3.png)

3. 配置到客户端

```
default, https://你的ip或域名:8443/?id=服务器ID
```

        

## 中继服务器

1. 进入strelaysrv文件夹

2. 查看日志，获取uri

```
cat /var/log/strelaysrv.log
```

![alt text](/assets/images/posts/WEB/搭建syncthing的中继服务器和全球发现服务器/image-1.png)

3. 看到`relay:`开头那一行就是uri,如上图所示，直接复制下来，把`0.0.0.0`改成自己的ip或域名

4. 配置到客户端

```
default, relay://10.0.0.120:22067/?id=xxxx
```

## 配置方法

打开客户端web页面，一般是<localhost:8384>

位置在右上角：操作->设置->连接

![alt text](/assets/images/posts/WEB/搭建syncthing的中继服务器和全球发现服务器/image-2.png)

参数`default`表示使用公共的服务器。如果不想用公共的服务器，则可以把`default`参数去掉

最后记得配置开机自启动

# 数据配置存储位置

若要进行数据迁移，记得备份以下目录

 - 若服务以当前用户身份运行，数据通常存储在：`%LOCALAPPDATA%\Syncthing`（对应完整路径如：`C:\Users\[用户名]\AppData\Local\Syncthing`） 

 - 若服务以系统账户（如LocalService或NetworkService）运行，路径为： `C:\Windows\System32\config\systemprofile\AppData\Local\Syncthing`

若需要重置数据库文件，可以删除数据存储目录下的`.db`后缀的文件夹目录，然后重启服务。
