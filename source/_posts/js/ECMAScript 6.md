---
title: ECMAScript 6
date: 2017-03-20
categories: 
	- js
---
> http://es6.ruanyifeng.com/
- [ ] 前言
- [ ] ECMAScript 6简介
- [ ] let 和 const 命令
- [x] 变量的解构赋值
- [x] 字符串的扩展
- [x] 正则的扩展
- [x] 数值的扩展
- [x] 数组的扩展
- [x] 函数的扩展
- [ ] 对象的扩展
- [x] Symbol
- [x] Set 和 Map 数据结构
- [x] Proxy
- [x] Reflect
- [x] Promise 对象
- [x] Iterator 和 for...of 循环
- [x] Generator 函数的语法
- [x] Generator 函数的异步应用
- [x] async 函数
- [x] Class
- [x] Decorator
- [x] Module 的语法
- [x] Module 的加载实现
- [ ] 编程风格
- [ ] 读懂规格
- [ ] 二进制数组
- [ ] SIMD
- [ ] 参考链接

---


>以下内容摘取一些重点，包括常用语法和应用，不涉及提案中的内容

### 函数的拓展
- 函数参数可以写成表达式或解构赋值默认值
    ```
    function xy({x=0,y=0} = {x:0,y:0}){
        console.log(x,y);
    }
    
    xy();//0,0
    xy({});//0,0
    xy({x:1});//1,0
    
    ```
- 参数有单独的作用域，在调用函数时计算
    ```
    let g = 0;
    
    function gx(g,x=g){
        console.log(x);
    }
    
    gx(2);//2
    ```
- 上述单独的作用域内，定义与全局定义域同名的参数，不会影响全局作用域内的参数，而参数默认值如果是函数的话，函数的作用域会包括这个单独的作用域。
    ```
    var x = 1;
    function foo(x, y = function() { x = 2; }) {
      var x = 3;
      y();
      console.log(x);
    }
    
    foo() // 3
    x // 1
    
    //去掉var，x=3也只是影响参数x，包括y的匿名函数也不会影响全局变量x
    ```
- length 属性表示第一个有默认值的参数前的参数数量，而不是参数总数或者没有默认值的参数总数
    ```
    (function (p1,p2=0,p3){}).length //1
    ```
### Reflect, Proxy
- Reflect包装了一些Function和Object等的内部方法
- Proxy使用代理模式，可以拦截目标对象的方法
- get/set对象的最后一个receiver参数指定目标对象中get/set重载方法里的this对象
    ```
    var myObject = {
      foo: 4,
      set bar(value) {
        return this.foo = value;
      },
    };
    
    var myReceiverObject = {
      foo: 0,
    };
    
    Reflect.set(myObject, 'bar', 1, myReceiverObject);
    myObject.foo // 4
    myReceiverObject.foo // 1
    ```
- Proxy的应用 - 实现连乘函数
    ```

    //ES5的方法，无限嵌套
    multi = function(a){
        return function(b){
            return function(c){
                return a*b*c;
            }
        }
    }
    
    multi(2)(3)(4); //24
    
    //使用Proxy，添加Handler修改函数行为，只需修改深度参数
    var multi=(function(){
    	return function(multi){
    		var depth=5;//括号的数量-1
    		var handler = {
    			apply:function(func,thisArg,args){
    				multi=multi==undefined?args[0]:multi*args[0];
    				if(--depth)
    					return new Proxy(function(){},handler);
    				else
    					return multi;
    			}
    		}
    		
    		return depth>0?new Proxy(function(){},handler):multi;
    	}
    })()
    
    multi(2)(3)(4)(5)(6)(7); //5040

    ```
### RegExp
 - 
### Generator
- Generator应用 生成一个可遍历的对象
    ```
    var iterable={
        *[Symbol.iterator](){
            yield 'a'
            yield 'k'
            yield*[4,7]
        }
    }
    
    for(var ch of iterable){
        console.log(ch);//a k 4 7 
    }
    ```
- Generator应用 遍历嵌套数组
    ```
    var array=[[1],[2,3],[4,[5,6]]]; 
    
    //递归遍历
    function generatorFactory(arr){
        return function*(){
            if(Array.isArray(arr)){
			for(var ele of arr){//这里必须遍历数组，因为需要取出每一个元素，包装成iterator
			    yield * generatorFactory(ele)();
			}
            }else{
                yield arr;
            }
        }
    };
    
    var iterator = generatorFactory(array)();
    
    for (obj of iterator){
        console.log(obj);
    }
    ```
### async函数
- generator函数的语法糖，功能类似co模块
- 返回一个Promise对象，可以通过promise.then()直接执行异步步骤 
- yield的参数可以是Promise对象，async函数，这时是异步操作，也可以是原始类型对象，这时是同步操作
- async执行并发请求，应使用Promise.all而不是forEach
### class
- 定义类的语法糖，与传统写法的作用基本一致
- 只能通过new关键字来构建实例，无法直接调用
- class内定义的方法是不可枚举的，而ES5中的写法，默认是可枚举的
- class不存在变量提升
- 可以定义匿名类，用new关键字直接生成实例
- class定义可以赋值给变量，此时可以省略class名（即使不省略，class名还是以变量名为准，并且class之后的名称只能在定义体内使用），另外，类的name属性则是class之后的名称
    ```
    var MyClass = class {
        constructor(){
            this.name = 'me';
        }
    }
    
    MyClass.name = 'MyClass'//类名
        
    (new MyClass()).name //me
    
    var MyClass = class TempClass{
        constructor(){
            TempClass.name = 'me';
        }
    }
    
    MyClass.name = 'TempClass'//类名
    
    (new MyClass()).name //me
    (new TempClass()) //ERROR MyClass is not a constructor
    
    ```
- 构造函数默认存在，调用父类构造方法，返回该类实例对象，当然也可以返回另外一个对象，这样生成的实例就不是该类的实例。
    ```
    class Foo {
      constructor() {
        return Object.create(null);
      }
    }
    
    new Foo() instanceof Foo
    // false
    ```
- 继承类时，子类构造函数先使用super构造父类的实例，再在其基础上进行加工（但实际上父类构造函数的上下文还是子类构造函数的上下文，这与ES5相同）
- 可以继承原生构造函数（封装类等），可以使用所有原生类的方法
- static关键字表示静态方法，可继承
### Decorator
- Decorator本身是用于描述类或属性的一个方法
- 属性的描述：function(target,name,descriptor){...}//对象，属性名，属性
- Decorator可以添加参数，但是返回函数仍然是上述形式
### Module
- ES6的模块属于静态引入，编译阶段执行
- 不同于CommonJs，引入的模块接口可以获取模块中的实时值