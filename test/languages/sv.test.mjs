import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("sv", {
	dates: [
		["ring Jo imorgon kl 15", { title: "ring Jo", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["ring Jo i morgon", { title: "ring Jo", scheduled: { date: "2026-10-30" } }],
		["packa i övermorgon", { title: "packa", scheduled: { date: "2026-10-31" } }],
		["ring Jo om 2 timmar", { title: "ring Jo", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["ring Jo om en halvtimme", { title: "ring Jo", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["rapport senast slutet av veckan", { title: "rapport", due: { date: "2026-11-01" } }],
		["ring Jo imorgon", { title: "ring Jo", scheduled: { date: "2026-10-30" } }],
		["skicka rapporten senast fredag", { title: "skicka rapporten", due: { date: "2026-10-30" } }],
		["betala fakturan förfaller den 30 oktober", { title: "betala fakturan", due: { date: "2026-10-30" } }],
		["boka tandläkare nästa fredag", { title: "boka tandläkare", scheduled: { date: "2026-11-06" } }],
		["träna den 15:e", { title: "träna", scheduled: { date: "2026-11-15" } }],
		["lämna kvitton senast månadens slut", { title: "lämna kvitton", due: { date: "2026-10-31" } }],
		["gör budget senast slutet av nästa månad", { title: "gör budget", due: { date: "2026-11-30" } }],
		["boka tågbiljetter till julafton", { title: "boka tågbiljetter", scheduled: { date: "2026-12-24" } }],
		["boka bord till nyårsafton", { title: "boka bord", scheduled: { date: "2026-12-31" } }],
		["köp blommor till alla hjärtans dag", { title: "köp blommor", scheduled: { date: "2027-02-14" } }],
		["boka ledigt på nationaldagen", { title: "boka ledigt", scheduled: { date: "2027-06-06" } }],
		["hämta barnen halv fyra", { title: "hämta barnen", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["ring mamma kvart över tre", { title: "ring mamma", scheduled: { date: "2026-10-29", time: "15:15" } }],
		["gå hem kvart i fem", { title: "gå hem", scheduled: { date: "2026-10-29", time: "16:45" } }],
		["ring banken kl. 14", { title: "ring banken", scheduled: { date: "2026-10-29", time: "14:00" } }],
		["ring i morgon klockan fyra", { title: "ring", scheduled: { date: "2026-10-30", time: "16:00" } }],
		["skriv senast veckans slut", { title: "skriv", due: { date: "2026-11-01" } }],
		["skriv senast slutet av nästa vecka", { title: "skriv", due: { date: "2026-11-08" } }],
		["ring vid middagstid", { title: "ring", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["ring vid midnatt", { title: "ring", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["ring om en kvart", { title: "ring", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["ring om 30 minuter", { title: "ring", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["hämta paket på måndag", { title: "hämta paket", scheduled: { date: "2026-11-02" } }],
	],
	recurrence: [
		["vattna blommorna varje dag", { title: "vattna blommorna", recurrence: "FREQ=DAILY" }],
		["ta vitaminer dagligen", { title: "ta vitaminer", recurrence: "FREQ=DAILY" }],
		["städa varje vecka", { title: "städa", recurrence: "FREQ=WEEKLY" }],
		["betala hyran varje månad", { title: "betala hyran", recurrence: "FREQ=MONTHLY" }],
		["förnya försäkringen varje år", { title: "förnya försäkringen", recurrence: "FREQ=YEARLY" }],
		["träna varje mån., ons. och fre.", { title: "träna", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["simma på tisdagar och torsdagar", { title: "simma", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }],
		["gå till kontoret varje vardag", { title: "gå till kontoret", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["promenera varje helg", { title: "promenera", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["byt lakan varannan vecka på tisdag", { title: "byt lakan", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["vattna varannan dag", { title: "vattna", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["ring pappa varannan måndag", { title: "ring pappa", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO" }],
		["vattna var tredje dag", { title: "vattna", recurrence: "FREQ=DAILY;INTERVAL=3" }],
		["besikta bilen vartannat år", { title: "besikta bilen", recurrence: "FREQ=YEARLY;INTERVAL=2" }],
		["rensa förrådet var 3 månader", { title: "rensa förrådet", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["skicka prognos kvartalsvis", { title: "skicka prognos", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["styrelsemöte varje första måndag", { title: "styrelsemöte", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["skicka fakturor varje sista fredag", { title: "skicka fakturor", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["stretcha varje dag till och med fredag", { title: "stretcha", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["sjukgymnastik varje vecka 6 gånger", { title: "sjukgymnastik", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		["daglig genomgång", { title: "daglig genomgång", recurrence: "FREQ=DAILY" }],
		["veckovis avstämning", { title: "veckovis avstämning", recurrence: "FREQ=WEEKLY" }],
		["månatlig kontroll", { title: "månatlig kontroll", recurrence: "FREQ=MONTHLY" }],
		["årlig översyn", { title: "årlig översyn", recurrence: "FREQ=YEARLY" }],
		["möte varje första måndag i månaden", { title: "möte", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
	],
	estimates: [
		["skriv utkast 2h", { title: "skriv utkast", estimate: 120 }],
		["läs rapporten 1,5 timmar", { title: "läs rapporten", estimate: 90 }],
		["städa 1 tim 30 min", { title: "städa", estimate: 90 }],
		["svara på mejl, tar cirka 10 minuter", { title: "svara på mejl", estimate: 10 }],
		["yoga i en halvtimme", { title: "yoga", estimate: 30 }],
		["läs i en och en halv timme", { title: "läs", estimate: 90 }],
		["öva piano ungefär en kvart", { title: "öva piano", estimate: 15 }],
		["promenera tre kvart", { title: "promenera", estimate: 45 }],
	],
	keywords: [
		["brådskande: laga servern #jobb", { title: "laga servern", priority: "urgent", tags: ["jobb"] }],
		["skicka offerten hög prioritet", { title: "skicka offerten", priority: "high" }],
		["arkivera kvitton prio låg", { title: "arkivera kvitton", priority: "low" }],
		["uppdatera registret normal prioritet", { title: "uppdatera registret", priority: "normal" }],
		["pågående: skriv årsrapport", { title: "skriv årsrapport", status: "in-progress" }],
		["boka resa status: pausad", { title: "boka resa", status: "waiting" }],
		["betala fakturan slutförd", { title: "betala fakturan", status: "done" }],
		["inställd: middag med teamet", { title: "middag med teamet", status: "cancelled" }],
		["öppen: utred felet", { title: "utred felet", status: "open" }],
	],
	"plain titles": [
		["läs om en viktig fråga", { title: "läs om en viktig fråga" }],
		["en daglig genomgång", { title: "en daglig genomgång" }],
		["en veckovis avstämning", { title: "en veckovis avstämning" }],
		["en månatlig kontroll", { title: "en månatlig kontroll" }],
		["en årlig översyn", { title: "en årlig översyn" }],
		["planera fredagsfikat", { title: "planera fredagsfikat" }],
		["boka en middag", { title: "boka en middag" }],
		["gör en lista", { title: "gör en lista" }],
		["köp 2 m tyg", { title: "köp 2 m tyg" }],
		["köp en mindre väska", { title: "köp en mindre väska" }],
		["läs den 2:a rapporten", { title: "läs den 2:a rapporten" }],
		["planera måndagsmötet", { title: "planera måndagsmötet" }],
		["läs min bok", { title: "läs min bok" }],
		["ring Tor Andersson", { title: "ring Tor Andersson" }],
		["skriv till Anna", { title: "skriv till Anna" }],
	],
});

// Engine gaps: these are native-speaker expectations, not executable assertions.
// "handla övermorgon"
//   expected: { title: "handla", scheduled: { date: "2026-10-31" } }
//   actual:   { title: "handla", scheduled: { date: "2026-10-29" } }
// "ring Jo klockan 15:30"
//   expected: { title: "ring Jo", scheduled: { date: "2026-10-29", time: "15:30" } }
//   actual:   { title: "ring Jo klockan 15:30" }
// "gör klart rapporten"
//   expected: { title: "gör klart rapporten" }
//   actual:   { title: "gör rapporten", status: "done" }
// "lämna rapporten måste vara klar fredag"
//   expected: { title: "lämna rapporten", due: { date: "2026-10-30" } }
//   actual:   { title: "lämna rapporten måste vara", scheduled: { date: "2026-10-30" }, status: "done" }
// "rapport senast arbetsveckans slut"
//   expected: { title: "rapport", due: { date: "2026-10-30" } }
//   actual:   { title: "rapport senast arbetsveckans slut" }
