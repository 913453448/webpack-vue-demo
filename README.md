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

我们都知道，当我们用react开发一个项目的时候，我们可以用官方的脚手架[Create React App](https://github.com/facebookincubator/create-react-app)，当我们用vue开发一个项目的时候，我们也可以用官方的脚手架[vue-cli](https://github.com/vuejs/vue-cli), 用起来是真的爽啊！也不需要自己去配置eslint、babel、webpack等等，脚手架会根据你的选择自动帮你完成配置，是的！ 一般项目都可以覆盖到，但是如果想要用好这些脚手架的话我们还是需要了解其中的一些配置的原理的。

我们这一次实战demo的需求是这样的：

- js框架（vue、typescript、tsx、jsx）
- css样式（sass）
- 工程化工具（eslint、babel、webpack、webpack-chain）

ok！这差不多算是一个比较复杂的项目了，接下来我们一步步来实现一下它。

## 开始

我们直接创建一个项目叫[webpack-vue-demo](https://github.com/913453448/webpack-vue-demo.git)，然后进到项目根目录执行npm init：

```bash
webpack-vue-demo npm init
	...
Is this OK? (yes) 
➜  webpack-vue-demo 

```

### webpack脚手架

创建完毕后，我们首先安装webpack相关依赖：

#### webpack（webpack框架）

```bash
yarn add -D webpack || npm install -D webpack
```

#### webpack-cli（webpack脚手架）

```bash
yarn add -D webpack-cli || npm install -D webpack-cli
```

#### webpack-dev-server（webpack开发环境）

```bash
yarn add -D webpack-dev-server || npm install -D webpack-dev-server
```

#### webpack-chain（webpack链式配置）

```bash
yarn add -D webpack-chain || npm install -D webpack-chain
```

ok! webpack脚手架相关的依赖我们算是安装完了，然后我们在工程根目录底下创建一个webpack配置文件`webpack.config.js`，用`webpack-chain`导出一个配置：

```js
const config = new (require("webpack-chain"))();
module.exports = config.toConfig();
```

然后我们就可以在根目录执行`npx webpack`跟`npx webpack-dev-server`命令了，为了方便，我们直接在`package.json`中声明两个脚本`build`跟`dev`,

```json
{
  "name": "webpack-vue-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rimraf dist && webpack --mode=production",
    "dev": "webpack-dev-server --mode=development --progress"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^4.44.0",
    "webpack-chain": "^6.5.1",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.0"
  }
}
```

我们试着运行一下`build`命令：

```bash
> webpack-vue-demo@1.0.0 build xx/webpack/webpack-vue-demo
> rimraf dist && webpack --mode=production


Insufficient number of arguments or no entry found.
Alternatively, run 'webpack(-cli) --help' for usage info.

Hash: a8dc1c75fbec1af4c624
Version: webpack 4.44.0
Time: 29ms
Built at: 07/27/2020 4:45:12 PM

ERROR in Entry module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-vue-demo'
npm ERR! code ELIFECYCLE
npm ERR! errno 2
npm ERR! webpack-vue-demo@1.0.0 build: `rimraf dist && webpack --mode=production`
npm ERR! Exit status 2
npm ERR! 
npm ERR! Failed at the webpack-vue-demo@1.0.0 build script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
➜  webpack-vue-demo git:(master) ✗ 

```

可以看到，`webpack`直接报错了～ ok！ 原因我就不解释了，没看过前面文章的童鞋强烈建议先看完再过来实战。

### typescript

因为我们需求中需要支持ts，所以我们继续安装ts相关依赖：

typescript（ts脚手架）

```bash
yarn add -D typescript || npm install -D typescript
```

ts-loader（ts加载器）

```bash
yarn add -D ts-loader || npm install -D ts-loader
```

ok! ts相关依赖安装完毕后，我们可以开始创建我们项目的目录了，我们直接在根目录底下创建一个src目录，然后在src目录下创建一个`main.ts`空文件当成项目的入口文件：

```bash
webpack-vue-demo
	node_modules
	src
		main.ts
	.gitignore
	package.json
	README.md
	webpack.config.js
```

然后我们去修改一下webpack的配置。

### 入口配置

webpack.config.js:

```js
const path = require("path");
const config = new (require("webpack-chain"))();
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename( "[name].[contenthash:8].js") //打包出来的bundle名称为[name].[contenthash:8].js
        .publicPath("./") //publicpath配置为"./"
    .end()

module.exports = config.toConfig();
```

我们再次执行`npm run build`：

```bash
➜  webpack-vue-demo git:(master) ✗ npm run build

> webpack-vue-demo@1.0.0 build xxx/webpack/webpack-vue-demo
> rimraf dist && webpack --mode=production

Hash: f102af84da880d301fb5
Version: webpack 4.44.0
Time: 198ms
Built at: 07/27/2020 5:05:26 PM
          Asset       Size  Chunks                         Chunk Names
app.995b67bc.js  964 bytes       0  [emitted] [immutable]  app
Entrypoint app = app.995b67bc.js
[0] multi ./src/main.ts 28 bytes {0} [built]
[1] ./src/main.ts 0 bytes {0} [built]
➜  webpack-vue-demo git:(master) ✗ 

```

ok，这一次我们可以看到，webpack通过我们配置的入口文件main.ts文件打包出来了一个叫app.995b67bc.js的文件，

dist/app.995b67bc.js:

```js
!function (e) {
    var t = {};

    function n(r) {
        if (t[r]) return t[r].exports;
        var o = t[r] = {i: r, l: !1, exports: {}};
        return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
    }

    n.m = e, n.c = t, n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: r})
    }, n.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    }, n.t = function (e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (n.r(r), Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        }), 2 & t && "string" != typeof e) for (var o in e) n.d(r, o, function (t) {
            return e[t]
        }.bind(null, o));
        return r
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "./", n(n.s = 0)
}([function (e, t, n) {
    e.exports = n(1)
}, function (e, t) {
}]);
```

哈哈，估计你是看不懂的！ 因为我们的main.ts是一个空文件，所以打包出来的文件只会包含一些webpack的runtime代码。

我们试着去`main.ts`文件中写点ts代码，

src/main.ts：

```js
let a:string="hello";
```

我们再次运行`npm run build`：

```bash
➜  webpack-vue-demo git:(master) ✗ npm run build

...
ERROR in ./src/main.ts 1:5
Module parse failed: Unexpected token (1:5)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> let a:string="hello";
 @ multi ./src/main.ts app[0]
npm ERR! code ELIFECYCLE
npm ERR! errno 2
npm ERR! webpack-vue-demo@1.0.0 build: `rimraf dist && webpack --mode=production`
npm ERR! Exit status 2
npm ERR! 
npm ERR! Failed at the webpack-vue-demo@1.0.0 build script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
➜  webpack-vue-demo git:(master) ✗ 

```

可以看到，webpack直接报错了，因为webpack默认的loader只能加载js跟json语法，不能识别我们的ts语法，所以webpack建议我们配置`.ts`结尾文件的loader。

### 配置ts-loader

webpack.config.js:

```js
const path = require("path");
const config = new (require("webpack-chain"))();
config
    .context(path.resolve(__dirname, ".")) //webpack上下文目录为项目根目录
    .entry("app") //入口文件名称为app
        .add("./src/main.ts") //入口文件为./src/main.ts
        .end()
    .output
        .path(path.join(__dirname,"./dist")) //webpack输出的目录为根目录的dist目录
        .filename( "[name].[contenthash:8].js") //打包出来的bundle名称为[name].[contenthash:8].js
        .publicPath("./") //publicpath配置为"./"
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
module.exports = config.toConfig();
```

然后在根目录创建一个ts的配置文件tsconfig.json：

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "suppressImplicitAnyIndexErrors": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "webpack-env"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
  ],
  "exclude": [
    "node_modules"
  ]
}

```

ok，然后我们再次运行`npm run build`命令：

```bash
➜  webpack-vue-demo git:(master) ✗ npm run build

> webpack-vue-demo@1.0.0 build xxx/webpack-vue-demo
> rimraf dist && webpack --mode=production

Hash: f5bd51439408213acbe2
Version: webpack 4.44.0
Time: 403ms
Built at: 07/27/2020 5:21:40 PM
          Asset       Size  Chunks                         Chunk Names
app.b894f269.js  999 bytes       0  [emitted] [immutable]  app
Entrypoint app = app.b894f269.js
[0] multi ./src/main.ts 28 bytes {0} [built]
[1] ./src/main.ts 47 bytes {0} [built]
➜  webpack-vue-demo git:(master) ✗ 

```

可以看到，这次就没有报错了，因为我们的webpack可以通过我们定义的ts-loader识别我们的ts语法了，我们来验证一下吧，我们修改main.ts文件：

```typescript
let a:string="hello";
console.log(a)
```

代码很简单，然后我们执行"npm run build"看最后打包出来的文件：

dist/app.b894f269.js

```js
!function (e) {
    var t = {};

   ...
}([function (e, t, n) {
    e.exports = n(1)
}, function (e, t, n) {
    "use strict";
    console.log("hello") //webpack打包过后的代码
}]);
```

