"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [teacherId, setTeacherId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // 进入页面时，如果已经登录过，直接去后台
  useEffect(() => {
    const savedId = localStorage.getItem('teacherId');
    if (savedId) {
      router.push('/teacher/evaluate');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单的验证逻辑 (可以在这里添加特定的 ID 列表，或者允许任何非空 ID)
    if (!teacherId.trim()) {
      setError('Please enter your Teacher ID');
      return;
    }

    // 模拟验证成功
    // 1. 保存 ID 到本地存储
    localStorage.setItem('teacherId', teacherId);
    
    // 2. 跳转到评价仪表盘
    router.push('/teacher/evaluate');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-[#26B7FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#333333]">Teacher Login</h1>
          <p className="text-gray-500">Enter your ID to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Teacher ID</label>
            <input
              type="text"
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
                setError('');
              }}
              placeholder="e.g. T-8820"
              className="w-full text-lg border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[#26B7FF] focus:outline-none transition-colors"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#26B7FF] hover:bg-[#1fa0e0] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Access Dashboard</span>
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}