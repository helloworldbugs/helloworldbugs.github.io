---
title: "自签名ssl证书并配置https"
date: 2024-05-14
categories: ["web"]
description: "SSL证书有多种格式："
tags: []
---

# 证书格式

SSL证书有多种格式：

1. Apache、Nginx等，使用OpenSSL提供的密码库，生成pem、key、crt等格式的证书文件。
2. Tomcat、Weblogic、JBoss等，使用Java提供的密码库。通过Java的Keytool工具，生成Java Keystore（jks）格式的证书文件。

`常用证书格式信息：`

 - *.der，*.cer，*.crt 以二进制形式存放证书，只有公钥，不包含私钥。
 - *.csr 证书请求，这个是需要发给CA用来签名正式证书用的。
 - *.pem 一般是文本格式，可以放证书或私钥，或者两者都包含。 *.PEM如果只包含私钥，那一般用 *.KEY代替。
 - *.pfx，*.p12 是二进制格式，同时含证书和私钥，一般有密码保护。

# 生成证书

在linux环境下，需要openssl依赖，键入以下命令。

```
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /etc/ssl/private/ssl-cert-snakeoil.key -out /etc/ssl/certs/ssl-cert-snakeoil.crt
```

命令解释

 - openssl：这是用于创建和管理OpenSSL证书，密钥和其他文件的基本命令行工具。

 - req：此子命令指定我们要使用X.509证书签名请求（CSR）管理。“X.509”是SSL和TLS为其密钥和证书管理所遵循的公钥基础结构标准。因为我们想要创建一个新的X.509证书，所以我们使用这个子命令。

 - -x509：这通过告诉实用程序我们要创建自签名证书而不是生成证书签名请求来进一步修改上一个子命令。

 - -nodes：这告诉OpenSSL跳过用密码保护我们的证书的选项。我们需要中间件在服务器启动时能够在没有用户干预的情况下读取文件。

 - -days 3650：此选项设置证书有效的时间长度。我们在这里设置了10年。

 - -newkey rsa:2048：这指定我们要同时生成新证书和新密钥。我们没有创建在上一步中签署证书所需的密钥，因此我们需要将其与证书一起创建。rsa:2048部分告诉它制作一个2048位长的RSA密钥。

 - -keyout：这一行告诉OpenSSL在哪里放置我们正在创建的生成的私钥文件。

 - -out：这告诉OpenSSL在哪里放置我们正在创建的证书。


最重要的一行是请求 `Common Name (e.g. server FQDN or YOURname)` 的这行。您需要输入与服务器关联的域名或公网IP。

您创建的两个文件都将放在 `/etc/ssl` 目录下。

# 配置证书

## nginx配置ssl证书

修改配置文件 `/etc/nginx/sites-available/default`的server段
```
server {
    listen 800 ssl;
    listen [::]:800 ssl;
    error_page 497 https://$host:800$request_uri; #http强制重定向到https

    ssl_certificate  /etc/ssl/certs/ssl-cert-snakeoil.crt;  #证书路径
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;  #私钥路径

}

```
## apache配置ssl证书

使用 `a2enmod` 命令启用 `mod_sslApache SSL` 模块，如果要关闭ssl则是执行：`sudo a2enmod ssl` 命令：

```
sudo a2enmod ssl
```

使用a2ensite命令启用SSL主机：

```
sudo a2ensite default-ssl
```

修改apache配置文件，将 `SSLCertificateFile` 和 `SSLCertificateKeyFile` 这两行的路径更改为实际的证书位置路径，如下图所示。

```
vim /etc/apache2/sites-available/default-ssl.conf
```


![alt text](/assets/images/posts/WEB/image.png)


启用我们的ssl-params.conf文件，读入我们设置的值：

```
sudo a2enconf ssl-params
```

检查配置是否无误，如果输出中包含输出 `Syntax OK` ，则表示配置文件没有语法错误

```
sudo apache2ctl configtest
```

接下来重启Apache以实现我们的更改：

```
sudo systemctl restart apache2
```
