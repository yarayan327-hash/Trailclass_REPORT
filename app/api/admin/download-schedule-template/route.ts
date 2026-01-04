// app/api/admin/download-schedule-template/route.ts
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const workbook = XLSX.utils.book_new();

    // 这里的列名必须和 admin-import.ts 里读取的完全一致！
    const headers = [[
      "主键ID",           
      "课程名称",        
      "上课时间(北京)",   
      "上课时间(沙特)",   
      "预约类型",        
      "老师姓名",        
      "老师ID",          
      "学生姓名",        
      "学生ID",          
      "51talkID",         
      "MeritHubID",       
      "课程状态"          
    ]];

    // 示例数据
    const sampleData = [[
      "S-001", "Demo L1", "2024-01-01", "2024-01-01", "Trial", 
      "Teacher A", "T01", "Student B", "S01", "123", "MH1", "Planned"
    ]];

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "排课表模板");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="schedule_template_v1.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}