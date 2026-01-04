import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, Clock, Search } from "lucide-react";
import FilterBar from "./filter-bar"; // 引入刚才写的组件

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // 强制动态渲染，确保数据最新

// 辅助函数：根据日期获取当天的开始和结束时间
function getDateRange(dateStr: string) {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export default async function SessionListPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  // 1. 获取选中的日期 (默认为今天)
  const selectedDate = searchParams.date || new Date().toISOString().split("T")[0];
  const { start, end } = getDateRange(selectedDate);

  // 2. 查询数据库 (按日期过滤)
  const sessions = await prisma.classSession.findMany({
    where: {
      classTimeSaudi: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { classTimeSaudi: 'asc' }, // 按时间顺序排列
    include: {
      report: true
    }
  });

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#333]">Session List</h1>
            <p className="text-gray-500 text-sm">Managing classes for: <span className="text-[#26B7FF]">{selectedDate}</span></p>
          </div>
        </div>

        {/* 🔥 插入日期筛选栏 */}
        <FilterBar />

        {/* List Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest pl-8">Time (Saudi)</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Course</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 pl-8">
                      <div className="flex items-center gap-2 font-bold text-[#333]">
                        <Clock size={16} className="text-[#26B7FF]" />
                        {new Date(session.classTimeSaudi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FDE700] flex items-center justify-center text-[#333] font-black text-xs">
                          {session.originalStudentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-700">{session.originalStudentName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{session.teacherName}</td>
                    <td className="p-4 text-gray-600">
                       <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-500 line-clamp-1 max-w-[150px]" title={session.courseName}>
                         {session.courseName}
                       </span>
                    </td>
                    <td className="p-4">
                      {session.report ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {session.report ? (
                        <Link href={`/report/${session.report.id}`} className="text-[#26B7FF] font-bold text-sm hover:underline">
                          View Report
                        </Link>
                      ) : (
                        <span className="text-gray-300 text-xs font-bold">No Report</span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                           <Search size={32} />
                         </div>
                         <div>
                           <p className="text-[#333] font-bold text-lg">No sessions found for this date.</p>
                           <p className="text-gray-400 text-sm">Try changing the date or importing a new schedule.</p>
                         </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}