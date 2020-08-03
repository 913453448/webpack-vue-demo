const plugin = require("./plugin");
const webParse = require("./parser/web");
const loaderUtils = require("loader-utils");
const defaultOpts = {
    rootValue: {
        fpx: 375
    },
    platform: "web",
    unitPrecision: 5,
};

module.exports = function (source, options) {
    options = options || loaderUtils.getOptions(this) || defaultOpts;
    if (source) {
        let result;
        switch (options.platform) {
            case 'web':
                result = webParse(source, options);
                break;
            default:
                result = webParse(source, options);
                break;
        }
        return result;
    }
    return source;
}
module.exports.FoxCssPlugin = plugin;
