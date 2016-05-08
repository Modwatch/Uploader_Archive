import test from "ava";
import chalk from "chalk";
import { cleanModFile, analyzeFile, scanModDirectory } from "../../src/lib/utils";
import ini from "../modfiles/fallout4/out/ini";
import prefsini from "../modfiles/fallout4/out/prefsini";

test("analyzeFile returns correct fallout4 filenames", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/fallout4/in/plugins.txt"
	}).then(m => m.filename);
	t.is(await plugins, "plugins.txt");

	const modlist = cleanModFile({
		filepath: "../modfiles/fallout4/in/modlist.txt"
	}).then(m => m.filename);
	t.is(await modlist, "modlist.txt");

	const fallout4 = cleanModFile({
		filepath: "../modfiles/fallout4/in/Fallout4.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== ini[index]) {
				console.log(chalk.red(`${line} !== ${ini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await fallout4, ini);

	const fallout4prefs = cleanModFile({
		filepath: "../modfiles/fallout4/in/Fallout4Prefs.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== prefsini[index]) {
				console.log(chalk.red(`${line} !== ${prefsini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await fallout4prefs, prefsini);

});
