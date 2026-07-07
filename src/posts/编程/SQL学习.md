---
title: "SQL学习"
date: 2024-05-14
categories: ["编程"]
description: "- host – 指定该用户在哪个主机上可以登陆,如果是本地用户可用localhost, 如果想让该用户可以从任意远程主机登陆,可以使用通配符%"
tags: ["sql"]
---

# 用户操作

## 创建用户

```
create user '<用户名>'@'<host>' identified by '<密码>';
```

说明:
 - host – 指定该用户在哪个主机上可以登陆,如果是本地用户可用localhost, 如果想让该用户可以从任意远程主机登陆,可以使用通配符%
 - 如果想只让某个IP段的主机连接，可以修改为：`create user 'admin'@'192.168.100.%' identified by 'password';`

## 删除用户
```
drop user <用户名>; //默认情况下删除'username'@'%'
drop user '<用户名>'@'<host>'; //删除指定host的用户
```

## 修改用户密码
```
mysqladmin -u admin -h localhost -p password "password"
mysqladmin -u <user> -p <password>
```
# 授权
## 添加授权
```
grant all on <库名>.<表名> to '<用户名>'@'<host>';
```

## 撤销权限
```
revoke <权限> on <库名>.<表名> from '<用户名>'@'<host>';
```

## 查询某用户的授权情况
```
show grants for '<用户名>'@'<host>';
```

说明: 
 - 权限 – grant all为授予用户所有操作权限。可单独设置，如select , insert , update 等。
 - 授权 – 如果要授予该用户对所有数据库和表的相应操作权限则可用 * 表示, 如 *.*


## 刷新授权表
```
flush privileges;
```


# 创建库表

## 创建数据库
```
create database <库名>；
```
    
## 创建数据表
```
create table <库名>.<表名> (<字段1 数据类型>,<字段2 数据类型>,......)；
```

**示例：**

```
create table users (
id int auto_increment primary key,
username varchar(50) not null,
phone varchar(11) not null,
email varchar(100) not null,
birthdate date,
active boolean default true
);
```

**实例解析：**

 - id: 用户 id，整数类型，自增长，作为主键。
 - username: 用户名，变长字符串，不允许为空。
 - phone: 用户手机号，数字整数，最大11位。
 - email: 用户邮箱，变长字符串，不允许为空。
 - birthdate: 用户的生日，日期类型。
 - active: 用户是否已经激活，布尔类型，默认值为 true。


## 常见数据类型

<table>
<tr>
<td>数据类型</td>
<td>描述</td>
</tr>
<tr>
<td>id</td>
<td>INT AUTO_INCREMENT PRIMARY KEY，整数类型，自增长，作为主键</td>
</tr>
<tr>
<td>integer(size) </td>
<td rowspan="4">仅容纳整数。在括号内规定数字的最大位数。</td>
</tr>
<tr>
<td>int(size) </td>
</tr>
<tr>
<td>smallint(size) </td>
</tr>
<tr>
<td>tinyint(size) </td>
</tr>
<tr>
<td>decimal(size,d) </td>
<td rowspan="2">容纳带有小数的数字。size 规定数字的最大位数。”d” 规定小数点右侧的最大位数。</td>
</tr>
<tr>
<td>numeric(size,d) </td>
</tr>
<tr>
<td>varchar(size) </td>
<td>容纳可变长度的字符串（可容纳字母、数字以及特殊的字符）。</td>
</tr>
<tr>
<td>date(yyyymmdd) </td>
<td>容纳日期。</td>
</tr>
<tr>
<td>is_active</td>
<td>布尔类型，默认值为 true</td>
</tr>
</table>


# 增删查改

## 查

```
show databases; //查询当前空间下所有库
```

```
show tabses; //查询当前库下所有表
```

```
desc <表名>; //查询表的字段结构
```

```
select <值> from <库>.<表>; //查询某列值，可以写多个值，以逗号分隔；也可以用通配符“*”查询所有值。
```

```
select <值> from <库>.<表> where <值>=<值>; //查询某行值，where后跟上定位条件，和select查询的某列值形成and的关系。
```

## 增

```
insert into <库>.<表> (<列1>,<列2>) values (<'新值1'>,<'新值2'>，......);
```

## 改

```
update <库>.<表> set <列>=<'新值'> where <列>=<'值'>;
```

## 删

```
delete from <库>.<表> where <列>=<'值'>； //删除某行
```

```
delete from <库>.<表>; 或 delete * from <表>； //删除所有行
```

```
drop table <库>.<表>； //删除表
```

```
drop database <库>； //删除库
```


# 常见问题

## 解决3306无法远程连接问题

```
vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

将“bind-address = 127.0.0.1”这行注释

## 删除用户名为空的用户

以root账户登录MySQL，需输入root密码

```
mysql -u root -p
```

选择mysql库

```
use mysql;
```

删除账号为空账户

```
delete from user where User='';
```

刷新权限

```
flush privileges;
```

退出

```
exit
```
