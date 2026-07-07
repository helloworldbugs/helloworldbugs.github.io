---
title: "绕过CDN查找真实IP方法总结"
date: 2024-08-20
description: "传统访问：用户访问域名-->解析IP-->访问目标主机"
tags: []
---

## 0x00 CDN简述

> CDN全称ContentDeliveryNetwork，即内容分发网络，构建在现有网络基础之上的智能虚拟网络，依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等功能模块，使用户能够就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。百度百科

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/001-0.webp)

## 0x01 域名解析过程

*   传统访问：用户访问域名-->解析IP-->访问目标主机
    
*   简单模式：用户访问域名-->CDN节点-->真实IP-->目标主机
    
*   360网站卫士：用户访问域名-->CDN节点（云WAF）-->真实IP-->目标主机
    

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/002-0.webp)

**注：**目前市面上大多数的CDN服务商都提供了云WAF配置选项，内置了多种安全防护策略，可对SQL注入、XSS跨站、Webshell上传、后门隔离保护、命令注入、恶意扫描等攻击行为进行有效拦截。

## 0x02 CDN配置方法

*   将域名的NS记录指向CDN厂商提供的DNS服务器。  
     
    
*   给域名设置一个cname记录，将它指向CDN厂商提供的另一个域名。
    

## 0x03 CDN检测方法

利用“全球Ping”快速检测目标是否存在CDN，如果得到的IP归属地是某CDN服务商，或者每个地区得到的IP地址都不一样则说明可能存在CDN，可用以下几个网站检测！

```text-plain
https://wepcc.com
```

```text-plain
http://ping.chinaz.com
```

```text-plain
https://asm.ca.com/en/ping.php
```

**注：**全球Ping有一定机率可以得到目标服务器真实IP，因为有的CDN服务商可能没有某些地区的CDN节点。![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/003-0.webp)  
 

## 0x04 查找真实IP方法

**(1) phpinfo等探针找到真实IP**  
 

通过l.php、phpinfo.php等这类探针文件即可得到真实IP地址，phpinfo.php搜索SERVER\_NAME。

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/004-0.webp)

**(2) 网站根域或子域找到真实IP**

大部分CDN服务都是按流量进行收费的，所以一些网站管理员只会给重要业务部署CDN，也有很多人会忘了给顶级域名部署CDN，所以尽可能的多去搜集一些子域名能提高找到真实IP地址的机率。

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/005-0.webp)

**注：**有时多个子域名可能不会解析到同一台服务器，而是根据公司业务的重要与非重要性将子域名解析在内网或外网的不同服务器中，需要有一定的分析能力。

**(3) 利用邮件服务器找到真实IP**

Web和Email属同服务器时可以通过Email来查询目标真实IP地址，如果Web和Email属不同服务器时我们通过Email得到的可能只是邮件服务器的IP地址，所以在hosts文件中绑定真实IP后无法访问目标网站也属正常现象。常见发送邮件的功能有：注册用户、找回密码等。

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/006-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/007-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/008-0.webp)

  
 

**(4) 域名历史解析记录找到真实IP**

通过查询目标域名历史解析记录可能会找到部署CDN前的解析记录（真实IP地址），可以用以下几个网站来查询。

```text-plain
https://domain.8aq.net    //基于Rapid7 Open Data
```

```text-plain
https://x.threatbook.cn
```

```text-plain
https://webiplookup.com
```

```text-plain
https://viewdns.info/iphistory
```

```text-plain
https://securitytrails.com/#search
```

```text-plain
https://toolbar.netcraft.com/site_report
```

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/009-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/010-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/011-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/012-0.webp)

**(5) FOFA查询网站标题找到真实IP**

利用“FOFA网络空间安全搜索引擎”搜索目标网站源代码中的title标签内容即可得到真实IP地址。

```text-plain
title="*** ***** – Multi Asset Fund"
```

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/013-0.webp)

**(6) Censys查询SSL证书找到真实IP**

利用“Censys网络空间搜索引擎”搜索目标域名的SSL证书和HASH，https://crt.sh上查找他SSL证书的HASH，然后再用Censys搜索该HASH值即可得到真实IP地址。

```text-plain
443.https.tls.certificate.parsed.extensions.subject_alt_name.dns_names:***trade.com
```

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/014-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/015-0.webp)

![图片](/assets/images/posts/网安/应急响应/绕过CDN查找真实IP方法总结/016-0.png)

**(7) 通过分析目标C段来判断真实IP**

这种方法得看目标有多少子域名吧，如果子域够多，且又有多台服务器（同段），找一个没有部署CDN的子域名，然后扫描整个C段查找与目标站Title一致的即可找到他的真实IP地址！

  
 

目标站111.test.com解析在192.168.1.10，title：90sec社区，通过333.test.com子域名得到333真实IP地址192.168.1.12，然后扫描整个C段，当扫到192.168.1.10这个IP时发现一个title同为“90sec社区”的网站，域名也是111.test.com，这样就能确定192.168.1.10为真实IP了。

|     |     |     |
| --- | --- | --- |
| 网站域名 | 域名解析IP | CDN节点IP |
| 111.test.com（目标） | 192.168.1.10 | 8.8.8.8 |
| 222.test.com | 192.168.1.11 | 9.9.9.9 |
| 333.test.com | 192.168.1.12 | 没有CDN |

**(8) 自建CDN节点服务器找到真实IP**

这篇笔记当时没有记录下来，其实就是MS17-010刚出来时很多机器都还没打补丁，在批量过程中打了一台别人自建的CDN节点服务器，然后在里边发现很多解析到这边的IP地址，其实这些IP地址就是某些网站的真实IP，所以这也算是一种思路吧，但是得先拿到CDN节点服务器权限。或者可以通过DDOS攻击方式将其流量耗尽后即会显示真实IP，因为免费和自建CDN的流量都不会很多。  
 

**(9) 通过目标网站的漏洞找到真实IP**Web安全漏洞：XSS、SSRF、命令执行、文件上传等，但可能需要先绕过云WAF安全防护。

敏感信息泄露：Apache status、Jboss status、SVN、Github等敏感信息和网页源代码泄露。

  
 

**(10) 通过社工CDN控制台找到真实IP**  
 

通过社会工程学将搜集到的信息组合生成用户名和密码字典对CDN控制台进行爆破或者手工尝试，但是得在没有验证码和登录次数限制的情况下，然后找到他的真实解析IP地址。

**(11) Zmap全网扫描及F5 LTM解码法**

这两种方法都是前辈们以前写的，个人感觉较为复杂，并没有亲自实践过，不知是否真的可行？  
 

**注意事项：**部署CDN的网站有必要设置严格访问控制策略，仅允许CDN节点访问网站真实服务器80端口，这样设置的好处就是即使在hosts文件中绑定了真实IP后仍然无法访问。  
笔者曾经在一次渗透测试过程中就遇到过类似情况，就是成功绑定了真实IP后，虽然能够正常访问到目标网站，但是仍然没有绕过云WAF，具体情况有点记不太清了，当时没有去细研究这个问题！
