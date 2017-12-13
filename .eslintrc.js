module.exports = {
  "env": {
    "node": true,
    "commonjs": true,
    "es6": true,
    "jquery": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "camelcase": 0,
    "arrow-parens": 0,
    "max-len": 0,
    "func-names": 0,
    "comma-dangle": 0,
    "no-script-url": 0,
    "jsx-a11y/anchor-has-content": 0,
    "no-console": 0,
    "indent": [2, 2],
    "linebreak-style": 0,
    "quotes": [2, "single"],
    "semi": [2, "always"],
    "jsx-quotes" : 1,
    "jsx-a11y/label-has-for": 0,
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/no-static-element-interactions": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "arrow-body-style": 0,
    "import/no-extraneous-dependencies": 0,
    "import/first": 0,
    "import/no-unresolved": 0,
    "import/extensions": 0,
    "global-require": 0,
    "function-paren-newline": [2, "multiline"]
  },
  // "globals": { 设置全局变量， true和false 表示是否被重写
  //   "var1": true,
  //   "var2": false
  // }
};
