# 关于Loki
`Loki`是一个轻量级性能测试平台。请参见：[Loki]

[Loki]: https://github.com/jimmyseraph/loki

# 如何使用
## 1. 创建性能测试脚本
点击左侧菜单`Script Manage`，可以看到脚本列表，点击`New Script`，进入到新建脚本页面。<br>
新建脚本页面分左右两侧，左侧是一个脚本结构的树状图，可以在这个树状图上创建各个脚本组件。点击各个节点组件，可以在右侧配置组件属性。<br>
组件属性支持参数化，可以使用`${参数名}`的方式引用已存在的参数。也可以调用内部函数进行一些简单的操作，内部函数使用`${__函数名(参数...)}`来表述。目前支持的内部函数有如下这些：<br>
### `rand`
用于生成一个指定范围内的随机数，两个参数，第一个为范围下限，第二个为上限。比如生成一个10到20（不包含）之间的随机数：
```Shell
${__rand(10,20)}
```
### `jsonPath`
用于根据`json-path`来截取字符串，两个参数，第一个为需要处理的json字符串，第二个为`json-path`表达式，以`$`开头，比如：
```Shell
${__jsonPath(src,$.data.token)}
```
### `regexp`
用于根据正则表达式提取字符串，三个参数，第一个为需要处理的字符串，第二个为正则表达式，第三个为取第几个匹配的值，比如：
```Shell
${__regexp(src,zz(.*?)zz,1)}
```
### `resp.body`
用于提取上一个请求的响应的body部分。比如：
```Shell
${__resp.body()}
```
### `resp.header`
用于提取上一个请求的响应的header，一个参数，为header的名字，比如：
```Shell
${__resp.header(access-token)}
```
### `resp.code`
用于提取上一个请求的响应的response code。比如：
```Shell
${__resp.code()}
```

> 别忘了修改了组件属性后点击`Apply`保存属性。整个脚本完成后，也需要点击`Save`来保存脚本。

## 2. 创建测试计划
点击左侧菜单`Pilot Lib`，进入测试计划页面。点击`Script`下拉菜单，输入关键字查找之前保存的脚本（脚本的名字由脚本的`test plan`节点组件的`label`决定），选中脚本后，修改测试计划的名称，以及运行测试的持续时间（`Duration`）。点击`Add/Remove Agent`按钮来选择`负载代理`来执行测试。每个`负载代理`有空闲和忙碌两种状态，正处于忙碌状态的代理不可使用。选择合适的代理后，即可以调整该负载的线程数（每个负载可以单独设置线程数量）。<br>
测试计划设置完成后，点击`Start`启动测试计划。页面会自动跳转到测试报告页面。

## 3. 查看测试报告
可以从`Report`菜单进入测试报告列表页面，选择自己想查看的测试报告。测试报告的详情页分为三块，一块是测试报告基本信息，第二块是统计信息，如果测试还未结束，统计信息会不断刷新。第三块是统计图表，如果测试尚未结束，无法呈现，测试结束后才会正常显示。