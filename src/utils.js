import path from "path";
import fs from "fs";
import denodeify from "denodeify";
fs.readFile = denodeify(fs.readFile);
fs.readdir = denodeify(fs.readdir);

export function cleanModFile(opts = {}) {
  return fs.readFile(path.resolve(opts.filepath), {encoding:"utf8"})
  .then(content => ({
    content: content
      .split("\r\n")
      .join("\n")
      .split("\n")
      .filter(line => line.trim() !== "")
      .filter(line => line.indexOf("#") !== 0),
    filename: path.basename(opts.filepath)
  }));
}

export function analyzeFile(opts = {}) {
  let stats = {
    content: opts.content
  };
  if(opts.game) {
    stats.game = opts.content
      .filter(line => line.toLowerCase().includes("skyrim"))
      .length > 0 ? "skyrim" : undefined;
  }
  return Promise.resolve(stats);
}

export function scanModDirectory(opts = {}) {
  if(opts.modDirectory) {
    return fs.readdir(opts.modDirectory)
    .then(files => files
      .filter(f => f === "plugins.txt" || f === "modlist.txt" || f.includes(".ini"))
      .map(f => path.join(opts.modDirectory, f))
    )
  } else {
    return scanDefaultModDirectories({
      game: "skyrim"
    });
  }
}

function scanDefaultModDirectories(opts = {}) {
  const mygames = path.join(process.env.USERPROFILE || process.env.HOME, "Documents", "My\ Games", opts.game);
  const appdata = path.join(process.env.USERPROFILE || process.env.HOME, "AppData", "Local", opts.game);
  return Promise.all([
    path.resolve(mygames, `${opts.game}.ini`),
    path.resolve(mygames, `${opts.game}prefs.ini`),
    path.resolve(appdata, `plugins.txt`)
  ]);
}
