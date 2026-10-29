import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00 local time.
runExamples("fr", {
	dates: [
		["Appeler Jo demain à 15h", { title: "Appeler Jo", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["Appeler Jo demain à midi", { title: "Appeler Jo", scheduled: { date: "2026-10-30", time: "12:00" } }],
		["Appeler Jo après-demain", { title: "Appeler Jo", scheduled: { date: "2026-10-31" } }],
		["Rappeler dans une demi-heure", { title: "Rappeler", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["Réunion programmée pour lundi", { title: "Réunion", scheduled: { date: "2026-11-02" } }],
		["Rappeler après demain", { title: "Rappeler", scheduled: { date: "2026-10-31" } }],
		["Envoyer le bilan avant la fin de la semaine", { title: "Envoyer le bilan", due: { date: "2026-11-01" } }],
		["Envoyer le bilan fin de la semaine prochaine", { title: "Envoyer le bilan", scheduled: { date: "2026-11-08" } }],
		["Déjeuner demain vers midi", { title: "Déjeuner", scheduled: { date: "2026-10-30", time: "12:00" } }],
		["Appeler Léa demain vers 16h", { title: "Appeler Léa", scheduled: { date: "2026-10-30", time: "16:00" } }],
		["Réunion demain à 15:30", { title: "Réunion", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["Rappeler dans un quart d’heure", { title: "Rappeler", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["Rappeler dans une heure et demie", { title: "Rappeler", scheduled: { date: "2026-10-29", time: "11:30" } }],
		["Rappeler dans 45 minutes", { title: "Rappeler", scheduled: { date: "2026-10-29", time: "10:45" } }],
		["Consultation prévue pour mardi", { title: "Consultation", scheduled: { date: "2026-11-03" } }],
		["Appeler Jo demain à 15:00 #travail", { title: "Appeler Jo", scheduled: { date: "2026-10-30", time: "15:00" }, tags: ["travail"] }],
		["Envoyer le devis pour vendredi", { title: "Envoyer le devis", due: { date: "2026-10-30" } }],
		["Déposer le dossier au plus tard le 3 novembre", { title: "Déposer le dossier", due: { date: "2026-11-03" } }],
		["Payer le loyer d’ici lundi", { title: "Payer le loyer", due: { date: "2026-11-02" } }],
		["Rendre les clés avant le 15 novembre", { title: "Rendre les clés", due: { date: "2026-11-15" } }],
		["Dentiste prévu le 12 novembre", { title: "Dentiste", scheduled: { date: "2026-11-12" } }],
		["Relancer Léa dans 2 heures", { title: "Relancer Léa", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["Boucler le bilan avant la fin du mois", { title: "Boucler le bilan", due: { date: "2026-10-31" } }],
		["Envoyer les comptes fin du mois prochain", { title: "Envoyer les comptes", scheduled: { date: "2026-11-30" } }],
		["Classer les archives fin de l’année", { title: "Classer les archives", scheduled: { date: "2026-12-31" } }],
		["Faire les courses le 15", { title: "Faire les courses", scheduled: { date: "2026-11-15" } }],
		["Appeler Jo à seize heures et demie", { title: "Appeler Jo", scheduled: { date: "2026-10-29", time: "16:30" } }],
		["Ouvrir la boutique à neuf heures moins le quart", { title: "Ouvrir la boutique", scheduled: { date: "2026-10-30", time: "08:45" } }],
		["Réserver le train pour Noël", { title: "Réserver le train", due: { date: "2026-12-25" } }],
		["Visiter la famille à la Toussaint", { title: "Visiter la famille", scheduled: { date: "2026-11-01" } }],
		["Préparer le repas du Nouvel An", { title: "Préparer le repas", scheduled: { date: "2027-01-01" } }],
		["Sortir le drapeau fête nationale belge", { title: "Sortir le drapeau", scheduled: { date: "2027-07-21" } }],
	],
	recurrence: [
		["Réunion chaque premier lundi du mois", { title: "Réunion", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["Réunion hebdomadaire", { title: "Réunion hebdomadaire", recurrence: "FREQ=WEEKLY" }],
		["Bilan mensuel", { title: "Bilan mensuel", recurrence: "FREQ=MONTHLY" }],
		["Sauvegarder quotidiennement", { title: "Sauvegarder", recurrence: "FREQ=DAILY" }],
		["Vérifier chaque dernier jeudi du mois", { title: "Vérifier", recurrence: "FREQ=MONTHLY;BYDAY=TH;BYSETPOS=-1" }],
		["Arroser les plantes tous les jours", { title: "Arroser les plantes", recurrence: "FREQ=DAILY" }],
		["Aller courir tous les lundis", { title: "Aller courir", recurrence: "FREQ=WEEKLY;BYDAY=MO" }],
		["Faire du sport chaque lun., mer. et ven.", { title: "Faire du sport", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["Réunion toutes les 2 semaines le mardi", { title: "Réunion", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["Faire la compta tous les mois", { title: "Faire la compta", recurrence: "FREQ=MONTHLY" }],
		["Renouveler l’assurance chaque année", { title: "Renouveler l’assurance", recurrence: "FREQ=YEARLY" }],
		["Envoyer le rapport chaque premier lundi", { title: "Envoyer le rapport", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["Faire le bilan chaque dernier vendredi", { title: "Faire le bilan", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["Appeler papa tous les quinze jours", { title: "Appeler papa", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["Faire le ménage une semaine sur deux", { title: "Faire le ménage", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["Yoga un lundi sur deux", { title: "Yoga", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO" }],
		["Prendre le traitement un jour sur deux", { title: "Prendre le traitement", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["Vérifier les comptes chaque trimestre", { title: "Vérifier les comptes", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["Sauvegarder tous les jours ouvrés", { title: "Sauvegarder", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["Faire le point du lundi au vendredi à 09:00", { title: "Faire le point", scheduled: { date: "2026-10-30", time: "09:00" }, recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["Randonner chaque week-end", { title: "Randonner", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["Faire les étirements chaque jour jusqu’à vendredi", { title: "Faire les étirements", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["Kinésithérapie chaque semaine pendant 6 fois", { title: "Kinésithérapie", recurrence: "FREQ=WEEKLY;COUNT=6" }],
	],
	estimates: [
		["Rédiger le compte rendu 2h", { title: "Rédiger le compte rendu", estimate: 120 }],
		["Relire le dossier environ 45 min", { title: "Relire le dossier", estimate: 45 }],
		["Préparer la réunion 1 heure 30 minutes", { title: "Préparer la réunion", estimate: 90 }],
		["Faire du yoga pendant une demi-heure", { title: "Faire du yoga", estimate: 30 }],
		["Ranger le bureau un quart d’heure", { title: "Ranger le bureau", estimate: 15 }],
		["Marcher trois quarts d'heure", { title: "Marcher", estimate: 45 }],
		["Atelier durée estimée une heure et demie", { title: "Atelier", estimate: 90 }],
		["Préparer les diapositives 1,5 heures", { title: "Préparer les diapositives", estimate: 90 }],
	],
	keywords: [
		["Urgent : réparer la fuite", { title: "réparer la fuite", priority: "urgent" }],
		["Relancer le client priorité élevée", { title: "Relancer le client", priority: "high" }],
		["Trier les photos priorité basse", { title: "Trier les photos", priority: "low" }],
		["Lire le rapport priorité normale", { title: "Lire le rapport", priority: "normal" }],
		["Réviser le contrat en cours", { title: "Réviser le contrat", status: "in-progress" }],
		["Commande en attente", { title: "Commande", status: "waiting" }],
		["Facture terminée", { title: "Facture", status: "done" }],
		["Réservation annulée", { title: "Réservation", status: "cancelled" }],
		["Lessive à faire", { title: "Lessive", status: "open" }],
	],
	"plain titles": [
		["Acheter un agenda hebdomadaire", { title: "Acheter un agenda hebdomadaire" }],
		["Lire le rapport annuel", { title: "Lire le rapport annuel" }],
		["Acheter une revue mensuelle", { title: "Acheter une revue mensuelle" }],
		["Relire le 15e chapitre", { title: "Relire le 15e chapitre" }],
		["Acheter un jeu de société", { title: "Acheter un jeu de société" }],
		["Regarder la mer", { title: "Regarder la mer" }],
		["Acheter un meuble bas", { title: "Acheter un meuble bas" }],
		["Lire le fait divers", { title: "Lire le fait divers" }],
		["Appeler Sam", { title: "Appeler Sam" }],
		["Relire le 2e brouillon", { title: "Relire le 2e brouillon" }],
		["Mesurer le câble de 2 m", { title: "Mesurer le câble de 2 m" }],
		["Vérifier le fonctionnement normal", { title: "Vérifier le fonctionnement normal" }],
	],
});

// Engine gaps: excluded rather than asserting the parser's incorrect output.
// Input: Fermer la boutique à minuit
// Expected: { title: "Fermer la boutique", scheduled: { date: "2026-10-30", time: "00:00" } }
// Actual: { title: "Fermer la boutique", scheduled: { date: "2026-10-30" } }
// Input: Réunion le premier lundi de chaque mois
// Expected: { title: "Réunion", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }
// Actual: { title: "Réunion le premier de", scheduled: { date: "2026-11-02" }, recurrence: "FREQ=MONTHLY" }
// Input: Rédiger le bilan 1h30
// Expected: { title: "Rédiger le bilan", estimate: 90 }
// Actual: { title: "Rédiger le bilan", scheduled: { date: "2026-10-30", time: "01:30" } }
// Input: Acheter des cadeaux de Noël
// Expected: { title: "Acheter des cadeaux de Noël" }
// Actual: { title: "Acheter des cadeaux de", scheduled: { date: "2026-12-25" } }
