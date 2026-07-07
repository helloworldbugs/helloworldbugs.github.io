---
title: "Windows应急"
date: 2024-05-14
categories: ["网安", "应急响应"]
description: "显示所有进程的映像名称、PID、内存使用等信息。"
tags: ["应急响应"]
---

# 快捷方式

```
windows事件查看器：Win+R 输入eventvwr.msc
查看定时任务：Win+R 输入taskschd.msc
查看注册表：Win+R 输入regedit
查看账户安全：Win+R 输入lusrmgr.msc
查看本地组策略：Win+R 输入gpedit.msc
```

# 进程排查

### 进程排查核心命令
#### 1. 基础进程信息获取
- **查看所有进程**  
  ```bash
  tasklist
  ```
显示所有进程的映像名称、PID、内存使用等信息。

- **查看进程关联服务**  
  ```bash
  tasklist /svc
  ```
显示每个进程对应的服务名称，帮助识别伪装成系统服务的恶意进程。

- **列出所有进程的 PID 和父进程 PID​​**   

 ```bash
 wmic process get name,processid,parentprocessid
 ```
其中，`ParentProcessId` 列即为目标进程的父进程 PID。

#### 2. 网络连接与进程关联
- **查看网络连接状态**  
  ```bash
  netstat -ano
  ```
  ```bash
  netstat -ano | findstr "ESTABLISHED"
  ```
过滤已建立的连接，定位可疑IP和端口。

- **通过PID关联进程**  
  ```bash
  tasklist /svc | findstr "PID"
  ```
根据网络连接中获取的PID，快速定位具体进程。

#### 3. 进程路径追踪与终止

- **查看进程路径**  
  ```bash
  wmic process where processid=[PID] get executablepath,processid,name
  ```

获取进程的完整路径，判断是否为系统文件或可疑位置（如临时目录）。

- **终止进程**  
  ```bash
  taskkill /PID [PID] /F /T  # /F 强制终止，/T 终止子进程
  ```
强制终止进程及子进程，适用于顽固恶意进程。


### 进阶排查技巧（补充）
#### 1. 进程详细信息分析
- **查看进程命令行参数**  
  ```bash
  wmic process get name,commandline,processid
  ```
分析启动参数，识别异常参数（如加密字符串、远程URL）。

- **进程启动时间检查**  
  ```bash
  wmic process get name,creationdate,processid | findstr [PID]
  ```
对比系统正常进程的启动时间，定位异常时间段启动的进程。

#### 2. 进程关联资源排查
- **查看进程加载的DLL**  
  ```bash
  tasklist /m [DLL名称]  # 列出加载特定DLL的进程
  ```
识别恶意注入的DLL（如无签名、名称随机）。

- **检查进程线程状态**  
使用工具（如 **Process Explorer**）查看线程的CPU占用、堆栈调用，定位高负载线程。

#### 3. 自动化工具推荐
- **Process Explorer/ProcessMonitor**（微软官方工具）  
提供图形化界面，显示进程树、线程、句柄、网络连接等详细信息，支持直接挂起/终止进程。
  
- **ProcessHacker/OpenArk64**  
检测隐藏进程、内核级恶意驱动，适用于对抗Rootkit。



### 排查流程优化建议
1. **网络连接优先**：先通过 `netstat -ano` 定位异常连接，再关联进程PID。
2. **路径验证**：检查进程路径是否在系统目录（如 `C:\Windows\System32`）或常见软件目录，排除伪装进程。
3. **父进程溯源**：追踪PPID，判断是否为 `explorer.exe`、`svchost.exe` 等正常父进程。
4. **工具结合**：命令行+图形化工具（如Process Explorer）结合使用，提高效率。



### 注意事项
- **权限要求**：部分命令需管理员权限运行（如终止系统进程）。
- **备份与记录**：终止进程前记录详细信息，避免误操作影响系统。
- **日志关联**：结合系统日志（事件查看器）分析进程创建、服务启动等事件。
- **杀软配合**：使用杀毒软件（如D盾、火绒）扫描进程文件，确认是否为已知威胁。



# 文件排查

>**注意：排查前记得打开显示隐藏文件**

```
临时文件排查
黑客往往可能将病毒放在临时目录（tmp/temp），或者将病毒相关文件释放到临时目录。
系统盘在C盘的情况下，则通常情况下的临时目录如下：
C:\Users\[用户名]\Local Settings\Temp
C:\Documentsand Settings\[用户名]\Local Settings\Temp
C:\Users\[用户名]\桌面
C:\Documentsand Settings\[用户名]\桌面
C:\Users\[用户名]\Local Settings\Temporary Internet Files
C:\Documents and Settings\[用户名]\Local Settings\Temporary Internet Files
```
    
```
浏览器文件排查
黑客可能通过浏览器下载恶意文件，或者盗取用户信息，因此需要检查下浏览器的历史访问记录、文件下载记录、cookie信息，对应相关文件目录如下：
C:\Users\[用户名]\Cookies
C:\Documents and Settings\[用户名]\Cookies
C:\Users\[用户名]\Local Settings\History
C:\Documents and Settings\[用户名]\Local Settings\History
C:\Users\[用户名]\Local Settings\Temporary Internet Files
C:\Documents and Settings\[用户名]\Local Settings\Temporary Internet Files
```
    
```
最近文件排查
Win+R 输入recent
```
    
```
文件修改时间排查
可以根据文件夹内文件列表时间进行排序，查找可疑文件。一般情况下，修改时间越近的文件越可疑。
```
    
```
hosts文件排查
hosts文件是系统配置文件，用于本地DNS查询的域名设置，可以强制将某个域名对应到某个IP上，因此需要检查hosts文件有没有被黑客恶意篡改。
C:\Windows\System32\drivers\hosts
```
	
```
System32是常见的病毒释放目录，因此需要重点检查该目录。特别注意用随机字符命名的文件夹和隐藏文件
C:\Windows\System32
```

# 启动项排查

## 注册表项排查

### 系统级启动项（所有用户生效）
1. **常规启动项**  
	
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```
2. **一次性启动项（仅运行一次后删除）**  
	
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce
```
3. **扩展一次性启动项（通常用于安装程序）**  
	
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnceEx
```
4. **32位程序在64位系统中的启动项**  
	
```
HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run
```



### 用户级启动项（仅当前用户生效）
1. **常规启动项**  
	
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
```
2. **一次性启动项（仅运行一次后删除）**  
	
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce
```
3. **扩展一次性启动项**  
	
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnceEx
```



### 其他相关路径
- **组策略启动项**（需管理员权限配置，通常影响系统级）  
	
```
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run
```
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run
```

步骤：

1. 按下 Win + R，输入 gpedit.msc，打开本地组策略编辑器。

2. 导航至：计算机配置 > Windows 设置 > 脚本（启动/关机）。




### 关键说明
- **系统级（`HKEY_LOCAL_MACHINE`）**：需要管理员权限修改，对所有用户生效。
- **用户级（`HKEY_CURRENT_USER`）**：仅影响当前登录用户。
- **Run vs. RunOnce**  
	`Run`：每次用户登录时自动启动。  
	`RunOnce`：程序运行一次后，注册表项会被自动删除。常用于安装或配置任务。
- **64位系统注意**：64位系统会通过`WOW6432Node`区分32位程序，但常规路径（如`Run`）会同时加载64/32位程序，无需额外配置。



如果需要更直观的管理，也可使用系统工具：  
- **任务管理器** → “启动”选项卡（适用于Windows 8及以上）。  
- **系统配置工具**（`msconfig`）或第三方工具（如Autoruns）。


## 启动文件排查

### 系统级启动目录（所有用户生效）
1. **公共启动目录**  
 -  路径：
```
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp
```
 -  快速访问方法：  
按下 `Win + R`，输入 `shell:common startup` 直接打开。



### 用户级启动目录（仅当前用户生效）
1. **当前用户启动目录**  
 -  路径：  
```
C:\Users\<用户名>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```
 -  快速访问方法：  
按下 `Win + R`，输入 `shell:startup` 直接打开。



### 特殊说明
1. **兼容性差异**：  
 -  上述路径适用于 Windows Vista/7/8/10/11，不同系统版本路径一致。  
 -  在 Windows XP 中，路径为：
```
C:\Documents and Settings\<用户名>\「开始」菜单\程序\启动`（系统级和用户级）
```
1. **权限要求**：  
 -  系统级目录（`ProgramData`）需要管理员权限才能修改。  
 -  用户级目录可直接通过当前用户账户修改。

2. **隐藏文件夹**：  
 -  `AppData` 和 `ProgramData` 是隐藏文件夹，需在资源管理器中启用 **“显示隐藏的文件”** 才能看到。



# 系统日志排查

```
windows日志文件保存位置：C:\Windows\System32\winevt\Logs
```
    
## 一、登录相关事件
1. **4624**（登录成功）  
 -  **描述**：记录用户成功登录系统的事件。  
 -  **关键字段**：  
 -  **登录类型**（如类型3为网络登录，类型10为远程桌面登录）  
 -  **源IP**（用于追踪登录来源）  
 -  **应用场景**：排查异常时间或陌生IP的成功登录行为。

2. **4625**（登录失败）  
 -  **描述**：记录用户登录失败的事件，如密码错误或账户不存在。  
 -  **关键字段**：  
 -  **失败原因**（如`0xC000006D`表示用户名错误，`0xC000006A`表示密码错误）  
 -  **登录进程**（如`NTLM`或`Kerberos`）  
 -  **应用场景**：检测暴力破解攻击或异常账户探测。

3. **4648**（显式凭证登录）  
 -  **描述**：用户使用`runas`或其他方式显式提供凭证登录（如横向渗透中传递票据）。  
 -  **关键字段**：  
 -  **进程名**（如`cmd.exe`或`powershell.exe`）  
 -  **目标用户名**（如提权操作的目标账户）  
 -  **应用场景**：发现横向移动或特权提升行为。

4. **4672**（特权用户登录）  
 -  **描述**：用户以管理员权限登录（如`Administrator`账户）。  
 -  **应用场景**：监控高权限账户的异常活动。



## 二、账户管理事件
1. **4720**（创建用户）  
 -  **描述**：系统中新增本地或域用户。  
 -  **应用场景**：检测攻击者创建隐藏账户（如`admin$`）。

2. **4724**（重置密码）  
 -  **描述**：用户密码被修改。  
 -  **应用场景**：排查未经授权的密码变更行为。

3. **4726**（删除用户）  
 -  **描述**：用户账户被删除。  
 -  **应用场景**：识别攻击者清除痕迹的操作。

4. **4732**（用户加入本地组）  
 -  **描述**：用户被添加到管理员组或其他特权组。  
 -  **应用场景**：检测提权行为（如将普通用户加入`Administrators`组）。



## 三、进程与服务相关事件
1. **4688**（进程创建）  
 -  **描述**：记录新进程的启动，包括路径、命令行参数和父进程。  
 -  **应用场景**：发现恶意进程（如`C:\temp\mimikatz.exe`）或异常命令行操作。

2. **7045**（服务创建）  
 -  **描述**：系统中新增服务项。  
 -  **应用场景**：检测后门服务（如攻击者通过服务实现持久化）。



## 四、日志操作与系统变更
1. **104**（日志清除）  
 -  **描述**：系统日志被清空（如使用`wevtutil`工具）。  
 -  **应用场景**：识别攻击者清除痕迹的行为。

2. **1102**（审计日志清除）  
 -  **描述**：安全日志被手动清除。  
 -  **应用场景**：同104，但针对安全日志。

3. **4697**（服务安装）  
 -  **描述**：系统安装新服务。  
 -  **应用场景**：监控恶意服务的植入。



## 五、其他关键事件
1. **4776**（NTLM认证尝试）  
 -  **描述**：记录NTLM协议的认证请求（如暴力破解或Pass-the-Hash攻击）。  
 -  **关键字段**：  
 -  **源工作站名**（如`localhost`可能为本地攻击）  
 -  **错误代码**（如`0xC0000064`表示账户不存在）  
 -  **应用场景**：检测横向移动或凭证窃取。

2. **5140**（网络共享访问）  
 -  **描述**：用户访问网络共享文件或目录。  
 -  **应用场景**：追踪横向渗透中的文件窃取行为。



**建议**：日常排查时可优先关注**登录事件（4624/4625）**、**账户变更（4720/4726）**和**进程创建（4688）**，结合源IP、时间戳和进程路径进行关联分析。若需完整事件ID列表，可参考微软官方文档或安全日志分析工具。


# Web日志排查

```
Apache日志：
apache日志一般分为access_log 和 error_log两种：
access_log记录对apache服务器的请求访问
error_log记录错误请求，服务器错误
存放路径：/apache/logs/
```

```
nginx日志：
ngnix日志一般分为access.log和error.log两种：
access.log 主要记录访问日志
error.log 主要记录一些错误信息
存放路径/Nginx/logs/
```

```
IIS日志：
存放路径c:\windows\system32\logFiles
```

```
Tomact日志：
tomcat日志一般分为catalina.out、localhost、manager、localhost_access_log4种格式日志：
catalina.out主要记录运行中残生的信息，如异常错误等
localhost.Y-M-D.log 内部代码丢出的异常日志
manager.Y-M-D.log 管理日志
localhost_access_log 访问日志信息，访问时间、ip地址等
存放路径/tomcat/logs
```

```
Weblogic日志：
access.log主要记录http请求
server log 主要记录weblogic启动、关闭、部署等相关信息
domain log 主要记录weblogic server 的doain运行情况
```

# 账号排查

```
查看所有用户最后一次登录，修改密码时间，以及账户是否启动：ner user 用户名
隐藏/克隆账号排查：使用D盾进行扫描
可疑账号排查：Win+R 输入lusrmgr.msc（关注管理员群组是否存在可疑账号）
排查在线用户：query user
```

# 补丁排查

```
查看系统补丁信息：systeminfo（重点关注MS08-067、MS09-001、MS17-010）
```
    
```
MS17-010补丁：
Win7/Win2008R2：KB4012212、KB4012215
Win2012R2：KB4012213、KB4012216
Win2016： KB4013429
```
    
```
MS08-067补丁：KB958644
```
    
```
MS09-001补丁：KB958687
```

# 其他

```
查看IPV4路由信息：netstat -rn
查看DNS解析缓存：ipconfig /displaydns
```

# rdp远程连接记录排查
	
	注册表排查

```
检查当前用户使用RDP连接过的主机IP：
HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Servers
```
	查看UsernameHint键值为远程登录的用户名

```
RDP服务启用状态排查：
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server
检查fDenyTSConnections 键值，键值为0表示已开启远程桌面，键值为1表示已关闭远程桌面
```
    
```
RDP远程端口排查：
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp
检查PortNumber键值，若为3389则正常
```
    


更多信息参考文献：<https://zhuanlan.zhihu.com/p/240184708>

# 排查工具
```
系统日志分析工具：evtxLogparse1.3/LogParser
显Windows程序历史记录：userassistview
查看最近电脑的使用操作记录：LastActivityView (0.236, 0.029, 14.01%)
查看浏览器历史记录：browsinghistoryview
查看进程：PCHunter/ProcessHacker
查看启动项：Autoruns
```

# 参考文献
<https://www.freebuf.com/articles/es/210315.html>

<https://www.freebuf.com/articles/network/178677.html>

web日志文件分析：<https://blog.csdn.net/qq_25645753/article/details/111170854>
