"use server";

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 辅助函数：处理各种奇葩的日期格式
function parseExcelDate(input: any): Date {
  if (!input) return new Date(); // 防止空值报错，虽然逻辑上不应该发生

  // 1. 如果已经是 Date 对象
  if (input instanceof Date) return input;

  // 2. 如果是数字 (Excel 序列号)
  if (typeof input === 'number') {
    // Excel 的基准日期是 1899-12-30
    return new Date(Math.round((input - 25569) * 86400 * 1000));
  }

  // 3. 如果是字符串，尝试解析特殊格式
  if (typeof input === 'string') {
    const str = input.trim();

    // 处理格式: "2026-01-07 / 02:30 ~ 03:00"
    // 逻辑：提取 / 前面的日期，和 / 后面 ~ 前面的开始时间
    if (str.includes('/') && str.includes('~')) {
      try {
        const [datePart, timeRange] = str.split('/').map(s => s.trim());
        const startTime = timeRange.split('~')[0].trim(); // 拿到 "02:30"
        return new Date(`${datePart} ${startTime}`);
      } catch (e) {
        console.warn("复杂日期解析失败:", str);
      }
    }

    // 尝试直接解析标准字符串
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // 如果都失败了，返回当前时间防止崩溃，但打印警告
  console.warn("无法解析的日期格式:", input);
  return new Date();
}

export async function uploadClassSchedule(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return { success: false, error: "Excel is empty" };
    }

    let successCount = 0;
    
    for (const row of jsonData as any[]) {
      // 检查关键字段是否存在
      // 注意：Excel读取的key可能带空格，或者用户修改了表头
      // 这里做一个简单的容错，尝试读取 "主键ID" 或 "id"
      const idRaw = row["主键ID"] || row["id"] || row["ID"];
      
      if (!idRaw) {
        continue; // 跳过没有ID的空行
      }
      
      const id = String(idRaw).trim();

      // 提取日期：优先读取"上课时间(沙特)"，如果没有则读取"上课时间(北京)"
      const dateRaw = row["上课时间(沙特)"] || row["上课时间(北京)"];

      const sessionData = {
        courseName: String(row["课程名称"] || ""),
        bookingType: String(row["预约类型"] || ""),
        excelStatus: String(row["课程状态"] || ""),
        classTimeBJ: String(row["上课时间(北京)"] || ""),
        
        // 使用增强版的日期解析
        classTimeSaudi: parseExcelDate(dateRaw),
        
        teacherName: String(row["老师姓名"] || ""),
        teacherId: String(row["老师ID"] || "123456"),
        originalStudentName: String(row["学生姓名"] || ""),
        studentId: String(row["学生ID"] || ""),
        talk51Id: row["51talkID"] ? String(row["51talkID"]) : null,
        merithubId: row["MeritHubID"] ? String(row["MeritHubID"]) : null,
      };

      await prisma.classSession.upsert({
        where: { id: id },
        update: sessionData,
        create: {
          id: id,
          ...sessionData
        }
      });
      
      successCount++;
    }

    revalidatePath("/admin/sessions");
    return { success: true, message: `Successfully imported ${successCount} sessions.` };

  } catch (error: any) {
    console.error("❌ Upload Error:", error);
    return { success: false, error: error.message || "Failed to process excel" };
  }
}

export async function getExportData() {
  try {
    const data = await prisma.report.findMany({
      include: { classSession: true, material: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const flatData = data.map(r => ({
      ReportID: r.id,
      SessionID: r.sessionId,
      Student_Actual: r.actualStudentName,
      Student_Original: r.classSession.originalStudentName,
      Teacher: r.classSession.teacherName,
      Course_Planned: r.classSession.courseName,
      Material_Used: r.material?.name || r.fallbackMaterialName || "N/A",
      Feedback: r.feedback,
      Date: r.createdAt.toISOString().split('T')[0],
      Report_Link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://trailclass.com'}/report/${r.id}`
    }));

    return { success: true, data: flatData };
  } catch (error) {
    return { success: false, error: "Failed to fetch export data" };
  }
}