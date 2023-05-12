const UglifyJS        = require('uglify-js')

const minJS = (code) => {
  let minified = UglifyJS.minify(code);
  if (minified.error) {
    console.log('UglifyJS error: ', minified.error);
    return code;
  }
  return minified.code;
};

module.exports = minJS