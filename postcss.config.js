/* eslint-disable */
module.exports = {
  plugins: [
    require("autoprefixer")(),
    require("postcss-plugin-px2rem")({
        rootValue: {
          opx: 375
        }
    }),
    require("cssnano")({
      preset: [
        "default",
        {
          mergeLonghand: false,
          cssDeclarationSorter: false
        }
      ]
    })
  ]
};
