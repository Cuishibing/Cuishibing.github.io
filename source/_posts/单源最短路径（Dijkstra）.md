---
title: 单源最短路径（Dijkstra）
date: 2020-07-23 21:21:10
tags: 算法
---
## 图的邻接表表示
<!-- more -->
图的节点:
````java
/**
* 图的节点
*/
public static class GraphNode<T> {
    private T value;
    // 一条边
    private GraphSide<T> sideHead;

    // 最后一条边
    private GraphSide<T> sideTail;

    public GraphNode(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }

    public GraphSide<T> getSide() {
        return sideHead;
    }

    public GraphNode<T> side(int priority, GraphNode<T> node) {
        this.addSide(new GraphSide<T>(priority, node));
        return this;
    }

    public void addSide(GraphSide<T> side) {
        if (side.getPriority() < 0) {
            throw new IllegalStateException("priority < 0");
        }
        if (sideHead == null) {
            sideHead = side;
            sideTail = sideHead;
        } else {
            sideTail.next = side;
            sideTail = side;
        }
    }

    @Override
    public String toString() {
        return String.format("[%s]", value);
    }
}
````
图的边：
````java
/**
    * 图的边
    */
public static class GraphSide<T> {
    // 权重
    private int priority;
    // 下一条边
    private GraphSide<T> next;

    private GraphNode<T> node;

    public GraphSide(int priority, GraphNode<T> node) {
        this.priority = priority;
        this.node = node;
    }

    public GraphSide<T> getNext() {
        return next;
    }

    public GraphNode<T> getNode() {
        return node;
    }

    public int getPriority() {
        return priority;
    }
}
````
## Dijkstra算法
````java
public static <T> Map<GraphNode<T>, Integer> dijkstra(GraphNode<T> root) {
    Map<GraphNode<T>, Integer> distances = new HashMap<>();

    Deque<GraphNode<T>> queue = new LinkedList<>();

    queue.offerLast(root);
    distances.put(root, 0);

    while (queue.size() > 0) {
        GraphNode<T> fromNode = queue.pollFirst();
        GraphSide<T> side = fromNode.getSide();
        while (side != null) {
            int priority = side.getPriority();

            int newDistance = distances.get(fromNode) + priority;

            GraphNode<T> toNode = side.getNode();
            if (distances.get(toNode) == null) {
                // 第一次到达时
                distances.put(toNode, newDistance);
                queue.offerLast(toNode);
            } else if (distances.get(toNode) > newDistance) {
                // 有更近的路径
                distances.put(toNode, newDistance);
            }

            side = side.getNext();
        }
    }
    return distances;
}
````
测试:
````java
public static void main(String[] args) {
    GraphNode<Integer> n1 = new GraphNode<>(1);
    GraphNode<Integer> n2 = new GraphNode<>(2);
    GraphNode<Integer> n3 = new GraphNode<>(3);
    GraphNode<Integer> n4 = new GraphNode<>(4);
    GraphNode<Integer> n5 = new GraphNode<>(5);
    GraphNode<Integer> n6 = new GraphNode<>(6);
    GraphNode<Integer> n7 = new GraphNode<>(7);


    n1.side(1, n3).side(4, n2).side(1, n5);
    n2.side(2, n4).side(7, n5);
    n3.side(3, n4).side(5, n6);
    n4.side(6, n7);
    n5.side(4, n7);
    n6.side(2, n7);

    Map<GraphNode<Integer>, Integer> distance = dijkstra(n1);

    distance.forEach((node, dis)->{
        System.out.println(String.format("from node n1 to node %s,dis is: %s", node, dis));
    });
}
````
输出：
````
from node n1 to node [3],dis is: 1
from node n1 to node [4],dis is: 4
from node n1 to node [7],dis is: 5
from node n1 to node [5],dis is: 1
from node n1 to node [6],dis is: 6
from node n1 to node [1],dis is: 0
from node n1 to node [2],dis is: 4
````