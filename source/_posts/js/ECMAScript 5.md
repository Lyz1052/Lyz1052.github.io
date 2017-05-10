---
title: ECMAScript 5
date: 2017-01-14
tags: 
	- javascript
	- 严格模式
categories: 
	- js
---
### 严格模式 
> http://es6.ruanyifeng.com/#docs/module
- 变量必须声明后再使用 ，否则报错
- 不能使用with语句
- 不能对只读属性赋值，否则报错
- 不能使用前缀0表示八进制数，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量delete prop，会报错，只能删除属性delete global[prop]
- eval不会在它的外层作用域引入变量
- eval和arguments不能被重新赋值
- arguments不会自动反映函数参数的变化
- 不能使用arguments.callee
- 不能使用arguments.caller
- 禁止this指向全局对象，顶层this指向undefined
- 不能使用fn.caller和fn.arguments获取函数调用的堆栈
- 增加了保留字（比如protected、static和interface）