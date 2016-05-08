import test from "ava";
import { cleanModFile, scanModDirectory } from "../../src/lib/utils";

test("analyzeFile returns correct skyrim filenames", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/skyrim/in/plugins.txt"
	}).then(m => m.filename);
	t.is(await plugins, "plugins.txt");

	const modlist = cleanModFile({
		filepath: "../modfiles/skyrim/in/modlist.txt"
	}).then(m => m.filename);
	t.is(await modlist, "modlist.txt");

	const skyrim = cleanModFile({
		filepath: "../modfiles/skyrim/in/skyrim.ini"
	}).then(m => m.filename);
	t.is(await skyrim, "skyrim.ini");

	const skyrimPrefs = cleanModFile({
		filepath: "../modfiles/skyrim/in/skyrimprefs.ini"
	}).then(m => m.filename);
	t.is(await skyrimPrefs, "skyrimprefs.ini");
});

test("analyzeFile returns correct skyrim file lengths", async t => {
	const plugins = cleanModFile({
		filepath: "../modfiles/skyrim/in/plugins.txt"
	}).then(m => m.content.length);
	t.is(await plugins, 5);

	const modlist = cleanModFile({
		filepath: "../modfiles/skyrim/in/modlist.txt"
	}).then(m => m.content.length);
	t.is(await modlist, 4);

	const skyrim = cleanModFile({
		filepath: "../modfiles/skyrim/in/skyrim.ini"
	}).then(m => m.content.length);
	t.is(await skyrim, 6);

	const skyrimPrefs = cleanModFile({
		filepath: "../modfiles/skyrim/in/skyrimprefs.ini"
	}).then(m => m.content.length);
	t.is(await skyrimPrefs, 9);
});
