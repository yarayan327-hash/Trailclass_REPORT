import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const workbook = XLSX.utils.book_new();

    // --- 1. Sheet 1: 基础信息 ---
    const sheet1Headers = [["Book_ID", "教材名称", "教材类型", "封面图"]];
    const sheet1Data = [["TB-DEMO-01", "示例教材 (L1)", "口语类", "https://example.com/cover.jpg"]];
    const ws1 = XLSX.utils.aoa_to_sheet([...sheet1Headers, ...sheet1Data]);
    XLSX.utils.book_append_sheet(workbook, ws1, "基础信息");

    // --- 2. Sheet 2: 题目配置 (增加 AR 列) ---
    const sheet2Headers = [["题目ID", "题目内容", "题目内容_AR", "题目类型", "关联维度", "选项A", "选项B", "选项C", "选项D"]];
    const sheet2Data = [
      ["Q-01", "Pronunciation", "النطق", "打分题", "Pronunciation", "1", "2", "3", "4"],
      ["STAGE", "Select Stage", "اختر المرحلة", "阶段选择", "-", "A", "B", "C", "-"],
      ["COMMENT", "Select Comment", "اختر التعليق", "总评选择", "-", "A", "B", "C", "-"]
    ];
    const ws2 = XLSX.utils.aoa_to_sheet([...sheet2Headers, ...sheet2Data]);
    XLSX.utils.book_append_sheet(workbook, ws2, "题目配置");

    // --- 3. Sheet 3: 今日所学 (增加 AR 列) ---
    const sheet3Headers = [["模块标题", "模块标题_AR", "模块内容", "模块内容_AR", "排序"]];
    const sheet3Data = [["Vocabulary", "المفردات", "Apple, Banana", "تفاحة, موز", "1"]];
    const ws3 = XLSX.utils.aoa_to_sheet([...sheet3Headers, ...sheet3Data]);
    XLSX.utils.book_append_sheet(workbook, ws3, "今日所学");

    // --- 4. Sheet 4: 成长规则 (增加 AR 列) ---
    const sheet4Headers = [["选项Key", "阶段名称", "阶段名称_AR", "报告展示文案", "报告展示文案_AR", "坐标点"]];
    const sheet4Data = [["A", "Starter", "مبتدئ", "Good start...", "بداية جيدة...", "1"]];
    const ws4 = XLSX.utils.aoa_to_sheet([...sheet4Headers, ...sheet4Data]);
    XLSX.utils.book_append_sheet(workbook, ws4, "成长规则");

    // --- 5. Sheet 5: 评语规则 (增加 AR 列) ---
    const sheet5Headers = [["选项Key", "评语摘要", "报告展示完整评语", "报告展示完整评语_AR"]];
    const sheet5Data = [["A", "Excellent", "Great job...", "عمل رائع..."]];
    const ws5 = XLSX.utils.aoa_to_sheet([...sheet5Headers, ...sheet5Data]);
    XLSX.utils.book_append_sheet(workbook, ws5, "评语规则");

    // 生成 Buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 返回文件流
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="textbook_template_bilingual_v1.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Template Download Error:", error);
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}