import test from "ava";
import chalk from "chalk";
import { cleanModFile, scanModDirectory } from "../../src/lib/utils";
import ini from "../modfiles/fallout3/out/ini";
import prefsini from "../modfiles/fallout3/out/prefsini";

test("analyzeFile returns correct content", async t => {

	const fallout3 = cleanModFile({
		filepath: "../modfiles/fallout3/in/Fallout.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== ini[index]) {
				console.log(chalk.red(`${line} !== ${ini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await fallout3, ini);

	const fallout3Prefs = cleanModFile({
		filepath: "../modfiles/fallout3/in/FalloutPrefs.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== prefsini[index]) {
				console.log(chalk.red(`${line} !== ${prefsini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await fallout3Prefs, prefsini);
});
