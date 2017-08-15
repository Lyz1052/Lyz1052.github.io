---
title: Jackson框架的一个反序列化漏洞
date: 2017-04-18
tags: 
	- java
	- jackson
	- 安全
categories: 
	- java
---
>[Jackson的反序列化漏洞](http://www.cnvd.org.cn/flaw/show/CNVD-2017-04483?spm=5176.2020520154.sas.76.N1xwgg)

尝试了一下，确实可以获取操作系统权限，但条件比较苛刻

- 需要后台开启Jacakson的enableDefaultTyping
- 开放的接口中包括了在未经检查的情况下，将外来JSON字符串直接转实体的操作
- 实体中包括类型为Object的对象

具体代码就卜上了，Jackson2.8已有[补丁](https://github.com/FasterXML/jackson-databind/issues/1599)，不过只是字符串过滤。漏洞的核心原理是利用了xalan的解析方法中存在将字节流转换成对象的步骤，而在此期间会执行该外来对象的构造方法。