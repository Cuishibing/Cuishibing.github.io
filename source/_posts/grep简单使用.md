---
title: grep简单使用
date: 2020-04-06 13:35:50
tags: Linux
---

## 基本使用
````bash
grep [options] pattern files
````
- 只显示文件名称
    -h
- 使用正则表达式匹配
    -E
- 只显示匹配的内容
    -o

## 和find搭配使用
有些时候我们可以先用find根据文件名称做完过滤后再使用grep搜索，此时可以这样：
````bash
find ./ -name "xxx" | xargs grep
````