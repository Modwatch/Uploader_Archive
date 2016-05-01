import program from "commander";
import chalk from "chalk";

import { cleanModFile, scanModDirectory, getUsers, getUserFiles, getUserProfile, uploadMods } from "./lib/utils";

program
.option("-d, --modDirectory [directory]", "Mod Directory")
.option("-g, --game [name]", "Game Name")
.option("-u, --username [username]", "Modwatch Username")
.option("-p, --password [password]", "Modwatch Password")
.option("-l, --listUsers <n>", "List `n` Users")
.option("-r, --userProfile [username]", "Get User's Profile")
.option("-f, --userFiles [username]", "Get User's File Names")
.option("-d, --upload", "Upload to Modwatch")
.parse(process.argv);

if(program.listUsers) {
  getUsers({
    to: program.listUsers
  })
  .then(users => {
    console.log(users);
  })
  .catch(e => {
    console.log(chalk.red("Error getting user list"));
  });
} else if(program.userProfile) {
  getUserProfile({
    username: program.userProfile
  })
  .then(profile => {
    console.log(profile);
  })
  .catch(e => {
    console.log(chalk.red("Error getting user profile"), e);
  });
} else if(program.userFiles) {
  getUserFiles({
    username: program.userFiles
  })
  .then(files => {
    console.log(files);
  })
  .catch(e => {
    console.log(chalk.red("Error getting user files"));
  });
} else if(program.upload) {
  if(!program.username || !program.password || !program.game) {
    console.log(chalk.red("Username, Password, and Game required for upload"));
    process.exit(0);
  }
  scanModDirectory({
    modDirectory: program.modDirectory,
    game: program.game
  })
  .then(paths => Promise.all(
    paths.map(p => cleanModFile({
      filepath: p
    }))
  ))
  .then(files => files.map(file => {
    let obj = {};
    obj[file.shortname] = file.content;
    return obj;
  }))
  .then(files => files.reduce((curr, prev) =>
    Object.assign({}, curr, prev)
  ))
  .then(files => uploadMods(Object.assign({}, files, {
    username: program.username,
    password: program.password,
    game: program.game
  })))
  .then(uploadResponse => {
    console.log(uploadResponse);
  })
  .catch(e => {
    console.log(chalk.red("Error getting/transforming/uploading mod files"));
  });
}
