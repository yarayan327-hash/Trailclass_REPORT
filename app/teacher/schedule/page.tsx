import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Clock, Calendar, CheckCircle, Play, LogOut } from 'lucide-react';

const prisma = new PrismaClient();

// 强制动态渲染，保证数据最新
export const dynamic = 'force-dynamic';

export default async function TeacherSchedulePage() {
  // 1. 获取登录状态
  const cookieStore = cookies();
  const teacherId = cookieStore.get('teacherId')?.value;

  // 未登录则踢回首页
  if (!teacherId) {
    redirect('/');
  }

  // 2. 查询该老师的课程
  const sessions = await prisma.classSession.findMany({
    where: { teacherId: teacherId },
    orderBy: { classTimeSaudi: 'asc' }, // 按时间排序
    include: { report: true }
  });

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#333]">My Schedule</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              ID: <span className="text-[#26B7FF]">{teacherId}</span>
            </p>
          </div>
          <Link href="/" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto px-6 mt-8 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-sm">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No classes found.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isCompleted = !!session.report;
            const dateObj = new Date(session.classTimeSaudi);
            
            return (
              <div key={session.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-[#26B7FF] font-black bg-blue-50 px-3 py-1 rounded-lg text-sm">
                    <Clock size={16} />
                    {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                      <CheckCircle size={12} /> Done
                    </span>
                  ) : (
                    <span className="text-gray-400 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">
                      Upcoming
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-[#333] mb-1">{session.courseName}</h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full bg-[#FDE700] flex items-center justify-center text-[10px] font-black">
                    {session.originalStudentName.charAt(0)}
                  </div>
                  <span className="text-gray-500 font-bold text-sm">{session.originalStudentName}</span>
                </div>

                {isCompleted ? (
                   <Link href={`/report/${session.report?.id}`} className="block w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-center hover:bg-gray-200 transition-colors">
                     View Report
                   </Link>
                ) : (
                   /* 🔥🔥 已修改：Start Class -> Start */
                   <Link href={`/teacher/evaluate/${session.id}`} className="flex items-center justify-center gap-2 w-full py-3 bg-[#26B7FF] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform">
                     <Play size={18} fill="currentColor" /> Start
                   </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}