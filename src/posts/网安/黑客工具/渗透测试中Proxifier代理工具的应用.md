---
title: "渗透测试中Proxifier代理工具的应用"
date: 2024-05-17
description: "本文我们需要用到一个工具：Proxifier，有不少师傅应该听过它的大名。"
tags: ["代理"]
---

# Proxifier介绍

本文我们需要用到一个工具：Proxifier，有不少师傅应该听过它的大名。
Proxifier 是一款代理客户端软件，可以让不支持代理服务器工作的程序变的可行。支持各种操作系统和各代理协议，它的运行模式可以指定端口，指定程序的特点。

Proxifier 的主要用途是在系统级别通过代理服务器强制 Web 请求，从而使来自不支持代理的应用程序的请求通过代理访问其预期网站。

# 基础配置

配置其他的之前，要新增一个代理规则`127.0.0.1; ::1`，动作配置为`Direct`，也就是直连，如下：

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image.png)

>说明：
`::1`是IPv6中的环回地址，将其视为`127.0.0.1`的IPv6版本
有些进程在本地通讯中会用到这个玩意，必须先让它直连，如果它走代理的话对应的进程会出问题的

由此，这条规则在代理列表里面要处于最高（优先进行），通过右边的按钮，将这条规则调整到第一行（优先执行），如下：

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image-1.png)

# 通过Proxifier将VM虚拟机代理

很多时候，作为攻击队，我们都需要在纯净的武器库虚拟机中完成自己的渗透（因为蜜罐会尝试获取浏览器Cookie和本地文件，用自己的实体机很快就能被溯源），如何直接让所有的虚拟机都走上代理呢？

注：本文这个方法，无视任何类型的系统类型和对应配置，只要配置VM网卡出网即可被代理

应用程序填写如下：
```
vmware.exe; vmnetcfg.exe; vmnat.exe; vmrun.exe; vmware-vmx.exe; mkssandbox.exe; vmware-hostd.exe; vmnat.exe; vmnetdhcp.exe
```
如下配置：

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image-2.png)


这样通过VMware进行渗透的时候就可以走我们设置好的代理了

## VM虚拟机17以上版本-特别补充

挺多师傅反馈VMware 17以上版本无法将流量代理出来，这时候需要特殊配置

配置方法如下：

在Proxifier的“配置文件”的“高级”处，选择“服务与其他用户”，然后勾选上两个选项就可以解决VMware 17以上的版本无法代理的问题

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image-4.png)

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image-5.png)


# 通过Proxifier进行小程序抓包

很多时候，作为攻击队，我们还需要关注目标的小程序和公众号作为突破口，如何对小程序抓包呢？通过 Proxifier 还能对PC的微信小程序进行抓包

应用程序填写如下：
```
WeChatApp.exe;WechatBrowser.exe;WeChatAppEx.exe
```
如下配置：

![](/images/posts/%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95%E4%B8%ADProxifier%E4%BB%A3%E7%90%86%E5%B7%A5%E5%85%B7%E7%9A%84%E5%BA%94%E7%94%A8/image-3.png)


然后再把抓到的包通过socks5转发到burp上，就可以通过burp对小程序进行渗透了。


参考链接：<https://blog.zgsec.cn/archives/278.html>
