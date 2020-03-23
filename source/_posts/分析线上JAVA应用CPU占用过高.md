---
title: 分析线上JAVA应用CPU占用过高
date: 2020-03-23 13:29:34
tags: 想法
---
提出问题：遇到线上服务CPU占用过高应该怎么办？

为了探索这个问题，先简单模拟一个将会占用大量CPU时间的程序：
````java
public class App {
    public static void main(String[] args) {
        ExecutorService service = Executors.newFixedThreadPool(10);

        for(int i = 0;i<10;i++) {
            service.submit(()->{
                while (true) {
                    for (int j = 0; j< 10000; j++) {
                        Object a = new Object();
                    }
                }
            });
        }
    }
}
````
<!-- more -->
创建10个线程，每个线程不停的创建对象，然后启动该程序，启动程序后，明显感到电脑风扇开始转动。。。

现在回到一开始的问题：线上服务突然CPU飙升，如何排查。

- 首先我认为应该定位到底是哪一个进程占用了过多的CPU   

    使用`top`命令基本可以定位具体的线程，输入top命令后输出如下：   
    ![](./top.png)
    通过`%Cpu(s)`这一行可以看到当前cpu占用已经达到100%（关于top命令输出的具体含义{% post_link top命令 [看这] %}），通过下面的列表可以看到占用最多的是一个PID为3792的java进程，毫无疑问是我刚才启动的例子程序，使用top命令很快能找到占用cpu的罪魁祸首。

- 上面找到了具体的进程，一个进程内一般有很多个线程，下一步就是定位是哪些线程占用了更多的cpu，进一步找到具体的代码？   

    可以通过`ps`命令，查看瞬时进程或线程状态，输入`ps u -L 3792`查看进程号为3792的线程信息，输入命令后输出入下：   
    ![](./ps.png)
    可以明显看到，最后十个线程占用cpu是最多的，符合我们的例子程序，具体的线上问题可能比较复杂。通过ps命令可以找到具体是哪些线程导致cpu占用过高，然后结合java工具`jstack`可以找到具体的调用栈。   

    linux下的线程id和jstack的输出中的线程id需要做16进制转换，选择第一个线程3805，转换成16进制就是：EDD
    输入命令`jstack -l 3792 | grep EDD`，输出如下：
    ![](./jstack.png)
    可以很明显的看到当前线程的调用栈，在App.java的20行。

如何分析JAVA应用cpu占用过高，可以使用以上方法。