---
title: "msfconlose使用学习"
date: 2024-05-14
categories: ["${folder}"]
description: "1. 漏洞渗透模块（exploits）"
tags: []
---

# 常用模块

1. 漏洞渗透模块（exploits）

2. 攻击载荷模块（payload）

3. 辅助模块（auxiliary）

4. 后端渗透.模块（post）

# 常用命令
```
show #查看

search #搜寻

use #使用

show exploits #查看exploits模块
```
#模块常用命令
```
show options #查看模块参数

set [模块参数] [设置变量]    #设置模块参数变量

unset [模块参数] #重置模块参数

run #开始攻击
```
# 模块说明

漏洞名称采用三段式的标准，既：“针对的操作系统+针对的服务+模块的具体名称”组成。（例：windows/smb/ms08_067_netapi）

漏洞渗透模块威胁等级划分：excellent>great>good>normal>average>lowRank>manual （执行效果由好到差从左到右排列）
