###0.2.2###

* new 新增快照功能，当本地模板没有改动时，快照可以大大提高展现效率
* bugfix 当没有配置域名转ip时，ip填充为127.0.0.1，这样可以在域名绑定时，保证404取到css
* bugfix 空screen的layout渲染
* bugfix 同级别default.vm的layout获取错误

###0.2.1###

* new 新增Metro风格主题
* new 新增api配置和启动自动打开浏览器的配置
* optimize 高亮有数据的vm链接，方便查找
* bugfix 移除velocity注释时的bug

###0.2.0###

* bugfix 调整assets和页面输出编码，让浏览器自己判断
* bugfix 分析模板路径错误和未找到模板目录的报错处理 #issue5
* optimize 解析模板时先过滤一次注释，以免注释的模板做处理
* optimize 一些文案、描述，提示，清理无用依赖和代码
* new 新页底，404页面
* new 通过*.vm可以查看当前页面的信息，包括json和模板依赖的情况
* new 当新增同名应用时，会把旧应用的工具类合并到当前新应用中 #issue7

###0.1.7###

* bugfix 因为上一版加了默认module导致没有module的页面失效了
* bugfix assets代理问题，仅带有问号的参数会代理失败

###0.1.6###

* bugfix 工具类删除失败
* bugfix 本地代理在mac匹配路径错误
* bugfix 设置默认module渲染失败的情况

###0.1.5###

* bugfix 未查找默认layout导致渲染页面为空
* new 给动态逻辑添加了appConfig对象
* new 首页新增更新提醒
* new 新增一个启动参数-o 用于打开初始化页面

###0.1.4###

* bugfix 未分析目录直接点保存也会执行
* bugfix 填写路径后多了斜杠导致应用名出错
* bugfix 添加一个命令vm help用于打开帮助文档，导航也添加了文档链接
* bugfix 访问localhost时的assets处理

###0.1.2~0.1.3###

* bugfix mac npm install encoding error

###0.1.1###

* bugfix assets代理的一个小问题

###0.1.0###

* 基本实现了旧版vmarket拥有的功能
* 废弃旧向导，使用新的ui方式进行交互
* 实现了js处理业务逻辑代替以前的groovy方式
