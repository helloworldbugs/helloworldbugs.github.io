---
title: "windows随记"
date: 2024-05-10
categories: ["${folder}"]
description: ""
tags: ["windows"]
---

# win注册表start键值说明

|键值|说明|
|:----|:----|
|0|默认开机bios启动而启动|
|1|跟随操作系统启动|
|2|自动启动|
|3|手动启动|
|4|禁用|


# KMS激活

安装对应版本的[产品密钥](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys?tabs=server2022%2Cwindows10ltsc%2Cversion1803%2Cwindows81)

```
slmgr /ipk <产品密钥>
```

设置kms服务器

```
slmgr /skms <kms服务器>
```

手动激活

```
slmgr /ato
```

查看激活信息

```
slmgr.vbs -dlv
```

更多参考：

[密钥管理服务 (KMS) 客户端激活和产品密钥](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys?tabs=server2022%2Cwindows10ltsc%2Cversion1803%2Cwindows81)

[适用于 Windows Server 的升级和转换选项](https://learn.microsoft.com/zh-cn/windows-server/get-started/upgrade-conversion-options)

# 允许运行powershell脚本

临时允许一次

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

当前用户永久放开

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

# 显示桌面“我的电脑"

win+r运行：

```
rundll32.exe shell32.dll,Control_RunDLL desk.cpl,,0
```

# 关闭Windows Defender（安全中心）

win+r：regedit

```
计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService
```

修改start值为4（禁用）

```
计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc
```

修改start值为4（禁用）



# 禁用windows自动更新

win+r：regedit

Windows Update（修改stat值为4禁用）

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\UsoSvc
```

Windows 更新医生服务（修改stat值为4禁用）

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc
```

修改FailureActions键，修改010和018左起第5个值为00

![](/images/posts/windows%E9%9A%8F%E8%AE%B0/fcf72bad0d8ebea5682c834c31937f70-1.png)

# 解决windows系统显示SATA盘为可弹出设备

1. windows+R 输入regedit打开注册表，定位到

```
HKLM\SYSTEM\CurrentControlSet\Services\storahci\Parameters\Device
```
    
新建"多字符串值"，命名为"TreatAsInternalPort"。

2. 打开设备管理器，查看磁盘驱动的硬盘位置。

3. 在 `TreatAsInternalPort` 的 `值` 里竖着写上自己的硬盘端口号，写完后要在最后加一个回车。

# 打开隐藏的电源计划

1. 命令 `powercfg/L` 可以看到当前系统存在的电源方案，带星号的正在用的方案
2. 命令 `powercfg/ALIASES` 可以看到所有系统内置的电源方案
3. 命令 `powercfg/S SCHEME_MIN` 就可以使用高性能方案了
5. SCHEME_MAX (省电)、SCHEME_MIN (高性能) 和 SCHEME_BALANCED (平衡)

# 改变用户管理员角色属性

win+r：

```
control userpasswords2
```

用户 -> 属性 -> 组成员

# cmd命令行重启服务

列出当前的服务名称

```
sc query | findstr <服务名称>
```

停止服务

```
net stop <服务名称>
```

启动服务

```
net start <服务名称>
```


# win11右键菜单样式切换回win10样式(cmd命令)


win11右键菜单样式切换到win10样式

```
reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
```

恢复

```
reg delete "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" /f
```

# win11右键菜单添加打开CMD

>Windows 11 在检测到当前用户为非超级管理员用户的时候，会把原来的 CMD 选项隐藏掉，默认用 PowerShell 替代，虽然注册表里还在，但是微软加了一个策略键来屏蔽它。只需要把屏蔽解除就能在右键菜单里看到“在此处打开命令窗口”（CMD命令行窗口）了。

win+r：regedit

1. 桌面空白处菜单项（背景菜单）

```
HKEY_CLASSES_ROOT\Directory\Background\shell\cmd
```

2. 文件夹菜单项
```
HKEY_CLASSES_ROOT\Directory\shell\cmd
```

在以上的两个位置,按需删除以下键值:

 -  `HideBasedOnVelocityId` : 隐藏power shell

 -  `Extended` : 隐藏cmd命令行窗口

# win11关机被软件阻止的解决办法

win+r：regedit

```
计算机\HKEY_CURRENT_USER\Control Panel\Desktop
```

新建字符串值：AutoEndTasks , 键值为：1

# 去除Win10右键菜单使用Windows Defender扫描

cmd管理员权限执行：

```
regsvr32 /u "%ProgramFiles%\Windows Defender\shellext.dll"
```
    
要恢复执行：

```
regsvr32 "%ProgramFiles%\Windows Defender\shellext.dll"
```


# Windows系统封装初始化工具
```
sysprep
```
win+r 键入 sysprep即可找到启动文件

# 磁盘修复
#为要修复的磁盘盘符
```
chkdsk #: /f /r /x
```
更多参考文章：<https://www.disktool.cn/content-center/check-hard-drive-for-errors-windows-10-2111.html>

# cmd命令设置代理
## 临时代理
http协议
```
set http_proxy=http://127.0.0.1:10808
set https_proxy=http://127.0.0.1:10808
```
socks协议
```
set http_proxy=socks5://127.0.0.1:10808
set https_proxy=socks5://127.0.0.1:10808
```
## 环境变量设置永久代理
```
HTTP_PROXY  = http://127.0.0.1:7890
HTTPS_PROXY = http://127.0.0.1:7890
NO_PROXY    = localhost,127.0.0.1,::1
```

# 关机被阻止解决方法-“此应用程序阻止关机”

按 Win + R 打开运行窗口，输入 regedit 并按回车，打开注册表编辑器。
依次导航到以下路径：`HKEY_USERS\.DEFAULT\Control Panel\Desktop`
在右侧窗口中，右键单击，选择“新建” -> “字符串值”，命名为：`AutoEndTasks`。
双击 AutoEndTasks，将其值设置为 1

# 批量还原被Windows Defender隔离的文件

以管理员身份打开PowerShell。

- 列出被隔离的文件
```
Get-MpThreatDetection | Where-Object { $_.InitialDetectionTime -gt (Get-Date).AddDays(-30) } | Format-Table -Property InitialDetectionTime,Resources
```
- 批量还原文件
```
Get-MpThreatDetection | Where-Object { $_.Actions -eq "Quarantine" } | ForEach-Object {
    $filePath = $_.Resources
    Move-Item -Path $filePath -Destination (Split-Path $filePath -Parent)
}
```
- 验证是否还原成功，如果输出为空，说明没有文件被隔离，还原成功。如果仍有文件被隔离，说明还原未完全成功。
```
Get-MpThreatDetection | Where-Object { $_.Actions -eq "Quarantine" } | Format-Table -Property InitialDetectionTime,Resources
```
# 卸载 Windows 更新

可以删掉已经下载的更新缓存包，这样重启时就不会继续安装。Windows 更新的缓存文件通常放在 **`C:\Windows\SoftwareDistribution\Download`** 目录下。

操作步骤：

1. **停止更新服务**（否则删不了）：

   * 以管理员身份打开 PowerShell 或 CMD，执行：

     ```powershell
     net stop wuauserv
     net stop bits
     ```
2. **删除缓存文件**：

   * 打开 `C:\Windows\SoftwareDistribution\Download`
   * 全选里面的文件，删除即可（不会影响系统正常运行）。
   * 如果想更彻底，可以清空整个 `C:\Windows\SoftwareDistribution` 文件夹，但最好只清理 `Download` 目录。
3. **重新启用服务**：

   * 执行：

     ```powershell
     net start wuauserv
     net start bits
     ```

这样系统就不会继续安装已经下载的更新包。

4. **卸载更新**：

```PowerShell
wusa /uninstall /kb:5063878
```
