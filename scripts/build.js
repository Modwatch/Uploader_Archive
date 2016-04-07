const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const chalk = require("chalk");

rollup.rollup({
  entry: "src/entry.js",
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      exclude: "node_modules/**"
    })
  ]
}).then(bundle => {
  return bundle.write({
    format: "cjs",
    dest: "dist/modwatch.js"
  });
})
.catch(e => {
  console.log(chalk.red(e));
});
