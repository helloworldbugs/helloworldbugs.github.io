---
title: "Hexo从GitHub迁移到GitLab"
date: 2024-04-30
categories: ["web"]
description: "原本用github搭建的hexo，后来听说gitlab更合适hexo，能实现云端编译、私有库page公开、搜索引擎收录、节点较快等等一系列优点，于是改用gitlab。网上的教程质量也是参差不齐，于是自己整理一番"
tags: ["hexoH"]
---

# 前言

原本用github搭建的hexo，后来听说gitlab更合适hexo，能实现云端编译、私有库page公开、搜索引擎收录、节点较快等等一系列优点，于是改用gitlab。网上的教程质量也是参差不齐，于是自己整理一番

# GitLab Pages简介与GitHub Pages对比
GitLab与Github类似，而且对开源社区更友好，很多大型开源项目，如GNOME、Debian都在向GitLab迁移。GitLab每个代码库空间限制为10G，文件大小不限，仓库数量不限，包括私有仓库的数量；需注意的是GitLab CI/CD 限制仓库大小1G，单文件100M，GitLab Pages因为要使用CI/CD也受此限制 。作为对比，Github每个代码库空间软性限制1G，单文件100M，且私有仓库为付费项目。

与Github中类似，任何项目都可开启项目页面(Project Page)，但普通项目开启页面后访问网址为 `https://username.gitlab.io/projectpath`；只有路径为`username.gitlab.io`的项目的页面才直接对应于网址`https://username.gitlab.io`，也被称为用户页面(User Page)。所谓项目路径默认即为项目名称，但不同于Github，GitLab中项目的名称可以与路径不同。

但GitLab中建立Pages的思路与GitHub完全不同。对于Github，使用Hexo的流程为，首先在本地安装各种Hexo插件，之后运行Hexo generate在本地生成各种页面，最后再执行Hexo deploy部署到远程，就可以访问了。整个过程无需git操作，在_config.yml中设置好仓库并配置好SSH密钥，Hexo会自动调用Git进行操作，git目录是位于博客目录下的.deploy_git。

而对于GitLab，由于其提供了基于Docker的持续集成/持续部署(CI/CD)服务，上述所有操作都可以在云端实现，而无需本地操作，包括插件安装都在云端完成。而为此需要配置一个名为.gitlab-ci.yml的文件，告诉GitLab所需要执行的操作，内容为执行的脚本及处理的文件等。整个过程本地完全无需hexo generate和hexo deploy，而是将博客源文件作为git管理的代码，完全使用git操作。将博客目录推送到GitLab上后，会由一个名为GitLab-Runner的程序在云端根据.gitlab-ci.yml的内容处理你的源文件。与在本地类似，这个过程需要需要2-3分钟。

使用时，最好在本地修改好后再push，类似于先在本地做好代码的调试，再推送到代码库，而不要频繁修改推送(可以在本地多次commit，然后一次性push)。因为每次推送都会自动触发Runner对文件的处理，由于是免费公共资源，短时间内使用次数太多，会出现排队，需等待较长时间。为了实时查看效果，方便编辑，可以在本地hexo s来预览，只是不要在本地执行Hexo g -d。

总结起来就是：Github需要在本地手动执行Hexo，生成并部署网页；而GitLab则只需提供源文件，在云端自动生成及部署。

两种思路其实各有优劣：

 - GitHub的方式，需要用户在本地安装Node.js、Hexo及相关插件，但是操作完全在本地，更加直观。而且整个过程只需要使用基本的Hexo命令，不需要了解太深入的Git知识，对于一般用户更友好。不好的是最终推送到代码库中的内容是Hexo处理生成的网页，而并非源文件，不符合Git管理源代码的思路。
 - GitLab的方式，Hexo对文件的处理部署都在云端执行，不是很直观。用户甚至不需要在本地安装任何Node.js、Hexo的东西，当然为了方便预览、编辑，还是装上了比较好。整个操作完全由Git完成，需要用户熟悉Git的用法，其思路本质就是Git管理源码的思路，最终仓库内容与本地源文件一致。

 # gielab配置

新建一个`私有项目`，命名方式要和GitHub上搭建hexo一样，`username.gitlab.io`，然后有几个需要注意的地方

- 打开pages所有人访问

![](/images/posts/Hexo%E4%BB%8EGitHub%E8%BF%81%E7%A7%BB%E5%88%B0GitLab/image.png)

因为项目是私密的，不能让别人看到源文件，但是可以对所有人开放pages权限，这样就不影响他人阅读，但是无法拷贝项目源文件下来

- 关闭随机域

![](/images/posts/Hexo%E4%BB%8EGitHub%E8%BF%81%E7%A7%BB%E5%88%B0GitLab/image-1.png)

如果不关闭这个，访问的时候域名末尾会自动加上一串随机字符，导致加载速度变慢、图片链接失效等情况

- 关闭分支保护

![](/images/posts/Hexo%E4%BB%8EGitHub%E8%BF%81%E7%A7%BB%E5%88%B0GitLab/image-2.png)

如果不关闭这个分支保护，会导致push不成功

## CI/CD配置文件

hexo项目根目录创建一个名为 `.gitlab-ci.yml` 的文件
```
image: node:20.12.2

cache:
paths:
    - node_modules/

before_script:
- npm install hexo-cli -g
- test -e package.json && npm install
- hexo generate

pages:
script:
    - hexo generate
artifacts:
    paths:
    - public
only:
    - main

```
第一行的`node:xx`写上自己本地的node.js版本号，我这里是20.12.2，最后一行的`main`是分支名称

# 推送发布

```
git init
git add -A
git commit -m "update"
git remote add origin git@gitlab.com:helloworldbugs/helloworldbugs.gitlab.io.git
git push -u origin main -f
```

如果已经不是第一次推送，就可以用以下命令一键梭哈

```
git add -A && git commit -m "update" && git push
```

在推送成功后，GitLab便会自动开始处理博客，等待2-3分钟即可，可到CI/CD下查看任务进度情况。任务完成后便可通过`username.gitlab.io`访问博客页面。

>注意：之后添加博客文件都应直接采用git的管理方式，而不能使用`hexo g -d`。

# 问题及解决

- 对于GitLab，如果仍按照Github的方式操作，会遇到CI/CD的脚本执行失败，无法生成页面；如果选择.gitlab-ci.yml为HTML可以部署成功，但页面没有主题，显示混乱。因此换到了GitLab就按照GitLab的思路操作，不要在本地执行Hexo g -d，用git管理文件(可以在本地Hexo s预览)。

- GitLab会在云端执行hexo g 后自动部署，无需在.gitlab-ci.yml中写入hexo d，因此可以在博客设置_config.yml中将deploy部分直接注释掉。当然不注释也没事，这些行不会起作用。
- 整个博客目录下的.gitignore中包含有node_modules/、public/、.deploy*/目录，git push 时会自动忽略这些目录，推送到远程的只有scaffolds、source、themes目录下内容。

- NexT主题的下的.gitignore中包含有外部库source/lib/*目录，因此git push时会忽略这些外部依赖库，比如facybox。最终会造成远程仓库不含这些依赖库，博客显示异常，注意移除这部分内容。

- 此外如果使用git clone 的方式下载的主题或外部库时，比如fancybox，需要手动删除对应的.git目录，因为在.git目录下最好不要出现.git目录，会提示 warning: adding embedded git repository: ....

上述两个问题会造成NexT主题开启fancybox后，博客页面一片空白，无法正常显示。

- 对于Hexo插件：直接在本地目录下安装插件后，package.json会自动修改，包含相应插件。因此直接在本地安装好全部扩展后，虽然node_modules/不会上传到远程仓库，但在CI/CD时npm install 会根据package.json文件内容自动安装全部所需插件及相关依赖，无需在.gitlab-ci.yml中一行行安装。

- GitHub情况下，由于是在本地执行 hexo g -d ，对于软链接图片，会沿着链接找到原始图片资源，将其复制到要推送的public目录，并推送到仓库；对于GitLab，则是先推送再执行 hexo g ，推送到云端的只是一个链接文件(夹)，没有原始资源，最终不仅仅是图片无法显示，而是会在没有任何错误提示的情况下致使静态网页无法生成。
