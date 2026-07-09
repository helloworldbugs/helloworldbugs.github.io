---
title: "kali安装OpenVAS"
date: 2024-05-14
categories: ["${folder}"]
description: ""
tags: []
---

安装
```
apt update
apt install gvm -y   #安装gvm
gvm-setup       #初始化gvm(需要下载漏洞库，时间比较长)
gvm-check-setup    #检查openvas 是否安装成功
```
如果检测失败按照提示执行修复命令就可以了

gvm的redis不是开机启动的可以设置成开机启动
```
systemctl enable redis-server@openvas.service
```
升级命令
```
gvm-feed-update    #升级漏洞库(新安装的gvm漏洞库是最新的)
gvm-start       #启动openvas
```
#修改admin密码为password， 不修改密码就查看安装过程中的初始化密码登录
```
runuser -u _gvm -- gvmd --user=admin --new-password=password
```
也可以增加新用户

#admin填入你想要创建的用户，最后的password填你要设置的密码
```
runuser -u _gvm -- gvmd --create-user=admin --new-password=password
```
开启远程访问

#将127.0.0.1改成0.0.0.0
```
vim /lib/systemd/system/greenbone-security-assistant.service
```
查看日志
```
tail -f /var/log/gvm/gvmd.log
```
访问地址：<https://localhost:9392>
