import test from "ava";
import chalk from "chalk";
import { cleanModFile, diffModFile, patchModFile } from "../../src/lib/utils";
import ini from "../modfiles/skyrim/out/ini";

test("diffModFile returns diff object", async t => {
	const modfile = cleanModFile({
		filepath: "../modfiles/skyrim/in/Skyrim.ini"
	}).then(obj => diffModFile({
      content: obj.content.slice(1),
      original: ini
    })
    .then(delta => patchModFile({
      delta,
      original: ini
    }))
    .then(patched => patched
      .map((line, index) =>
        line === obj.content.slice(1)[index]
      )
      .reduce((prev, curr) => curr && prev === curr)
    )
  )
	t.true(await modfile);
});
