---
title: "python上传文件到smb服务器"
date: 2024-05-21
description: "某天领导安排了个活，要求写某个系统的自动备份脚本，本来是一个很简单的脚本，三两下写好了，领导又开始提要求，要能自动上传到smb服务器上就好了。于是我就在网上到处抄作业，但是尝试了一圈发现网上的教程全是复制粘贴的，全部都是错的，好在后面经过折腾自己弄好了，于是记录一下正确的实现方法"
tags: ["python", "smb"]
categories: ["${folder}"]
---

# 前言

某天领导安排了个活，要求写某个系统的自动备份脚本，本来是一个很简单的脚本，三两下写好了，领导又开始提要求，要能自动上传到smb服务器上就好了。于是我就在网上到处抄作业，但是尝试了一圈发现网上的教程全是复制粘贴的，全部都是错的，好在后面经过折腾自己弄好了，于是记录一下正确的实现方法

# 代码部分
```    
# 需要安装模块：pip3 install pysmb
from smb.SMBConnection import SMBConnection    
import os

filename = test.zip
pwd = os.getcwd()

# 定义文件路径
shared_folder_name = '安全部门'   #共享文件夹
local_file_path= pwd+'\\'+filename  #要上传的本地文件路径
remote_file_name = '配置文件\\'+filename    #在SMB服务器上保存的文件名

# 开始上传文件
print('正在上传文件到smb服务器，请稍等。。。')
try:
    # 创建SMB连接
    conn = SMBConnection(smb_username, smb_password, 'my_client', smb_servers_ip, domain='', use_ntlm_v2=True, is_direct_tcp=True)
    conn.connect(smb_servers_ip, 445)
    conn.storeFile(shared_folder_name, remote_file_name, open(local_file_path, 'rb'))
    print("文件上传成功")

    # 断开SMB连接
    conn.close()

except:
    print('文件上传失败')
```
