"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { 
  Download, CheckCircle, AlertCircle, Loader2, Upload, 
  FileUp, List, BookOpen, FileSpreadsheet, ChevronRight
} from 'lucide-react';
import { getExportData } from '@/app/actions/admin';
import { uploadClassSchedule } from '@/app/actions/admin-import';

export default function AdminDashboard() {
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 导出逻辑 ---
  const handleExport = async () => {
    setLoadingExport(true);
    setStatus(null);
    try {
      const result = await getExportData();
      if (!result.success || !result.data) throw new Error(result.error);
      
      const worksheet = XLSX.utils.json_to_sheet(result.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Session Report");
      XLSX.writeFile(workbook, `Trailclass_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setStatus({ type: 'success', msg: 'Export successful!' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Export failed.' });
    } finally {
      setLoadingExport(false);
    }
  };

  // --- 上传排课表逻辑 ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setLoadingUpload(true);
    setStatus(null);

    try {
      const result = await uploadClassSchedule(formData);
      if (result.success) {
        setStatus({ type: 'success', msg: result.message || 'Upload successful!' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      // 显示具体错误信息，方便调试
      setStatus({ type: 'error', msg: error.message || 'Upload failed. Check file format.' });
    } finally {
      setLoadingUpload(false);
    }
  };

  // 🔥 下载排课表模板
  const handleDownloadScheduleTemplate = (e: React.MouseEvent) => {
    e.preventDefault(); 
    window.location.href = "/api/admin/download-schedule-template";
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-[#333333] p-8 rounded-[32px] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-black text-white tracking-tight">Admin Console</h1>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Trailclass System Control</p>
           </div>
           <div className="bg-[#FDE700] text-[#333333] p-3 rounded-full shadow-[0_0_25px_rgba(253,231,0,0.4)]">
             <List size={24} />
           </div>
        </div>

        {/* 状态通知 */}
        {status && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2 shadow-sm ${status.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
              {status.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
              {status.msg}
            </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. 教材管理 */}
          <div className="group bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300">
             <div className="flex justify-between items-start mb-6">
               <div className="w-14 h-14 bg-[#26B7FF]/10 rounded-2xl flex items-center justify-center text-[#26B7FF]">
                 <BookOpen size={28} />
               </div>
               <div className="bg-gray-50 p-2 rounded-full text-gray-300 group-hover:bg-[#26B7FF] group-hover:text-white transition-colors">
                 <ChevronRight size={20} />
               </div>
             </div>
             
             <div className="flex-1">
               <h2 className="text-xl font-bold text-[#333333] mb-2">Textbook Library</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-8">
                 Manage textbooks via Excel upload. Configure questions, modules, and report logic.
               </p>
             </div>
             
             <Link href="/admin/textbook" className="w-full">
               <button className="w-full h-14 bg-[#26B7FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-transform duration-300 hover:scale-[1.02]">
                 Manage Library
               </button>
             </Link>
          </div>

          {/* 2. 课程明细 */}
          <div className="group bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300">
             <div className="flex justify-between items-start mb-6">
               <div className="w-14 h-14 bg-[#333333]/5 rounded-2xl flex items-center justify-center text-[#333333]">
                 <List size={28} />
               </div>
               <div className="bg-gray-50 p-2 rounded-full text-gray-300 group-hover:bg-[#333333] group-hover:text-white transition-colors">
                 <ChevronRight size={20} />
               </div>
             </div>
             
             <div className="flex-1">
               <h2 className="text-xl font-bold text-[#333333] mb-2">Session List</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-8">
                 View all class sessions, check report status, and access report details.
               </p>
             </div>
             
             <Link href="/admin/sessions" className="w-full">
               <button className="w-full h-14 bg-[#333333] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-gray-300 transition-transform duration-300 hover:scale-[1.02]">
                 View All Sessions
               </button>
             </Link>
          </div>

          {/* 3. 导入排课 (带下载模板按钮) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300 relative">
             <div className="flex justify-between items-start mb-6">
               <div className="w-14 h-14 bg-[#26B7FF]/10 rounded-2xl flex items-center justify-center text-[#26B7FF]">
                 <FileUp size={28} />
               </div>
               
               {/* 🔥 下载按钮 */}
               <button 
                 onClick={handleDownloadScheduleTemplate}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-xs font-bold transition-colors border border-gray-200"
               >
                 <Download size={14} /> Template
               </button>
             </div>

             <div className="flex-1">
               <h2 className="text-xl font-bold text-[#333333] mb-2">Import Schedule</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-8">
                 Upload monthly class schedule Excel to update sessions and teachers.
               </p>
             </div>
             
             <input 
               type="file" 
               accept=".xlsx, .xls" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleUpload}
             />
             
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={loadingUpload}
               className="w-full h-14 border-2 border-dashed border-[#26B7FF] text-[#26B7FF] bg-[#26B7FF]/5 hover:bg-[#26B7FF]/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
             >
               {loadingUpload ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
               {loadingUpload ? 'Uploading...' : 'Select Excel File'}
             </button>
          </div>

          {/* 4. 导出数据 */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300">
             <div className="w-14 h-14 bg-[#FDE700]/20 rounded-2xl flex items-center justify-center mb-6 text-[#D9C500]">
               <FileSpreadsheet size={28} />
             </div>
             <div className="flex-1">
               <h2 className="text-xl font-bold text-[#333333] mb-2">Export Data</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-8">
                 Download comprehensive Excel report including session links and actual feedback.
               </p>
             </div>
             
             <button
                onClick={handleExport}
                disabled={loadingExport}
                className="w-full h-14 bg-[#FDE700] text-[#333333] rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(253,231,0,0.3)] transition-transform duration-300 hover:scale-[1.02]"
              >
                {loadingExport ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                {loadingExport ? 'Processing...' : 'Export Excel'}
              </button>
          </div>

        </div>
      </div>
    </div>
  );
}