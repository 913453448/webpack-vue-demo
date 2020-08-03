const path = require("path");
const {supportVm} = require("./utils");

class FpxWebpackPlugin {
    constructor(options) {
        this.options = options || {};
    }

    apply(compiler) {
        if (!supportVm()) {//TODO 需要使用rem
            Object.keys(compiler.options.entry).forEach((key) => {
                if (!(compiler.options.entry[key] instanceof Array)) {
                    compiler.options.entry[key] = [compiler.options.entry[key]];
                }
                compiler.options.entry[key] = ["!!" + require.resolve("amfe-flexible/index.min.js"), ...compiler.options.entry[key]];
            });
        }
    }
}

FpxWebpackPlugin.NAME = "FpxWebpackPlugin";
module.exports = FpxWebpackPlugin;
