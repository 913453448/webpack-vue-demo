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