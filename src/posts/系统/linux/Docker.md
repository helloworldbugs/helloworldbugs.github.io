---
title: "Docker"
date: 2024-05-14
description: "建议直接安装apt库的docker-io版"
tags: ["docker"]
categories: ["${folder}"]
---

## 安装

>ps:
> - docker.io 是 Debian 团队维护的
> - docker-ce 是 docker 官方维护的社区版（Community Edition）
> - docker-ee 是 docker 官方维护的商业版（Enterprise Edition）

### docker安装

#### 官方脚本

```text-plain
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

#### debian/ubuntu

建议直接安装apt库的docker-io版

```
apt update && apt install -y docker.io
```
查看版本

```text-plain
docker version
```

### docker-compose安装

从github上下载文件（linux通用）

```text-plain
curl -L "https://github.com/docker/compose/releases/download/latest/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
```

查看版本

```
docker-compose version
```

### debian/ubuntu安装docker-ce


1. 更新软件包列表：
在终端中执行以下命令以确保软件包列表是最新的：
```
apt update
```
2. 安装依赖包：
安装一些必要的软件包，以便使用HTTPS传输：
```
apt install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common dirmngr
```
3. 添加Docker官方的GPG密钥：
```
curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
```
4. 添加Docker软件包仓库：
```
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
```
5. 更新软件包列表：
再次运行更新以获取Docker软件包：
```
apt update
```
6. 安装Docker Engine：
```
apt install docker-ce -y
```
7. 验证Docker版本：
运行以下命令来验证Docker是否正确安装：
```
docker --version
```
8. 将Docker设置为开机启动：
```
systemctl enable docker
```
9. 将用户添加到docker组（可选）：
如果想允许非root用户运行Docker命令，可以将他们添加到docker用户组中：
```
usermod -aG docker your_username
```
>请将 “your_username” 替换为希望添加到docker组的用户名。


### RedHat/Cent安装docker-ce

卸载旧版本（如果装过）

```text-plain
yum remove docker  docker-common docker-selinux docker-engine
```

安装依赖

```text-plain
yum install -y yum-utils device-mapper-persistent-data lvm2
```

查看可用docker版本有哪些

```text-plain
yum list docker-ce --showduplicates | sort -r
```

选择一个版本并安装：`yum install docker-ce-版本号`

> 注意：24版本和26版本的镜像不通用

```text-plain
yum -y install docker-ce-24.0.0
```

查看版本号

```text-plain
docker version
```

## 改查

### 修改容器配置参数

```
/var/lib/docker/containers/<容器ID>
```

### 修改docker默认存储目录
```
vim /etc/docker/daemon.json
```
```
{
  "data-root": "/data/docker"
}
```

```
systemctl daemon-reload && systemctl restart docker
```

一句话命令（测试）
```
mkdir -p /etc/docker && echo '{"data-root":"/data/docker"}' | tee /etc/docker/daemon.json >/dev/null && systemctl restart docker
```

### 查看容器启动命令

```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock cucker/get_command_4_run_container <容器ID>
```
## 其他命令

### docker-compose重新构建容器

```
docker-compose up --build -d
```

### 拉取镜像

```
docker pull <images_name>:latest    //latest为最新镜像的意思
```

### 设置容器开机自启

//容器初次启动添加的参数
```
--restart=always
```

//已启动的容器设置
```
docker update --restart=always <docker_ID>
```

//取消开机自启动
```
docker update --restart=no <docker_ID>
```

//批量给所有容器添加自启动标签
```
docker ps -aq | xargs -I {} docker update --restart=always {}
```

### 将文件从本机上传到docker容器

```
docker cp <local_path> <docker_ID>:<docker_path>
```

### 从docker容器中下载文件

```
docker cp <docker_ID>:<local_path> <local_path>
```

### 将容器保存为镜像

```
docker commit <docker_ID> <要保存的镜像名称>:v1.1
```

### 自动保持 docker 容器镜像最新
```
docker run -d \
    --name watchtower \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower
```

## 批量操作

给所有容器添加自启动标签
```
docker ps -aq | xargs -I {} docker update --restart=always {}
```

停止/删除所有容器
```
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
```
    

停止/删除所有名字包含`linglong`的容器
```
docker stop $(docker ps -a | grep 'linglong' | awk '{print $1}')
docker rm $(docker ps -a | grep 'linglong' | awk '{print $1}')
```

删除所有未打`dangling`标签的镜像
```
docker rmi $(docker images -q -f dangling=true)
```

删除所有名字包含`linglong`的镜像
```
docker rmi $(docker images | grep "linglong" | awk '{print $3}')
```

删除所有镜像
```
docker rmi -f $(docker images -q)
```


## 配置docker代理

1. 创建 dockerd 相关的 systemd 目录，这个目录下的配置将覆盖 dockerd 的默认配置

    ```bash
    mkdir -p /etc/systemd/system/docker.service.d
    ```

2. 新建配置文件 `http-proxy.conf`，这个文件中将包含环境变量

    ```bash
    vim /etc/systemd/system/docker.service.d/http-proxy.conf
    ```

3. 写入代理配置 

    ```bash
    [Service]
    Environment="HTTP_PROXY=http://10.0.0.100:10808"
    Environment="HTTPS_PROXY=http://10.0.0.100:10808"
    ```

4. 重新加载配置文件，重启 dockerd

    ```bash
    systemctl daemon-reload && systemctl restart docker
    ```

一句话命令（测试）
```
mkdir -p /etc/systemd/system/docker.service.d && echo -e '[Service]\nEnvironment="HTTP_PROXY=http://10.0.0.100:10808"\nEnvironment="HTTPS_PROXY=http://10.0.0.100:10808"' > /etc/systemd/system/docker.service.d/http-proxy.conf && systemctl daemon-reload && systemctl restart docker
```
