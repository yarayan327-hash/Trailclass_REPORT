'use server'

import { prisma } from '@/lib/prisma';

// 定义导出数据的行结构 (Excel 的每一列)
interface ExportRow {
  'Session ID': string;
  'Course Name (Planned)': string;
  'Status': string;             // 待评价 / 已完成
  'Booking Type': string;
  'Class Time (Saudi)': string;
  'Class Time (Beijing)': string;
  'Teacher Name': string;
  'Student (Original)': string;
  'Student (Actual)': string;   // 老师修改后的名字
  'Actual Material': string;    // 🔥 重点：实际教材
  'Report Link': string;        // 🔥 重点：报告链接
  'Teacher Feedback': string;   // 附带：评语
}

export async function getExportData() {
  try {
    // 1. 查出所有课程 (包含关联的报告和教材)
    const sessions = await prisma.classSession.findMany({
      include: {
        report: {
          include: {
            material: true // 连表查教材，获取 name
          }
        }
      },
      orderBy: {
        classTimeSaudi: 'desc' // 按时间倒序
      }
    });

    // 2. 转换数据格式 (Flatten)
    const exportData: ExportRow[] = sessions.map(session => {
      const hasReport = !!session.report;
      
      // 处理时间格式
      const dateObj = new Date(session.classTimeSaudi);
      const saudiTimeStr = dateObj.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });
      
      // 🔥 核心逻辑：拼接报告链接
      // 假设你的域名是 http://localhost:3000，上线后需改为真实域名
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const reportLink = hasReport ? `${baseUrl}/report/${session.report!.id}` : '';

      // 🔥 核心逻辑：获取实际教材名
      // 优先取库里的 material.name，没有则取 fallback，还没有则为空
      let actualMaterial = '';
      if (hasReport) {
        actualMaterial = session.report!.material?.name || session.report!.fallbackMaterialName || '';
      }

      return {
        'Session ID': session.id,
        'Course Name (Planned)': session.courseName,
        'Status': hasReport ? 'Completed' : 'Pending', // 状态判断
        'Booking Type': session.bookingType || '',
        'Class Time (Saudi)': saudiTimeStr,
        'Class Time (Beijing)': session.classTimeBJ || '',
        'Teacher Name': session.teacherName,
        'Student (Original)': session.originalStudentName,
        'Student (Actual)': hasReport ? session.report!.actualStudentName : '', // 实际名字
        'Actual Material': actualMaterial,
        'Report Link': reportLink,
        'Teacher Feedback': hasReport ? session.report!.feedback : ''
      };
    });

    return { success: true, data: exportData };

  } catch (error) {
    console.error("导出数据失败:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}
// ... 之前的 getExportData 代码 ...

// --- 教材管理部分 ---

// 1. 获取所有教材
export async function getMaterials() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return { success: true, data: materials };
}

// 2. 添加教材
export async function addMaterial(name: string) {
  if (!name.trim()) return { success: false, error: "Name is required" };
  try {
    const newMat = await prisma.material.create({
      data: { name: name }
    });
    revalidatePath('/admin/materials');
    return { success: true, data: newMat };
  } catch (e) {
    return { success: false, error: "Material already exists or error" };
  }
}

// 3. 删除教材
export async function deleteMaterial(id: string) {
  try {
    await prisma.material.delete({ where: { id } });
    revalidatePath('/admin/materials');
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete" };
  }
}
// ... 之前的代码 ...

// --- 4. 获取排课列表 (供管理员页面展示) ---
export async function getAdminSessionList() {
  try {
    const sessions = await prisma.classSession.findMany({
      include: {
        report: true, // 关联报告，用于判断状态
      },
      orderBy: {
        classTimeSaudi: 'desc', // 默认按时间倒序
      },
      take: 100 // 限制显示最近 100 条，防止页面卡顿 (后续可做分页)
    });

    return { success: true, data: sessions };
  } catch (error) {
    console.error("获取列表失败:", error);
    return { success: false, error: "Failed to fetch list" };
  }
}