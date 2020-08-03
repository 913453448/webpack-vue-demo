const postcss = require('postcss');
const px2rem = require('postcss-plugin-px2rem');
const fvm = require("../postcss/fvm");
const {supportVm} = require("../utils");

module.exports = function (source, options) {
    if (supportVm()) { //TODO vm
        return postcss([fvm(options)]).process(source).css;
    } else { //rem
        return postcss([px2rem({
            ...options,
            rootValue: {
                fpx: options.rootValue.fpx / 10
            }
        })]).process(source).css;
    }
}
