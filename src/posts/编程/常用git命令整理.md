---
title: "常用git命令整理"
date: 2024-05-07
description: ""
tags: ["git"]
categories: ["${folder}"]
---

# 初始化与配置

### `ssh-keygen`
 - 作用：生成密钥文件，用于连接远程仓库
```bash
ssh-keygen -t rsa -C "你的GitHub注册邮箱"
```
 - 密钥默认存储路径：`C:\Users\<user>\.ssh`

### `git config`  
 - 作用：配置 Git 的全局或本地参数（如用户名、邮箱）。  
 - 示例：  
```bash
git config --global user.name "YourName"             # 全局配置用户名
git config --global user.email "email@example.com"   # 全局配置邮箱
```
 - 注意：`--global` 表示全局生效，省略则仅对当前仓库生效 。

### `git init`  
 - 作用：初始化当前目录为 Git 仓库，生成隐藏的 `.git` 文件夹。  
 - 示例：  
```bash
git init           # 初始化当前目录
git init newDir    # 在指定目录 newDir 中初始化仓库
```
 - 场景：用于从零开始创建本地仓库 。


# 状态管理

### `git status`  
 - 作用：显示工作目录和暂存区的文件状态（如未跟踪、已修改）。  
 - 示例：  
```bash
git status      # 显示完整状态
git status -s   # 显示简洁状态（如 M-修改、A-新增、??-未跟踪）
```
 - 场景：确认哪些文件需要提交或暂存 。

### `git diff`  
 - 作用：比较文件修改内容。  
 - 示例：  
```bash
git diff           # 比较工作区与暂存区的差异
git diff --cached  # 比较暂存区与最新提交的差异
git diff HEAD      # 比较工作区与最新提交的差异
```
 - 场景：查看未提交的具体改动 。



# 提交与推送
### `git add`  
 - 作用：将文件添加到暂存区，准备提交。  
 - 示例：  
```bash
git add .               # 添加所有修改和新文件
git add *.js            # 添加所有 .js 文件
git add -u              # 仅添加已跟踪文件的修改
```
 - 场景：选择性暂存文件以分批次提交 。

### `git commit`  
 - 作用：将暂存区的修改提交到本地仓库。  
 - 示例：  
```bash
git commit -m "Fix login bug"   # 提交并添加描述
git commit -am "Quick fix"      # 跳过 `git add`，直接提交已跟踪文件的修改
```
 - 注意：`-a` 参数仅对已跟踪文件生效 。

### `git push`  
 - 作用：推送本地提交到远程仓库。  
 - 示例1：
```bash
git push -u origin main       # 首次推送并建立追踪关系
git push origin main          # 推送本地 main 分支到远程
git push --force              # 强制覆盖远程提交（可简化为-f）
```

 - 示例2：首次推送并建立追踪关系
```bash
git remote add origin <远程仓库地址>      # 关联远程仓库（仅首次）
git add -A                              # 添加所有修改到暂存区
git commit -m "init"                    # 提交到本地仓库
git push -u origin main                 # 推送并设置上游分支
```

 - 示例3：后续更新推送
```bash
git add -A                  # 添加所有修改到暂存区
git commit -m "update"      # 提交到本地仓库
git push origin main        # 推送到远程仓库
```

**后续更新推送简化命令**

```bash
git add -A && git commit -m "update" && git push
```

 - 场景：分享代码或同步远程仓库 。

### `git log`  
 - 作用：查看提交历史记录。  
 - 示例：  
```bash
git log              # 显示完整提交历史
git log --oneline    # 单行显示提交信息
git log -p           # 显示具体修改内容
```
 - 场景：追溯代码变更或定位问题 。



# 分支管理
### `git branch`  
 - 作用：管理分支（创建、删除、查看）。  
 - 示例：  
```bash
git branch              # 查看本地分支
git branch -a           # 查看所有分支（本地+远程）
git branch dev          # 创建 dev 分支
git branch -d dev       # 删除已合并的 dev 分支
git branch -D dev       # 强制删除未合并的分支
```
 - 场景：并行开发不同功能或修复 。

### `git checkout` / `git switch`  
 - 作用：切换分支或恢复文件。  
 - 示例：  
```bash
git checkout dev                  # 切换到 dev 分支
git checkout -b feature           # 创建并切换到 feature 分支
git checkout HEAD~2 file.txt      # 恢复文件到前两次提交的版本
```
 - 注意：`git switch` 是更语义化的替代命令 。

### `git merge`  
 - 作用：合并指定分支到当前分支。  
 - 示例：  
```bash
git merge dev       # 将 dev 分支合并到当前分支
git merge --no-ff   # 强制生成合并提交（避免快进合并）
```
 - 场景：集成已完成的功能分支 。


# 远程仓库操作
### `git remote`  
 - 作用：管理远程仓库关联。  
 - 示例：  
```bash
git remote add origin <url>           # 关联远程仓库
git remote -v                         # 查看远程仓库 URL
git remote set-url origin <new_url>   # 更新远程仓库地址
```
 - 场景：配置协作开发的远程代码源 。

### `git clone`  
 - 作用：克隆远程仓库到本地，支持多种协议（SSH、HTTPS、GIT）。  
 - 示例：  
```bash
git clone git@github.com:user/repo.git             # 使用 SSH 协议克隆
git clone https://github.com/user/repo.git myDir   # 克隆到指定目录 myDir
```
 - 场景：快速获取远程代码库并建立本地副本 。

### `git pull`  
 - 作用：拉取远程分支并合并到当前分支（相当于 `git fetch` + `git merge`）。  
 - 示例：  
```bash
git pull origin main    # 拉取远程 main 分支并合并
git pull --rebase       # 使用 rebase 代替合并（保持提交历史线性）
```
 - 注意：频繁使用可避免代码冲突 。

 - 示例：
```bash
git reset --hard    # 回退到最后一次提交
git pull            # 拉取远程分支的更新，并尝试和当前分支合并
```
### `git fetch`
 - 作用：拉取远程仓库的最新代码

 - 实例：
```bash
git fetch origin                # 拉取当前仓库对应的远程仓库的最新代码
git reset --hard origin/main    # 强制将远程对应分支覆盖本地当前分支
```

# 撤销与恢复
### `git reset`  
 - 作用：回退到指定提交状态，支持不同模式：  
 - `--soft`：保留工作区和暂存区修改。  
 - `--mixed`（默认）：保留工作区修改，重置暂存区。  
 - `--hard`：丢弃所有修改。  
 - 示例：  
```bash
git reset HEAD~1         # 回退到前一次提交（保留修改）
git reset --hard HEAD~3  # 强制回退到前三次提交（丢失所有修改）
```
 - 场景：撤销未提交的修改或错误提交 。

### `git stash`  
 - 作用：临时保存未提交的修改，恢复工作目录到干净状态。  
 - 示例：  
```bash
git stash              # 保存当前修改
git stash list         # 查看暂存列表
git stash pop          # 恢复最近一次暂存的修改并删除记录
```
 - 场景：快速切换分支处理紧急任务 。



# 其他实用命令
- `git tag`：为提交打标签（常用于版本发布）。  
- `git rebase`：变基操作，重写提交历史（需谨慎使用）。  
- `git cherry-pick`：选择性地应用某次提交到当前分支。  
- `git reflog`：查看所有操作记录（包括已删除的提交）。
