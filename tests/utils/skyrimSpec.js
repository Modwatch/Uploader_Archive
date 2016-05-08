import test from "ava";
import chalk from "chalk";
import { cleanModFile, scanModDirectory } from "../../src/lib/utils";
import ini from "../modfiles/skyrim/out/ini";
import prefsini from "../modfiles/skyrim/out/prefsini";

test("analyzeFile returns correct content", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/skyrim/in/plugins.txt"
	}).then(m => m.filename);
	t.is(await plugins, "plugins.txt");

	const modlist = cleanModFile({
		filepath: "../modfiles/skyrim/in/modlist.txt"
	}).then(m => m.filename);
	t.is(await modlist, "modlist.txt");

	const skyrim = cleanModFile({
		filepath: "../modfiles/skyrim/in/Skyrim.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== ini[index]) {
				console.log(chalk.red(`${line} !== ${ini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await skyrim, ini);

	const skyrimPrefs = cleanModFile({
		filepath: "../modfiles/skyrim/in/SkyrimPrefs.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== prefsini[index]) {
				console.log(chalk.red(`${line} !== ${prefsini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await skyrimPrefs, prefsini);
});
