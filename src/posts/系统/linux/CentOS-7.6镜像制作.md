---
title: "CentOS 7.6镜像制作"
date: 2024-05-14
description: ""
tags: ["iso"]
categories: ["${folder}"]
---

# 问题：

用U盘安装CentOS，运行到 `alua： not attached`就停止了

# 原因：

没有识别到引导介质

# 解决办法：

1. 将刻录好的U盘重名为`CENTOS`

2. 编辑 `\EFI\BOOT\grub.cfg`

将文件中的 `hd:LABEL=CentOS\x207\x20x86_64` 统一更改为 `hd:LABEL=CENTOS`

3. 编辑 `\isolinux\syslinux.cfg`

将文件中的 `hd:LABEL=RHEL-7.4\x20Server.x86_64` 统一更改为 `hd:LABEL=CENTOS`
