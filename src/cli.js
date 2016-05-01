import program from "commander";
import chalk from "chalk";

import { cleanModFile, scanModDirectory } from "./lib/utils";

program
.option("-d, --modDirectory [directory]", "Mod Directory")
.option("-g, --game [name]", "Game Name")
.parse(process.argv);

scanModDirectory({
  modDirectory: program.modDirectory,
  game: program.game
})
.then(paths => Promise.all(
  paths.map(p => cleanModFile({
    filepath: p
  }))
))
.then(files => {
  console.log(files);
})
.catch(e => {
  console.log(chalk.red(e));
});
