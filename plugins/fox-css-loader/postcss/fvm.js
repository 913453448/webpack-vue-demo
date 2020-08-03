const postcss = require("postcss");

module.exports = postcss.plugin('postcss-plugin-fvm', function (options) {
    let {unitPrecision, rootValue} = options;
    const pxRegex = /(\d*\.?\d+)fpx/gi;

    const vwReplace = function (value, $1) {
        const fixed = Math.pow(10, unitPrecision);
        return Math.round((parseFloat($1) / (rootValue.fpx / 100)) * fixed / fixed) + 'vw';
    }


    return function (css) {
        css.walkDecls(function (decl, i) {
            if (~decl.value.indexOf('fpx')) {
                let value = decl.value.replace(pxRegex, vwReplace);
                decl.value = value;
            }
        });

        css.walkAtRules('media', function (rule) {
            if (!rule.params.indexOf('fpx')) {
                rule.params = rule.params.replace(pxRegex, vwReplace);
            }
        });
    };
});
