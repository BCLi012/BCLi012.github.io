重构的第一步从来不是改代码，而是承认自己当初想复杂了。

## 问题

一个导出功能，三个月里加了七层抽象：策略模式、工厂、事件总线，最后连写这段代码的人都要先读半小时文档才能改一行。

```js
// 曾经的样子（简化示意）
const exporter = ExporterFactory.create(ExportType.CSV, {
  pipeline: new TransformPipeline([new FilterStage(), new FormatStage()]),
  hooks: { onStart, onComplete, onError },
})
```

## 做法

1. 把调用链展开，画出真实的依赖关系
2. 删掉只有一个实现的分支
3. 把状态从「层」挪回「函数参数」

```js
function exportCsv(rows) {
  const header = Object.keys(rows[0]).join(',')
  const body = rows.map((r) => Object.values(r).join(',')).join('\n')
  return header + '\n' + body
}
```

结果：480 行变 60 行，性能提升 4 倍，新同学 5 分钟上手。

## 一点体会

> 复杂度不会消失，它只会转移到某个地方 —— 你的选择只是把它放在代码里，还是放在人的脑子里。

简洁不是少写代码，而是**把责任放到正确的地方**。
