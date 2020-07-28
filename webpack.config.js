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