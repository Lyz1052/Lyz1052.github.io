---
title: 字符串解析运算式的算法（JS）
date: 2017-04-25
tags: 
	- 算法
	- 字符串
	- 正则表达式
	- javascript
categories: 
	- 算法
---
---
 - 问题是这样的，给出一个字符串的运算表达式，包括加减乘除括号空格，要求求出这个运算表达式的值。
 - 这里先不考虑eval函数（因为这样就没意义了，而且有语法问题，比如JS引擎会把++和--解析为一种运算符，两个除号会被解析为正则表达式等等），其次不考虑复杂的错误提示，只考虑符合要求的字符串能得出结果，大致的想法如下：
    - 拿表达式 `1-(2*-+10)-+-4` 举例
    - 首先考虑包含括号的表达式和不包含括号的表达式，可以把前者化简为后者再进行整体处理，即先计算`2*-+10`，再计算`1--20-+-4`
    - 简化过程：利用栈的数据结构，处理和括号相关的操作，除`)`外所有字符入栈，遇到`)`，循环出栈，直到遇到`(`，把出栈的字符作为不包含括号的运算表达式，整体处理
    - 整体处理操作：大体思想是把表达式换成数字数组，再把数组中所有的数字相加。
        - 1.遍历字符串
        - 2.遇到数字以外的字符，直接入栈
        - 3.遇到数字时，不需要入栈，只临时变量保存这个数字（下面称做N），并和之前的数字连接起来，如果这不是最后一位数字，比如遍历到`'1'`时，下一位是`'0'`,那么只需要改变临时变量的值，而如果这是最后一位数字，比如遍历到`'0'`时，发现下一位是空，N是`'10'`，那么需要循环出栈栈中的操作符，直到遇到的不是操作符，遇到`'+'`或者`'-'`，相当于`0 + N`，或是`0 - N`，遇到`'*'`或者`'-'`时，需要再次出栈前一个数字 P，计算`P * N`或`P \ N`，出栈循环结束，可将N入栈，继续遍历。
        - 下面是计算`2*-+10`的过程中栈的变化
    
            栈元素| N
            ---|---
            2*-+ | 10
            2*- | 10
            2* | -10
            空 | -20
            -20 | -20
 - ES5代码如下

    ```
    function isOperator(ch) {
        return ch == '+' || ch == '-' || ch == '*' || ch == '/';
    }
    
    function computeByCh(a, b, ch) {
        switch (ch) {
            case'+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case'/':
                return a / b
        }
    }
    
    function isSimpleOperator(ch) {
        return ch == '+' || ch == '-'
    };
    
    function Stack() {
        this.arr = [];
        this.top = -1;
    }
    
    Stack.prototype.constructor = Stack;
    
    Stack.prototype.push = function (i) {
        this.arr[++this.top] = i;
    }
    
    Stack.prototype.pop = function () {
        return this.arr.length ? this.arr.splice(this.top--, 1)[0] : null;
    }
    
    Stack.prototype.getTop = function () {
        return this.top >= 0 ? this.arr[this.top] : null;
    }
    
    function compute(str) {//只有加减乘除和数字
    
        var strArr = str.split(''), len = str.length;
    
        var stack = new Stack(), number = '',ele,sum=0;
    
        for (var i = 0; i < len; i++) {
            var ch = strArr[i];
            var nextch = i < len - 1 ? strArr[i + 1] : undefined;
    
            if (ch == '+' || ch == '-' || ch == '/' || ch == '*') {
                stack.push(ch);
            } else {
                number += ch;
                if (isOperator(nextch)||!nextch) {//最后一位数字
                    var n = Number(number);
                    number = '';
                    while (isOperator(stack.getTop())) {
                        ele = stack.pop();
                        if (isSimpleOperator(ele)) {
                            n = computeByCh(0, n, ele);
                        } else if(!isNaN(stack.getTop())){
                            var preNum = stack.pop();
                            n = computeByCh(preNum, n, ele);
                            break;
                        }
                    }
                    stack.push(n);
                }
            }
        }
    
        while(ele=stack.pop()){
            sum+=ele;
        }
    
        return sum;
    }
    
    
    function solution(str) {
    
        str = str.replace(/\s/g, '');
    
        var stack = new Stack(), str = str.split(''), lefts = new Stack();
        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            if(ch!=')')
            stack.push(ch);
    
            if (ch == ')') {
                var ele, computeStr='';
                while('('!=(ele=stack.pop())&&stack.top>=0){
                    computeStr += ele;
                }
    
                stack.push(compute(computeStr.split('').reverse().join('')));
    
            }
        }
        return compute(stack.arr.join(''));
    }
    ```
- 这里考虑另一种**不对整个字符串的显式遍历**的思路，从内向外，通过正则表达式替换其中的一些匹配
    - 替换类似`(操作符和数字的组合)` 的字符串为实际值
    - 如果整个字符串最终能替换成一个数字，说明原字符串符合要求，如果替换前后字符串没有变化，说明字符串有语法问题
    - 这里不考虑乘除的情况，按道理是可以考虑的，但是这样写出的正则太过复杂。
    - ES5 代码如下
    ```

    function solution(str){
        var prev;
    
        str=str.replace(/\s[^\d\+\-\(\)]]/g,'');
    
        function rs(str){
    
            prev = str.split('').join('');
    
            if(str.length){
    
                str = str.replace(/([\+\-]+)/g,function($0,$1){//(+-+-num) => +num
                    var negative = $0.match(/\-/g);
                    return (!negative||((negative.length&1)==0))?'+':'-';
                });
    
                str = str.replace(/\(([\+\-]?\d*)\)/g,'$1');//(num) => num
    
                str = str.replace(/([\-]?\d+([\+\-]\d+)+)/g,function ($0,$1){
    
                    var sum=0;
    
                    $0.match(/([\+\-]?\d+)/g).forEach(function(num){
                        sum+=Number(num);
                    })
    
                    return sum>0?"+"+sum:"-"+sum;
                })
    
                if(/^[\+\-]\d+$/.test(str)){//like +3 , -4，最终格式
    
                    return Number(str);
    
                }else if(/[\(\)\+-]/.test(str)){//字符串不是最终格式
    
                    if(prev==str){
    
                        console.error('error expression');
    
                    }else{
    
                            return rs(str);
    
                    }
                }
    
            }else{//没有结果
    
                console.error('no result to show');
                //null expression
            }
        }
        return rs(str);
    }
    ```