"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _rollup = require("rollup");

var _rollup2 = _interopRequireDefault(_rollup);

var _rollupPluginNodeResolve = require("rollup-plugin-node-resolve");

var _rollupPluginNodeResolve2 = _interopRequireDefault(_rollupPluginNodeResolve);

var _rollupPluginBabel = require("rollup-plugin-babel");

var _rollupPluginBabel2 = _interopRequireDefault(_rollupPluginBabel);

var _rollupPluginCommonjs = require("rollup-plugin-commonjs");

var _rollupPluginCommonjs2 = _interopRequireDefault(_rollupPluginCommonjs);

var _rollupPluginJson = require("rollup-plugin-json");

var _rollupPluginJson2 = _interopRequireDefault(_rollupPluginJson);

var _uglifyJs = require("uglify-js");

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _watch = require("watch");

var _watch2 = _interopRequireDefault(_watch);

var _ora = require("ora");

var _ora2 = _interopRequireDefault(_ora);

var _keypress = require("keypress");

var _keypress2 = _interopRequireDefault(_keypress);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _denodeify = require("denodeify");

var _denodeify2 = _interopRequireDefault(_denodeify);

require("core-js/es6/promise");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_fs2.default.writeFile = (0, _denodeify2.default)(_fs2.default.writeFile);

_commander2.default.option("-w, --watch [Directory]", "Watch for changes").option("-m, --minify", "Minify").parse(process.argv);

var spinner = void 0;

(0, _keypress2.default)(process.stdin);
if (_commander2.default.watch) {
  spinner = (0, _ora2.default)("Initial Build");
  spinner.start();
}

build();

if (_commander2.default.watch) {
  _watch2.default.watchTree(_commander2.default.watch, function (f, curr, prev) {
    if ((typeof f === "undefined" ? "undefined" : _typeof(f)) === "object" && prev === null && curr === null) {
      // finished walking tree
    } else {
        spinner.text = "File changed, rebuilding...";
        build();
      }
  });
}

if (_commander2.default.watch) {
  process.stdin.on("keypress", function (ch, key) {
    if (key && key.name === "q") {
      spinner.stop();
      _watch2.default.unwatchTree(_commander2.default.watch);
      console.log(_chalk2.default.cyan("Cleanly stopped watch"));
      process.exit(0);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function build() {
  return _rollup2.default.rollup({
    entry: "src/cli.js",
    onwarn: _commander2.default.watch ? function (e) {
      spinner.text = e;
    } : undefined,
    plugins: [(0, _rollupPluginNodeResolve2.default)({
      preferBuiltins: true
    }), (0, _rollupPluginJson2.default)(), (0, _rollupPluginCommonjs2.default)(), (0, _rollupPluginBabel2.default)({
      exclude: ["node_modules/**", "*.json"],
      babelrc: false,
      presets: ["es2015-rollup"]
    })]
  }).then(function (bundle) {
    return bundle.generate({
      sourceMap: true,
      banner: "#! /usr/bin/env node",
      format: "cjs"
    });
  }).then(function (obj) {
    if (_commander2.default.minify) {
      return _uglifyJs2.default.minify(obj.code, {
        fromString: true,
        screwIe8: true,
        outSourceMap: "cli.js.map",
        inSourceMap: obj.map
      });
    } else {
      return obj;
    }
  }).then(function (obj) {
    return Promise.all([obj.code.length, _fs2.default.writeFile("./dist/cli.js", obj.code), _fs2.default.writeFile("./dist/cli.js.map", obj.map)]);
  }).then(function (stats) {
    if (!_commander2.default.watch) {
      console.log(_chalk2.default.blue("File size: " + stats[0] + " bytes"));
    } else {
      spinner.text = "Built: File Size " + stats[0] + " bytes";
    }
    return stats;
  }).catch(function (e) {
    if (_commander2.default.watch) {
      spinner.text = _chalk2.default.red(e);
    } else {
      console.log(_chalk2.default.red(e));
    }
  });
}