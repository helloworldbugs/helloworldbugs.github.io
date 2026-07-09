---
title: "AOSP"
date: 2024-05-14
categories: ["${folder}"]
description: "（此方法适用于virtualAB分区）"
tags: []
---

# adb刷入recovery教程
（此方法适用于virtualAB分区）

在adb工具文件夹内打开cmd命令行窗口

1. 检测连接:

```
fastboot devices
```
出现：”xxxxx(序列号) fastboot”字样表示手机连接成功

2. 查看当前ab分区

```
fastboot getvar current-slot
```

3. 手动切换到另一个分区：

```
fastboot set_active <target_slot> #<target_slot>可以是a或者b
```

4. 刷入recovery镜像: //将“xxx.img”替换为要刷入的recovery文件镜像路径

```
fastboot flash recovery "xxx.img" #自动刷入当前分区
fastboot flash recovery_a "xxx.img" #手动刷入a分区
fastboot flash recovery_b "xxx.img" #手动刷入b分区
命令行末尾显示 finished 字样，即表示刷入recovery成功
```

5. 重启手机

```
fastboot reboot
fastboot reboot-recovery
```

# pc设置adb驱动问题

参考晨钟酱：
[玩机必看！超详细的ADB设备连接 & 驱动安装教程](https://www.bilibili.com/read/cv16541940/)

# 杂项

adb命令跳过谷歌验证

```
dd if=/dev/zero of=/dev/block/bootdevice/by-name/frp
```

关闭安装检验，提高app安装速度：（shell命令）

```
su -c settings put global verifier_verify_adb_installs 0
```

miui禁用低电量提醒弹窗：（shell命令）

```
settings put system low_battery_dialog_disabled 1
```

关闭低电量提示音：（shell命令）

```
settings delete global low_battery_sound
```

开机动画目录

```
/system/product/media/
```

音效文件目录

```
摄像头声：/system/media/audio/ui/
```

```
音效：/system/product/media/audio/ui/
```
