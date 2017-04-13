---
title: JavaScript里的数组赋值问题
date: 2016-06-16 17:50:59
categories:
- JavaScript
- Array
tags:
 - JavaScript
 - Array
 - 数组
---


在做数组的复制的时候发现了这个问题：如果把一个一维数组复制给二维数组的每一个元素，在清空每个一维数组时，不能用 `ary=[] `方法清空。

    var a=[['1','2','4'],[]];
    var b=a[0];
	//需要把a[0]复制到a[1]上
	
    a.forEach(function(e){
        if(e!=b){
		//清空数组，有效
            e.length=0; //或e.splice(0,e.length)
            b.forEach(function(t){
                e.push(t);
            })
        }
    });

    //结果：a=[Array(3),Array(3)]

    a.forEach(function(e){
        if(e!=b){
		//清空数组，无效
            e=[];
            b.forEach(function(t){
                e.push(t);
            })
        }
    });

    //结果：a=[Array(3),Array(0)]
	

使用`ary=[]`方法后，不仅无法清除原数组的元素，也无法把每个值复制进去。

解决方法：使用`ary.length=0`或`ary.splice(0,ary.length)`方法清空数组