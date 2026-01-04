"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// --- 1. 获取教材列表 (用于老师下拉框) ---
export async function getMaterialList() {
  try {
    const materials = await prisma.textbook.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true }
    });
    return { success: true, data: materials };
  } catch (error) {
    console.error("Failed to fetch material list:", error);
    return { success: false, error: "Failed to fetch materials" };
  }
}

// --- 2. 提交评价 (Submit Assessment) ---
export async function submitAssessment(data: {
  sessionId: string;
  studentName: string;
  teacherId: string;
  scores: Record<string, number>;
  feedback: string;
  materialName: string; // 老师选中的教材名称
}) {
  try {
    // 1. 验证 Session 是否存在
    const session = await prisma.classSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // 2. 创建或更新 Report
    // 注意：我们把 scores 对象转成 JSON 字符串存入 SQLite
    const report = await prisma.report.create({
      data: {
        sessionId: data.sessionId,
        actualStudentName: data.studentName,
        feedback: data.feedback,
        scores: JSON.stringify(data.scores), // 存 JSON
        fallbackMaterialName: data.materialName, // 存教材名
      },
    });

    // 3. 刷新相关页面缓存
    revalidatePath("/teacher/schedule");
    revalidatePath("/admin/sessions");

    return { success: true, data: { id: report.id } };

  } catch (error: any) {
    // 如果是唯一约束冲突 (Report已存在)，尝试更新
    if (error.code === 'P2002') {
      try {
        const updated = await prisma.report.update({
          where: { sessionId: data.sessionId },
          data: {
            actualStudentName: data.studentName,
            feedback: data.feedback,
            scores: JSON.stringify(data.scores),
            fallbackMaterialName: data.materialName,
          }
        });
        return { success: true, data: { id: updated.id } };
      } catch (updateError) {
        console.error("Update Report Error:", updateError);
        return { success: false, error: "Failed to update report" };
      }
    }
    console.error("Submit Report Error:", error);
    return { success: false, error: "Failed to submit report" };
  }
}

// --- 3. 获取报告详情 (Get Report Detail) ---
// 🔥 关键修复：这里负责把 Report 和 Textbook 数据拼在一起
export async function getReportDetail(reportId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        classSession: true, // 关联排课信息
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    // 尝试根据 fallbackMaterialName 找到对应的 Textbook
    // (因为 Schema 里没有硬性外键关联，我们通过名字或默认逻辑来找)
    let textbook = null;
    if (report.fallbackMaterialName) {
      textbook = await prisma.textbook.findFirst({
        where: { name: report.fallbackMaterialName },
        include: {
          modules: { orderBy: { sortOrder: 'asc' } }, // 获取词汇/句型模块
          // questions: true, 
          // growthRules: true,
        }
      });
    }

    // 如果找不到具体教材，或者名字没对上，就找数据库里的“第一本”作为兜底
    // 这样能保证报告页面不崩，始终能显示模块
    if (!textbook) {
      textbook = await prisma.textbook.findFirst({
        include: { modules: { orderBy: { sortOrder: 'asc' } } }
      });
    }

    // 解析 scores 字符串 -> 对象
    let parsedScores = {};
    try {
      parsedScores = JSON.parse(report.scores);
    } catch (e) {
      console.error("Error parsing scores JSON:", e);
    }

    // 构造返回给前端的完整数据结构
    const responseData = {
      ...report,
      scores: parsedScores,
      sessionDate: report.createdAt, // 或 use classSession.classTimeSaudi
      studentName: report.actualStudentName,
      instructor: report.classSession.teacherName,
      courseName: report.classSession.courseName,
      avatar: null, // 暂时没存头像，前端会用默认图
      
      // 🔥 将找到的教材数据挂载上去
      textbook: textbook ? {
        ...textbook,
        // 这里不需要额外解析，因为我们在 ReportPage 前端做了 JSON.parse
        // 但为了保险，Textbook Service 里存的是 String，这里 Prisma 读出来的也是 String
      } : null
    };

    return { success: true, data: responseData };

  } catch (error) {
    console.error("Get Report Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}