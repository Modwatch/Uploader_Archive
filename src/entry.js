import { cleanModFile, analyzeFile, scanModDirectory } from "./utils";

function getModFiles(files) {
  return Promise.all(files
    .map(filepath => getModFile({
      filepath
    }))
  );
}

function getModFile(opts = {}) {
  return cleanModFile({
    filepath: opts.filepath
  })
  .catch(e => {
    console.log(e);
  });
}
