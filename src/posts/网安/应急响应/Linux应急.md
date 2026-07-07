---
title: "Linux应急"
date: 2024-05-14
categories: ["网安", "应急响应"]
description: "更多可参考：<https://blog.csdn.net/yingchaoyuan/article/details/109199868>"
tags: ["应急响应"]
---

# 异常进程、端口排查

```
查看当前进程：top -c （参数-c能显示完整的启动命令行）
查看进程的线程：top -Hp <进程pid>
查找占用cpu最多的进程，相关命令：运行top命令后，键入大写字母P按cpu排序
查找占用内存最多的进程，相关命令：运行top命令后，键入大写字母M按内存排序
查看显卡占用情况：nvidia-smi
查看静态进程：ps -ef (System V 风格，可以看到父进程ppid)
查看静态进程：ps -aux (BSD 风格,可以看到资源利用率)
查看进程的可执行程序：ls -l /proc/PID/exe
查看进程打开的文件：lsof -p PID
查看进程的启动时间点：ps -p PID -o lstart
查看进程启动时间以及关联的子进程：systemctl status PID
查看端口对应的进程：lsof -i:PORT
查看进程sshd打开的文件：lsof -c sshd
查看pid号进程打开过的文件：lsof -p <PID>
查看删除但未释放的文件（常用于排查隐蔽的恶意程序）：lsof +L1
跟踪异常进程运行情况：strace -tt -T -e trace=all -p PID
检查进程挂载：cat /proc/mounts 或 cat /proc/$$/mountinfo
```

更多可参考：<https://blog.csdn.net/yingchao_yuan/article/details/109199868>

# 命令排查
```
查看当前用户历史命令：history
查看root用户历史命令：cat /root/.bash_history
查看某用户历史命令：cat /home/<用户>/.bash_history
使history命令显示时间戳：export HISTTIMEFORMAT='%F %T '
```


# 网络排查

```
查看外连地址及相关进程：netstat -antlp
```

# 定时任务排查

```
crontab -l （/var/spool/cron/ 目录下的都要检查）
查看用户定时任务：crontab -l -u 用户名
查看隐藏的定时任务：cat -A /var/spool/cron/root
查看定时任务日志：more /var/log/cron log
查看定时任务执行记录：tail -f /var/log/cron
```

# 异常文件排查

临时修改时间格式为 YYYY:MM:DD HH:MM:SS 格式：（方便观察文件改动时间）

方法 1：设置环境变量（推荐简洁）
```
export TIME_STYLE=long-iso
```
方法 2：定义别名（更自定义）
```
alias ll='ls -l --time-style="+%Y/%m/%d %H:%M:%S"'
```
```
注意使用ls -al以及判断库文件劫持、别名
注意文件：执行文件、json文件
目录着重看绿色的可执行文件：/etc、/tmp、/、/usr、/root、/boot、/bin、/usr/bin、/sbin
保存历史命令：cat .bash_history >> history.txt
查看etc目录最近7天内被修改的文件：find /etc -mtime 7 -print
查看/www目录指定时间范围内新增的文件：find /www -type f -newermt '2023-06-25 00:00' -a -not -newermt '2023-06-26 23:59'
查看/etc目录修改时间小于7天的配置文件：find /etc -iname "*conf*" -mtime -7 -print
查找cron文件中是否存在恶意脚本：
/var/spool/cron/*、/etc/crontab、/etc/cron.d/*、/etc/cron.daily/*、/etc/cron.hourly/* 、/etc/cron.monthly/*、/etc/cron.weekly/、/etc/anacrontab、/var/spool/anacron/*
查看私钥文件：cat /root/.ssh/authorized_keys
查看文件创建修改时间：stat 文件
查找文件：find / -name "localhost_access_log*"
查看文件隐藏属性：lsattr 文件
修改文件隐藏属性：chattr -/+ 属性 文件
输出文件md5：md5sum 文件
检查hosts文件：cat /etc/hosts
os文件分析：strings os文件
查找包含关键字符的普通文件（排除目录、设备文件等特殊文件类型）：find / -type f -exec grep -l "10.16.5.134" {} + 2>/dev/null
```

# 账号安全排查

**注意：ubuntu高版本将secure日志目录改成了auth**

```
查找特权用户：awk -F ":" '$3==0{print $1}' /etc/passwd
查找可以远程登录的账号信息：awk '/\$1|\$6/{print $1}' /etc/shadow
查找sudo权限账户：cat /etc/sudoers | grep -v "^#\|^$" | grep "ALL=(ALL)" a
查找空口令账户：awk -F: '($2=="!!") {print $1}' /etc/shadow
查看登录成功日志：more /var/log/secure* | grep "Accepted password"
查看登录失败日志：more /var/log/secure* | grep "Failed password"
查看本机登录情况：more /var/log/secure* | grep -E "sshd:session.*session opened"
查看新增用户：more /var/log/secure* | grep "new user"
查看所有用户最后一次登录的时间：lastlog
记录当前正在登录系统的用户信息,uptime记录系统启动时间(/var/run/utmp)：w
查看所有用户的登录注销信息及系统的启动、重启及关机事件(/var/log/wtmp)：last
记录失败的登录尝试信息(/var/log/btmp):lastb
所有用户登录日志：last | grep pts | grep -vw :0
查看登录成功的日期、用户名及ip：grep "Accepted " /var/log/secure* | awk '{print $1,$2,$3,$9,$11}'
查看试图爆破主机的ip：grep refused /var/log/secure* | awk {'print $9'} | sort | uniq -c |sort -nr | more grep "Failed password" /var/log/secure* | grep -E -o "(([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}))" | uniq -c
查看有哪些ip在爆破主机的root账号：grep "Failed password for root" /var/log/secure | awk '{print $11}' | sort
查看爆破用户名字典：grep "Failed password" /var/log/secure | awk {'print $9'} | sort | uniq -c | sort -nr
```
# 日志排查

```
日志默认存放位置：/var/log/
安全日志：/var/log/secure
认证日志：/var/log/auth
定时任务日志：/var/log/cron
软件安装卸载日志： /var/log/yum.log
邮件相关：/var/log/maillog
日志配置情况：more /etc/rsyslog.conf
传输文件：more /var/log/message* | grep "ZMODEM:.*BPS"
定时任务日志：more /var/log/cron*
定时执行脚本：more /var/log/cron* | grep -E "\.py$|\.sh$|\.pl$"
下载软件情况：more /var/log/yum* | grep Installed
卸载软件情况：more /var/log/yum* | grep Erased
可疑工具：more /var/log/yum* | awk -F: '{print $NF}' | awk -F '[-]' '{print $1}' | sort | uniq | grep -E "(^nc|sqlmap|nmap|beef|nikto|john|ettercap|backdoor|msfcosole)"
Nginx日志文件：access.log
joumalctl日志
journal默认配置文件路径：/etc/systemd/journald.conf
日志从旧到新显示：journalctl
日志从新到旧显示：journalctl -r
查看进程：journalctl _PID=$pid
journalctl的语法使用跟默认日志的使用一致，如journalctl | grep "Accepted password"
```

# 命令排查

```
查看历史命令执行记录：history（ 普通账户的历史命令，/home各账号目录下的.bash_history）
按时间排序，确认最近是否有命令被替换，可以结合rpm -Va命令：ls -all /usr/bin /usr/sbin /bin /usr/local/bin | rpm -Va>rpm.log
查看被别名的命令：alias
取消被别名的命令：unalias 命令
```

# 启动项排查

```
查看是否有异常开机启动项：cat /etc/rc.local | chkconfig --list
查看启动配置文件：vi /lib/systemd/system/rc-local.service
看启动文件：/etc/rc.local、/etc/rc[0-6].d
看启动文件目录：/etc/rc.d、 /etc/rc.d/init.d
看异常脚本： /etc/profile.d/ 、/etc/hourly、/etc/daily、/etc/weekly、/etc/monthly
```

# 库文件劫持排查

```
目前主流的劫持技术主要有三种：
1. 更改LD_PRELOAD环境变量，加载恶意库文件
2. /etc/ld.so.preload加载恶意的库文件(主流的劫持技术)
3. 更改默认的库文件/etc/ld.so.preload为其他库文件
```
    
```
其中第二条是目前遇到的最多的，其主要是通过更改/etc/ld.so.preload来预加载其他恶意的库文件来实现对系统命令，如netstat、cat、top等进行劫持，从而到达隐藏进程、连接、性能等目的，这种也是rootkit典型的技术。
```
    
```
检查方法：
查看环境变量：echo $LD_PRELOAD
查看命令加载的库文件：ldd /bin/ls
跟踪命令加载库的情况：strace -f -e trace=file /bin/cat
查看ld.so.preload加载库文件：cat /etc/ld.so.preload
```

# 处置

```
清理定时任务：
使用chattr -i /var/spool/cron/取消文件不可修改属性，再rm命令删除定时文件，可以结合crontab命令使用（清除定时任务时和客户确认是否存在正常任务，不要误删了）
杀掉进程:killall /kill -9 PID （可用于进程ID一直在变的场景）
删除所有定时任务：crontab -r
删除单个定时任务：crontab -e（编辑）
删除恶意文件：rm -rf 文件
```

# 工具查杀病毒和rootkit 

chkrootkit (下载地址-<http://www.chkrootkit.org>)

rkhunter (下载地址-<http://rkhunter.sourceforge.net>)

clamav(下载地址-<http://www.clamav.net/download.html>)

webshell：河马、长亭、D盾

busybox（下载地址-<https://busybox.net/>）

隐藏进程检测工具：unhide（<https://www.unhide-forensics.info/>）

 1. 需先安装epel源：`yum -y install epel-release`

 2. 安装：`yum -y install unhide`

 3. 使用： `unhide proc`

# 参考文献

库劫持参考文章：<https://blog.csdn.net/weixin_39581716/article/details/110810798>

挖矿应急参考文章：<https://mp.weixin.qq.com/s/NkleRQknAbvwvkYtNCo-Ww>
