---
title: "Proxmox VE"
date: 2024-05-30
description: "实测在v8-v9.0.5测试成功"
tags: ["pev"]
---

### 存储策略和分区调整

>适合新部署pve的时候做的调整

删除分区

```
lvremove pve/data
```

扩容到根分区

```
lvextend -l +100%FREE -r pve/root
```

### 去除未订阅提示

适用版本：v6-v9

>ps:不要使用pvetools工具的去除订阅提示功能，会有系统级的bug，导致系统不稳定，频繁卡死

备份
```
cp /usr/share/pve-manager/js/pvemanagerlib.js /usr/share/pve-manager/js/pvemanagerlib.js.backup
```
```
cp /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js.backup
```
修改前端文件

```
sed -i_orig "s/data.status === 'Active'/true/g" /usr/share/pve-manager/js/pvemanagerlib.js
```

```
sed -i_orig "s/if (res === null || res === undefined || \!res || res/if(/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
```

```
sed -i_orig "s/.data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
```
重启页面
```
systemctl restart pveproxy
```


### 显示硬件健康信息

实测在v8-v9.0.5测试成功

直接执行以下命令，脚本 fork 自原 GitHub 项目：[PVE-manager-status](https://github.com/a904055262/PVE-manager-status)

我进行过修改，适配了pve9.0的订阅弹窗去除

```
curl -Lf -o /tmp/temp.sh https://raw.githubusercontent.com/helloworldbugs/PVE-manager-status/refs/heads/main/showtempcpufreq.sh && chmod +x /tmp/temp.sh && /tmp/temp.sh remod
```

效果图如下：

<!-- img: /assets/images/posts/系统/linux/ProxmoxVE/image.png -->

没有显示功耗的，请执行下面的命令安装依赖，请确保安装成功，就是最后的一行的输出，必须为 “成功!” 才表示安装成功了

```
apt update && apt install linux-cpupower modprobe msr && echo msr > /etc/modules-load.d/turbostat-msr.conf && chmod +s /usr/sbin/turbostat && echo 成功！
```

### pve修改id和名称


#### kvm虚拟机ID修改

1. 关闭需要更改 ID 的虚拟机
2. 重命名配置文件名，以及修改配置文件的硬盘位置（共2处）。
```
cd /etc/pve/nodes/PVE/qemu-server/
```
3. 重命名硬盘文件名以及目录
```
cd /var/lib/vz/images
```
4. 重命名备份文件
```
cd /var/lib/vz/dump
```

#### lxc容器ID修改

1. 关闭需要更改 ID 的lxc容器
2. 重命名配置文件名，以及修改配置文件​内容
```
cd /etc/pve/nodes/PVE/lxc/
```
3. 修改存储卷路径
```
cd /var/lib/vz/images/
```
4. 重命名备份文件
```
cd /var/lib/vz/dump
```

#### lxc容器名称修改

```
/etc/pve/lxc/<容器id>.conf
```
```
/var/lib/lxc/<容器id>/config
```

### pvetools问题

#### pvetools开启过CPU省电后 取消省电后不能睿频了

1.  编辑文件 `vi /etc/default/grub`
    
2.  删除这行 `GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_pstate=disable"intel_pstate=disable`
    
3.  然后再执行`update-grub`进行更新保存
    

### 解决60秒的硬超时

主要解决在为虚拟机添加大容量磁盘的时候报错

```
vim /usr/share/perl5/PVE/Cluster.pm
```

定位到`alarm(60)` ，将60更改为您想要的任何超时，数字单位是秒。 然后重启pve系统

可以在web管理界面选择禁用或者启用自动更新

# 幽灵文件占用ID无法使用

**现象**

某个id无法使用，但是在配置文件目录看不到文件，也无法新建覆盖

**原因**

`/etc/pve` 不是本地磁盘目录，而是由 `pmxcfs（Proxmox Cluster File System）`挂载的 FUSE 文件系统。`pve-cluster` 服务负责管理 `pmxcfs`。而 `/etc/pve` 目录下的文件是由 `/var/lib/pve-cluster/config.db` 这个 SQLite 数据库文件映射的。
 
**解决办法**

如果发现幽灵文件异常占用，可以编辑`/var/lib/pve-cluster/config.db`文件

```
sqlite3 /var/lib/pve-cluster/config.db
```
查找异常数据
```
sqlite> SELECT * FROM tree WHERE name like '113%';
```
删除异常数据
```
sqlite> DELETE FROM tree WHERE name='113.conf';
```
然后重启 `pve-cluster` 即可解决。
```
systemctl restart pve-cluster
```
