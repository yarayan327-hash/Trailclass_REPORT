import { NextRequest, NextResponse } from "next/server";
import { uploadTextbook } from "@/services/textbookService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 将 File 对象转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 调用 Service 处理解析与入库
    const result = await uploadTextbook(buffer);

    return NextResponse.json({ 
      success: true, 
      message: "Textbook uploaded successfully",
      data: {
        id: result.id,
        name: result.name,
        bookId: result.bookId
      }
    });

  } catch (error: any) {
    console.error("Textbook Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}