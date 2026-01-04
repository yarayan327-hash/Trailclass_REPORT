"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 获取 URL 上的日期，如果没有则默认今天
  const defaultDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(defaultDate);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    // 更新 URL，页面会自动刷新数据
    router.push(`/admin/sessions?date=${newDate}`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
      
      {/* 左侧：日期选择器 */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-2 bg-blue-50 text-[#26B7FF] rounded-lg">
          <Calendar size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Date</span>
          <input 
            type="date" 
            value={date}
            onChange={handleDateChange}
            className="font-bold text-[#333] bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 右侧：刷新按钮 */}
      <button 
        onClick={handleRefresh}
        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90"
        title="Refresh List"
      >
        <RefreshCw size={20} className={isRefreshing ? "animate-spin text-[#26B7FF]" : ""} />
      </button>

    </div>
  );
}