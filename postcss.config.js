module.exports = {
    plugins: [
        require("autoprefixer")(),
        require("cssnano")({
            preset: ['default', {
                mergeLonghand: false,
                cssDeclarationSorter: false
            }]
        })
    ]
};