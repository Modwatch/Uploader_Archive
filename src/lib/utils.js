import "core-js/fn/string/includes";
import "core-js/es6/promise";
import path from "path";
import fs from "fs";
import denodeify from "denodeify";

fs.readFile = denodeify(fs.readFile);
fs.readdir = denodeify(fs.readdir);

export function cleanModFile(opts = {}) {
  if(!opts.filepath) {
    return Promise.reject("Filepath required");
  }
  return fs.readFile(path.resolve(opts.filepath), { encoding: "utf8" })
  .then(content => {
    const filename = path.basename(opts.filepath);
    return {
      content: content
        .split("\r\n")
        .join("\n")
        .split("\n")
        .filter(line => line.trim() !== "")
        .filter(line => line.indexOf("#") !== 0)
        .map(line => line
          .replace(/\\/g, "\\")
          .replace(/"/g, "\"")
        ),
      filename,
      shortname: filename.includes("ini") ? (filename.includes("prefs") ? "prefsini" : "ini") : filename.split(".")[0]
    };
  });
}

export function scanModDirectory(opts = {}) {
  if(!opts.game) {
    return Promise.reject("Game required");
  }
  if(opts.modDirectory) {
    return fs.readdir(opts.modDirectory)
    .then(files => files
      .filter(f => f === "plugins.txt" || f === "modlist.txt" || f.includes(".ini"))
      .map(f => path.join(opts.modDirectory, f))
    )
  } else {
    return scanDefaultModDirectories({
      game: opts.game
    });
  }
}

export function promiseLog(obj) {
  console.log(obj);
  return obj;
}

function scanDefaultModDirectories(opts = {}) {
  if(!opts.game) {
    return Promise.reject("Game required");
  }
  const mygames = path.join(process.env.USERPROFILE || process.env.HOME, "Documents", "My\ Games", opts.game);
  const appdata = path.join(process.env.USERPROFILE || process.env.HOME, "AppData", "Local", opts.game);
  return Promise.all([
    path.resolve(mygames, `${opts.game}.ini`),
    path.resolve(mygames, `${opts.game}prefs.ini`),
    path.resolve(appdata, `plugins.txt`)
  ]);
}
