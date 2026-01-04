"use client";

import { useState, useEffect } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, Book, RefreshCw } from "lucide-react";

// 定义列表项类型
interface TextbookItem {
  id: string;
  name: string;
  bookId: string;
  type: string;
  updatedAt: string;
}

export default function AdminTextbookUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // 列表状态
  const [textbooks, setTextbooks] = useState<TextbookItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // 获取教材列表
  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/textbook-list"); 
      const data = await res.json();
      if (data.success) {
        setTextbooks(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-textbook", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `上传成功！教材 "${data.data.name}" 已更新。` 
        });
        setFile(null);
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) input.value = '';
        fetchList(); // 上传成功后刷新列表
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* === 板块 1: 上传区域 === */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <FileSpreadsheet className="w-8 h-8 text-[#26B7FF]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#333]">教材上传管理</h1>
                <p className="text-gray-500 text-sm mt-1">支持 .xlsx 格式，重复上传将覆盖旧版本</p>
              </div>
            </div>
            <a href="/api/admin/download-template" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">
              <Download className="w-4 h-4" /> 下载模板
            </a>
          </div>

          <div className="space-y-6">
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-[#26B7FF] bg-blue-50/30' : 'border-gray-200 hover:border-[#26B7FF]'}`}>
              <input type="file" id="file-upload" accept=".xlsx" className="hidden" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
                <Upload className={`w-10 h-10 ${file ? 'text-[#26B7FF]' : 'text-gray-400'}`} />
                <span className={`font-bold ${file ? 'text-[#26B7FF]' : 'text-gray-600'}`}>
                  {file ? file.name : "点击选择 Excel 文件"}
                </span>
                <span className="text-xs text-gray-400">最大支持 10MB</span>
              </label>
            </div>

            <button onClick={handleUpload} disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${!file || loading ? "bg-gray-100 text-gray-400" : "bg-[#26B7FF] text-white hover:shadow-lg"}`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "确认上传"}
            </button>
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-bold">{message.text}</p>
            </div>
          )}
        </div>

        {/* === 板块 2: 教材清单 (你的截图中可能缺了这部分) === */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#333]">教材库清单 (Library Inventory)</h2>
            <button onClick={fetchList} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
              <RefreshCw size={18} className={loadingList ? 'animate-spin' : ''}/>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <th className="py-4 pl-4">教材名称</th>
                  <th className="py-4">ID 编码</th>
                  <th className="py-4">类型</th>
                  <th className="py-4">最后更新</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {textbooks.map((book) => (
                  <tr key={book.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-[#333] flex items-center gap-3">
                      <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400"><Book size={16}/></div>
                      {book.name}
                    </td>
                    <td className="py-4 text-gray-500 font-mono">{book.bookId}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${book.type === 'EXAM' ? 'bg-purple-50 text-purple-600' : 'bg-yellow-50 text-yellow-700'}`}>
                        {book.type}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{new Date(book.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!loadingList && textbooks.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">暂无教材，请在上方上传。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}