import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充种子数据...')

  // 1. 创建教材库 (Materials)
  const materialsData = [
    { name: 'Football Mania', description: '足球主题英语课' },
    { name: 'Basketball Star', description: '篮球主题英语课' },
    { name: 'Swimming Pro', description: '游泳主题英语课' },
    { name: 'Level 1-1', description: '基础入门' },
    { name: 'Level 1-2', description: '基础进阶' },
  ]

  console.log('📚 正在创建教材...')
  for (const m of materialsData) {
    // upsert: 如果存在则更新，不存在则创建
    await prisma.material.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    })
  }

  // 2. 创建一节测试课程 (ClassSession)
  console.log('📅 正在创建测试课程...')
  
  await prisma.classSession.upsert({
    where: { id: 'test-session-001' }, 
    update: {},
    create: {
      id: 'test-session-001',
      courseName: 'Football Mania', // 计划教材
      bookingType: 'Trial',
      classTimeBJ: '2026-01-03 20:00',
      classTimeSaudi: new Date('2026-01-03T15:00:00Z'), 
      teacherId: '123456',       // 老师 ID
      teacherName: 'Ms. Hala',   // 老师名字
      originalStudentName: 'Yara', // 原始学生名
      studentId: 'student-001',
    },
  })

  // 再加一节课
  await prisma.classSession.upsert({
    where: { id: 'test-session-002' },
    update: {},
    create: {
      id: 'test-session-002',
      courseName: 'Level 1-1',
      bookingType: 'Regular',
      classTimeBJ: '2026-01-04 20:00',
      classTimeSaudi: new Date('2026-01-04T15:00:00Z'),
      teacherId: '123456',
      teacherName: 'Ms. Hala',
      originalStudentName: 'Ali',
      studentId: 'student-002',
    },
  })

  console.log('✅ 种子数据填充完毕！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })