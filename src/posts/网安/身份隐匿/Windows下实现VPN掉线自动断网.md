---
title: "Windows下实现VPN掉线自动断网"
date: 2024-05-14
categories: ["${folder}"]
description: ""
tags: ["隐藏"]
---

# 掉线问题

在渗透测试过程中，一般VPN代理来进行渗透，但是如果VPN突然掉线了，那么就很可能使用我们的真实IP就暴露了。如何保证一旦VPN掉线就自动断网？

核心思路是通过Windows防火墙的出站规则限制上网，需要打开windows自带的防火墙

# Windows自带VPN

1. 设置防火墙默认允许所有入站，阻止所有出站

```
netsh advfirewall set allprofiles firewallpolicy allowinbound,blockoutbound
```

2. 添加出站规则，允许8.8.8.8，也就是允许出站VPN服务器

```
netsh advfirewall firewall add rule name="allowvpn1" dir=out action=allow enable=yes remoteip="8.8.8.8"
```

3. 添加出站规则，允许接口类型为远程访问，也就是允许通过VPN接口出站

```
netsh advfirewall firewall add rule name="allowvpnremote1" dir=out action=allow enable=yes interfacetype=ras
```

# 第三方VPN客户端的问题

经测试其能解决使用Windows自带VPN连接后的掉线，但第三方VPN客户端的情况，会导致不管连接不连接VPN都断网。

重点就是第三条，Windows防火墙对远程访问的接口类型解释为：

>远程访问: 此规则只适用于通过已在计算机上配置的远程访问 [例如虚拟专用网络 (VPN) 连接或拨号连接] 发送的通信。

而第三方VPN客户端一般都是安装一个虚拟网卡，我猜测就是因为虚拟网卡的接口类型并非远程访问类型，导致彻底断网。

## 解决办法

假设VPN服务器地址为`8.8.8.8`,连接后分配地址为`192.168.30.0/24`段

使用以下命令即可实现VPN掉线自动断网，区别只有最后一行。

由于无法通过接口类型判断，所以通过VPN网卡的本地地址判断是否能出网。

```
netsh advfirewall set allprofiles firewallpolicy allowinbound,blockoutbound
netsh advfirewall firewall add rule name="allowvpn1" dir=out action=allow enable=yes remoteip="8.8.8.8"
netsh advfirewall firewall add rule name="allowvpnremote1" dir=out action=allow enable=yes localip="192.168.30.0/24"
```
## 恢复命令
```
netsh advfirewall set allprofiles firewallpolicy allowinbound,allowoutbound
netsh advfirewall firewall delete rule name="allowvpn1"
netsh advfirewall firewall delete rule name="allowvpnremote1"
```

# bat脚本

为了方便，也可以写成一个bat脚本，这样每次运行一遍就好了，不用每次都输入几句命令

# vpn防掉

```
@echo off
chcp 65001 >nul

REM vpn服务器ip
set remote_ip=xx.xx.xx.xx

REM 通过vpn获取的本机客户端ip段
set local_ip=10.8.0.0/24


:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在请求管理员权限...
    powershell -Command "Start-Process '%~s0' -Verb RunAs"
    exit /b
)

REM 开启所有网络配置文件的防火墙
netsh advfirewall set allprofiles state on
REM 修改防火墙出入站默认配置
netsh advfirewall set allprofiles firewallpolicy allowinbound,blockoutbound
netsh advfirewall firewall add rule name="allowvpn1" dir=out action=allow enable=yes remoteip=%remote_ip%
netsh advfirewall firewall add rule name="allowvpnremote1" dir=out action=allow enable=yes localip=%local_ip%

REM 检查返回代码
if %ERRORLEVEL% equ 0 (
    echo 防火墙配置vpn防掉成功，2秒后自动关闭当前窗口
    timeout /t 2 >nul
) else (
    echo 命令执行失败
    pause
)
exit
```

## vpn防掉恢复

```
@echo off
chcp 65001 >nul

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在请求管理员权限...
    powershell -Command "Start-Process '%~s0' -Verb RunAs"
    exit /b
)

netsh advfirewall set allprofiles firewallpolicy allowinbound,allowoutbound
netsh advfirewall firewall delete rule name="allowvpn1"
netsh advfirewall firewall delete rule name="allowvpnremote1"

REM 关闭所有网络配置文件的防火墙（可按需注释）
netsh advfirewall set allprofiles state off

REM 检查返回代码
if %ERRORLEVEL% equ 0 (
    echo 命令执行成功，2秒后自动关闭当前窗口
    timeout /t 2 >nul
) else (
    echo 命令执行失败
    pause
)
exit
```
