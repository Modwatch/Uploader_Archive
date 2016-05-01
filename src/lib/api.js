import "core-js/es6/promise";
import fetch from "node-fetch";

const api = "https://modwatchapi-ansballard.rhcloud.com"

export function getUsers(opts = {}) {
  opts.from = opts.from || 0;
  return fetch(`${api}/api/users/list`)
  .then(response => response.json())
  .then(users => users.slice(opts.from || 0, opts.limit || opts.from + 10))
  .then(users => users.map(user => user.username));
}

export function getUserFiles(opts = {}) {
  if(!opts.username) {
    return Promise.reject("Username Required");
  }
  return fetch(`${api}/api/user/${opts.username}/files`)
  .then(response => response.json())
}

export function getUserFile(opts = {}) {
  if(!opts.username || !opts.filetype) {
    return Promise.reject("Username/File Type Required");
  }
  return fetch(`${api}/api/user/${opts.username}/file/${opts.filetype}`)
  .then(response => response.json())
}

export function getUserProfile(opts = {}) {
  if(!opts.username) {
    return Promise.reject("Username Required");
  }
  return fetch(`${api}/api/user/${opts.username}/profile`)
  .then(response => response.json())
}

export function uploadMods(opts = {}) {
  if(!opts.username || !opts.password) {
    return Promise.reject("Username/Password Required");
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
