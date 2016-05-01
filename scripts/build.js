const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const rollupJSON = require("rollup-plugin-json");
const uglify = require("uglify-js");
const chalk = require("chalk");
const program = require("commander");
const watch = require("watch");
const ora = require("ora");
const keypress = require("keypress");
const fs = require("fs");
const denodeify = require("denodeify");

fs.writeFile = denodeify(fs.writeFile);

program
.option("-w, --watch [Directory]", "Watch for changes")
.option("-m, --minify", "Minify")
.parse(process.argv);

keypress(process.stdin);
if(program.watch) {
  const spinner = ora("Initial Build");
  spinner.start();
}

build();

if(program.watch) {
  watch.watchTree(program.watch, (f, curr, prev) => {
    if (typeof f == "object" && prev === null && curr === null) {
      // finished walking tree
    } else {
      spinner.text = "File changed, rebuilding...";
      build()
    }
  });
}

if(program.watch) {
  process.stdin.on("keypress", (ch, key) => {
    if (key &&  key.name === "q") {
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
    onwarn: program.watch ? e => { spinner.text = e; } : undefined,
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      rollupJSON({
        include: "node_modules/iconv-lite/**"
      }),
      commonjs(),
      babel({
        exclude: "node_modules/**",
        babelrc: false,
        presets: ["es2015-rollup"]
      })
    ]
  })
  .then(bundle => bundle.generate({
    sourceMap: true,
    banner: "#! /usr/bin/env node",
    format: "cjs"
  }))
  .then(obj => {
    if(program.minify) {
      return uglify.minify(obj.code, {
        fromString: true,
        screwIe8: true,
        outSourceMap: "cli.js.map",
        inSourceMap: obj.map
      });
    } else {
      return obj;
    }
  })
  .then(obj => Promise.all([
    obj.code.length,
    fs.writeFile("./dist/cli.js", obj.code),
    fs.writeFile("./dist/cli.js.map", obj.map)
  ]))
  .then(stats => {
    if(!program.watch) {
      console.log(chalk.blue(`File size: ${stats[0]} bytes`));
    } else {
      spinner.text = `Built: File Size ${stats[0]} bytes`;
    }
    return stats;
  })
  .catch(e => {
    if(program.watch) {
      spinner.text = chalk.red(e);
    } else {
      console.log(chalk.red(e));
    }
  });
}
