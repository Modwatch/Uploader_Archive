const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const rollupJSON = require("rollup-plugin-json");
const chalk = require("chalk");
const program = require("commander");
const watch = require("watch");
const ora = require("ora");
const keypress = require("keypress");

program
.option("-w, --watch [Directory]", "Watch for changes")
.parse(process.argv);

keypress(process.stdin);
if(program.watch) {
  const spinner = ora("Initial Build");
  spinner.start();
}

build()
.then(() => {
  if(program.watch) {
    spinner.text = "Built";
  }
});

if(program.watch) {
  watch.watchTree(program.watch, (f, curr, prev) => {
    if (typeof f == "object" && prev === null && curr === null) {
      // finished walking tree
    } else {
      spinner.text = "File changed, rebuilding...";
      build()
      .then(() => {
        spinner.text = "Built";
      });
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
      nodeResolve(),
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
  }).then(bundle => {
    return bundle.write({
      format: "cjs",
      dest: "dist/cli.js"
    });
  })
  .catch(e => {
    if(program.watch) {
      spinner.stop();
      watch.unwatch(program.watch);
    }
    console.log(e);
    process.exit(0);
  });
}
