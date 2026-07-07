---
title: "nmap"
date: 2025-05-14
description: "- -iL ip.txt 从文件读取所有目标 IP 段"
tags: []
---

# 官网：<https://nmap.org>

# 示例

## 示例1：大量主机全端口快速扫描

```
nmap -iL ip.txt -p- -sS -sV -T4 -Pn -n --min-rate 1000 --min-parallelism 512 --min-hostgroup 4 --max-retries 1 --host-timeout 30m --scan-delay 100ms --max-scan-delay 500ms --open -v -oA out
```
### 命令解释：

 - -iL ip.txt 从文件读取所有目标 IP 段
 - -p- 确保扫描所有端口（1–65535）
 - -sS 快速且隐蔽的 SYN 扫描
 - -sV 获取服务版本信息，较 -A 更高效
 - -T4 选用快速模板，兼顾速度和可靠性
 - -Pn 跳过主机发现，直接扫目标列表
 - -n 关闭 DNS 解析，减少延时
 - --min-rate 500 高并发发包（低：100–300，中：300-500，高：750–1000）
 - --min-parallelism 512 高并发探测端口（低：64–128，中：256–512，高：750–1024）
 - --min-hostgroup 4 批量轮询多个主机，减少空闲等待
 - --max-retries 2 最多重试 2 次，避免过度等待（默认重试10次）
 - --host-timeout 30m 单主机最长 30 分钟，防止拖慢整体扫描
 - --scan-delay 100ms 每包至少等待 100ms，避免触发目标限速
 - --max-scan-delay 500ms 若 Nmap 检测到丢包，可自动增长延迟，但不超过 500ms
 - --open 过滤闭合端口，只列出开放端口条目
 - -v 输出更详细进度，便于监控
 - -oA out 同时输出三种格式，便于整理与留存

该命令兼顾扫描速度与覆盖率，并保留丰富的输出格式和可调参数，适合对千级 IP 进行全端口互联网暴露面扫描。



# 帮助手册（中文版）：

以下是对应的 Nmap 帮助文档中文翻译，保持原有结构和简洁风格。

## 目标说明

可以传入主机名、IP 地址、网络等
示例：`scanme.nmap.org`、`microsoft.com/24`、`192.168.0.1; 10.0.0-255.1-254`

* `-iL <输入文件>`：从主机/网络列表文件读取
* `-iR <主机数>`：随机选择目标
* `--exclude <主机1[,主机2][,主机3],…>`：排除指定主机/网络
* `--excludefile <排除文件>`：从文件中读取排除列表

## 主机发现

* `-sL`：列出扫描目标（不实际发送探测）
* `-sn`：Ping 扫描，仅检测存活主机，不扫描端口
* `-Pn`：跳过主机发现，将所有主机视为在线
* `-PS/PA/PU/PY[端口列表]`：对给定端口发送 TCP SYN、ACK、UDP 或 SCTP 探测
* `-PE/PP/PM`：发送 ICMP 回显、时间戳或子网掩码请求
* `-PO[协议列表]`：IP 协议探测
* `-n`/`-R`：分别表示“从不做 DNS 解析”/“始终解析”（默认：有时解析）
* `--dns-servers <服务器1[,服务器2],…>`：指定自定义 DNS 服务器
* `--system-dns`：使用操作系统 DNS 解析器
* `--traceroute`：对每台主机执行跳点跟踪

## 扫描技术

* `-sS`/`-sT`/`-sA`/`-sW`/`-sM`：TCP SYN、Connect()、ACK、Window、Maimon 扫描
* `-sU`：UDP 扫描
* `-sN`/`-sF`/`-sX`：TCP Null、FIN、Xmas 扫描
* `--scanflags <标志>`：自定义 TCP 标志位
* `-sI <僵尸主机[:探测端口]>`：Idle（空闲）扫描
* `-sY`/`-sZ`：SCTP INIT、COOKIE-ECHO 扫描
* `-sO`：IP 协议扫描
* `-b <FTP 中继主机>`：FTP 弹跳扫描

## 端口指定及扫描顺序

* `-p <端口范围>`：只扫描指定端口
  示例：`-p22`；`-p1-65535`；`-p U:53,111,137,T:21-25,80,139,8080,S:9`
* `--exclude-ports <端口范围>`：排除指定端口
* `-F`：快速模式，只扫描常见端口
* `-r`：顺序扫描端口（不随机）
* `--top-ports <数量>`：扫描最常见的 N 个端口
* `--port-ratio <比例>`：扫描出现频率高于指定比例的端口

## 服务/版本探测

* `-sV`：探测开放端口上的服务及版本信息
* `--version-intensity <级别>`：设置探测强度，0（最轻）到 9（最全）
* `--version-light`：仅用最可能的探针（强度 2）
* `--version-all`：尝试所有探针（强度 9）
* `--version-trace`：显示详细探测过程（调试用）

## 脚本扫描

* `-sC`：等同于 `--script=default`
* `--script=<Lua 脚本>`：逗号分隔的脚本目录、脚本文件或脚本类别列表
* `--script-args=<参数列表>`：为脚本提供参数，如 `n1=v1,n2=v2`
* `--script-args-file=<文件名>`：从文件中读取脚本参数
* `--script-trace`：显示脚本发送和接收的所有数据
* `--script-updatedb`：更新脚本数据库
* `--script-help=<Lua 脚本>`：显示脚本帮助信息

## 操作系统识别

* `-O`：启用操作系统检测
* `--osscan-limit`：仅对有希望识别的目标进行 OS 检测
* `--osscan-guess`：更激进地猜测操作系统

## 时间与性能

（带 `<时间>` 的选项可用秒为单位，或附加 `ms`、`s`、`m`、`h`）

* `-T<0-5>`：设置时间模板（值越大速度越快）
* `--min-hostgroup`/`--max-hostgroup <大小>`：并行扫描时的主机分组大小
* `--min-parallelism`/`--max-parallelism <探针数>`：并行探针数
* `--initial-rtt-timeout`/`--min-rtt-timeout`/`--max-rtt-timeout <时间>`：往返超时设置
* `--max-retries <次数>`：探针重试上限
* `--host-timeout <时间>`：目标超时放弃时间
* `--scan-delay`/`--max-scan-delay <时间>`：探针间延迟调整
* `--min-rate`/`--max-rate <每秒探针数>`：速率下限/上限

## 防火墙/IDS 绕过与欺骗

* `-f`；`--mtu <值>`：分片数据包（可指定 MTU）
* `-D <诱饵1,诱饵2[,ME],…>`：使用诱饵主机混淆扫描来源
* `-S <源地址>`：伪造源 IP
* `-e <网络接口>`：指定网络接口
* `-g`/`--source-port <端口号>`：指定源端口
* `--proxies <URL1[,URL2],…>`：通过 HTTP/SOCKS4 代理中继
* `--data <十六进制数据>`：附加自定义负载
* `--data-string <ASCII 字符串>`：附加 ASCII 字符串
* `--data-length <长度>`：附加随机数据
* `--ip-options <选项>`：指定 IP 选项
* `--ttl <值>`：设置 IP 生存时间
* `--spoof-mac <MAC 地址/前缀/厂商>`：伪造 MAC 地址
* `--badsum`：发送错误校验和的数据包

## 输出

* `-oN`/`-oX`/`-oS`/`-oG <文件>`：以普通、XML、脚本输出或可 grep 格式保存
* `-oA <基名>`：同时以三种主要格式保存
* `-v`（-vv、-vvv…）：增加详细级别
* `-d`（-dd、-ddd…）：增加调试级别
* `--reason`：显示端口状态的原因
* `--open`：仅显示“开放”或“可能开放”端口
* `--packet-trace`：显示所有收发数据包
* `--iflist`：打印本地接口及路由（调试用）
* `--append-output`：追加而非覆盖输出文件
* `--resume <文件>`：恢复中断的扫描
* `--noninteractive`：禁用交互式键盘操作
* `--stylesheet <路径/URL>`：为 XML 指定 XSL 样式表
* `--webxml`：在 XML 中引用 Nmap.Org 的样式表
* `--no-stylesheet`：不在 XML 中关联样式表

## 杂项

* `-6`：启用 IPv6 扫描
* `-A`：同时启用 OS 探测、版本探测、脚本扫描和 traceroute
* `--datadir <目录>`：指定 Nmap 数据文件位置
* `--send-eth`/`--send-ip`：使用以太网帧或 IP 数据包发送
* `--privileged`/`--unprivileged`：假定有/无原始套接字权限
* `-V`：打印版本号
* `-h`：打印帮助摘要

## 示例

* `nmap -v -A scanme.nmap.org`
* `nmap -v -sn 192.168.0.0/16 10.0.0.0/8`
* `nmap -v -iR 10000 -Pn -p 80`

更多选项及示例详见手册页：[https://nmap.org/book/man.html](https://nmap.org/book/man.html)
