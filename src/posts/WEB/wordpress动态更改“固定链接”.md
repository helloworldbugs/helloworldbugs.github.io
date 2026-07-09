---
title: "wordpress动态更改“固定链接”"
date: 2024-05-13
categories: ["${folder}"]
description: ""
tags: ["wordpress"]
---

# 问题
wordpress有两个固定链接，定义了站点的访问url，以及各种媒体文件的超链接等。当我们是用动态公网ip来访问wordpress的时候，因为是动态ip的缘故，公网ip可能会一直变，但是这个wordpress的固定链接不会变，就会导致我们的公网ip每变一次，就访问不了wordpress，然后就要上数据库去改那两个固定链接对应的字段（wp_options数据库的siteurl和home字段）。这样对我们这些家庭服务器玩家来说也太不友好了，这该怎么办呢？


# 固定链接关系阐述
WordPress地址（URL）
是WordPress文件和文件夹存储的地址，包括您的管理页面，插件，主题，媒体文件，媒体文件的超链接等。对应wp_options数据库内“option_name”的“siteurl“字段。

站点地址（URL）
是您网站的面向公众的部分。这是您的访问者将输入的内容，以访问您的网站。对应wp_options数据库内“option_name”的“home“字段。

WordPress程序文件安装在子目录aaa下，那么WordPress地址应填写为https://xxx.com/aaa，访问网址可以是https://xxx.com，那么站点地址应填写为https://xxx.com。

# 解决办法
编辑wordpress项目的option.php文件

```
vim /var/www/html/wp-includes/option.php
```
在最上方添加如下代码
```
function get_option( $option, $default = false ) {             //自己写一个get_option函数
    $my_option=my_get_option($option,$default);             //调用原来的函数
    if($option=="siteurl" || $option == "home"){            //针对siteurl和home做修改，其他不变
        if($_SERVER['HTTP_HOST']!="www.xxx.cn"){         //如果不是用域名访问的
        $my_option="http://".$_SERVER['HTTP_HOST']; //就跳转到当前URL里的服务器地址，比如本地的localhost或局域网访问的192.168.1.100
        }
    }
    return $my_option;
}

function my_get_option( $option, $default = false ) { //更改第一行的get_option为my_get_option
```
![](/images/posts/wordpress%E5%8A%A8%E6%80%81%E6%9B%B4%E6%94%B9%E2%80%9C%E5%9B%BA%E5%AE%9A%E9%93%BE%E6%8E%A5%E2%80%9D/image.png)

这样就可以实现，每次访问wordpress，wordpress就会自动检测请求头的host字段ip，然后跟着host请求头里的ip更改那两个固定链接，这样这两个烦人的固定链接就会动态的跟着我们的公网ip变化而自动变化了

# 遗留问题
后来我又发现一个问题，就是文章里的媒体文件（如图片）是用超链接显示的，媒体文件的超链接里的ip不会自动变化，文章的图片会因为ip的变动而失效，影响阅读。目前我还没有想到很好的解决办法。
