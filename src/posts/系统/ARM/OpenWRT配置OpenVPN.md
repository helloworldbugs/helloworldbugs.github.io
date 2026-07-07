---
title: "原版OpenWRT配置OpenVPN"
date: 2025-03-31
description: "1. 安装OpenVPN以及所需工具"
tags: ["openvpn", "openwrt"]
---

## 证书密钥文件生成

### 环境准备
1. **安装OpenVPN以及所需工具**
```bash
opkg update
opkg install luci-app-openvpn
opkg install openvpn-openssl
opkg install openvpn-easy-rsa
```

### 服务端证书生成
#### 1. 初始化PKI目录
```bash
cd /etc/openvpn
```
```bash
easyrsa init-pki
```

#### 2. 生成根证书（CA）
```bash
easyrsa build-ca nopass
```

#### 3. 生成服务端证书及私钥
```bash
easyrsa build-server-full server nopass
```

#### 4. 生成客户端证书及私钥
```bash
easyrsa build-client-full client1 nopass
```
>后续新增用户只需修改client1为不同名称（如client2、client3）

#### 5.生成Diffie-Hellman参数

>此过程耗时较长（约10-30分钟）

```bash
easyrsa gen-dh
```

#### 6. 证书文件位置说明
```
├── pki/
│   ├── ca.crt          # CA根证书
│   ├── dh.pem          # DH参数文件
│   ├── issued/
│   │   ├── server.crt  # 服务端证书
│   │   └── client1.crt # 客户端证书
│   └── private/
│       ├── server.key  # 服务端私钥
│       └── client1.key # 客户端私钥
```
### 客户端配置文件生成

在shell执行

```
cat > client1.ovpn <<EOF
client
dev tun
proto udp
remote <服务器地址> 1194
resolv-retry infinite
nobind
persist-tun
remote-cert-tls server
verb 3
comp-lzo yes

# 嵌入证书内容
<ca>
$(cat /etc/openvpn/pki/ca.crt)
</ca>
<cert>
$(cat /etc/openvpn/pki/issued/client1.crt)
</cert>
<key>
$(cat /etc/openvpn/pki/private/client1.key)
</key>
EOF
```
目录下可以看到一个`client1.ovpn`文件，这个就是客户端用来连接的文件，导出到本地进行妥善保存。

## OpenWRT配置

### OpenVPN配置

选择一个`模板`新建一个配置，点击右边`编辑`进入配置

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image-3.png -->

左上角切换到`高级配置`设置界面，切换到`配置分类-VPN`页面

在左下角的`--更多选项--`选择并添加一个`push`选项，用来配置推送内网网段的路由

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image-4.png -->

再添加一个`client-to-client`选项，并且勾上，表示允许vpn客户端之间互相访问

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image-2.png -->

最后切换到`加密算法`页面，按照上面生成的文件选择好

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image-5.png -->

### 防火墙配置

`防火墙-常规设置-区域` 新添加一个`区域` 配置放行区域和转发

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image.png -->

<!-- img: /assets/images/posts/系统/ARM/OpenWRT配置OpenVPN/image-1.png -->

到这里配置基本完成，可以用客户端进行连接测试了
