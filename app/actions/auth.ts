'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { writeFile } from 'fs/promises';
import path from 'path';

// 1. 登录检查
export async function login(teacherId: string) {
  // 检查该老师是否有排课记录 (防止非法用户)
  const sessionExists = await prisma.classSession.findFirst({
    where: { teacherId }
  });

  if (!sessionExists) {
    return { success: false, error: "Invalid Teacher ID" };
  }

  // 设置 Cookie (模拟登录态)
  cookies().set('teacherId', teacherId, { secure: true });

  // 检查是否已完成引导 (Onboarding)
  const profile = await prisma.teacherProfile.findUnique({
    where: { teacherId }
  });

  if (profile) {
    // 老用户 -> 去列表页
    return { success: true, redirectUrl: '/teacher/evaluate' };
  } else {
    // 新用户 -> 去引导页 (带上原始名字)
    return { 
      success: true, 
      redirectUrl: `/teacher/onboarding?name=${encodeURIComponent(sessionExists.teacherName)}` 
    };
  }
}

// 2. 保存档案 (Onboarding 提交)
export async function saveProfile(formData: FormData) {
  const teacherId = cookies().get('teacherId')?.value;
  if (!teacherId) return { success: false, error: "Not logged in" };

  const prefix = formData.get('prefix') as string;
  const nameBase = formData.get('nameBase') as string;
  const avatarType = formData.get('avatarType') as string; // 'upload' | 'default'
  
  let avatarUrl = "/avatars/defaults/1.png"; // 兜底默认

  try {
    // 处理头像
    if (avatarType === 'upload') {
      const file = formData.get('avatarFile') as File;
      if (file && file.size > 0) {
        // 保存文件到 public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${teacherId}-${Date.now()}.${file.name.split('.').pop()}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await writeFile(path.join(uploadDir, fileName), buffer);
        avatarUrl = `/uploads/${fileName}`;
      }
    } else {
      // 使用选中的默认头像
      avatarUrl = formData.get('defaultAvatarUrl') as string;
    }

    // 写入数据库
    await prisma.teacherProfile.create({
      data: {
        teacherId,
        displayName: `${prefix} ${nameBase}`.trim(),
        avatarUrl
      }
    });

  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to save profile" };
  }

  redirect('/teacher/evaluate');
}