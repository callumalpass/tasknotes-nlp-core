import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("nl", {
	dates: [
		["bel Jo morgen om 15:00 #werk", { title: "bel Jo", scheduled: { date: "2026-10-30", time: "15:00" }, tags: ["werk"] }],
		["rapport indienen uiterlijk vrijdag", { title: "rapport indienen", due: { date: "2026-10-30" } }],
		["offerte versturen ten laatste tegen maandag", { title: "offerte versturen", due: { date: "2026-11-02" } }],
		["belasting betalen voor de 15e", { title: "belasting betalen", due: { date: "2026-11-15" } }],
		["factuur sturen uiterlijk eind van de maand", { title: "factuur sturen", due: { date: "2026-10-31" } }],
		["concept inleveren uiterlijk eind volgende week", { title: "concept inleveren", due: { date: "2026-11-08" } }],
		["cadeaus kopen met kerst", { title: "cadeaus kopen", scheduled: { date: "2026-12-25" } }],
		["borrel op koningsdag", { title: "borrel", scheduled: { date: "2027-04-27" } }],
		["cadeautjes inpakken op pakjesavond", { title: "cadeautjes inpakken", scheduled: { date: "2026-12-05" } }],
		["bloemen leggen op wapenstilstand", { title: "bloemen leggen", scheduled: { date: "2026-11-11" } }],
		["kinderen ophalen om half vier", { title: "kinderen ophalen", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["koffie om kwart over drie", { title: "koffie", scheduled: { date: "2026-10-29", time: "15:15" } }],
		["terugbellen over 2 uur", { title: "terugbellen", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["Jo bellen om 15 uur", { title: "Jo bellen", scheduled: { date: "2026-10-29", time: "15:00" } }],
		["bel Jo morgen om half vier", { title: "bel Jo", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["bel Jo om drie uur", { title: "bel Jo", scheduled: { date: "2026-10-29", time: "15:00" } }],
		["tandarts gepland voor 3 november", { title: "tandarts", scheduled: { date: "2026-11-03" } }],
		["vertrekken om kwart voor vier", { title: "vertrekken", scheduled: { date: "2026-10-29", time: "15:45" } }],
		["Jo bellen overmorgen", { title: "Jo bellen", scheduled: { date: "2026-10-31" } }],
		["wandelen over een half uur", { title: "wandelen", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["archief eergisteren", { title: "archief", scheduled: { date: "2026-10-27" } }],
		["bel Jo overmorgen om 15:30", { title: "bel Jo", scheduled: { date: "2026-10-31", time: "15:30" } }],
		["wandelen over anderhalf uur", { title: "wandelen", scheduled: { date: "2026-10-29", time: "11:30" } }],
		["terugbellen binnen een kwartier", { title: "terugbellen", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["bel Jo morgen rond 15 uur", { title: "bel Jo", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["vergaderen morgen om 15 uur", { title: "vergaderen", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["lunch om twaalf uur ’s middags", { title: "lunch", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["vertrekken om twaalf uur ’s nachts", { title: "vertrekken", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["verslag uiterlijk eind deze week", { title: "verslag", due: { date: "2026-11-01" } }],
		["bel Jo overmorgen om twaalf uur ’s nachts", { title: "bel Jo", scheduled: { date: "2026-10-31", time: "00:00" } }],
	],
	recurrence: [
		["planten water geven iedere dag", { title: "planten water geven", recurrence: "FREQ=DAILY" }],
		["huur betalen elke maand", { title: "huur betalen", recurrence: "FREQ=MONTHLY" }],
		["verzekering nakijken ieder jaar", { title: "verzekering nakijken", recurrence: "FREQ=YEARLY" }],
		["hardlopen elke ma, wo en vr", { title: "hardlopen", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["gym elke ma. en vr.", { title: "gym", recurrence: "FREQ=WEEKLY;BYDAY=MO,FR" }],
		["zwemmen op dinsdagen en donderdagen", { title: "zwemmen", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }],
		["yoga 's maandags", { title: "yoga", recurrence: "FREQ=WEEKLY;BYDAY=MO" }],
		["wandelen elke werkdag", { title: "wandelen", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["uitslapen elk weekend", { title: "uitslapen", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["teamoverleg om de week op dinsdag", { title: "teamoverleg", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["filter vervangen elke 3 maanden", { title: "filter vervangen", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["afval buitenzetten om de 2 weken", { title: "afval buitenzetten", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["rapport maken iedere eerste maandag", { title: "rapport maken", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["back-up controleren elke laatste vrijdag", { title: "back-up controleren", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["factureren tweewekelijks", { title: "factureren", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["cijfers bekijken elk kwartaal", { title: "cijfers bekijken", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["rekken dagelijks tot en met vrijdag", { title: "rekken", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["fysio wekelijks 6 keer", { title: "fysio", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		["vitamines innemen om de dag", { title: "vitamines innemen", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["wekelijkse vergadering", { title: "wekelijkse vergadering", recurrence: "FREQ=WEEKLY" }],
		["dagelijkse controle", { title: "dagelijkse controle", recurrence: "FREQ=DAILY" }],
		["rapport maken iedere eerste maandag van de maand", { title: "rapport maken", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["overleg elke tweede dinsdag van iedere maand", { title: "overleg", recurrence: "FREQ=MONTHLY;BYDAY=TU;BYSETPOS=2" }],
	],
	estimates: [
		["presentatie oefenen 1u30min", { title: "presentatie oefenen", estimate: 90 }],
		["schuur opruimen 1,5 uur", { title: "schuur opruimen", estimate: 90 }],
		["mail beantwoorden, kost ongeveer 10 minuten", { title: "mail beantwoorden", estimate: 10 }],
		["wandelen een half uur", { title: "wandelen", estimate: 30 }],
		["lezen duurt een kwartier", { title: "lezen", estimate: 15 }],
		["studeren anderhalf uur", { title: "studeren", estimate: 90 }],
		["yoga drie kwartier", { title: "yoga", estimate: 45 }],
	],
	keywords: [
		["urgent: storing oplossen", { title: "storing oplossen", priority: "urgent" }],
		["offerte nakijken hoge prioriteit", { title: "offerte nakijken", priority: "high" }],
		["archief opruimen prio: laag", { title: "archief opruimen", priority: "low" }],
		["vertaling in behandeling", { title: "vertaling", status: "in-progress" }],
		["aanvraag geannuleerd", { title: "aanvraag", status: "cancelled" }],
		["factuur afgerond", { title: "factuur", status: "done" }],
		["levering in de wacht", { title: "levering", status: "waiting" }],
		["post sorteren nog te doen", { title: "post sorteren", status: "open" }],
	],
	"plain titles": [
		["klein cadeau kopen", { title: "klein cadeau kopen" }],
		["de zon tekenen", { title: "de zon tekenen" }],
		["de do op de piano oefenen", { title: "de do op de piano oefenen" }],
		["hoge kast monteren", { title: "hoge kast monteren" }],
		["eten klaar maken", { title: "eten klaar maken" }],
		["open source bijdragen", { title: "open source bijdragen" }],
		["een wekelijkse planner kopen", { title: "een wekelijkse planner kopen" }],
		["de 2e versie nakijken", { title: "de 2e versie nakijken" }],
		["de minuten van het overleg nalezen", { title: "de minuten van het overleg nalezen" }],
		["maandagochtendritueel opschrijven", { title: "maandagochtendritueel opschrijven" }],
		["een dagelijkse agenda kopen", { title: "een dagelijkse agenda kopen" }],
		["mijn maandelijkse abonnement opzeggen", { title: "mijn maandelijkse abonnement opzeggen" }],
		["de 15e versie nakijken", { title: "de 15e versie nakijken" }],
		["middernachtblauw kiezen", { title: "middernachtblauw kiezen" }],
	],
});

// Engine gaps:
// Input: "klein cadeau voor ma kopen"
// Expected: { title: "klein cadeau voor ma kopen" }
// Actual: { title: "klein cadeau kopen", due: { date: "2026-11-02" } }
// Input: "bel Jo over 1 uur 30 minuten"
// Expected: { title: "bel Jo", scheduled: { date: "2026-10-29", time: "11:30" } }
// Actual: { title: "bel Jo", scheduled: { date: "2026-10-29", time: "11:00" }, estimate: 30 }
// Input: "vertrekken om middernacht"
// Expected: { title: "vertrekken", scheduled: { date: "2026-10-30", time: "00:00" } }
// Actual: { title: "vertrekken", scheduled: { date: "2026-10-30" } }
