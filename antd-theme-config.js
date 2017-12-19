// 兼容antd推荐做法以及自定义做法
const path = require('path');
const pkg = require('./package.json');
const pkgPath = path.dirname(path.resolve(__dirname, './package.json'));

// theme变量是自定义的修改主题色的配置变量，可以不用修改antd推荐的package.json，但若改了，则使用package.json的配置
let theme = {
  "primary-color": "#fe7418"
};
if (pkg.theme) {
  if (typeof(pkg.theme) === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = path.resolve(pkgPath, cfgPath);
    }
    const getThemeConfig = require(cfgPath);
    theme = typeof getThemeConfig === 'function' ? getThemeConfig() : getThemeConfig;
  } else if (typeof pkg.theme === 'object') {
    theme = pkg.theme;
  }
}
console.log('antd-theme-config >>>>>>:', theme)
module.exports = theme;