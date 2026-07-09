---
title: "GitHub搭建Hexo"
date: 2024-04-29
categories: ["${folder}"]
description: ""
tags: ["hexoH"]
---

# 前言

随着我的WordPress博客内容越写越多，对稳定性要求越来越高，自己的个人服务器上的也不晓得什么时候会暴毙，思虑再三下，决定把博客迁移到GitHub上，以hexo搭建一个静态博客，只要GitHub不倒，我的博客就不会倒，这样就永生不灭了。

# 环境准备

1. git

<https://git-scm.com/downloads>

```
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub注册邮箱"
```

生成密钥文件

```
ssh-keygen -t rsa -C "你的GitHub注册邮箱"
```

密钥生成路径在：`C:\Users\<user>\.ssh`

**打开GitHub配置keys**

<https://github.com/settings/keys>

点右上角新建个keys，然后把`id_rsa.pub`这个公钥文件的内容粘贴进去就行

![](/images/posts/GitHub%E6%90%AD%E5%BB%BAHexo/image-1.png)

**测试**

```
ssh -T git@github.com
```

2. node.js

<https://nodejs.org/en/download/current>

直接默认安装就好


# hexo部署

1. 在线GitHub配置

新建个公开仓库，命名方式有规范,

必须是`<github_name>.GitHub.io`

2. 本地hexo配置

```
npm install hexo-cli -g	# 通过npm安装hexo命令包
hexo init blog				# 新建名为blog的Hexo项目骨架并初始化
cd blog						# 进入项目目录
npm install					# 根据项目根目录下的package.json，安装所有必须的Node.js依赖包
```

3. 安装自动部署

```
npm install hexo-deployer-git --save
```
>`--save` 加不加的区别在于是否写入到依赖文件`package.json`中

**hexo常见命令汇总**

```
npm install hexo -g #安装Hexo
npm update hexo -g #升级
hexo init #初始化博客
```

```
命令简写
hexo n "我的博客" == hexo new "我的博客"	#新建文章
hexo g == hexo generate	#生成本地静态文件
hexo s == hexo server	#启动本地服务预览
hexo d == hexo deploy	#部署
```

hexo server相关命令
```
hexo server #Hexo会监视文件变动并自动更新，无须重启服务器
hexo server -s #静态模式
hexo server -p 5000 #更改端口
hexo server -i 192.168.1.1 #自定义 IP
hexo clean #清除网页缓存
```

## hexo配置文件

需要修改配置文件`_config.yml`,在blog根目录

1. 修改`title:`为你的博客名称

2. 修改`language: zh-CN`

3. 修改：`url:` 字段为你的博客域名，格式为`https://<GitHub_name>.github.io`

4. 在文件最底部添加以下信息

```
deploy:
type: git
repo: <这里填博客的GitHub仓库https链接，也可以用ssh的方式填>
branch: main
```

## 测试

```
hexo g  //生成本地静态文件
hexo s  //启动本地服务预览
```

访问本地的4000端口：<http://localhost:4000>

测试通过以后就可以开始写文章了，文章目录：`hexo\blog\source\_posts`

## 推送发布

```
hexo clean	//清除网页缓存
hexo g		//生成本地静态文件
hexo d		//推送发布
```

正常本地预览，直接执行`hexo s`,如果要发布话最好先执行`clean`命令，会去删除生成的`public`文件，完整部署命令: `hexo clean && hexo g && hexo d`。或者直接 `hexo d -g`

# 优化配置

## 图片配置

1. 配置文件

hexo的图片默认不能用md自带的语法进行本地解析，需要打开配置文件`_config.yml`

修改`post_asset_folder` 默认是`fales`，改为`true`就行

![](/images/posts/GitHub%E6%90%AD%E5%BB%BAHexo/image-2.png)

2. 添加插件

安装插件`hexo-asset-image`

```
npm install https://github.com/xcodebuild/hexo-asset-image.git --save
```


以后每次新建文章都会在`_posts`目录下新建一个同名文件夹，把图片丢在那个文件夹里，然后再在markdown文件里引用他就好了


## 设置VS Code 中 Markdown粘贴图片的位置

PS

>使用VS Code中的 `markdown.copyFiles.destination` 配置项，可以设置粘贴图片的位置。

VS Code内置了markdown编辑器非常好用，但是默认情况下，VS Code会将粘贴的图片放在markdown文件的同级目录下，这样不符合hexo的规范，hexo的文章无法链接到图片。

其实只需要简单的设置一下，就可以解决这个问题，省略很多不必要的步骤。

1. 在VS Code中，按下`Ctrl + ,`，打开设置界面。
2. 在搜索框中输入`markdown copy`, 找到`Markdown> Copy Files:Destination`位置
3. 新增配置项 key 为 `**/*.md`, value 为 `${documentBaseName}/${fileName}`

>其中 `${documentBaseName}` 表示markdown文件的文件名，`${fileName}` 表示图片的文件名。


![](/images/posts/GitHub%E6%90%AD%E5%BB%BAHexo/image-3.png)

这样以后每次写hexo文章都只需要将图片图片直接在VS Code里粘贴就可以了。

## 自动生成 categories

### 插件说明

`hexo-directory-category` 插件，它根据每个帖子的文件夹结构自动生成类别。

最常用的文件管理策略，就是利用文件系统目录结构(树形结构 directory-tree)。
同样，为了便于管理大量的日志文件，采用目录结构是一种简便可行的方案。hexo-auto-category根据日志文件(Markdown)所在文件目录自动分类，即自动生成markdown的front-matter中的categories变量。
>同样效果的还有[hexo-auto-category](https://github.com/xu-song/hexo-auto-category)插件。这个插件知名度最高，但是这个插件年久失修，已经近乎失效了。还有功能更齐全的[hexo-enhancer](https://github.com/sisyphsu/hexo-enhancer)插件，这个插件可以生成所有的Front-matter，可自行测试。

### 示例

对于博客 source/_post/web/framework/hexo.md，该插件会自动生成以下categories

```
categories:
- web
- framework
```

### 安装

```
npm install hexo-directory-category --save
```

在站点根目录下的_config.yml添加：

```
auto_dir_categorize:
	enable: true    # 启用插件。默认为 true 。
	force: false    # 覆盖文章的前题类别，即使它有选项类别。默认为 false。
```

## 域名配置

1. 添加 `CNAME` 文件位于目录 `/source` 下，文件内容为hexo的域名
2. 添加域名解析 `CNAME` 类型到hexo的域名
3. GitHub配置 `Settings->Pages->Custom domain` 添加hexo的域名
   
## 其它说明

 - Hexo 默认会把 `source/` 目录下的“非可渲染”文件（例如图片、HTML、配置文件等）原样拷贝到 `public/`目录下，
 - `source/` 目录下的可渲染文件（例如Markdown文件）会被渲染成HTML文件并保存在 `public/` 目录下
 - `public/` 目录下的文件会被部署到 GitHub Pages

所以，如果有本地服务器解析的需求，配置了 `web.config`以及`.htaccess` 等配置文件在`public/`目录下。执行`hexo clean && hexo g`后，会先把`public/`目录删除后重新生成，本地配置的文件会失效。可以把需要配置的文件复制到 `source/` 目录下。这样，每次运行 `hexo d` 命令时，都会从`source/`目录下把配置文件复制到`public/`目录。
