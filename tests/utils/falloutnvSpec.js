import test from "ava";
import chalk from "chalk";
import { cleanModFile, scanModDirectory } from "../../src/lib/utils";
import ini from "../modfiles/falloutnv/out/ini";
import prefsini from "../modfiles/falloutnv/out/prefsini";

test("analyzeFile returns correct content", async t => {

	const falloutnv = cleanModFile({
		filepath: "../modfiles/falloutnv/in/Fallout.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== ini[index]) {
				console.log(chalk.red(`${line} !== ${ini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await falloutnv, ini);

	const falloutnvPrefs = cleanModFile({
		filepath: "../modfiles/falloutnv/in/FalloutPrefs.ini"
	}).then(file => file.content)
	.then(content => {
		content.forEach((line, index) => {
			if(line !== prefsini[index]) {
				console.log(chalk.red(`${line} !== ${prefsini[index]}`));
			}
		});
		return content;
	});
	t.deepEqual(await falloutnvPrefs, prefsini);
});
