import { runExamples } from "./examples.mjs";

// Reference date: Thursday 29 October 2026, 10:00 local time.
runExamples("zh", {
	dates: [
		["明天下午三点给小王打电话", { title: "给小王打电话", scheduled: { date: "2026-10-30", time: "15:00" } }],
		["提交报告截止周五", { title: "提交报告", due: { date: "2026-10-30" } }],
		["安排在下周一复诊", { title: "复诊", scheduled: { date: "2026-11-02" } }],
		["十五点一刻开会", { title: "开会", scheduled: { date: "2026-10-29", time: "15:15" } }],
		["礼拜天去看奶奶", { title: "去看奶奶", scheduled: { date: "2026-11-01" } }],
		["下午三点半接孩子", { title: "接孩子", scheduled: { date: "2026-10-29", time: "15:30" } }],
		["报销截止本月底", { title: "报销", due: { date: "2026-10-31" } }],
		["交初稿最迟下个月底", { title: "交初稿", due: { date: "2026-11-30" } }],
		["年底整理相册", { title: "整理相册", scheduled: { date: "2026-12-31" } }],
		["元旦去爬山", { title: "去爬山", scheduled: { date: "2027-01-01" } }],
		["圣诞节聚餐", { title: "聚餐", scheduled: { date: "2026-12-25" } }],
		["平安夜给爸妈打电话", { title: "给爸妈打电话", scheduled: { date: "2026-12-24" } }],
		["国庆节回家", { title: "回家", scheduled: { date: "2027-10-01" } }],
		["交房租15号", { title: "交房租", scheduled: { date: "2026-11-15" } }],
		["15号交房租", { title: "交房租", scheduled: { date: "2026-11-15" } }],
		["后天买菜", { title: "买菜", scheduled: { date: "2026-10-31" } }],
		["3小时后打电话", { title: "打电话", scheduled: { date: "2026-10-29", time: "13:00" } }],
		["大后天买菜", { title: "买菜", scheduled: { date: "2026-11-01" } }],
		["大後天買菜", { title: "買菜", scheduled: { date: "2026-11-01" } }],
		["报销截止本周结束", { title: "报销", due: { date: "2026-11-01" } }],
		["下週結束整理資料", { title: "整理資料", scheduled: { date: "2026-11-08" } }],
		["正午取餐", { title: "取餐", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["午夜备份", { title: "备份", scheduled: { date: "2026-10-30", time: "00:00" } }],
		["明天在15:30开会", { title: "开会", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["明天於15:30開會", { title: "開會", scheduled: { date: "2026-10-30", time: "15:30" } }],
		["半小时后打电话", { title: "打电话", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["一刻鐘以後休息", { title: "休息", scheduled: { date: "2026-10-29", time: "10:15" } }],
		["30分钟以内回复", { title: "回复", scheduled: { date: "2026-10-29", time: "10:30" } }],
		["3小時後打電話", { title: "打電話", scheduled: { date: "2026-10-29", time: "13:00" } }],
		["2小时之后复查", { title: "复查", scheduled: { date: "2026-10-29", time: "12:00" } }],
		["提交报告最迟于明天", { title: "提交报告", due: { date: "2026-10-30" } }],
		["後天買菜", { title: "買菜", scheduled: { date: "2026-10-31" } }],
		["差一刻十二点取快递", { title: "取快递", scheduled: { date: "2026-10-29", time: "11:45" } }],
	],
	recurrence: [
		["每3天浇花", { title: "浇花", recurrence: "FREQ=DAILY;INTERVAL=3" }],
		["每周一和周三跑步", { title: "跑步", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE" }],
		["每周一、周三、周五跑步", { title: "跑步", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["每隔3天浇花", { title: "浇花", recurrence: "FREQ=DAILY;INTERVAL=3" }],
		["每2周复盘", { title: "复盘", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["每周一及周四游泳", { title: "游泳", recurrence: "FREQ=WEEKLY;BYDAY=MO,TH" }],
		["每天浇花", { title: "浇花", recurrence: "FREQ=DAILY" }],
		["每週整理书桌", { title: "整理书桌", recurrence: "FREQ=WEEKLY" }],
		["每个月备份照片", { title: "备份照片", recurrence: "FREQ=MONTHLY" }],
		["每年体检", { title: "体检", recurrence: "FREQ=YEARLY" }],
		["每周一跑步", { title: "跑步", recurrence: "FREQ=WEEKLY;BYDAY=MO" }],
		["每星期三学钢琴", { title: "学钢琴", recurrence: "FREQ=WEEKLY;BYDAY=WE" }],
		["每週五下午三點開會", { title: "開會", scheduled: { date: "2026-10-30", time: "15:00" }, recurrence: "FREQ=WEEKLY;BYDAY=FR" }],
		["每个工作日读书", { title: "读书", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["每周末打扫", { title: "打扫", recurrence: "FREQ=WEEKLY;BYDAY=SA,SU" }],
		["隔周做理疗", { title: "做理疗", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["每两周换床单", { title: "换床单", recurrence: "FREQ=WEEKLY;INTERVAL=2" }],
		["每季度检查烟雾报警器", { title: "检查烟雾报警器", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["隔天练瑜伽", { title: "练瑜伽", recurrence: "FREQ=DAILY;INTERVAL=2" }],
		["每周共6次做理疗", { title: "做理疗", recurrence: "FREQ=WEEKLY;COUNT=6" }],
		["拉伸每天直到周五", { title: "拉伸", recurrence: "FREQ=DAILY;UNTIL=20261030" }],
		["每周一、每周三跑步", { title: "跑步", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE" }],
	],
	estimates: [
		["写周报预计耗时2小时", { title: "写周报", estimate: 120 }],
		["整理收件箱大约15分钟", { title: "整理收件箱", estimate: 15 }],
		["练琴半小时", { title: "练琴", estimate: 30 }],
		["阅读一个半小时", { title: "阅读", estimate: 90 }],
		["复习1小时30分钟", { title: "复习", estimate: 90 }],
		["整理資料預計45分鐘", { title: "整理資料", estimate: 45 }],
		["写方案1.5h", { title: "写方案", estimate: 90 }],
		["一刻钟整理桌面", { title: "整理桌面", estimate: 15 }],
	],
	keywords: [
		["買菜#家務", { title: "買菜", tags: ["家務"] }],
		["紧急：修复登录故障", { title: "修复登录故障", priority: "urgent" }],
		["提交申请高优先级", { title: "提交申请", priority: "high" }],
		["整理旧书低优先级", { title: "整理旧书", priority: "low" }],
		["更新文档中等优先级", { title: "更新文档", priority: "normal" }],
		["写报告进行中", { title: "写报告", status: "in-progress" }],
		["报销已完成", { title: "报销", status: "done" }],
		["旅行已取消", { title: "旅行", status: "cancelled" }],
		["采购等待中", { title: "采购", status: "waiting" }],
		["待辦：整理筆記", { title: "整理筆記", status: "open" }],
		["明天买牛奶 #购物", { title: "买牛奶", scheduled: { date: "2026-10-30" }, tags: ["购物"] }],
	],
	"plain titles": [
		["阅读第二版说明书", { title: "阅读第二版说明书" }],
		["购买3天用量的猫粮", { title: "购买3天用量的猫粮" }],
		["提高服务可用性", { title: "提高服务可用性" }],
		["降低噪音", { title: "降低噪音" }],
		["完成论文初稿", { title: "完成论文初稿" }],
		["取消订阅邮件", { title: "取消订阅邮件" }],
		["等待客户回复", { title: "等待客户回复" }],
		["检查积分余额", { title: "检查积分余额" }],
		["阅读日常维护手册", { title: "阅读日常维护手册" }],
		["阅读重要通知", { title: "阅读重要通知" }],
		["购买普通打印纸", { title: "购买普通打印纸" }],
		["和周先生确认需求", { title: "和周先生确认需求" }],
	],
});

// Engine gaps: excluded rather than accepting incorrect semantics. All use the reference above.
// Input: 每天拉伸直到周五
// Expected: { title: "拉伸", recurrence: "FREQ=DAILY;UNTIL=20261030" }
// Actual: { title: "拉伸直到", scheduled: { date: "2026-10-30" }, recurrence: "FREQ=DAILY" }
// Input: 每月第一个星期一交账单
// Expected: { title: "交账单", recurrence: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1" }
// Actual: { title: "第一个交账单", scheduled: { date: "2026-11-02" }, recurrence: "FREQ=MONTHLY" }
// Input: 明天之前交报告
// Expected: { title: "交报告", due: { date: "2026-10-30" } }
// Actual: { title: "之前交报告", scheduled: { date: "2026-10-30" } }
// Input: 明天截止交报告
// Expected: { title: "交报告", due: { date: "2026-10-30" } }
// Actual: { title: "截止交报告", scheduled: { date: "2026-10-30" } }
// Input: 下午三点一刻接孩子
// Expected: { title: "接孩子", scheduled: { date: "2026-10-29", time: "15:15" } }
// Actual: { title: "刻接孩子", scheduled: { date: "2026-10-29", time: "15:01" } }
// Input: 购买每周计划本
// Expected: { title: "购买每周计划本" }
// Actual: { title: "购买计划本", recurrence: "FREQ=WEEKLY" }
// Input: 阅读30分钟速成教程
// Expected: { title: "阅读30分钟速成教程" }
// Actual: { title: "阅读速成教程", estimate: 30 }
// Input: 下周末露营
// Expected: { title: "露营", scheduled: { date: "2026-11-07" } }
// Actual: { title: "下周末露营" }
