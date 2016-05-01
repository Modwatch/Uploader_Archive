import test from "ava";
import { getUsers, getUserFiles, getUserFile, getUserProfile } from "../src/lib/api";

test("API Spec Mock", async t => {
	const p = getUserProfile({
		username: "Peanut"
	})
	t.truthy(await p);
});
