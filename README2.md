## 前言

上一节[webpack实战之（手把手教你从0开始搭建一个vue项目）](https://vvbug.blog.csdn.net/article/details/107623590)最后我们完成了css样式的配置：

webpack.config.js：

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks:["app"], //指定需要加载的chunk
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
module.exports = config.toConfig();
```

![css配置](https://img-blog.csdnimg.cn/20200727225316876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Z2X2J1Zw==,size_16,color_FFFFFF,t_70)

## 配置

### babel

看一下我们当前项目中的测试代码，src/app.vue:

```tsx
<template>
    <div class="app-container">{{this.msg}}</div>
</template>

<script lang="ts">
  import {Vue, Component} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    msg="hello world";
    user={
      name: "yasin"
    };
    created(){
        const name=this.user?.name;
        console.log("name");
    }
  }
</script>

<style scoped lang="scss">
.app-container{
    color: red;
}
</style>
```

比如我们需要用到最新的`optional-chaining`语法：

```js
 const name=this.user?.name;
```

我们试着运行一下我们的demo：

```bash
...
ERROR in ./src/app.vue?vue&type=script&lang=ts& (./node_modules/ts-loader??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/app.vue?vue&type=script&lang=ts&) 12:31
Module parse failed: Unexpected token (12:31)
File was processed with these loaders:
 * ./node_modules/ts-loader/index.js
 * ./node_modules/vue-loader/lib/index.js
You may need an additional loader to handle the result of these loaders.
|     }
|     created() {
>         const name = this.user?.name;
|         console.log("name");
|     }
 @ ./src/app.vue?vue&type=script&lang=ts& 1:0-160 1:176-179 1:181-338 1:181-338
 @ ./src/app.vue
 @ ./src/main.ts
 @ multi ./src/main.ts

```

可以发现，报错了！ 提示我们“该语法解析器不能解析”，有小伙伴可能发现了，在我们demo中我们还用到了：

```tsx
 import {Vue, Component} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
```

装饰器语法，那demo之前也没报错啊，为什么呢？ 因为我们用的是ts的解析器，ts解析器是可以解析装饰器这种语法的：

```tsx
<script lang="ts">
```

我们把`lang="ts"`去掉试试：

```tsx
<template>
    <div class="app-container">{{this.msg}}</div>
</template>

<script lang="ts">
  import {Vue, Component} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    msg="hello world";
    user={
      name: "yasin"
    };
    created(){
        const name=this.user?.name;
        console.log("name");
    }
  }
</script>

<style scoped lang="scss">
.app-container{
    color: red;
}
</style>
```

```bash
ERROR in ./src/app.vue?vue&type=script&lang=js& (./node_modules/vue-loader/lib??vue-loader-options!./src/app.vue?vue&type=script&lang=js&) 8:0
Module parse failed: Unexpected character '@' (8:0)
File was processed with these loaders:
 * ./node_modules/vue-loader/lib/index.js
You may need an additional loader to handle the result of these loaders.
| import {Vue, Component} from "vue-property-decorator";
| 
> @Component
| export default class App extends Vue {
|   msg="hello world";
 @ ./src/app.vue?vue&type=script&lang=js& 1:0-115 1:131-134 1:136-248 1:136-248
 @ ./src/app.vue
 @ ./src/main.ts
 @ multi ./src/main.ts

```

ok! 可以看到，这次报的是装饰器语法解析失败了，知道原因后，我们该怎么解决呢？ 看过前面babel系列文章的童鞋应该是立马就想到了babel，那么接下来我们就配置一下babel。

#### @babel/core（babel核心）

```bash
yarn add -D @babel/core || npm install -D @babel/core
```

#### @babel/preset-env (env预设)

做es6语法转换、添加polyfill。

```bash
yarn add -D @babel/preset-env || npm install -D @babel/preset-env
```

#### @babel/plugin-transform-runtime (运行时插件)

添加一些babel转换时候的帮助函数。

```bash
yarn add -D @babel/plugin-transform-runtime || npm install -D @babel/plugin-transform-runtime
```

#### babel-loader (es加载器)

```bash
yarn add -D babel-loader || npm install -D babel-loader
```

#### core-js (preset-env设置polyfill的依赖)

```bash
yarn add -D core-js || npm install -D core-js
```

ok, 安装完babel的一些依赖后，我们开始配置webpack，首先是对js、jsx的babel配置：

```js
 .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
```

然后是ts、tsx的配置：

```js
 .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
```

整个配置文件，webpack.config.js：

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks:["app"], //指定需要加载的chunk
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
module.exports = config.toConfig();
```

然后我们再次运行`npm run dev`指令：

```js
ERROR in ./src/app.vue?vue&type=script&lang=js& (./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/app.vue?vue&type=script&lang=js&)
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: xxx/webpack-vue-demo/src/app.vue: Support for the experimental syntax 'decorators-legacy' isn't currently enabled (8:1):

   6 | import {Vue, Component} from "vue-property-decorator";
   7 | 
>  8 | @Component
     | ^
   9 | export default class App extends Vue {
  10 |   msg="hello world";
  11 |   user={
    at Parser._raise (xxx/webpack-vue-demo/node_modules/@babel/parser/lib/index.js:757:17)
    at Parser.raiseWithData (xxx/webpack-vue-demo/node_modules/@babel/parser/lib/index.js:750:17)

```

可以看到，还是报错，这是为什么呢？ 因为我们没有对babel进行配置，我们在项目根目录创建一个babel.config.js文件，然后进行babel配置：

babel.config.js

```js
module.exports = {
  presets: [
    [
      "@babel/preset-env", //添加preset-env预设做语法转换跟polyfill添加
      {
        corejs: 3,
        useBuiltIns: "usage",
        modules: false
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime", //利用runtime做helpers跟regenerator设置
      {
        corejs: false,
        helpers: true,
        useESModules: false,
        regenerator: true,
        absoluteRuntime: "./node_modules"
      }
    ]
  ]
};

```

配置我就不详细解说了，前面babel的文章中都有解析。

ok，我们再次运行`npm run dev`:

```js
ERROR in ./src/app.vue?vue&type=script&lang=js& (./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/app.vue?vue&type=script&lang=js&)
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: xxx/webpack-vue-demo/src/app.vue: Support for the experimental syntax 'decorators-legacy' isn't currently enabled (8:1):

   6 | import {Vue, Component} from "vue-property-decorator";
   7 | 
>  8 | @Component
     | ^
   9 | export default class App extends Vue {
  10 |   msg="hello world";
  11 |   user={

```

ok, 还是报装饰器语法无法解析，看过前面babel的同学应该是知道的，babel-preset-env默认是不添加“decorators”插件的，因为“decorators”还在提案2阶段不稳定, 那我们需要在js中使用“decorators”怎么办呢？ 我们前面也有文章单独介绍过“装饰器”，看过的童鞋应该是知道的，

安装“decorators”插件：

```bash
yarn add -D @babel/plugin-proposal-decorators || npm install -D @babel/plugin-proposal-decorators
```

安装“类属性”插件：

```bash
yarn add -D @babel/plugin-proposal-class-properties || npm install -D @babel/plugin-proposal-class-properties
```

配置babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env", //添加preset-env预设做语法转换跟polyfill添加
            {
                corejs: 3,
                useBuiltIns: "usage",
                modules: false
            }
        ]
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators",{ //装饰器插件
          legacy: true
        }],
        "@babel/plugin-proposal-class-properties", //类属性插件
        [
            "@babel/plugin-transform-runtime", //利用runtime做helpers跟regenerator设置
            {
                corejs: false,
                helpers: true,
                useESModules: false,
                regenerator: true,
                absoluteRuntime: "./node_modules"
            }
        ]
    ]
};

```

注意⚠️： 两个插件的顺序一定不要弄反哦！

然后我们再次运行`npm run dev`:

```bash
npm run dev
...
ℹ ｢wdm｣: Compiled successfully.
```

可以看到，最后显示编译成功了，我就不截图了，浏览器中应该会显示“hello world”文字的。

同样，我们把`lang`改成`ts`也是可以正常运行的：

src/app.vue

```jsx
<template>
    <div class="app-container">{{this.msg}}</div>
</template>

<script lang="ts">
  import {Vue, Component} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    msg="hello world";
    user={
      name: "yasin"
    };
    created(){
        const name=this.user?.name;
        console.log("name");
    }
  }
</script>

<style scoped lang="scss">
.app-container{
    color: red;
}
</style>
```

因为我们在webpack的loader中给ts也添加了babel配置：

```js
.rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
```

### jsx

上一节我们还说了，我们的工程是需要支持js、jsx、ts、tsx的，现在js跟ts都是支持的，那么我们需要怎么支持jsx跟tsx呢？

ok！ 在vue中vue官方已经给我们提供了一个第三方库供我们使用jsx，下面我们安装一下：

#### @vue/babel-preset-jsx

```bash
yarn add -D @vue/babel-preset-jsx || npm install -D @vue/babel-preset-jsx
```

然后直接配置到我们的babel配置文件即可，

babel.config.js：

```js
module.exports = {
    presets: [
        "@vue/babel-preset-jsx", //vue支持jsx跟tsx
        [
            "@babel/preset-env", //添加preset-env预设做语法转换跟polyfill添加
            {
                corejs: 3,
                useBuiltIns: "usage",
                modules: false
            }
        ]
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators",{ //装饰器插件
          legacy: true
        }],
        "@babel/plugin-proposal-class-properties", //类属性插件
        [
            "@babel/plugin-transform-runtime", //利用runtime做helpers跟regenerator设置
            {
                corejs: false,
                helpers: true,
                useESModules: false,
                regenerator: true,
                absoluteRuntime: "./node_modules"
            }
        ]
    ]
};

```

没错！ 就是这么简单～ 为了验证一下我们在src目录下创建一个app.tsx文件，

src/app.tsx:

```tsx
import {Vue, Component} from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
    msg = "hello tsx";

    render(h) {
        return (
            <div>{this.msg}</div>
        );
    }
}
```

代码很简单，我们直接用tsx输出一个msg为“hello tsx”，然后我们修改一下main.ts入口文件，

main.ts：

```tsx
import Vue from "vue";
// import App from "./app.vue";
import App from "./app";

new Vue({
  el: "#app",
  render: (h) => h(App)
});
```

然后我们运行`npm run dev`:

![result-tsx](/Users/ocj1/doc/h5/study/webpack/webpack-vue-demo/result-tsx.png)

可以看到，页面中正常显示了我们的内容。

### eslint

#### eslint（eslint核心）

```bash
yarn add -D eslint || npm install -D eslint
```

#### eslint-loader (eslint加载器)

```bash
yarn add -D eslint-loader || npm install -D eslint-loader
```

#### eslint-plugin-vue (解析vue模版)

```bash
yarn add -D eslint-plugin-vue || npm install -D eslint-plugin-vue
```

#### @typescript-eslint/eslint-plugin(ts eslint插件)

```bash
yarn add -D @typescript-eslint/eslint-plugin || npm install -D @typescript-eslint/eslint-plugin
```

#### @typescript-eslint/parser (ts解析器，供eslint-plugin-vue解析vue模版以外语法使用)

```js
yarn add -D @typescript-eslint/parser || npm install -D @typescript-eslint/parser
```

#### @vue/eslint-config-typescript (vue中对ts写法的一些好的建议)

```bash
yarn add -D @vue/eslint-config-typescript || npm install -D @vue/eslint-config-typescript
```

#### eslint-plugin-prettier (比较好的一些js语法建议)

```bash
yarn add -D eslint-plugin-prettier || npm install -D eslint-plugin-prettier
```

#### @vue/eslint-config-prettier (vue推荐的比较好的写法)

```bash
yarn add -D @vue/eslint-config-prettier || npm install -D @vue/eslint-config-prettier
```

ok, 我们已经安装了我们需要的一些eslint依赖，然后我们去webpack配置中添加eslint-loader，

webpack.config.js：

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = !!process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .rule('eslint')//添加eslint-loader
            .exclude
                .add(/node_modules/)//校验的文件除node_modules以外
                .end()
            .test(/\.(vue|(j|t)sx?)$/)//加载.vue、.js、.jsx、.ts、.tsx文件
                .use('eslint-loader')
                .loader(require.resolve('eslint-loader'))
                .options({
                    emitWarning: true, //出现警告是否终止webpack编译
                    emitError: !isDev, //生成环境编译报错
                })
                .end()
            .end()
         .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks:["app"], //指定需要加载的chunk
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
module.exports = config.toConfig();
```

然后我们在根目录创建一个eslint配置文件，.eslintrc.json：

```json
{
  "env": {
    "node": true //主要争对webpack配置文件等等node环境
  },
  "plugins": [
    "vue" //添加eslint-plugin-vue插件
  ],
  "extends": [
    "eslint:recommended", //eslint推荐语法
    "plugin:vue/recommended", //使用vue推荐语法
    "@vue/typescript/recommended",//继承typescript插件的recommended配置
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  "rules": {
    "semi": [
      "error",
      "always"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "no-console": "error"
  }
}


```

eslint不熟的童鞋可以看前面关于eslint的文章。

有些文件我们不需要进行eslint校验，所以我们直接在根目录创建一个.eslintignore文件声明，

.eslintignore：

```js
node_modules/*
public/*
dist/*
webpack.config.js
```

然后我们运行`npm run dev`:

```bash
ERROR in ./src/app.tsx
Module Error (from ./node_modules/eslint-loader/dist/cjs.js):

/Users/ocj1/doc/h5/study/webpack/webpack-vue-demo/src/app.tsx
   1:9   warning  Replace `Vue,·Component` with `·Vue,·Component·`                                                                prettier/prettier
   5:3   warning  Delete `··`                                                                                                     prettier/prettier
   7:3   warning  Delete `··`                                                                                                     prettier/prettier
   7:5   warning  Missing return type on function                                                                                 @typescript-eslint/explicit-module-boundary-types
   7:12  warning  Argument 'h' should be typed                                                                                    @typescript-eslint/explicit-module-boundary-types
   7:12  warning  'h' is defined but never used                                                                                   @typescript-eslint/no-unused-vars
   8:1   warning  Replace `········return·(⏎············<div>{this.msg}</div>⏎········)` with `····return·<div>{this.msg}</div>`  prettier/prettier
  11:1   warning  Delete `··`                                                                                                     prettier/prettier
  12:2   warning  Insert `⏎`                                                                                                      prettier/prettier

✖ 9 problems (0 errors, 9 warnings)
  0 errors and 6 warnings potentially fixable with the `--fix` option.

 @ ./src/main.ts 3:0-24 7:13-16
 @ multi ./src/main.ts

ERROR in ./src/main.ts
Module Error (from ./node_modules/eslint-loader/dist/cjs.js):

/Users/ocj1/doc/h5/study/webpack/webpack-vue-demo/src/main.ts
  3:24  warning  Insert `;`              prettier/prettier
  3:24  error    Missing semicolon       semi
  7:11  warning  Replace `(h)` with `h`  prettier/prettier
  8:4   warning  Insert `⏎`              prettier/prettier

✖ 4 problems (1 error, 3 warnings)
  1 error and 3 warnings potentially fixable with the `--fix` option.

 @ multi ./src/main.ts app[0]
Child HtmlWebpackCompiler:
     1 asset
    Entrypoint HtmlWebpackPlugin_0 = __child-HtmlWebpackPlugin_0
    [./node_modules/html-webpack-plugin/lib/loader.js!./public/index.html] 469 bytes {HtmlWebpackPlugin_0} [built]
ℹ ｢wdm｣: Failed to compile.

```

可以看到，报了很多警告跟错误，我们尝试修复一下，为了方便，我们在package.json中声明一个lint脚本，

package.json：

```json
{
  "name": "webpack-vue-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rimraf dist && webpack --mode=production",
    "dev": "webpack-dev-server --mode=development --progress",
    "lint": "eslint ./src/* --fix"
  },
  ...
```

然后我们执行`npm run lint`把一些能修复的修复掉：

```bash
...
Module Error (from ./node_modules/eslint-loader/dist/cjs.js):

xx/webpack/webpack-vue-demo/src/app.tsx
  7:3   warning  Missing return type on function  @typescript-eslint/explicit-module-boundary-types
  7:10  warning  Argument 'h' should be typed     @typescript-eslint/explicit-module-boundary-types
  7:10  warning  'h' is defined but never used    @typescript-eslint/no-unused-vars

✖ 3 problems (0 errors, 3 warnings)

```

可以看到有一些警告都是关于src/app.tsx文件的，

src/app.tsx:

```tsx
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(h) {
    return <div>{this.msg}</div>;
  }
}

```

说我们的render函数没有定义返回值，ok！ 我们直接加上返回值：

```tsx
 import { VNode } from "vue";
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(h):VNode {
    return <div>{this.msg}</div>;
  }
}

```

然后说h变量没用，ok，我们直接去掉：

```tsx
import { VNode } from "vue";
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render():VNode {
    return <div>{this.msg}</div>;
  }
}
```

ok，解决完毕后，我们再次执行`npm run dev`的时候就没有错误跟警告信息了。

一般在开发环境为了更好的显示错误信息，我们直接利用webpack.devServer的overlay显示到页面中去，

webpack.config.js：

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = !!process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .rule('eslint')//添加eslint-loader
            .exclude
                .add(/node_modules/)//校验的文件除node_modules以外
                .end()
            .test(/\.(vue|(j|t)sx?)$/)//加载.vue、.js、.jsx、.ts、.tsx文件
                .use('eslint-loader')
                .loader(require.resolve('eslint-loader'))
                .options({
                    emitWarning: true, //把eslint报错当成webpack警告
                    emitError: !isDev, //把eslint报错当成webapck的错误
                })
                .end()
            .end()
         .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks:["app"], //指定需要加载的chunk
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
        .overlay({
            warnings: true,
            errors: true
        }) //webpack错误和警告信息显示到页面
module.exports = config.toConfig();
```

#### fork-ts-checker-webpack-plugin

校验ts语法，会把ts的一些报错通过eslint展现出来。

```bash
yarn add -D fork-ts-checker-webpack-plugin || npm install -D fork-ts-checker-webpack-plugin
```

ok，然后我们把该插件配置到webpack：

babel.config.js

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = !!process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,  // disable type checker - we will use it in fork plugin
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .rule('eslint')//添加eslint-loader
            .exclude
                .add(/node_modules/)//校验的文件除node_modules以外
                .end()
            .test(/\.(vue|(j|t)sx?)$/)//加载.vue、.js、.jsx、.ts、.tsx文件
                .use('eslint-loader')
                .loader(require.resolve('eslint-loader'))
                .options({
                    emitWarning: true, //把eslint报错当成webpack警告
                    emitError: !isDev, //把eslint报错当成webapck的错误
                })
                .end()
            .end()
         .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks:["app"], //指定需要加载的chunk
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .plugin('fork-ts-checker') //配置fork-ts-checker
        .use(require('fork-ts-checker-webpack-plugin'), [{
            eslint: {
                files: './src/**/*.{ts,tsx,js,jsx,vue}' // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
            },
            typescript: {
                extensions: {
                    vue: {
                        enabled: true,
                        compiler: "vue-template-compiler"
                    },
                }
            }
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
        .overlay({
            warnings: true,
            errors: true
        }) //webpack错误和警告信息显示到页面
module.exports = config.toConfig();
```

ok, 配置完毕后我们简单测试一下，比如我们的src/app.tsx:

```tsx
import { VNode } from "vue";
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(): VNode {
    return <div>{this.msg}</div>;
  }
}

```

然后我们在render方法中把msg的值改改：

```tsx
import { VNode } from "vue";
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(): VNode {
    this.msg = 1;
    return <div>{this.msg}</div>;
  }
}
```

我们直接把一个string类型的变量改成了number，然后我们运行`npm run dev`:

```bash
...
ℹ ｢wdm｣: Compiled successfully.
Issues checking in progress...
ERROR in src/app.tsx 9:5-13
TS2322: Type '1' is not assignable to type 'string'.
     7 | 
     8 |   render(): VNode {
  >  9 |     this.msg = 1;
       |     ^^^^^^^^
    10 |     return <div>{this.msg}</div>;
    11 |   }
    12 | }
ERROR in src/app.tsx 9:5-13
TS2322: Type '1' is not assignable to type 'string'.
     7 | 
     8 |   render(): VNode {
  >  9 |     this.msg = 1;
       |     ^^^^^^^^
    10 |     return <div>{this.msg}</div>;
    11 |   }
    12 | }

ERROR in src/app.tsx 10:12-17
TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
     8 |   render(): VNode {
     9 |     this.msg = 1;
  > 10 |     return <div>{this.msg}</div>;
       |            ^^^^^
    11 |   }
    12 | }
    13 | 

ERROR in src/app.tsx 10:27-33
TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
     8 |   render(): VNode {
     9 |     this.msg = 1;
  > 10 |     return <div>{this.msg}</div>;
       |                           ^^^^^^
    11 |   }
    12 | }
    13 | 


```

ok, 可以看到，直接报错了，说“Type '1' is not assignable to type 'string'.” 这说明我们的配置起作用了，同时还报了一些错误，说找不到“JSX.IntrinsicElements”类型。

ok！ 我们直接在src目录底下定义一个shims-tsx.d.ts文件，然后用命名空间形式去声明一个JSX模块，

shims-tsx.d.ts：

```tsx
import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

```

再次运行会发现没有报错了。

### optimization

#### 生成环境的代码压缩并且去掉所有注释

```js
config.when(!isDev,()=>{
    config.optimization
            .minimize(true)
            .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false, //去除注释
                terserOptions:{
                    output: {
                        comments: false //去除注释
                    }
                }
            }]);
},()=>{

});
```

#### devtool开发改成“eval-cheap-module-source-map”加快速度

```js
config.when(!isDev,()=>{
    config.optimization
            .minimize(true)
            .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false, //去除注释
                terserOptions:{
                    output: {
                        comments: false //去除注释
                    }
                }
            }]);
},()=>{
    config.devtool("eval-cheap-module-source-map");
});
```

#### 分包机制优化

```js
config.optimization
            .splitChunks({
                cacheGroups: {
                    vendors: { //分离入口文件引用node_modules的module（vue、@babel/xxx）
                        name: `chunk-vendors`,
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        chunks: 'initial'
                    },
                    common: { //分离入口文件引用次数>=2的module
                        name: `chunk-common`,
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    }
                }
            })
            .runtimeChunk("single"); //分离webpack的一些帮助函数，比如webpackJSONP等等
```

同样，html-webpack-plugin插件也需要修改一下：

```js
 .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks: ["runtime", "chunk-vendors", "chunk-common", "app"], //指定需要加载的chunks
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
```

webpack全局配置，webpack.config.js：

```js
const path = require("path");
const config = new (require("webpack-chain"))();
const isDev = !!process.env.WEBPACK_DEV_SERVER;
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename("[name].[hash:8].js")
        .end()
    .resolve
        .extensions
            .add(".js").add(".jsx").add(".ts").add(".tsx").add(".vue") //配置以.js等结尾的文件当模块使用的时候都可以省略后缀
            .end()
        .end()
    .module
        .rule('js')
            .test(/\.m?jsx?$/) //对mjs、mjsx、js、jsx文件进行babel配置
            .exclude
                .add(filepath => {
                    // Don't transpile node_modules
                    return /node_modules/.test(filepath)
                })
                .end()
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .end()
        .rule("type-script")
            .test(/\.tsx?$/) //loader加载的条件是ts或tsx后缀的文件
            .use("babel-loader")
                .loader("babel-loader")
                .end()
            .use("ts-loader")
                .loader("ts-loader")
                .options({ //ts-loader相关配置
                    transpileOnly: true,  // disable type checker - we will use it in fork plugin
                    appendTsSuffixTo: ['\\.vue$']
                })
                .end()
            .end()
        .rule("vue")
            .test(/\.vue$/)// 匹配.vue文件
                .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)//sass和scss文件
            .use("extract-loader")//提取css样式到单独css文件
                .loader(require('mini-css-extract-plugin').loader)
                .options({
                    hmr: isDev //开发环境开启热载
                })
                .end()
            .use("css-loader")//加载css模块
                .loader("css-loader")
                .end()
            .use("postcss-loader")//处理css样式
                .loader("postcss-loader")
                .options( {
                    config: {
                       path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")//sass语法转css语法
                .loader("sass-loader")
                .end()
            .end()
        .rule('eslint')//添加eslint-loader
            .exclude
                .add(/node_modules/)//校验的文件除node_modules以外
                .end()
            .test(/\.(vue|(j|t)sx?)$/)//加载.vue、.js、.jsx、.ts、.tsx文件
                .use('eslint-loader')
                .loader(require.resolve('eslint-loader'))
                .options({
                    emitWarning: true, //把eslint报错当成webpack警告
                    emitError: !isDev, //把eslint报错当成webapck的错误
                })
                .end()
            .end()
         .end()
    .plugin("vue-loader-plugin")//vue-loader必须要添加vue-loader-plugin
        .use(require("vue-loader").VueLoaderPlugin,[])
        .end()
    .plugin("html")// 添加html-webpack-plugin插件
        .use(require("html-webpack-plugin"),[{
            template: path.resolve(__dirname,"./public/index.html"), //指定模版文件
            chunks: ["runtime", "chunk-vendors", "chunk-common", "app"], //指定需要加载的chunks
            inject: "body" //指定script脚本注入的位置为body
        }])
        .end()
    .plugin("extract-css")//提取css样式到单独css文件
        .use(require('mini-css-extract-plugin'), [{
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }])
        .end()
    .plugin('fork-ts-checker') //配置fork-ts-checker
        .use(require('fork-ts-checker-webpack-plugin'), [{
            eslint: {
                files: './src/**/*.{ts,tsx,js,jsx,vue}' // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
            },
            typescript: {
                extensions: {
                    vue: {
                        enabled: true,
                        compiler: "vue-template-compiler"
                    },
                }
            }
        }])
        .end()
    .devServer
        .host("0.0.0.0") //为了让外部服务访问
        .port(8090) //当前端口号
        .hot(true) //热载
        .open(true) //开启页面
        .overlay({
            warnings: true,
            errors: true
        }) //webpack错误和警告信息显示到页面
config.when(!isDev,()=>{
    config.optimization
            .minimize(true)
            .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false, //去除注释
                terserOptions:{
                    output: {
                        comments: false //去除注释
                    }
                }
            }]);
},()=>{
    config.devtool("eval-cheap-module-source-map");
});
config.optimization
            .splitChunks({
                cacheGroups: {
                    vendors: { //分离入口文件引用node_modules的module（vue、@babel/xxx）
                        name: `chunk-vendors`,
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        chunks: 'initial'
                    },
                    common: { //分离入口文件引用次数>=2的module
                        name: `chunk-common`,
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    }
                }
            })
            .runtimeChunk("single"); //分离webpack的一些帮助函数，比如webpackJSONP等等

module.exports = config.toConfig();
```

## 总结

ok，到这我们的vue实战算是结束了，大家也可以直接把demo用到项目中，没毛病！！我们花了两节来实战了一个vue项目，有小伙伴有疑问了：“这么多内容我们怎么记得住呢？” 是的！ 那么多知识点我也是记不住的，但是这个是真没办法的，你需要时刻关注一些更新动态或者社区大佬分享的一些经验了，不过说到底，只有你自己明白你需要的是什么就够了，不要自己都懵逼了那就完了，建议初级刚接触前端的童鞋可以直接用官方的脚手架生成项目，但是对于中级和高级的同学那就需要自己掌握每一个知识点了，要有脱离脚手架也能撸一个项目的功底！！

[demo链接地址：https://github.com/913453448/webpack-vue-demo.git](https://github.com/913453448/webpack-vue-demo.git)

好啦～～ 本节到此就结束了，未完待续！！