新版本修复了旧bug，新增了不少功能，也可能会有稳定性风险，请酌情升级，[升级指南](https://github.com/czy88840616/avalon-node/wiki/安装及使用

###0.2.8###

* new 支持静态和动态数据web编辑的功能，模板详情界面调整
* new 支持b2b pageCache的处理
* bugfix 修复b2b查找common模块不存在的错误
* optimize 各个页面的title完善
* optimize 增加从应用详情到模板详情的链接

###0.2.7(mac支持有误)###

* bugfix 修复b2b的部分layout查找失败的bug
* bugfix 不存在json文件时，*.js文件不会生效的bug

###0.2.6###

* new 增加rundata.getModuleInfo().setLayout()的逻辑
* bugfix 修复b2b的adcms的查询逻辑
* bugfix 修复b2b的layout不存在时查找common模块下的layout的逻辑

###0.2.5###

* new 开始支持b2b的目录结构查询和模板渲染，可以选择应用归属
* bugfix assets代理的注释输出会被*/截断时做一些处理
* optimize info页面nav加入文档链接
* optimize 暂时隐藏api的选择

###0.2.4###

* bugfix mac下dos2unix的错误
* optimize 带下划线的vm进行命名提示

###0.2.3###

* bugfix 空模板，但有数据时输出成json结构而不是404
* bugfix 修复一个因为远端404返回报错而导致更新状态判断错误的问题

###0.2.2###

* new 新增快照功能，当本地模板没有改动时，快照可以大大提高展现效率 @neekey
* bugfix 当没有配置域名转ip时，ip填充为127.0.0.1，这样可以在域名绑定时，保证404取到css
* bugfix 空screen的layout渲染 #issue6
* bugfix 同级别default.vm的layout获取错误
* bugfix ie系列不存在JSON对象的fix #issue10
* optimize 首页查看直接链接到当前选中应用的详情
* optimize 应用详情列表对齐
* optimize vmcommon未变化失去焦点不刷新
* optimize 修改检测更新频率，集成在吊顶中
* optimize 工具类placeholder修改，填充成默认值（尝试） #issue4
* optimize 移除吊顶因为github图片而遮住响应式布局的问题

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
