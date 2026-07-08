---
title: "OpenWRT 扩容"
date: 2025-07-08
description: "建议安装磁盘管理工具插件 luci-app-diskman 进行分区，安装好后访问位置在：左侧导航栏->系统->磁盘管理/挂载点。磁盘管理和挂载都更直观方便。"
tags: []
categories: ["${folder}"]
---

## 安装必要软件
```
opkg update && opkg install kmod-usb-core kmod-usb-uhci kmod-usb-storage kmod-usb2 kmod-usb-ohci block-mount mount-utils kmod-fs-ext4 e2fsprogs fdisk lsblk
```

## U盘分区

建议安装磁盘管理工具插件 [luci-app-diskman](https://github.com/lisaac/luci-app-diskman/releases) 进行分区，安装好后访问位置在：左侧导航栏->系统->磁盘管理/挂载点。磁盘管理和挂载都更直观方便。

也可以使用fdisk命令分区

## 根目录完整拷贝到U盘

以下假设 `/dev/sda1` 为 U 盘上要作为根目录的分区

1. 创建下面 U 盘分区要挂载的目录
```
mkdir /mnt/udisk
```
2. 将 U 盘中要作为根目录分区挂载到 /mnt/udisk
```
mount /dev/sda1 /mnt/udisk
```
3. 创建一个临时目录，用于拷贝根目录文件
```
mkdir /tmp/root
```
4. 将当前根目录以 bind 的方式挂载到临时目录，此时临时目录里可以看到和根目录一样的文件
```
mount --bind / /tmp/root
```
5. 将临时目录的内容打包并解压到 /mnt/disk，tar 用于保留文件的属性信息
```
tar -C /tmp/root -cvf - . | tar -C /mnt/udisk -xvf -
```
6. 将所有缓存写入 ROM
```
sync
```
7. 取消挂载
```
umount /tmp/root
```

## swapon交换分区扩容

假设设置为 Swap 的分区为 `/dev/sda2`，执行以下命令：

1. 将 `/dev/sda2` 设置为 Swap
```
mkswap /dev/sda2
```
2. 启用 `/dev/sda2`分区
```
swapon /dev/sda2
```

## 设置自动挂载

>如果安装了 `luci-app-diskman` 插件，建议用：左侧导航栏->系统->挂载点，这个位置可以进行图形化挂载管理，更直观方便。

1. 系统自动检测并更新分区情况到配置文件
```
block detect > /etc/config/fstab
```

2. 编辑配置文件 `/etc/config/fstab`，编辑后的内容大致如下:
```
config global
    option auto_swap '1'
    option auto_mount '1'
    option delay_root '5'
    option check_fs '0'
    option anon_swap '1'
    option anon_mount '1'

config mount
    option target '/'
    option uuid '0000-0000'
    option enabled '1'

config swap
    option device '/dev/sda2'
    option enabled '1'
```

> - 第一部分的 `global` 不需要修改。
> - 第二个部分的 `mount` 中，`target` 改为 `/`，即挂载到根目录；uuid 为 U 盘分区的标识符。如果不确定哪个 uuid 是对应刚才的分区，可以执行 `block info` 查看。
> - 第三部分 `swap` 中，`device` 改为对应 u 盘的交换分区。swap 无法通过 UUID 挂载，它只有 PARTUUID。只能通过盘号挂载。

>如果交换分区开机自启用失败，建议可以在开机自启动配置文件 `/etc/rc.local` 添加：`swapon /dev/sda2` 解决。

3. 执行 `reboot` 重启

## 取消 `/var` 指向临时分区

执行：`ls -l /` 查看 `/var` 是否指向临时文件系统。如果看到：`var -> tmp` ，就表示重启路由后，你对 `/var` 里文件的修改会丢失。比如应用的日志。

执行以下命令：

1. 删除指向临时文件系统的符号链接
```
rm /var
```
2. 创建一个真正的目录
```
mkdir /var
```
3. 将临时文件系统中的文件复制到新创建的目录中
```
cp -r /tmp/* /var/
```
4. 重启
```
reboot
```

> 注意：如果 /var 指向 tmp，可能会导致 supervisor 无法正确启动。因为涉及到 /var/run/ 文件夹。所以必须重启。


参考原文：[OpenWRT 扩展容量](https://schaepher.github.io/2019/10/19/openwrt-expand-storage/)
