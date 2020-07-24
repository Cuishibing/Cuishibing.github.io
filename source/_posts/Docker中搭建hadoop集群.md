---
title: Docker中搭建hadoop集群
date: 2020-06-27 21:13:48
tags: Hadoop
---
## 前言
近来想学习一下hadoop，毕竟大数据相关的东西目前还是比较火的，因为不想在本机上起比较多的虚拟机，于是使用docker来搭建一个hadoop集群。hadoop官网：http://hadoop.apache.org/
## 搭建过程
### 安装docker，无论是在win还是linux下都是傻瓜安装的
配置docker的阿里云加速镜像地址：
````json
    {
    "registry-mirrors": [
        "https://xxx.mirror.aliyuncs.com" // 该地址在阿里云控制台中个人用户可以申请，每个人申请的都不一样
        ]
    }    
````
<!-- more -->
如果不配置国内的镜像地址，默认官方的地址下载速度很慢
### 启动基础的容器
这里我使用ubuntu镜像作为基础镜像
````shell
    docker pull ubuntu
````
默认会拉取最新版本，拉取镜像后根据该镜像启动一个容器：
````shell
    docker run -it ubuntu bash
````
### 容器内部配置
#### 设置root密码
````shell
    passwd root
````
#### ssh服务安装
````shell
    apt install openssh-server
````
#### ssh免密码登录
因为hadoop的脚本需要登陆到其它节点执行任务，所以需要配置免密码登录
````shell
    ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    chmod 0600 ~/.ssh/authorized_keys
````
简单来说，就是在登陆节点生成一个密匙，然后把公匙加入到被登录节点的authorized_keys文件中；这里我们只是自己生成公匙生成加入自己的authorized_keys，但是之后我们以当前容器打包成docker镜像再启动从节点后，当前主节点就能免密码访问从节点了。
#### 下载hadoop
````shell
    wget https://mirrors.bfsu.edu.cn/apache/hadoop/common/hadoop-3.2.1/hadoop-3.2.1.tar.gz
````
下载完成后解压到目录
#### 下载openjdk8
亲测使用openjdk11会有一些想不到的问题：
````shell
    apt install openjdk-8-jdk
````
下载完成后配置JAVA_HOME等环境变量
### 配置hadoop
#### core-site.xml
````xml
  <property>
    <name>hadoop.http.staticuser.user</name>
    <value>root</value>
  </property>
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://hadoop-name-node:9000</value>
  </property>
````
其中`fs.defaultFS`参数为hadoop的`name node`节点的地址和端口，hadoop的name node负责整个集群的元数据信息。比如：访问一个文件，只有name node知道该文件的基本信息，以及存储在哪些data node中。data node也会定期向name node汇报自身的信息。
#### hadoop-env.sh
配置日志地址，默认日志地址在安装目录下
````shell
export HADOOP_LOG_DIR=/root/logs/hadoop
````
配置JAVA_HOME
````shell
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"
````
#### hdfs-site.xml
````xml
<configuration>
  <property>
      <name>dfs.replication</name> <!-- 该参数不是必须要配置的，只是自己本地实验，hdfs复制个数配置为1 -->
      <value>1</value>
  </property>
</configuration>
````
#### mapred-site.xml
````xml
<configuration>
  <!-- 下面两个参数是为了使用yarn执行job需要配置的 -->
  <property>
      <name>mapreduce.framework.name</name>
      <value>yarn</value>
  </property>
  <property>
      <name>mapreduce.application.classpath</name>
      <value>$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/*:$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/lib/*</value>
  </property>
</configuration>
````
#### yarn-site.xml
````xml
<configuration>
  <!-- 配置resourcemanager的ip和地址，这里我把namenode和yarn部署在同一个节点上，所以写的是namenode的host -->
  <property>
      <name>yarn.resourcemanager.hostname</name>
      <value>hadoop-name-node</value>
  </property>
  <property>
      <name>yarn.nodemanager.aux-services</name>
      <value>mapreduce_shuffle</value>
  </property>
  <property>
      <name>yarn.nodemanager.env-whitelist</name>
      <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME</value>
  </property>
</configuration>
````
#### start-dfs.sh,stop-dfs.sh,start-yarn.sh,stop-yarn.sh
因为我全程使用root账户操作，所以这四个脚本里需要配置下面的变量，默认情况下是使用hdfs用户
````shell
HDFS_DATANODE_USER=root
HADOOP_SECURE_DN_USER=hdfs
HDFS_NAMENODE_USER=root
HDFS_SECONDARYNAMENODE_USER=root
````
#### hdfs
同样是因为使用root账户操作的原因
````shell
HADOOP_SHELL_EXECNAME="root" //生产环境不要这样做
````
#### /etc/profile
pdsh默认采用的是rsh登录，修改成ssh登录
````shell
export PDSH_RCMD_TYPE=ssh
````
### 设置ssh服务自启动（在docker环境需要此步骤）
通过上面的配置，hadoop的配置已经完成，但是在docker环境下，ssh服务虽然配置了自启动，但是在容器启动的时候并不生效