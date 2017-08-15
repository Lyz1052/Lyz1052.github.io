---
title: 深入理解Java虚拟机阅读笔记 II
date: 2017-04-17
tags: 
	- 虚拟机
	- java
	- 阅读笔记
categories: 
	- java
---
### 6.虚拟机执行子系统
---
### 概述
- Java虚拟机只与Class文件绑定，通过识别其中的字节码运行程序，实现平台无关性。同时，不同的语言如果通过不同的编译器编译成字节码，也能通过虚拟机运行，从而实现语言无关性。
### 类文件的结构
#### 概述
- 每一个类文件（Class文件）都对应一个类，但是有的类并不通过Class单独定义，而是通过虚拟机生成的
- 类文件由固定顺序的无符号数和表组成，以字节为单位，没有任何分割符号，严格限定了格式。
#### 类的组成
```
package org.fenixsoft.clazz；
public class TestClass{
    private int m；
    public int inc（）{
        return m+1；
    }
}
```
- 魔数，作为文件的标志位，避免读取破损的文件（文件头较易受损）
- 主次版本号
- 常量池（索引值从1开始计数，0表示空引用）中，首先是容量计数值，其次是常量数据，由常量表组成，不同的常量表有不同的组成结构，但每个常量表开头有一段u1标识了常量的类型。
- 访问标志，即标志位（类的访问权限，是否为接口，枚举，注解等等）
- 类索引，父类索引，接口索引集合（需要全限定名）
- 字段表
    - 访问标志，每一个字段在常量池中的全限定名索引，简单名称索引和描述符索引
    - 属性表，保存字段的额外信息。例子中的字段m的属性表容量计数值为0，但是如果是`public static final int m=10`，那么属性表中会包含一个指向常量池中值为10的常量的索引
- 方法表
    - 与字段表基本相同，也包括了访问标志，全限定名，简单名和描述索引。当然，有区别比如描述索引的值也包括了形参类型和返回值类型，访问标志中没有violate等标志位，有synchronized等标志位。
    - 属性表，属性表保存一些额外信息，具体内容参照`表6-13 虚拟机规范预定义的属性`，例如经过编译后的代码存储在属性表中的CODE属性中。
- 属性表内容（以CODE属性举例）
    - 该属性名的索引（常量池CODE索引）
    - 该属性的内容长度
    - 该属性的内容
- 虚拟机的常用执行方式有两种：通过把Java虚拟机指令集转换成另外一种虚拟机的指令集，和翻译成CPU可以执行的本地指令集（JIT）

### 7.虚拟机类加载机制

---

### 概述
- 类的加载，连接，初始化都是在运行期间完成的
### 类初始化的时机
- 类的生命周期（类加载`Class Loading`过程）：**加载 验证 准备 解析 初始化 使用 销毁**
    - **连接**包括**验证，准备，解析**这三个步骤
    - **加载，验证，准备**这三个步骤顺序是固定的
    - 加载是类加载的执行阶段，类加载也就是整个类的生命周期
- 类的初始化可以在编译之前
- 被动引用不会触发类的初始化，例如
    - 子类的静态代码块中，引用父类的静态变量，只会触发父类初始化
    ```
    public class SuperClass{
        static{
            System.out.println("SuperClass init！");
        }
        public static int value=123；
    }
    public class SubClass extends SuperClass{
        static{
            System.out.println("SubClass init！");
        }
        
    }
    
    /**
     * 非主动使用类字段演示
     */
    public class NotInitialization{
        public static void main(String[]args){
            System.out.println(SubClass.value);//SuperClass init!
    }
    ```
    - 引用其他类的常量，不会触发其他类的初始化
    ```
    /**
    *被动使用类字段演示三：
    *常量在编译阶段会存入调用类的常量池中，本质上并没有直接引用到定义常量的类，因此不会触发定义常量的类的初始化。
    **/
    public class ConstClass{
        static{
            System.out.println("ConstClass init！")；
        }
        public static final String HELLOWORLD="hello world"；
    }
    
    /**
    * 非主动使用类字段演示
    **/
    public class NotInitialization{
        public static void main(String[]args){
          System.out.println(ConstClass.HELLOWORLD)；//
        }
    }
    ```
    - 使用类的数组，不会触发类的初始化，实际上初始化的是一个数组类
- 子类初始化，父类必须初始化，但是子接口初始化，不要求父接口初始化
### 类的加载过程
- 加载：将Class字节码的方式读到内存中，字节码不一定是Class文件，也可以是压缩过的zip,jar,war，或者是Applet，中间过程生成的字节码比如jsp文件,java.lang.reflect.Proxy生成的Class
    - 通过类的全限定名获取字节流
    - 把静态存储结构转化运行时数据结构
    - 生成对应的Class实例（不一定在Java堆中存放）
- 验证：验证过程位于加载过程之后，但可能和加载过程交叉，即所有内容加载完成之前就可以开始验证已加载的内容。
- 准备：给类变量分配内存地址和初始值
    - 与类变量有关，和实例变量无关
    - 始终会给类变量分配“0值”（这里的0值不是值为0，对于不同的数据类型有不同的0值），类的静态变量的赋值实际上是在构造方法执行时运行的。
    ```
    public static int m=123;//该类的准备过程完成，尚未初始化时，m在内存中的值为0;
    ```
    - 给类常量赋指定的值
    ```
    public static final int m=123;//准备完成后，m的值就是123
    ```
- 解析：将常量池中的全限定名引用替换为直接引用
    - 以下内容中，假设需要解析的类，类方法，字段或接口所在的类为C，当前类为D
    - 类的解析：主要是静态解析，即把常量池中的符号引用替换为直接引用
        - 1.对于非数组类，使用D的类加载器加载C，加载C的过程中，可能会触发C的父类的加载过程（这里的加载不是说的类加载，而是加载这一步，因为加载可能会触发相关的验证，所以可能会触发其他加载动作），任何一个过程失败，整个解析过程失败。
        - 2.对于数组类，递归解析数组元素，直到找到非数组类的元素，按照1的规则进行解析，最后由虚拟机生成一个代表此数组维度和元素的数组对象。
        - 3.获取类的直接引用后，判断D有没有C的访问权限
    - 字段的解析：
        - 1.加载字段所属的类。
        - 2.如果D中包含了简单名称和描述符相同的字段，返回该字段的直接引用。
        - 3.递归搜索接口
        - 4.递归搜索父类
        - 5.权限验证
    - 类方法的解析
        - 1.加载类方法所在的类。
        - 2.如果D中包含了简单名称和描述符相同的方法，返回该方法的直接引用。
        - 3.递归查找接口
        - 4.递归查找父类，如果找到简单名和描述符相同，但没有覆写的方法，将会抛出AbstractMethodError错误
        - 5.权限验证
    - 类接口的解析 基本同上，但是不包括权限验证，因为所有接口方法都是隐含public的
- 初始化：虚拟机通过分析static代码段和类变量的赋值语句，对类变量进行初始化赋值的方法，或者说<clinit>方法
    - 初始化方法和类的加载（可以通过指定不同的类加载器） 是类加载过程中可以不通过虚拟机，进行自定义控制的阶段
    - 一个类可以不生成<clinit>方法
    - 一个类的初始化，可能会触发父类的初始化（但不包括实现接口的初始化），虚拟机会通过加锁来保证只有一个线程在进行类的初始化，所以说这个过程可能发生死锁
    - static代码段中，可以对尚未定义的对象进行赋值，但是不可以访问尚未定义的对象
    ```
    static{
        i=1;// 1
        System.out.println(i);//ERROR（非法向前引用变量）
    }
    
    public static int i = 2;
    ```
    - 对于接口，首先没有static代码段，第二不需要在子类的初始化方法执行前，进行父类的初始化
- 类加载器：Java中使用的类有两个维度，一个是类的来源文件，一个是类加载器，同一个类被不同的类加载器加载，JVM中也会产生不同的类。
    ```
    //自定义的ClassLoader和系统类加载器加载同一个类
    
    ```
    - 初始化类加载器，启动时由JVM自动调用，根据名称或启动参数加载JRE_HOME/lib下的类，不可以手动调用，当指定的类加载器为null时自动调用
    - 扩展类加载器，根据启动参数加载JRE_HOME/lib/ext目录下的类，可手动调用
    - 系统类加载器（应用类加载器），可由`java.lang.ClassLoader.getSystemClassLoader()`获取,程序没有定义过自定义类加载器时，一般使用这个进行类的加载
    
### 虚拟机字节码执行引擎

- Java虚拟机栈：物理机的执行引擎是与操作系统，指令集和硬件相关的，而Java虚拟机的执行引擎可以执行特殊的指令，不受物理机的限制。
- Java虚拟机栈的最小单位是栈帧，虚拟机栈中可能有很多栈帧处于一个方法调用链上，但是虚拟机执行引擎只对栈顶的当前栈帧进行操作。
    - 局部变量表：局部变量表保存方法中使用到的参数和变，如果是实例方法，会把当前实例的指针传入局部变量表的第0位上。
        - 局部变量表的最小单位为变量槽（Slot），Slot至少能存储32位的原始类型变量
        - 对于64位的原始类型，如float等，读操作有可能作为两个字节码指令，从两个连续的Slot中读取，在类加载的验证过程中，会防止与上述过程不同的字节码指令调用。所以即使这不是原子操作，也不会产生线程安全问题。
        - 局部变量表的Slot可以复用，在变量离开自己的块级作用域之后，如果有其他变量的使用，可以复用之前的Slot（这里注意如果没有使用其他变量，即使手动进行垃圾回收，局部变量表中原变量的内存空间也不会被回收，因为引用指针并没有变化）
        ```
        {
        byte[] placeholder = new byte[24*1024*1024];
        System.gc();//不会回收placeholder的内存空间
        }
        
        {
        byte[] placeholder = new byte[24*1024*1024];
        int a=1;
        System.gc();//会回收placeholder的内存空间
        }
        ```
    - 操作数栈（操作栈）：方法执行过程中，根据字节码的具体操作，会把使用的变量压入操作栈
        - 方法执行开始时，操作栈为空
        - 字节码指令对数据有要求，在Java编译器的编译期和类加载的验证期，都会检查这一点，例如iadd操作执行时，操作数栈顶的两个元素不能是float和int
        - 当前方法的操作数栈可能会和另一个栈帧的局部变量表重叠，这样可以避免额外的参数复制
        - 虚拟机参数 `-verbose:gc` 来查看垃圾收集详细情况
        
    - 动态链接：相对于静态链接，动态链接在方法的执行过程中将常量池中的符号引用转换为直接引用
    - 方法返回地址：方法的返回过程实际上就是当前栈帧出栈的过程。
        - 方法的返回有两种途径，一种是执行到方法返回的字节码指令，一种是方法运行过程中抛出异常。
        - 方法的局部变量表中很可能保存上一个方法调用的PC计数器地址
        - 方法正常结束时，当前栈帧出栈，返回值压入上层方法的操作数栈，并恢复其局部变量表。
        - 方法出现异常时，返回地址需要查询异常处理表。（这种方法称为异常完成出口，此时不会给上层方法任何返回值）
    - 附加信息：Java虚拟机允许栈帧中保存其他信息
        - **附加信息**与**方法返回**值和**动态链接**一起称为**栈帧信息**。
        
- 解析和分派：如果方法在调用前能确定唯一的版本，即在类加载阶段能够将符号引用转换成直接引用，那么这种方法的调用称为解析
    - 虚方法和非虚方法的定义：对于静态方法，私有方法，构造方法和父类方法的调用是可以在编译器静态确定的，这称为方法的静态分派，这类方法，包括final方法，我们称为非虚方法，其他方法称为虚方法。
    - 虚方法和非虚方法的调用指令：我们可以使用字节码指令invokestatic，invokespecial来调用除了final以外的非虚方法，final方法是用invokevirtual指令进行调用的。
    - 分派可以分为：静态分派和动态分派，或者分为：单分派和多分派，两两组合可以得到四中分派模式。 静态分派是在编译器进行的，而动态分派是在运行期进行的。
    - 静态分派主要用途是方法重载
    - 
    ```
    package org.fenixsoft.polymorphic;
    /**
    *方法静态分派演示
    *@author zzm
    */
    public class StaticDispatch{
    	static abstract class Human{
    	}
    	static class Man extends Human{
    	}
    	static class Woman extends Human{
    	}
    	public void sayHello(Human guy){
    		System.out.println("hello,guy！");
    	}
    	public void sayHello(Man guy){
    		System.out.println("hello,gentleman！");
    	}
    	public void sayHello(Woman guy){
    		System.out.println("hello,lady！");
    	}
    	public static void main(String[]args){
    		Human man=new Man();
    		Human woman=new Woman();
    		StaticDispatch sr=new StaticDispatch();
    		sr.sayHello(man);//根据静态变量类型进行重载
    		sr.sayHello(woman);
    		
    	}
    }
    ```
    - 动态分派主要用途是方法重写，在虚方法的调用过程中，从实际类型开始，向父类逐层查找该方法的实现
    ```
    /**
    *方法动态分派演示
    *@author zzm
    */
    public class DynamicDispatch{
    	static abstract class Human{
    		protected abstract void sayHello();
    	}
    	static class Man extends Human{
    		@Override
    		protected void sayHello(){
    			System.out.println("man say hello");
    		}
    	}
    	static class Woman extends Human{
    		@Override
    		protected void sayHello(){
    			System.out.println("woman say hello");
    		}
    	}
    	public static void main(String[]args){
    		Human man=new Man();
    		Human woman=new Woman();
    		man.sayHello();
    		woman.sayHello();
    		man=new Woman();
    		man.sayHello();
    	}
    }
    ```
    - 单分派和多分派是根据方法的宗量来区分的
    - 宗量是方法签名和方法调用者的统称
    - 静态分派动态分派，单分派多分派的展示
    ```
    /**
    *单分派、 多分派演示
    *@author zzm
    */
    public class Dispatch{
    	static class QQ{
    	}
    	static class_360{
    	}
    	public static class Father{
    		public void hardChoice(QQ arg){
    			System.out.println("father choose qq");
    		}
    		public void hardChoice(_360 arg){
    			System.out.println("father choose 360");
    		}
    	}
    	public static class Son extends Father{
    		public void hardChoice(QQ arg){
    			System.out.println("son choose qq");
    		}
    		public void hardChoice(_360 arg){
    			System.out.println("son choose 360");
    		}
    	}
    	public static void main(String[]args){
    		Father father=new Father();
    		Father son=new Son();
    		father.hardChoice(new_360());//father choose 360
    		son.hardChoice(new QQ());//son choose qq
    		}
    }
    ```
    - 1.在编译期，根据方法的静态分派规则，通过判断方法调用者**的静态类型**（Father）和**方法签名**，给出了两条方法调用指令（invokevirtual），分别调用`Father.hardChoice(_360)`和`Father.hardChoice(_QQ)`，所以这是多分派。
    - 2.在运行期，对于`son.hardChoice(new QQ())`，根据动态分派规则。通过判断方法的实际类型（第二条语句的方法）来确定到底是调用`Father.hardChoice(_QQ)`还是`Son.hardChoice(_QQ)`，所以这是单分派
    - 3.基于上述规则，Java中的分派是**静态多分派，动态单分派**（JDK8之前是这样的）
    - 4.虚方法表：对方法动态分派的优化，在类加载的连接阶段（验证，准备，解析）初始化完毕。包含了继承链上所有方法的入口地址，有点类似于javascript中的原型链
- 动态类型语言的支持：首先动态类型语言不同于动态语言，前者指的是变量类型不在编译器确定，后者指的是程序或者函数在运行期间可以改变。
    -  动态类型的语言特点：
        -  1.编译期间不做变量类型检查
        -  2.变量类型存储在变量值中，而不是变量的引用指针中
    -  Java中对动态类型语言的支持
        - java.lang.invoke.MethodHandle 包中，模拟了字节码层面的方法调用
        ```
        //Hello World
        import static java.lang.invoke.MethodHandler.lookup;
        ...
        ... throws Throwable{
            MethodType mt = MethodType.methodType(void.Class,String.class);//第一个参数代表方法的返回类型，之后的是参数是方法签名
            lookup().findVirtual(PrintStream.class,"println",mt)//PrintStream的println方法是一个虚方法，调用invokevirtual字节码执行，所以这里使用findVirtual方法
                .bindTo(System.out)//指定方法的调用者，或者说上下文
                .invoke("Hello world!");//方法入参
            //Hello world!
        }
        ...
        ```
        - MethodHandler包和Reflect包的区别：
            - MethodHandler包是针对Java和Java之外的所有JVM语言进行方法委托调用，而Reflect包只是针对Java方法
            - MethodHandler是从字节码层面来进行模拟方法调用，而Reflect是从Java方法的执行层面来进行模拟方法调用，所以前者也更为轻量级
        - 使用MethodHandler解决实际问题，调用祖类方法（注意不是父类方法）
        ```
        ...
        public static class GrandFather{
            public void say(){
                System.out.println("孙子！");
            }
        }
        public static class Father extends GrandFather{
            public void say(){
                System.out.println("儿子！");
            }
        }
        public static class Son extends Father{
            public void say(){
                //TO DO 调用祖类方法的代码
            }
        }
        public static void main(String[] args){
            (new Son()).say();//"孙子"
        }
        ...
        ```
        实际上，使用传统方法，即`super`关键字，只能调用父类的方法，如果要调用祖类的方法，TO DO代码段可以使用MethodHandler包
        ```
        MethodType mt = MethodType.methodType(void.class,void.class);
        lookup().findVirtual(GrandFather.class,"say",mt).bindTo(this).invoke();
        ```
        **然而经过尝试，发现这里这边并不能实现上述需求**，根据[这些讨论](https://www.zhihu.com/question/40427344)，发现findSpecial只能找到直接父类的方法
        
- 基于栈的字节码执行引擎
    （暂略）
### 