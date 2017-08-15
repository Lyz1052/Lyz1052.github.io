---
title: XSS
date: 2017-06-08
tags: 
	- xss
	- 安全
categories: 
	- web
---
### DOM XSS
> https://www.acunetix.com/blog/articles/dom-xss-explained/

- 首先，我们需要了解什么是DOM（Document Object Model）。DOM是HTML中所有对象的展示模型，客户端执行的代码在任何时刻都可以通过DOM获取其运行环境文档的信息
- DOM XSS利用了某些不安全的脚本操作，这些脚本操作对某些DOM对象进行操作，而攻击者可以通过这些DOM对象创建出XSS攻击，特别是`document.url` `document.location` `document.referrer`这三个对象
- DOM XSS的典型例子
```
<html>
<head>
<title>Custom Dashboard </title>
...
</head>
Main Dashboard for
<script>
	var pos=document.URL.indexOf("context=")+8;
	document.write(document.URL.substring(pos,document.URL.length));
</script>
...
</html>

//预想结果
...
</head>
Main Dashboard for Mary
<script>
...

//攻击方式
http://www.example.com/userdashboard.html?context=<script>SomeFunction(somevariable)
http://www.example.com/userdashboard.html#context=<script>SomeFunction(somevariable)

```
- 实际上攻击者如果使用了加密手段，可以使得URL看上去并不包含一段script
- 不过某些浏览器在URL中会对<和>进行加密，导致攻击失败。然而很多情况下，可以不使用上述字符，或者不直接把攻击代码植入在URL中，所以这种方法并不能让浏览器完全免疫DOM XSS攻击

- DOM XSS的特点
    - 不在HTML页面内植入攻击代码
    - 脚本本身不会和服务器之间发生交互，如果使用了#号，服务器端会把其视为段落从而不会更进一步进行判断，因此服务器端会无法检测出这类攻击
    - 总而言之，DOM XSS和一般XSS攻击不同，利用了客户端不适当的DOM操作

- 如何防御DOM XSS攻击
- 因为攻击代码并不与服务器进行交互，所以我们必须执行客户端的代码检查和防御工具的应用，例如
    - 避免使用客户端数据进行敏感操作，例如重定向和改写页面
    - 检查对DOM对象，例如url,location,referrer的可能导致威胁的操作，特别是对这些对象的修改操作
    - 使用入侵防御机制，来检测URL参数，防止提供不安全的页面