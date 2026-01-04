# 51Talk Trial Class Report System - Implementation Guide

## 1. 项目概述 (Project Overview)
这是一个针对体验课场景的 SaaS 系统，包含三个核心端：
1.  **Admin (管理员端)**：负责导入排课表（Excel）、管理教材题库、查看每日运营明细。
2.  **Teacher (老师端)**：极简操作，通过“认领课程”的方式，快速对学生进行评分并生成报告。
3.  **Parent (家长端)**：通过老师分享的短链接查看生成的评估报告（带有效期控制）。

## 2. 技术栈 (Tech Stack)
* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS + Lucide React (Icons)
* **Database**: SQLite (Local Dev) -> Postgres (Production)
* **ORM**: Prisma
* **Charts**: Recharts (for Radar Chart)

## 3. 核心业务逻辑 (Core Business Logic)

### 3.1 时区策略
* **全局标准**：所有前端显示、日期筛选、后台导出文件名，统一强制使用 **沙特时间 (UTC+3)**。
* **数据库存储**：标准 UTC 时间。

### 3.2 账号与鉴权 (MVP Scheme)
* 不实现复杂的 User 表登录。
* 使用简单的 Passcode 验证：
    * 老师入口密码：`123`
    * 管理员入口密码：`888`
* 老师登录后，通过**下拉菜单选择自己的名字**来确自身份。

---

## 4. 数据库设计 (Database Schema)
*请直接使用以下 Prisma Schema，不要修改字段名以保证逻辑一致性。*

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 1. 排课记录表 (从 Excel 导入的基础数据)
model ClassSession {
  id              String   @id @default(cuid())
  
  // Excel 导入字段
  courseName      String   // 预约课程名
  startTimeBJ     DateTime 
  startTimeSaudi  DateTime // 核心筛选时间
  bookingType     String?
  teacherName     String   // 用于老师端筛选
  teacherId       String   
  studentName     String   
  studentId       String   
  bookingId51     String   @unique // 唯一标识，防重
  
  // 状态与关联
  status          String   @default("PENDING") // PENDING | COMPLETED
  isEvaluated     Boolean  @default(false)
  report          Report?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// 2. 教材库 (后台配置)
model Material {
  id              String   @id @default(cuid())
  name            String   @unique
  track           String   // "Life" | "Exam"
  themeColor      String   @default("#26B7FF")
  
  // 题目配置 (JSON String)
  // 格式示例: [{"id":"v1", "label":"Vocabulary", "max":5}, ...]
  questionsSchema String   
  
  reports         Report[]
}

// 3. 报告表 (老师产出)
model Report {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  
  sessionId     String   @unique
  session       ClassSession @relation(fields: [sessionId], references: [id])
  
  // 实际使用的教材 (允许与预约课程不一致)
  materialId    String
  material      Material @relation(fields: [materialId], references: [id])

  scores        String   // JSON String: {"v1": 5, "g1": 4}
  aiComment     String?  // AI 生成内容
  finalComment  String   // 老师最终提交内容

  shareToken    String   @unique @default(cuid())
  expireAt      DateTime?
}