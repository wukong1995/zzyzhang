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
    "indent": [
      "error",
      2
    ],
    "linebreak-style": 0,
    "no-console": 0,
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-multiple-empty-lines": [
      "error"
    ]
  }
};