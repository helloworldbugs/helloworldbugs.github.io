---
title: "Python学习记录"
date: 2024-05-14
categories: ["${folder}"]
description: "1. 安装Pyinstaller"
tags: ["python"]
---

# request库

## 解决requests无法访问https问题
```
# verify=False
response = requests.get(url,verify=False)
```

## requests允许跟随重定向
```
# allow_redirects=True
response = requests.get(url,allow_redirects=True)
```

## 关闭控制台输出建议提示

```
requests.packages.urllib3.disable_warnings()
```

## request发送到代理
```
proxy = {"http":"127.0.0.1:8080","https":"127.0.0.1:8080"}

request(url,headers,proxies=proxy)
```
# python项目打包成exe

1. 安装Pyinstaller

```
pip install pyinstaller
```

2. 进入到项目文件根目录，打开cmd窗口，开始打包

```
pyinstaller -F <主程序py文件> -p <py项目目录路径>
```

>如果不需要命令行窗口交互，可选择加上`-w`参数屏蔽命令行窗口

具体参数可参考下图

![](/images/posts/Python%E5%AD%A6%E4%B9%A0%E8%AE%B0%E5%BD%95/image.png)

1. 经过漫长的跑马灯等待，最后一句提示：`Building EXE from EXE-00.toc completed successfully`，即表示打包完成

2. 完成后在目录文件下会多出一个名为：`dist` 的文件夹，打开里面就可以找到exe文件了，其它文件可删除

# 获取当前文件路径

适用于windows

```
pwd = os.getcwd()
```

# 时间

```
import datetime

# 获取当前时间
current_time = datetime.datetime.now()

# 格式化时间为指定格式
formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")

# 输出格式化后的时间
print('当前时间：',formatted_time)
```

# 弹框选择文件
```
import tkinter as tk
from tkinter import filedialog

root = tk.Tk()
root.withdraw()

# 获取选择好的文件
file_path = filedialog.askopenfilename()
```
