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
    [
      "@babel/plugin-proposal-decorators",
      {
        //装饰器插件
        legacy: true
      }
    ],
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
