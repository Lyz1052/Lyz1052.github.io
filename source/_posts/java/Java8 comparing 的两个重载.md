---
title: Java8 comparing 的两个重载
date: 2017-05-23
tags: 
	- java8
	- comparing
categories: 
	- java
---
Comparator<T>的comparing是提供Comparator接口函数的预定义方法，有如下两个重载

重载一

```
/**
 * Accepts a function that extracts a sort key from a type {@code T}, and
 * returns a {@code Comparator<T>} that compares by that sort key using
 * the specified {@link Comparator}.
  *
 * <p>The returned comparator is serializable if the specified function
 * and comparator are both serializable.
 *
 * @apiNote
 * For example, to obtain a {@code Comparator} that compares {@code
 * Person} objects by their last name ignoring case differences,
 *
 * <pre>{@code
 *     Comparator<Person> cmp = Comparator.comparing(
 *             Person::getLastName,
 *             String.CASE_INSENSITIVE_ORDER);
 * }</pre>
 *
 * @param  <T> the type of element to be compared
 * @param  <U> the type of the sort key
 * @param  keyExtractor the function used to extract the sort key
 * @param  keyComparator the {@code Comparator} used to compare the sort key
 * @return a comparator that compares by an extracted key using the
 *         specified {@code Comparator}
 * @throws NullPointerException if either argument is null
 * @since 1.8
 */
public static <T, U> Comparator<T> comparing(
        Function<? super T, ? extends U> keyExtractor,
        Comparator<? super U> keyComparator)
{
    Objects.requireNonNull(keyExtractor);
    Objects.requireNonNull(keyComparator);
    return (Comparator<T> & Serializable)
        (c1, c2) -> keyComparator.compare(keyExtractor.apply(c1),
                                          keyExtractor.apply(c2));
}

```
重载二（注释略）
```
public static <T, U extends Comparable<? super U>> Comparator<T> comparing(
        Function<? super T, ? extends U> keyExtractor)
{
    Objects.requireNonNull(keyExtractor);
    return (Comparator<T> & Serializable)
        (c1, c2) -> keyExtractor.apply(c1).compareTo(keyExtractor.apply(c2));
}
```
首先看第一个重载，comparing方法接受两个参数，一个Function接口函数keyExtrator，一个Comparator接口函数keyComparator，返回一个新的Comparator接口函数。

从语义上来说，是使用keyExtrator将当前类型T转换成另一种类型U，从而通过已有的比较函数keyComparator来获取一个当前类下新的比较函数

对于变量类型使用的泛型可以这么理解：
- 方法指定了两个泛型类：T U，分别代表当前比较器指定类T的泛型和提供给keyComparator比较的类型U。

- 首先返回类型毋庸置疑是Comparator<T>，这也是该静态方法本身的目的。

- 对于Function接口函数，需要提供将T转换成keyComparator能够接受的类型，显然，对于T的转换方法，只需要满足T的任何父类的转换逻辑就可以对T进行操作，而转换获得的类，必须能由keyComparator处理，所以是U的子类，因而第一个参数为Function<? super T,? extends U> keyExtrator
- 对于keyComparator，必须实现对U的比较，而对U的父类的任何比较都适用与对U的比较，因此第二个参数为Comparator<? super U> keyComparator
- 最后，返回类型的强转(Comparator<T> & Serializable)，表示转成一个可序列化的Comparator接口[(参考)](http://stackoverflow.com/questions/30374083/whats-the-meaning-of-the-character-in-the-returned-value)(PS:这种写法只能表示强转成某一个类，或者加上数量有限的接口)

然后再看第二个重载，可以说唯一的区别就是没有指定Comparator函数接口，所以方法的泛型类U就必须提供一个这样的函数接口，也就是U必须实现一个提供基于U或U父类的比较器函数接口：< T U extends Comparator<? super U >>