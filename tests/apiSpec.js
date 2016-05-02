import test from "ava";
import express from "express";
import { getUsers, getUserFiles, getUserFile, getUserProfile, uploadMods } from "../src/lib/api";
import { promiseLog } from "../src/lib/utils";

const NUMBEROFUSERS = 20;
const PROFILE = {
	timestamp: Date.now(),
	tag: "whatevr",
	game: "skyrim",
	enb: "Godrays",
	score: 12
};
const FILES = [
	"plugins",
	"ini",
	"prefsini"
];
const PLUGINS = [
	"First Line.esp",
	"Second Line.esp",
	"Third Line.esm"
];
const INI = [
	"[Category]",
	"First Line=12",
	"Second Line=13",
	"Third Line=something"
];
const PREFSINI = [
	"[Category]",
	"First Line=12",
	"Second Line=13",
	"Third Line=something"
];

test.before(() => {
	let app = express();
	app.get("/api/users/list", (req, res) => {
		let users = [];
		for(let i = 0; i < NUMBEROFUSERS; i++) {
			users.push({
				timestamp: Date.now(),
				score: Math.floor(Math.random() * 20) - 10,
				username: `username${i}`
			});
		}
		res.json(users);
	});
	app.get("/api/user/:username/profile", (req, res) => {
		res.json(PROFILE);
	});
	app.get("/api/user/:username/files", (req, res) => {
		res.json(FILES);
	});
	app.get("/api/user/:username/file/plugins", (req, res) => {
		res.json(PLUGINS);
	});
	app.get("/api/user/:username/file/ini", (req, res) => {
		res.json(INI);
	});
	app.get("/api/user/:username/file/prefsini", (req, res) => {
		res.json(PREFSINI);
	});
	app.post("/loadorder", (req, res) => {
		res.status(200);
		res.end();
	});
	app.listen(3000, () => {
		console.log("Test Server Started");
	});
});

test("Get Users", async t => {
	const p1 = getUsers({
		api: "http://localhost:3000"
	})
	.then(users => users.length)
	t.is(await p1, 10);

	const p2 = getUsers({
		api: "http://localhost:3000",
		to: NUMBEROFUSERS
	})
	.then(users => users.length)
	t.is(await p2, NUMBEROFUSERS);
});

test("Get User Profile", async t => {
	const p = getUserProfile({
		api: "http://localhost:3000",
		username: "Peanut"
	})
	t.deepEqual(await p, PROFILE);
});

test("Get User Files", async t => {
	const p = getUserFiles({
		api: "http://localhost:3000",
		username: "Peanut"
	})
	t.deepEqual(await p, FILES);
});

test("Get User File Contents", async t => {
	const p1 = getUserFile({
		api: "http://localhost:3000",
		username: "Peanut",
		filetype: "plugins"
	})
	t.deepEqual(await p1, PLUGINS);
	const p2 = getUserFile({
		api: "http://localhost:3000",
		username: "Peanut",
		filetype: "ini"
	})
	t.deepEqual(await p2, INI);
	const p3 = getUserFile({
		api: "http://localhost:3000",
		username: "Peanut",
		filetype: "prefsini"
	})
	t.deepEqual(await p3, PREFSINI);
});

test("Upload", async t => {
	const p = uploadMods({
		api: "http://localhost:3000",
		username: "Peanut",
		password: "password",
		game: "skyrim",
		plugins: PLUGINS,
		ini: INI,
		prefsini: PREFSINI
	})
	.then(res => res.status)
	t.is(await p, 200);
});
