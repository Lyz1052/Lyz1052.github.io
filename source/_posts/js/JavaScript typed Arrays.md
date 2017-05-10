---
title: JavaScript typed Arrays
date: 2017-05-03
tags: 
	- javascript
	- array
	- typed-array
categories: 
	- js
---
### 简介

typed array是一种可以访问原始二进制数据的类数组对象。众所周知，js中的数组对象具有良好的动态伸缩性，可以存储任何值。但是考虑到有时候需要处理视频流，获取WebSocket中的字节流等等，通过typed array，我们可以方便地在这些场景下操作二进制数据
- typed array中，元素的值的类型是固定的
- `Array.isArray(typed_array)`的值为`false`
- typed array也不支持例如`push`，`pop`等普通数组的操作


### API和应用
typed array的结构：为了获得尽可能高的性能和可拓展性，我们将typed array拆分成 buffer 和 view 共同表示
- **buffer**：通过`ArrayBuffer`实现，是一种没有结构的数据集，不开放获取其中具体数据的接口。必须通过view来获取buffer中的数据
- **ArrayBuffer**：用来创建一个固定长度的原生数据流，本身不提供操作或阅读其中数据的方法，我们必须通过指定格式的 `DataView `来读写其中的数据
- **view**：typed array的view有一系列指定结构的类，用于表示数据的展示结构，例如[Int8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array),[Uint8ClampedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray),Int16Array,Float32Array等等。这些接口会按照特定的格式读取和操作buffer，一般来说，我们遇到特定格式的数据流，使用相应格式的DataView即可。下面研究一下DataView和其具体的view类，以Float32Array为例，其他的类似
- **Uint8ClampedArray**：对于数据的展示和Uint8Array相同，但是储存数据的规则不同，涉及到[银行家舍入](http://baike.baidu.com/link?url=OCVdU3tYQbdGc1g59TbQPHVYDwmlQPckHZY0RdWTlB6_WONK1k5f-O4Dg6d5z13adLx85XpL7inHu3QkRY7Rod3pQdx6vC_PaO2jEzTMuInTie9D1dsfx96fQMykznLl9JSs4bngNL3EqEz8mCxGaK)

- **DataView**：基本的读写buffer的接口类，注意`DataView`不考虑运行平台默认的数据存储方式，但是实现`DataView`的类会使用
    - 构造：`new DataView(buffer [, byteOffset [, byteLength]])`
    - API：以`setInt16(offset,number,isLittleEndian)`为例，意为将number用Int16的格式解析为二进制字节流，并在offset位置处以小端存储的方式写进buffer中
    - 代码如下
    ```
    var buffer = new ArrayBuffer(2);//ArrayBuffer的长度必须是2的倍数
    var view = new DataView(buffer);
    
    view.setInt16(0,//offset 存储偏移量
        256,//number 任意数字
        true//isLittleEndian 是否小端存储 true false 
    )
    ```
    - 分析API
        - offset:指定数字的字节流在buffer中的偏移量，非负整数，在上述例子中，因为Int16的大小为双字节，buffer的总长度为2，所以offset指定任何0以上的整数都会报`Offset out of Range`错误
        - number:number可以是任何值，因为指定了int16类型，所以会按照int16类型规定的方式转换，上述例子中，256被转换为| 0 0 0 0 0 0 0 1 | 0 0 0 0 0 0 0 0 |
        - isLittleEndian:布尔值，表示数据存储方式是否为小端存储，小端存储和大端存储，在内存中的数据排列方式如下
        
        0x00000 | 0x00001
        ---|---
        0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 1 
        0 0 0 0 0 0 0 1 | 0 0 0 0 0 0 0 0 

    - DataView的应用
    
    ```
    //判断当前平台是否使用小端存储
    var littleEndian = (function() {
      var buffer = new ArrayBuffer(2);
      new DataView(buffer).setInt16(0, 256, true);//true false 是否小端存储
      // Int16Array 使用平台的默认数据存储方式读取数据
      return new Int16Array(buffer)[0] === 256;//如果相等，说明平台的数据存储方式是小端存储
      //return new Int8Array(buffer)[0]===0 也可以实现相同功能，而且数字256可以换成任意正数n的n<<8的值
    })();
    console.log(littleEndian); // true or false
    ```
    理解了上面的内容，就可以理解为什么把上述代码中的setInt16换成setInt8，就无法判断平台的数据存储方式
    
- **Float64Array**：
    - 构造方法：
    ```
    new Float32Array(length);
    new Float32Array(typedArray);
    new Float32Array(object);
    new Float32Array(buffer [, byteOffset [, length]]);
    ```
    这里，通过typedArray构造的Float32Array，byteLength可能与原typedArray不一致，但是数组长度length一定是一致的，通过第三种方法指定的length,byteoffset，包括byteLength在构造完成后只读，不可改变
    

### 参考
> [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)

> [百度百科](http://baike.baidu.com/link?url=OCVdU3tYQbdGc1g59TbQPHVYDwmlQPckHZY0RdWTlB6_WONK1k5f-O4Dg6d5z13adLx85XpL7inHu3QkRY7Rod3pQdx6vC_PaO2jEzTMuInTie9D1dsfx96fQMykznLl9JSs4bngNL3EqEz8mCxGaK)