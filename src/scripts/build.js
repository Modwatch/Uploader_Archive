import rollup from "rollup";
import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import rollupJSON from "rollup-plugin-json";
import uglify from "uglify-js";
import chalk from "chalk";
import program from "commander";
import watch from "watch";
import ora from "ora";
import keypress from "keypress";
import fs from "fs";
import denodeify from "denodeify";

fs.writeFile = denodeify(fs.writeFile);

program
.option("-w, --watch [Directory]", "Watch for changes")
.option("-m, --minify", "Minify")
.parse(process.argv);

let spinner;

let banner = "#!/usr/bin/env node\n";

if(typeof Promise === "undefined") {
  banner = `${banner}require("core-js/es6/promise");\n`;
  require("core-js/es6/promise");
}
if(typeof "".includes === "undefined") {
  banner = `${banner}require("core-js/fn/string/includes");\n`;
}

keypress(process.stdin);
if(program.watch) {
  spinner = ora("Initial Build");
  spinner.start();
}

build();

if(program.watch) {
  watch.watchTree(program.watch, (f, curr, prev) => {
    if (typeof f === "object" && prev === null && curr === null) {
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
    onwarn: program.watch ? e => {
      spinner.text = e;
    } : undefined,
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      rollupJSON(),
      commonjs(),
      babel({
        exclude: [
          "node_modules/**",
          "*.json"
        ],
        babelrc: false,
        presets: ["es2015-rollup"]
      })
    ]
  })
  .then(bundle => bundle.generate({
    banner,
    sourceMap: true,
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
  .then(obj => {
    fs.writeFile("./dist/cli.js", obj.code);
    fs.writeFile("./dist/cli.js.map", obj.map);
    return obj.code.length;
  })
  .then(filesize => {
    if(!program.watch) {
      console.log(chalk.blue(`File size: ${filesize} bytes`));
    } else {
      spinner.text = `Built: File Size ${filesize} bytes`;
    }
    return filesize;
  })
  .catch(e => {
    if(program.watch) {
      spinner.text = chalk.red(e);
    } else {
      console.log(chalk.red(e));
    }
  });
}
