# VCenter(Velocity Template API)

普通velocity只能实例化一次，在应用中使用都只能针对一个应用进行处理模版，所以每当不同应用进行调试的时候都需要重启以保证模版渲染正确，VCenter可以接受一些参数，用来直接渲染模版，同时支持多个应用，每个应用互相独立。

## 使用

*POST API*

    vmarket.taobao.net/render.do

*参数*

* app:{String}请求的应用
* text：{String} velocity内容
* data: {String} 相应的数据

*Example:*

    暂无


## License
VCenter 遵守 "MIT"：https://github.com/czy88840616/vcenter/blob/master/LICENSE.md 协议