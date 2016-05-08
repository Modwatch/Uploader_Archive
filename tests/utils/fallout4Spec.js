import test from "ava";
import { cleanModFile, analyzeFile, scanModDirectory } from "../../src/lib/utils";

test.skip("analyzeFile returns correct fallout4 filenames", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/fallout4/in/plugins.txt"
	}).then(m => m.filename);
	t.is(await plugins, "plugins.txt");

	const modlist = cleanModFile({
		filepath: "../modfiles/fallout4/in/modlist.txt"
	}).then(m => m.filename);
	t.is(await modlist, "modlist.txt");

	const fallout4 = cleanModFile({
		filepath: "../modfiles/fallout4/in/fallout4.ini"
	}).then(m => m.filename);
	t.is(await fallout4, "fallout4.ini");

	const fallout4Prefs = cleanModFile({
		filepath: "../modfiles/fallout4/in/fallout4prefs.ini"
	}).then(m => m.filename);
	t.is(await fallout4Prefs, "fallout4prefs.ini");
});

test.skip("analyzeFile returns correct fallout4 file lengths", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/fallout4/in/plugins.txt"
	}).then(m => m.content.length);
	t.is(await plugins, 4);

	const modlist = cleanModFile({
		filepath: "../modfiles/fallout4/in/modlist.txt"
	}).then(m => m.content.length);
	t.is(await modlist, 4);

	const fallout4 = cleanModFile({
		filepath: "../modfiles/fallout4/in/fallout4.ini"
	}).then(m => m.content.length);
	t.is(await fallout4, 6);

	const fallout4Prefs = cleanModFile({
		filepath: "../modfiles/fallout4/in/fallout4prefs.ini"
	}).then(m => m.content.length);
	t.is(await fallout4Prefs, 9);
});
