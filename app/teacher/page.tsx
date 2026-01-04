'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- 类型定义 ---
interface AssessmentData {
  sessionId: string;
  studentName: string;
  teacherId: string;
  scores: Record<string, number>;
  feedback: string;
  materialName?: string;
}

// 1. 提交评价
export async function submitAssessment(data: AssessmentData) {
  console.log("⚡️ Server Action 收到提交请求:", data);

  try {
    // 尝试找教材 ID
    let materialConnect = {};
    if (data.materialName) {
      const material = await prisma.material.findUnique({
        where: { name: data.materialName }
      });
      if (material) {
        materialConnect = { connect: { id: material.id } };
      }
    }

    const newReport = await prisma.report.create({
      data: {
        classSession: { connect: { id: data.sessionId } },
        actualStudentName: data.studentName,
        scores: JSON.stringify(data.scores), // 存字符串
        feedback: data.feedback,
        material: Object.keys(materialConnect).length > 0 ? materialConnect : undefined,
        fallbackMaterialName: data.materialName || "Default",
      }
    });

    console.log("✅ 数据库写入成功，Report ID:", newReport.id);
    
    revalidatePath('/teacher/evaluate');
    return { success: true, data: { id: newReport.id } };

  } catch (error) {
    console.error("❌ 数据库写入失败:", error);
    return { success: false, error: "Database error" };
  }
}

// 2. 🔥 获取报告详情 (升级版：读取老师档案)
export async function getReportDetail(reportId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        classSession: true, // 连表查课程信息 (时间、老师名)
        material: true      // 连表查教材信息
      }
    });

    if (!report) return { success: false, error: "Report not found" };

    // 🔥 新增：查询老师的个性化档案
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { teacherId: report.classSession.teacherId }
    });

    // 格式化返回给前端的数据
    return {
      success: true,
      data: {
        studentName: report.actualStudentName,
        
        // 优先使用 Profile 里的名字 (如 "Dr. Hala")，没有则用排课表里的 (Ms. Hala)
        instructor: teacherProfile?.displayName || report.classSession.teacherName,
        
        // 优先使用 Profile 里的头像，没有则用默认图
        avatar: teacherProfile?.avatarUrl || "/avatars/defaults/1.png",

        courseName: report.material?.name || report.classSession.courseName, // 优先用实际教材，没有就用计划教材
        sessionDate: report.classSession.classTimeSaudi, // 原始时间对象
        scores: JSON.parse(report.scores), // 解析 JSON 字符串
        feedback: report.feedback,
        
        // 词汇表 (暂时根据课程名返回写死的数据)
        vocabulary: getVocabByCourse(report.material?.name || report.classSession.courseName),
        sentences: getSentencesByCourse(report.material?.name || report.classSession.courseName)
      }
    };
  } catch (error) {
    console.error("查询报告失败:", error);
    return { success: false, error: "System error" };
  }
}

// --- 辅助函数：暂时模拟教材内容 ---
function getVocabByCourse(courseName: string) {
  if (courseName.includes("Football")) {
    return [
      { word: "Football", trans: "كرة القدم" },
      { word: "Goal", trans: "هدف" },
      { word: "Player", trans: "لاعب" },
      { word: "Team", trans: "فريق" },
      { word: "Coach", trans: "مدرب" },
    ];
  }
  return [
    { word: "Hello", trans: "مرحبا" },
    { word: "Teacher", trans: "مدرس" },
    { word: "Book", trans: "كتاب" },
    { word: "Happy", trans: "سعيد" },
  ];
}

function getSentencesByCourse(courseName: string) {
  if (courseName.includes("Football")) {
    return [
      { en: "I like to play football.", ar: "أحب لعب كرة القدم." },
      { en: "He is a good player.", ar: "إنه لاعب جيد." },
    ];
  }
  return [
    { en: "I am happy today.", ar: "أنا سعيد اليوم." },
    { en: "This is my book.", ar: "هذا كتابي." },
  ];
}