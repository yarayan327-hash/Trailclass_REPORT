import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// --- 接口定义 ---
interface Sheet1_BasicInfo {
  Book_ID: string;
  教材名称: string;
  教材类型: string;
  封面图?: string;
}

interface Sheet2_Question {
  题目ID: string;
  题目内容: string;
  题目内容_AR?: string;
  题目类型: string;
  关联维度?: string;
  选项A?: string;
  选项B?: string;
  选项C?: string;
  选项D?: string;
}

interface Sheet3_Module {
  模块标题: string;
  模块标题_AR?: string;
  模块内容: string;
  模块内容_AR?: string;
  排序: number | string;
}

interface Sheet4_Growth {
  选项Key: string;
  阶段名称: string;
  阶段名称_AR?: string;
  报告展示文案: string;
  报告展示文案_AR?: string;
  坐标点: number | string;
}

interface Sheet5_Comment {
  选项Key: string;
  评语摘要: string;
  报告展示完整评语: string;
  报告展示完整评语_AR?: string;
}

export async function uploadTextbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // 1. 解析 Sheet 1: 基础信息
  const sheet1 = XLSX.utils.sheet_to_json<Sheet1_BasicInfo>(workbook.Sheets[workbook.SheetNames[0]]);
  if (!sheet1 || sheet1.length === 0) throw new Error('Excel Sheet 1 (基础信息) 为空');
  
  const basicInfo = sheet1[0];
  if (!basicInfo.Book_ID || !basicInfo.教材名称) throw new Error('教材ID和名称为必填项');

  return await prisma.$transaction(async (tx) => {
    // 2. Upsert 教材
    let textbook = await tx.textbook.findUnique({ where: { bookId: basicInfo.Book_ID } });

    if (textbook) {
      textbook = await tx.textbook.update({
        where: { id: textbook.id },
        data: {
          name: basicInfo.教材名称,
          type: basicInfo.教材类型 === '考试类' ? 'EXAM' : 'SPEAKING',
          coverUrl: basicInfo.封面图 || null,
        }
      });
      // 清空旧数据
      await tx.textbookQuestion.deleteMany({ where: { textbookId: textbook.id } });
      await tx.textbookKnowledgeModule.deleteMany({ where: { textbookId: textbook.id } });
      await tx.textbookGrowthRule.deleteMany({ where: { textbookId: textbook.id } });
      await tx.textbookCommentRule.deleteMany({ where: { textbookId: textbook.id } });
    } else {
      textbook = await tx.textbook.create({
        data: {
          bookId: basicInfo.Book_ID,
          name: basicInfo.教材名称,
          type: basicInfo.教材类型 === '考试类' ? 'EXAM' : 'SPEAKING',
          coverUrl: basicInfo.封面图 || null,
        }
      });
    }

    const textbookId = textbook.id;

    // 3. 解析 Sheet 2: 题目
    const sheet2 = XLSX.utils.sheet_to_json<Sheet2_Question>(workbook.Sheets[workbook.SheetNames[1]]);
    if (sheet2 && sheet2.length > 0) {
      for (let i = 0; i < sheet2.length; i++) {
        const row = sheet2[i];
        if (!row.题目内容) continue; // 跳过空行

        const optionsObj = { A: row.选项A, B: row.选项B, C: row.选项C, D: row.选项D };
        let type = 'CHOICE';
        if (i < 5) type = 'RADAR';
        if (row.题目类型 && row.题目类型.includes('阶段')) type = 'Growth_Trigger';
        if (row.题目类型 && row.题目类型.includes('总评')) type = 'Comment_Trigger';

        await tx.textbookQuestion.create({
          data: {
            textbookId,
            qId: row.题目ID || `Q-${i}`,
            content: row.题目内容,
            content_ar: row.题目内容_AR || null,
            qType: type,
            tag: row.关联维度 || null,
            options: JSON.stringify(optionsObj),
            sortOrder: i + 1
          }
        });
      }
    }

    // 4. 解析 Sheet 3: 知识模块
    const sheet3 = XLSX.utils.sheet_to_json<Sheet3_Module>(workbook.Sheets[workbook.SheetNames[2]]);
    if (sheet3 && sheet3.length > 0) {
      for (const row of sheet3) {
        // 防止空行
        if (!row.模块标题 && !row.模块内容) continue;

        const contentList = row.模块内容 ? row.模块内容.split(/[\n,，]/).map(s => s.trim()).filter(Boolean) : [];
        const contentListAR = row.模块内容_AR ? row.模块内容_AR.split(/[\n,，]/).map(s => s.trim()).filter(Boolean) : [];

        await tx.textbookKnowledgeModule.create({
          data: {
            textbookId,
            title: row.模块标题 || "Untitled Module",
            title_ar: row.模块标题_AR || null,
            content: JSON.stringify(contentList),
            content_ar: JSON.stringify(contentListAR),
            sortOrder: Number(row.排序) || 1
          }
        });
      }
    }

    // 5. 解析 Sheet 4: 成长规则
    const sheet4 = XLSX.utils.sheet_to_json<Sheet4_Growth>(workbook.Sheets[workbook.SheetNames[3]]);
    if (sheet4 && sheet4.length > 0) {
      for (const row of sheet4) {
        // 🔥 修复点：如果没有 选项Key，则跳过，防止 Prisma 报错
        if (!row.选项Key) {
          console.warn("Sheet 4 Skipped row due to missing Trigger Key:", row);
          continue;
        }

        await tx.textbookGrowthRule.create({
          data: {
            textbookId,
            triggerKey: String(row.选项Key), // 强制转字符串
            stageName: row.阶段名称 || "Unknown Stage",
            stageName_ar: row.阶段名称_AR || null,
            displayText: row.报告展示文案 || "",
            displayText_ar: row.报告展示文案_AR || null,
            position: Number(row.坐标点) || 1
          }
        });
      }
    }

    // 6. 解析 Sheet 5: 评语规则
    const sheet5 = XLSX.utils.sheet_to_json<Sheet5_Comment>(workbook.Sheets[workbook.SheetNames[4]]);
    if (sheet5 && sheet5.length > 0) {
      for (const row of sheet5) {
        // 🔥 修复点：同样检查 选项Key
        if (!row.选项Key) continue;

        await tx.textbookCommentRule.create({
          data: {
            textbookId,
            triggerKey: String(row.选项Key),
            summary: row.评语摘要,
            fullText: row.报告展示完整评语 || "",
            fullText_ar: row.报告展示完整评语_AR || null
          }
        });
      }
    }

    return textbook;
  });
}

export async function getAllTextbooks() {
  return await prisma.textbook.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      bookId: true,
      type: true,
      coverUrl: true,
      updatedAt: true
    }
  });
}