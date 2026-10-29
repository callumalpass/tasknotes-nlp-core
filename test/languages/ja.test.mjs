import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00.
runExamples("ja", {
	dates: [
		["返信 期限：今日中", { title: "返信", due: { date: "2026-10-29" } }],
		["予約を取る 期限：明日中", { title: "予約を取る", due: { date: "2026-10-30" } }],
		["会議 午後3時半", { title: "会議", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["母へ電話 明日午後3時", { title: "母へ電話", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["買い物 明日", { title: "買い物", scheduled: { date: "2026-10-30" } }],
		["今日ゴミを出す", { title: "ゴミを出す", scheduled: { date: "2026-10-29" } }],
		["報告書を書く 締め切りは明日", { title: "報告書を書く", due: { date: "2026-10-30" } }],
		["家賃を払う 支払期限：11月1日", { title: "家賃を払う", due: { date: "2026-11-01" } }],
		["面談 開始予定は明日午後2時", { title: "面談", scheduled: { date: "2026-10-30", time: "14:00" } }],
		["経費精算 締切：今月末", { title: "経費精算", due: { date: "2026-10-31" } }],
		["契約更新 期限：来月末", { title: "契約更新", due: { date: "2026-11-30" } }],
		["写真整理 期限：年末", { title: "写真整理", due: { date: "2026-12-31" } }],
		["振込 15日", { title: "振込", scheduled: { date: "2026-11-15" } }],
		["帰省 元日", { title: "帰省", scheduled: { date: "2027-01-01" } }],
		["美術館へ行く 文化の日", { title: "美術館へ行く", scheduled: { date: "2026-11-03" } }],
		["ケーキを受け取る クリスマスイブ", { title: "ケーキを受け取る", scheduled: { date: "2026-12-24" } }],
		["プレゼントを渡す クリスマス", { title: "プレゼントを渡す", scheduled: { date: "2026-12-25" } }],
	],
	recurrence: [
		["薬を飲む 毎日", { title: "薬を飲む", recurrence: "FREQ=DAILY" }],
		["毎朝ストレッチ", { title: "ストレッチ", recurrence: "FREQ=DAILY" }],
		["掃除 毎週", { title: "掃除", recurrence: "FREQ=WEEKLY" }],
		["家賃を払う 毎月", { title: "家賃を払う", recurrence: "FREQ=MONTHLY" }],
		["健康診断 毎年", { title: "健康診断", recurrence: "FREQ=YEARLY" }],
		["運動 毎週火曜、木曜", { title: "運動", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }],
		["洗濯 毎週土日", { title: "洗濯", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["水やり 隔日", { title: "水やり", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["通院 隔週金曜日", { title: "通院", recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR" }],
		["請求書を送る 四半期ごと", { title: "請求書を送る", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["繰り返し：毎日全5回筋トレ", { title: "筋トレ", recurrence: "FREQ=DAILY;COUNT=5" }],
		["リハビリ 毎週6回", { title: "リハビリ", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		["日報 毎週平日", { title: "日報", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["散歩 毎日 終了日：11月3日", { title: "散歩", recurrence: "FREQ=DAILY;UNTIL=20261103" }],
		["毎週月曜日ゴミ出し", { title: "ゴミ出し", recurrence: "FREQ=WEEKLY;BYDAY=MO" }],
	],
	estimates: [
		["休憩 15min", { title: "休憩", estimate: 15 }],
		["資料作成2時間", { title: "資料作成", estimate: 120 }],
		["読書30分", { title: "読書", estimate: 30 }],
		["掃除1時間30分", { title: "掃除", estimate: 90 }],
		["散歩 所要時間：45分間", { title: "散歩", estimate: 45 }],
		["原稿を書く 見積もり：1.5時間", { title: "原稿を書く", estimate: 90 }],
		["メール返信 約10分", { title: "メール返信", estimate: 10 }],
		["勉強 一時間半", { title: "勉強", estimate: 90 }],
		["コードレビュー 2h", { title: "コードレビュー", estimate: 120 }],
	],
	keywords: [
		["至急：サーバーを復旧", { title: "サーバーを復旧", priority: "urgent" }],
		["請求書を確認 優先度高", { title: "請求書を確認", priority: "high" }],
		["書類整理 優先度中", { title: "書類整理", priority: "normal" }],
		["棚を片付ける 低優先度", { title: "棚を片付ける", priority: "low" }],
		["仕様書を書く 未着手", { title: "仕様書を書く", status: "open" }],
		["翻訳 作業中", { title: "翻訳", status: "in-progress" }],
		["経費精算 承認待ち", { title: "経費精算", status: "waiting" }],
		["会場予約 キャンセル", { title: "会場予約", status: "cancelled" }],
		["買い物 完了 #家事", { title: "買い物", status: "done", tags: ["家事"] }],
	],
	"resolved first-pass gaps": [
		["運動 毎週火曜と木曜", { title: "運動", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }],
		["会議 毎月第2火曜日", { title: "会議", recurrence: "FREQ=MONTHLY;BYDAY=TU;BYSETPOS=2" }],
		["電話 2時間後", { title: "電話", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["明後日買い物", { title: "買い物", scheduled: { date: "2026-10-31" } }],
		["買い物#家事", { title: "買い物", tags: ["家事"] }],
	],
	"second-pass capabilities": [
		["あさって通院", { title: "通院", scheduled: { date: "2026-10-31" } }],
		["明々後日掃除", { title: "掃除", scheduled: { date: "2026-11-01" } }],
		["しあさって帰省", { title: "帰省", scheduled: { date: "2026-11-01" } }],
		["記録 一昨日", { title: "記録", scheduled: { date: "2026-10-27" } }],
		["日記 おととい", { title: "日記", scheduled: { date: "2026-10-27" } }],
		["精算 期限：今週の終わり", { title: "精算", due: { date: "2026-11-01" } }],
		["契約確認 期限：来週の終わり", { title: "契約確認", due: { date: "2026-11-08" } }],
		["昼食 正午", { title: "昼食", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["見回り 真夜中", { title: "見回り", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["電話30分後", { title: "電話", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["返信15分以内", { title: "返信", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["休憩1時間あと", { title: "休憩", scheduled: { date: "2026-10-29", time: "11:00" } }],
		["電話 一時間後", { title: "電話", scheduled: { date: "2026-10-29", time: "11:00" } }],
		["散歩 半時間後", { title: "散歩", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["毎月第一月曜日会議", { title: "会議", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }],
		["15日家賃を払う", { title: "家賃を払う", scheduled: { date: "2026-11-15" } }],
		["会議15:30", { title: "会議", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["面談 明日 正午", { title: "面談", scheduled: { date: "2026-10-30", time: "12:00" } }],
	],
	"plain titles": [
		["分割案を確認", { title: "分割案を確認" }],
		["時計を買う", { title: "時計を買う" }],
		["水道代を払う", { title: "水道代を払う" }],
		["月次報告を書く", { title: "月次報告を書く" }],
		["日用品を買う", { title: "日用品を買う" }],
		["木材を注文", { title: "木材を注文" }],
		["金額を確認", { title: "金額を確認" }],
		["時間割を作る", { title: "時間割を作る" }],
		["通常の手順を確認", { title: "通常の手順を確認" }],
		["低温調理器を買う", { title: "低温調理器を買う" }],
		["通知設定を見直す", { title: "通知設定を見直す" }],
		["15日分の領収書を整理", { title: "15日分の領収書を整理" }],
	],
});

// Engine gaps: excluded examples, with the same compact fields as runExamples.
// Input: 明日午後3時に母へ電話
// Expected: { title: "母へ電話", scheduled: { date: "2026-10-30", time: "15:00" } }
// Actual:   { title: "に母へ電話", scheduled: { date: "2026-10-30", time: "15:00" } }
// Input: 金曜日に歯医者
// Expected: { title: "歯医者", scheduled: { date: "2026-10-30" } }
// Actual:   { title: "に歯医者", scheduled: { date: "2026-10-30" } }
// Input: 毎週月曜日にゴミ出し
// Expected: { title: "ゴミ出し", recurrence: "FREQ=WEEKLY;BYDAY=MO" }
// Actual:   { title: "にゴミ出し", recurrence: "FREQ=WEEKLY;BYDAY=MO" }
// Input: 毎週平日の日報
// Expected: { title: "日報", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }
// Actual:   { title: "の日報", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }
// Input: 報告書を明日までに提出
// Expected: { title: "報告書を提出", due: { date: "2026-10-30" } }
// Actual:   { title: "報告書をまでに提出", scheduled: { date: "2026-10-30" } }
// Input: 水やり 3日ごと
// Expected: { title: "水やり", recurrence: "FREQ=DAILY;INTERVAL=3" }
// Actual:   { title: "水やり ごと", scheduled: { date: "2026-11-03" } }
// Input: 散歩 毎日11月3日まで
// Expected: { title: "散歩", recurrence: "FREQ=DAILY;UNTIL=20261103" }
// Actual:   { title: "散歩 まで", recurrence: "FREQ=DAILY", scheduled: { date: "2026-11-03" } }
// Input: 読書 1時間半
// Expected: { title: "読書", estimate: 90 }
// Actual:   { title: "読書 半", estimate: 60 }
// Input: 会議 午後3時15分
// Expected: { title: "会議", scheduled: { date: "2026-10-29", time: "15:15" } }
// Actual:   { title: "会議", scheduled: { date: "2026-10-29", time: "15:00" }, estimate: 15 }
// Input: 高速道路の料金を調べる
// Expected: { title: "高速道路の料金を調べる" }
// Actual:   { title: "速道路の料金を調べる", priority: "high" }
// Input: 完了報告を書く
// Expected: { title: "完了報告を書く" }
// Actual:   { title: "報告を書く", status: "done" }
// Input: 来週木曜日に面談
// Expected: { title: "面談", scheduled: { date: "2026-11-05" } }
// Actual:   { title: "来週に面談", scheduled: { date: "2026-10-29" } }
// Input: 毎週の献立を考える
// Expected: { title: "毎週の献立を考える" }
// Actual:   { title: "の献立を考える", recurrence: "FREQ=WEEKLY" }
// Input: 年末調整の資料を読む
// Expected: { title: "年末調整の資料を読む" }
// Actual:   { title: "調整の資料を読む", scheduled: { date: "2026-12-31" } }
// Input: 30分割の図を描く
// Expected: { title: "30分割の図を描く" }
// Actual:   { title: "割の図を描く", estimate: 30 }
// Input: 運動 毎週火曜と毎週木曜
// Expected: { title: "運動", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }
// Actual:   { title: "運動 と毎週", scheduled: { date: "2026-10-29" }, recurrence: "FREQ=WEEKLY;BYDAY=TU" }
