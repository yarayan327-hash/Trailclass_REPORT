import { NextResponse } from "next/server";
import { getAllTextbooks } from "@/services/textbookService";

// 🔥 测试阶段默认教材 (兜底数据)
const MOCK_TEXTBOOK_LIST = [
  {
    id: "MOCK-TB-001",
    name: "Trailclass Demo (Default)",
    bookId: "TB-DEFAULT",
    type: "SPEAKING",
    coverUrl: null,
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const list = await getAllTextbooks();
    
    // 🔥 逻辑：如果数据库为空，返回默认测试教材，方便你调试
    if (!list || list.length === 0) {
      return NextResponse.json({ success: true, data: MOCK_TEXTBOOK_LIST });
    }

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    // 即使报错，也返回 Mock 数据，保证页面不崩
    console.error("List fetch error, using mock", error);
    return NextResponse.json({ success: true, data: MOCK_TEXTBOOK_LIST });
  }
}