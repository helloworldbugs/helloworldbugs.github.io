---
title: "Shell"
date: 2024-05-14
categories: ["${folder}"]
description: ""
tags: ["linux"]
---

# RedHat/Cent

## 更新

```
yum makecache   #更新软件包源
```

```
yum -y update   #升级所有包，同时也升级软件和系统内核
```

```
yum -y upgrade  #升级所有包，不升级软件和系统内核
```

## 卸载软件

```
yum erase       # 卸载软件
```

```
rpm -e --nodeps # 卸载软件，卸载依赖
```

## 安装web

### php+mysql+httpd

```
yum install -y  httpd php-devel php-fpm php-mysql php-gd php mariadb mariadb-server
```

# Debian/Ubuntu

## 更新系统

```
apt update             #更新源
```

```
apt -y upgrade         #更新软件,不更新依赖
```

```
apt -y full-upgrade    #更新软件,同时更新依赖
```

```
apt clean              #清除无用安装包
```

更新系统一键梭哈

```
apt update && apt -y full-upgrade && apt clean
```

解决问题：（N: 无法安全地用该源进行更新，所以默认禁用该源。）

```
rm -rf /etc/apt/sources.list.d
```

## 单独升级某个软件包

```
apt install --only-upgrade <package_name>
```

## 卸载软件

```
apt remove  # 卸载
```

```
apt --purge autoremove  # 卸载软件，卸载依赖
```

```
dpkg -r     # 卸载
```

```
dpkg -P     # 彻底卸载，包括配置文件等
```



## web环境安装

### apache2+php+mysql

```
apt -y install apache2 libapache2-mod-php mysql-server php-mysql php
```

### nginx+php+mysql

```
apt -y install nginx mysql-server php-mysql php-fpm php
```



# systemctl

```
启动服务：systemctl start <service_name>
关闭服务：systemctl stop <service_name>
重启服务：systemctl restart <service_name>
显示服务的状态：systemctl status <service_name>
```
```
在开机时启用服务：systemctl enable <service_name>
在开机时禁用服务：systemctl disable <service_name>
查看开机启动的服务单元：systemctl list-unit-files
查看开机启动失败的服务列表：systemctl --failed
```
```
列出所有服务：systemctl list-units
列出所有已加载的服务单元：systemctl list-units --type=service
列出所有服务单元文件及其启用状态：systemctl list-unit-files --type=service
```



# 磁盘

```
fdisk -l                    # 查看磁盘情况
```

```
mkfs.ext4 /dev/sda1         # 以ext4格式格式化分区
```

```
lsblk                       # 查看磁盘结构
```

```
lsblk -f                    # 查看文件系统类型
```

```
df -h                       # 查看挂载情况
```

```
df -T                       # 查看文件系统类型
```

```
du -sh                      # 查看目录占用空间大小
```


## 磁盘扩容

>先进行分区扩容，再进行文件系统扩容。如果无法扩容，考虑是不是有其它分区在中间进行了截断。(`gparted`图形化分区管理工具)

### 磁盘分区扩容

```
parted /dev/sda
```

```
(parted) resizepart 1 200GB     # 扩大分区1大小为200GB
```

```
(parted) resizepart 1 100%      # 扩大分区1大小为100%
```

```
(parted) quit
```

### 文件系统扩容

```
resize2fs /dev/sda1  # 用于扩容ext2/ext3/ext4文件系统
```

```
xfs_growfs /data  # 用于扩容XFS文件系统
```

### LVM扩容

检查逻辑卷情况

```
lvdisplay /dev/centos/root
```

删除无用逻辑卷

```
lvremove pve/data
```

确认剩余空间

```
pvs
```

>如果显示的 FREE 列为空，说明没有剩余空间。


LVM 识别 /dev/sda2 上的所有剩余空间。

```
pvresize /dev/sda2
```

逻辑卷扩容

```
lvextend -l +100%FREE /dev/centos/root
```

最后进行文件系统扩容

```
resize2fs /dev/sda1  # 用于扩容ext2/ext3/ext4文件系统
```

```
xfs_growfs /data  # 用于扩容XFS文件系统
```

## 挂载

smb挂载

```
mount -t cifs //服务器IP/共享名 /mnt/smb_share -o username=用户名,password=密码,uid=1000,gid=1000,dir_mode=0766,file_mode=0666,vers=3.0
```

开机自挂载磁盘
```
vim /etc/fstab
```

```
# 挂载硬盘
/dev/sdb1 /data ext4 defaults 0 0

# smb挂载
//服务器IP/共享名 /mnt/smb cifs username=账户,password=密码,uid=1000,gid=1000,dir_mode=0766,file_mode=0666,iocharset=utf8,vers=3.0,x-systemd.requires=network-online.target 0 0
```

测试自动挂载是否成功

```
sudo mount -a
```
# 重启网卡

## `ip link`

只要是使用了较新版本内核（2.2 版本以后）的 Linux 系统，都能原生支持这个操作。`ip`命令直接通过 Netlink 协议与 Linux 内核通信，该命令属于`iproute2`工具套件，它是现代 Linux 网络管理的标准。

```
ip link set eth0 down && ip link set eth0 up
```

## `ifconfig`

在只装有旧版 net-tools 包（既 ifconfig 命令）的老机器上通用。

```
ifdown eth0 && ifup eth0
```
或
```
ifconfig eth0 down && ifconfig eth0 up
```
# 修改默认编辑器
```
update-alternatives --config editor
```
>vim.basic是完全体

>vim.tiny是阉割版

# 文件处理

 - 使用tar批量解压当前命令下的*.tar.gz后缀的文件

```
for i in $(ls *.tar.gz);do tar zxvf $i;done
```
 - 复制大文件（断点续传）
```
rsync -av --append-verify --progress /path/to/largefile user@host:/dest/path/
```

>`-a`：递归复制，包括子目录和文件。
`-v`：显示复制过程。
`--append-verify`：断点续传，并在结束后校验文件完整性。
`--progress`：显示复制进度。

 - 临时修改时间格式：（方便观察文件改动时间）

方法 1：设置环境变量（推荐简洁）
```
export TIME_STYLE=long-iso
```
方法 2：定义别名（更自定义）
```
alias ll='ls -l --time-style="+%Y/%m/%d %H:%M:%S"'
```

# sudo免密

这是最平衡、也是开发者和运维最常用的做法。你依然在普通用户下工作，但在终端执行命令或者运行需要提权的应用时，系统不再向你索要密码。

1. 在终端输入以下命令（它会使用专用的安全编辑器打开配置文件）：

```Bash
sudo visudo
```
    
2. 移动到文件末尾，添加下面这行字（把 `your_username` 替换成你的**实际用户名**）：
    
```Plaintext
your_username ALL=(ALL) NOPASSWD: ALL
```

1. 保存并退出（如果是 `nano` 编辑器，按 `Ctrl+O` 回车保存，`Ctrl+X` 退出）。
    

**效果：** 之后你在终端执行 `sudo 命令`，或者部分调用 sudo 的图形程序，都不会再弹窗问你密码了。

# shell脚本换行符报错

**现象**

shell脚本执行报错：`$'\r': command not found`

**原因**

可能是在 Windows 上写的这个脚本，或者从 Windows 系统复制过来的（例如用记事本编辑过），导致行尾多了 `\r`。

Bash 在解析时把 `\r` 当成命令的一部分，就出现了 `$'\r': command not found` 这样的提示。

**解决办法**

在 Linux 里执行以下命令去掉行尾的 `\r`：

```bash
sed -i 's/\r$//' <脚本文件名>
```

# 解除root用户登录ssh限制
```
sed -i 's/^#\?\s*PermitRootLogin\s\+.*/PermitRootLogin yes/' /etc/ssh/sshd_config || sed -i -E 's/^\s*#?\s*PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config
```
# cpu性能模式配置

安装`cpufrequtils`

```text-plain
apt install cpufrequtils
```

查看当前cpu的运行频率

```text-plain
cpufreq-info

cpufreq-info | grep "current CPU frequency"
```

切换到性能模式

```text-plain
cpufreq-set -r -g performance
```

#### cpu性能模式介绍

1.  **performance** ：性能模式会将 CPU 频率保持在最高可用频率，以提供最佳的性能。这是在需要最大处理能力时选择的模式。可以触发睿频。
    
2.  **powersave** ：节能模式会将 CPU 频率降低到最低，以节省电力。这在系统需要长时间运行而且对性能要求不高时是一个不错的选择。
    
3.  **ondemand** ：按需模式会根据系统负载动态调整 CPU 频率。当负载较低时，CPU 频率会降低以节省电力，而在负载增加时会提高频率以提供更好的响应性能。但是不会触发睿频。
    
4.  **conservative** ：保守模式类似于按需模式，但是频率调整更加平滑。它会尽量避免频繁地变更频率，以减少对性能的影响。
    

列出当前策略模式

```text-plain
cpufreq-info | grep "governor"
```


# 代理

## 临时代理（仅当前shell下生效）

开启代理

http协议

```
export http_proxy=http://10.0.0.100:10808
export https_proxy=http://10.0.0.100:10808
```

socks协议

```
export http_proxy=socks5://10.0.0.100:10808
export https_proxy=socks5://10.0.0.100:10808
```

取消代理

```
unset http_proxy
unset https_proxy
```

## 配置永久代理

```
vi /etc/profile
```

```
export http_proxy=http://ip:port

export https_proxy=http://ip:port

export https_proxy=socks5://ip:port
```

```
source /etc/profile
```
