## 前言

前面我们写过几篇关于webpack的文章：

- [webpack源码解析一](https://vvbug.blog.csdn.net/article/details/103531670)
- ...
- [webpack源码解析七（optimization）](https://vvbug.blog.csdn.net/article/details/107549955)

然后结合之前babel、eslint知识搭了一个比较复杂的vue项目：

- [webpack实战之（手把手教你从0开始搭建一个vue项目）](https://vvbug.blog.csdn.net/article/details/107623590)
- [手把手教你从0开始搭建一个vue项目（完结）](https://vvbug.blog.csdn.net/article/details/107637898)

在实战demo中我们有用到一个css的插件[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin),今天我们结合demo来分析一下源码。

## 简介

> This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
>
> It builds on top of a new webpack v4 feature (module types) and requires webpack 4 to work.
>
> Compared to the extract-text-webpack-plugin:
>
> - Async loading
> - No duplicate compilation (performance)
> - Easier to use
> - Specific to CSS

以上是官网的介绍～

mini-css-extract-plugin主要功能就是：“抽离css到单独的文件”，跟“extract-text-webpack-plugin”插件相比有以下优点：

- 异步加载
- 不会重复编译
- 使用很方便
- 特定于css

## 准备

我们还是用之前文章中实战的demo：[webpack-vue-demo](https://github.com/913453448/webpack-vue-demo.git)，demo已经在webpack的配置文件中配置了“mini-css-extract-plugin”插件：

webpack.config.js

```js
...
//rule的配置
.rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
...
//插件的配置
 .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
```

extract-text-webpack-plugin更多的用法和功能就不在这里介绍了，大家自己去看官网[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)。

## 开始

我们在demo的项目根目录执行build命令：

```bash
npm run build
```

然后可以看到输出的dist目录中多了一个css文件：

dist/css/app.css

```css
.app-container[data-v-5ef48958] {
    color: red;
    width: 26.66667vw
}

body, html {
    margin: 0;
    padding: 0
}

```

这里的css代码其实就是我们项目中抽离出来的css样式，在demo的，

src/app.vue:

```vue
<template>
  <div class="app-container">{{ msg }}</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class App extends Vue {
  msg = "hello world";
  user = {
    name: "yasin"
  };
  created(): void {
    // const name = this.user?.name;
    // console.log("name");
  }
}
</script>

<style scoped lang="scss">
.app-container {
  color: red;
  width: 200fpx;
}
</style>
<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}
</style>

```

可以看到，抽离出来的css样式就是app.vue文件中的style内容。

ok～ 看完了最终打包过后的效果，我们接下来就直接通过源码的角度来分析一下[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)插件，看它是怎样把我们app.vue里面的style内容单独抽离到dist/app.css文件中的。

在开始分析之前先上一张我自己总结的webpack的编译流程图：

![webpack的编译流程图](https://img-blog.csdnimg.cn/20200818191315355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Z2X2J1Zw==,size_16,color_FFFFFF,t_70#pic_center)

## 原理

这里我们提前说几个webpack的知识点：

### Dependency

比如我们在代码中使用：

```js
import 'xx.js'或者 require('xx.js')
```

的时候，webpack就会把“xx.js”看成一个依赖，然后会创建一个Dependency对象对这个依赖进行说明，包含了当前依赖的路径、context上下文等基本信息。

### Module

模块，webpack会把一个个依赖创建成一个module对象，也就是说module的创建是依赖dependency对象的，

包含了当前模块的request路径、loaders（加载器集合）、loader加载过后的源码信息、依赖之间的关系等等。

### ModuleFactory

模块工厂，正如其名一样“创建模块的工厂”，主要用于module对象的创建。

### DependencyTemplate

依赖模版，主要就是把loaders加载过后的代码编译成当前环境，比如浏览器环境能够执行的代码。

### 第一步：添加CssModuleFactory和CssDependencyTemplate

mini-css-extract-plugin/dist/index.js：

```js
... 
apply(compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      //添加CssModuleFactory，CssModuleFactory主要用于把css代码转换成webpack中的module（CssModule）
      compilation.dependencyFactories.set(_CssDependency.default, new CssModuleFactory());
      //CssDependencyTemplate主要是将CssModule编译成当前target环境（浏览器）能够执行的代码
      compilation.dependencyTemplates.set(_CssDependency.default, new CssDependencyTemplate());
      ...
```

CssModuleFactory：

```js
class CssModuleFactory {
  create({
    dependencies: [dependency]
  }, callback) {
    //直接返回一个自定义的CssModule对象
    callback(null, new CssModule(dependency));
  }

}
```

CssModule:

```js
class CssModule extends _webpack.default.Module {
  constructor(dependency) {
    super(MODULE_TYPE, dependency.context);
    this.id = '';
    this._identifier = dependency.identifier;
    this._identifierIndex = dependency.identifierIndex;
    this.content = dependency.content;
    this.media = dependency.media;
    this.sourceMap = dependency.sourceMap;
  } // no source() so webpack doesn't do add stuff to the bundle

　...
	//build方法直接执行callback返回给webpack，告诉webpack当前模块已经加载完成
  build(options, compilation, resolver, fileSystem, callback) {
    this.buildInfo = {};
    this.buildMeta = {};
   
    callback();
  }
	
 ...

}
```

### 第二步：在chunk获取清单文件的时候分离出CssModule到单独的file

mini-css-extract-plugin/dist/index.js:

```js
...
//非异步chunk渲染清单文件
compilation.mainTemplate.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
  //从当前chunk中分离出所有的CssModule
        const renderedModules = Array.from(chunk.modulesIterable).filter(module => module.type === MODULE_TYPE);

        if (renderedModules.length > 0) {
          //在当前chunk的清单文件中添加一个单独的css文件（抽离css样式到单独的file）
          result.push({
            render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
            filenameTemplate: ({
              chunk: chunkData
            }) => this.options.moduleFilename(chunkData),
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE
            },
            identifier: ${pluginName}.${chunk.id},
            hash: chunk.contentHash[MODULE_TYPE]
          });
        }
      });
	//异步chunk渲染清单文件
      compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
       //从当前chunk中分离出所有的CssModule
        const renderedModules = Array.from(chunk.modulesIterable).filter(module => module.type === MODULE_TYPE);

        if (renderedModules.length > 0) {
          //在当前chunk的清单文件中添加一个单独的css文件（抽离css样式到单独的file）
          result.push({
            render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
            filenameTemplate: this.options.chunkFilename,
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE
            },
            identifier: `${pluginName}.${chunk.id}`,
            hash: chunk.contentHash[MODULE_TYPE]
          });
        }
      });
...
```

webpack的异步和非异步模块是什么概念呢？

比如我们使用以下代码：

```js
import("xxx.js") //webpack中的一个异步chunk
```

这样的异步chunk在生成清单文件的就会走：

```js
//异步chunk渲染清单文件
      compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
       //从当前chunk中分离出所有的CssModule
        const renderedModules = Array.from(chunk.modulesIterable).filter(module => module.type === MODULE_TYPE);

        if (renderedModules.length > 0) {
          //在当前chunk的清单文件中添加一个单独的css文件（抽离css样式到单独的file）
          result.push({
            render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
            filenameTemplate: this.options.chunkFilename,
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE
            },
            identifier: `${pluginName}.${chunk.id}`,
            hash: chunk.contentHash[MODULE_TYPE]
          });
        }
      });
```

### 第三步：在loader中添加pitch函数

loader的pitch函数是什么呢？我们在[手把手带你撸一遍vue-loader源码](https://vvbug.blog.csdn.net/article/details/107722103)文章中有介绍过，vue-loader就是利用了pitch函数进行模块解析的，

![](https://img-blog.csdnimg.cn/2020073121523137.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Z2X2J1Zw==,size_16,color_FFFFFF,t_70)

比如在上图中，loader2定义了一个pitch函数，如果loader2的pitch函数中有返回值的时候，就会跳过loader3，直接执行排在loader2前面的loader1。

mini-css-extract-plugin/dist/loader.js：

```js
...
function pitch(request) {
  const options = _loaderUtils.default.getOptions(this) || {};
  (0, _schemaUtils.default)(_options.default, options, 'Mini CSS Extract Plugin Loader');
  const loaders = this.loaders.slice(this.loaderIndex + 1);
  this.addDependency(this.resourcePath);
  const childFilename = '*';
  const publicPath = typeof options.publicPath === 'string' ? options.publicPath === '' || options.publicPath.endsWith('/') ? options.publicPath : `${options.publicPath}/` : typeof options.publicPath === 'function' ? options.publicPath(this.resourcePath, this.rootContext) : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath
  };
...
    return callback(null, resultSource);
  });
}
```

### 第四步：创建一个webpack子编译器编译css依赖

mini-css-extract-plugin/dist/loader.js:

```js
...
//创建一个webpack子编译器
  const childCompiler = this._compilation.createChildCompiler(`${pluginName} ${request}`, outputOptions);

new _NodeTemplatePlugin.default(outputOptions).apply(childCompiler);
  new _LibraryTemplatePlugin.default(null, 'commonjs2').apply(childCompiler);
  new _NodeTargetPlugin.default().apply(childCompiler);
//给webpack子编译器设置入口文件（css）
  new _SingleEntryPlugin.default(this.context, `!!${request}`, pluginName).apply(childCompiler);
...
let source;
//获取webpack子编译器编译过后的代码source
  childCompiler.hooks.afterCompile.tap(pluginName, compilation => {
    source = compilation.assets[childFilename] && compilation.assets[childFilename].source(); //因为webpack子编译器编译的内容会写入到webpack主编译器的结果中，所以我们需要删除这一部分内容
    compilation.chunks.forEach(chunk => {
      chunk.files.forEach(file => {
        delete compilation.assets[file]; 
      });
    });
  });
//执行webpack子编译器
childCompiler.runAsChild((err, entries, compilation) => {
  
    const addDependencies = dependencies => {
      if (!Array.isArray(dependencies) && dependencies != null) {
        throw new Error(`Exported value was not extracted as an array: ${JSON.stringify(dependencies)}`);
      }

      const identifierCountMap = new Map();

      for (const dependency of dependencies) {
        const count = identifierCountMap.get(dependency.identifier) || 0;

        this._module.addDependency(new _CssDependency.default(dependency, dependency.context, count));

        identifierCountMap.set(dependency.identifier, count + 1);
      }
    };

    if (err) {
      return callback(err);
    }

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }

    compilation.fileDependencies.forEach(dep => {
      this.addDependency(dep);
    }, this);
    compilation.contextDependencies.forEach(dep => {
      this.addContextDependency(dep);
    }, this);

    if (!source) {
      return callback(new Error("Didn't get a result from child compiler"));
    }

    let locals;

    try {
      let dependencies;
      let exports = evalModuleCode(this, source, request); // eslint-disable-next-line no-underscore-dangle

      exports = exports.__esModule ? exports.default : exports;
      locals = exports && exports.locals;

      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]];
      } else {
        dependencies = exports.map(([id, content, media, sourceMap]) => {
          const module = findModuleById(compilation.modules, id);
          return {
            identifier: module.identifier(),
            context: module.context,
            content,
            media,
            sourceMap
          };
        });
      }

      addDependencies(dependencies);
    } catch (e) {
      return callback(e);
    }

    const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false;
    const result = locals ? `\n${esModule ? 'export default' : 'module.exports ='} ${JSON.stringify(locals)};` : '';
    let resultSource = `// extracted by ${pluginName}`;
    resultSource += options.hmr ? hotLoader(result, {
      context: this.context,
      options,
      locals
    }) : result;
    return callback(null, resultSource);
  });
...
```

### 第五步：添加webpack子编译器的结果到webpack主编译器modules中

mini-css-extract-plugin/dist/loader.js：

```js
//执行webpack子编译器
childCompiler.runAsChild((err, entries, compilation) => {
  	//添加依赖到webpack主编译器
    const addDependencies = dependencies => {
    ...
        const count = identifierCountMap.get(dependency.identifier) || 0;
				//根据子编译器结果中的dependency创建CssDependency到主编译器中
        this._module.addDependency(new _CssDependency.default(dependency, dependency.context, count));

        identifierCountMap.set(dependency.identifier, count + 1);
      }
    };
	...
    try {
      let dependencies;
      //执行webpack子编译器生成的结果，获取被webpack子编译器编译过后的css代码                   
      let exports = evalModuleCode(this, source, request); 
      exports = exports.__esModule ? exports.default : exports;
      locals = exports && exports.locals;
			//根据结果创建dependency对象
      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]];
      } else {
        dependencies = exports.map(([id, content, media, sourceMap]) => {
          const module = findModuleById(compilation.modules, id);
          return {
            identifier: module.identifier(),
            context: module.context,
            content,
            media,
            sourceMap
          };
        });
      }
		//添加dependency到webpack主编译器
      addDependencies(dependencies);
    } catch (e) {
      return callback(e);
    }
```

### 第六步：在chunk中分离出所有的CssModule到单独文件

也就是会执行前面插件中的钩子函数，

mini-css-extract-plugin/dist/index.js:

```js
...
//非异步chunk渲染清单文件
compilation.mainTemplate.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
  //从当前chunk中分离出所有的CssModule
        const renderedModules = Array.from(chunk.modulesIterable).filter(module => module.type === MODULE_TYPE);

        if (renderedModules.length > 0) {
          //在当前chunk的清单文件中添加一个单独的css文件（抽离css样式到单独的file）
          result.push({
            render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
            filenameTemplate: ({
              chunk: chunkData
            }) => this.options.moduleFilename(chunkData),
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE
            },
            identifier: ${pluginName}.${chunk.id},
            hash: chunk.contentHash[MODULE_TYPE]
          });
        }
      });
	//异步chunk渲染清单文件
      compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
       //从当前chunk中分离出所有的CssModule
        const renderedModules = Array.from(chunk.modulesIterable).filter(module => module.type === MODULE_TYPE);

        if (renderedModules.length > 0) {
          //在当前chunk的清单文件中添加一个单独的css文件（抽离css样式到单独的file）
          result.push({
            render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
            filenameTemplate: this.options.chunkFilename,
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE
            },
            identifier: `${pluginName}.${chunk.id}`,
            hash: chunk.contentHash[MODULE_TYPE]
          });
        }
      });
	//拼接所有的CssModule中的源码
 renderContentAsset(compilation, chunk, modules, requestShortener) {
   ...
   //遍历所有的CssModule，拼接所有的CssModule中的源码
    for (const m of usedModules) {
      if (/^@import url/.test(m.content)) {
        // HACK for IE
        // http://stackoverflow.com/a/14676665/1458162
        let {
          content
        } = m;

        if (m.media) {
          // insert media into the @import
          // this is rar
          // TODO improve this and parse the CSS to support multiple medias
          content = content.replace(/;|\s*$/, m.media);
        }

        externalsSource.add(content);
        externalsSource.add('\n');
      } else {
        if (m.media) {
          source.add(`@media ${m.media} {\n`);
        }

        if (m.sourceMap) {
          source.add(new SourceMapSource(m.content, m.readableIdentifier(requestShortener), m.sourceMap));
        } else {
          source.add(new OriginalSource(m.content, m.readableIdentifier(requestShortener)));
        }

        source.add('\n');

        if (m.media) {
          source.add('}\n');
        }
      }
    }

    return new ConcatSource(externalsSource, source);
  }
...
```
ok！ 整个mini-css-extract-plugin流程我们就分析完毕了，还有一些细节的内容没有展示出来了，小伙伴自己去看源码哦～

## 总结

“mini-css-extract-plugin”插件其实就是充分利用了webpack编译过程中的钩子函数，对特定编译过程进行处理，所以只有完全理解webpack编译过程才能写出牛逼的插件来，就像写“mini-css-extract-plugin”的作者一样，肯定是已经啃透了webpack源码，已经可以运用自如了，唉唉，差距还是比较大呀，不然我也不会在这里分析别人的源码了，哈哈！加油吧～ 

最后欢迎志同道合的人一起学习，一起交流！！

