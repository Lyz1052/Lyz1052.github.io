---
title: Java 8 函数式编程 I
date: 2017-05-15
tags: 
	- java8
	- lambda
	- 函数式编程
categories: 
	- java
---
### Lambda表达式
 - Lambda表达式的一些例子
    ```
    //入参为空
    Runnable noArguments = () -> System.out.println("Hello World"); 
    
    //只有一个参数，可以省略括号
    //编译器对event参数进行类型推断
    ActionListener oneArgument = event -> System.out.println("button clicked"); 
    
    //包含代码块的Lambda函数表达式
    Runnable multiStatement = () -> { 
        System.out.print("Hello");
        System.out.println(" World");
    };
    
    //包含两个或两个以上入参的Lambda表达式
    BinaryOperator<Long> add = (x, y) -> x + y;
    
    //显示声明参数的类型
    BinaryOperator<Long> addExplicit = (Long x, Long y) -> x + y; 
    
    ```
- Lambda表达式的注意点
    - 函数中使用外部变量必须是final或等价于final的（类似匿名内部类只能引用final类型的变量，因为其使用的仅仅是变量的值）

- 函数接口
    - 一些预定义的函数接口
    ```
    Predicator<T> T -> return boolean
    Consumer<T> T -> return void
    Supplier<T>  void -> return T
    Function<T,R> T -> return R 
    UnaryOperator<T> T -> return T
    BinaryOperator<T,T> (T,T) -> return T
    ```

### Stream
 - Stream的惰性求值（类似建造者模式，在build方法执行之前不创建对象）
     ```
     Stream<Artist> stream = allArtists.stream()
        .filter(artist -> {
            System.out.println(artist.getName());
            return artist.isFrom("London");
    });//no console output
    
    long count = stream.count();
    //John Lennon
    //Paul McCartney
    //George Harrison
    //Ringo Starr
    //PS：这里的count相当于一个即时求值操作
     ```
     
- Stream的即时求值
    - collect(toList())
    ```
    import static java.util.stream.Collectors.toList;
    ...
    List<String> list = Stream.of("a","b","c").collect(toList());
    ```
- Stream使用时注意点
    - 对于一个业务需求，尽量用一个Stream进行链式操作获取结果
    - 避免无意义的中间变量
    - max方法可以指定自定义的Comparator

- Stream的reduce方法
    ```
    <I> reduce(I identity,BiFunction<I,? super T,I> accumulator,BinaryOperator<U> combiner)
    ```
    - 其中，I是目标类，T是Stream的泛型，二元函数accumulator是累加器，combiner是连接器
    - accumulator 用于给定的目标类和当前元素之间的累加，结果是目标类
    - combiner 用于累加结果之间的组合，因为整个过程可能产生多个中间流
    
- 使用reduce实现Map的一种方法（书中提供的方法是直接使用ArrayList作为目标类）
    ```
    public static <I, O> List<O> map(Stream<I> stream, Function<I, O> mapper) {
        return stream.reduce((Stream<O>)target,//identity
                (a,b)->{//accumulator
                return Stream.concat(a,Stream.of(mapper.apply(b)));
            },(a,b)->{//combiner
            return Stream.concat(a,b);
        })
        .collect(Collectors.toList());
    }
    ```
    
    因为ArrayList的combiner并没有类似concat的预定义方法，个人认为使用流作为目标类要简单一点，用reduce实现filter时同理

### 类库

- 类中重写方法的优先级要高于接口的默认方法（为了不破坏已有实现）
- super关键字可用于指定实现接口中冲突的默认方法（所以java8中super不一定指向父类了）
```
public class MusicalCarriage
implements Carriage, Jukebox {
    @Override
    public String rock() {
        return Carriage.super.rock();
    }
}
```

### 高级集合类和收集器

- 方法引用：方法引用自动支持多个参数，前提是选对了正确的函数接口
    - 这句话需要这么理解，方法引用只是直接调用方法的一种简化形式，原本该是Supplier接口的还是Supplier，BiFunction等等同理

- 元素顺序：流的顺序和出现顺序，即流来源的元素顺序有关
    - forEach是并行的，而forEachOrdered是顺序的

- 转换成其他集合(collect)：使用toList，toSet方法时，不需要显式指定集合类型。使用toCollection()

- 数据分类：
    - 取最大（小）值 maxBy(Comparator)，minBy(Comparator)
    - 常用的运算生成集合 averagingInt(ToIntFunction)
    - 划分集合 partitioningBy(Predicator)
    - 分组 groupingBy(Function)

- Stream API相关的一些等价表达:
    ```
    /**
        This inspection reports stream API call chains which can be simplified. 
        It allows to avoid creating redundant temporary objects when traversing a collection.
        The following call chains are replaced by this inspection:
    **/
    
    Collection.stream().forEach() → Collection.forEach()
    Collection.stream().forEachOrdered() → Collection.forEach()
    Arrays.asList().stream() → Arrays.stream() or Stream.of()
    Collections.singleton().stream() → Stream.of()
    Collections.singletonList().stream() → Stream.of()
    Collections.emptyList().stream() → Stream.empty()
    Collections.emptySet().stream() → Stream.empty()
    Stream.filter().findFirst().isPresent() → Stream.anyMatch()
    Stream.filter().findAny().isPresent() → Stream.anyMatch()
    Stream.collect(Collectors.counting()) → Stream.count()
    Stream.collect(Collectors.maxBy()) → Stream.max()
    Stream.collect(Collectors.minBy()) → Stream.min()
    Stream.collect(Collectors.mapping()) → Stream.map().collect()
    Stream.collect(Collectors.reducing()) → Stream.reduce() or Stream.map().reduce()
    Stream.collect(Collectors.summingInt()) → Stream.mapToInt().sum()
    Stream.collect(Collectors.summingLong()) → Stream.mapToLong().sum()
    Stream.collect(Collectors.summingDouble()) → Stream.mapToDouble().sum()
    !Stream.anyMatch() → Stream.noneMatch()
    !Stream.anyMatch(x -> !(...)) → Stream.allMatch()
    !Stream.noneMatch() → Stream.anyMatch()
    Stream.noneMatch(x -> !(...)) → Stream.allMatch()
    Stream.allMatch(x -> !(...)) → Stream.noneMatch()
    !Stream.allMatch(x -> !(...)) → Stream.anyMatch()
    Note that the replacements semantic may have minor difference in some cases. 
    
    /**
        For example, Collections.synchronizedList(...).stream().forEach() is not synchronized while Collections.synchronizedList(...).forEach() is synchronized. 
        Or collect(Collectors.maxBy()) would return an empty Optional if the resulting element is null while Stream.max() will throw NullPointerException in this case.
    **/
    
    ```
    注意：
    - 1.使用简短的表达式，避免冗余表达
    - 2.有的情况下，这些表达之间并不完全等价，例如Collections.synchronizedList(...).stream()的forEach方法并不是同步的，但Collections.synchronizedList(...).forEach()是同步的，stream.max(...)方法在处理空流时会抛出错误，但是stream.collect(maxBy(...))方法会返回一个Optional<T>.empty()对象
    

    
    