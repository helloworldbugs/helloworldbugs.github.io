---
title: "bat脚本隐藏命令行窗口执行"
date: 2025-06-03
description: "在批处理文件中添加以下代码，可以通过 mshta 启动自身，并隐藏窗口："
tags: []
categories: ["${folder}"]
---

---

## bat 脚本隐藏命令行窗口执行

### 使用 `mshta` 启动隐藏窗口

在批处理文件中添加以下代码，可以通过 `mshta` 启动自身，并隐藏窗口：

```batch
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin
REM 在此处添加您的脚本内容
```

此方法利用 `mshta` 和 VBScript 创建一个隐藏的窗口来运行批处理脚本。

---
### 使用 VBScript 脚本执行 cmd 命令

新建一个 `.vbs` 文件，内容如下：

```
set ws=createobject("wscript.shell")
ws.run("cmd /c hostname"),vbhide
```
替换 `cmd /c` 后的内容为你需要执行的命令，比如 `cmd /c start chrome`。

 - cmd /c：通过命令行执行后续的 cmd 命令。

 - 0：设置窗口样式为隐藏（vbHide）。

 - False：不等待命令执行完成，脚本继续执行。

---

### 配合使用 VBScript 隐藏窗口

创建一个 `.vbs` 文件，通过 VBScript 调用批处理文件，并设置窗口隐藏：

1. 打开记事本，输入以下内容：

   ```vbscript
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.Run "cmd.exe /c ""C:\路径\到\您的脚本.bat""", 0
   Set WshShell = Nothing
   ```

请将 `"C:\路径\到\您的脚本.bat"` 替换为您的批处理文件的实际路径。

2. 将文件保存为 `.vbs` 扩展名，例如 `run_hidden.vbs`。

3. 双击运行该 `.vbs` 文件，您的批处理脚本将以隐藏窗口的方式执行。

## 计划任务隐藏 bat 脚本命令行窗口

### 在任务计划程序中直接调用 `mshta`

（此方法在高版本 windows11 已无法使用）

在任务计划程序中配置任务时，在“操作”选项卡中设置：

* **程序或脚本**：`mshta`
* **添加参数**：`vbscript:createobject("wscript.shell").run("""C:\路径\到\您的脚本.bat""",0)(window.close)`

请将 `C:\路径\到\您的脚本.bat` 替换为您的批处理文件的实际路径。

### 配合 powershell 启动 bat 脚本

启动之初会一闪而过一个窗口，然后会自动关闭

powershell命令：
```
powershell -WindowStyle Hidden -Command "cmd.exe /c 'C:\路径\脚本.bat'"
```
在计划任务中配置任务时，在“操作”选项卡中设置：
* **程序或脚本**：`powershell.exe`
* **添加参数**：`-WindowStyle Hidden -Command "cmd.exe /c 'C:\路径\脚本.bat'"`

### 使用 VBScript 启动批处理文件

创建一个 `.vbs` 文件，通过 VBScript 启动批处理文件，并设置窗口隐藏：

1. 打开记事本，输入以下内容：

   ```vbscript
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.Run "C:\路径\到\您的脚本.bat", 0
   Set WshShell = Nothing
   ```

请将 `C:\路径\到\您的脚本.bat` 替换为您的批处理文件的实际路径。

2. 将文件保存为 `.vbs` 扩展名，例如 `run_hidden.vbs`。

3. 在任务计划程序中配置任务，设置“操作”中的“程序或脚本”为：

   `wscript.exe`

   “添加参数”为：

   `"C:\路径\到\run_hidden.vbs"`

这样可以通过 VBScript 启动批处理文件，并隐藏命令提示符窗口。
