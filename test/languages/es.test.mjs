import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("es", {
	dates: [
		["visitar a Ana pasado mañana", { title: "visitar a Ana", scheduled: { date: "2026-10-31" } }],
		["enviar informe programado para el viernes", { title: "enviar informe", scheduled: { date: "2026-10-30" } }],
		["leer en media hora", { title: "leer", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["visitar pasado manana", { title: "visitar", scheduled: { date: "2026-10-31" } }],
		["entregar resumen para final de esta semana", { title: "entregar resumen", due: { date: "2026-11-01" } }],
		["entregar para fin de la semana", { title: "entregar", due: { date: "2026-11-01" } }],
		["almorzar al mediodía", { title: "almorzar", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["llamar a medianoche", { title: "llamar", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["llamar mañana al mediodía", { title: "llamar", scheduled: { date: "2026-10-30", time: "12:00" } }],
		["llamar mañana a las 15:30", { title: "llamar", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["volver dentro de una hora y media", { title: "volver", scheduled: { date: "2026-10-29", time: "11:30" } }],
		["llamar al cabo de 2 horas", { title: "llamar", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["llamar después de media hora", { title: "llamar", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["llamar a Ana mañana a las 15:00 #trabajo", { title: "llamar a Ana", scheduled: { date: "2026-10-30", time: "15:00" }, tags: ["trabajo"] }],
		["entregar informe para el viernes", { title: "entregar informe", due: { date: "2026-10-30" } }],
		["enviar factura a más tardar mañana", { title: "enviar factura", due: { date: "2026-10-30" } }],
		["renovar seguro antes del 5 de noviembre", { title: "renovar seguro", due: { date: "2026-11-05" } }],
		["ir al dentista el lunes", { title: "ir al dentista", scheduled: { date: "2026-11-02" } }],
		["recoger paquete hoy", { title: "recoger paquete", scheduled: { date: "2026-10-29" } }],
		["hacer copia en 2 horas", { title: "hacer copia", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["llamar dentro de 30 minutos", { title: "llamar", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["pagar alquiler para fin de mes", { title: "pagar alquiler", due: { date: "2026-10-31" } }],
		["cerrar cuentas para final del próximo mes", { title: "cerrar cuentas", due: { date: "2026-11-30" } }],
		["enviar resumen para final de la próxima semana", { title: "enviar resumen", due: { date: "2026-11-08" } }],
		["comprar regalos en Navidad", { title: "comprar regalos", scheduled: { date: "2026-12-25" } }],
		["reservar cena en Nochebuena", { title: "reservar cena", scheduled: { date: "2026-12-24" } }],
		["preparar roscón el Día de Reyes", { title: "preparar roscón", scheduled: { date: "2027-01-06" } }],
		["montar ofrenda el Día de Muertos", { title: "montar ofrenda", scheduled: { date: "2026-11-02" } }],
		["llamar a Ana el día 15", { title: "llamar a Ana", scheduled: { date: "2026-11-15" } }],
		["revisar contrato el 15", { title: "revisar contrato", scheduled: { date: "2026-11-15" } }],
		["recoger a Lucía a las cuatro y media", { title: "recoger a Lucía", scheduled: { date: "2026-10-29", time: "16:30" } }],
		["merendar a las cinco menos cuarto", { title: "merendar", scheduled: { date: "2026-10-29", time: "16:45" } }],
		["firmar contrato el 05/11/2026", { title: "firmar contrato", scheduled: { date: "2026-11-05" } }],
	],
	recurrence: [
		["reunión semanal", { title: "reunión semanal", recurrence: "FREQ=WEEKLY" }],
		["reunión diaria", { title: "reunión diaria", recurrence: "FREQ=DAILY" }],
		["revisar informe trimestral", { title: "revisar informe trimestral", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["reunirse cada primer lunes del mes", { title: "reunirse", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["revisar cada segundo martes de cada mes", { title: "revisar", recurrence: "FREQ=MONTHLY;BYDAY=TU;BYSETPOS=2" }],
		["regar plantas todos los días", { title: "regar plantas", recurrence: "FREQ=DAILY" }],
		["hacer ejercicio cada lun., mié. y vie.", { title: "hacer ejercicio", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["sacar la basura los martes", { title: "sacar la basura", recurrence: "FREQ=WEEKLY;BYDAY=TU" }],
		["visitar a mamá los sábados y los domingos", { title: "visitar a mamá", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["tomar vitaminas de lunes a viernes a las 9am", { title: "tomar vitaminas", scheduled: { date: "2026-10-30", time: "09:00" }, recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["salir a caminar cada fin de semana", { title: "salir a caminar", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["revisar inventario cada 2 semanas el martes", { title: "revisar inventario", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU" }],
		["pagar cuota todos los meses", { title: "pagar cuota", recurrence: "FREQ=MONTHLY" }],
		["renovar licencia cada año", { title: "renovar licencia", recurrence: "FREQ=YEARLY" }],
		["enviar informe cada primer lunes", { title: "enviar informe", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["hacer balance cada último viernes", { title: "hacer balance", recurrence: "FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1" }],
		["revisar objetivos trimestralmente", { title: "revisar objetivos", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["revisar inventario quincenalmente", { title: "revisar inventario", recurrence: "FREQ=DAILY;INTERVAL=15" }],
		["cambiar filtro cada dos semanas", { title: "cambiar filtro", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["limpiar acuario día por medio", { title: "limpiar acuario", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["tomar medicación cada día hasta el viernes", { title: "tomar medicación", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["ir a fisioterapia cada semana 6 veces", { title: "ir a fisioterapia", recurrence: "FREQ=WEEKLY;COUNT=6" }],
	],
	estimates: [
		["redactar propuesta 2h30min", { title: "redactar propuesta", estimate: 150 }],
		["leer durante media hora", { title: "leer", estimate: 30 }],
		["ordenar archivos tarda 10 minutos", { title: "ordenar archivos", estimate: 10 }],
		["preparar charla una hora y media", { title: "preparar charla", estimate: 90 }],
		["estirar un cuarto de hora", { title: "estirar", estimate: 15 }],
		["revisar presupuesto 1,5 horas", { title: "revisar presupuesto", estimate: 90 }],
	],
	keywords: [
		["urgente: arreglar servidor", { title: "arreglar servidor", priority: "urgent" }],
		["enviar propuesta prioridad alta", { title: "enviar propuesta", priority: "high" }],
		["archivar recibos prioridad baja", { title: "archivar recibos", priority: "low" }],
		["actualizar documentación prioridad normal", { title: "actualizar documentación", priority: "normal" }],
		["revisar diseño en curso", { title: "revisar diseño", status: "in-progress" }],
		["solicitar permiso en espera", { title: "solicitar permiso", status: "waiting" }],
		["enviar factura completada", { title: "enviar factura", status: "done" }],
	],
	"plain titles": [
		["comprar una agenda semanal", { title: "comprar una agenda semanal" }],
		["comprar una agenda diaria", { title: "comprar una agenda diaria" }],
		["comprar un informe trimestral", { title: "comprar un informe trimestral" }],
		["preparar el 15º borrador", { title: "preparar el 15º borrador" }],
		["revisar mensualidades", { title: "revisar mensualidades" }],
		["comprar sal de mar", { title: "comprar sal de mar" }],
		["recoger todo del suelo", { title: "recoger todo del suelo" }],
		["dar de alta a Ana", { title: "dar de alta a Ana" }],
		["comprar media docena de huevos", { title: "comprar media docena de huevos" }],
		["practicar el bajo", { title: "practicar el bajo" }],
		["comprar un diario", { title: "comprar un diario" }],
		["revisar el 2º borrador", { title: "revisar el 2º borrador" }],
		["revisar los minutos de la reunión", { title: "revisar los minutos de la reunión" }],
		["mirar el estado del mar", { title: "mirar el estado del mar" }],
		["cambiar a modo normal", { title: "cambiar a modo normal" }],
	],
});

// Engine gaps:
// "pasear los lunes y miércoles"
//   expected: { title: "pasear", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE" }
//   actual:   { title: "pasear y", recurrence: "FREQ=WEEKLY;BYDAY=MO", scheduled: { date: "2026-11-04" } }
// "leer 1 hora y media"
//   expected: { title: "leer", estimate: 90 }
//   actual:   { title: "leer y media", estimate: 60 }
// "saludar a Domingo"
//   expected: { title: "saludar a Domingo" }
//   actual:   { title: "saludar", scheduled: { date: "2026-11-01" } }
// "llamar mañana a las 15h"
//   expected: { title: "llamar", scheduled: { date: "2026-10-30", time: "15:00" } }
//   actual:   { title: "llamar a las 15h", scheduled: { date: "2026-10-30" } }
// "revisar el 15 de este mes"
//   expected: { title: "revisar", scheduled: { date: "2026-10-15" } }
//   actual:   { title: "revisar", scheduled: { date: "2026-11-15" } }
