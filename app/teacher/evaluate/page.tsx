import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma'; 
import { Clock, User, CheckCircle2, ArrowRight, FileText } from 'lucide-react'; // 增加了一个图标
import { clsx } from 'clsx';

// 强制动态渲染，保证每次刷新都从数据库查最新状态
export const dynamic = 'force-dynamic';

export default async function TeacherDashboard() {
  // 1. 模拟当前登录老师 ID (Phase 3 暂时硬编码)
  const currentTeacherId = '123456';

  // 2. 从数据库查询课程
  const sessions = await prisma.classSession.findMany({
    where: {
      teacherId: currentTeacherId,
    },
    include: {
      report: true, // 连表查询，看看有没有对应的报告
    },
    orderBy: {
      classTimeSaudi: 'desc', // 按时间倒序
    },
  });

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans pb-20">
      {/* 顶部 Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-[#333]">My Class Schedule</h1>
          <p className="text-gray-400 text-sm font-bold mt-2">
            Instructor ID: <span className="text-[#26B7FF]">{currentTeacherId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-sm">
            <p className="text-gray-400 font-bold">No classes found for this teacher.</p>
          </div>
        ) : (
          sessions.map((session) => {
            // 判断是否已评价
            const isCompleted = !!session.report;
            
            // 格式化时间
            const dateObj = new Date(session.classTimeSaudi);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            return (
              <div 
                key={session.id} 
                className={clsx(
                  "group relative bg-white p-6 rounded-[24px] border-2 transition-all hover:shadow-lg",
                  // 修改逻辑：即使完成了，也不要变得太透明，保持清晰
                  isCompleted ? "border-green-100 opacity-100" : "border-[#26B7FF]/10 hover:border-[#26B7FF]"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* 左侧信息 */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        // 试听课显示黄色，正式课显示灰色
                        session.bookingType === 'Trial' ? "bg-[#FDE700] text-[#333]" : "bg-gray-100 text-gray-500"
                      )}>
                        {session.bookingType || 'Class'}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                        <Clock size={14} /> {dateStr} • {timeStr} (KSA)
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-[#333] flex items-center gap-2">
                       {session.courseName}
                       {/* 如果完成了，在标题旁边也打个勾 */}
                       {isCompleted && <CheckCircle2 size={20} className="text-green-500" />}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <User size={16} className="text-[#26B7FF]" /> 
                        Student: {session.originalStudentName}
                      </span>
                    </div>
                  </div>

                  {/* 右侧按钮区域 */}
                  <div>
                    {isCompleted ? (
                      // 🔥 样式修改重点：把灰色的按钮改成清爽的蓝色边框按钮
                      <Link 
                        href={`/report/${session.report!.id}`}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#26B7FF] text-[#26B7FF] font-bold bg-blue-50/50 hover:bg-[#26B7FF] hover:text-white transition-all shadow-sm"
                      >
                        <FileText size={18} />
                        View Report
                      </Link>
                    ) : (
                      // 未完成状态：蓝色实心按钮
                      <Link 
                        href={`/teacher/evaluate/${session.id}?name=${encodeURIComponent(session.originalStudentName)}`}
                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#26B7FF] text-white font-black shadow-md shadow-blue-200 hover:scale-105 hover:bg-[#1DA6EB] transition-all"
                      >
                        Start Evaluation
                        <ArrowRight size={18} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}