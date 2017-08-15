---
title: Java 8 函数式编程 III
date: 2017-05-19
tags: 
	- java
	- lambda
	- 函数式编程
categories: 
	- java
---
### 使用Lambda表达式编写并发程序
 - 传统的阻塞型IO，使用顺序执行的方式，进行IO操作时会阻塞当前线程，不适用于大量TCP连接的场景
 - 非阻塞型IO（异步IO），可以处理并发连接，特点是对客户端的IO操作立刻返回结果，把实际操作放在另外的线程中进行，从而节省CPU周期
 - 在Java8中，Future模型可以理解为Promise的拓展（[CompletableFuture](http://stackoverflow.com/questions/14541975/difference-between-future-and-promise)）