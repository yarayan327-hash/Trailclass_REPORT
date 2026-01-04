"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim()) return;

    setLoading(true);

    // 简单模拟登录：将 TeacherID 存入 Cookie (7天)
    Cookies.set('teacherId', teacherId, { expires: 7 });
    Cookies.set('userRole', 'teacher', { expires: 7 });

    // 跳转到老师课程表页面
    router.push('/teacher/schedule');
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-14 rounded-[32px] shadow-xl w-full max-w-md text-center">
        
        <div className="w-20 h-20 bg-[#FDE700] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <User className="w-10 h-10 text-[#333333]" strokeWidth={2.5} />
        </div>

        <h1 className="text-3xl font-black text-[#333333] mb-2">Instructor Login</h1>
        <p className="text-gray-400 font-bold text-sm mb-10">Access your schedule & reports</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Enter Teacher ID (e.g., 123456)"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full h-16 bg-gray-50 rounded-2xl px-6 text-center font-bold text-[#333333] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDE700] transition-all text-lg"
          />

          <button
            type="submit"
            disabled={!teacherId || loading}
            className={`w-full h-16 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all
              ${!teacherId || loading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#888888] hover:bg-[#333333] shadow-lg hover:scale-[1.02]'
              }`}
          >
            {loading ? 'Verifying...' : 'Continue'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-10">
          <Link href="/admin" className="inline-flex items-center gap-1 text-gray-300 text-xs font-bold hover:text-[#26B7FF] transition-colors">
             <ShieldCheck size={12} />
             Admin Access
          </Link>
        </div>

      </div>
    </div>
  );
}