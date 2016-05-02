import test from "ava";
import express from "express";
import { getUsers, getUserFiles, getUserFile, getUserProfile } from "../src/lib/api";
import { promiseLog } from "../src/lib/utils";

const NUMBEROFUSERS = 20;

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
	app.listen(3000, () => {
		console.log("Test Server Started");
	});
});

test.only("Get Users", async t => {
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
