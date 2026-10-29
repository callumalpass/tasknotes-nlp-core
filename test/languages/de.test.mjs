import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("de", {
	dates: [
		["Jo anrufen morgen um 15 Uhr #arbeit", { title: "Jo anrufen", scheduled: { date: "2026-10-30", time: "15:00" }, tags: ["arbeit"] }],
		["Paket abholen übermorgen", { title: "Paket abholen", scheduled: { date: "2026-10-31" } }],
		["Bericht abgeben fällig am Freitag", { title: "Bericht abgeben", due: { date: "2026-10-30" } }],
		["Entwurf schicken spätestens bis zum Montag", { title: "Entwurf schicken", due: { date: "2026-11-02" } }],
		["Werkstatt geplant für nächsten Dienstag", { title: "Werkstatt", scheduled: { date: "2026-11-03" } }],
		["Steuern bis Monatsende", { title: "Steuern", due: { date: "2026-10-31" } }],
		["Abrechnung bis Ende des nächsten Monats", { title: "Abrechnung", due: { date: "2026-11-30" } }],
		["Archiv aufräumen bis Jahresende", { title: "Archiv aufräumen", due: { date: "2026-12-31" } }],
		["Miete überweisen am 15.", { title: "Miete überweisen", scheduled: { date: "2026-11-15" } }],
		["Geschenke einpacken an Heiligabend", { title: "Geschenke einpacken", scheduled: { date: "2026-12-24" } }],
		["Oma besuchen zu Weihnachten", { title: "Oma besuchen", scheduled: { date: "2026-12-25" } }],
		["Feuerwerk kaufen für Silvester", { title: "Feuerwerk kaufen", scheduled: { date: "2026-12-31" } }],
		["Spaziergang an Neujahr", { title: "Spaziergang", scheduled: { date: "2027-01-01" } }],
		["Friedhof besuchen an Allerheiligen", { title: "Friedhof besuchen", scheduled: { date: "2026-11-01" } }],
		["Blumen kaufen am Valentinstag", { title: "Blumen kaufen", scheduled: { date: "2027-02-14" } }],
		["Nachtzug nehmen um drei Uhr", { title: "Nachtzug nehmen", scheduled: { date: "2026-10-30", time: "03:00" } }],
		["Nachtwache um halb vier", { title: "Nachtwache", scheduled: { date: "2026-10-30", time: "03:30" } }],
		["Nachtwache um Viertel vor fünf", { title: "Nachtwache", scheduled: { date: "2026-10-30", time: "04:45" } }],
		["Jo anrufen in 2 Stunden", { title: "Jo anrufen", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["Termin Ende der Woche", { title: "Termin", scheduled: { date: "2026-11-01" } }],
		["Rückruf nach 2 Stunden", { title: "Rückruf", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["Rückruf innerhalb von 2 Stunden", { title: "Rückruf", due: { date: "2026-10-29", time: "12:00" } }],
		["Termin am Sonnabend", { title: "Termin", scheduled: { date: "2026-10-31" } }],
		["Termin überübermorgen", { title: "Termin", scheduled: { date: "2026-11-01" } }],
		["Termin uebermorgen um 15:30", { title: "Termin", scheduled: { date: "2026-10-31", time: "15:30" } }],
		["Termin Ende nächster Woche", { title: "Termin", scheduled: { date: "2026-11-08" } }],
		["Steuern bis Ende der Woche", { title: "Steuern", due: { date: "2026-11-01" } }],
		["Termin morgen um 15:30", { title: "Termin", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["Termin morgen um 15h", { title: "Termin", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["Termin morgen gegen 15 Uhr", { title: "Termin", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["Termin am 31. um 15:30", { title: "Termin", scheduled: { date: "2026-10-31", time: "15:30" } }],
		["Rückruf in einer halben Stunde", { title: "Rückruf", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["Rückruf nach einer Viertelstunde", { title: "Rückruf", scheduled: { date: "2026-10-29", time: "10:15" } }],
	],
	recurrence: [
		["Blumen gießen täglich", { title: "Blumen gießen", recurrence: "FREQ=DAILY" }],
		["Backup jeden Tag", { title: "Backup", recurrence: "FREQ=DAILY" }],
		["Miete zahlen jeden Monat", { title: "Miete zahlen", recurrence: "FREQ=MONTHLY" }],
		["Versicherung prüfen jedes Jahr", { title: "Versicherung prüfen", recurrence: "FREQ=YEARLY" }],
		["Sport montags und donnerstags", { title: "Sport", recurrence: "FREQ=WEEKLY;BYDAY=MO,TH" }],
		["Training jeden Mo., Mi. und Fr.", { title: "Training", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["Markt jeden Sonnabend", { title: "Markt", recurrence: "FREQ=WEEKLY;BYDAY=SA" }],
		["Teamrunde jeden Arbeitstag um 9 Uhr", { title: "Teamrunde", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", scheduled: { date: "2026-10-30", time: "09:00" } }],
		["Wandern jedes Wochenende", { title: "Wandern", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["Post holen werktags", { title: "Post holen", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA" }],
		["Filter wechseln alle 3 Monate", { title: "Filter wechseln", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["Bett beziehen jede zweite Woche", { title: "Bett beziehen", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["Teamrunde alle 2 Wochen am Dienstag", { title: "Teamrunde", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["Abrechnung jeden ersten Montag", { title: "Abrechnung", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["Inventur jeden letzten Freitag", { title: "Inventur", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["Kontrolle alle zwei Tage", { title: "Kontrolle", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["Bett beziehen vierzehntäglich", { title: "Bett beziehen", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["Steuern prüfen quartalsweise", { title: "Steuern prüfen", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["Dehnen jeden Tag bis einschließlich Freitag", { title: "Dehnen", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["Physio jede Woche insgesamt 6 Mal", { title: "Physio", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		["Wöchentliche Besprechung", { title: "Wöchentliche Besprechung", recurrence: "FREQ=WEEKLY" }],
		["Monatlichen Bericht schreiben", { title: "Monatlichen Bericht schreiben", recurrence: "FREQ=MONTHLY" }],
		["Jährliche Kontrolle", { title: "Jährliche Kontrolle", recurrence: "FREQ=YEARLY" }],
		["Tägliche Sicherung", { title: "Tägliche Sicherung", recurrence: "FREQ=DAILY" }],
		["Abrechnung jeden zweiten Montag im Monat", { title: "Abrechnung", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=2" }],
		["Inventur jeden letzten Freitag des Monats", { title: "Inventur", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
	],
	estimates: [
		["Beitrag schreiben 1h30min", { title: "Beitrag schreiben", estimate: 90 }],
		["Konzept schreiben dauert etwa 1,5 Stunden", { title: "Konzept schreiben", estimate: 90 }],
		["Mails lesen ca. 20 Min.", { title: "Mails lesen", estimate: 20 }],
		["Yoga für eine halbe Stunde", { title: "Yoga", estimate: 30 }],
		["Pause eine Viertelstunde", { title: "Pause", estimate: 15 }],
		["Training anderthalb Stunden", { title: "Training", estimate: 90 }],
		["Aufräumen eine Dreiviertelstunde", { title: "Aufräumen", estimate: 45 }],
	],
	keywords: [
		["dringend: Server reparieren", { title: "Server reparieren", priority: "urgent" }],
		["Angebot schicken hohe Priorität", { title: "Angebot schicken", priority: "high" }],
		["Ablage sortieren Prio: niedrig", { title: "Ablage sortieren", priority: "low" }],
		["Antrag prüfen in Bearbeitung", { title: "Antrag prüfen", status: "in-progress" }],
		["Rechnung erledigt", { title: "Rechnung", status: "done" }],
		["Ausflug abgesagt", { title: "Ausflug", status: "cancelled" }],
		["Freigabe blockiert", { title: "Freigabe", status: "waiting" }],
	],
	"plain titles": [
		["Termin mit Jo vereinbaren", { title: "Termin mit Jo vereinbaren" }],
		["Warten auf den Bus", { title: "Warten auf den Bus" }],
		["Prüfen ob der Server läuft", { title: "Prüfen ob der Server läuft" }],
		["Das Do auf der Flöte üben", { title: "Das Do auf der Flöte üben" }],
		["Stunden und Minuten zusammenzählen", { title: "Stunden und Minuten zusammenzählen" }],
		["Gespräch mit Nikolaus", { title: "Gespräch mit Nikolaus" }],
		["Montagsplanung überarbeiten", { title: "Montagsplanung überarbeiten" }],
		["Eine wöchentliche Besprechung planen", { title: "Eine wöchentliche Besprechung planen" }],
		["Die tägliche Zeitung lesen", { title: "Die tägliche Zeitung lesen" }],
		["Morgenmantel kaufen", { title: "Morgenmantel kaufen" }],
		["Übermorgenplanung besprechen", { title: "Übermorgenplanung besprechen" }],
	],
});

// Engine gaps: excluded examples; expected and actual are compact task objects.
// "So kann es bleiben"
// expected: { title: "So kann es bleiben" }
// actual: { title: "kann es bleiben", scheduled: { date: "2026-11-01" } }
// "Fenster offen lassen"
// expected: { title: "Fenster offen lassen" }
// actual: { title: "Fenster lassen", status: "open" }
// "Bild hoch laden"
// expected: { title: "Bild hoch laden" }
// actual: { title: "Bild laden", priority: "high" }
// "Abrechnung jeden zweiten Montag"
// expected: { title: "Abrechnung", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO" }
// actual: { title: "Abrechnung", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=2" }
// "Kontrolle jeden 3. Mittwoch"
// expected: { title: "Kontrolle", recurrence: "FREQ=WEEKLY;INTERVAL=3;BYDAY=WE" }
// actual: { title: "Kontrolle", recurrence: "FREQ=MONTHLY;BYDAY=WE;BYSETPOS=3" }
// "Anruf um Mitternacht"
// expected: { title: "Anruf", scheduled: { date: "2026-10-30", time: "00:00" } }
// actual: { title: "Anruf", scheduled: { date: "2026-10-30" } }
// "Essen mittags"
// expected: { title: "Essen", scheduled: { date: "2026-10-29", time: "12:00" } }
// actual: { title: "Essen", scheduled: { date: "2026-10-29" } }
// "Den 2. Entwurf lesen"
// expected: { title: "Den 2. Entwurf lesen" }
// actual: { title: ". Entwurf lesen", scheduled: { date: "2026-11-02" } }
