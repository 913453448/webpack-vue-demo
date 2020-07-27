## 前言

我们前面从前端架构：

- [前端框架系列之（装饰器Decorator）](https://vvbug.blog.csdn.net/article/details/106750486)
- [前端框架系列之（vue-class-component）](https://vvbug.blog.csdn.net/article/details/106753517)
- [前端框架系列之(vue-property-decorator)](https://vvbug.blog.csdn.net/article/details/106758835)
- [前端框架系列之（mvc）](https://vvbug.blog.csdn.net/article/details/106785159)
- [前端框架系列之（mvp）](https://vvbug.blog.csdn.net/article/details/106789768)
- [前端框架系列之（mvvm）](https://vvbug.blog.csdn.net/article/details/106796122)

到项目工程化工具eslint、babel、webpack等，分别结合demo跟源码做了具体的分析：

- [前端框架系列之（eslint源码解析）](https://vvbug.blog.csdn.net/article/details/106928901)
- [前端框架系列之（eslint自定义插件）](https://vvbug.blog.csdn.net/article/details/106949203)
- [babe从入门到精通](https://vvbug.blog.csdn.net/article/details/107092536)
- ...
- [webpack源码解析七（optimization）](https://vvbug.blog.csdn.net/article/details/107549955)

接下来我们把前面的所有知识点来实战一下，就当成前面所有知识点的一个总结了。

## 需求

我们都知道，当我们用react开发一个项目的时候，我们可以用官方的脚手架[Create React App](https://github.com/facebookincubator/create-react-app)，当我们用vue开发一个项目的时候，我们也可以用官方的脚手架[vue-cli](https://github.com/vuejs/vue-cli), 用起来是真的爽啊！也不需要自己去配置eslint、babel、webpack等等，脚手架会根据你的选择自动帮你完成配置，是的！ 一般项目差不多都可以覆盖到，但是

