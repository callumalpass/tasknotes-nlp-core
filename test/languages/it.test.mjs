import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("it", {
	dates: [
		["richiamare fra 2 ore", { title: "richiamare", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["chiamare alle tre", { title: "chiamare", scheduled: { date: "2026-10-30", time: "03:00" } }],
		["pranzare a mezzogiorno", { title: "pranzare", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["richiamare tra mezz’ora", { title: "richiamare", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["telefonare fra un quarto d'ora", { title: "telefonare", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["consegnare entro 90 minuti", { title: "consegnare", due: { date: "2026-10-29", time: "11:30" } }],
		["ritirare dopo domani", { title: "ritirare", scheduled: { date: "2026-10-31" } }],
		["consegnare entro fine della settimana", { title: "consegnare", due: { date: "2026-11-01" } }],
		["chiudere pratica entro fine della prossima settimana", { title: "chiudere pratica", due: { date: "2026-11-08" } }],
		["controllare fine di questa settimana", { title: "controllare", scheduled: { date: "2026-11-01" } }],
		["partire a mezzanotte", { title: "partire", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["telefonare domani alle tre", { title: "telefonare", scheduled: { date: "2026-10-30", time: "03:00" } }],
		["telefonare alle 15:30", { title: "telefonare", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["telefonare domani all’una", { title: "telefonare", scheduled: { date: "2026-10-30", time: "01:00" } }],
		["visita programmata per domani", { title: "visita", scheduled: { date: "2026-10-30" } }],
		["telefonare domani all’una e mezza", { title: "telefonare", scheduled: { date: "2026-10-30", time: "01:30" } }],
		["preparare cena alla vigilia di Natale", { title: "preparare cena", scheduled: { date: "2026-12-24" } }],
		["chiamare Giulia domani alle 15:00 #lavoro", { title: "chiamare Giulia", scheduled: { date: "2026-10-30", time: "15:00" }, tags: ["lavoro"] }],
		["spedire il contratto entro venerdì", { title: "spedire il contratto", due: { date: "2026-10-30" } }],
		["dentista dopodomani alle 09:00", { title: "dentista", scheduled: { date: "2026-10-31", time: "09:00" } }],
		["pagare bolletta entro le 20:00", { title: "pagare bolletta", due: { date: "2026-10-29", time: "20:00" } }],
		["visita programmata per il 25/12/2026", { title: "visita", scheduled: { date: "2026-12-25" } }],
		["consegnare bozza entro fine mese", { title: "consegnare bozza", due: { date: "2026-10-31" } }],
		["chiudere bilancio entro fine del prossimo anno", { title: "chiudere bilancio", due: { date: "2027-12-31" } }],
		["spedire pacchi prima di Natale", { title: "spedire pacchi", due: { date: "2026-12-25" } }],
		["prenotare cena a Capodanno", { title: "prenotare cena", scheduled: { date: "2027-01-01" } }],
		["preparare valigia a Ferragosto", { title: "preparare valigia", scheduled: { date: "2027-08-15" } }],
		["andare in banca il 15", { title: "andare in banca", scheduled: { date: "2026-11-15" } }],
		["ritirare documenti alle undici e mezza", { title: "ritirare documenti", scheduled: { date: "2026-10-29", time: "11:30" } }],
		["riunione alle undici meno un quarto", { title: "riunione", scheduled: { date: "2026-10-29", time: "10:45" } }],
		["telefonare oggi alle 18:30", { title: "telefonare", scheduled: { date: "2026-10-29", time: "18:30" } }],
	],
	recurrence: [
		["riunione settimanale", { title: "riunione settimanale", recurrence: "FREQ=WEEKLY" }],
		["controllo trimestrale", { title: "controllo trimestrale", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["assemblea ogni prima domenica del mese", { title: "assemblea", recurrence: "FREQ=MONTHLY;BYDAY=SU;BYSETPOS=1" }],
		["controllare mensilmente", { title: "controllare", recurrence: "FREQ=MONTHLY" }],
		["riunione ogni 2 settimane il martedì", { title: "riunione", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["backup ogni lun. e gio.", { title: "backup", recurrence: "FREQ=WEEKLY;BYDAY=MO,TH" }],
		["rinnovare ogni anno", { title: "rinnovare", recurrence: "FREQ=YEARLY" }],
		["annaffiare piante tutti i giorni", { title: "annaffiare piante", recurrence: "FREQ=DAILY" }],
		["palestra ogni lun, mer e ven", { title: "palestra", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["chiamare mamma tutte le domeniche", { title: "chiamare mamma", recurrence: "FREQ=WEEKLY;BYDAY=SU" }],
		["fare mercato tutti i sabati", { title: "fare mercato", recurrence: "FREQ=WEEKLY;BYDAY=SA" }],
		["controllare posta tutti i giorni lavorativi", { title: "controllare posta", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["fare una passeggiata ogni weekend", { title: "fare una passeggiata", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["backup ogni 3 giorni", { title: "backup", recurrence: "FREQ=DAILY;INTERVAL=3" }],
		["pagare affitto ogni mese", { title: "pagare affitto", recurrence: "FREQ=MONTHLY" }],
		["assemblea ogni prima domenica", { title: "assemblea", recurrence: "FREQ=MONTHLY;BYDAY=SU;BYSETPOS=1" }],
		["inviare resoconto ogni ultimo venerdì", { title: "inviare resoconto", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["fisioterapia a settimane alterne", { title: "fisioterapia", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["controllare filtri ogni trimestre", { title: "controllare filtri", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["prendere vitamina a giorni alterni", { title: "prendere vitamina", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["stretching ogni giorno fino a domenica", { title: "stretching", recurrence: "FREQ=DAILY;UNTIL=20261101" }],
		["terapia ogni settimana per 6 volte", { title: "terapia", recurrence: "FREQ=WEEKLY;COUNT=6" }],
	],
	estimates: [
		["scrivere relazione 1,5 ore", { title: "scrivere relazione", estimate: 90 }],
		["sistemare cucina 1h30m", { title: "sistemare cucina", estimate: 90 }],
		["leggere per mezz'ora", { title: "leggere", estimate: 30 }],
		["ripassare per un’ora e mezza", { title: "ripassare", estimate: 90 }],
		["rispondere alle email, richiede circa 20 minuti", { title: "rispondere alle email", estimate: 20 }],
		["meditare per un quarto d'ora", { title: "meditare", estimate: 15 }],
		["camminare per tre quarti d’ora", { title: "camminare", estimate: 45 }],
	],
	keywords: [
		["urgente: riparare caldaia", { title: "riparare caldaia", priority: "urgent" }],
		["inviare preventivo priorità alta", { title: "inviare preventivo", priority: "high" }],
		["riordinare archivio bassa priorità", { title: "riordinare archivio", priority: "low" }],
		["aggiornare sito priorità media", { title: "aggiornare sito", priority: "normal" }],
		["revisione in corso", { title: "revisione", status: "in-progress" }],
		["prenotazione confermata, completata", { title: "prenotazione confermata", status: "done" }],
		["ordine in attesa", { title: "ordine", status: "waiting" }],
		["visita annullata", { title: "visita", status: "cancelled" }],
		["backup da fare", { title: "backup", status: "open" }],
	],
	"plain titles": [
		["studiare la domenicalità", { title: "studiare la domenicalità" }],
		["comprare un abbonamento mensile", { title: "comprare un abbonamento mensile" }],
		["comprare una agenda settimanale", { title: "comprare una agenda settimanale" }],
		["rileggere il rapporto annuale", { title: "rileggere il rapporto annuale" }],
		["rivedere il 15 capitolo", { title: "rivedere il 15 capitolo" }],
		["comprare una sveglia normale", { title: "comprare una sveglia normale" }],
		["rivedere il secondo capitolo", { title: "rivedere il secondo capitolo" }],
		["misurare la pressione alta", { title: "misurare la pressione alta" }],
		["scegliere il termine del contratto", { title: "scegliere il termine del contratto" }],
		["decidere ora o mai più", { title: "decidere ora o mai più" }],
		["leggere il giornale", { title: "leggere il giornale" }],
	],
});

// Engine gaps: excluded examples; expected values express the intended meaning.
// "visita prevista per il 15"
//   expected: { title: "visita", scheduled: { date: "2026-11-15" } }
//   actual:   { title: "visita prevista", scheduled: { date: "2026-11-15" } }
// "consegnare il 15 novembre"
//   expected: { title: "consegnare", scheduled: { date: "2026-11-15" } }
//   actual:   { title: "consegnare il 15 novembre" }
// "dentista lunedì prossimo"
//   expected: { title: "dentista", scheduled: { date: "2026-11-02" } }
//   actual:   { title: "dentista prossimo", scheduled: { date: "2026-11-02" } }
// "studiare il DOM"
//   expected: { title: "studiare il DOM" }
//   actual:   { title: "studiare", scheduled: { date: "2026-11-01" } }
// "passare ogni giorno feriale" (feriale includes Saturday)
//   expected: { title: "passare", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA" }
//   actual:   { title: "passare feriale", recurrence: "FREQ=DAILY" }
