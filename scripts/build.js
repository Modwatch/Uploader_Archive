"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var rollup = require("rollup");
var nodeResolve = require("rollup-plugin-node-resolve");
var babel = require("rollup-plugin-babel");
var commonjs = require("rollup-plugin-commonjs");
var rollupJSON = require("rollup-plugin-json");
var uglify = require("uglify-js");
var chalk = require("chalk");
var program = require("commander");
var watch = require("watch");
var ora = require("ora");
var keypress = require("keypress");
var fs = require("fs");
var denodeify = require("denodeify");

fs.writeFile = denodeify(fs.writeFile);

program.option("-w, --watch [Directory]", "Watch for changes").option("-m, --minify", "Minify").parse(process.argv);

var spinner = void 0;

keypress(process.stdin);
if (program.watch) {
  spinner = ora("Initial Build");
  spinner.start();
}

build();

if (program.watch) {
  watch.watchTree(program.watch, function (f, curr, prev) {
    if ((typeof f === "undefined" ? "undefined" : _typeof(f)) === "object" && prev === null && curr === null) {
      // finished walking tree
    } else {
        spinner.text = "File changed, rebuilding...";
        build();
      }
  });
}

if (program.watch) {
  process.stdin.on("keypress", function (ch, key) {
    if (key && key.name === "q") {
      spinner.stop();
      watch.unwatchTree(program.watch);
      console.log(chalk.cyan("Cleanly stopped watch"));
      process.exit(0);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function build() {
  return rollup.rollup({
    entry: "src/cli.js",
    onwarn: program.watch ? function (e) {
      spinner.text = e;
    } : undefined,
    plugins: [nodeResolve({
      preferBuiltins: true
    }), rollupJSON(), commonjs(), babel({
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
    if (program.minify) {
      return uglify.minify(obj.code, {
        fromString: true,
        screwIe8: true,
        outSourceMap: "cli.js.map",
        inSourceMap: obj.map
      });
    } else {
      return obj;
    }
  }).then(function (obj) {
    return Promise.all([obj.code.length, fs.writeFile("./dist/cli.js", obj.code), fs.writeFile("./dist/cli.js.map", obj.map)]);
  }).then(function (stats) {
    if (!program.watch) {
      console.log(chalk.blue("File size: " + stats[0] + " bytes"));
    } else {
      spinner.text = "Built: File Size " + stats[0] + " bytes";
    }
    return stats;
  }).catch(function (e) {
    if (program.watch) {
      spinner.text = chalk.red(e);
    } else {
      console.log(chalk.red(e));
    }
  });
}