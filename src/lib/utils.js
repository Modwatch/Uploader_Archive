import path from "path";
import fs from "fs";
import denodeify from "denodeify";
import fetch from "node-fetch";

fs.readFile = denodeify(fs.readFile);
fs.readdir = denodeify(fs.readdir);

const api = "https://modwatchapi-ansballard.rhcloud.com"

export function cleanModFile(opts = {}) {
  if(!opts.filepath) {
    return Promise.reject("Filepath required");
  }
  return fs.readFile(path.resolve(opts.filepath), { encoding: "utf8" })
  .then(content => {
    let filename = path.basename(opts.filepath);
    return {
      content: content
        .split("\r\n")
        .join("\n")
        .split("\n")
        .filter(line => line.trim() !== "")
        .filter(line => line.indexOf("#") !== 0),
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

export function getUsers(opts = {}) {
  opts.from = opts.from || 0;
  return fetch(`${api}/api/users/list`)
  .then(response => response.json())
  .then(users => users.slice(opts.from || 0, opts.limit || opts.from + 10))
  .then(users => users.map(user => user.username));
}

export function getUserFiles(opts = {}) {
  if(!opts.username) {
    return Promise.reject("Username required");
  }
  return fetch(`${api}/api/user/${opts.username}/files`)
  .then(response => response.json())
}

export function getUserFile(opts = {}) {
  if(!opts.username || !opts.file) {
    return Promise.reject("Username/File type required");
  }
  return fetch(`${api}/api/user/${opts.username}/file/${opts.file}`)
  .then(response => response.json())
}

export function getUserProfile(opts = {}) {
  if(!opts.username) {
    return Promise.reject("Username required");
  }
  return fetch(`${api}/api/user/${opts.username}/profile`)
  .then(response => response.json())
}

export function uploadMods(opts = {}) {
  if(!opts.username || !opts.password) {
    return Promise.reject("Username/Password required");
  }
  return fetch(`${api}/loadorder`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: opts.username,
      password: opts.password,
      plugins: opts.plugins,
      modlist: opts.modlist,
      ini: opts.ini,
      prefsini: opts.prefsini,
      game: opts.game
    })
  });
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
