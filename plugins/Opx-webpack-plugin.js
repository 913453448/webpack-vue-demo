const path=require("path");
class OpxWebpackPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    // compiler.hooks.compilation.tap(OpxWebpackPlugin.NAME, (compilation) => {
    //     compilation.hooks.addEntry.tap(OpxWebpackPlugin.NAME, (entry, name) => {
    //         console.log(compiler);
    //         console.log(entry);
    //     });
    // });
      Object.keys(compiler.options.entry).forEach((key)=>{
          if(!(compiler.options.entry[key] instanceof Array)){
              compiler.options.entry[key]=[compiler.options.entry[key]];
          }
          compiler.options.entry[key]=["!!"+path.resolve(__dirname,"./flexible.js"),...compiler.options.entry[key]];
      });
      console.log(compiler.options.entry);
  }
}

OpxWebpackPlugin.NAME = "OpxWebpackPlugin";
module.exports = OpxWebpackPlugin;
