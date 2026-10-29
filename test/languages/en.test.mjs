import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("en", {
	dates: [
		["call Jo tomorrow at 3pm", { title: "call Jo", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["submit report due friday", { title: "submit report", due: { date: "2026-10-30" } }],
		["finish draft by end of next week", { title: "finish draft", due: { date: "2026-11-06" } }],
		["pick up kids at half past four", { title: "pick up kids", scheduled: { date: "2026-10-29", time: "16:30" } }],
		["gym on the 15th", { title: "gym", scheduled: { date: "2026-11-15" } }],
		["book flights for christmas", { title: "book flights", scheduled: { date: "2026-12-25" } }],
		["team sync 3-4pm tomorrow", { title: "team sync", scheduled: { date: "2026-10-30", time: "15:00" }, estimate: 60 }],
	],
	recurrence: [
		["water plants every day", { title: "water plants", recurrence: "FREQ=DAILY" }],
		["standup every weekday at 9am", { title: "standup", scheduled: { date: "2026-10-30", time: "09:00" }, recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["gym every mon, wed and fri", { title: "gym", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["sync every 2 weeks on tuesday", { title: "sync", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["pay rent every month", { title: "pay rent", recurrence: "FREQ=MONTHLY" }],
		["report every first monday", { title: "report", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["invoice fortnightly", { title: "invoice", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["stretch every day until friday", { title: "stretch", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["physio weekly 6 times", { title: "physio", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		// A frequency describing the next word stays in the title.
		["weekly review", { title: "weekly review", recurrence: "FREQ=WEEKLY" }],
	],
	estimates: [
		["write post 2h", { title: "write post", estimate: 120 }],
		["yoga for half an hour", { title: "yoga", estimate: 30 }],
		["email Jo, takes 10 minutes", { title: "email Jo", estimate: 10 }],
	],
	keywords: [
		["urgent: fix prod", { title: "fix prod", priority: "urgent" }],
		["deploy hotfix high priority", { title: "deploy hotfix", priority: "high" }],
		["review PR in progress", { title: "review PR", status: "in-progress" }],
	],
	"plain titles": [
		["deploy the high-availability cluster", { title: "deploy the high-availability cluster" }],
		["sit in the sun", { title: "sit in the sun" }],
		["review the 2nd draft", { title: "review the 2nd draft" }],
		["buy a weekly planner", { title: "buy a weekly planner" }],
	],
});
