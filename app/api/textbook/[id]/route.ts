import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const textbookId = params.id;

    // 1. 获取教材及其所有关联数据
    const textbook = await prisma.textbook.findUnique({
      where: { id: textbookId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        modules: { orderBy: { sortOrder: 'asc' } },
        growthRules: { orderBy: { position: 'asc' } },
        commentRules: true,
      },
    });

    if (!textbook) {
      return NextResponse.json({ error: "Textbook not found" }, { status: 404 });
    }

    // 2. 数据转换 (Data Transformation)
    // 因为 SQLite 存的是 String，这里必须 parse 回 JSON 对象发给前端
    const formattedData = {
      ...textbook,
      questions: textbook.questions.map(q => ({
        ...q,
        // 如果 options 是字符串，尝试解析；如果是 null，返回 null
        options: q.options ? JSON.parse(q.options) : null,
      })),
      modules: textbook.modules.map(m => ({
        ...m,
        content: JSON.parse(m.content), // 数组字符串 -> 数组
      })),
      // GrowthRules 和 CommentRules 不需要特殊解析，因为它们存的是普通字段
    };

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error("Fetch Textbook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}