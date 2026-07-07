---
title: "开启nvidia的rtx视频增强"
date: 2024-10-14
description: "1. 首先更新到最新的nvidia驱动"
tags: []
---

>RTX显卡由于具有特殊的硬件单元，可以通过将低分辨率画面转化为高分辨率画面。在游戏上老黄给了DLSS（Deep Learning Super Sampling，深度学习超级采样）技术。DLSS实际上就是将低分辨率的游戏画面变成高分辨率的画面，这样可以实现低分辨率的高帧率和高分辨率的高画质。AMD的FSR和Intel的XeSS的目的都是差不多的。

>那么如果将DLSS类似的技术放到低分辨率视频上面呢？这就催生了NVIDIA显卡专属的RTX视频增强技术了

# 浏览器开启nvidia RTX视频增强

1. 首先更新到最新的nvidia驱动
2. 打开nvidia控制面板：视频->调整视频图像设置，勾上rtx视频增强，质量建议选择自动。如下图所示
![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image.png)
3. 更新chrome或者edge到最新版本，随便打开一个在线网页视频，或者将本地视频文件拖到浏览器打开，只要视频分辨率小于你当前的显示器分辨率，都可以享受到rtx视频增强技术了

# 本地播放器开启nvidia RTX视频增强

>目前常见的支持nvidia RTX视频增强的本地视频播放器，推荐[Potplayer](https://potplayer.daum.net)和[MPC-BE](https://github.com/Aleksoid1978/MPC-BE)

## Potplayer

1. 将NVIDIA驱动更新到 531.18 WHQL 版本，并在NVIDIA控制面板中“视频 - 调整视频图像设置 - RTX视频增强”打开超分辨率。

2. 打开PotPlayer“选项 - 视频”，勾选“D3D11 GPU 超分辨率”，若无法勾选，先勾选视频缓冲格式后面的“10位输出”。。

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-2.png)

可参考链接：[PotPlayer超分辨率(VSR)功能 让低画质视频更高清](http://www.potplayercn.com/course/video-super-resolution.html)

## MPC-BE

1. 先下载GitHub项目[VideoRenderer](https://github.com/emoose/VideoRenderer)渲染器，解压到本地

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-3.png)

1. 先运行运行`Reset_Settings.cmd`初始化
   
2. 然后运行`EnableVideoSuperRes.reg`文件改注册表
   
3. 最后再运行`Install_MPCVR_64.cmd`安装渲染器

>***注意：安装成功后，文件不能删除和更改位置，否则会失效***

4. 打开MPC-BE播放器，选项，切换到视频菜单栏，视频渲染器选择`MPC 渲染器`。

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-6.png)

5. 点击右边的属性

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-7.png)

6. 把这两个打开就可以了

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-8.png)



# 验证启用/活动状态

有的小伙伴发现开了好像和没开没啥区别，那么如何验证是否成功开启了rtx视频增强呢？

只要观察nvidia控制面板上的状态这里，就可以显示当前的活动状态，以及级别。如下图所示

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-1.png)

打开任务管理器观察gpu的占用，你会发现开和没开是有明显的变动的，这得根据显卡的性能决定，性能越强的显卡占用越小，像我的3060ti开到最高（质量4）大概只占用个6%左右

没开前

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-4.png)

开启后

![](/images/posts/%E5%BC%80%E5%90%AFnvidia%E7%9A%84rtx%E8%A7%86%E9%A2%91%E5%A2%9E%E5%BC%BA/image-9.png)
