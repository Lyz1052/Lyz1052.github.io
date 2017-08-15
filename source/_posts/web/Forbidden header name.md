---
title: Forbidden header name
date: 2017-06-08
tags: 
	- glossary
	- header
categories: 
	- web
---
### 定义
A forbidden header name is a header name that is a byte-case-insensitive match for one of

`Accept-Charset`
`Accept-Encoding`
`Access-Control-Request-Headers`
`Access-Control-Request-Method`
`Connection`
`Content-Length`
`Cookie`
`Cookie2`
`Date`
`DNT`
`Expect`
`Host`
`Keep-Alive`
`Origin`
`Referer`
`TE`
`Trailer`
`Transfer-Encoding`
`Upgrade`
`Via`

or a header name that starts with a byte-case-insensitive match for `Proxy-` or `Sec-` (including being a byte-case-insensitive match for just `Proxy-` or `Sec-`).

> https://fetch.spec.whatwg.org/

### 特点和用途
A forbidden header name is an HTTP header name that cannot be modified programmatically.

These are forbidden so the user agent remains in full control over them. Names starting with `Sec-` are reserved to allow new headers to be minted that are safe from APIs using fetch that allow control over headers by developers, such as XMLHttpRequest. [XHR]

The browser has full control over the forbidden header, but they are forbidden to be set or changed by javascript.([stactoverflow](https://stackoverflow.com/questions/44426101/forbidden-header-name))
> https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name