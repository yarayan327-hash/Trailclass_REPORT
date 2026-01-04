"use server";

import { prisma } from "@/lib/prisma";

/**
 * 家长端 Server Actions
 */

/**
 * 通过分享 token 获取报告
 */
export async function getReportByToken(shareToken: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { shareToken },
      include: {
        session: {
          select: {
            id: true,
            courseName: true,
            studentName: true,
            startTimeSaudi: true,
            teacherName: true,
          },
        },
        material: true,
      },
    });

    if (!report) {
      return { success: false, error: "报告不存在" };
    }

    // 检查是否过期
    if (report.expireAt && new Date() > report.expireAt) {
      return { success: false, error: "报告已过期" };
    }

    // 解析 scores JSON
    let scores = {};
    try {
      scores = JSON.parse(report.scores);
    } catch {
      scores = {};
    }

    return {
      success: true,
      data: {
        ...report,
        scores,
      },
    };
  } catch (error) {
    console.error("Error fetching report by token:", error);
    return { success: false, error: "获取报告失败" };
  }
}

/**
 * 验证 token 是否有效（不返回完整数据，仅验证）
 */
export async function validateReportToken(shareToken: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { shareToken },
      select: {
        id: true,
        expireAt: true,
      },
    });

    if (!report) {
      return { success: false, valid: false, error: "报告不存在" };
    }

    if (report.expireAt && new Date() > report.expireAt) {
      return { success: false, valid: false, error: "报告已过期" };
    }

    return { success: true, valid: true };
  } catch (error) {
    console.error("Error validating token:", error);
    return { success: false, valid: false, error: "验证失败" };
  }
}

