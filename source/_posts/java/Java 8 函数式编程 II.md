---
title: Java 8 函数式编程 II
date: 2017-05-18
tags: 
	- java
	- lambda
	- 函数式编程
categories: 
	- java
---
### 数据并行化

- 并发是指多任务共享时间段，并行是指多任务同时在不同的CPU上进行处理（开始时间相同）
- 通过并行流`parallel` ，我们可以直接实现并行化操作（但是并不是对于所有计算都适用并行化操作），相反地，可以用`sequential`方法得到同步流，同时调用时，最后一个方法起效
- IntStream等包装流类型的collect方法和Stream接口的collect方法有所不同，包装流类型的collect只提供一种重载，而Stream可以提供基于collector的重载：
    ```
    class IntStream implements BaseStream
    ...
    //R 指定的集合类型
    <R> R collect(Supplier<R> supplier,
            ObjIntConsumer<R> accumulator,
            BiConsumer<R,R> combiner);
    
    
    
    class Stream implements BaseStream
    ...
   <R> R collect(Supplier<R> supplier,
              BiConsumer<R, ? super T> accumulator,
              BiConsumer<R, R> combiner);
              
    <R, A> R collect(Collector<? super T, A, R> collector);
    ```
- 数据并行化的注意点
    - reduce操作的初值identity必须等价于0，因为无法保证初值和哪一个值进行操作，所以accumulator在进行(acc,identity) - > acc 时，acc必须保持不变
    - reduce操作的accumulator必须满足结合律，类似乘法和加法的结合律
    - 在数据量小，或者CPU核心数量少的时候没有必要使用并行化处理，例如案例中给出的蒙特卡洛算法，N的值在百万级以上时，并行化处理才会有明显的时间优势（八核CPU，N等于一百万时，快了一倍左右）
    - 对于无状态操作，并行化处理能发挥出最大的效能，例如map,flatMap,filter，而有状态操作，需要考虑线程之间的状态维护开销，例如sorted,distinct,limit

- 数组上的并行处理API：
    - Arrays.parallelPrefix(array,accumulator)（会对数组进行直接操作）
    - Arrays.parallelSetAll(array,valueSetter)（valueSetter是一个下标到值的映射函数，该方法可以用于生成一定规律的自然数列）

### 测试，调试与重构
- peek方法可以用于展示流数据的中间状态，同时可以继续操作流

### 设计模式
- 命令者模式，以GUI Editor为例，目标是实现宏命令功能
    ```
    //命令接收者
    interface Editor {
    
        save();
        
        open();
        
        close();
    }
    
    //具体命令接收者
    class MockEditor {
    
        save();
        
        open();
        
        close();
    }
    
    //命令者
    interface Action {
        void perform();
    }
    
    //具体命令者
    class Save implements Action {
        private final Editor editor;
        
        void save(){
            editor.save();
        }
        
        @Override
        public void perform(){
            save();
        }
    }
    
    interface Open implements Action {
        ...
    }
    
    //发起者
    class Marco {
        private List<Action> actions = new ArrayList<>();
        
        record(Action action){
            actions.add(action);
        }
        
        execute(){
            actions.forEach(Action::perform);
        }
    }
    
    //客户端
    ...
    Editor editor = new MockEditor();
    Marco marco = new Marco();
    
    //原始写法
    marco.record(new Open());
    marco.record(new Save());
    marco.record(new Close());
    
    //lambda表达式写法
    marco.record(()->editor.open());
    marco.record(()->editor.save());
    marco.record(()->editor.close());
    
    marco.record(editor::open);
    marco.record(editor::save);
    marco.record(editor::close);
    ```
    可以看出，lambda表达式相比于原始写法语义更加明确，而且使用lambda表达式完成命令者模式可以省略具体的命令者类（Open,Save,Close），因为实际上editor实例已经实现了Action接口，而record方法只需要一个函数接口，自然而然可以用现成的editor实例，这里函数的方法引用
    
- 策略模式，以个人角度，策略模式可以看做是一个方法切面，即抽象出一个方法接口，然后使用合适的类去实现这个接口，下面以压缩器为例：
    ```
    //压缩策略
    interface CompressStrategy {
        OutputStream compress(OutputStream stream);
    }
    
    //具体压缩策略
    class ZipCompressStrategy implements CompressStrategy{
        public OutputStream compress(OutputStream stream){
            return new ZipOutputStream(stream);
        }
    }
    
    class GZipCompressStrategy implements CompressStrategy{
        ...
    }
    
    class Compressor {
        CompressStrategy startegy;
        
        Compressor(CompressStrategy strategy){
            this.strategy = strategy;
        }
        
        void compress(Path in,File out){
            try(OutputStream stream = new FileOutputStream(out)){
                CompressStrategy compress = new ZipCompressStrategy(stream);
                
            }
        }
        
        
        public static void classBasedExample(Path inFile, File outFile) throws IOException {
            Compressor gzipCompressor = new Compressor(new GzipCompressionStrategy());
            gzipCompressor.compress(inFile, outFile);
        }
        
        //使用lambda表达式，可以省略具体策略类
        public static void lambdaBasedExample(Path inFile, File outFile) throws IOException {
            Compressor gzipCompressor = new Compressor(GZIPOutputStream::new);
            gzipCompressor.compress(inFile, outFile);
         }
        
    }
    ```
    这里在构造Compress对象时用了lambda表达式的构造方法引用，构造方法的签名需要保持与接口的签名一致
    
- 观察者模式：主要用于MVC模型中模型和视图的解耦
    ```
    //观察者
    interface Prober {
        void event(String name);
    }
    
    //具体观察者
    class EvilProber implements Prober {
    
        @Override
        public void event(String name) {
            System.out.println(name+" occured, ready to invade");
        }
    }
    
    class HolyProber implements Prober {
    
        @Override
        public void event(String name) {
            System.out.println(name+" occured, ready to defence");
        }
    }
    
    //事件模型
    class Moon {
        List<Prober> probers = new ArrayList<>();
    
        void addProber(Prober prober){
            probers.add(prober);
        }
    
        void event(String name){
            probers.forEach(prober -> prober.event(name));
        }
    
        public static void main(String[] args) {
            Moon moon = new Moon();
    
            //triditional solution
            EvilProber evilProber = new EvilProber();
            HolyProber holyProber = new HolyProber();
            moon.addProber(evilProber::event);
            moon.addProber(holyProber::event);
    
            //using lambda
            moon.addProber(name-> System.out.println(name+" occured, ready to invade"));
            moon.addProber(name-> System.out.println(name+" occured, ready to defence"));
    
            moon.event("moon landing ");
        }
    }

    ```
- 模板方法模式，一个抽象的算法模板，通过不同的实现算法，来实现应用于不同领域的方法。

    例如银行放贷前会做信用审查，我们可以把审查的步骤分为检查申请人身份，检查申请人历史账单，信用记录等等，然而针对企业的审查和对个人的检查是不一样的，所以我们需要一个审查算法的抽象类模板
    ```
    abstract class LoanApplication{
    
        //检查并报告
        protected void checkAndReport(){
            checkIdentity();
            checkCreditHistory();
            checkIncomeHistory();
            reportFindings();
        }
        
        //检查申请人身份
        protected abstract boolean checkIdentity();
        
        //检查申请人历史账单
        protected abstract boolean checkCreditHistory();
        
        //检查申请人信用记录
        protected abstract boolean checkIncomeHistory();
        
        //报告
        protected abstract void reportFindings();
    }
    ```
    
    接下来我们需要实现类，其实就是实现抽象模板类中的方法
    ```
    class CompanyLoanApplication extends LoanApplication{
        ...
    }
    ```
    
    如果使用lambda表达式，我们就不需要这样的一个抽象模板类，因为我们可以把抽象方法单独抽象成接口，使用lambda表达式实现函数接口，并不需要一个显式继承的类
    ```
    //Reporter类似，这里略过
    interface Checker{
        //函数方法接口（相当于Predicator）
        boolean check(){
            
        }
    }
    
    //实现接口的类
    class Company {
    
        //这里的函数名称可以任意命名
        boolean checkIdentity(){
            ...
        }
        
        boolean checkCreditHistory(){
            ...
        }
        
        boolean checkIncomeHistory(){
            ...
        }
    }
    
    //模板类
    class LoanApplication{
        Checker identity;
        Checker creditHistory;
        Checker incomeHistory;
        Reporter reportFindings;
        LoanApplication(Checker identity,Checker creditHistory,Checker incomeHistory){
            this.identity = identity;
            this.creditHistory = creditHistory;
            this.incomeHistory = incomeHistory;
        }
        
        void check(){
            identity.check();
            creditHistory.check();
            incomeHistory.check();
            reportFindings.report();
        }
    }
    
    //实现类
    class CompanyLoanApplication extends LoanApplication{
        CompanyLoanApplication(Company company){
            super(company::checkIdentity,
                company::checkCreditHistory,
                company::checkIncomeHistory);
        }
    }
    ```
    当然，因为lambda表达式使用的是函数接口，我们甚至可以使用多种方法混合,比如实现一个SpecialCompanyLoanApplication，其中构造方法的第二个参数我们传入另一个检查算法的实现（Person类的函数接口类似Company类）
    ```
    //特殊的实现类，检查公司的相关信用和公司CEO的信用历史
    class SpecialCompanyLoanApplication extends LoanApplication{
        SpecialCompanyLoanApplication(Company company,Person ceo){
            super(company::checkIdentity,
                ceo::checkCreditHistory,
                company::checkIncomeHistory);
        }
    }
    ```