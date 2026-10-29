import type { NLPLanguageConfig } from "./types.js";

export const jaConfig: NLPLanguageConfig = {
	code: "ja",
	name: "日本語",
	chronoLocale: "ja",
	spaceless: true,

	dateTriggers: {
		due: ["提出期限は", "提出期限", "支払期限は", "支払期限", "締め切りは", "締め切り", "締切は", "締切", "〆切は", "〆切", "期限は", "期限", "納期は", "納期", "までに", "まで"],
		scheduled: ["開始予定は", "開始予定", "開始日時は", "開始日時", "開始日は", "開始日", "開始は", "開始", "着手日は", "着手日", "着手は", "着手", "予定日は", "予定日", "予定は", "予定"],
	},

	recurrence: {
		frequencies: {
			daily: ["毎日", "毎晩", "毎朝"],
			weekly: ["毎週"],
			monthly: ["毎月"],
			yearly: ["毎年"],
		},
		every: ["毎週", "毎月", "毎"],
		// Japanese uses 隔週 etc., not a separate word meaning English "other".
		other: [],
		weekdays: {
			monday: ["月曜日", "月曜", "げつようび"],
			tuesday: ["火曜日", "火曜", "かようび"],
			wednesday: ["水曜日", "水曜", "すいようび"],
			thursday: ["木曜日", "木曜", "もくようび"],
			friday: ["金曜日", "金曜", "きんようび"],
			saturday: ["土曜日", "土曜", "どようび"],
			sunday: ["日曜日", "日曜", "にちようび"],
		},
		// No grammatical plural; 毎週 + weekday lists use the weekly suffix parser.
		// Bare 月/水/日 also mean month/water/day, so omit those abbreviations.
		pluralWeekdays: {
			monday: [],
			tuesday: [],
			wednesday: [],
			thursday: [],
			friday: [],
			saturday: [],
			sunday: [],
		},
		weekdayGroups: {
			weekdays: ["毎週平日", "平日は毎日", "平日毎日"],
			weekends: ["毎週土日", "毎週末"],
		},
		listConjunctions: ["と", "および", "及び", "ならびに", "並びに"],
		phrases: [
			{ phrase: "隔日", rule: "FREQ=DAILY;INTERVAL=2" },
			{ phrase: "一日おき", rule: "FREQ=DAILY;INTERVAL=2" },
			{ phrase: "1日おき", rule: "FREQ=DAILY;INTERVAL=2" },
			{ phrase: "隔週", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "2週間ごと", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "二週間ごと", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "隔月", rule: "FREQ=MONTHLY;INTERVAL=2" },
			{ phrase: "四半期ごと", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "3か月ごと", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "3ヶ月ごと", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "3カ月ごと", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "3箇月ごと", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "半年ごと", rule: "FREQ=MONTHLY;INTERVAL=6" },
			{ phrase: "半年に一度", rule: "FREQ=MONTHLY;INTERVAL=6" },
			{ phrase: "隔年", rule: "FREQ=YEARLY;INTERVAL=2" },
		],
		until: ["までに", "まで", "終了日：", "終了日:", "終了日", "終了：", "終了:"],
		count: ["全{n}回", "合計{n}回", "{n}回限り", "{n}回"],
		ordinals: {
			first: ["第1", "第一", "第１", "最初の", "1番目の", "一番目の"],
			second: ["第2", "第二", "第２", "2番目の", "二番目の"],
			third: ["第3", "第三", "第３", "3番目の", "三番目の"],
			fourth: ["第4", "第四", "第４", "4番目の", "四番目の"],
			last: ["最終", "最後の", "最終の"],
		},
		periods: {
			day: ["日間", "日"],
			week: ["週間", "週"],
			month: ["か月", "ヶ月", "カ月", "ケ月", "箇月", "月"],
			year: ["年間", "年"],
		},
	},

	timeEstimate: {
		hours: ["時間", "じかん", "hrs", "hr", "h"],
		minutes: ["分間", "分", "ふん", "ぷん", "mins", "min", "m"],
		// Relative Japanese durations have suffixes (後/以内), not prefixes.
		relativePrefixes: [],
		relativeSuffixes: ["後", "あと", "以内"],
		phrases: [
			{ phrase: "一時間半", minutes: 90 },
			{ phrase: "半時間", minutes: 30 },
			{ phrase: "一時間", minutes: 60 },
		],
	},

	connectors: {
		date: ["実施日：", "実施日:", "日時：", "日時:"],
		estimate: ["所要時間：", "所要時間:", "所要時間", "所要：", "所要:", "所要", "見積もり：", "見積もり:", "見積もり", "見積：", "見積:", "見積", "約", "およそ"],
		recurrence: ["繰り返し：", "繰り返し:", "繰り返し", "繰返し：", "繰返し:", "繰返し", "反復：", "反復:"],
		keyword: ["ステータス：", "ステータス:", "状態：", "状態:"],
	},

	dates: {
		relativeDays: [
			{ phrase: "明後日", days: 2 },
			{ phrase: "あさって", days: 2 },
			{ phrase: "明々後日", days: 3 },
			{ phrase: "しあさって", days: 3 },
			{ phrase: "一昨日", days: -2 },
			{ phrase: "おととい", days: -2 },
		],
		// Calendar-week endings, not the ambiguous Saturday/Sunday outing 週末.
		weekEnd: 0,
		endOf: [
			{ phrase: "今週の終わり", period: "week" },
			{ phrase: "来週の終わり", period: "week", next: true },
			{ phrase: "今日中", period: "day" },
			{ phrase: "本日中", period: "day" },
			{ phrase: "明日中", period: "day", next: true },
			{ phrase: "今月末", period: "month" },
			{ phrase: "月末", period: "month" },
			{ phrase: "来月末", period: "month", next: true },
			{ phrase: "今年末", period: "year" },
			{ phrase: "年末", period: "year" },
			{ phrase: "年内", period: "year" },
			{ phrase: "来年末", period: "year", next: true },
		],
		holidays: [
			{ phrase: "元日", month: 1, day: 1 },
			{ phrase: "元旦", month: 1, day: 1 },
			{ phrase: "建国記念の日", month: 2, day: 11 },
			{ phrase: "天皇誕生日", month: 2, day: 23 },
			{ phrase: "昭和の日", month: 4, day: 29 },
			{ phrase: "憲法記念日", month: 5, day: 3 },
			{ phrase: "みどりの日", month: 5, day: 4 },
			{ phrase: "こどもの日", month: 5, day: 5 },
			{ phrase: "子供の日", month: 5, day: 5 },
			{ phrase: "山の日", month: 8, day: 11 },
			{ phrase: "文化の日", month: 11, day: 3 },
			{ phrase: "勤労感謝の日", month: 11, day: 23 },
			{ phrase: "大晦日", month: 12, day: 31 },
			{ phrase: "大みそか", month: 12, day: 31 },
			{ phrase: "クリスマスイブ", month: 12, day: 24 },
			{ phrase: "クリスマス・イブ", month: 12, day: 24 },
			{ phrase: "クリスマス", month: 12, day: 25 },
			{ phrase: "バレンタインデー", month: 2, day: 14 },
			{ phrase: "ホワイトデー", month: 3, day: 14 },
			{ phrase: "ハロウィン", month: 10, day: 31 },
		],
		dayOfMonth: ["{n}日"],
		clockPhrases: [
			{ phrase: "正午", hour: 12, minute: 0 },
			{ phrase: "真夜中", hour: 0, minute: 0 },
		],
	},

	// Keep bare 優先度 out: existing consumers retain it in spaced title text.
	priorityWords: ["優先度：", "優先度:", "優先順位"],
	fallbackStatus: {
		open: ["未着手", "未対応", "未完了", "未処理"],
		inProgress: ["進行中", "作業中", "対応中", "実行中", "処理中", "着手済み"],
		done: ["完了", "対応済み", "処理済み", "完了済み"],
		cancelled: ["キャンセル", "取り消し", "取消し", "中止"],
		waiting: ["保留", "待機中", "承認待ち", "確認待ち", "返事待ち", "返信待ち", "ブロック中"],
	},
	fallbackPriority: {
		urgent: ["最優先", "緊急", "至急", "大至急"],
		high: ["高優先度", "優先度高", "重要", "高"],
		normal: ["通常優先度", "優先度中", "中優先度"],
		low: ["低優先度", "優先度低", "後回し"],
	},
};
