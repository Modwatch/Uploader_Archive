import test from "ava";
import { getUsers, getUserFiles, getUserFile, getUserProfile } from "../src/lib/api";

test("API Spec Mock", async t => {
	const p = Promise.resolve(true)
	t.is(await p, true);
});
